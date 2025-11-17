// Imports
require('dotenv').config();
const express = require('express')
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const react = require('react');
const http = require('http');
const server = http.createServer(app);
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);

// Database setup
const db = new sqlite3.Database('./db/jobboard.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to database.')
    }
})
// Constants
const PORT = process.env.port || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'employment';
const AUTH_URL = process.env.AUTH_URL || 'https://formbeta.yorktechapps.com/oauth'
const THIS_URL = process.env.THIS_URL || 'http://172.16.3.179:3000/login'
const API_KEY = process.env.API_KEY || 'craigslist'

// Middleware
app.set('view engine', 'ejs')
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    store: new SQLiteStore ({ db: 'sessions.db', dir: './db'}),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('http://172.16.3.179:3000/login')
};

// Routes
app.get('/', isAuthenticated, (req, res) => {
    try {
        console.log(`User ${req.session.user} accessed the home page.`);
        res.render('index', { user: req.session.user });
    } catch (error) {
        console.error('Error accessing session data:', error);
    }
});

app.get('/login', (req, res) => {
    // debugging to see what i'm receiving
    console.log('Query Parameters:', req.query);
    console.log('Request body:', req.body);
    console.log('Full URL:', req.url);

    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.displayName;
        console.log(`User ${tokenData.displayName} logged in.`);

        //save user to database if not exists
        db.run('INSERT OR REPLACE INTO users (username) VALUES (?)', [tokenData.displayName], function (err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`User ${tokenData.displayName} saved to database.`)
        });
        res.redirect('/');
    } else {
        console.log('AUTH_URL value:', AUTH_URL);
        console.log('THIS_URL value:', THIS_URL);
        res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`);
    };
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');

});
app.get('/theboard', isAuthenticated, (req, res) => {
    console.log(`User ${req.session.user} accessed the job board.`);

    const jobQuery = `
        SELECT posts.postid, posts.title, posts.description, posts.created_at, users.username
        FROM posts
        LEFT JOIN users ON posts.user_id = users.uid
        ORDER BY posts.created_at DESC

    `;

    const commentQuery = `
        SELECT comments.commentid, comments.content, comments.post_id, comments.user_id, comments.created_at, users.username
        FROM comments
        LEFT JOIN users ON comments.user_id = users.uid
        ORDER BY comments.created_at DESC
    `;

    db.all(jobQuery, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else {
            db.all(commentQuery, [], (err, comments) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).send('Internal Server Error');
                } else {
                    console.log('Comments fetched:', comments);
                    // Attach comments to their respective posts
                    rows.forEach(post => {
                        post.comments = comments.filter(comment => comment.post_id === post.postid);
                    });
                    console.log('Posts with usernames:', rows);
                    console.log('Posts with comments attached:', rows);
                    console.log('Data being passed to EJS:', rows)
                    console.log('About to render with jobs:', rows);
                    console.log('Current user from session: ', req.session.user)
                    console.log('Type of currentUser:', typeof req.session.user)
                    res.render('theboard', { jobs: rows, currentUser: req.session.user } );
                }
            });
            
        }
    });
});
app.post('/addcomment', isAuthenticated, (req, res) => {
    const content = req.body.content;
    const post_id = req.body.post_id;
    const username = req.session.user;
    console.log(`User ${username} is adding a comment to post ID ${post_id}: ${content}`);
    // Get user ID from username
    db.get('SELECT uid FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else if (!user) {
            console.error('User not found in database. What is going on?');
            res.status(400).send('User not found');
        } else {
            const user_id = user.uid;
            db.run('INSERT INTO comments (content, post_id, user_id) VALUES (?, ?, ?)', [content, post_id, user_id], function(err) {
                if (err) {
                    console.error(err.message);
                    res.status(500).send('Internal Server Error');
                } else {
                    console.log(`New comment added with ID ${this.lastID} by user ${username} on post ID ${post_id}`);
                    res.redirect('/theboard');
                }
            });
        }
    });
});
app.get('/postjob', isAuthenticated, (req, res) => {
    res.render('postjob');
});

app.post('/postjob', isAuthenticated, (req, res) => {
    console.log('POST /postjob route hit by user ${req.session.user}');
    console.log('Form Data:', req.body);
    console.log('Session Data:', req.session.user);
    const title = req.body.title;
    const description = req.body.description;
    const username = req.session.user;
    console.log('Trying to find this user:', username);
    // Get user ID from username
    db.get('SELECT uid FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else if (!user) {
            console.error('User not found in database. What is going on?');
            res.status(400).send('User not found');
        } else {
            console.log('Ladies and gentlemen, we found the user:', user);
            const user_id = user.uid;
            db.run('INSERT INTO posts (title, description, user_id) VALUES (?, ?, ?)', [title, description, user_id], function(err) {
                if (err) {
                    console.error(err.message);
                    res.status(500).send('Internal Server Error');
                } else {
                    console.log(`New job posted with ID ${this.lastID} by user ${req.session.user}`);
                    res.redirect('/theboard');
                }
            });
        }
    });
});
app.get('/editpost/:postid', isAuthenticated, (req, res) => {
     const postid = req.params.postid;  // From URL, not body
    const username = req.session.user;
    
    // Get the current post data to pre-fill the form
    db.get('SELECT * FROM posts WHERE postid = ?', [postid], (err, post) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else if (!post) {
            res.status(404).send('Post not found');
        } else {
            // Show edit form with current post data
            res.render('editpost', { post: post });
        }
    });
});
app.post('/editpost', isAuthenticated, (req, res) => {
    const postid = req.body.postid;    // From form data
    const title = req.body.title;
    const description = req.body.description;
    
    db.run('UPDATE posts SET title = ?, description = ? WHERE postid = ?', [title, description, postid], function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else {
            console.log(`Post ID ${postid} updated by user ${req.session.user}`);
            res.redirect('/theboard');
        }
    });
}); 
app.get('/deletepost/:postid', isAuthenticated, (req, res) => {
    const postid = req.params.postid;
    const username = req.session.user;
    console.log('Username from session:', username)
    console.log('Type of username:', typeof username)
    console.log(`User ${username} is attempting to delete post ID ${postid}`);
    // getting the current user's ID
    console.log('About to search for user:', username)
    db.get('SELECT uid FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else if (!user) {
            console.error('User not found in database. What is going on?');
            res.status(400).send('User not found');
        } else {
            const user_id = user.uid;
            // verify that the post belongs to the user
            db.get('SELECT * FROM posts WHERE postid = ? AND user_id = ?', [postid, user_id], (err, post) => {
                if (err) {
                    
                    console.error('User not found in database. What is going on?'); 
                    if (err) console.error(err.message);
                    res.status(500).send('Internal Server Error');
                } else if (!post) {
                    console.error(`Post ID ${postid} does not belong to user ${username}. Deletion not allowed.`);
                    res.status(403).send('You are not authorized to delete this post.');
                } else if (post.user_id !== user_id) {
                    console.error(`Post ID ${postid} does not belong to user ${username}. Deletion not allowed.`);
                    res.status(403).send('You are not authorized to delete this post.');
                } else {
                    // db.run('DELETE FROM posts WHERE postid = ?', [postid], function(err) {
                        //if (err) {
                          //  console.error(err.message);
                          //  res.status(500).send('Internal Server Error');
                        // } else {
                           // console.log(`Post ID ${postid} deleted by user ${username}`);
                           // res.redirect('/theboard');
                      //  }
                   // });
                    res.render('confirmdelete', { post: post }); 
                }
            });
        }   
    });
});
app.post('/confirmdelete', isAuthenticated, (req, res) => {
    const postid = req.body.postid // get this from the form data
    const username = req.session.user

    db.run('DELETE FROM posts WHERE postid = ?', [postid], function(err) {
        if (err) {
            console.error(err.message)
            res.status(500).send('Internal Server Error');
        } else {
            console.log(`Post ID ${postid} deleted by user ${req.session.user}`);
            res.redirect('/theboard');
            
        }
    })
});

app.get('/editcomment/:commentid', isAuthenticated, (req, res) => {
    const commentid = req.params.commentid;
    const username = req.session.user;
    
    // Getting the user ID
    db.get('SELECT uid FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else if (!user) {
            res.status(400).send('User not found');
        } else {
            const user_id = user.uid;
            
            // Getting the comment and verifying ownership
            db.get('SELECT * FROM comments WHERE commentid = ? AND user_id = ?', [commentid, user_id], (err, comment) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).send('Internal Server Error');
                } else if (!comment) {
                    res.status(403).send('You are not authorized to edit this comment.');
                } else {
                    // Comment exists and belongs to user - show edit form
                    res.render('editcomment', { comment: comment });
                }
            });
        }
    });
});
app.post('/editcomment', isAuthenticated, (req, res) => {
    const { commentid, content } = req.body;
    const username = req.session.user;
    
    // verification here just to be safe
    db.get('SELECT uid FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else if (!user) {
            res.status(400).send('User not found');
        } else {
            const user_id = user.uid;
            
            // Verify comment ownership before updating
            db.get('SELECT * FROM comments WHERE commentid = ? AND user_id = ?', [commentid, user_id], (err, comment) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).send('Internal Server Error');
                } else if (!comment) {
                    res.status(403).send('You are not authorized to edit this comment.');
                } else {
                    // Comment belongs to user - update it
                    db.run('UPDATE comments SET content = ? WHERE commentid = ?', [content, commentid], function(err) {
                        if (err) {
                            console.error(err.message);
                            res.status(500).send('Internal Server Error');
                        } else {
                            console.log(`Comment ID ${commentid} updated by user ${username}`);
                            res.redirect('/theboard');
                        }
                    });
                }
            });
        }
    });
});

app.get('/deletecomment/:commentid', isAuthenticated, (req, res) => {
    const commentid = req.params.commentid;
    db.run('DELETE FROM comments WHERE commentid = ?', [commentid], function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else {
            console.log(`Comment ID ${commentid} deleted by user ${req.session.user}`);
            res.redirect('/theboard');
        }
    });
});
app.get('/profile/:username', (req, res) => {
    const username = req.params.username;

    // does the user exist?
    db.get('SELECT uid, username, email FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else if (!user) {
            // User doesn't exist - show error
            res.status(404).send(`User '${username}' not found`);
        } else {
            // User exists, now get their posts
            const postsQuery = `
                SELECT posts.postid, posts.title, posts.description, posts.created_at, users.username
                FROM posts
                LEFT JOIN users ON posts.user_id = users.uid
                WHERE users.username = ?
                ORDER BY posts.created_at DESC
            `;
            
            // Add the posts query here
            db.all(postsQuery, [username], (err, posts) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).send('Internal Server Error');
                } else {
                    // rendering the profile page
                    res.render('profile', { user: user, posts: posts })
                }
            });
        }
    });
});

// Start Server
server.listen(PORT, () => {
    console.log(`Server is running at http://172.16.3.179:${PORT}`);
});
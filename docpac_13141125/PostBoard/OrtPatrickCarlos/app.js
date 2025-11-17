// Imports
require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { io } = require('socket.io-client');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);




//database setup
const db = new sqlite3.Database('./db/data.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the database.');
    }
});

//Constants
const port = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'your_secret_key';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:420/oauth';
const THIS_URL = process.env.THIS_URL || `http://localhost:${port}`;
const API_KEY = process.env.API_KEY || 'your_api_key';

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    store: new SQLiteStore({db : 'sessions.db', dir: './db'}),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) next();
    else res.redirect('/login');
};

// Routes
app.get('/', isAuthenticated, (req, res) => {
    res.render('index', { user: req.session.user });
});

app.get('/login', (req, res) => {
    if (req.query.token) {
         let tokenData = jwt.decode(req.query.token);
         req.session.token = tokenData;
         req.session.user = tokenData.displayName;

        // Save user to database if not exists
        db.run(`INSERT OR IGNORE INTO users (username) VALUES (?)`, [tokenData.displayName], function(err) {
            if (err) {
                return console.log(err.message);
            }
            console.log(`User ${tokenData.displayName} saved to database.`);
        });

        // Fetch additional user data from init.sql if needed
        db.get(`SELECT * FROM users WHERE username = ?`, [tokenData.displayName], (err, row) => {
            if (err) {
                return console.log(err.message);
            }
            // You can process additional user data here if necessary
        });

        res.redirect('/');
    } else {
         res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    };
});

app.get('/postBoard', isAuthenticated, (req, res) => {
    db.all(`
        SELECT posts.*, users.username, users.id AS user_id
        FROM posts 
        JOIN users ON posts.user_id = users.id 
        ORDER BY created_at DESC
    `, (err, posts) => {
        if (err) {
            return console.log(err.message);
        }
        res.render('postBoard', { posts, user: req.session.user });
    });
});

app.post('/posts', isAuthenticated, (req, res) => {
    const { title, content } = req.body;
    const username = req.session.user;

    // Get user ID from the database
    db.get(`SELECT id FROM users WHERE username = ?`, [username], (err, row) => {
        if (err) {
            return console.log(err.message);
        }
        if (row) {
            const userId = row.id;

            db.run(`INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)`, [title, content, userId], function(err) {
                if (err) {
                    return console.log(err.message);
                }
                console.log(`A new post has been inserted with id ${this.lastID}`);
                res.redirect('/postBoard');
            });
        } else {
            console.log('User not found');
            res.status(404).send('User not found');
        }
    });
});

app.get('/posts/new', isAuthenticated, (req, res) => {
    res.render('newPost', { user: req.session.user });
});

app.get('/posts/:id', isAuthenticated, (req, res) => {
    const postId = req.params.id;

    // Query to get the post details
    db.get(
        `SELECT posts.*, users.username, users.id AS user_id
         FROM posts 
         JOIN users ON posts.user_id = users.id 
         WHERE posts.id = ?`,
        [postId],
        (err, post) => {
            if (err) {
                return console.log(err.message);
            }
            if (post) {
                // Query to get comments for the post
                db.all(
                    `SELECT comments.id, comments.comment, comments.created_at, users.username, users.id AS user_id 
                     FROM comments 
                     JOIN users ON comments.user_id = users.id 
                     WHERE comments.post_id = ? 
                     ORDER BY comments.created_at ASC`,
                    [postId],
                    (err, comments) => {
                        if (err) {
                            return console.log(err.message);
                        }
                        // Render the template with post and comments data
                        res.render('viewPost', { post, comments, user: req.session.user });
                    }
                );
            } else {
                res.status(404).send('Post not found');
            }
        }
    );
});

app.get('/user/:id', isAuthenticated, (req, res) => {
    const userId = req.params.id;
    db.all(`SELECT posts.*, users.username 
            FROM posts 
            JOIN users ON posts.user_id = users.id 
            WHERE users.id = ? 
            ORDER BY created_at DESC`, [userId], (err, posts) => {
        if (err) {
            return console.log(err.message);
        }
        res.render('viewUser', { posts, user: req.session.user, message: posts.length > 0 ? null : 'No posts found for this user' });
    });
});

app.post('/posts/delete/:id', isAuthenticated, (req, res) => {
    const postId = req.params.id;
    const username = req.session.user; // Get username from session

    // First, get the current user's ID
    db.get(`SELECT id FROM users WHERE username = ?`, [username], (err, userRow) => {
        if (err) {
            return console.log(err.message);
        }
        if (!userRow) {
            return res.status(404).send('User not found');
        }

        const userId = userRow.id;

        // Then get the post's owner
        db.get(`SELECT user_id FROM posts WHERE id = ?`, [postId], (err, postRow) => {
            if (err) {
                return console.log(err.message);
            }
            if (!postRow) {
                return res.status(404).send('Post not found');
            }
            
            // Check ownership
            if (userId === postRow.user_id) {
                db.run(`DELETE FROM posts WHERE id = ?`, [postId], function(err) {
                    if (err) {
                        return console.log(err.message);
                    }
                    console.log(`Post with id ${postId} deleted`);
                    res.redirect('/postBoard');
                });
            } else {
                res.status(403).send('You are not authorized to delete this post');
            }
        });
    });
});


app.get('/posts/edit/:id', isAuthenticated, (req, res) => {
    const postId = req.params.id;
    const username = req.session.user;

    // Get user ID from the database
    db.get(`SELECT id FROM users WHERE username = ?`, [username], (err, userRow) => {
        if (err) {
            return console.log(err.message);
        }
        if (!userRow) {
            return res.status(404).send('User not found');
        }

        const userId = userRow.id;

        // Check if the post belongs to the user
        db.get(`SELECT * FROM posts WHERE id = ? AND user_id = ?`, [postId, userId], (err, row) => {
            if (err) {
                return console.log(err.message);
            }
            if (row) {
                res.render('editPost', { post: row, user: req.session.user });
            } else {
                res.status(403).send('You are not authorized to edit this post');
            }
        });
    });
});

app.post('/posts/edit/:id', isAuthenticated, (req, res) => {
    const postId = req.params.id;
    const { title, content } = req.body;
    const username = req.session.user;

    // Get user ID from the database
    db.get(`SELECT id FROM users WHERE username = ?`, [username], (err, userRow) => {
        if (err) {
            return console.log(err.message);
        }
        if (!userRow) {
            return res.status(404).send('User not found');
        }

        const userId = userRow.id;

        // Check if the post belongs to the user
        db.run(`UPDATE posts SET title = ?, content = ? WHERE id = ? AND user_id = ?`, [title, content, postId, userId], function(err) {
            if (err) {
                return console.log(err.message);
            }
            if (this.changes === 0) {
                return res.status(403).send('You are not authorized to edit this post');
            }
            console.log(`Post with id ${postId} updated`);
            res.redirect(`/posts/${postId}`);
        });
    });
});

app.post('/comment/new', isAuthenticated, (req, res) => {
    const { postId, comment } = req.body;
    const username = req.session.user;

    // Get user ID from the database
    db.get(`SELECT id FROM users WHERE username = ?`, [username], (err, row) => {
        if (err) {
            return console.log(err.message);
        }
        if (row) {
            const userId = row.id;

            db.run(`INSERT INTO comments (comment, user_id, post_id) VALUES (?, ?, ?)`, [comment, userId, postId], function(err) {
                if (err) {
                    return console.log(err.message);
                }
                console.log(`A new comment has been inserted with id ${this.lastID}`);
                res.redirect(`/posts/${postId}`);
            });
        } else {
            console.log('User not found');
            res.status(404).send('User not found');
        }
    });
});

app.post('/comment/delete/:id', isAuthenticated, (req, res) => {
    const commentId = req.params.id;
    const username = req.session.user; // Get username from session

    // First, get the current user's ID
    db.get(`SELECT id FROM users WHERE username = ?`, [username], (err, userRow) => {
        if (err) {
            return console.log(err.message);
        }
        if (!userRow) {
            return res.status(404).send('User not found');
        }

        const userId = userRow.id;

        // Then get the comment's owner and associated post
        db.get(`SELECT user_id, post_id FROM comments WHERE id = ?`, [commentId], (err, commentRow) => {
            if (err) {
                return console.log(err.message);
            }
            if (!commentRow) {
                return res.status(404).send('Comment not found');
            }

            // Check if the user is the owner of the post
            db.get(`SELECT user_id FROM posts WHERE id = ?`, [commentRow.post_id], (err, postRow) => {
                if (err) {
                    return console.log(err.message);
                }
                if (!postRow) {
                    return res.status(404).send('Post not found');
                }

                // Check ownership
                if (userId === postRow.user_id) {
                    db.run(`DELETE FROM comments WHERE id = ?`, [commentId], function(err) {
                        if (err) {
                            return console.log(err.message);
                        }
                        console.log(`Comment with id ${commentId} deleted`);
                        res.redirect(`/posts/${commentRow.post_id}`);
                    });
                } else {
                    res.status(403).send('You are not authorized to delete this comment');
                }
            });
        });
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});


// Socket.io client setup
const socket = io(AUTH_URL, {
    extraHeaders: {
        api: API_KEY
    }
});

socket.on('connect', () => {
    console.log('Connected to socket server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from socket server');
});

//start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
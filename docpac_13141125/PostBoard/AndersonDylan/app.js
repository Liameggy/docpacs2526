// Imports
require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { io } = require('socket.io-client');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);

// Database setup
const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to database');
    }
});

// Constants
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'your_secret_key';
const AUTH_URL = process.env.AUTH_URL || 'http://formbeta.yorktechapps.com';
const THIS_URL = process.env.THIS_URL || `http://localhost:${PORT}/login`;
const API_KEY = process.env.API_KEY || 'your_api_key';

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    store: new SQLiteStore({ db: 'sessions.db', dir: './db' }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
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

// In your /login route, replace the database section with:
console.log('Token displayName:', tokenData.displayName);

// First check if user already exists
db.get('SELECT uid, username FROM users WHERE username = ?', [tokenData.displayName], (err, existingUser) => {
    if (err) {
        console.error('Error checking existing user:', err);
        return;
    }
    
    console.log('Existing user found:', existingUser);
    
    if (existingUser) {
        // User exists, use their existing UID
        req.session.user = tokenData.displayName;
        req.session.userUID = existingUser.uid;
        console.log(`Existing user ${tokenData.displayName} (UID: ${existingUser.uid}) logged in.`);
        res.redirect('/');
    } else {
        // User doesn't exist, create new one
        db.run('INSERT INTO users (username) VALUES (?)', [tokenData.displayName], function (err) {
            if (err) {
                console.error('Error creating user:', err);
                return;
            }
            
            req.session.user = tokenData.displayName;
            req.session.userUID = this.lastID;
            console.log(`New user ${tokenData.displayName} (UID: ${this.lastID}) created and logged in.`);
            res.redirect('/');
        });
    }
});



    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    };
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Create new post
app.post('/api/posts', isAuthenticated, (req, res) => {
    const { title, description } = req.body;
    const creator_uid = req.session.userUID; // How do you get the current user's UID?
    
    // Insert post into database
    db.run(
        'INSERT INTO posts (title, description, creator_uid) VALUES (?, ?, ?)',
        [title, description, creator_uid],
        function(err) {
            if (err) {
                console.error('Error creating post:', err);
                return res.status(500).json({ error: 'Failed to create post' });
            }
            
            console.log('Post created with ID:', this.lastID);
            res.json({ success: true, postId: this.lastID });
        }
    );
});

// Get all posts with creator usernames and ownership info
app.get('/api/posts', isAuthenticated, (req, res) => {
    const currentUserUID = req.session.userUID;
    
    const query = `
        SELECT 
            p.uid, 
            p.title, 
            p.description, 
            p.timestamp, 
            p.edited_timestamp,
            u.username,
            CASE WHEN p.creator_uid = ? THEN 1 ELSE 0 END as canEdit
        FROM posts p 
        JOIN users u ON p.creator_uid = u.uid 
        ORDER BY p.timestamp DESC
    `;
    
    db.all(query, [currentUserUID], (err, rows) => {
        if (err) {
            console.error('Error fetching posts:', err);
            return res.status(500).json({ error: 'Failed to fetch posts' });
        }
        
        res.json(rows);
    });
});



// Create new comment
app.post('/api/posts/:postId/comments', isAuthenticated, (req, res) => {
    const { content } = req.body;
    const post_uid = req.params.postId;
    const creator_uid = req.session.userUID;
    
    // First check if post exists
    db.get('SELECT uid FROM posts WHERE uid = ?', [post_uid], (err, post) => {
        if (err) {
            console.error('Error checking post:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        // Insert comment
        db.run(
            'INSERT INTO comments (content, post_uid, creator_uid) VALUES (?, ?, ?)',
            [content, post_uid, creator_uid],
            function(err) {
                if (err) {
                    console.error('Error creating comment:', err);
                    return res.status(500).json({ error: 'Failed to create comment' });
                }
                
                console.log('Comment created with ID:', this.lastID);
                res.json({ success: true, commentId: this.lastID });
            }
        );
    });
});

// Get comments for a specific post
// Get comments for a specific post
app.get('/api/posts/:postId/comments', isAuthenticated, (req, res) => {
    const post_uid = req.params.postId;
    const currentUserUID = req.session.userUID;
    
    const query = `
        SELECT 
            c.uid, 
            c.content, 
            c.timestamp, 
            c.edited_timestamp,
            u.username,
            CASE WHEN c.creator_uid = ? THEN 1 ELSE 0 END as canEdit,
            CASE WHEN c.creator_uid = ? OR p.creator_uid = ? THEN 1 ELSE 0 END as canDelete
        FROM comments c 
        JOIN users u ON c.creator_uid = u.uid 
        JOIN posts p ON c.post_uid = p.uid
        WHERE c.post_uid = ? 
        ORDER BY c.timestamp ASC
    `;
    
    db.all(query, [currentUserUID, currentUserUID, currentUserUID, post_uid], (err, rows) => {
        if (err) {
            console.error('Error fetching comments:', err);
            return res.status(500).json({ error: 'Failed to fetch comments' });
        }
        
        res.json(rows);
    });
});



// Helper function to check if user owns a post
function checkPostOwnership(postId, userUID, callback) {
    db.get('SELECT creator_uid FROM posts WHERE uid = ?', [postId], (err, row) => {
        if (err) {
            return callback(err, false);
        }
        callback(null, row && row.creator_uid === userUID);
    });
}

// Helper function to check if user can delete comment (comment owner OR post owner)
function checkCommentPermissions(commentId, userUID, callback) {
    const query = `
        SELECT 
            c.creator_uid as comment_creator,
            p.creator_uid as post_creator
        FROM comments c 
        JOIN posts p ON c.post_uid = p.uid 
        WHERE c.uid = ?
    `;
    
    db.get(query, [commentId], (err, row) => {
        if (err) {
            return callback(err, { canEdit: false, canDelete: false });
        }
        if (!row) {
            return callback(null, { canEdit: false, canDelete: false });
        }
        
        const canEdit = row.comment_creator === userUID;
        const canDelete = row.comment_creator === userUID || row.post_creator === userUID;
        
        callback(null, { canEdit, canDelete });
    });
}

// Update post
app.put('/api/posts/:postId', isAuthenticated, (req, res) => {
    const postId = req.params.postId;
    const { title, description } = req.body;
    const userUID = req.session.userUID;
    
    checkPostOwnership(postId, userUID, (err, isOwner) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!isOwner) {
            return res.status(403).json({ error: 'Not authorized to edit this post' });
        }
        
        db.run(
            'UPDATE posts SET title = ?, description = ?, edited_timestamp = CURRENT_TIMESTAMP WHERE uid = ?',
            [title, description, postId],
            function(err) {
                if (err) {
                    console.error('Error updating post:', err);
                    return res.status(500).json({ error: 'Failed to update post' });
                }
                res.json({ success: true });
            }
        );
    });
});


// Delete post
app.delete('/api/posts/:postId', isAuthenticated, (req, res) => {
    const postId = req.params.postId;
    const userUID = req.session.userUID;
    
    checkPostOwnership(postId, userUID, (err, isOwner) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!isOwner) {
            return res.status(403).json({ error: 'Not authorized to delete this post' });
        }
        
        // Delete comments first, then post
        db.run('DELETE FROM comments WHERE post_uid = ?', [postId], (err) => {
            if (err) {
                console.error('Error deleting comments:', err);
                return res.status(500).json({ error: 'Failed to delete post' });
            }
            
            db.run('DELETE FROM posts WHERE uid = ?', [postId], function(err) {
                if (err) {
                    console.error('Error deleting post:', err);
                    return res.status(500).json({ error: 'Failed to delete post' });
                }
                res.json({ success: true });
            });
        });
    });
});

// Update comment
app.put('/api/comments/:commentId', isAuthenticated, (req, res) => {
    const commentId = req.params.commentId;
    const { content } = req.body;
    const userUID = req.session.userUID;
    
    checkCommentPermissions(commentId, userUID, (err, permissions) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!permissions.canEdit) {
            return res.status(403).json({ error: 'Not authorized to edit this comment' });
        }
        
        db.run(
            'UPDATE comments SET content = ?, edited_timestamp = CURRENT_TIMESTAMP WHERE uid = ?',
            [content, commentId],
            function(err) {
                if (err) {
                    console.error('Error updating comment:', err);
                    return res.status(500).json({ error: 'Failed to update comment' });
                }
                res.json({ success: true });
            }
        );
    });
});

// Delete comment
app.delete('/api/comments/:commentId', isAuthenticated, (req, res) => {
    const commentId = req.params.commentId;
    const userUID = req.session.userUID;
    
    checkCommentPermissions(commentId, userUID, (err, permissions) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!permissions.canDelete) {
            return res.status(403).json({ error: 'Not authorized to delete this comment' });
        }
        
        db.run('DELETE FROM comments WHERE uid = ?', [commentId], function(err) {
            if (err) {
                console.error('Error deleting comment:', err);
                return res.status(500).json({ error: 'Failed to delete comment' });
            }
            res.json({ success: true });
        });
    });
});

// User profile route
app.get('/user/:username', isAuthenticated, (req, res) => {
    const username = req.params.username;
    
    // Get user info and their posts
    const userQuery = 'SELECT uid, username FROM users WHERE username = ?';
    const postsQuery = `
        SELECT 
            p.uid, 
            p.title, 
            p.description, 
            p.timestamp, 
            p.edited_timestamp,
            u.username,
            CASE WHEN p.creator_uid = ? THEN 1 ELSE 0 END as canEdit
        FROM posts p 
        JOIN users u ON p.creator_uid = u.uid 
        WHERE u.username = ?
        ORDER BY p.timestamp DESC
    `;
    
    db.get(userQuery, [username], (err, user) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send('Database error');
        }
        
        if (!user) {
            return res.status(404).send('User not found');
        }
        
        db.all(postsQuery, [req.session.userUID, username], (err, posts) => {
            if (err) {
                console.error('Error fetching user posts:', err);
                return res.status(500).send('Database error');
            }
            
            res.render('profile', { 
                profileUser: user,
                posts: posts,
                currentUser: req.session.user,
                isOwnProfile: user.username === req.session.user
            });
        });
    });
});


/*app.get('sendpogs'), isAuthenticated, (req, res) => {
    const data = {
        from: 1,
        to: 97,
        amount: 10,
        pin: 1234,
        reason: 'Test pogs transfer'
    }

    socket.emit('transferDigipogs', data);

    res.send('Pogs sent!');
};*/

const socket = io(AUTH_URL, {
    extraHeaders: {
        api: API_KEY
    }
});

socket.on('connect', () => {
    console.log('Connected to auth server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from auth server');
});

// socket.on('setClass', (classData) => {
//     console.log('Received class data:', classData);
//     socket.emit('classUpdate');
// });

// socket.on('classUpdate', (classroomData) => {
//     console.log(`Classroom id: ${classroomData.id}, Name: ${classroomData.className}, Active: ${classroomData.isActive}`);
//     console.log(`Responses: ${classroomData.poll.totalResponses} / ${classroomData.poll.totalResponders}`);
//     console.log(classroomData.poll.responses)

    
// });

// socket.on('connect', () => {
//     socket.emit('getActiveClass');
// });

// Start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
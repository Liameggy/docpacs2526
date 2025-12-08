// IMPORTS
require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { Server } = require('socket.io');
const ioClient = require('socket.io-client');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);
const http = require('http');

const server = http.createServer(app);
const io = new Server(server);

// DATABASE SETUP
const db = new sqlite3.Database('./db/app.db', (err) => {
    if (err) {
        console.error('Error connecting to database', err);
    } else {
        console.log('Connected to database');
    }
});

// CONSTANTS
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'your_secret_key';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:420/oauth';
const THIS_URL = process.env.THIS_URL || `http://172.16.3.172:${PORT}/login`;
const API_KEY = process.env.API_KEY || 'your_api_key';

// MIDDLEWARE
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    store: new SQLiteStore({ db: 'sessions.db', dir: './db' }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login');
};

// ROUTES
app.get('/', isAuthenticated, (req, res) => {
    res.render('home', { user: req.session.user });
});

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.displayName;

        // SAVE USER TO DATABSE IF NOT EXISTS
        db.run('INSERT OR IGNORE INTO users (username) VALUES (?)', [tokenData.displayName], function (err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`User ${tokenData.displayName} saved to database.`);
        });

        res.redirect('/');
    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    };
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/create', isAuthenticated, (req, res) => {
    res.render('create', { user: req.session.user });
});

app.get('/submit', isAuthenticated, (req, res) => {
    res.render('submit', { user: req.session.user });
});

app.get('/edit/:id', isAuthenticated, (req, res) => {
    const postId = req.params.id;
    db.all('SELECT * FROM posts WHERE id = ?', [postId], (err, rows) => {
        if (err) {
            console.error('Error fetching post:', err);
        }
        res.render('edit', { user: req.session.user, postId: postId, posts: rows });
    });
});

app.get('/view', isAuthenticated, (req, res) => {
    db.all('SELECT * FROM posts', (err, rows) => {
        if (err) {
            console.error('Error fetching posts:', err);
            res.status(500).send('Internal Server Error');
        } else {
            console.log('Fetched posts:', rows);
            res.render('view', { user: req.session.user, posts: rows });
        }
    });
});

app.get('/comments/:id', isAuthenticated, (req, res) => {
    const postId = req.params.id;
    db.all('SELECT * FROM comments WHERE post_id = ?', [postId], (err, rows) => {
        db.all('SELECT * FROM posts WHERE id = ?', [postId], (err2, postRows) => {
            if (err2) {
                console.error('Error fetching post for comments:', err2);
            }
            if (err) {
                console.error('Error fetching comments:', err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log('Fetched comments:', rows);
                res.render('comments', { user: req.session.user, comments: rows, post: postRows[0] });
            }
        });
    });
});

app.get('/addComment/:id', isAuthenticated, (req, res) => {
    const postId = req.params.id;
    db.all('SELECT * FROM comments WHERE post_id = ?', [postId], (err, rows) => {
        db.all('SELECT * FROM posts WHERE id = ?', [postId], (err2, postRows) => {
            if (err2) {
                console.error('Error fetching post for comments:', err2);
            }
            if (err) {
                console.error('Error fetching comments:', err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log('Fetched comments:', rows);
                res.render('addComment', { user: req.session.user, comments: rows, post: postRows[0] });
            }
        });
    });
});

app.get('/profile/:username', isAuthenticated, (req, res) => {
    const username = req.params.username;
    db.all('SELECT * FROM posts WHERE username = ?', [username], (err, rows) => {
        if (err) {
            console.error('Error fetching posts:', err);
            res.status(500).send('Internal Server Error');
        } else {
            console.log('Fetched posts:', rows);
            res.render('profile', { user: req.session.user, profileUser: username, posts: rows });
        }
    });
});

app.post('/submit', isAuthenticated, (req, res) => {
    const invalidchars = ['<', '>', '/', '\\', '{', '}', '(', ')', ';', '"', "'"];

    const jobTitle = req.body.jobTitle;
    const company = req.body.company;
    var description = req.body.description;
    const username = req.session.user;

    for (let char of description) {
        if (invalidchars.includes(char)) {
            description = description.replaceAll(char, '');
        }
    }

    // INSERT POST INTO DATABASE

    db.run('INSERT INTO posts (title, company, description, username) VALUES (?, ?, ?, ?)',
        [jobTitle, company, description, username],
        function (err) {
            if (err) {
                console.error('Error inserting post:', err);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/view');
            }
        });
});

app.post('/submitComment', (req, res) => {
    const postId = req.body.postId;
    const comment = req.body.comment;
    const username = req.session.user;

    db.run('INSERT INTO comments (post_id, content, username) VALUES (?, ?, ?)',
        [postId, comment, username],
        function (err) {
            if (err) {
                console.error('Error inserting comment:', err);
            } else {
                console.log(`Comment added to post ${postId} by ${username}.`);
                res.redirect(`/comments/${postId}`);
            }
        });
});

// SOCKET.IO CLIENT TO AUTH SERVER
const authSocket = ioClient(AUTH_URL, {
    extraHeaders: {
        api: API_KEY
    }
});

io.on('connection', (socket) => {
    console.log(`User: ${socket.id} connected`);

    socket.on('disconnect', () => {
        console.log(`User: ${socket.id} disconnected`);
    });

    socket.on('setClass', (classData) => {
        console.log('Received class data:', classData);
        // Handle class data as needed
    });

    socket.on('deletePost', (data) => {
        const postId = data.postId;
        db.run('DELETE FROM posts WHERE id = ?', [postId], function (err) {
            if (err) {
                console.error('Error deleting post:', err);
            } else {
                console.log(`Post ${postId} deleted successfully.`);
            }
        });
    });

    socket.on('deleteComment', (data) => {
        const commentId = parseInt(data.commentId);
        db.run('DELETE FROM comments WHERE id = ?', [commentId], function (err) {
            if (err) {
                console.error('Error deleting comment:', err);
            } else {
                console.log(`Comment ${commentId} deleted successfully.`);
            }
        });
    });

    socket.on('editSubmit', (data) => {
        const postId = data.id;
        const newTitle = data.title;
        const newCompany = data.company;
        const newDescription = data.description;

        db.run('UPDATE posts SET title = ?, company = ?, description = ? WHERE id = ?',
            [newTitle, newCompany, newDescription, postId],
            function (err) {
                if (err) {
                    console.error('Error updating post:', err);
                } else {
                    console.log(`Post ${postId} updated successfully.`);
                }
            });
    });
});

// START SERVER
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
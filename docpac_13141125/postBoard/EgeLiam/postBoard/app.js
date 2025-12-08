require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { io: ClientIO } = require('socket.io-client');
const { Server } = require('socket.io');
const { format } = require('path');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);
const now = new Date();

const year = now.getFullYear();
const month = now.getMonth();
const day = now.getDate();

const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

// database setup
const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) console.error(err);
    else console.log('Connected to the database.');
});

// constants
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'your_session_secret_here';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:420/auth';
const THIS_URL = process.env.THIS_URL || `http://localhost:${PORT}`;
const API_KEY = process.env.API_KEY || 'your_api_key';

// express + session
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(session({
    store: new SQLiteStore({ db: 'sessions.db', dir: './db' }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) next();
    else res.redirect('/login');
}

// routes
app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.displayName;

        db.run('INSERT or IGNORE INTO users (username) VALUES (?)', [tokenData.displayName], (err) => {
            if (err) console.error(err.message);
        });
        res.redirect('/');
    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/', isAuthenticated, (req, res) => {
    res.render('index', { user: req.session.user });
});

// create HTTP + socket server
const server = http.createServer(app);
const io = new Server(server);

// ---- AUTH SERVER CLIENT ----
const Socket = ClientIO(AUTH_URL, {
    extraHeaders: { api: API_KEY }
});

Socket.on('connect', () => {
    console.log('Connected to auth server');
    Socket.emit('getActiveClass');
});

Socket.on('disconnect', () => {
    console.log('Disconnected from auth server');
});

Socket.on('setClass', (classData) => {
    console.log('Received class data:', classData);
});

// ---- LOCAL SOCKET.IO SERVER ----
io.on('connection', (socket) => {
    console.log('A web client connected');

    db.all('SELECT uid, title, content, author, time FROM posts ORDER BY uid DESC', (err, posts) => {
        if (err) return console.error(err.message);

        const postsWithComments = [];
        let count = 0;

        if (posts.length === 0) return socket.emit('initialPosts', []);

        posts.forEach(post => {
            db.all('SELECT * FROM comments WHERE post_uid = ? ORDER BY cid ASC', [post.uid], (err, comments) => {
                if (err) comments = [];

                postsWithComments.push({
                    ...post,
                    comments
                });

                count++;
                if (count === posts.length) {
                    // all posts processed, send to client
                    socket.emit('initialPosts', postsWithComments);
                }
            });
        });
    });


    socket.on('newPost', (data) => {
        console.log('the title of the post is:', data.title);
        console.log('Received new post from web client:', data.content);
        data = { ...data, time: formattedDate };
        db.run('INSERT INTO posts (title, content, author, time) VALUES (?, ?, ?, ?)',
            [data.title, data.content, data.author, data.time],
            (err) => {
                if (err) console.error(err.message);
            }
        );
        db.get('SELECT * FROM posts WHERE uid = (SELECT MAX(uid) FROM posts)', (err, row) => {
            if (err) console.error(err.message);
            else {
                row.uid = row.uid;
                io.emit('broadcastPost', row); // broadcast to all
            }
        }
        );
    });

    socket.on('deletePost', (uid) => {
        console.log('Received delete request for post UID:', uid);
        io.emit('removePost', uid); // broadcast to all
        db.run('DELETE FROM posts WHERE uid = ?', [uid], (err) => {
            if (err) console.error(err.message);
        });
    });

    socket.on('disconnect', () => {
        console.log('A web client disconnected');
    });

    socket.on('editPost', (data) => {
        // data: { uid, author, title, content }
        db.get('SELECT author FROM posts WHERE uid = ?', [data.uid], (err, row) => {
            if (err) return console.error(err.message);
            if (!row || row.author !== data.author) return;
            db.run('UPDATE posts SET title = ?, content = ? WHERE uid = ?',
                [data.title, data.content, data.uid],
                (err) => {
                    if (err) return console.error(err.message);
                    io.emit('postEdited', { uid: data.uid, title: data.title, content: data.content });
                }
            );
        });
    });

    // Add a comment to a post
    socket.on('newComment', (data) => {
        const timestamp = formattedDate;
        db.run(
            'INSERT INTO comments (post_uid, author, content, time) VALUES (?, ?, ?, ?)',
            [data.postUid, data.author, data.content, timestamp],
            function (err) {
                if (err) return console.error(err.message);

                db.get('SELECT * FROM comments WHERE cid = ?', [this.lastID], (err, row) => {
                    if (err) return console.error(err.message);
                    io.emit('broadcastComment', row); // broadcast to all clients
                });
            }
        );
    });

    socket.on('deleteComment', ({ cid, author }) => {
        db.get('SELECT author FROM comments WHERE cid = ?', [cid], (err, row) => {
            if (err) return console.error(err.message);
            if (!row || row.author !== author) return;
            db.run('DELETE FROM comments WHERE cid = ?', [cid], (err) => {
                if (err) return console.error(err.message);
                io.emit('removeComment', { cid });
            });
        });
    });


});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

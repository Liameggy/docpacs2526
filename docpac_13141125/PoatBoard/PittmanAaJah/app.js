// imports
require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { io } = require('socket.io-client');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);

// database setup
const db = new sqlite3.Database('./db/database.db', (err) => {
  if (!err) console.log('Connected to SQLite database');
});

// constants 
const port = process.env.PORT || 3000; 
const SESSION_SECRET = process.env.SESSION_SECRET || "eternity benjamin"; 
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:420';
const THIS_URL = process.env.THIS_URL || ' http://localhost:${port}'; 
const API_KEY = process.env.API_KEY

// middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

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
app.get('/', isAuthenticated, (req, res) => {
  res.render('index', { user: req.session.user });
});

app.get('/login', (req, res) => {
  if (req.query.token) {
    let tokenData = jwt.decode(req.query.token);
    req.session.token = tokenData;
    req.session.user = tokenData.displayName;

    db.run(
      'INSERT OR IGNORE INTO users (username) VALUES (?)',
      [tokenData.displayName]
    );

    return res.redirect('/');
  } else {
    res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/posts', isAuthenticated, (req, res) => {
  const postsQuery = `
      SELECT posts.*, users.username
      FROM posts
      JOIN users ON posts.user_id = users.id
      ORDER BY posts.created_at DESC
    `;

  db.all(postsQuery, [], (err, posts) => {
    if (err) return res.sendStatus(500);

    // gets comments for posts
    db.all(`
            SELECT comments.*, users.username
            FROM comments
            JOIN users ON comments.user_id = users.id
            ORDER BY comments.created_at ASC
        `, [], (err, comments) => {
      if (err) return res.sendStatus(500);

      // assigns comments to posts
      posts.forEach(post => {
        post.comments = comments.filter(c => c.post_id === post.id);
      });

      res.render('posts', { user: req.session.user, posts });
    });
  });
});

app.post('/create', isAuthenticated, (req, res) => {
  const { title, content } = req.body;
  const username = req.session.user;

  // get user id
  db.get('SELECT id FROM users WHERE username = ?', [username], (err, user) => {
    if (!user) return res.status(400).send('User not found');

    // saves posts
    db.run(
      'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)',
      [user.id, title, content],
      function (err) {
        if (!err) {
          console.log(`post "${title}" created by ${username}`);
        }
        res.redirect('/posts');
      }
    );
  });
});

// comments, edits, deletes
app.post('/posts/:id/comments', isAuthenticated, (req, res) => {
  const postId = req.params.id;
  const { content } = req.body;
  const username = req.session.user;

  db.get('SELECT id FROM users WHERE username = ?', [username], (err, user) => {
    if (!user) return console.log('error');

    db.run(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, user.id, content],
      () => res.redirect('/posts')
    );
  });
});

// edits and deletes
app.post('/posts/:id/edit', isAuthenticated, (req, res) => {
  const { title, content } = req.body;
  const postId = req.params.id;
  const username = req.session.user;

  db.get('SELECT id FROM users WHERE username = ?', [username], (err, user) => {
    db.run(
      'UPDATE posts SET title = ?, content = ? WHERE id = ? AND user_id = ?',
      [title, content, postId, user.id],
      () => res.redirect('/posts')
    );
  });
});

// deletes
app.post('/posts/:id/delete', isAuthenticated, (req, res) => {
  const postId = req.params.id;
  const username = req.session.user;

  db.get('SELECT id FROM users WHERE username = ?', [username], (err, user) => {
    db.run(
      'DELETE FROM posts WHERE id = ? AND user_id = ?',
      [postId, user.id],
      () => res.redirect('/posts')
    );
  });
});

// delete comments 
app.post('/comments/:id/delete', isAuthenticated, (req, res) => {
  const commentId = req.params.id;
  const postId = req.body.post_id;
  const username = req.session.user;

  db.get(
    'SELECT posts.user_id FROM posts JOIN users ON posts.user_id = users.id WHERE users.username = ?',
    [username],
    (err, postOwner) => {
      db.run(
        'DELETE FROM comments WHERE id = ? AND post_id IN (SELECT id FROM posts WHERE user_id = ?)',
        [commentId, postOwner.user_id],
        () => res.redirect('/posts')
      );
    }
  );
});

const socket = io(AUTH_URL, {
  extraHeaders: { api: API_KEY }
});

socket.on('connect', () => {
  console.log('Connected to auth server');
  socket.emit('getACtiveClass');
});

socket.on('setClass', (classData) => {
  console.log('Active class data received:', classData);
});

// start server
app.listen(port, () => {
  console.log(`Running on http://localhost:${port}`);
});

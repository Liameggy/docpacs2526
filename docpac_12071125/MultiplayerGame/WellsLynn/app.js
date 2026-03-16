/*
Requirements
1.	Must use the following technology:
    [x]	Node.js (server)
    [x]	Express.js (routing)
    [x]	EJS or React.js (frontend)
    [x]	SQLite3 (database)
    [x]	Formbar OAuth (login system)
2.	Post Management
    [x]	Authenticated users can create, edit, and delete their own job listings.
    [x]	Posts should display title, description, creator, and timestamp.
    [x]	Posts must appear in chronological order (newest first).
3.	Comment System
    [x]	Authenticated users can comment on posts.
    []	Post creators can delete comments under their own posts.
    [x]	Comments must appear in chronological order (oldest first).
4.	User Profiles
    []	Clicking a username anywhere in the app should show a page listing all posts made by that user.
5.	Database Structure
    []	Use three tables:
    []	users
    []	posts
    []	comments
    []	Use JOIN queries to retrieve posts and comments efficiently.
6.	Authentication
    [x]	Implement Formbar OAuth Login for user authentication.
7.	Documentation
    [x]	Main application file must be named `app.js` in the route
    [x]	Dependencies installed automatically by using `npm i`
    [x]	README.md with complete description and instructions on how to install 

*/

require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);

const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

const createTables = [
    `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        body TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
];

db.serialize(() => {
    createTables.forEach((statement) => {
        db.run(statement, (err) => {
            if (err) {
                console.error('Error ensuring tables exist:', err.message);
            }
        });
    });
});

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SESSION_SECRET || 'your_secret_key';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:420/oauth';
const THIS_URL = process.env.THIS_URL || `http://localhost:${PORT}`;
const API_KEY = process.env.API_KEY || 'your_api_key'

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    store: new SQLiteStore({ db: "sessions.db", dir: `./db` }),
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: false
}));


function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

app.get('/', isAuthenticated, (req, res) => {
    try {
        res.render('index', { user: req.session.user });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

app.get('/listings', isAuthenticated, (req, res) => {
    try {
        res.render('listings', { user: req.session.user });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});


app.get('/login', (req, res) => {
    if (req.query.token) {
        const tokenData = jwt.decode(req.query.token);
        if (!tokenData || !tokenData.displayName) {
            return res.status(400).send('Invalid token');
        }
        const username = tokenData.displayName;

        const finalizeLogin = (userId) => {
            req.session.token = tokenData;
            req.session.user = { id: userId, username };
            res.redirect('/');
        };

        db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
            if (err) {
                console.error('Error retrieving user:', err.message);
                return res.status(500).send('Internal Server Error');
            }
            if (row) {
                finalizeLogin(row.id);
            } else {
                db.run('INSERT INTO users (username) VALUES (?)', [username], function (insertErr) {
                    if (insertErr) {
                        console.error('Error creating user:', insertErr.message);
                        return res.status(500).send('Internal Server Error');
                    }
                    console.log(`User ${username} saved to database.`);
                    finalizeLogin(this.lastID);
                });
            }
        });
    } else { res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`) }

});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

app.get('/api/posts', isAuthenticated, (req, res) => {
    const postsSql = `
        SELECT posts.id,
               posts.title,
               posts.description,
               posts.created_at as createdAt,
               posts.user_id as creatorId,
               users.username as creatorName
        FROM posts
        JOIN users ON posts.user_id = users.id
        ORDER BY posts.created_at DESC
    `;

    db.all(postsSql, [], (err, posts) => {
        if (err) {
            console.error('Error fetching posts:', err.message);
            return res.status(500).json({ error: 'Failed to fetch posts' });
        }

        if (!posts.length) {
            return res.json([]);
        }

        const postIds = posts.map(post => post.id);
        const placeholders = postIds.map(() => '?').join(',');
        const commentsSql = `
            SELECT comments.uid,
                   comments.post_id as postId,
                   comments.body,
                   comments.created_at as createdAt,
                   comments.user_id as userId,
                   users.username as author
            FROM comments
            JOIN users ON comments.user_id = users.id
            WHERE comments.post_id IN (${placeholders})
            ORDER BY comments.created_at ASC
        `;

        db.all(commentsSql, postIds, (commentsErr, comments) => {
            if (commentsErr) {
                console.error('Error fetching comments:', commentsErr.message);
                return res.status(500).json({ error: 'Failed to fetch comments' });
            }

            const commentsByPost = {};
            comments.forEach((comment) => {
                if (!commentsByPost[comment.postId]) {
                    commentsByPost[comment.postId] = [];
                }
                commentsByPost[comment.postId].push(comment);
            });

            const enrichedPosts = posts.map((post) => ({
                ...post,
                comments: commentsByPost[post.id] || []
            }));

            res.json(enrichedPosts);
        });
    });
});

app.post('/api/posts', isAuthenticated, (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }

    const insertSql = `
        INSERT INTO posts (user_id, title, description)
        VALUES (?, ?, ?)
    `;

    db.run(insertSql, [req.session.user.id, title.trim(), description.trim()], function (err) {
        if (err) {
            console.error('Error creating post:', err.message);
            return res.status(500).json({ error: 'Failed to create post' });
        }

        const selectSql = `
            SELECT posts.id,
                   posts.title,
                   posts.description,
                   posts.created_at as createdAt,
                   posts.user_id as creatorId,
                   users.username as creatorName
            FROM posts
            JOIN users ON posts.user_id = users.id
            WHERE posts.id = ?
        `;

        db.get(selectSql, [this.lastID], (selectErr, post) => {
            if (selectErr) {
                console.error('Error retrieving new post:', selectErr.message);
                return res.status(500).json({ error: 'Failed to fetch created post' });
            }
            res.status(201).json({ ...post, comments: [] });
        });
    });
});

app.put('/api/posts/:postId', isAuthenticated, (req, res) => {
    const { title, description } = req.body;
    const { postId } = req.params;

    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }

    db.get('SELECT user_id FROM posts WHERE id = ?', [postId], (err, post) => {
        if (err) {
            console.error('Error fetching post:', err.message);
            return res.status(500).json({ error: 'Failed to fetch post' });
        }
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        if (post.user_id !== req.session.user.id) {
            return res.status(403).json({ error: 'Not authorized to edit this post' });
        }

        db.run(
            'UPDATE posts SET title = ?, description = ? WHERE id = ?',
            [title.trim(), description.trim(), postId],
            (updateErr) => {
                if (updateErr) {
                    console.error('Error updating post:', updateErr.message);
                    return res.status(500).json({ error: 'Failed to update post' });
                }
                res.json({ message: 'Post updated successfully' });
            }
        );
    });
});

app.delete('/api/posts/:postId', isAuthenticated, (req, res) => {
    const { postId } = req.params;

    db.get('SELECT user_id FROM posts WHERE id = ?', [postId], (err, post) => {
        if (err) {
            console.error('Error fetching post:', err.message);
            return res.status(500).json({ error: 'Failed to fetch post' });
        }
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        if (post.user_id !== req.session.user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this post' });
        }

        db.run('DELETE FROM posts WHERE id = ?', [postId], (deleteErr) => {
            if (deleteErr) {
                console.error('Error deleting post:', deleteErr.message);
                return res.status(500).json({ error: 'Failed to delete post' });
            }
            res.json({ message: 'Post deleted successfully' });
        });
    });
});

app.post('/api/posts/:postId/comments', isAuthenticated, (req, res) => {
    const { postId } = req.params;
    const { body } = req.body;

    if (!body) {
        return res.status(400).json({ error: 'Comment body is required' });
    }

    db.get('SELECT id FROM posts WHERE id = ?', [postId], (err, post) => {
        if (err) {
            console.error('Error verifying post:', err.message);
            return res.status(500).json({ error: 'Failed to verify post' });
        }
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const insertSql = `
            INSERT INTO comments (post_id, user_id, body)
            VALUES (?, ?, ?)
        `;

        db.run(insertSql, [postId, req.session.user.id, body.trim()], function (insertErr) {
            if (insertErr) {
                console.error('Error creating comment:', insertErr.message);
                return res.status(500).json({ error: 'Failed to create comment' });
            }

            const selectSql = `
                SELECT comments.uid,
                       comments.post_id as postId,
                       comments.body,
                       comments.created_at as createdAt,
                       comments.user_id as userId,
                       users.username as author
                FROM comments
                JOIN users ON comments.user_id = users.id
                WHERE comments.uid = ?
            `;

            db.get(selectSql, [this.lastID], (selectErr, comment) => {
                if (selectErr) {
                    console.error('Error fetching new comment:', selectErr.message);
                    return res.status(500).json({ error: 'Failed to fetch created comment' });
                }
                res.status(201).json(comment);
            });
        });
    });
});

app.delete('/api/comments/:commentId', isAuthenticated, (req, res) => {
    const { commentId } = req.params;

    const ownershipSql = `
        SELECT posts.user_id as postOwnerId
        FROM comments
        JOIN posts ON comments.post_id = posts.id
        WHERE comments.uid = ?
    `;

    db.get(ownershipSql, [commentId], (err, row) => {
        if (err) {
            console.error('Error verifying comment ownership:', err.message);
            return res.status(500).json({ error: 'Failed to verify comment ownership' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        if (row.postOwnerId !== req.session.user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this comment' });
        }

        db.run('DELETE FROM comments WHERE id = ?', [commentId], (deleteErr) => {
            if (deleteErr) {
                console.error('Error deleting comment:', deleteErr.message);
                return res.status(500).json({ error: 'Failed to delete comment' });
            }
            res.json({ message: 'Comment deleted successfully' });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

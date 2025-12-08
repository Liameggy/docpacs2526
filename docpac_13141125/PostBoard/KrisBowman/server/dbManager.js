export default (sqlite3) => {
    const db = new sqlite3.Database('./database.db', (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to the SQLite database.');
        }

        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                console.log('Users table is ready.');
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            poster TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            time TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                console.log('Posts table is ready.');
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            commenter TEXT NOT NULL,
            content TEXT NOT NULL,
            time TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                console.log('Comments table is ready.');
            }
        });
    });

    function updateUser(username) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT OR IGNORE INTO users (username) VALUES (?)`
                , [username], function (err) {
                    if (err) {
                        console.error('Error updating user:', err.message);
                        reject(err);
                    } else {
                        resolve(username);
                    }
                });
        });
    }

    function getJobPosts() {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM posts ORDER BY time`
                , (err, rows) => {
                    if (err) {
                        console.error('Error fetching job posts:', err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
        });
    };

    function createJobPost(poster, title, content, time) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO posts (poster, title, content, time) VALUES (?, ?, ?, ?)`,
                [poster, title, content, time],
                function (err) {
                    if (err) {
                        console.error('Error creating job post:', err.message);
                        reject(err);
                    } else {
                        resolve({ id: this.lastID });
                    }
                }
            );
        });
    }

    function getComments() {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM comments ORDER BY id`
                , (err, rows) => {
                    if (err) {
                        console.error('Error fetching comments:', err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
        });
    }

    function createComment(commenter, content, time) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO comments (commenter, content, time) VALUES (?, ?, ?)`,
                [commenter, content, time],
                function (err) {
                    if (err) {
                        console.error('Error creating comment:', err.message);
                        reject(err);
                    } else {
                        resolve({ id: this.lastID });
                    }
                }
            );
        });
    }

    return {
        db,
        updateUser,
        getJobPosts,
        createJobPost,
        getComments,
        createComment
    };
};
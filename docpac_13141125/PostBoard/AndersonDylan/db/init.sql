-- Users Table
CREATE TABLE users (
    uid INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL
);

-- Posts Table  
CREATE TABLE posts (
    uid INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    creator_uid INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_uid) REFERENCES users(uid)
);

-- Comments Table
CREATE TABLE comments (
    uid INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    post_uid INTEGER NOT NULL,
    creator_uid INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_uid) REFERENCES posts(uid),
    FOREIGN KEY (creator_uid) REFERENCES users(uid)
);

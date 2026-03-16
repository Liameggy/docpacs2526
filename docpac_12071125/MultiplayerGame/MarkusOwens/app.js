//impotr
require('dotenv').config();
const express = require('express');
const app = express();  
const jwt = require('jsonwebtoken');
const session = require('express-session');
const http = require('http');
const server = require('http').createServer(app);
const { Server } = require("socket.io");
console.log(Server);
const io = new Server(server);
//constants 
const PORT=process.env.PORT || 3000;
const SESSION_SECRET=process.env.SESSION_SECRET || "massacre";
const AUTH_URL=process.env.AUTH_URL || "https://localhost:420/oauth";
const THIS_URL=process.env.THIS_URL || "http://localhost:${PORT}";
const API_KEY = process.env.API_KEY || "12345";
const sqlite3 = require('sqlite3').verbose();   
const SQLiteStore = require('connect-sqlite3')(session);
//database setup
const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});


//middlewar
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    store: new SQLiteStore({db: 'sessions.db', dir: './db'}),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }))
function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};
//routes
app.get('/',isAuthenticated, (req, res) => {
  res.render('index', { user: req.session.user}
  );
});
 let curuserid=0;
app.post('/', (req, res) => {
   
   prespost=req.body.jobposter
   console.log(prespost)
   db.get('SELECT uid FROM users WHERE username = ?', [req.session.user], (err, row) => {
    if (err) {
        return console.error(err.message);
    }
    console.log(row.uid)
    curuserid = row.uid
   console.log(curuserid)
   time=Date.now();
   console.log(time)
    db.run('INSERT INTO posts (job, uid,timestamps) VALUES (?, ?, ?)', [prespost, curuserid, time], function (err) {
        if (err) {
            return console.error(err.message);
        }});
        });
    
    });
app.get('/login', (req, res) => {
    if (req.query.token) {
         let tokenData = jwt.decode(req.query.token);
         req.session.token = tokenData;
         req.session.user = tokenData.displayName;
         //save user to data bas if no exist
         db.run('INSERT OR IGNORE INTO users (username) VALUES (?)', [tokenData.displayName], function (err) {
            if (err) {
                console.error(err.message);
            }
            console.log(`User ${tokenData.displayName} added to database or already exists.`);});
         
              res.redirect('/');
        } else {
         res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    };
});
app.get('/allpost',(req, res) => {
     db.all('SELECT posts.job, users.username, posts.timestamps FROM posts JOIN users ON posts.uid = users.uid ORDER BY posts.timestamps DESC', [], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        jo=rows
    db.all('SELECT comments.comment, users.username, comments.timestamp FROM comments JOIN users ON comments.uid = users.uid ORDER BY comments.timestamp ASC', [], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        co=rows
        
        res.render('allpost', {newestpost: jo, commentpost: co});
    });
});
});
app.post('/allpost', (req, res) => {
   prescom=req.body.commentmaker
   console.log(prescom)
   db.get('SELECT uid FROM users WHERE username = ?', [req.session.user], (err, row) => {
    if (err) {
        return console.error(err.message);
    }
    console.log(row.uid)
    curuserid = row.uid
   console.log(curuserid)
   time=Date.now();
   console.log(time)
    db.run('INSERT INTO comments (comment, uid,timestamp) VALUES (?, ?, ?)', [prescom, curuserid, time], function (err) {
        if (err) {
            return console.error(err.message);
        }});
        });
    res.redirect('/allpost');

});
app.get('/userprof',(req, res) => {
    //display all post made by user
    db.get('SELECT uid FROM users WHERE username = ?', [req.session.user], (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        userid=row.uid
    db.all('SELECT posts.job, users.username, posts.timestamps FROM posts JOIN users ON posts.uid = users.uid WHERE users.uid = ? ORDER BY posts.timestamps DESC', [userid], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        console.log(rows)
        usejob=rows
        
    res.render('userprof', { userprof: userid , newestpost: usejob});
});
});
});
app.post('/userprof', (req, res) => {
    db.all('SELECT posts.job, users.username, posts.timestamps FROM posts JOIN users ON posts.uid = users.uid WHERE users.uid = ? ORDER BY posts.timestamps DESC', [req.body.useridtofind], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        console.log(rows)
        usejob=rows
    });
    res.render('userprof', { userprof: req.body.useridtofind , newestpost: usejob});
});
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});


//start server
app.listen(PORT, () => {
  console.log(`Example app listening on port http://localhost:${PORT}`);
});
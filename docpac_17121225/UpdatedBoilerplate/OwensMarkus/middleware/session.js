
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const SESSION_SECRET=process.env.SESSION_SECRET || "massacre";
const sessionMiddleware=session({
    store: new SQLiteStore({db: 'sessions.db', dir: './db'}),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 86400000 }
  })
console.log(sessionMiddleware);
module.exports=sessionMiddleware;
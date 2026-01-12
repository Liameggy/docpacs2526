const session = require('express-session');
const SQLiteStoreModule = require('connect-sqlite3');
const SQLiteStore = SQLiteStoreModule(session);
const path = require('path');
const fs = require('fs');
const logger = (function(){ try { return require('../modules/logger'); } catch(e){ return console; } })();

const DEFAULT_DB = path.join(__dirname, '..', 'data', 'database.sqlite');
const DATABASE_FILE = (process.env.DATABASE_FILE && process.env.DATABASE_FILE.trim()) || DEFAULT_DB;

const SESSION_DB_FILENAME = path.basename(DATABASE_FILE);
const SESSION_DB_DIR = path.dirname(DATABASE_FILE);

// checks if session directory is there, if not creates it
if (!fs.existsSync(SESSION_DB_DIR)) {
  fs.mkdirSync(SESSION_DB_DIR, { recursive: true });
  logger.info('[session] created directory: ' + SESSION_DB_DIR);
}

logger.info('[session] using DB file for sessions: ' + path.join(SESSION_DB_DIR, SESSION_DB_FILENAME));

const store = new SQLiteStore({ db: SESSION_DB_FILENAME, dir: SESSION_DB_DIR });
if (store && typeof store.on === 'function') {
  try {
    store.on('error', (err) => {
      logger.error('[session] SQLiteStore error: ' + (err && err.message ? err.message : err));
    });
  } catch(e) {}
}
// sets up session middleware
const sessionMiddleware = session({
  store: store,
  secret: (process.env.SESSION_SECRET || 'change_this_in_env').replace(/\"/g,''),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    secure: false,
    sameSite: 'lax'
  }
});

module.exports = sessionMiddleware;

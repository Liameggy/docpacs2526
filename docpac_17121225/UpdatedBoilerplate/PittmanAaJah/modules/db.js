const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');
const DATABASE_FILE = process.env.DATABASE_FILE || path.join(__dirname, '..', 'data', 'database.sqlite');

// makes sure theres only one connection to the database
let dbPromise = null;
async function getDb() {
  if (!dbPromise) {
    const dbDir = path.dirname(DATABASE_FILE);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    console.log('[DB] Connecting to database at:', DATABASE_FILE);
    
    dbPromise = open({
      filename: DATABASE_FILE,
      driver: sqlite3.Database
    }).catch(err => {
      console.error('[DB] Connection failed:', err);
      dbPromise = null; 
      throw err;
    });
  }
  return dbPromise;
}

// exports database functions
module.exports = {
  get: async (sql, ...params) => {
    const db = await getDb();
    return db.get(sql, ...params);
  },
  all: async (sql, ...params) => {
    const db = await getDb();
    return db.all(sql, ...params);
  },
  run: async (sql, ...params) => {
    const db = await getDb();
    return db.run(sql, ...params);
  },
  rawDb: getDb
};

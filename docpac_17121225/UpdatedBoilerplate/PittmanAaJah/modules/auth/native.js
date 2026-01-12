const db = require('../db');
const { comparePassword, hashPassword } = require('./passwordHashing');

// handles native login and sign up
async function findUserByUsername(username) {
  return await db.get('SELECT id, username, passwordHash, formbarId, createdAt FROM users WHERE username = ?', username) || null;
}

async function registerUser(username, password) {
  const hash = await hashPassword(password);
  const res = await db.run('INSERT INTO users (username, passwordHash, createdAt, updatedAt) VALUES (?, ?, datetime("now"), datetime("now"))', username, hash);
  const id = res && (res.lastID || res.last_insert_rowid) || null;
  return { id, username };
}

async function validateLogin(username, password) {
  const user = await findUserByUsername(username);
  if (!user || !user.passwordHash) return null;
  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) return null;
  return { id: user.id, username: user.username };
}

module.exports = { findUserByUsername, registerUser, validateLogin };

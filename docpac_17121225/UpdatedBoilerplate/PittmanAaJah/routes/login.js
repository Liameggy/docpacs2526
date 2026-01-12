const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nativeAuth = require('../modules/auth/native');
const db = require('../modules/db');
const formbarClient = require('../modules/formbarClient');

router.get('/login', async (req, res) => {
  console.log('[login] GET /login - query:', req.query);
  if (req.query.token) {
    try {
      let tokenData = null;
      try { tokenData = jwt.decode(req.query.token); } catch (e) {}
      if (!tokenData) {
        try { tokenData = JSON.parse(Buffer.from(req.query.token, 'base64').toString('utf8')); } catch (e) {}
      }
      const displayName = (tokenData && (tokenData.displayName || tokenData.username)) || 'user';

      // see if theres a user with this formbarId or username
      let userRow = await db.get('SELECT id, username FROM users WHERE formbarId = ? OR username = ? LIMIT 1', tokenData.sub || tokenData.id || displayName, displayName);
      if (!userRow) {

        // create user and set formbarId
        const resInsert = await db.run('INSERT INTO users (username, formbarId, createdAt) VALUES (?, ?, datetime("now"))', displayName, tokenData.sub || tokenData.id || null);
        userRow = { id: resInsert.lastID, username: displayName };
      } else {
        if (!userRow.formbarId) {
          await db.run('UPDATE users SET formbarId = ? WHERE id = ?', tokenData.sub || tokenData.id || null, userRow.id);
        }
      }
      // updates with latest info
      req.session.user = { id: userRow.id, username: userRow.username, token: tokenData };

      return res.redirect('/profile');
    } catch (err) {
      console.error('[login] token processing error:', err && err.message);
      return res.redirect('/login');
    }
  }

  const authUrl = formbarClient.getAuthUrl();
  return res.render('login', { error: null, authUrl });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.render('login', { error: 'Provide username and password', authUrl: formbarClient.getAuthUrl() });
  }
  try {
    const user = await nativeAuth.validateLogin(username, password);
    if (!user) return res.render('login', { error: 'Invalid username or password', authUrl: formbarClient.getAuthUrl() });
    req.session.user = user;
    return res.redirect('/profile');
  } catch (err) {
    console.error('[login] native login error:', err && err.message);
    return res.render('login', { error: 'An error occurred during login', authUrl: formbarClient.getAuthUrl() });
  }
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.render('login', { error: 'Please provide username and password', authUrl: formbarClient.getAuthUrl() });
  try {
    const user = await nativeAuth.registerUser(username, password);
    req.session.user = user; 
    return res.redirect('/profile');
  } catch (err) {
    console.error('[register] error:', err && err.message);
    return res.render('login', { error: 'Registration failed', authUrl: formbarClient.getAuthUrl() });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(()=> res.redirect('/'));
});

module.exports = router;

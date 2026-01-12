const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/isAuthenticated');
const multer = require('multer');
const path = require('path');
const db = require('../modules/db');
const fs = require('fs');


const uploadDir = path.join(__dirname, '..', 'data', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, safe);
  }
});
const upload = multer({ storage });

router.get('/', isAuthenticated, async (req, res) => {
  const user = req.session.user;
  const uploads = await db.all('SELECT id, filename, createdAt FROM uploads WHERE userId = ? ORDER BY createdAt DESC LIMIT 20', user.id || -1);
  res.render('profile', { user, uploads });
});

router.post('/upload', isAuthenticated, upload.single('file'), async (req, res) => {
  const user = req.session.user;
  const file = req.file;
  if (!file) return res.redirect('/profile');
  await db.run('INSERT INTO uploads (userId, filename, createdAt) VALUES (?, ?, datetime("now"))', user.id || null, file.filename);
  return res.redirect('/profile');
});

module.exports = router;

const express = require('express');
const router = express.Router();

router.get('/sockets', (req, res) => {
  res.render('sockets', { user: req.session.user || null });
});

module.exports = router;

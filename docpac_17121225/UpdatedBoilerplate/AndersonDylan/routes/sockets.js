const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/isAuthenticated');

router.get('/', isAuthenticated, (req, res) => {
  // Pass user data to the view
  res.render('sockets', {
    user: req.session.user // <-- add this
  });
});

module.exports = router;

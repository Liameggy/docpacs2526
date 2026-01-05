const express = require('express');
const router = express.Router();
const userLayout = require('../modules/userLayout');

router.get('/socket', (req, res) => {
  const layout = userLayout.getLayoutData(req.session.user);
  layout.pageTitle = 'Socket.IO Demo';
  res.render('socket', layout);
});

module.exports = router;

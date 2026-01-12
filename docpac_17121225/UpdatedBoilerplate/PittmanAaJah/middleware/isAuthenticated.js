module.exports = function(req, res, next) {
  if (req.session && req.session.user) return next();
  if (req.path.startsWith('/api')) return res.status(401).json({ error: 'Unauthorized' });
  return res.redirect('/login');
};
// checks to see if a user is logged in
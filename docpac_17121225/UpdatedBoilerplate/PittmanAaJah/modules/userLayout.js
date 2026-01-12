function layoutUser(req) {
  const u = req && req.session && req.session.user ? req.session.user : null;
  return {
    loggedIn: !!u,
    username: u ? u.username : null,
    id: u ? u.id : null,
    nav: [
      { href: '/', label: 'Home' },
      { href: '/sockets', label: 'Sockets' },
      { href: '/profile', label: 'Profile' }
    ]
  };
}
module.exports = layoutUser;

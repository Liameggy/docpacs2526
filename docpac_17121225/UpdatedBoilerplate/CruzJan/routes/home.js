app.get('/', isAuthenticated, (req, res) => {
    try {
        res.render('home', { user: req.session.user });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});
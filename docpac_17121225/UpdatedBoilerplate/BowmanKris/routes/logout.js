function logout(app) {
    app.get('/logout', (req, res) => {         
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).send('Error logging out');
            }
            res.render('login');
        });
    });
}

module.exports = logout;
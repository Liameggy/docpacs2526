app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.displayName;
        res.redirect('/');

        // Save user to database if not exists

        db.run('INSERT OR IGNORE INTO users (username) VALUES (?)', [tokenData.displayName], function (err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`User ${tokenData.displayName} saved to database.`);
        });
    } else { res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`) }

});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

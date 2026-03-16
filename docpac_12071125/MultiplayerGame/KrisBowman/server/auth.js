export default (app, jwt, session) => {
    const AUTH_URL = process.env.AUTH_URL;
    const THIS_URL = process.env.THIS_URL;

    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        }
    }));

    function isAuthenticated(req, res, next) {
        if (req.session.user) {
            const tokenData = req.session.token;
            try {
                // Check if the token has expired
                const currentTime = Math.floor(Date.now() / 1000);
                if (tokenData.exp < currentTime) {
                    throw new Error('Token has expired');
                }

                next();
            } catch (err) {
                res.redirect(`${AUTH_URL}/oauth?refreshToken=${tokenData.refreshToken}&redirectURL=${THIS_URL}`);
            }
        } else {
            res.redirect(`/login?redirectURL=${THIS_URL}`);
        }
    }

    app.get('/', isAuthenticated, (req, res) => {
        try {
            res.render('', { user: req.session.user });
        } catch (error) {
            res.send(error.message);
        }
    });

    app.get('/login', (req, res) => {
        console.log('Login route hit');
        console.log('Query params:', req.query);

        if (req.query.token) {
            console.log('Token found:', req.query.token);
            try {
                let tokenData = jwt.decode(req.query.token);
                console.log('Decoded token data:', tokenData);

                const username = tokenData.displayName;

                req.session.token = tokenData;
                req.session.user = username;

                req.session.save((err) => {
                    if (err) {
                        console.error('Session save error:', err);
                        return res.status(500).send('Session save failed');
                    }
                    console.log('Session saved, redirecting to React');
                    res.redirect('http://localhost:5173');
                });

            } catch (error) {
                console.error('Token decode error:', error);
                res.status(500).send('Token decode failed');
            }
        } else {
            console.log('No token found, redirecting to Formbar auth');
            res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`);
        }
    });

    app.get('/api/auth-url', (_, res) => {
        const authURL = `${AUTH_URL}?redirectURL=${THIS_URL}`;
        res.json({ authURL });
    });
};
module.exports = function (app, jwt, port) {

    // Formbar Oauth URLs
    const FBJS_URL = 'https://formbeta.yorktechapps.com';
    const THIS_URL = `http://localhost:${port}/login`;
    const API_KEY = process.env.API_KEY;

    function isAuthenticated(req, res, next) {
        if (req.session.user) next()
        else res.redirect(`/login?redirectURL=${THIS_URL}`)
    }

    app.get('/', isAuthenticated, (req, res) => {
        try {
            fetch(`${FBJS_URL}/api/me`, {
                method: 'GET',
                headers: {
                    'API': API_KEY,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    req.session.user = data.displayName;
                    console.log(data); //log formbar user data for testing purposes
                })
                .then(() => {
                    res.render('index', { user: req.session.user });
                })
        }
        catch (error) {
            res.send(error.message)
        }
    });

    app.get('/login', (req, res) => {
        if (req.query.token) {
            let tokenData = jwt.decode(req.query.token)
            req.session.token = tokenData
            req.session.user = tokenData.displayName
            res.redirect('/')
        } else {
            res.redirect(`${FBJS_URL}/oauth?redirectURL=${THIS_URL}`)
        }
    })

};
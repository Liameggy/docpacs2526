//retrive environment variables
const FORMBAR_API_KEY = process.env.FORMBAR_API_KEY;
const FORMBAR_AUTH_URL = process.env.FORMBAR_AUTH_URL;

function usersRoute(app) {
    app.get('/api/users', (req, res) => {
        try {
            if (req.session.user && req.session.token) {
                fetch(`${FORMBAR_AUTH_URL}/api/me`, {
                    method: 'GET',
                    headers: {
                        'API': FORMBAR_API_KEY,
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        res.json(data); // Send user data as JSON
                    })
                    .catch(error => {
                        res.status(500).json({ error: error.message }); // Handle fetch errors
                    });
            } else if (req.session.user) {
                res.json({ username: req.session.user, displayName: req.session.displayName, permissions: req.session.permissions}); // Send basic user info
            } else {
                res.status(401).json({ error: 'Unauthorized' }); // Handle unauthorized access
            }
        } catch (error) {
            res.status(500).json({ error: error.message }); // Handle other errors
        }
    });
};

module.exports = usersRoute;
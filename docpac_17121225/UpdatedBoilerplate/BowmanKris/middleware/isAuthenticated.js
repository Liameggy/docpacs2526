// import and configure dotenv
require('dotenv').config();

// retrieve environment variables
const PORT = process.env.PORT;
const HOST = process.env.HOST;
const FORMBAR_AUTH_URL = process.env.FORMBAR_AUTH_URL;
const REDIRECT_URL = `${HOST}${PORT}/login/Formbar`;

function isAuthenticated(req, res, next) {
    if (req.session.user && req.session.token) {
        const tokenData = req.session.token;
        try {
            // Check if the token has expired
            const currentTime = Math.floor(Date.now() / 1000);
            if (tokenData.exp < currentTime) {
                throw new Error('Token has expired');
            }
            next();
        } catch (err) {
            res.redirect(`${FORMBAR_AUTH_URL}/oauth?refreshToken=${tokenData.refreshToken}&redirectURL=${REDIRECT_URL}`);
        }
    } else if (req.session.user) {
        next();
    } else {
        res.redirect(`/login?redirectURL=${REDIRECT_URL}`);
    }
};

module.exports = isAuthenticated;
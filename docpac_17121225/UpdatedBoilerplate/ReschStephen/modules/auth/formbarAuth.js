// Imports
import express from 'express';
const router = express.Router();
import { logging } from '../logger.js';
import jwt from 'jsonwebtoken';

// Build authorization URL
function buildAuthURL() {
    const params = new URLSearchParams({
        client_id: process.env.FB_CLIENT_ID,
        redirect_uri: process.env.FB_REDIRECT_URI,
        response_type: 'code',
    });
    return `https://formbeta.yorktechapps.com/oauth?${params.toString()}`;
}
const AUTH_URL = buildAuthURL();
const THIS_URL = process.env.FB_REDIRECT_URI;

export { AUTH_URL, THIS_URL };
// Handle OAuth redirect flow
router.get('/auth/formbar', (req, res) => {
    logging('INFO', `Login request received with query: ${JSON.stringify(req.query)}`);
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = { username: tokenData.displayName };
        logging('INFO', `User ${tokenData.displayName} logged in successfully.`);
        res.redirect('/profile');
    } else {
        res.redirect(`${AUTH_URL}&redirectURL=${THIS_URL}`);
    }
});


// Handle callback route
router.get('/callback', (req, res) => {
    const authToken = req.query.token;
    if (!authToken) {
        logging('ERROR', 'No authorization token received in callback.');
        return res.status(400).send('Authorization token is missing.');
    }
    // Exchange auth code for access token
    let tokenData = jwt.decode(authToken);
    req.session.token = tokenData;
    req.session.user = { username: tokenData.displayName };
    logging('INFO', `User ${tokenData.displayName} logged in successfully.`);
    res.redirect('/profile');
});

// Exchange authorization code for tokens and user info
async function exchangeAuthCodeForToken(authCode) {
    try {
        const response = await fetch(`https://formbeta.yorktechapps.com/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: process.env.FB_CLIENT_ID,
                client_secret: process.env.FB_CLIENT_SECRET,
                redirect_uri: THIS_URL,
                code: authCode,
                grant_type: 'authorization_code',
            }),
        });
        const data = await response.json();
        if (data.access_token) {
            logging('INFO', 'Access token obtained successfully.');
            return jwt.decode(data.access_token);
        } else {
            logging('ERROR', 'Failed to obtain access token.');
            throw new Error('Failed to obtain access token.');
        }
    } catch (error) {
        logging('ERROR', `Error during token exchange: ${error.message}`);
        throw error;
    }
}

export { exchangeAuthCodeForToken };

// Link formbar user identity to local user database
export function linkFormbarUserToLocalDB(db, fbName, callback) {
    const query = `SELECT * FROM users WHERE fb_name = ?`;
    db.get(query, [fbName], function (err, row) {
        if (err) {
            logging('ERROR', `Error fetching user: ${err}`);
            return callback(err);
        }
        if (!row) {
            const insertQuery = `INSERT INTO users (fb_name, profile_checked) VALUES (?, ?)`;
            db.run(insertQuery, [fbName, 0], function (err) {
                if (err) {
                    logging('ERROR', `Error linking user: ${err}`);
                    return callback(err);
                }
                logging('INFO', `User ${fbName} linked successfully.`);
                callback(null);
            });
        } else {
            logging('INFO', `User ${fbName} already linked.`);
            callback(null);
        }
    });
}

export default router;
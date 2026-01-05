// handling OAUTH redirect flow from Formbar
const express = require('express');
const router = express.Router();
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/database.sqlite');

router.get('/auth/callback', (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.status(400).send('Authorization token missing');
    }
    
    console.log('API_KEY from env:', process.env.API_KEY);
    //api stuff that was totally such fun to figure out
    axios.get('http://formbeta.yorktechapps.com/api/me', {
        headers: { 
            'API': process.env.API_KEY,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('SUCCESS! User data:', response.data);
        const formbarUser = response.data;
        // database stuff
        const query = `SELECT * FROM users WHERE formbarId = ?`;
        db.get(query, [formbarUser.id], (err, row) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Database error');
            }
            
            if (row) {
                // user exists, set session
                req.session.user = row;
                res.redirect('/');
            } else {
                // Fixed: use formbarId (lowercase d) in INSERT as well
                const insertQuery = `INSERT INTO users (username, formbarId, passwordHash, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`;
                const now = Date.now().toString(); // Convert to string since your DB expects TEXT
                
                db.run(insertQuery, [formbarUser.displayName || formbarUser.email, formbarUser.id, null, now, now], function(err) {
                    if (err) {
                        console.error('Database insert error:', err);
                        return res.status(500).send('Database error');
                    }
                    
                    // set session for new user
                    req.session.user = {
                        id: this.lastID,
                        username: formbarUser.displayName || formbarUser.email,
                        formbarId: formbarUser.id  // Fixed: lowercase d here too
                    };
                    res.redirect('/');
                });
            }   
        });
    })
    .catch(error => {
        console.error('Error during authentication', error.response?.data || error.message);
        res.status(500).send('Authentication error');
    });
});

module.exports = router;

// imports
const express = require('express');
const path = require('path');
const session = require('express-session');
const fs = require('fs');

// create app
const app = express();

// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// simple session middleware (optional, shown because session was imported)
app.use(session({ secret: 'change-me', resave: false, saveUninitialized: true }));

// routes
app.get('/', (req, res) => {
    res.render('index', { viewport: 'online' });
});

// using print to render the template to a string instead of sending it to the browser using fs
app.get('/print', (req, res) => {
    res.render('index', { viewport: 'print' }, (err, html) => {
        console.log('Callback reached!', err ? 'Error:' + err : 'Success');
        if (err) {
            return res.status(500).send('Error rendering page');
        }
        // Save the rendered HTML to a file
        fs.writeFile('index.html', html, (err) => {
            if (err) {
                return res.status(500).send('Error generating index.html');
            }
            console.log('index.html generated successfully');
            res.send('index.html generated successfully.');
        });
    });
});

// start server when this file is run directly
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}

module.exports = app;
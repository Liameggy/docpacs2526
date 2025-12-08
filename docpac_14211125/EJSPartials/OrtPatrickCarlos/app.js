const express = require('express');
const ejs = require('ejs');
const fs = require('fs');
const app = express();


app.set('view engine', 'ejs');



app.get('/', (req, res) => {
    res.render('index', {viewport: 'online'})
});

app.get('/print', (req, res) => {
    ejs.renderFile('views/index.ejs', { viewport: 'offline' }, (err, html) => {
        if (err) {
            return res.send('Error rendering template');
        }
        fs.writeFile('index.html', html, (err) => {
            if (err) {
                return res.send('Error saving file');
            }
            res.send('File saved successfully');
        });
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
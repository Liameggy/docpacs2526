const express = require('express');
const ejs = require('ejs');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render("index", { viewport: "online" });
});

app.get('/print', (req, res) => {
    ejs.renderFile('views/index.ejs', { viewport: "offline" }, (err, html) => {
        if (err) {
            console.error('Error rendering template:', err);
        }
        fs.writeFile('index.html', html, (err) => {
            if (err) {
                console.error('Error saving file:', err);
            }
            console.log('File saved successfully as index.html');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
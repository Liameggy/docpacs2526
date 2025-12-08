const ejs = require('ejs');
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

const info = "hi";

app.get('/', (req, res) => {
    res.render('index.ejs', { viewport: "online" });
});

app.get('/print', (req, res) => {
    res.render('print', { viewport: "offline" }, (err, html) => {
        ;

        const outputPath = path.join(__dirname, 'index.html');

        fs.writeFile(outputPath, info, (err) => {
            if (err) {
                console.error('Error writing file:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            console.log('HTML file has been generated at', outputPath);
            res.send('HTML file has been generated successfully.');
        });
    });
});


app.set('view engine', 'ejs');



app.listen(3000, () => {
    console.log('Server is running on port http://localhost:3000');
});
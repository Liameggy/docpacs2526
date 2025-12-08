const express = require('express');
const ejs = require('ejs');
const fs = require('fs');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index', { viewport: 'online' });
});

app.get('/print', (req, res) => {
    ejs.renderFile('./views/index.ejs', { viewport: 'offline' }, (err, renderedTemplate) => {
        if (err) {
            console.log(err);
            res.send('Error rendering the template');
            return;
        }
        fs.writeFile('index.html', renderedTemplate, (err) => {
            if (err) {
                console.log(err);
                res.send('Error writing the file');
            } else {
                console.log('File has been written successfully');
                res.send('File has been written successfully');
            }
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

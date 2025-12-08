const express = require('express');
const ejs = require("ejs")
const fs = require('fs')
const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index', {viewport: 'online'});
});

app.get('/print', (req, res) => {
    ejs.renderFile('./views/index.ejs', { viewport: 'offline' }, (err, renderedTemplate) => {
        if(err) {
            console.log(err)
        }
        console.log(renderedTemplate);
        fs.writeFile('index.html', renderedTemplate, (err) => {
            if (err) {
                console.error(err);
                res.send();
            } else {
                console.log('File written succesfully')
                res.send();
            }
        })
    })
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:3000`);

});
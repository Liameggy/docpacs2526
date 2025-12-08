const express = require('express');
const ejs = require('ejs');
const app = express();
const fs = require('fs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index.ejs', { viewport: "online" });
});

app.get('/print', (req, res) => {
    ejs.renderFile('views/index.ejs', { viewport: 'offline' }, (err, renderedTemplate) => {
        if (err) {
            console.log(err)
        } else {
            fs.writeFile('views/index.html', renderedTemplate, (err) => {
                if (err) {
                    console.log(err)
                } else {
                    res.send("File Saved")
                }
            });
        }
    });
});

app.listen(3000, () => {
    console.log("Started HTTP Server on port 3000");
});
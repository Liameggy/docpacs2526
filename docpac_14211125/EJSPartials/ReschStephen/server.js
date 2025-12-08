const express = require('express');
const ejs = require('ejs');
const app = express();
const fs = require('fs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render("index.ejs", { viewport: "online" });
});

app.get('/print', (req, res) => {
    ejs.renderFile('views/index.ejs', { viewport: "offline" }, (err, str) => {
        if (err) {
            return res.status(500).send("Error rendering template");
        }
        fs.writeFile('views/index.html', str, (err) => {
            if (err) {
                return res.status(500).send("Error writing file");
            }
            else {
                res.send("File has been saved.");
            }
        });

    });

});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
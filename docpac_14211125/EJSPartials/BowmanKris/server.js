import express from 'express';
import fs from 'fs';

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index', { viewport: "online" });
});

app.get('/print', (req, res) => {
  res.render('index', { viewport: "offline" }, (err, html) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error rendering the template.');
      return;
    }

    //res.send('viewport: "offline"');
    fs.writeFile('index.html', html, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error writing the file.');
        return;
      }
      res.send(`<p>File has been written with viewport: offline</p>`
      );
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

PORT = 3000;

app.get('/', (req, res) => {
    res.render('index', { viewport: "online" });
});

app.get('/print', (req, res) => {
    res.render('index', { viewport: "offline" });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

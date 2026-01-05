//importer
require('dotenv').config();
const express = require('express');
const app = express();  
const jwt = require('jsonwebtoken');
const session = require('express-session');
const http = require('http');
const server = require('http').createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const logger = require('./modules/logger');
logger.info("Logger initialized");
const multer = require('multer');
const navlogin = require('./modules/auth/native');
const formbarAuth = require('./modules/auth/formbarAuth');
const socketModule = require('./modules/socketServer');
const userLayout = require('./modules/userLayout')
const instmanager = require('./modules/instanceManager')
//constants 
const PORT=process.env.PORT || 3000;
const SESSION_SECRET=process.env.SESSION_SECRET || "massacre";
const AUTH_URL=process.env.AUTH_URL || "https://localhost:420/oauth";
const THIS_URL=process.env.THIS_URL || "http://localhost:${PORT}";
const API_KEY = process.env.API_KEY || "12345";
const sqlite3 = require('sqlite3').verbose();   
const SQLiteStore = require('connect-sqlite3')(session)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'db/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);} 
        else {
        cb(new Error('Only image files (JPEG, PNG, GIF) are allowed!'), false);}};
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }});
//database setup
const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) {
        logger.error(err.message);
    }
    logger.info('Connected to the database.');
});
const dbu = new sqlite3.Database('./db/uploads.db', (err) => {
    if (err) {
        logger.error(err.message);
    }
    logger.info('Connected to the uploaddatabase.');
});

//middleware
const sessionMiddleware= require('./middleware/session')
const userapiroute= require('./routes/api/user')
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use('/api', userapiroute)
const midAuth = require('./middleware/isAuthenticated');
//routes
const mio = socketModule.createSocketServer(server, sessionMiddleware);
app.get('/',midAuth, (req, res) => {
    const indexData = userLayout.getUserData(req.session);
  res.render('index', { user: req.session.user});
});

app.get('/login', (req, res) => {
    if (req.query.token) {
         let tokenData = jwt.decode(req.query.token);
         req.session.token = tokenData;
         req.session.user = tokenData.displayName;
         let curdate= new Date();
         let curtime= curdate.toISOString().slice(0, 19).replace('T', ' ');
         logger.info(`Token for user ${tokenData.displayName} received at ${curtime}, expires at ${tokenData.exp}`);
         logger.info(`User ${tokenData.displayName} logged in.`);
         //save user to data bas if no exist
         db.run('INSERT OR IGNORE INTO users (username,passwordHash,formbarId,lastupdate) VALUES (?, ?, ?, ?)', [tokenData.displayName, null, tokenData.id, curtime], function (err) {
            if (err) {
                logger.error(err.message);
            }
            logger.info(`User ${tokenData.displayName} added to database or already exists.`);});
         
              res.redirect('/');
        } else {
         res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    };
});
app.post('/login', (req, res) => {
    let username1 = req.body.username;
    let password1 = req.body.password;
    let formbarId = req.body.formbarId;

    let curdate= new Date();
    let curtime= curdate.toISOString().slice(0, 19).replace('T', ' ');
    if (formbarId != null && formbarId != undefined) {
    db.run('INSERT OR IGNORE INTO users (username,passwordHash,formbarId,lastupdate) VALUES (?, ?, ?, ?)', [username1, null, formbarId, curtime], function (err) {
            if (err) {
                logger.error(err.message);
            }
            logger.info(`User ${tokenData.displayName} added to database or already exists.`);});
         
              res.redirect('/');
        }
    else { logger.error('Formbar ID is required');}
});
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});
app.get('/profile', midAuth, (req, res) => {
    dbu.all('SELECT * FROM Uploads', (err, rows) => {
        if (err) {
            logger.error(err.message);
            res.status(500).send('Error retrieving uploads');
        } 
        logger.info(`Uploads retrieved for user ${req.session.user}`);
    const profileData = userLayout.getProfileData(req.session, rows);
    res.render('profile', profileData);});
});
app.post('/profile', upload.single('profilePic'), (req, res) => {
    logger.info('File upload request received');
    logger.info('req.body:', req.body);
    logger.info('req.file:', req.file);
    logger.info('Content-Type:', req.get('Content-Type'));
    let curupload = req.file.path;
    logger.info('Current upload:', curupload);
    let uid = req.body.uid;
    dbu.run('INSERT INTO Uploads (uid, upload) VALUES (?, ?)', [uid, curupload], function (err) {
        if (err) {
            logger.error(err.message);
            res.status(500).send('Error uploading file');
        } else {
            logger.info(`File uploaded by user ${uid} at ${new Date().toISOString()}`);
            res.redirect('/profile');
        }
    });});
app.get('/sockets', (req, res) => {
    sockdata = userLayout.getUserData(req.session);
    res.render('sockets', sockdata);
});
//socket.io setup
io.on('connection', (socket) => {
    logger.info('a user connected');
    socket.on('update', (data) => {
    logger.info('Update received:', data);
    io.emit('update', data);
});
socket.on('connect_auth', () => {
    logger.info('Connected to auth server');
});

    

socket.on('disconnect', () => {
    logger.info('Disconnected from auth server',socket.id);
});
});

//start server
server.listen(PORT, () => {
    logger.info(`Example app listening on port http://localhost:${PORT}`);
});
//import required modules
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const { Server } = require('socket.io');
const http = require('http')
const path = require('path');

//import custom middleware and route handlers
const homeRoute = require('./routes/home');
const profileRoute = require('./routes/profile');
const socketRoute = require('./routes/socket');
const loginRoute = require('./routes/login');
const logoutRoute = require('./routes/logout');
const usersRoute = require('./routes/api/users');

const onConnect = require('./sockets/onConnect')

//retrieve environment variables
const PORT = process.env.PORT;
const HOST = process.env.HOST;
const SESSION_SECRET = process.env.SESSION_SECRET;
const DATABASE_DIR = process.env.DATABASE_DIR;
const UPLOADS_DIR = process.env.UPLOADS_DIR;

//get database folder path for SQLiteStore
const databaseFolder = path.dirname(DATABASE_DIR);

//initialize express application
const app = express();

//initialize socket.io server
const server = http.createServer(app);
const io = new Server(server);

//set up session management
app.use(session({
    store: new SQLiteStore({ dir: databaseFolder }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

//set up middleware
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

//serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/public', express.static("./public"));

//socket.io events
onConnect(io)

//set up routes
homeRoute(app);
profileRoute(app);
socketRoute(app);
loginRoute(app);
logoutRoute(app);
usersRoute(app);

//start the server
server.listen(PORT, () => {
    console.log(`Server is running at ${HOST}${PORT}`);
});
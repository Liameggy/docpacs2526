const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const session = require('express-session')
const { createServer } = require('node:http')
const { join } = require("node:path")
const { Server } = require("socket.io")
//add encryption if necessary
const app = express();
const AUTH_URL = 'https://formbeta.yorktechapps.com'
const THIS_URL = 'http://172.16.3.208:3000/login'
const server = createServer(app);
const io = new Server(server);
var Player = { Player1: null, Player2: null }
var spellList = [
    { Name: 'Fire', Damage: 5, Weakness: 'Water' },
    { Name: "Water", Damage: 5, Weakness: 'Lightning' },
    { Name: "Lightning", Damage: 5, Weakness: 'Earth' },
    { Name: "Earth", Damage: 5, Weakness: 'Air' },
    { Name: "Air", Damage: 5, Weakness: 'Fire' }
]
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database('./data/templatedatabase.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

app.set('view engine', 'ejs');

const middleWare = session({
    secret: 'secretString',
    resave: false,
    saveUninitialized: false
})

app.use(middleWare);

io.use((socket, next) => {
    middleWare(socket.request, {}, next)
})

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect(`/login?redirectURL=${THIS_URL}`);
};

function findRoom(user) {
    if (!Player.Player1) {
        Player.Player1 = user
        startGame();
        return 1
    } else if (!Player.Player2) {
        Player.Player2 = user
        return 2
    }
};

function startGame() {
    Player.Player1Health = 100
    Player.Player2Health = 100
    Player.turn = 1
    Player.Player1Spell = null
    Player.Player2Spell = null
    Player.roundState = "going"
};

function spellCast(spell) {
    if (Player.turn == 1) {
        Player.Player1Spell = spell
        console.log(Player.Player1Spell)
        console.log(spellList[Player.Player1Spell])
        Player.turn += 1
        console.log('Turn', Player.turn)
    } else if (Player.turn == 2) {
        Player.Player2Spell = spell
        console.log(Player.Player2Spell)
        console.log(spellList[Player.Player2Spell])
        if (spellList[Player.Player1Spell].Weakness == spellList[Player.Player2Spell].Name) {
            Player.Player1Health -= ((spellList[Player.Player2Spell].Damage) * 2)
        } else if (spellList[Player.Player2Spell].Weakness == spellList[Player.Player1Spell].Name) {
            Player.Player2Health -= ((spellList[Player.Player1Spell].Damage) * 2)
        } else {
            Player.Player1Health -= (spellList[Player.Player2Spell].Damage)
            Player.Player2Health -= (spellList[Player.Player1Spell].Damage)
        }
        Player.turn -= 1
        Player.roundState = "over"
    }
    console.log(Player.Player1Health)
    console.log(Player.Player2Health)
    if (Player.Player1Spell == null) {
        console.log("P1 Spell is null")
    } else {
        Player.Player1Spell = spellList[Player.Player1Spell].Name
    }
    if (Player.Player2Spell == null) {
        console.log("p2 Spell is null")
    } else {
        Player.Player2Spell = spellList[Player.Player2Spell].Name
    }
};

function spellToIndex() {
    if (Player.Player1Spell == "Fire") {
        Player.Player1Spell = 0
    } else if (Player.Player1Spell == "Water") {
        Player.Player1Spell = 1
    } else if (Player.Player1Spell == "Lightning") {
        Player.Player1Spell = 2
    } else if (Player.Player1Spell == "Earth") {
        Player.Player1Spell = 3
    } else if (Player.Player1Spell == "Air") {
        Player.Player1Spell = 4
    }
    if (Player.Player2Spell == "Fire") {
        Player.Player2Spell = 0
    } else if (Player.Player2Spell == "Water") {
        Player.Player2Spell = 1
    } else if (Player.Player2Spell == "Lightning") {
        Player.Player2Spell = 2
    } else if (Player.Player2Spell == "Earth") {
        Player.Player2Spell = 3
    } else if (Player.Player2Spell == "Air") {
        Player.Player2Spell = 4
    }
};

app.get('/', isAuthenticated, (req, res) => {
    res.render('index', { user: req.session.user });
});

app.get('/game', (req, res) => {
    res.render('game.ejs')
});

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token)
        req.session.token = tokenData
        req.session.user = tokenData.displayName
        res.redirect('/')
    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`)
    }
});

io.on('connection', (socket) => {
    var data = socket.request.session;
    const user = data.user
    const id = socket.id
    console.log("User Connected: ", user);
    socket.join("some room");
    var userNum = findRoom(id);
    io.emit('connected', userNum);
    io.to("some room").emit('playerJoined', Player);
    socket.on('playState', (playState) => {
        console.log(playState)
        if (playState) {
            io.emit('playable')
        }
    });
    socket.on('spell', (spell) => {
        console.log(user)
        spellCast(spell)
        io.emit('gameUpdate', Player)
        spellToIndex();
        if (Player.roundState == "over") {
            Player.roundState = "going"
        }

    });
    socket.on('disconnect', () => {
        console.log("User Disconnected: ", user)
        startGame();
        io.emit('opponent left')
    });
    
    socket.on('reload', () => {
        socket.leave("some room");
        Player.Player1 = null
        Player.Player2 = null
        socket.emit('redirect', '/');
        console.log(Player)
    });
});



server.listen(3000, () => {
    console.log("Started HTTP Server on port 3000");
});
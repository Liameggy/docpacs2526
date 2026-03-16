const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const session = require('express-session')
const { createServer } = require('node:http')
const { join } = require("node:path")
const { Server } = require("socket.io")
const app = express();
const AUTH_URL = 'https://formbeta.yorktechapps.com'
const THIS_URL = 'http://localhost:3000/login'
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
var Rooms = []
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
    var roomAndUser = 0
    var roomMade = false
    for (let i = 0; (i <= Rooms.length) && (!roomMade); i++) {
        if (i < Rooms.length) {
            if (Rooms[i].Player1 == null) {
                Rooms[i].Player1 = user
                roomAndUser = (i + 0.1)
                roomMade = true
            } else if (Rooms[i].Player2 == null) {
                Rooms[i].Player2 = user
                roomAndUser = (i + 0.2)
                roomMade = true
            }
        } else if (i == Rooms.length) {
            createRoom(i)
            startGame(i)
            roomMade = true
            Rooms[i].Player1 = user
            roomAndUser = (i + 0.1)
        }
    };
    return roomAndUser
};

function createRoom(room) {
    Rooms.push({
        Player1: null,
        Player2: null,
        roomNum: room.toString(),
        Player1Health: 100,
        Player2Health: 100,
        turn: 1,
        Player1Spell: null,
        Player2Spell: null,
        roundState: "going"
    })
}

function returnRoom(room) {
    for (let i = 0; i <= Rooms.length; i++) {
        if (i < Rooms.length) {
            if (Rooms[i].roomNum == room) {
                return i
            }
        } else if (i == Rooms.length) {
            console.log("This Room Does Not Exist")
        }
    }
}

function startGame(room) {
    Rooms[room].Player1 = null
    Rooms[room].Player2 = null
    Rooms[room].Player1Health = 100
    Rooms[room].Player2Health = 100
    Rooms[room].turn = 1
    Rooms[room].Player1Spell = null
    Rooms[room].Player2Spell = null
    Rooms[room].roundState = "going"
};

function spellCast(spell, index) {
    if (Rooms[index].turn == 1) {
        Rooms[index].Player1Spell = spell
        Rooms[index].turn += 1
    } else if (Rooms[index].turn == 2) {
        Rooms[index].Player2Spell = spell
        if (spellList[Rooms[index].Player1Spell].Weakness == spellList[Rooms[index].Player2Spell].Name) {
            Rooms[index].Player1Health -= ((spellList[Rooms[index].Player2Spell].Damage) * 2)
        } else if (spellList[Rooms[index].Player2Spell].Weakness == spellList[Rooms[index].Player1Spell].Name) {
            Rooms[index].Player2Health -= ((spellList[Rooms[index].Player1Spell].Damage) * 2)
        } else {
            Rooms[index].Player1Health -= (spellList[Rooms[index].Player2Spell].Damage)
            Rooms[index].Player2Health -= (spellList[Rooms[index].Player1Spell].Damage)
        }
        Rooms[index].turn -= 1
        Rooms[index].roundState = "over"
    }
    if (Rooms[index].Player1Spell == null) {
        console.log("P1 Spell is null")
    } else {
        Rooms[index].Player1Spell = spellList[Rooms[index].Player1Spell].Name
    }
    if (Rooms[index].Player2Spell == null) {
        console.log("p2 Spell is null")
    } else {
        Rooms[index].Player2Spell = spellList[Rooms[index].Player2Spell].Name
    }
};

function spellToIndex(index) {
    if (Rooms[index].Player1Spell == "Fire") {
        Rooms[index].Player1Spell = 0
    } else if (Rooms[index].Player1Spell == "Water") {
        Rooms[index].Player1Spell = 1
    } else if (Rooms[index].Player1Spell == "Lightning") {
        Rooms[index].Player1Spell = 2
    } else if (Rooms[index].Player1Spell == "Earth") {
        Rooms[index].Player1Spell = 3
    } else if (Rooms[index].Player1Spell == "Air") {
        Rooms[index].Player1Spell = 4
    }
    if (Rooms[index].Player2Spell == "Fire") {
        Rooms[index].Player2Spell = 0
    } else if (Rooms[index].Player2Spell == "Water") {
        Rooms[index].Player2Spell = 1
    } else if (Rooms[index].Player2Spell == "Lightning") {
        Rooms[index].Player2Spell = 2
    } else if (Rooms[index].Player2Spell == "Earth") {
        Rooms[index].Player2Spell = 3
    } else if (Rooms[index].Player2Spell == "Air") {
        Rooms[index].Player2Spell = 4
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
    var findRoomData = findRoom(id);
    var room = Math.floor(findRoomData)
    var userNum = (Math.round((findRoomData - room) * 10))
    room = room.toString()
    roomIndex = returnRoom(room)
    socket.join(room);
    socket.currentRoom = room
    io.to(room).emit('connected', userNum, room);
    io.to(room).emit('playerJoined', Rooms[roomIndex]);
    socket.on('playState', (playState) => {
        if (playState) {
            io.to(room).emit('playable')
        }
    });
    socket.on('spell', (spell, msg) => {
        let indx = returnRoom(msg)
        spellCast(spell, indx)
        io.to(msg).emit('gameUpdate', Rooms[indx])
        spellToIndex(indx);
        if (Rooms[indx].roundState == "over") {
            Rooms[indx].roundState = "going"
        }

    });
    socket.on('disconnect', () => {
        console.log("User Disconnected: ", user)
        io.to(socket.currentRoom).emit('opponent left')
    });

    socket.on('reload', (rm) => {
        socket.leave(rm);
        let indx = returnRoom(rm)
        startGame(rm)
        socket.emit('redirect', '/');
    });
});



server.listen(3000, () => {
    console.log("Started HTTP Server on port 3000");
});
require('dotenv').config();
const express = require('express');
const http = require('http');
const socket = require('socket.io');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const SQLLiteStore = require('connect-sqlite3')(session);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const app = express();

const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Database connected successfully');
    }
});

const PORT = process.env.PORT;
const SECRET_KEY = process.env.SESSION_SECRET;

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(
    session({
        store: new SQLLiteStore({ db: 'sessions.db', dir: './db' }),
        secret: SECRET_KEY,
        resave: false,
        saveUninitialized: false,
    })
);

app.get('/', (req, res) => {
    res.render('index', { user: req.session.user });
});

app.get('/game', (req, res) => {
    res.render('game', { user: req.session.user });
});


const rooms = {}; // Store room data


wss.on('connection', (WebSocket) => {
    console.log('A user connected');

    WebSocket.on('message', (message) => {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'createRoom': {
                const roomCode = generateRoomCode();
                rooms[roomCode] = {
                    players: [WebSocket],
                    usernames: new Map([[WebSocket, data.username || 'Player1']]),
                    choices: {}, // username -> 'rock' | 'paper' | 'scissors'
                    persistent: true,
                };
                WebSocket.send(JSON.stringify({ type: 'roomCreated', roomCode }));
                console.log(`Room ${roomCode} created`);
                console.log('Current rooms:', Object.keys(rooms));
                break;
            }

            case 'joinRoom': {
                console.log(`Client requested to join room: ${data.roomCode}`);
                console.log(`Available rooms: ${Object.keys(rooms)}`);
                const room = rooms[data.roomCode];
                if (room) {
                    if (room.players.length < 2) {
                        room.players.push(WebSocket);
                        room.usernames.set(WebSocket, data.username || `Player${room.players.length}`);
                        WebSocket.send(JSON.stringify({ type: 'roomJoined', roomCode: data.roomCode }));
                        console.log(`Player joined room ${data.roomCode}`);

                        broadcast(room.players, { type: 'playerCount', count: room.players.length });

                        if (room.players.length === 2) {
                            room.persistent = false;
                            console.log(`Room ${data.roomCode} is now active and no longer persistent`);
                        }
                    } else {
                        WebSocket.send(JSON.stringify({ type: 'error', message: 'Room is full' }));
                    }
                } else {
                    WebSocket.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
                }
                break;
            }
                
            case 'choice': {
                const r = rooms[data.roomCode];
                if (!r) break;
                const username = data.username || r.usernames.get(WebSocket) || 'Player';
                const choice = String(data.choice || '').toLowerCase();
                if (!['rock', 'paper', 'scissors'].includes(choice)) {
                    WebSocket.send(JSON.stringify({ type: 'error', message: 'Invalid choice' }));
                    break;
                }
                r.choices[username] = choice;

                // Notify that a choice was made (without revealing which)
                broadcast(r.players, { type: 'choiceReceived', by: username, total: Object.keys(r.choices).length });

                if (Object.keys(r.choices).length === 2) {
                    const usernames = Object.keys(r.choices);
                    const [u1, u2] = usernames;
                    const c1 = r.choices[u1];
                    const c2 = r.choices[u2];
                    const winner = decideWinner(c1, c2);
                    let winnerName = 'Draw';
                    if (winner === 1) winnerName = u1;
                    if (winner === 2) winnerName = u2;

                    broadcast(r.players, {
                        type: 'result',
                        choices: { [u1]: c1, [u2]: c2 },
                        winner: winnerName,
                    });

                    // reset for next round
                    r.choices = {};
                }
                break;
            }
            default:
                console.log('Unknown message type:', data.type);
        }
    });

    WebSocket.on('close', () => {
        console.log('A user disconnected');
        for (const roomCode in rooms) {
            const room = rooms[roomCode];
            // Remove the disconnected player from the room's players array
            room.players = room.players.filter((player) => player !== WebSocket);
            if (room.usernames) {
                room.usernames.delete(WebSocket);
            }

            // If the room is not persistent and no players are left, delete the room
            if (!room.persistent && room.players.length === 0) {
                delete rooms[roomCode];
                console.log(`Room ${roomCode} deleted`);
            } else {
                broadcast(room.players, { type: 'playerCount', count: room.players.length });
            }
        }
    });
});

function generateRoomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function decideWinner(choice1, choice2) {
    if (choice1 === choice2) return 0; // draw
    if (
        (choice1 === 'rock' && choice2 === 'scissors') ||
        (choice1 === 'paper' && choice2 === 'rock') ||
        (choice1 === 'scissors' && choice2 === 'paper')
    ) {
        return 1; // first wins
    }
    return 2; // second wins
}

function broadcast(clients, message) {
    clients.forEach((client) => {
        client.send(JSON.stringify(message));
    });
}

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
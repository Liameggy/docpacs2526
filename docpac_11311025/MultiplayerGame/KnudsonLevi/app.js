const express = require('express');
const app = express();
const socketio = require('socket.io');
const session = require('express-session');
const activeRooms = new Map();
let nextRoomId = 1;

app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('game.ejs');
});

const server = app.listen(3000, () => {
    console.log(`Server is running at http://localhost:3000`);
});

const io = socketio(server);

function checkWin(board) {
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    return winConditions.some(condition => {
        const [a, b, c] = condition;
        return board[a] && board[a] === board[b] && board[a] === board[c];
    });
}

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('joinGame', (data) => {
        if (!socket.username && (data.username === undefined || data.username === null)) {
            socket.emit('requestUsername');
            return;
        } else if (!socket.username) {
            let username = (typeof data.username === 'string') ? data.username.trim() : '';
            socket.username = username;
        }
        if (!socket.username || socket.username === '' || socket.username.length > 20) {
            socket.emit('requestUsername', 'Username is invalid or already taken.');
            return;
        }
        console.log(`${socket.username} has joined the game.`);
        if (activeRooms.size === 0 || [...activeRooms.values()].every(room => room.players.length === 2)) {
            const roomId = `room-${nextRoomId++}`;
            activeRooms.set(roomId, { players: [socket.username], board: Array(9).fill(null), turn: 'X' });
            socket.join(roomId);
            socket.emit('roomJoined', { roomId, symbol: 'X' });
            socket.roomId = roomId;
            socket.symbol = 'X';
        } else {
            for (let [roomId, room] of activeRooms) {
                if (room.players.length === 1) {
                    room.players.push(socket.username);
                    socket.join(roomId);
                    socket.emit('roomJoined', {roomId, symbol: 'O'});
                    const startGameData = {players: activeRooms.get(roomId).players, turn: room.turn};
                    console.log(`Starting game in room ${roomId} with players:`, startGameData.players);
                    io.to(roomId).emit('startGame', startGameData);
                    socket.roomId = roomId;
                    socket.symbol = 'O';
                    break;
                }
            }
        }
        console.log(activeRooms);
    });
    socket.on('makeMove', (data) => {
        console.log(`${socket.username} made a move at position ${data.position} in room ${socket.roomId}`);
        const roomId = socket.roomId;
        const position = data.position;
        const room = activeRooms.get(roomId);
        if (room.board[position] === null && room.turn === socket.symbol) {
            room.board[position] = room.turn;
            console.log(room.turn)
            console.log(`Board updated in room ${roomId}:`, room.board);
            room.turn = room.turn === 'X' ? 'O' : 'X';
            io.to(roomId).emit('updateBoard', {board: room.board, turn: room.turn});
        }
        if (checkWin(room.board)) {
            console.log(`Game over in room ${roomId}! Winner: ${socket.username}`);
            io.to(roomId).emit('gameOver', {winner: socket.symbol});
            // remove all sockets from the room and clear their room-related state
            const socketsInRoom = io.sockets.adapter.rooms.get(roomId);
            if (socketsInRoom) {
                for (const sid of socketsInRoom) {
                    const s = io.sockets.sockets.get(sid);
                    if (s) {
                        s.leave(roomId);
                        delete s.roomId;
                        delete s.symbol;
                    }
                }
            }
            activeRooms.delete(roomId);
        } else if (room.board.every(cell => cell !== null)) {
            io.to(roomId).emit('gameOver', {winner: null});
            const socketsInRoom = io.sockets.adapter.rooms.get(roomId);
            if (socketsInRoom) {
                for (const sid of socketsInRoom) {
                    const s = io.sockets.sockets.get(sid);
                    if (s) {
                        s.leave(roomId);
                        delete s.roomId;
                        delete s.symbol;
                    }
                }
            }
            activeRooms.delete(roomId);
        }
        console.log(activeRooms);
    });
    socket.on('disconnect', () => {
        activeRooms.forEach((room, roomId) => {
            room.players = room.players.filter(player => player !== socket.username);
            if (room.players.length === 0) {
                activeRooms.delete(roomId);
            } else if (room.players.length === 1) {
                io.to(roomId).emit('gameOver', {winner: undefined});
                activeRooms.delete(roomId);
                socket.leave(roomId);
            }
        });
        console.log('User disconnected');
    });
});
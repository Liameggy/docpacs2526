const express = require('express');
const ws = require('ws');
const http = require('http');
const app = express();
const server = http.createServer(app);
const wss = new ws.WebSocketServer({ server });

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/game', (req, res) => {
  res.render('game', { user: req.query.user }); 
});

server.listen(3000, () => {
  console.log(`Server running at http://localhost:3000`);
});

let waitingPlayer = null;

wss.on('connection', (socket) => {
  console.log('player joined');

  // this connects to the waiting player or makes current player wait
  if (waitingPlayer) {
    const room = { p1: waitingPlayer, p2: socket };
    waitingPlayer.room = room;
    socket.room = room;

    waitingPlayer.send(JSON.stringify({ type: 'message', text: 'Player found! Make your move' }));
    socket.send(JSON.stringify({ type: 'message', text: 'Player found! Make your move' }));

    waitingPlayer = null;
  } else {
    waitingPlayer = socket;
    socket.send(JSON.stringify({ type: 'message', text: 'Waiting for player' }));
  }

// send and receive moves
  socket.on('message', (data) => {
    const msg = JSON.parse(data);
    if (msg.type === 'move' && socket.room) {
      socket.move = msg.move;
      checkMoves(socket.room);
    }
  });

 // player disconnects
  socket.on('close', () => {
    console.log('player left');
    if (waitingPlayer === socket) waitingPlayer = null;
    if (socket.room) {
      const opp = socket.room.p1 === socket ? socket.room.p2 : socket.room.p1;
      if (opp.readyState === ws.OPEN) {
        opp.send(JSON.stringify({ type: 'message', text: 'Player left. Waiting for a new player' }));

        // takes player out of the room and makes them wait
        opp.room = null;
        opp.move = null;
        waitingPlayer = opp;
      }
    }
  });
});

// seeing if both players made moves
function checkMoves(room) {
    const { p1, p2 } = room;
    if (!p1.move || !p2.move) return;

    const result = getResult(p1.move, p2.move);

    // the results from each player's pov
    const povP1 = result === "It's a draw!" ? 'draw' : (result === 'Player 1 wins!' ? 'win' : 'lose');
    const povP2 = result === "It's a draw!" ? 'draw' : (result === 'Player 2 wins!' ? 'win' : 'lose');

    // send one message to each player with their perspective
    if (p1.readyState === ws.WebSocket.OPEN) {
        p1.send(JSON.stringify({
            type: 'result',
            yourMove: p1.move,
            oppMove: p2.move,
            outcome: povP1
        }));
    }

    if (p2.readyState === ws.WebSocket.OPEN) {
        p2.send(JSON.stringify({
            type: 'result',
            yourMove: p2.move,
            oppMove: p1.move,
            outcome: povP2
        }));
    }

    // reset for next round
    p1.move = null;
    p2.move = null;
}

// picks winner
function getResult(move1, move2) {
  if (move1 === move2) return "It's a draw!";
  if (
    (move1 === 'rock' && move2 === 'scissors') ||
    (move1 === 'scissors' && move2 === 'paper') ||
    (move1 === 'paper' && move2 === 'rock')
  ) {
    return "Player 1 wins!";
  }
  return "Player 2 wins!";
}

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

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/profile', (req, res) => { 
  res.render('profile');
});

server.listen(3000, () => {
  console.log(`Server running at http://localhost:3000`);
});

let waitingPlayer = null;

wss.on('connection', (socket) => {
  console.log('player joined');

  // send and receive moves
  socket.on('message', (data) => {
    const msg = JSON.parse(data);

    // when user sends their name
    if (msg.type === 'setName') {
      socket.name = msg.name;

      // // this connects to the waiting player or makes current player wait
      if (waitingPlayer) {
        const room = { p1: waitingPlayer, p2: socket };
        waitingPlayer.room = room;
        socket.room = room;

        const p1Name = waitingPlayer.name || 'Player 1';
        const p2Name = socket.name || 'Player 2';

        waitingPlayer.send(JSON.stringify({ type: 'message', text: `You're now playing against ${p2Name}!` }));
        socket.send(JSON.stringify({ type: 'message', text: `You're now playing against ${p1Name}!` }));

        waitingPlayer = null;
      } else {
        waitingPlayer = socket;
        socket.send(JSON.stringify({ type: 'message', text: 'Waiting for another player...' }));
      }
      return;
    }

    // handle moves
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
        opp.send(JSON.stringify({ type: 'message', text: `${socket.name || 'Player'} left. Waiting for a new player...` }));

        // reset
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
  const p1Name = p1.name || 'Player 1';
  const p2Name = p2.name || 'Player 2';

  // the results from each player's pov
  const povP1 = result === "draw" ? "draw" : (result === "p1" ? "win" : "lose");
  const povP2 = result === "draw" ? "draw" : (result === "p2" ? "win" : "lose");

   // send one message to each player with their perspective
  if (p1.readyState === ws.WebSocket.OPEN) {
    p1.send(JSON.stringify({
      type: 'result',
      yourMove: p1.move,
      oppMove: p2.move,
      outcome: povP1,
      oppName: p2Name
    }));
  }

  if (p2.readyState === ws.WebSocket.OPEN) {
    p2.send(JSON.stringify({
      type: 'result',
      yourMove: p2.move,
      oppMove: p1.move,
      outcome: povP2,
      oppName: p1Name
    }));
  }

  p1.move = null;
  p2.move = null;
}


// picks winner
function getResult(move1, move2) {
  if (move1 === move2) return "draw";
  if (
    (move1 === 'rock' && move2 === 'scissors') ||
    (move1 === 'scissors' && move2 === 'paper') ||
    (move1 === 'paper' && move2 === 'rock')
  ) {
    return "p1";
  }
  return "p2";
}

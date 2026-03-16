let playerMark = '';
let currentTurn = 'X';
let gameActive = false;
let isReady = false;
const socket = io();

function updateBoard(board) {
    for (let i = 0; i < 9; i++) {
        const tile = document.getElementById(i.toString());
        tile.innerHTML = ''; // Clear the tile
        if (board[i]) {
            const img = document.createElement('img');
            img.src = board[i] === 'X' ? 'images/x.png' : 'images/o.png';
            tile.appendChild(img);
        }
    }
}

function showPlayButton(show, isPlayAgain = false) {
    const playButton = document.getElementById('play-button');
    if (show) {
        playButton.style.display = 'block';
        if (isReady) {
            playButton.textContent = 'Waiting for opponent...';
        } else {
            playButton.textContent = isPlayAgain ? 'Play Again' : 'Play';
        }
        playButton.disabled = isReady;
    } else {
        playButton.style.display = 'none';
    }
}

function updateGameStatus(message) {
    document.getElementById('game-status').textContent = message;
}

function handleClick(position) {
    if (gameActive && currentTurn === playerMark) {
        socket.emit('makeMove', { position: position });
    }
}

function play() {
    if (!isReady) {
        isReady = true;
        socket.emit('playerReady');
        showPlayButton(true);
    }
}

function playAgain() {
    if (!isReady) {
        isReady = true;
        socket.emit('playAgain');
        showPlayButton(true);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Set up click handlers for tiles
    for (let i = 0; i < 9; i++) {
        const tile = document.getElementById(i.toString());
        tile.addEventListener('click', () => handleClick(i));
    }

    // Reset state on page load
    gameActive = false;
    isReady = false;
    showPlayButton(true);

    // Socket event handlers
    socket.on('playerAssigned', (data) => {
        playerMark = data.mark;
        updateGameStatus(`You are player ${data.mark}`);
        if (!data.gameInProgress) {
            showPlayButton(true);
        }
    });

    socket.on('waitingForOpponent', () => {
        updateGameStatus('Waiting for opponent to join...');
        gameActive = false;
        isReady = false;
        showPlayButton(true);
    });

    socket.on('opponentJoined', () => {
        updateGameStatus('Opponent joined! Click Play when ready.');
        isReady = false;
        showPlayButton(true);
    });

    socket.on('startGame', (gameState) => {
        gameActive = true;
        currentTurn = gameState.currentTurn;
        updateBoard(gameState.board);
        updateGameStatus(currentTurn === playerMark ? 'Your turn!' : 'Opponent\'s turn');
        showPlayButton(false);
        isReady = false;
    });

    socket.on('gameUpdate', (gameState) => {
        currentTurn = gameState.currentTurn;
        updateBoard(gameState.board);
        
        if (gameState.gameStatus.isGameOver) {
            if (gameState.gameStatus.winner === 'draw') {
                updateGameStatus("It's a draw! Click Play Again to start a new game.");
            } else {
                updateGameStatus(gameState.gameStatus.winner === playerMark ? 
                    'You won! Click Play Again to start a new game.' : 
                    'You lost! Click Play Again to start a new game.');
            }
            gameActive = false;
            isReady = false;
            showPlayButton(true, true); // Show "Play Again" text
        } else {
            updateGameStatus(currentTurn === playerMark ? 'Your turn!' : 'Opponent\'s turn');
        }
    });

    socket.on('waitingForPlayAgain', () => {
        updateGameStatus('Waiting for opponent to play again...');
    });

    socket.on('roomFull', () => {
        updateGameStatus('Game room is full. Please try again later.');
        gameActive = false;
        showPlayButton(false);
    });

    socket.on('opponentLeft', () => {
        updateGameStatus('Opponent left the game. Waiting for new opponent...');
        updateBoard(Array(9).fill(''));
        gameActive = false;
        isReady = false;
        showPlayButton(true);
    });
});
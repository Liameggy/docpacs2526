//dom elements
document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    let playerSymbol = null;
    let gameActive = false;
    let isHost = false;


    // Get game code from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const gameCode = urlParams.get('code');

    // DOM elements
    const cells = document.querySelectorAll('.cell');
    const statusDiv = document.getElementById('status');
    const resetButton = document.getElementById('reset');
    const leaveGameButton = document.getElementById('leaveGame');
    const closeLobbyButton = document.getElementById('closeLobby'); 


    //join game room if game code is present in URL
    if (gameCode) {
        socket.emit('joinGameCode', gameCode);
    }

    window.addEventListener('beforeunload', (event) => {
        if (gameActive && playerSymbol) {
            // This will trigger the same logic as leaving the game
            socket.emit('leaveGame');
        }
    });
    
    // Also handle the popstate event (back/forward buttons)
    window.addEventListener('popstate', (event) => {
        if (gameActive && playerSymbol) {
            socket.emit('leaveGame');
        }
    });

    // Handle cell clicks
    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            console.log('Cell clicked!'); // Add this first
            console.log('gameActive:', gameActive); // Check this value
            console.log('cell.textContent:', cell.textContent); // Check if empty
            console.log('playerSymbol:', playerSymbol); // Check if assigned
            if (gameActive && cell.textContent === '' && playerSymbol) {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                socket.emit('makeMove', { row, col });
            }
        });
    });


    // Handle leave game button click
    leaveGameButton.addEventListener('click', () => {
        socket.emit('leaveGame');

    });
    
    closeLobbyButton.addEventListener('click', () => {
        socket.emit('closeLobby');

    });

    // Handle reset button click
    resetButton.addEventListener('click', () => {
        console.log('Reset button clicked!');
        console.log('Socket connected:', socket.connected);
        console.log('Player symbol:', playerSymbol); 
        console.log('Game active:', gameActive);
        socket.emit('resetGame');
    });

    function updateButtonVisibility(gameEnded = false) {
        if (gameEnded) {
            // Game ended - show both buttons
            leaveGameButton.style.display = 'block';
            if (isHost) {
                closeLobbyButton.style.display = 'block';
            }
        } else {
            // Game active or waiting - hide buttons
            leaveGameButton.style.display = 'none';
            closeLobbyButton.style.display = 'none';
        }
    }


    // Handle server events
    socket.on('playerAssigned', (data) => {
        playerSymbol = data.symbol;
        isHost = data.host; // Add this line
        gameActive = true;

        // Hide buttons when game starts
        updateButtonVisibility(false);
        
        // Show/hide close lobby button based on host status
        if (isHost) {
            closeLobbyButton.style.display = 'block';
        }
        
        if (statusDiv) {
            const hostText = isHost ? ' (Host)' : '';
            statusDiv.textContent = `You are player ${playerSymbol}${hostText}. Game code: ${data.gameCode}`;
        }
    });

    socket.on('hostTransferred', (data) => {
        isHost = data.newHost;
        closeLobbyButton.style.display = 'block';
        if (statusDiv) {
            statusDiv.textContent += ' - You are now the host!';
        }
    });

    socket.on('updateGame', (gameState) => {
        if (statusDiv) {
            if (gameState.winner === 'Draw') {
                statusDiv.textContent = 'The game is a draw!';
            } else if (gameState.winner) {
                statusDiv.textContent = `Player ${gameState.winner} wins!`;
            } else {
                statusDiv.textContent = `Player ${gameState.currentPlayer}'s turn.`;
            }
        } else {
            console.error('Element with id "status" not found in the DOM.');
        }
    
        // Update the board
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            cell.textContent = gameState.board[row][col] || '';
        });
    
        // Show the reset button if there is a winner or a draw
        if (gameState.winner) {
            updateButtonVisibility(true)
            resetButton.style.display = 'block';
        }
    });

    socket.on('statusUpdate', (data) => {
        if (statusDiv) {
            statusDiv.textContent = data.message;
        }
        
        // Disable/enable game interaction based on canPlay
        gameActive = data.canPlay;
        
        // You could also update UI elements based on player count
        console.log(`Game status: ${data.message}, Can play: ${data.canPlay}, Players: ${data.playerCount}`);
    });
    
    socket.on('playerLeft', (data) => {
        if (statusDiv) {
            statusDiv.textContent = data.message;
        }
        gameActive = false; // Disable gameplay until another player joins
    });
    


    socket.on('gameReset', () => {
        gameActive = true; // Reset the game state
        if (statusDiv) {
            statusDiv.textContent = 'Game reset. Waiting for moves...';
        } else {
            console.error('Element with id "status" not found in the DOM.');
        }
        cells.forEach(cell => (cell.textContent = '')); // Clear the game board
        resetButton.style.display = 'none'; // Hide the reset button for all players
        updateButtonVisibility(false); // Hide leave/close buttons during active game
    });
    
    socket.on('redirectToIndex', () => {
        window.location.href = '/';
    });
    
    socket.on('lobbyClosed', () => {
        alert('The lobby has been closed by the host.');
        window.location.href = '/';
    });

    socket.on('error', (message) => {
        console.log('Error received:', message);
        if (statusDiv) {
            statusDiv.textContent = message;
        }
    });
    
    });





console.log('Connected to the game server.');


const { Server } = require('socket.io');

module.exports = (server) => {
    const io = new Server(server);

    let turnState = 'player1'; // Initial turn state

    // Track player connections
    let players = { player1: null, player2: null };

    let maxHealth = 300;
    let maxEnergy = 300;

    // Player stats
    let gameState = {
        maxHealth,
        maxEnergy,
        turnState,
        player1: { health: maxHealth, energy: maxEnergy / 2 },
        player2: { health: maxHealth, energy: maxEnergy / 2 }
    };

    // Define attack types
    const attacks = {
        basic: { damage: 20, energyChange: 20 },
        skill: { damage: 50, energyChange: -75 },
        ultimate: { damage: 100, energyChange: -150 },
    };

    io.on('connection', (socket) => {
        // Assign player roles
        if (!players.player1) {
            players.player1 = socket.id;
            socket.emit('playerAssignment', 'player1');
        } else if (!players.player2) {
            players.player2 = socket.id;
            socket.emit('playerAssignment', 'player2');
        } else {
            socket.emit('playerAssignment', 'spectator');
        }

        // Emit an event when both players are connected
        if (players.player1 && players.player2) {
            io.emit('updateGameState', { gameState });
        }

        // Handle attack events
        socket.on('attack', (type) => {
            let attacker, target;
            if (gameState.turnState === 'player1') { 
                attacker = gameState.player1;
                target = gameState.player2;
            } else {
                attacker = gameState.player2;
                target = gameState.player1;
            }

            console.log(`Attack type: ${type} by ${JSON.stringify(attacker)}`);

            const attack = attacks[type];

            target.health -= attack.damage;
            attacker.energy += attack.energyChange;

            // Ensure energy does not exceed maxEnergy
            if (attacker.energy > maxEnergy) {
                attacker.energy = maxEnergy;
            }

            // Ensure health does not drop below 0
            if (target.health < 0) {
                target.health = 0;
            }

            // Check if the target player is defeated
            if (target.health <= 0) {
                io.emit('gameOver', { winner: attacker });
                return;
            }
        
            gameState.turnState = gameState.turnState === 'player1' ? 'player2' : 'player1';
            // Broadcast the updated game state to all players
            io.emit('updateGameState', { gameState });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            if (players.player1 === socket.id) {
                players.player1 = null;
            } else if (players.player2 === socket.id) {
                players.player2 = null;
            }
            io.emit('playerDisconnected', socket.id);
        });
    });
};
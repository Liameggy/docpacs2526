// onConnect.js - Handles Socket.IO connection and basic setup
let socket;
let currentRoom = null;
let currentUsername = null;
let messagesSent = 0;
let spellsCast = 0;
let usersInRoom = 1;

// Initialize Socket.IO connection
function initializeSocket() {
    socket = io();
    
    // Connection event handlers
    socket.on('connect', () => {
        console.log('🎭 Connected to the magical realm!');
    });
    
    socket.on('disconnect', () => {
        console.log('👻 Disconnected from the magical realm');
    });
    
    // Room-related events
    socket.on('room-joined', (data) => {
        showMagicInterface();
        addMagicalMessage('system', `🎭 ${data.message}`, data.timestamp);
        document.getElementById('current-room').textContent = currentRoom;
    });
    
    socket.on('user-joined', (data) => {
        addMagicalMessage('system', `✨ ${data.message}`, data.timestamp);
        usersInRoom++;
        updateStats();
    });
    
    socket.on('user-left', (data) => {
        addMagicalMessage('system', `👻 ${data.message}`, data.timestamp);
        usersInRoom = Math.max(1, usersInRoom - 1);
        updateStats();
    });
    
    // Message events
    socket.on('receive-message', (data) => {
        const messageType = data.socketId === socket.id ? 'own' : 'other';
        addMagicalMessage(messageType, `${data.username}: ${data.message}`, data.timestamp);
    });
    
    // Custom event handling
    socket.on('receive-custom-event', (data) => {
        addMagicalMessage('spell', `🪄 ${data.username} ${data.eventData}`, data.timestamp);
    });
}

// Helper functions
function showMagicInterface() {
    document.getElementById('join-section').style.display = 'none';
    document.getElementById('room-info').style.display = 'block';
    document.getElementById('magic-section').style.display = 'block';
    document.getElementById('messages').innerHTML = '<div style="text-align: center; color: #007bff; font-weight: bold;">🎭 The magic begins now! ✨</div>';
}

function leaveRoom() {
    document.getElementById('join-section').style.display = 'block';
    document.getElementById('room-info').style.display = 'none';
    document.getElementById('magic-section').style.display = 'none';
    document.getElementById('messages').innerHTML = '';
    currentRoom = null;
    currentUsername = null;
    document.getElementById('username-input').value = '';
    document.getElementById('room-input').value = '';
    resetStats();
}

function updateStats() {
    document.getElementById('messages-count').textContent = messagesSent;
    document.getElementById('spells-count').textContent = spellsCast;
    document.getElementById('users-count').textContent = usersInRoom;
}

function resetStats() {
    messagesSent = 0;
    spellsCast = 0;
    usersInRoom = 1;
    updateStats();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeSocket();
});

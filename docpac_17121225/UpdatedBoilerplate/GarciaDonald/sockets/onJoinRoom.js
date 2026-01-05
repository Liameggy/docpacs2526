// onJoinRoom.js - Handles room joining and leaving functionality

// DOM Event Listeners for room management
document.addEventListener('DOMContentLoaded', () => {
    const joinForm = document.getElementById('join-form');
    const leaveRoomBtn = document.getElementById('leave-room-btn');
    
    // Join room form handler
    joinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username-input').value.trim();
        const roomName = document.getElementById('room-input').value.trim();
        
        if (username && roomName) {
            joinMagicRoom(username, roomName);
        }
    });
    
    // Leave room button handler
    leaveRoomBtn.addEventListener('click', () => {
        if (currentRoom) {
            leaveMagicRoom();
        }
    });
});

// Room management functions
function joinMagicRoom(username, roomName) {
    currentUsername = username;
    currentRoom = roomName;
    
    console.log(`🎭 ${username} is joining magical room: ${roomName}`);
    
    socket.emit('join-room', {
        username: username,
        roomName: roomName
    });
}

function leaveMagicRoom() {
    console.log(`👻 ${currentUsername} is leaving room: ${currentRoom}`);
    
    socket.emit('leave-room');
    leaveRoom();
}

// Room validation
function validateRoomInput(username, roomName) {
    if (!username || username.length < 2) {
        alert('🎭 Please enter a username with at least 2 characters!');
        return false;
    }
    
    if (!roomName || roomName.length < 2) {
        alert('🏠 Please enter a room name with at least 2 characters!');
        return false;
    }
    
    // Check for special characters that might cause issues
    const validPattern = /^[a-zA-Z0-9-_\s]+$/;
    if (!validPattern.test(roomName)) {
        alert('🏠 Room name can only contain letters, numbers, dashes, underscores, and spaces!');
        return false;
    }
    
    return true;
}

// Enhanced join function with validation
function joinMagicRoomWithValidation(username, roomName) {
    if (validateRoomInput(username, roomName)) {
        joinMagicRoom(username, roomName);
    }
}

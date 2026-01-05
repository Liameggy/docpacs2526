const rooms = {}

const userRoomMap = {}

function createRoom(roomId, roomName = '', maxUsers = 50) {
    // Check if room already exists
    if (rooms[roomId]) {
        return rooms[roomId];
    }
    
    // Create the room object
    rooms[roomId] = {
        id: roomId,
        name: roomName,
        users: new Set(), 
        createdAt: new Date(),
        maxUsers: maxUsers
    };
    
    return rooms[roomId];
}

function addUserToRoom(userId, roomId) {
    const room = rooms[roomId];
    if (!room) {
        return false; // Room does not exist
    }

    if (userRoomMap[userId] && userRoomMap[userId] !== roomId) {
        return false; // User is already in another room
    }
    
    if (room.users.size >= room.maxUsers) {
        return false; // Room is full
    }
    
    room.users.add(userId);
    userRoomMap[userId] = roomId;
    return true;
}

function removeUserFromRoom(userId) {
    const roomId = userRoomMap[userId];
    if (!roomId) {
        return false; // User is not in any room
    }
    
    const room = rooms[roomId];
    if (room) {
        room.users.delete(userId);
    }
    
    delete userRoomMap[userId];
    return true;
}

function getRoomById(roomId) {
    return rooms[roomId] || null;
}

function getUserRoom(userId) {
    const roomId = userRoomMap[userId];
    return roomId ? rooms[roomId] : null;
}

module.exports = {
    createRoom,
    addUserToRoom,
    removeUserFromRoom,
    getRoomById,
    getUserRoom
};

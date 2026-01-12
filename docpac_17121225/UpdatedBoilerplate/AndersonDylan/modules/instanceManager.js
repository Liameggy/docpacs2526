// modules/instanceManager.js

// In-memory room store
// Map<roomName, { name: string, members: Map<userId, { userId, username }> }>
const rooms = new Map();

// ---- Room initialization ----
const PUBLIC_ROOM = 'public';

// Create public room on startup
createRoom(PUBLIC_ROOM);

// ---- Core functions ----

function createRoom(roomName) {
    if (rooms.has(roomName)) {
        return null; // room already exists
    }

    const room = {
        name: roomName,
        members: new Map()
    };

    rooms.set(roomName, room);
    return room;
}

function addUserToRoom(userId, username, roomName) {
    // Ensure room exists
    let room = rooms.get(roomName);
    if (!room) {
        room = createRoom(roomName);
    }

    // Prevent duplicate users
    if (room.members.has(userId)) {
        return room; // user already in room
    }

    room.members.set(userId, {
        userId,
        username
    });

    return room;
}

function removeUserFromRoom(userId, roomName) {
    const room = rooms.get(roomName);
    if (!room) {
        return false;
    }

    if (!room.members.has(userId)) {
        return false;
    }

    room.members.delete(userId);

    // Clean up empty rooms (except public)
    if (
        room.members.size === 0 &&
        roomName !== PUBLIC_ROOM
    ) {
        rooms.delete(roomName);
    }

    return true;
}

function removeUserFromAllRooms(userId) {
    const removedFrom = [];

    for (const roomName of rooms.keys()) {
        const removed = removeUserFromRoom(userId, roomName);
        if (removed) {
            removedFrom.push(roomName);
        }
    }

    return removedFrom;
}

function getRooms() {
    return Array.from(rooms.values()).map(room => ({
        name: room.name,
        memberCount: room.members.size
    }));
}

function getRoomMembers(roomName) {
    const room = rooms.get(roomName);
    if (!room) {
        return [];
    }

    return Array.from(room.members.values());
}


// ---- Exports ----
module.exports = {
    createRoom,
    addUserToRoom,
    removeUserFromRoom,
    removeUserFromAllRooms,
    getRooms,
    getRoomMembers
};

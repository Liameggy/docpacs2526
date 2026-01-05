// Manage multiple "rooms" or "game instances" 
class InstanceManager {
    constructor(io) {
        this.io = io;
        this.instances = new Map(); // Map of instanceId to Set of socket IDs
    }

    createInstance(instanceId) {
        if (!this.instances.has(instanceId)) {
            this.instances.set(instanceId, new Set());
        }
    }

    joinInstance(instanceId, socket) {
        this.createInstance(instanceId);
        this.instances.get(instanceId).add(socket.id);
        socket.join(instanceId);
    }

    leaveInstance(instanceId, socket) {
        if (this.instances.has(instanceId)) {
            this.instances.get(instanceId).delete(socket.id);
            socket.leave(instanceId);
            if (this.instances.get(instanceId).size === 0) {
                this.instances.delete(instanceId); // Clean up empty instances
            }
        }
    }

    broadcastToInstance(instanceId, event, data) {
        if (this.instances.has(instanceId)) {
            this.io.to(instanceId).emit(event, data);
        }
    }
}
const _InstanceManager = InstanceManager;
export { _InstanceManager as InstanceManager };

// Track which users are connected to which instances
class UserInstanceTracker {
    constructor() {
        this.userInstances = new Map(); // Map of userId to instanceId
    }

    setUserInstance(userId, instanceId) {
        this.userInstances.set(userId, instanceId);
    }

    getUserInstance(userId) {
        return this.userInstances.get(userId);
    }

    removeUserInstance(userId) {
        this.userInstances.delete(userId);
    }
}
const _UserInstanceTracker = UserInstanceTracker;
export { _UserInstanceTracker as UserInstanceTracker };

// Helper functions (create rooms, add users to rooms, remove users from rooms, retrieve data from specific rooms)
function createRoom(io, roomId) {
    io.of('/').adapter.rooms.set(roomId, new Set());
}
const _createRoom = createRoom;
export { _createRoom as createRoom };
function addUserToRoom(io, roomId, socket) {
    if (!io.of('/').adapter.rooms.has(roomId)) {
        createRoom(io, roomId);
    }
    io.of('/').adapter.rooms.get(roomId).add(socket.id);
    socket.join(roomId);
}
const _addUserToRoom = addUserToRoom;
export { _addUserToRoom as addUserToRoom };
function removeUserFromRoom(io, roomId, socket) {
    if (io.of('/').adapter.rooms.has(roomId)) {
        io.of('/').adapter.rooms.get(roomId).delete(socket.id);
        socket.leave(roomId);
        if (io.of('/').adapter.rooms.get(roomId).size === 0) {
            io.of('/').adapter.rooms.delete(roomId); // Clean up empty rooms
        }
    }
}
const _removeUserFromRoom = removeUserFromRoom;
export { _removeUserFromRoom as removeUserFromRoom };
function getUsersInRoom(io, roomId) {
    if (io.of('/').adapter.rooms.has(roomId)) {
        return Array.from(io.of('/').adapter.rooms.get(roomId));
    }
    return [];
}
const _getUsersInRoom = getUsersInRoom;
export { _getUsersInRoom as getUsersInRoom };
function getRoomData(io, roomId) {
    if (io.of('/').adapter.rooms.has(roomId)) {
        return {
            id: roomId,
            users: Array.from(io.of('/').adapter.rooms.get(roomId))
        };
    }
    return null;
}
const _getRoomData = getRoomData;
export { _getRoomData as getRoomData };


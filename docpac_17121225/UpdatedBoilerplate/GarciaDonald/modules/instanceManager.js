class InstanceManager {
    constructor(logger) {
        this.logger = logger;
        this.rooms = new Map(); // Store room data
        this.userRooms = new Map(); // Track which users are in which rooms
        this.roomUsers = new Map(); // Track which users are in each room
    }

    // Create a new room
    createRoom(roomId, options = {}) {
        if (this.rooms.has(roomId)) {
            this.logger.warn(`🏠 Room ${roomId} already exists`);
            return this.rooms.get(roomId);
        }

        const room = {
            id: roomId,
            name: options.name || roomId,
            type: options.type || 'chat', // chat, game, study, etc.
            createdAt: new Date(),
            createdBy: options.createdBy || null,
            maxUsers: options.maxUsers || 50,
            isPrivate: options.isPrivate || false,
            password: options.password || null,
            settings: options.settings || {},
            metadata: options.metadata || {},
            userCount: 0,
            isActive: true
        };

        this.rooms.set(roomId, room);
        this.roomUsers.set(roomId, new Set());

        this.logger.info(`🏠 Created room: ${roomId} (${room.name})`);
        return room;
    }

    // Add user to a room
    addUserToRoom(userId, roomId, userInfo = {}) {
        // Create room if it doesn't exist
        if (!this.rooms.has(roomId)) {
            this.createRoom(roomId);
        }

        const room = this.rooms.get(roomId);
        
        // Check if room is full
        if (room.userCount >= room.maxUsers) {
            this.logger.warn(`🏠 Room ${roomId} is full (${room.maxUsers} users)`);
            return { success: false, reason: 'Room is full' };
        }

        // Remove user from current room if in one
        this.removeUserFromCurrentRoom(userId);

        // Add user to new room
        this.roomUsers.get(roomId).add(userId);
        this.userRooms.set(userId, {
            roomId: roomId,
            joinedAt: new Date(),
            userInfo: userInfo
        });

        // Update room user count
        room.userCount = this.roomUsers.get(roomId).size;
        room.lastActivity = new Date();

        this.logger.info(`👤 Added user ${userId} to room ${roomId}`);
        return { success: true, room: room };
    }

    // Remove user from a specific room
    removeUserFromRoom(userId, roomId) {
        if (!this.rooms.has(roomId)) {
            return { success: false, reason: 'Room does not exist' };
        }

        const roomUserSet = this.roomUsers.get(roomId);
        if (roomUserSet && roomUserSet.has(userId)) {
            roomUserSet.delete(userId);
            
            // Update room user count
            const room = this.rooms.get(roomId);
            room.userCount = roomUserSet.size;
            room.lastActivity = new Date();

            // Clean up empty rooms (optional)
            if (room.userCount === 0 && !room.isPersistent) {
                this.deleteRoom(roomId);
            }
        }

        // Remove from user's current room tracking
        if (this.userRooms.has(userId)) {
            const userRoom = this.userRooms.get(userId);
            if (userRoom.roomId === roomId) {
                this.userRooms.delete(userId);
            }
        }

        this.logger.info(`👤 Removed user ${userId} from room ${roomId}`);
        return { success: true };
    }

    // Remove user from their current room (helper function)
    removeUserFromCurrentRoom(userId) {
        if (this.userRooms.has(userId)) {
            const currentRoom = this.userRooms.get(userId);
            this.removeUserFromRoom(userId, currentRoom.roomId);
        }
    }

    // Get all data for a specific room
    getRoomData(roomId) {
        if (!this.rooms.has(roomId)) {
            return null;
        }

        const room = this.rooms.get(roomId);
        const users = Array.from(this.roomUsers.get(roomId) || []);
        
        return {
            ...room,
            users: users,
            userDetails: users.map(userId => {
                const userRoom = this.userRooms.get(userId);
                return {
                    userId: userId,
                    joinedAt: userRoom?.joinedAt,
                    userInfo: userRoom?.userInfo || {}
                };
            })
        };
    }

    // Get users in a specific room
    getUsersInRoom(roomId) {
        const roomUserSet = this.roomUsers.get(roomId);
        return roomUserSet ? Array.from(roomUserSet) : [];
    }

    // Get which room a user is in
    getUserRoom(userId) {
        return this.userRooms.get(userId) || null;
    }

    // Get all rooms
    getAllRooms() {
        return Array.from(this.rooms.values());
    }

    // Get active rooms (with users)
    getActiveRooms() {
        return this.getAllRooms().filter(room => room.userCount > 0);
    }

    // Delete a room
    deleteRoom(roomId) {
        if (!this.rooms.has(roomId)) {
            return { success: false, reason: 'Room does not exist' };
        }

        // Remove all users from room
        const users = this.getUsersInRoom(roomId);
        users.forEach(userId => {
            this.removeUserFromRoom(userId, roomId);
        });

        // Delete room data
        this.rooms.delete(roomId);
        this.roomUsers.delete(roomId);

        this.logger.info(`🗑️ Deleted room: ${roomId}`);
        return { success: true };
    }

    // Update room settings
    updateRoomSettings(roomId, settings) {
        if (!this.rooms.has(roomId)) {
            return { success: false, reason: 'Room does not exist' };
        }

        const room = this.rooms.get(roomId);
        room.settings = { ...room.settings, ...settings };
        room.lastUpdated = new Date();

        this.logger.info(`⚙️ Updated settings for room: ${roomId}`);
        return { success: true, room: room };
    }

    // Get room statistics
    getRoomStats() {
        const rooms = this.getAllRooms();
        const totalUsers = Array.from(this.userRooms.keys()).length;

        return {
            totalRooms: rooms.length,
            activeRooms: rooms.filter(r => r.userCount > 0).length,
            totalUsers: totalUsers,
            averageUsersPerRoom: totalUsers / Math.max(rooms.length, 1),
            roomsByType: this.groupRoomsByType()
        };
    }

    // Helper: Group rooms by type
    groupRoomsByType() {
        const rooms = this.getAllRooms();
        const grouped = {};
        
        rooms.forEach(room => {
            if (!grouped[room.type]) {
                grouped[room.type] = 0;
            }
            grouped[room.type]++;
        });

        return grouped;
    }

    // Checking if the user can join the room
    canUserJoinRoom(userId, roomId, password = null) {
        if (!this.rooms.has(roomId)) {
            return { canJoin: false, reason: 'Room does not exist' };
        }

        const room = this.rooms.get(roomId);

        // Check if room is full
        if (room.userCount >= room.maxUsers) {
            return { canJoin: false, reason: 'Room is full' };
        }

        // Checking the password if room is private
        if (room.isPrivate && room.password && room.password !== password) {
            return { canJoin: false, reason: 'Invalid password' };
        }

        return { canJoin: true };
    }
}

module.exports = InstanceManager;

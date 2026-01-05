// modules/instanceManager.js
class InstanceManager {
    constructor() {
        this.connectedUsers = new Map(); // socketId -> user info
        this.userSockets = new Map();    // userId -> socketId
    }

    addUser(userId, socketId) { 
        this.connectedUsers.set(socketId, { username: userId, connectedAt: new Date().toISOString()});
        this.userSockets.set(userId, socketId);
    }
    removeUser(socketId) { 
        const userInfo = this.connectedUsers.get(socketId);
    
    if (userInfo) {
        this.connectedUsers.delete(socketId);
        this.userSockets.delete(userInfo.username);
    }
    }
    getConnectedUsers() {
        return Array.from(this.connectedUsers.values());
  }

    getUserBySocket(socketId) {
       return this.connectedUsers.get(socketId);
   }

    getSocketByUser(userId) {
       return this.userSockets.get(userId);
    }
    }

module.exports = InstanceManager;

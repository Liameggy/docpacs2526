const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        allowRequest: (req, callback) => {
            callback(null, true); // allow all origins because I hate cors
        },
        methods: ["GET", "POST"],
        credentials: true,
    },
});

const users = new Map();

function getCurrentPlayers() {
    return Array.from(users.entries()).map(([id, user]) => ({ id, username: user.username, x: user.x, y: user.y, partyMembers: user.partyMembers || [] }));
}

io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    const username = `Player_${socket.id.substring(0, 5)}`;
    users.set(socket.id, { username, x: 9, y: 7, partyMembers: [] });
    socket.emit("connected", { id: socket.id, username });

    // Emit that the new player has connected to all other clients
    for (const [id, user] of users) {
        if (id !== socket.id) {
            io.to(id).emit("player_connected", { id: socket.id, username, x: 9, y: 7 }); // temp data
        }
    }

    socket.on("request_current_players", () => {
        socket.emit("current_players", getCurrentPlayers());
    })

    socket.on("set_party_members", (data) => {
        const user = users.get(socket.id);
        if (!user) {
            console.log("Invalid set party members request");
            socket.emit("error", "Invalid request: User not found");
            return;
        }

        if (!data || !Array.isArray(data.partyMemberIds)) {
            console.log("Invalid party member data");
            socket.emit("error", "Invalid party member data: Expected array of member IDs");
            return;
        }

        user.partyMembers = data.partyMemberIds;
        console.log(`User ${user.username} set party members:`, data.partyMemberIds);

        io.emit("player_party_updated", {
            userId: socket.id,
            username: user.username,
            partyMembers: data.partyMemberIds
        });
    })

    socket.on("move_player", (data) => {
        const user = users.get(socket.id);
        if (!user) {
            console.log("Invalid movement");
            socket.emit("error", "Invalid movement: User not found")
        }

        if (!data || typeof data.x !== "number" || typeof data.y !== "number") {
            console.log("Invalid movement data");
            socket.emit("error", "Invalid movement data");
            return;
        }

        user.x = data.x;
        user.y = data.y;
        io.emit("player_moved", { username, x: data.x, y: data.y });
    })

    socket.on("move_party_member", (data) => {
        const user = users.get(socket.id);
        if (!user) {
            console.log("Invalid party member movement");
            socket.emit("error", "Invalid movement: User not found")
        }

        console.log(`User ${user.username} moved party member ${data.memberId} to (${data.x}, ${data.y})`);
        io.emit("party_member_moved", { username: user.username, memberId: data.memberId, x: data.x, y: data.y });
    });

    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);

        // Emit to all clients that the player has disconnected
        const user = users.get(socket.id);
        io.emit("player_disconnected", { username: user.username })

        // Remove the user from the users map
        users.delete(socket.id);
    })
});

server.listen(3000, () => {
    console.log("server running at http://localhost:3000");
});
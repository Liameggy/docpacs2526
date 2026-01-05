function onChat(io, socket) {
    //handle chat messages
    socket.on('chatMessage', ({ sender, avatar, message }) => {
        io.emit('chatMessage', { sender, avatar, message, timestamp: new Date() });
    });
};

module.exports = onChat;
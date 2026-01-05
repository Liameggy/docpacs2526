//import required modules
const onChat = require('../sockets/onChat');
const onJoinRoom = require('../sockets/onJoinRoom')

function onConnect(io) {
    //handle socket connection
    io.on('connection', (socket) => {
        socket.emit('joinRoom', { room: 'general'})
        
        onChat(io, socket)
        onJoinRoom(io, socket)

        socket.on('disconnect', () => {
            //console.log('A user disconnected');
        });
    });
};

module.exports = onConnect;
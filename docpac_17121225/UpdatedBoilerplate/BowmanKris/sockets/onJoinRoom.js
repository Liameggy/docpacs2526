function onJoinRoom(socket) {
    socket.emit('joinMessage', {message: 'you joined a new room'})
    socket.emit('roomList')
}

module.exports = onJoinRoom;
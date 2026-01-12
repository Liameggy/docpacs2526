const rooms = new Map();

// manages chat rooms and their users
function createRoom(name) {
  if (!rooms.has(name)) rooms.set(name, { users: new Set(), createdAt: Date.now() });
  return rooms.get(name);
}
function addUserToRoom(name, user) {
  const room = createRoom(name);
  if (user) room.users.add(user.id || user.username || user);
}
function removeUserFromRoom(name, user) {
  const room = rooms.get(name);
  if (!room) return;
  room.users.delete(user.id || user.username || user);
  if (room.users.size === 0) rooms.delete(name);
}
function getRoom(name) { return rooms.get(name) || null; }

module.exports = { createRoom, addUserToRoom, removeUserFromRoom, getRoom };

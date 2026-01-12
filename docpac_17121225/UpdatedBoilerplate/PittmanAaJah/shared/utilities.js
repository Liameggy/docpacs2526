function sanitizeString(s) {
  return String(s || '').replace(/[<>]/g, '');
}

function makeRoomId(name) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
}

module.exports = { sanitizeString, makeRoomId };

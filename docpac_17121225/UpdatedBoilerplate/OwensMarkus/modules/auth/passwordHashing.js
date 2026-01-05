const bcrypt = require('bcrypt');
function hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}
function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}
module.exports = {
    hashPassword,
    comparePassword
};
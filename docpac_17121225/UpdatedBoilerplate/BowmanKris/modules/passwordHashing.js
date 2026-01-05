//import required modules
const bcrypt = require('bcrypt');

const salt = bcrypt.genSaltSync(10);

function hashPassword(password) {
    const hashedPassword = bcrypt.hashSync(password, salt);
    return hashedPassword;
}

function verifyPassword(password, hashedPassword) {
    const compare = bcrypt.compareSync(password, hashedPassword);
    return compare;
}

module.exports = {
    hashPassword,
    verifyPassword
};
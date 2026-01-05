import bcrypt from 'bcryptjs';
import { logging } from '../logger.js';
const SALT_ROUNDS = 10;
const passwordText = 's0/\/\P4$$w0rD';
const otherPasswordText = 'not_bacon';

bcrypt.genSalt(SALT_ROUNDS, function (err, salt) {
    bcrypt.hash(passwordText, salt, function (err, hash) {
        // Store hash in your password DB.
        logging('INFO', `Generated hash`);

        // To verify the password
        bcrypt.compare(passwordText, hash, function (err, res) {
            logging('INFO', `Password matches`); // true
        });

        // To verify with a different password
        bcrypt.compare(otherPasswordText, hash, function (err, res) {
            logging('INFO', `Other password matches`); // false
        });
    });
});
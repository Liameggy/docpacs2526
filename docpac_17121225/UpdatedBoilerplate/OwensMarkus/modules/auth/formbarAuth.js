const jwt = require('jsonwebtoken');
const logger = require('../logger');
require('dotenv').config();
function makeAuthUrl(){
    const AUTH_URL=process.env.AUTH_URL || "https://localhost:420/oauth";
    const THIS_URL=process.env.THIS_URL || "http://localhost:3000";
    return `${AUTH_URL}/oauth?redirectURL=${THIS_URL}`;
};
function formbarAuth(token,session,database,callback){
    let tokenData = jwt.decode(token);
    session.token = tokenData;
    session.user = tokenData.displayName;
    let curdate= new Date();
    let curtime= curdate.toISOString().slice(0, 19).replace('T', ' ');
    logger.info(`Token for user ${tokenData.displayName} received at ${curtime}, expires at ${tokenData.exp}`);
    logger.info(`User ${tokenData.displayName} logged in.`);
    //save user to data bas if no exist
    database.run('INSERT OR IGNORE INTO users (username,passwordHash,formbarId,lastupdate) VALUES (?, ?, ?, ?)', [tokenData.displayName, null, tokenData.id, curtime], function (err) {
        if (err) {
            logger.error(err.message);
            return callback(err,null);
        }
        logger.info(`User ${tokenData.displayName} added to database or already exists.`);
        callback(null, {user: tokenData.displayName});
    });
};
module.exports = {makeAuthUrl, formbarAuth};
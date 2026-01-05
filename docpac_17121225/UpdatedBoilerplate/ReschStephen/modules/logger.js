import winston from 'winston';

const logger = winston.createLogger({
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
});

function getDate() {
    let now = new Date(Date.now());
    return "[" + [now.getFullYear(), now.getMonth()+1, now.getDate()].join('-') + ' ' + [now.getHours(), now.getMinutes(), now.getSeconds()].join(':') + "]";
}

function logging(level, message) {
    console.log(getDate(), "["+level+"]", message);
}

export { logging };
require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');

const logger = require('./modules/logger');
const sessionMiddleware = require('./middleware/session');
const socketServer = require('./modules/socketServer');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(sessionMiddleware);
// Serve static files
app.use(express.static('public'))
app.use('/uploads', express.static(path.join(__dirname, 'data/uploads')));
// Mount routes
const homeRouter = require('./routes/home');
const loginRouter = require('./routes/login');
const profileRouter = require('./routes/profile');
const apiUsers = require('./routes/api/users');
const socketRouter = require('./routes/socket');

app.use('/', homeRouter);
app.use('/', loginRouter);
app.use('/', profileRouter);
app.use('/', socketRouter);
app.use('/api/users', apiUsers);



// If executed directly, start the HTTP server and attach Socket.IO
if (require.main === module) {
  // Ensure uploads directory exists
  const uploadsDir = path.resolve(__dirname, 'data', 'uploads');
  try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch (err) { /* ignore */ }

  const server = http.createServer(app);
  socketServer(server); // Call socketServer function to attach io

  server.listen(PORT, () => {
    logger.info(`Server started on http://localhost:${PORT}`);
    console.log(`Server started on http://localhost:${PORT}`);
  });

  process.on('SIGINT', () => {
    logger.info('Shutting down server (SIGINT)');
    server.close(() => process.exit(0));
  });
}

module.exports = app;
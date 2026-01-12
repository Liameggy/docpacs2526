Updated Formbar Boilerplate 

Project Description
This is a Node.js application using Express, EJS, SQLite, and Socket.IO. It has user authentication with both native username/password login and Formbar, session handling with SQLite, file uploads, and chat rooms using Socket.IO. 

Setup Instructions
Install Dependencies
npm install

Create a .env file in the root directory
Dont commit this to github
PORT=3000
SESSION_SECRET=pizza
FORMBAR_CLIENT_ID=https://formbeta.yorktechapps.com
FORMBAR_CLIENT_SECRET=YOUR_SECRET_HERE
FORMBAR_REDIRECT_URI=http://localhost:3000/login
DATABASE_FILE=./data/database.sqlite
Create a .env_template file with the same variables but with no values

Start the server using
node app.js
open a browser and go to
http://localhost:3000

Session Storage
session data is stored in the same SQLite database file as the main application data 

Folder Structure
PittmanAaJah/
├── data/ SQLite database and uploaded files
├── middleware/ authentication and session middleware
├── modules/ logger, authentication, socket server
├── sockets/ socket.io event handlers
├── views/ ejs templates
│ └── partials/ header and footer
├── public/ static files
├── app.js main server
├── .env_template
└── README.md

Major Modules
Authentication (modules/auth/)
- native.js handles native username/password registration and login
- formbarAuth.js handles Formbar OAuth login and redirects
- passwordHashing.js hashes and compares passwords

Session Middleware (middleware/session.js)
- uses express-session and connect-sqlite3.
- express and socket.io using the same session middleware so user authentcation is consistant 

Logger (modules/logger.js)
- a custom logger that outputs timestamped messages with log levels like as INFO and ERROR
- used for server startup, login attempts, database errors, and socket connections

Socket Server (modules/socketServer.js)
- attaches Socket.IO to the HTTP server
- uses session authentication so each socket knows which user is connected
- supports joining rooms, sending messages, and broadcasting system messages when users join

How to use sockets page
Log in 
Press the sockets link in the header
Enter a room by in typing a name
Messages are only seen by users who are in the same room
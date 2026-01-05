This project is a templete for future projects throughout the year. It has a native and formbar oauth login system, a profile page with file uploads, and a demonstration of Socket.IO, which takes the form of a chat room. It uses many routes and a database or two.

Directions:

1. do "npm install"
2. enter the command "npm run initDatabase.js"
3. finally, "node server" to start up the application

To run the demo page for socket.io, enter the name of a chat room, any room. After that, type a message, and then send it. The message will display in the room with the name of the person who sent it.


The folder structure is very organized:

data: for databases and the uploads folder
middleware: for middleware used in the rest of the program
modules: for modules also used in the rest of the program
node modules: not included in the initial download, but houses all modules installed through the console. No touchy!
scripts: houses initDatabase.js
shared: houses utilities.js
sockets: holds javascript files that manage the socket demo
views: carries the files that are the webpages themselves (don't know how else to say this)
everything else is on its own


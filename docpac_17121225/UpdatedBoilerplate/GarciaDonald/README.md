# UPDATED BOILERPLATE FOR FORMBAR
A 2nd version to a boilerplate for Formbar intended to support more modules than the original did, as well as still having the ability to be reused for future projects, such as games, APIs, projects related to formbar, and whatnot! The possibilities are endless.

## HOW DO I SET THIS UP?
1. Run npm init -v in your command prompt terminal in VSCode. This will help initalize the modules used to make the project run the way it is intended to.
2. Create a new .env file, and use the provided .env_template to fill in the values with what you believe will be the most appropriate.
3. Run npm init-database, so that you have a database or two to work with for the project you are working on.
4. Run npm run dev to startup the server and test out certain things for your project (whether it be EJS views, Socket.IO rooms, or testing out partials.)
5. Install any other modules that you may need for your project that did not already come with the boilerplate.

## THE FOLDER STRUCTURE
### Root (in my case, the GarciaDonald folder)
This is the folder that contains all the upcoming folders, as well as other files that may be of good use to you as well. This includes a .env_template for you to make an env file from, as well as the server.js file for running your application/server for your project.
### Data / Uploads:
This is where you would put your databases, such as the database for users and their current sessions, and the uploads folder is for the files you upload to your profile.
### Logs
This folder is for logging events such as errors or for when databases connect.
### Middleware
This is for setting up the middleware that you need for your project. This can include an authentication function for formbar, your session middleware, or your socket.io server authentication
### Modules / Auth
This is where you would store the javascript files for the big modules that a very crucial for your project. This means modules such as an instance manager for your socket.IO server, as well as your socket.IO server itself, the userLayout for the sockets, and scripts to help with local and oauth authentication for formbar.
### Routes / Api
This folder contains a route for you to design what goes on in your ejs file. For example, in my profile.ejs file, there is the option for you to upload your own files. With the help of making a route in profile.ejs, I was able to make this option work as well as show a list of all the files you've uploaded.
### Scripts
This is for you to store the JavaScript file where you initalize your database.
### Shared
This is for you store the file that contains the utilities you will need for your project.
### Sockets
This contains the scripts for the Socket.IO demo page to function the way it is intended to. These scripts should allow you to join a chatroom where you can chat with others. Just put in your username and a room name in the socket.IO demo page and you will hopefully have the pleasure of experiencing being in a chatroom with people you can become friends with
### Views / Partials
This folder contains the EJS pages for you to use for your project, as well as the EJS partials if you wish to pull them together to make your primary EJS views files.
## The Major Modules

### formbarAuth
formbarAuth is a module used to verify users for logging in via the authentication of logging in via a formbar account. You will need to have created a formbar account for this to work properly.
### logger
Logger is a module used to log the timestamps of when an action was made, such as a log for when a database was initialized or when an error was made when you tried starting up your server.
### socketServer
socketServer is the module for you to use to connect your Socket.IO server to an HTTP server for connections and to setup the Socket.IO functions you want to be active throughout your entire project.
## HOW TO USE THE SOCKET.IO DEMO PAGE
1. Login to Formbar using your account.
2. Go to the Socket.IO option on the bar on top.
3. Put in your username
4. Put in a random room-name of your choosing
5. Let the magic happen.
(note: This feature is incomplete and may not work the way it is intended to.)
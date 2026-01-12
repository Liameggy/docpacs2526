# Updated Boilerplate


## Project Description

This is a Node.js/Express boilerplate designed for building real-time applications with Socket.IO, session-based authentication, and structured routing. It includes a live chat demo with multiple rooms, user tracking, and room management.

### Setup Instructions
#### 1. Clone the repository
```
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

#### 2. Install dependencies
```
npm install
```

#### 3. Environment Variables

Create a .env file in the root directory with the following variables:

```
PORT=3000
SESSION_SECRET=your_secret
AUTH_URL=http://localhost:420/oauth
API_KEY=your_api_key
```

`PORT` – The port your server will run on.

`SESSION_SECRET` – Secret key for session encryption.

`AUTH_URL` – URL for Formbar auth server.

`API_KEY` – API key for auth server connection.

#### 4. Database Initialization (SQLite)
```
npm run init-database
npm run migrate-database
```

This will set up the SQLite database and apply necessary migrations.

#### 5. Start the application
```
npm run start
```

Visit http://localhost:3000 in your browser.

### Folder Structure

```
.
├── modules/            # Core backend modules (socketServer, instanceManager, logger, etc.)
├── sockets/            # Socket.IO handlers (onConnect, onJoinRoom, onChat)
├── routes/             # Express route handlers (home, profile, sockets)
├── views/              # EJS templates and partials (header, footer)
├── public/             # Static assets (CSS, JS, images)
├── middleware/         # Authentication and session middleware
├── .env                # Environment variables
├── server.js           # Entry point for Express server
└── package.json
```

### Major Modules

- `socketServer.js` – Initializes the Socket.IO server, integrates session middleware, handles reconnections, and connects to the Formbar auth server.

- `instanceManager.js` – Manages rooms and users in memory. Handles joining, leaving, and cleaning up rooms.

- `socketHandlers/` – Event handlers for Socket.IO:

    - `onConnect.js` – Handles new socket connections and adds users to the public room.

    - `onJoinRoom.js` – Handles room switching, updates instance manager, and notifies clients.

    - `onChat.js` – Handles chat messages, validates users, and broadcasts messages.

`middleware/socketAuth.js` – Ensures only authenticated users can connect to Socket.IO.

`logger.js` – Centralized logging module for server events.

### Socket.IO Demo Page (/sockets)
#### Features

- List of all available rooms and current members.

- Main public chat room by default.

- Ability to create a new room and automatically join it.

- Real-time messages with timestamps.

- Reconnection handling to restore previous room state.

#### Usage

1. Open /sockets in your browser.

2. See the room list on the left; click a room to join it.

3. View current members of your room.

4. Type a message in the input box and press Send to broadcast it.

5. Create a new room using the Create Room input; you’ll automatically join it.

6. Messages include timestamps, and you’ll see notifications when users join or leave rooms.

### Getting Started Flow
      ┌───────────────┐
      │   User Login  │
      └──────┬────────┘
             │
             ▼
      ┌───────────────┐
      │  Express App  │
      │  Session Auth │
      └──────┬────────┘
             │
             ▼
      ┌───────────────┐
      │ /sockets Page │
      │  (Socket.IO)  │
      └──────┬────────┘
             │
   ┌─────────┴─────────┐
   ▼                   ▼
┌─────────────┐     ┌─────────────┐
│ Public Room │     │  Other Rooms│
│  (default)  │     │ Created by  │
│             │     │  Users      │
└──────┬──────┘     └──────┬──────┘
       │                     │
       ▼                     ▼
┌─────────────┐       ┌─────────────┐
│  Join Room  │       │ Join Room   │
│  Event      │       │ Event       │
└──────┬──────┘       └──────┬──────┘
       │                     │
       ▼                     ▼
┌─────────────┐       ┌─────────────┐
│  Chat in    │       │  Chat in    │
│  Current    │       │  Current    │
│  Room       │       │  Room       │
└─────────────┘       └─────────────┘


**Explanation:**

1. **User Login** – Users must log in to access the app. Sessions are stored for authentication.

2. **Express + Session Auth** – Middleware verifies the user before rendering /sockets.

3. **Socket.IO Connection** – On page load, the client connects via Socket.IO and joins the public room by default.

4. **Rooms** – Users can switch between the public room and other rooms created dynamically.

5. **Chat Messages** – All messages are broadcast to the current room in real time, with user info and timestamps.

#### Notes

- Sessions are required to access /sockets; users must be logged in.

- Public room always exists and cannot be deleted.

- All chat activity occurs in real-time; no persistent message storage is implemented.
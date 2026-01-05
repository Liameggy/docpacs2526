# Node.js Boilerplate Project

A reusable Node.js starter template with authentication, real-time chat, and file uploads.

## Quick Start

```bash
npm install
npm run init-database
npm run dev
```

Visit `http://localhost:3000`

## What's Included

- Express web server with EJS templates
- SQLite database (users, sessions, uploads)
- Socket.IO real-time chat
- Login/Register with password encryption
- File upload support
- Formbar OAuth stub (customize as needed)

## Setup

1. **Environment Variables** - Create `.env` file:
```bash
PORT=3000
SESSION_SECRET=your-secret-key
DATABASE_FILE=data/database.sqlite
```

2. **Install & Run**
```bash
npm install
npm run init-database
npm run dev
```

## Folder Structure

```
.
├── app.js                          # Main Express app entry point
├── package.json                    # Dependencies and scripts
├── .env_template                   # Environment variables template
├── .gitignore                      # Git ignore rules
├── README.md                       # This file
│
├── middleware/                     # Express middleware
│   ├── session.js                  # Express-session configuration
│   ├── isAuthenticated.js          # Route protection middleware
│   └── socketAuth.js               # Socket.IO authentication
│
├── modules/                        # Core application modules
│   ├── logger.js                   # Winston logger setup
│   ├── socketServer.js             # Socket.IO server initialization
│   ├── instanceManager.js          # Room and user management
│   ├── userLayout.js               # View data helper
│   └── auth/                       # Authentication modules
│       ├── native.js               # Username/password authentication
│       ├── passwordHashing.js      # Bcrypt password operations
│       └── formbarAuth.js          # Formbar OAuth (stub)
│
├── routes/                         # Express route handlers
│   ├── home.js                     # Home page (GET /)
│   ├── login.js                    # Login, register, logout flows
│   ├── profile.js                  # User profile and file uploads
│   ├── socket.js                   # Socket demo page
│   └── api/
│       └── users.js                # API endpoint (GET /api/users)
│
├── sockets/                        # Socket.IO event handlers
│   ├── onConnect.js                # Connection event
│   ├── onJoinRoom.js               # Room joining logic
│   └── onChat.js                   # Chat message broadcasting
│
├── views/                          # EJS templates
│   ├── home.ejs                    # Home page
│   ├── login.ejs                   # Login form
│   ├── register.ejs                # Registration form
│   ├── profile.ejs                 # User profile
│   ├── socket.ejs                  # Socket.IO chat demo
│   └── partials/
│       ├── header.ejs              # HTML header and nav
│       └── footer.ejs              # HTML footer
│
├── shared/                         # Shared utilities
│   └── utilities.js                # String sanitization, validation, tokens
│
├── scripts/                        # Utility scripts
│   └── initDatabase.js             # Database initialization script
│
└── data/                           # Data directory (created at runtime)
    ├── database.sqlite             # Main SQLite database
    ├── sessions.sqlite             # Session store
    └── uploads/                    # Uploaded files (user profile pictures)
```

## Modules

### 1. Authentication Module (`modules/auth/`)

#### native.js
Handles username/password login and registration with SQLite.

**Key Functions:**
- `loginUser(username, password)` - Validates credentials, returns user object
- `registerUser(username, password)` - Creates new account with validation
## Key Modules

### Authentication (`modules/auth/`)
- **native.js** - Login/register with username & password
- **passwordHashing.js** - Encrypts passwords with bcrypt
- **formbarAuth.js** - OAuth stub for Formbar

### Socket.IO (`modules/socketServer.js`)
Sets up real-time chat with rooms. Automatically loads handlers from `sockets/` folder.

### Instance Manager (`modules/instanceManager.js`)
Tracks chat rooms and users. Prevents users from being in multiple rooms at once.

### Logger (`modules/logger.js`)
Logs events to console and `logs/combined.log`.

### Utilities (`shared/utilities.js`)
Helper functions for validation, sanitization, and token generation

### Registration Flow

1. **GET /register** - Display registration form
2. **POST /register** - Submit username and password
3. Validation:
   - Username: 3-20 characters, alphanumeric + underscore
   - Password: Minimum 6 characters (matches with confirmPassword)
   - Check for existing username
4. `native.registerUser()` hashes password and creates account
5. Redirect to login with success message

### Session Management

- **Storage:** SQLite (sessions.sqlite)
- **Middleware:** express-session with connect-sqlite3
- **Cookie:** Secure (HTTPS only in production), 24-hour max age
- **Protection:** SESSION_SECRET required (development default provided)

### Protected Routes

Routes requiring authentication use `isAuthenticated` middleware:
- GET /profile
- POST /profile/upload
- GET /api/users
- Socket.IO connections (receives authenticated user data)

Unauthenticated requests:
- HTTP: Redirected to /login
- API: Return 401 Unauthorized
- Sockets: Connected as "Guest"

## Socket.IO Chat Demo

Access the real-time chat demo at `http://localhost:3000/socket` (available for all users, authenticated or guest).

### How to Use

1. **Join a Room**
   - Enter a room name (e.g., "main", "gaming", "support")
   - Click "Join Room"
   - Default room is "main"
   - System message confirms successful join

2. **Send Messages**
   - Type message in input field
   - Click "Send" or press Enter
   - Message appears with:
     - Sender username (or "Guest")
     - Timestamp ([HH:MM:SS AM/PM])
     - Message content
   - **All users in the room see the message** including the sender

3. **Multiple Users**
   - Open multiple browser tabs/windows
   - Join same room from different tabs or different computers
   - Messages broadcast to all room members in real-time
   - Each user sees their own and others' messages

4. **Room Features**
   - Rooms auto-created on first join
   - Users can't be in multiple rooms simultaneously
   - Switching rooms removes user from previous room
   - System messages notify join/leave events

### Client-Side Events

**Emitted to Server:**
- `joinRoom` - Join room: `socket.emit('joinRoom', roomName)`
- `chatMessage` - Send message: `socket.emit('chatMessage', { roomId, message })`

**Received from Server:**
- `welcome` - Initial connection message
- `systemMessage` - Room join/leave notifications
- `chatMessage` - Messages from room members
- `joinedRoom` - Confirmation of successful room join
- `error` - Error messages

### Socket.IO Events

**Server Listen:**
- `joinRoom(roomId)` - Join or switch to room
- `chatMessage({ roomId, message })` - Send message to room

**Server Emit:**
- `welcome(data)` - Connection confirmation
- `systemMessage({ message })` - System notifications
- `chatMessage({ username, message, timestamp })` - Room messages
- `joinedRoom({ roomId })` - Room join confirmation
## How It Works

### Authentication
- Visit `/login` or `/register` to create account
- Passwords encrypted with bcrypt before storage
- Sessions stored in SQLite, last 24 hours
- Protected routes redirect to login if not authenticated

### Routes
- `/` - Home page
- `/login` - Login form
- `/register` - Create account
- `/profile` - User profile (protected)
- `/socket` - Chat demo
- `/api/users` - Get all users (protected)## Using Socket.IO Chat

Go to `/socket` to try the real-time chat.

1. **Join a room** - Enter room name (default: "main") and click Join
2. **Send messages** - Type and press Enter or click Send
3. **Multiple users** - Open multiple tabs to chat between them

Messages show username and timestamp. Rooms are created automatically.
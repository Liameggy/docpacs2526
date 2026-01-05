<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
=======
>>>>>>> Stashed changes
<<<<<<< HEAD


=======
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
//imports
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
//class
class DatabaseInitializer {
    constructor() {
        this.dbPath = process.env.DATABASE_FILE || './data/database.sqlite';
        this.sessionDbPath = './sessions.sqlite';
        this.dataDir = './data';
    }

    async initialize() {
        console.log('🗄️ Starting database initialization...');
        
        try {
            // Ensuring the data directory exists
            await this.ensureDataDirectory();
            
            // Initialize the main database
            await this.initializeMainDatabase();
            
            // Initialize the session database
            await this.initializeSessionDatabase();
            
            console.log('✅ Database initialization completed successfully!');
            process.exit(0);
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            process.exit(1);
        }
    }

    ensureDataDirectory() {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(this.dataDir)) {
                fs.mkdirSync(this.dataDir, { recursive: true });
                console.log(`📁 Created data directory: ${this.dataDir}`);
            }
            
            // Create uploads directory
            const uploadsDir = path.join(this.dataDir, 'uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
                console.log(`📁 Created uploads directory: ${uploadsDir}`);
            }
            
            resolve();
        });
    }

    initializeMainDatabase() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log(`🔗 Connected to main database: ${this.dbPath}`);
            });

            // Enable foreign keys
            db.run('PRAGMA foreign_keys = ON;');

            // Create tables in sequence
            db.serialize(() => {
                // Users table
                db.run(`
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT NOT NULL UNIQUE,
                        passwordHash TEXT,
                        formbarId INTEGER,
                        email TEXT,
                        displayName TEXT,
                        theme TEXT DEFAULT 'light',
                        createdAt TEXT NOT NULL,
                        updatedAt TEXT NOT NULL,
                        isActive BOOLEAN DEFAULT 1,
                        lastLoginAt TEXT,
                        preferences TEXT DEFAULT '{}'
                    )
                `, (err) => {
                    if (err) {
                        console.error('❌ Failed to create users table:', err);
                    } else {
                        console.log('✅ Users table created/verified');
                    }
                });

                // Uploads table
                db.run(`
                    CREATE TABLE IF NOT EXISTS uploads (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        file_name TEXT NOT NULL,
                        original_name TEXT,
                        file_size INTEGER,
                        mime_type TEXT,
                        uploaded_at INTEGER NOT NULL,
                        is_deleted BOOLEAN DEFAULT 0,
                        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                    )
                `, (err) => {
                    if (err) {
                        console.error('❌ Failed to create uploads table:', err);
                    } else {
                        console.log('✅ Uploads table created/verified');
                    }
                });

                // Room instances table
                db.run(`
                    CREATE TABLE IF NOT EXISTS room_instances (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        room_id TEXT NOT NULL UNIQUE,
                        room_name TEXT NOT NULL,
                        room_type TEXT DEFAULT 'chat',
                        created_by INTEGER,
                        created_at TEXT NOT NULL,
                        max_users INTEGER DEFAULT 50,
                        is_private BOOLEAN DEFAULT 0,
                        password_hash TEXT,
                        settings TEXT DEFAULT '{}',
                        is_active BOOLEAN DEFAULT 1,
                        FOREIGN KEY (created_by) REFERENCES users (id)
                    )
                `, (err) => {
                    if (err) {
                        console.error('❌ Failed to create room_instances table:', err);
                    } else {
                        console.log('✅ Room instances table created/verified');
                    }
                });

                // User room history table
                db.run(`
                    CREATE TABLE IF NOT EXISTS user_room_history (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        room_id TEXT NOT NULL,
                        joined_at TEXT NOT NULL,
                        left_at TEXT,
                        session_duration INTEGER,
                        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                    )
                `, (err) => {
                    if (err) {
                        console.error('❌ Failed to create user_room_history table:', err);
                    } else {
                        console.log('✅ User room history table created/verified');
                    }
                });

                // Chat messages table (optional for persistence)
                db.run(`
                    CREATE TABLE IF NOT EXISTS chat_messages (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        room_id TEXT NOT NULL,
                        message TEXT NOT NULL,
                        message_type TEXT DEFAULT 'chat',
                        sent_at TEXT NOT NULL,
                        is_deleted BOOLEAN DEFAULT 0,
                        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                    )
                `, (err) => {
                    if (err) {
                        console.error('❌ Failed to create chat_messages table:', err);
                    } else {
                        console.log('✅ Chat messages table created/verified');
                    }
                });

                // Create indexes for better performance
                db.run('CREATE INDEX IF NOT EXISTS idx_users_formbarId ON users (formbarId);');
                db.run('CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON uploads (user_id);');
                db.run('CREATE INDEX IF NOT EXISTS idx_room_instances_room_id ON room_instances (room_id);');
                db.run('CREATE INDEX IF NOT EXISTS idx_user_room_history_user_id ON user_room_history (user_id);');
                db.run('CREATE INDEX IF NOT EXISTS idx_user_room_history_room_id ON user_room_history (room_id);');
                db.run('CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages (room_id);');
                
                console.log('✅ Database indexes created/verified');
            });

            db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('🔒 Main database connection closed');
                    resolve();
                }
            });
        });
    }

    initializeSessionDatabase() {
        return new Promise((resolve, reject) => {
            const sessionDb = new sqlite3.Database(this.sessionDbPath, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log(`🔗 Connected to session database: ${this.sessionDbPath}`);
            });

                        // Create sessions table for express-session
            sessionDb.run(`
                CREATE TABLE IF NOT EXISTS sessions (
                    sid TEXT PRIMARY KEY,
                    sess TEXT NOT NULL,
                    expired INTEGER NOT NULL
                )
            `, (err) => {
                if (err) {
                    console.error('❌ Failed to create sessions table:', err);
                    reject(err);
                } else {
                    console.log('✅ Sessions table created/verified');
                }
            });

            sessionDb.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('🔒 Session database connection closed');
                    resolve();
                }
            });
        });
    }
}

// Run the initialization if this script is executed directly
if (require.main === module) {
    const initializer = new DatabaseInitializer();
    initializer.initialize();
}

module.exports = DatabaseInitializer;
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
>>>>>>> 14a2061a109e03fc01c1edd69725c3f69d1cb31c
>>>>>>> Stashed changes
=======
>>>>>>> 14a2061a109e03fc01c1edd69725c3f69d1cb31c
>>>>>>> Stashed changes

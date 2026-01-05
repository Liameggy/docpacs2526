import fs from 'fs';
import sqlite3Package from 'sqlite3';
const sqlite3 = sqlite3Package.verbose();

const sql = fs.readFileSync('./data/database.sql', 'utf-8');
const db = new sqlite3.Database('./data/database.db');

db.exec(sql, (err) => {
    if (err) {
        console.error('Error initializing database:', err);
    } else {
        console.log('Database initialized successfully.');
    }
    db.close();
});
import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import jwt from 'jsonwebtoken';
import session from 'express-session';

import auth from './auth.js';
import dbManager from './dbManager.js';

import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

auth(app, jwt, session);
const db = dbManager(sqlite3);

app.get('/', (_, res) => {
    res.send('Hello from the server! Use API routes to view json data.');
});

app.get('/api/user', async (req, res) => {
    if (req.session.user) {
        const username = await db.updateUser(req.session.user);
        req.session.user = username;
        res.json({
            authenticated: true,
            username: username
        });

    } else {
        res.json({
            authenticated: false
        });
    }
});

app.get('/api/job-posts', async (_, res) => {
    try {
        const jobPosts = await db.getJobPosts();
        res.json(jobPosts);
    } catch (error) {
        console.error('Error fetching job posts:', error);
        res.status(500).json({ error: 'Failed to fetch job posts' });
    }
});

app.post('/api/job-posts', express.json(), async (req, res) => {
    try {
        const poster = req.session.user;
        const title = req.body.title;
        const content = req.body.description;
        const time = new Date().toLocaleString('en-US', { timeZone: 'UTC' });

        console.log('Creating job post:', { poster, title, content, time });

        const newJobPost = await db.createJobPost(poster, title, content, time);

        res.status(201).json(newJobPost.poster);
    } catch (error) {
        console.error('Error creating job post:', error);
        res.status(500).json({ error: 'Failed to create job post' });
    }
});

app.get('/api/comments', async (_, res) => {
    try {
        const comments = await db.getComments();
        res.json(comments);
    } catch (error) {
        console.error('Error fetching job posts:', error);
        res.status(500).json({ error: 'Failed to fetch job posts' });
    }
});

app.post('/api/comments', express.json(), async (req, res) => {
    try {
        const commenter = req.session.user;
        const content = req.body.comment;
        const time = new Date().toLocaleString('en-US', { timeZone: 'UTC' });

        console.log('Creating comment:', {commenter, content, time });

        const newComment = await db.createComment(commenter, content, time);

        res.status(201).json(newComment.commenter);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Failed to create comment' });
    }
});

app.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
});
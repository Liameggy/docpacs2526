# Post Board Application

A web-based posting board where users can create posts, comment, and interact with each other's content.

## Features

*   **User Authentication**: Secure login using Formbar OAuth
*   **Post Management**: Create, edit, and delete your own posts
*   **Comment System**: Comment on posts, with post owners able to moderate comments
*   **User Profiles**: Click on usernames to view user profiles and their post history
*   **Real-time Updates**: Posts and comments appear chronologically

## Technology Stack

*   **Backend**: Node.js with Express.js
*   **Frontend**: EJS templating engine
*   **Database**: SQLite3
*   **Authentication**: Formbar OAuth system

## Installation

1.  Clone the repository
2.  Install dependencies:
    
    ```
    npm install
    ```
    
3.  Set up environment variables in `.env` file:
    
    ```
    SESSION_SECRET=your_secret_key
    AUTH_URL=http://formbeta.yorktechapps.com
    THIS_URL=http://localhost:3000/login
    API_KEY=your_api_key
    ```
    
5.  Start the server:
    
    ```
    node app.js
    ```
    
6.  Open [http://localhost:3000](http://localhost:3000) (or whatever is used in your .env) in your browser

## Usage

1.  **Login**: Click login to authenticate with Formbar OAuth
2.  **Create Posts**: Click "Create New Post" to add content
3.  **View Posts**: All posts display on the home page in chronological order
4.  **Comment**: Add comments to any post
5.  **Edit/Delete**: Manage your own posts and comments
6.  **User Profiles**: Click usernames to view user profiles

## Database Structure

*   **users**: Stores user information (uid, username)
*   **posts**: Stores post data (uid, title, description, creator\_uid, timestamp, edited\_timestamp)
*   **comments**: Stores comments (uid, content, post\_uid, creator\_uid, timestamp, edited\_timestamp)s
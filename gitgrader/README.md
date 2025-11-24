# GitHub Grading Bot

A Node.js application that automatically grades student GitHub contributions by evaluating issue assignments, commits, pull requests, AI-verified completions, and project board workflows.

## Features

- 📝 **Team Management**: Save and manage multiple projects/teams
- 🔍 **Automated Grading**: Comprehensive evaluation of student GitHub activity
- 🤖 **AI Analysis**: Uses OpenAI to verify if issues were actually completed
- 📊 **Detailed Reports**: Generate HTML reports with rubric breakdown
- 🌐 **Web Interface**: User-friendly interface for managing teams and viewing results
- 💾 **Offline Reports**: Export standalone HTML files viewable without the server

## Grading Criteria

The bot evaluates students on 6 criteria (100 points total):

1. **Issue Assigned** (10 pts): Student assigned at least one issue to themselves
2. **Commits Made** (20 pts): Changes were committed referencing the issue
3. **PR Created** (20 pts): Pull request was created and linked to issue
4. **Issue Completed** (30 pts): AI verifies the PR changes actually address the issue
5. **PR Merged** (10 pts): Pull request was accepted and merged
6. **Project Board Workflow** (10 pts): Issue moved through To Do → In Progress → Done columns

## Prerequisites

- Node.js (v14 or higher)
- GitHub Personal Access Token with `repo` and `read:project` scopes
- OpenAI API Key

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gitgrader
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Edit `.env` and add your API keys:
```
GITHUB_TOKEN=your_github_token_here
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

## Setup Guide

### Step 1: Install Dependencies

The dependencies should already be installed. If not, run:

```bash
npm install
```

### Step 2: Configure Environment Variables

1. Copy the example environment file:
```bash
copy .env.example .env
```

2. Edit `.env` file and add your API keys:

```env
# GitHub Personal Access Token
# Generate at: https://github.com/settings/tokens
# Required scopes: repo, read:project
GITHUB_TOKEN=ghp_your_actual_github_token_here

# OpenAI API Key
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your_actual_openai_key_here

# Optional: GitHub Copilot API Key
# COPILOT_API_KEY=your_copilot_key_here

# Server Port (default: 3000)
PORT=3000
```

### Getting Your GitHub Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "GitGrader Bot")
4. Select the following scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `read:project` (Read access to project boards)
5. Click "Generate token"
6. Copy the token immediately (you won't be able to see it again!)

### Getting Your OpenAI API Key

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Give it a name and click "Create secret key"
5. Copy the key immediately

### Step 3: Configure Rubric (Optional)

Edit `config.json` to customize:

- **Point values** for each grading criterion
- **Project board column names** (if different from "To Do", "In Progress", "Done")
- **AI provider** (openai or copilot)

```json
{
  "rubric": {
    "issueAssigned": 10,
    "commitsMade": 20,
    "prCreated": 20,
    "issueCompleted": 30,
    "prMerged": 10,
    "projectBoardWorkflow": 10
  },
  "projectBoardColumns": {
    "todo": "To Do",
    "inProgress": "In Progress",
    "done": "Done"
  },
  "aiProvider": "openai"
}
```

### Step 4: Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

You should see:

```
╔════════════════════════════════════════╗
║   GitHub Grading Bot Server Running   ║
╠════════════════════════════════════════╣
║  URL: http://localhost:3000           ║
║  Environment: development             ║
╚════════════════════════════════════════╝
```

### Step 5: Open the Web Interface

Open your browser and navigate to:

```
http://localhost:3000
```

## Usage

1. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. Use the web interface to:
   - Create and manage teams/projects
   - Run grading evaluations
   - Export HTML reports

## Using the Application

### 1. Create a Team

1. Go to the **Teams** tab
2. Click **"+ Add New Team"**
3. Fill in:
   - **Team Name**: A descriptive name (e.g., "Fall 2024 - Group 3")
   - **Repository URL**: Full GitHub repo URL (e.g., `https://github.com/username/project`)
   - **Project Board**: Project number (e.g., `1`) or full URL
   - **Usernames**: Student GitHub usernames (comma-separated or one per line)
4. Click **"Save Team"**

### 2. Grade Students

**Option A: Grade a Saved Team**
1. Go to the **Grade** tab
2. Select a team from the dropdown
3. Click **"Grade Selected Team"**

**Option B: Quick Grade (Manual)**
1. Go to the **Grade** tab
2. Fill in the form manually
3. Click **"Start Grading"**

### 3. View Results

1. After grading completes, you'll automatically see the **Results** tab
2. View detailed scores for each student
3. Click **"Export HTML Report"** to download a standalone HTML file

## Configuration

Edit `config.json` to customize:

- **Rubric points** for each criterion
- **Project board column names** (To Do, In Progress, Done)
- **AI provider** (openai or copilot)

## Troubleshooting

### "Error: GITHUB_TOKEN is required"

- Make sure you created a `.env` file (not `.env.example`)
- Make sure your GitHub token is correctly set in `.env`
- Restart the server after adding the token

### "Failed to fetch issues for user"

- Check that the GitHub token has the correct permissions (`repo`, `read:project`)
- Verify the repository URL is correct
- Make sure the user has access to the repository

### "AI analysis not available"

- Check that `OPENAI_API_KEY` is set in `.env`
- Verify your OpenAI account has credits available
- Check your internet connection

### "Project board not found"

- Verify the project number is correct
- Make sure the project board is on the same repository
- Check that your GitHub token has `read:project` permission

### Port Already in Use

If port 3000 is already in use, change it in `.env`:

```env
PORT=3001
```

## Grading Criteria Explained

The bot evaluates students on 6 criteria (100 points total):

1. **Issue Assigned (10 pts)**: Student must assign at least one issue to themselves
2. **Commits Made (20 pts)**: Changes must be committed that reference the issue (using `#issue_number`)
3. **PR Created (20 pts)**: A pull request must be created and linked to the issue
4. **Issue Completed (30 pts)**: AI analyzes the PR changes to verify the issue was actually resolved
5. **PR Merged (10 pts)**: The pull request must be accepted, merged, and the issue closed
6. **Project Board Workflow (10 pts)**: The issue must move through the workflow (To Do → In Progress → Done)

## Tips for Best Results

1. **Make sure students reference issues in commits**: Use `#issue_number` in commit messages
2. **Link PRs to issues**: Use keywords like "Closes #issue_number" in PR descriptions
3. **Use project boards consistently**: Move issues through the workflow columns
4. **Clear issue descriptions**: Help the AI understand what needs to be done
5. **Regular grading**: Grade periodically to catch issues early

## Project Structure

```
gitgrader/
├── src/
│   ├── server.js              # Express server
│   ├── services/
│   │   ├── githubService.js   # GitHub API integration
│   │   ├── aiService.js       # AI analysis (OpenAI/Copilot)
│   │   ├── gradingService.js  # Core grading logic
│   │   ├── dataService.js     # Team data persistence
│   │   └── reportGenerator.js # HTML report generation
│   └── utils/
│       └── helpers.js         # Utility functions
├── public/
│   ├── index.html             # Web interface
│   ├── styles.css             # Styling
│   └── client.js              # Client-side JavaScript
├── data/
│   └── teams.json             # Saved teams data
├── config.json                # Rubric and settings
├── .env                       # Environment variables (create this!)
├── .env.example               # Example environment file
├── package.json               # Node.js dependencies
└── README.md                  # Documentation
```

## API Documentation

### Base URL

```
http://localhost:3000
```

(Change port if configured differently in `.env`)

### Authentication

Currently, no authentication is required for API endpoints. The bot uses the GitHub token and OpenAI key from environment variables for external API calls.

### Response Format

All API responses follow this structure:

#### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

#### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

---

## Team Management Endpoints

### List All Teams

**GET** `/api/teams`

Returns all saved teams.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "a1b2c3d4e5f6g7h8",
      "name": "Team Alpha",
      "repoUrl": "https://github.com/owner/repo",
      "projectBoard": "1",
      "usernames": ["student1", "student2", "student3"],
      "createdAt": "2024-11-04T12:00:00.000Z",
      "updatedAt": "2024-11-04T12:00:00.000Z",
      "lastGradingDate": null,
      "lastGradingResults": null
    }
  ]
}
```

---

### Get Single Team

**GET** `/api/teams/:id`

Returns details for a specific team.

**Parameters:**
- `id` (path) - Team ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4e5f6g7h8",
    "name": "Team Alpha",
    "repoUrl": "https://github.com/owner/repo",
    "projectBoard": "1",
    "usernames": ["student1", "student2"],
    "createdAt": "2024-11-04T12:00:00.000Z",
    "updatedAt": "2024-11-04T12:00:00.000Z",
    "lastGradingDate": "2024-11-04T13:00:00.000Z",
    "lastGradingResults": { ... }
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Team not found"
}
```

---

### Create Team

**POST** `/api/teams`

Creates a new team.

**Request Body:**
```json
{
  "name": "Team Alpha",
  "repoUrl": "https://github.com/owner/repo",
  "projectBoard": "1",
  "usernames": "student1, student2, student3"
}
```

**Notes:**
- `usernames` can be comma-separated string or array
- `projectBoard` can be a number or GitHub project URL

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4e5f6g7h8",
    "name": "Team Alpha",
    "repoUrl": "https://github.com/owner/repo",
    "projectBoard": "1",
    "usernames": ["student1", "student2", "student3"],
    "createdAt": "2024-11-04T12:00:00.000Z",
    "updatedAt": "2024-11-04T12:00:00.000Z",
    "lastGradingDate": null,
    "lastGradingResults": null
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid team data",
  "details": [
    "Team name is required",
    "Valid GitHub repository URL is required"
  ]
}
```

---

### Update Team

**PUT** `/api/teams/:id`

Updates an existing team.

**Parameters:**
- `id` (path) - Team ID

**Request Body:**
```json
{
  "name": "Updated Team Name",
  "repoUrl": "https://github.com/owner/new-repo",
  "projectBoard": "2",
  "usernames": "student1, student2, student3, student4"
}
```

**Notes:**
- All fields are optional
- Only provided fields will be updated
- `id`, `createdAt` cannot be changed

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4e5f6g7h8",
    "name": "Updated Team Name",
    "repoUrl": "https://github.com/owner/new-repo",
    "projectBoard": "2",
    "usernames": ["student1", "student2", "student3", "student4"],
    "createdAt": "2024-11-04T12:00:00.000Z",
    "updatedAt": "2024-11-04T14:00:00.000Z",
    "lastGradingDate": null,
    "lastGradingResults": null
  }
}
```

---

### Delete Team

**DELETE** `/api/teams/:id`

Deletes a team.

**Parameters:**
- `id` (path) - Team ID

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Team deleted successfully"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Failed to delete team",
  "details": "Team with ID xyz not found"
}
```

---

## Grading Endpoints

### Grade Team

**POST** `/grade`

Performs grading on a team (saved or manual).

**Request Body (Saved Team):**
```json
{
  "teamId": "a1b2c3d4e5f6g7h8"
}
```

**Request Body (Manual):**
```json
{
  "repoUrl": "https://github.com/owner/repo",
  "projectBoard": "1",
  "usernames": "student1, student2",
  "teamName": "Quick Grade"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": {
      "repository": "owner/repo",
      "projectBoard": 1,
      "gradedAt": "2024-11-04T14:00:00.000Z",
      "students": [
        {
          "username": "student1",
          "totalScore": 85,
          "maxScore": 100,
          "percentage": "85.0",
          "letterGrade": "B",
          "criteria": {
            "issueAssigned": {
              "name": "Issue Assigned",
              "points": 10,
              "maxPoints": 10,
              "passed": true,
              "feedback": "✓ Student assigned 2 issue(s) to themselves",
              "details": { "issueCount": 2 }
            },
            "commitsMade": {
              "name": "Commits Made",
              "points": 20,
              "maxPoints": 20,
              "passed": true,
              "feedback": "✓ Student made 5 commit(s) referencing their issues",
              "details": {
                "totalCommits": 5,
                "issuesWithCommits": [
                  { "issue": 42, "commits": 3 },
                  { "issue": 43, "commits": 2 }
                ]
              }
            },
            "prCreated": {
              "name": "Pull Request Created",
              "points": 20,
              "maxPoints": 20,
              "passed": true,
              "feedback": "✓ Student created 2 pull request(s) for their issues"
            },
            "issueCompleted": {
              "name": "Issue Completed (AI Verified)",
              "points": 30,
              "maxPoints": 30,
              "passed": true,
              "feedback": "✓ AI verified that 2 of 2 issue(s) were properly completed",
              "details": {
                "analyses": [
                  {
                    "issue": 42,
                    "pr": 15,
                    "passed": true,
                    "confidence": 0.95,
                    "explanation": "The PR successfully implements the login feature..."
                  }
                ],
                "passedCount": 2,
                "totalIssues": 2
              }
            },
            "prMerged": {
              "name": "Pull Request Merged",
              "points": 0,
              "maxPoints": 10,
              "passed": false,
              "feedback": "✗ Pull requests were not merged or issues remain open"
            },
            "projectBoardWorkflow": {
              "name": "Project Board Workflow",
              "points": 5,
              "maxPoints": 10,
              "passed": true,
              "feedback": "✓ 1 of 2 issue(s) moved through the complete workflow"
            }
          },
          "issues": [
            {
              "number": 42,
              "title": "Implement login feature",
              "state": "open",
              "url": "https://github.com/owner/repo/issues/42"
            }
          ],
          "feedback": [
            "✓ Student assigned 2 issue(s) to themselves",
            "✓ Student made 5 commit(s) referencing their issues",
            "..."
          ]
        }
      ],
      "statistics": {
        "averageScore": "82.5",
        "highestScore": 95,
        "lowestScore": 70,
        "passingCount": 2,
        "passingRate": "100.0",
        "totalStudents": 2
      }
    },
    "teamId": "a1b2c3d4e5f6g7h8",
    "teamName": "Team Alpha"
  }
}
```

**Notes:**
- This endpoint can take several minutes depending on the number of students
- Results are automatically saved for teams with `teamId`

**Error Response (400):**
```json
{
  "success": false,
  "error": "Missing required fields: repoUrl, projectBoard, usernames"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "error": "Grading failed",
  "details": "Invalid GitHub repository URL"
}
```

---

### Export HTML Report

**POST** `/export`

Generates a standalone HTML report file.

**Request Body:**
```json
{
  "results": { ... },
  "teamName": "Team Alpha"
}
```

**Notes:**
- `results` should be the results object from `/grade` endpoint
- `teamName` is optional (defaults to "Team")

**Response:**
- Content-Type: `text/html`
- Content-Disposition: `attachment; filename="grading-report-{timestamp}.html"`
- Body: HTML file content

**Error Response (400):**
```json
{
  "success": false,
  "error": "Results data is required"
}
```

---

## Configuration Endpoint

### Get Configuration

**GET** `/api/config`

Returns current rubric and configuration.

**Response:**
```json
{
  "success": true,
  "data": {
    "rubric": {
      "issueAssigned": 10,
      "commitsMade": 20,
      "prCreated": 20,
      "issueCompleted": 30,
      "prMerged": 10,
      "projectBoardWorkflow": 10
    },
    "projectBoardColumns": {
      "todo": "To Do",
      "inProgress": "In Progress",
      "done": "Done"
    },
    "aiProvider": "openai"
  }
}
```

---

## Error Codes

| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 201 | Created (team) |
| 400 | Bad Request (invalid data) |
| 404 | Not Found (team not found) |
| 500 | Internal Server Error |

---

## Rate Limiting

The bot uses GitHub's API which has rate limits:

- **Authenticated requests**: 5,000 requests per hour
- **Unauthenticated requests**: 60 requests per hour

Make sure to set `GITHUB_TOKEN` in `.env` for higher limits.

---

## Example Usage with cURL

### Create a team
```bash
curl -X POST http://localhost:3000/api/teams \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Team Alpha",
    "repoUrl": "https://github.com/owner/repo",
    "projectBoard": "1",
    "usernames": "student1, student2"
  }'
```

### Grade a team
```bash
curl -X POST http://localhost:3000/grade \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": "a1b2c3d4e5f6g7h8"
  }'
```

### Get all teams
```bash
curl http://localhost:3000/api/teams
```

### Delete a team
```bash
curl -X DELETE http://localhost:3000/api/teams/a1b2c3d4e5f6g7h8
```

---

## Example Usage with JavaScript/Fetch

### Create a team
```javascript
const response = await fetch('http://localhost:3000/api/teams', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Team Alpha',
    repoUrl: 'https://github.com/owner/repo',
    projectBoard: '1',
    usernames: 'student1, student2'
  })
});

const data = await response.json();
console.log(data);
```

### Grade a team
```javascript
const response = await fetch('http://localhost:3000/grade', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    teamId: 'a1b2c3d4e5f6g7h8'
  })
});

const data = await response.json();
console.log(data.data.results);
```

---

## Data Storage

- **Teams**: Stored in `data/teams.json`
- **Format**: JSON array of team objects
- **Backup**: Recommended to backup `data/teams.json` regularly

Example `teams.json`:
```json
[
  {
    "id": "a1b2c3d4e5f6g7h8",
    "name": "Team Alpha",
    "repoUrl": "https://github.com/owner/repo",
    "projectBoard": "1",
    "usernames": ["student1", "student2"],
    "createdAt": "2024-11-04T12:00:00.000Z",
    "updatedAt": "2024-11-04T12:00:00.000Z",
    "lastGradingDate": "2024-11-04T13:00:00.000Z",
    "lastGradingResults": { ... }
  }
]
```

## AI Analysis - How It Works

### Overview

The "Issue Completed" criterion (worth **30 points**, the highest point value) uses AI to verify that a student's pull request actually solves the issue they claimed to work on. This document explains how the AI analysis works and what it looks at.

### What the AI Analyzes

#### Primary Focus: Actual Code Changes

The AI **primarily analyzes the actual code changes** (the diff) in the pull request. It does NOT just compare descriptions.

**What the AI receives:**
1. **Issue Title** - The name of the issue
2. **Issue Body** - The detailed description of what needs to be done
3. **PR Title** - The name of the pull request
4. **PR Body** - The PR description
5. **PR Diff** - **MOST IMPORTANT** - The actual code changes (what files were modified, what lines were added/removed/changed)

### Analysis Process

1. **Code Examination**: The AI reads the diff to understand what code was actually modified
2. **File Identification**: It identifies which files were changed
3. **Change Nature**: It determines what kind of changes were made (e.g., CSS styling, JavaScript logic, HTML structure)
4. **Issue Comparison**: It compares the nature of the code changes against what the issue requested
5. **Relevance Check**: It verifies that the code changes are directly relevant to solving the issue
6. **Scope Verification**: It checks if the scope of changes is appropriate

### AI Prompt Strategy

The AI is explicitly instructed to:
- ✅ **Focus on the actual code diff**, not just descriptions
- ✅ Look at what files were modified
- ✅ Examine what code was added, removed, or changed
- ✅ Determine if those specific modifications address the issue
- ✅ Fail PRs where the code changes don't match the issue requirements

The AI is explicitly told to:
- ❌ **NOT** rely solely on comparing text descriptions
- ❌ **NOT** pass PRs based on good descriptions if the code doesn't match
- ❌ **NOT** accept irrelevant code changes

### Examples

#### Example 1: PASS - Good Code Alignment

**Issue:**
- Title: "Fix navigation menu not appearing on mobile"
- Body: "The navigation menu is not visible on screens smaller than 768px. Need to add mobile-friendly styles."

**PR Diff (what the AI sees):**
```diff
diff --git a/styles/navigation.css b/styles/navigation.css
--- a/styles/navigation.css
+++ b/styles/navigation.css
@@ -15,6 +15,14 @@
   display: flex;
   justify-content: space-between;
 }
+
+@media (max-width: 768px) {
+  .nav-menu {
+    display: block;
+    width: 100%;
+  }
+}
```

**AI Analysis:**
- ✅ **PASSED** (confidence: 90%)
- Explanation: "The code changes directly address the issue. The developer added mobile-responsive CSS media queries targeting screens below 768px and modified the navigation menu display properties, which will make the menu visible on mobile devices as requested."

#### Example 2: FAIL - Irrelevant Changes

**Issue:**
- Title: "Fix navigation menu not appearing on mobile"
- Body: "The navigation menu is not visible on screens smaller than 768px. Need to add mobile-friendly styles."

**PR Diff (what the AI sees):**
```diff
diff --git a/README.md b/README.md
--- a/README.md
+++ b/README.md
@@ -1,3 +1,4 @@
 # My Project
+Updated documentation
 
diff --git a/components/Footer.jsx b/components/Footer.jsx
--- a/components/Footer.jsx
+++ b/components/Footer.jsx
@@ -5,7 +5,7 @@
   return (
     <footer>
-      <p>Copyright 2024</p>
+      <p>Copyright 2025</p>
     </footer>
   );
```

**AI Analysis:**
- ❌ **FAILED** (confidence: 95%)
- Explanation: "The code changes do not address the issue. The issue requires fixing the navigation menu visibility on mobile devices, but the actual changes made were to README.md and the footer copyright year. No CSS or navigation-related code was modified."

#### Example 3: FAIL - Partial/Insufficient Work

**Issue:**
- Title: "Implement user login functionality"
- Body: "Create a login form with email and password fields. Validate credentials against the database and create a user session."

**PR Diff (what the AI sees):**
```diff
diff --git a/components/LoginForm.jsx b/components/LoginForm.jsx
--- /dev/null
+++ b/components/LoginForm.jsx
@@ -0,0 +1,10 @@
+export default function LoginForm() {
+  return (
+    <form>
+      <input type="email" placeholder="Email" />
+      <input type="password" placeholder="Password" />
+      <button>Login</button>
+    </form>
+  );
+}
```

**AI Analysis:**
- ❌ **FAILED** (confidence: 75%)
- Explanation: "The code changes only partially address the issue. While a login form component was created with email and password fields, the issue specifically requires credential validation against a database and session creation. No authentication logic, database queries, or session management code is present in the diff."

#### Example 4: PASS - Complete Implementation

**Issue:**
- Title: "Implement user login functionality"
- Body: "Create a login form with email and password fields. Validate credentials against the database and create a user session."

**PR Diff (what the AI sees):**
```diff
diff --git a/components/LoginForm.jsx b/components/LoginForm.jsx
--- /dev/null
+++ b/components/LoginForm.jsx
@@ -0,0 +1,25 @@
+import { useState } from 'react';
+import { authenticateUser } from '../services/auth';
+
+export default function LoginForm() {
+  const [email, setEmail] = useState('');
+  const [password, setPassword] = useState('');
+
+  const handleSubmit = async (e) => {
+    e.preventDefault();
+    try {
+      await authenticateUser(email, password);
+      // Session created by authenticateUser
+    } catch (error) {
+      alert('Login failed');
+    }
+  };
+
+  return (
+    <form onSubmit={handleSubmit}>
+      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
+      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
+      <button type="submit">Login</button>
+    </form>
+  );
+}
+
+diff --git a/services/auth.js b/services/auth.js
+--- /dev/null
+++ b/services/auth.js
+@@ -0,0 +1,20 @@
+import { db } from './database';
+import { createSession } from './session';
+
+export async function authenticateUser(email, password) {
+  const user = await db.users.findOne({ email });
+  
+  if (!user) {
+    throw new Error('User not found');
+  }
+  
+  const isValid = await comparePassword(password, user.passwordHash);
+  
+  if (!isValid) {
+    throw new Error('Invalid password');
+  }
+  
+  await createSession(user.id);
+  return user;
+}
```

**AI Analysis:**
- ✅ **PASSED** (confidence: 95%)
- Explanation: "The code changes fully address the issue requirements. The developer created a login form with email and password fields, implemented authentication logic that validates credentials against a database, and includes session creation. The implementation covers all aspects mentioned in the issue."

### Technical Details

#### Model Used
- **OpenAI GPT-4o-mini** (configurable in `config.json`)
- Temperature: 0.3 (for consistent, deterministic results)
- Max tokens: 500 (sufficient for analysis response)
- JSON response format (for reliable parsing)

#### Diff Size Limit
- Maximum diff size: **4000 characters**
- If a PR diff is longer, it's truncated with a note
- This prevents token limit issues while still capturing most changes

#### Empty Diff Handling
- If a PR has no code changes (empty diff), the analysis automatically **FAILS**
- Explanation: "PR diff is empty - no code changes to analyze"
- This prevents students from creating "description-only" PRs

#### Confidence Scoring
- The AI provides a confidence score from 0.0 to 1.0
- Higher confidence means the AI is more certain about its decision
- Displayed in the HTML report and console output

### Console Output

When grading, you'll see detailed logs:

```
   🤖 Analyzing PR #123 with AI...
      Issue: "Fix navigation menu not appearing on mobile"
      PR: "Add mobile responsive styles"
      Diff size: 2847 characters
      Files changed: 2
         - styles/navigation.css
         - styles/mobile.css
      🔍 Sending to AI for code analysis...
      AI Result: ✓ PASSED (confidence: 90%)
      Explanation: The code changes directly address the issue by adding mobile-responsive CSS...
```

### Why This Approach?

#### Prevents "Gaming" the System
Students cannot pass this criterion by:
- Writing good descriptions without making relevant code changes
- Making minimal/cosmetic changes unrelated to the issue
- Copy-pasting the issue description into the PR description

#### Ensures Real Learning
Students must:
- Actually understand the issue
- Make meaningful code modifications
- Solve the actual problem, not just describe it

#### Provides Objective Assessment
The AI analyzes concrete code changes, providing consistent evaluation based on what was actually done, not how well it was described.

### Limitations

#### AI Might Miss Context
- The AI only sees the diff, not the entire codebase
- Very complex issues might be difficult to fully assess
- The AI cannot run the code to verify it works

#### False Negatives Possible
- If a student makes legitimate changes but in unexpected ways, the AI might not recognize the connection
- Very large diffs (>4000 chars) are truncated

#### False Positives Possible
- If a student makes changes that look right but don't actually work, the AI might pass them
- The AI cannot test functionality, only analyze code intent

### Best Practices for Instructors

1. **Review AI Results**: Check the explanation when a score seems wrong
2. **Adjust Confidence Threshold**: Consider implementing a minimum confidence score if needed
3. **Manual Override**: For edge cases, you can manually adjust scores
4. **Clear Issues**: Write clear, specific issue descriptions for more accurate AI analysis
5. **Monitor Patterns**: If many students fail AI analysis, the issue description might be too vague

### Configuration

The AI provider can be changed in `config.json`:
```json
{
  "aiProvider": "openai"
}
```

API key must be set in `.env`:
```
OPENAI_API_KEY=your_key_here
```

### Future Enhancements

Potential improvements:
- Support for GitHub Copilot API as an alternative
- Configurable confidence thresholds
- Multi-PR analysis (analyze all related PRs, not just the first)
- Batch analysis for faster grading
- Code execution/testing for functional verification

## Usage Examples

### Example 1: Grading a Class Project

#### Scenario
You have a class of 5 students working on a project repository. Each student needs to:
- Create an issue for their assigned task
- Commit code to address the issue
- Create a pull request
- Get the PR reviewed and merged
- Move the issue through the project board

#### Setup

1. **Create a Project Board** on GitHub:
   - Go to your repository → Projects tab
   - Create a new project with columns: "To Do", "In Progress", "Done"

2. **Students create issues**:
   - Each student creates an issue describing their task
   - Assigns it to themselves
   - Adds it to the project board in "To Do" column

3. **Add Team in GitGrader**:
```
Team Name: Web Dev 101 - Fall 2024
Repository URL: https://github.com/school/student-project
Project Board: 1
Usernames: alice_dev, bob_codes, charlie_git, diana_tech, evan_prog
```

#### Grading

Click "Grade" on the team card. The bot will:

1. ✅ Check if each student assigned themselves an issue
2. ✅ Verify commits were made referencing the issues
3. ✅ Confirm PRs were created
4. ✅ Use AI to analyze if the PR actually solves the issue
5. ✅ Check if PRs were merged and issues closed
6. ✅ Verify issues moved through the project board workflow

#### Expected Results

**Alice (92/100 - A)**
- Issue Assigned: 10/10 ✓
- Commits Made: 20/20 ✓
- PR Created: 20/20 ✓
- Issue Completed: 30/30 ✓ (AI verified)
- PR Merged: 10/10 ✓
- Project Board: 2/10 ✗ (Only moved to "In Progress", not "Done")

**Bob (100/100 - A)**
- All criteria: ✓ Perfect score!

### Example 2: Quick Manual Grade

#### Scenario
You need to quickly grade a single student or test the bot without saving team data.

#### Steps

1. Go to the **Grade** tab
2. Use the "Quick Grade (Manual Input)" section
3. Fill in:
```
Repository URL: https://github.com/teacher/homework-repo
Project Board: 2
Usernames: student1, student2
```
4. Click "Start Grading"

This is useful for:
- One-time grading
- Testing the bot
- Different repo/project combinations

### Example 3: Multiple Teams with Same Repository

#### Scenario
You have multiple teams working on the same repository but different project boards.

#### Setup

**Team Alpha:**
```
Team Name: Team Alpha - Sprint 1
Repository URL: https://github.com/school/shared-project
Project Board: 1
Usernames: alice, bob, charlie
```

**Team Beta:**
```
Team Name: Team Beta - Sprint 1
Repository URL: https://github.com/school/shared-project
Project Board: 2
Usernames: diana, evan, frank
```

Each team has their own project board in the same repository.

### Example 4: Re-grading After Improvements

#### Scenario
A student initially failed some criteria and you want to re-grade after they fix their work.

#### Steps

1. Student makes improvements:
   - Adds better commit messages
   - Updates PR description
   - Moves issue through workflow

2. In GitGrader:
   - Go to **Teams** tab
   - Find the team
   - Click **"Grade"** button
   - New results will show improvements

3. Compare results:
   - Check "Last Graded" date to see previous grading
   - Export both reports for comparison

### Example 5: Exporting Reports for Records

#### Scenario
You need to keep permanent records of student grades.

#### Steps

1. After grading, go to **Results** tab
2. Click **"Export HTML Report"**
3. Save the file with a meaningful name: `team-alpha-sprint1-2024-11-04.html`

#### Benefits of HTML Export

- **Offline viewing**: Can be opened without the server running
- **Professional formatting**: Clean, printable layout
- **Complete data**: Includes all criteria, feedback, and statistics
- **Permanent record**: Won't change if you re-grade the team

#### Storage Recommendation

Create a folder structure:
```
grading-reports/
├── 2024-fall/
│   ├── team-alpha/
│   │   ├── sprint1-2024-09-15.html
│   │   ├── sprint2-2024-10-01.html
│   │   └── final-2024-11-15.html
│   └── team-beta/
│       ├── sprint1-2024-09-15.html
│       └── sprint2-2024-10-01.html
```

### Example 6: Custom Rubric Configuration

#### Scenario
You want to weight AI verification less and project board workflow more.

#### Steps

1. Edit `config.json`:
```json
{
  "rubric": {
    "issueAssigned": 10,
    "commitsMade": 25,
    "prCreated": 20,
    "issueCompleted": 20,
    "prMerged": 10,
    "projectBoardWorkflow": 15
  },
  "projectBoardColumns": {
    "todo": "To Do",
    "inProgress": "In Progress",
    "done": "Done"
  },
  "aiProvider": "openai"
}
```

2. Restart the server:
```bash
npm start
```

3. New gradings will use the updated rubric

#### Rubric Customization Ideas

**Emphasize Code Quality:**
```json
{
  "issueAssigned": 5,
  "commitsMade": 25,
  "prCreated": 15,
  "issueCompleted": 40,
  "prMerged": 10,
  "projectBoardWorkflow": 5
}
```

**Emphasize Process:**
```json
{
  "issueAssigned": 15,
  "commitsMade": 20,
  "prCreated": 20,
  "issueCompleted": 20,
  "prMerged": 10,
  "projectBoardWorkflow": 15
}
```

### Example 7: Handling Common Issues

#### Issue: Student didn't reference issue in commits

**Problem:** Student made commits but didn't use `#issue_number`

**Solution:**
- Teach students to use commit messages like:
  - "Add login feature #42"
  - "Fix bug #15"
  - "Implement feature closes #23"

#### Issue: PR not linked to issue

**Problem:** Student created PR but it's not connected to their issue

**Solution:**
- Use keywords in PR description:
  - "Closes #42"
  - "Fixes #15"
  - "Resolves #23"
- Or manually link PR to issue in GitHub

#### Issue: Project board not updated

**Problem:** Student completed work but didn't move issue cards

**Solution:**
- Teach students to drag issues between columns as they work
- Or use GitHub automation to move cards when PRs are merged

### Example 8: API Rate Limiting

#### Scenario
Grading many students triggers GitHub API rate limits.

#### Symptoms
- Grading takes very long
- Error messages about rate limits
- Some data missing

#### Solutions

1. **Grade in smaller batches:**
   - Create separate teams with fewer students
   - Grade teams one at a time with breaks

2. **Use authenticated token:**
   - Make sure `GITHUB_TOKEN` is set correctly
   - Authenticated requests have higher rate limits (5000/hour vs 60/hour)

3. **Wait between gradings:**
   - GitHub API rate limits reset hourly
   - Check remaining rate limit at: https://api.github.com/rate_limit

### Example 9: Sharing Results with Students

#### Option 1: Export and Email
1. Grade the team
2. Export HTML report
3. Email the file to students

#### Option 2: Screen Share
1. Run grading during class
2. Share screen showing live results
3. Discuss criteria and improvements

#### Option 3: Individual Reports
1. Create separate teams for each student
2. Grade individually
3. Export personal reports

### Tips for Effective Grading

1. **Set Clear Expectations**
   - Share the rubric with students beforehand
   - Explain each criterion
   - Show examples of good practices

2. **Grade Regularly**
   - Don't wait until the end of the project
   - Weekly or bi-weekly gradings help students improve
   - Track progress over time

3. **Use Results for Teaching**
   - Common failures indicate teaching opportunities
   - Share successful examples with the class
   - Adjust rubric based on learning goals

4. **Combine with Manual Review**
   - Use the bot for objective criteria
   - Add manual review for code quality, creativity, etc.
   - Bot saves time on tedious checks

5. **Keep Records**
   - Export HTML reports regularly
   - Document any manual adjustments
   - Track improvement over sprints

### Troubleshooting Common Scenarios

#### All Students Score 0
- Check that students actually assigned issues to themselves
- Verify repository URL is correct
- Ensure project board number is correct

#### AI Analysis Always Fails
- Check OpenAI API key is valid
- Verify you have credits in your OpenAI account
- Check internet connection
- Look for error messages in terminal

#### Project Board Workflow Always Fails
- Verify column names match config.json
- Check that issues were actually added to the project board
- Ensure students moved cards between columns

#### Different Results When Re-grading
- Students may have made changes
- GitHub data may have been updated
- Check timestamps on issues, PRs, and commits

## License

ISC

## Support

For issues and questions, please open an issue on the GitHub repository.

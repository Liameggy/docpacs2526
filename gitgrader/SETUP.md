# GitHub Grading Bot - Setup Guide

## Prerequisites

Before you begin, make sure you have:

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **GitHub Personal Access Token** - [Create one here](https://github.com/settings/tokens)
3. **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)

## Step 1: Install Dependencies

The dependencies should already be installed. If not, run:

```bash
npm install
```

## Step 2: Configure Environment Variables

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

## Step 3: Configure Rubric (Optional)

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

## Step 4: Start the Server

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

## Step 5: Open the Web Interface

Open your browser and navigate to:

```
http://localhost:3000
```

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

## File Structure

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

## Support

For issues or questions, please refer to the main README.md or check the application logs.


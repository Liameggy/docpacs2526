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

## Configuration

Edit `config.json` to customize:

- **Rubric points** for each criterion
- **Project board column names** (To Do, In Progress, Done)
- **AI provider** (openai or copilot)

## API Endpoints

### Team Management
- `GET /api/teams` - List all saved teams
- `POST /api/teams` - Create new team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `GET /api/teams/:id` - Get single team details

### Grading
- `POST /grade` - Process grading request
- `GET /export/:teamId` - Generate standalone HTML report

## Project Structure

```
gitgrader/
├── src/
│   ├── server.js              # Express server
│   ├── services/
│   │   ├── githubService.js   # GitHub API integration
│   │   ├── aiService.js       # AI analysis
│   │   ├── gradingService.js  # Grading logic
│   │   ├── dataService.js     # Team data persistence
│   │   └── reportGenerator.js # HTML report generation
│   └── utils/
│       └── helpers.js         # Utility functions
├── public/
│   ├── index.html             # Web interface
│   ├── styles.css             # Styling
│   └── client.js              # Client-side JavaScript
├── data/
│   └── teams.json             # Saved teams
├── config.json                # Configuration
└── .env                       # Environment variables
```

## License

ISC

## Support

For issues and questions, please open an issue on the GitHub repository.


require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const GradingService = require('./services/gradingService');
const DataService = require('./services/dataService');
const ReportGenerator = require('./services/reportGenerator');
const { parseUsernames, validateTeamData, errorResponse, successResponse } = require('./utils/helpers');
const { getDefaultDateRange } = require('./utils/dateHelpers');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Load configuration
let config;
try {
  config = require('../config.json');
} catch (error) {
  console.error('Error loading config.json:', error.message);
  process.exit(1);
}

// Initialize services
const dataService = new DataService();
const reportGenerator = new ReportGenerator();

// Validate environment variables
if (!process.env.GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN is required in .env file');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY not set. AI analysis will not be available.');
}

// ==================== TEAM MANAGEMENT ROUTES ====================

/**
 * GET /api/teams - List all teams
 */
app.get('/api/teams', async (req, res) => {
  try {
    const teams = await dataService.getAllTeams();
    res.json(successResponse(teams));
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json(errorResponse('Failed to fetch teams', error.message));
  }
});

/**
 * GET /api/teams/:id - Get single team
 */
app.get('/api/teams/:id', async (req, res) => {
  try {
    const team = await dataService.getTeamById(req.params.id);
    if (!team) {
      return res.status(404).json(errorResponse('Team not found'));
    }
    res.json(successResponse(team));
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json(errorResponse('Failed to fetch team', error.message));
  }
});

/**
 * POST /api/teams - Create new team
 */
app.post('/api/teams', async (req, res) => {
  try {
    const teamData = {
      name: req.body.name,
      repoUrl: req.body.repoUrl,
      projectBoard: req.body.projectBoard,
      usernames: parseUsernames(req.body.usernames),
    };

    const validation = validateTeamData(teamData);
    if (!validation.valid) {
      return res.status(400).json(errorResponse('Invalid team data', validation.errors));
    }

    const team = await dataService.createTeam(teamData);
    res.status(201).json(successResponse(team));
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json(errorResponse('Failed to create team', error.message));
  }
});

/**
 * PUT /api/teams/:id - Update team
 */
app.put('/api/teams/:id', async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      repoUrl: req.body.repoUrl,
      projectBoard: req.body.projectBoard,
      usernames: req.body.usernames ? parseUsernames(req.body.usernames) : undefined,
    };

    // Remove undefined values
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    const team = await dataService.updateTeam(req.params.id, updates);
    res.json(successResponse(team));
  } catch (error) {
    console.error('Error updating team:', error);
    const status = error.message.includes('not found') ? 404 : 500;
    res.status(status).json(errorResponse('Failed to update team', error.message));
  }
});

/**
 * DELETE /api/teams/:id - Delete team
 */
app.delete('/api/teams/:id', async (req, res) => {
  try {
    await dataService.deleteTeam(req.params.id);
    res.json(successResponse({ message: 'Team deleted successfully' }));
  } catch (error) {
    console.error('Error deleting team:', error);
    const status = error.message.includes('not found') ? 404 : 500;
    res.status(status).json(errorResponse('Failed to delete team', error.message));
  }
});

// ==================== GRADING ROUTES ====================

/**
 * POST /grade - Grade a team
 */
app.post('/grade', async (req, res) => {
  try {
    let repoUrl, projectBoard, usernames, teamId, teamName;

    // Check if using saved team or manual input
    if (req.body.teamId) {
      const team = await dataService.getTeamById(req.body.teamId);
      if (!team) {
        return res.status(404).json(errorResponse('Team not found'));
      }
      repoUrl = team.repoUrl;
      projectBoard = team.projectBoard;
      usernames = team.usernames;
      teamId = team.id;
      teamName = team.name;
    } else {
      repoUrl = req.body.repoUrl;
      projectBoard = req.body.projectBoard;
      usernames = parseUsernames(req.body.usernames);
      teamName = req.body.teamName || 'Unnamed Team';
    }

    if (!repoUrl || !projectBoard || !usernames || usernames.length === 0) {
      return res.status(400).json(errorResponse('Missing required fields: repoUrl, projectBoard, usernames'));
    }

    // Get date range (use provided or default to two Mondays ago to most recent Monday)
    let dateRange = null;
    if (req.body.startDate && req.body.endDate) {
      dateRange = {
        startDate: req.body.startDate,
        endDate: req.body.endDate,
      };
    } else {
      // Use default date range
      dateRange = getDefaultDateRange();
    }

    console.log(`Date range: ${dateRange.startDate} to ${dateRange.endDate}`);

    // Initialize grading service with date range
    const gradingService = new GradingService(
      config,
      process.env.GITHUB_TOKEN,
      {
        provider: config.aiProvider,
        openaiApiKey: process.env.OPENAI_API_KEY,
        copilotApiKey: process.env.COPILOT_API_KEY,
      },
      dateRange
    );

    // Perform grading
    console.log(`Starting grading for team: ${teamName}`);
    const results = await gradingService.gradeTeam(repoUrl, projectBoard, usernames);

    // Save results if this is a saved team
    if (teamId) {
      await dataService.saveGradingResults(teamId, results);
    }

    res.json(successResponse({
      results,
      teamId,
      teamName,
    }));
  } catch (error) {
    console.error('Error during grading:', error);
    res.status(500).json(errorResponse('Grading failed', error.message));
  }
});

/**
 * POST /export - Export results as HTML
 */
app.post('/export', async (req, res) => {
  try {
    const { results, teamName } = req.body;

    if (!results) {
      return res.status(400).json(errorResponse('Results data is required'));
    }

    const html = reportGenerator.generateHTMLReport(results, teamName || 'Team');

    // Set headers for file download
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="grading-report-${Date.now()}.html"`);
    res.send(html);
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json(errorResponse('Failed to export report', error.message));
  }
});

/**
 * GET /api/config - Get current configuration
 */
app.get('/api/config', (req, res) => {
  res.json(successResponse({
    rubric: config.rubric,
    projectBoardColumns: config.projectBoardColumns,
    aiProvider: config.aiProvider,
  }));
});

// ==================== ERROR HANDLING ====================

app.use((req, res) => {
  res.status(404).json(errorResponse('Route not found'));
});

app.use((err, req, res, next) => {
  console.error('Unexpected error:', err);
  res.status(500).json(errorResponse('Internal server error', err.message));
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   GitHub Grading Bot Server Running   ║
╠════════════════════════════════════════╣
║  URL: http://localhost:${PORT}          ║
║  Environment: ${process.env.NODE_ENV || 'development'}           ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;


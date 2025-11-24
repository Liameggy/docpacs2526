const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const express = require('express');
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
app.use(express.static(path.resolve(__dirname, '..', 'public')));

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

// Reports directory
const REPORTS_DIR = path.resolve(__dirname, '..', 'reports');

// Ensure reports directory exists
async function ensureReportsDir() {
  try {
    await fs.access(REPORTS_DIR);
  } catch {
    await fs.mkdir(REPORTS_DIR, { recursive: true });
  }
}

// Initialize reports directory on startup
ensureReportsDir().catch(err => {
  console.error('Error creating reports directory:', err);
});

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

// ==================== CLASS MANAGEMENT ROUTES ====================

/**
 * GET /api/classes - List all classes
 */
app.get('/api/classes', async (req, res) => {
  try {
    const classes = await dataService.getAllClasses();
    res.json(successResponse(classes));
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json(errorResponse('Failed to fetch classes', error.message));
  }
});

/**
 * GET /api/classes/:id - Get single class
 */
app.get('/api/classes/:id', async (req, res) => {
  try {
    const cls = await dataService.getClassById(req.params.id);
    if (!cls) {
      return res.status(404).json(errorResponse('Class not found'));
    }
    res.json(successResponse(cls));
  } catch (error) {
    console.error('Error fetching class:', error);
    res.status(500).json(errorResponse('Failed to fetch class', error.message));
  }
});

/**
 * POST /api/classes - Create new class
 */
app.post('/api/classes', async (req, res) => {
  try {
    const classData = {
      name: req.body.name,
      usernames: parseUsernames(req.body.usernames),
    };

    if (!classData.name || !classData.usernames || classData.usernames.length === 0) {
      return res.status(400).json(errorResponse('Missing required fields: name, usernames'));
    }

    const cls = await dataService.createClass(classData);
    res.status(201).json(successResponse(cls));
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json(errorResponse('Failed to create class', error.message));
  }
});

/**
 * PUT /api/classes/:id - Update class
 */
app.put('/api/classes/:id', async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      usernames: req.body.usernames ? parseUsernames(req.body.usernames) : undefined,
    };

    // Remove undefined values
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    const cls = await dataService.updateClass(req.params.id, updates);
    res.json(successResponse(cls));
  } catch (error) {
    console.error('Error updating class:', error);
    const status = error.message.includes('not found') ? 404 : 500;
    res.status(status).json(errorResponse('Failed to update class', error.message));
  }
});

/**
 * DELETE /api/classes/:id - Delete class
 */
app.delete('/api/classes/:id', async (req, res) => {
  try {
    await dataService.deleteClass(req.params.id);
    res.json(successResponse({ message: 'Class deleted successfully' }));
  } catch (error) {
    console.error('Error deleting class:', error);
    const status = error.message.includes('not found') ? 404 : 500;
    res.status(status).json(errorResponse('Failed to delete class', error.message));
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

    // Generate and save HTML report
    await ensureReportsDir();
    const timestamp = Date.now();
    const safeTeamName = teamName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const reportFilename = `grading-report-${safeTeamName}-${timestamp}.html`;
    const reportPath = path.join(REPORTS_DIR, reportFilename);
    const reportRelativePath = `reports/${reportFilename}`;
    
    const html = reportGenerator.generateHTMLReport(results, teamName);
    await fs.writeFile(reportPath, html, 'utf8');
    console.log(`Report saved to: ${reportPath}`);

    // Save results and report path if this is a saved team
    let reportPathStored = null;
    if (teamId) {
      await dataService.saveGradingResults(teamId, results, reportRelativePath);
      reportPathStored = reportRelativePath;
    }

    res.json(successResponse({
      results,
      teamId,
      teamName,
      reportPath: reportRelativePath,
    }));
  } catch (error) {
    console.error('Error during grading:', error);
    res.status(500).json(errorResponse('Grading failed', error.message));
  }
});

/**
 * POST /export - Export results as HTML (serves saved file)
 */
app.post('/export', async (req, res) => {
  try {
    const { reportPath, teamId } = req.body;

    let filePath = null;

    // If teamId is provided, get the report path from team data
    if (teamId) {
      const team = await dataService.getTeamById(teamId);
      if (team && team.lastReportPath) {
        filePath = path.resolve(__dirname, '..', team.lastReportPath);
      }
    } else if (reportPath) {
      // Use provided report path
      filePath = path.resolve(__dirname, '..', reportPath);
    }

    if (!filePath) {
      return res.status(404).json(errorResponse('Report file not found. Please re-grade the team to generate a new report.'));
    }

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json(errorResponse('Report file not found. Please re-grade the team to generate a new report.'));
    }

    // Read and serve the file
    const html = await fs.readFile(filePath, 'utf8');
    const filename = path.basename(filePath);

    // Set headers for file download
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(html);
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json(errorResponse('Failed to export report', error.message));
  }
});

/**
 * POST /grade/user - Grade a single user across all repos
 */
app.post('/grade/user', async (req, res) => {
  try {
    const username = req.body.username;
    
    if (!username) {
      return res.status(400).json(errorResponse('Missing required field: username'));
    }

    // Get date range (use provided or default to two Mondays ago to most recent Monday)
    let dateRange = null;
    if (req.body.startDate && req.body.endDate) {
      dateRange = {
        startDate: req.body.startDate,
        endDate: req.body.endDate,
      };
    } else {
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
    console.log(`Starting grading for user: ${username}`);
    const result = await gradingService.gradeUserAcrossRepos(username);

    // Generate and save HTML report
    await ensureReportsDir();
    const timestamp = Date.now();
    const safeUsername = username.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const reportFilename = `grading-report-user-${safeUsername}-${timestamp}.html`;
    const reportPath = path.join(REPORTS_DIR, reportFilename);
    const reportRelativePath = `reports/${reportFilename}`;
    
    // Wrap result in a format compatible with report generator
    const resultsForReport = {
      type: 'user',
      repository: 'All Repositories',
      gradedAt: new Date().toISOString(),
      dateRange: dateRange,
      students: [result],
      statistics: {
        totalStudents: 1,
        averageScore: result.totalScore,
        highestScore: result.totalScore,
        lowestScore: result.totalScore,
        passingCount: result.percentage >= 60 ? 1 : 0,
        passingRate: result.percentage >= 60 ? '100.0' : '0.0',
      },
    };
    
    const html = reportGenerator.generateHTMLReport(resultsForReport, `User: ${username}`);
    await fs.writeFile(reportPath, html, 'utf8');
    console.log(`Report saved to: ${reportPath}`);

    res.json(successResponse({
      results: resultsForReport,
      username,
      reportPath: reportRelativePath,
    }));
  } catch (error) {
    console.error('Error during user grading:', error);
    res.status(500).json(errorResponse('User grading failed', error.message));
  }
});

/**
 * POST /grade/class - Grade a class across all repos
 */
app.post('/grade/class', async (req, res) => {
  try {
    let usernames, classId, className;

    // Check if using saved class or manual input
    if (req.body.classId) {
      const cls = await dataService.getClassById(req.body.classId);
      if (!cls) {
        return res.status(404).json(errorResponse('Class not found'));
      }
      usernames = cls.usernames;
      classId = cls.id;
      className = cls.name;
    } else {
      usernames = parseUsernames(req.body.usernames);
      className = req.body.className || 'Unnamed Class';
    }

    if (!usernames || usernames.length === 0) {
      return res.status(400).json(errorResponse('Missing required field: usernames'));
    }

    // Get date range (use provided or default to two Mondays ago to most recent Monday)
    let dateRange = null;
    if (req.body.startDate && req.body.endDate) {
      dateRange = {
        startDate: req.body.startDate,
        endDate: req.body.endDate,
      };
    } else {
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
    console.log(`Starting grading for class: ${className}`);
    const results = await gradingService.gradeClassAcrossRepos(usernames);

    // Generate and save HTML report
    await ensureReportsDir();
    const timestamp = Date.now();
    const safeClassName = className.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const reportFilename = `grading-report-class-${safeClassName}-${timestamp}.html`;
    const reportPath = path.join(REPORTS_DIR, reportFilename);
    const reportRelativePath = `reports/${reportFilename}`;
    
    const html = reportGenerator.generateHTMLReport(results, className);
    await fs.writeFile(reportPath, html, 'utf8');
    console.log(`Report saved to: ${reportPath}`);

    // Save results and report path if this is a saved class
    let reportPathStored = null;
    if (classId) {
      await dataService.saveClassGradingResults(classId, results, reportRelativePath);
      reportPathStored = reportRelativePath;
    }

    res.json(successResponse({
      results,
      classId,
      className,
      reportPath: reportRelativePath,
    }));
  } catch (error) {
    console.error('Error during class grading:', error);
    res.status(500).json(errorResponse('Class grading failed', error.message));
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


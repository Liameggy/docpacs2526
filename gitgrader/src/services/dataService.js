const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class DataService {
  constructor(dataFilePath = './data/teams.json') {
    this.dataFilePath = dataFilePath;
  }

  /**
   * Ensure the data file exists
   */
  async ensureDataFile() {
    try {
      await fs.access(this.dataFilePath);
    } catch {
      // File doesn't exist, create it with empty array
      await fs.writeFile(this.dataFilePath, JSON.stringify([], null, 2));
    }
  }

  /**
   * Read all teams from the data file
   */
  async getAllTeams() {
    await this.ensureDataFile();
    const data = await fs.readFile(this.dataFilePath, 'utf8');
    return JSON.parse(data);
  }

  /**
   * Get a single team by ID
   */
  async getTeamById(id) {
    const teams = await this.getAllTeams();
    return teams.find(team => team.id === id);
  }

  /**
   * Create a new team
   */
  async createTeam(teamData) {
    const teams = await this.getAllTeams();
    
    const newTeam = {
      id: crypto.randomBytes(8).toString('hex'),
      name: teamData.name,
      repoUrl: teamData.repoUrl,
      projectBoard: teamData.projectBoard,
      usernames: teamData.usernames || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastGradingDate: null,
      lastGradingResults: null,
    };

    teams.push(newTeam);
    await fs.writeFile(this.dataFilePath, JSON.stringify(teams, null, 2));
    
    return newTeam;
  }

  /**
   * Update an existing team
   */
  async updateTeam(id, updates) {
    const teams = await this.getAllTeams();
    const index = teams.findIndex(team => team.id === id);
    
    if (index === -1) {
      throw new Error(`Team with ID ${id} not found`);
    }

    teams[index] = {
      ...teams[index],
      ...updates,
      id: teams[index].id, // Preserve original ID
      createdAt: teams[index].createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    };

    await fs.writeFile(this.dataFilePath, JSON.stringify(teams, null, 2));
    
    return teams[index];
  }

  /**
   * Delete a team
   */
  async deleteTeam(id) {
    const teams = await this.getAllTeams();
    const filteredTeams = teams.filter(team => team.id !== id);
    
    if (filteredTeams.length === teams.length) {
      throw new Error(`Team with ID ${id} not found`);
    }

    await fs.writeFile(this.dataFilePath, JSON.stringify(filteredTeams, null, 2));
    
    return true;
  }

  /**
   * Save grading results for a team
   */
  async saveGradingResults(id, results, reportPath = null) {
    const updates = {
      lastGradingDate: new Date().toISOString(),
      lastGradingResults: results,
    };
    
    if (reportPath) {
      updates.lastReportPath = reportPath;
    }
    
    return await this.updateTeam(id, updates);
  }

  /**
   * Get grading history for a team
   */
  async getGradingHistory(id) {
    const team = await this.getTeamById(id);
    if (!team) {
      throw new Error(`Team with ID ${id} not found`);
    }
    
    return {
      lastGradingDate: team.lastGradingDate,
      results: team.lastGradingResults,
    };
  }

  // ==================== CLASS MANAGEMENT ====================

  /**
   * Get the classes data file path
   */
  getClassesFilePath() {
    return this.dataFilePath.replace('teams.json', 'classes.json');
  }

  /**
   * Ensure the classes data file exists
   */
  async ensureClassesFile() {
    const classesFilePath = this.getClassesFilePath();
    try {
      await fs.access(classesFilePath);
    } catch {
      // File doesn't exist, create it with empty array
      await fs.writeFile(classesFilePath, JSON.stringify([], null, 2));
    }
  }

  /**
   * Read all classes from the data file
   */
  async getAllClasses() {
    await this.ensureClassesFile();
    const classesFilePath = this.getClassesFilePath();
    const data = await fs.readFile(classesFilePath, 'utf8');
    return JSON.parse(data);
  }

  /**
   * Get a single class by ID
   */
  async getClassById(id) {
    const classes = await this.getAllClasses();
    return classes.find(cls => cls.id === id);
  }

  /**
   * Create a new class
   */
  async createClass(classData) {
    const classes = await this.getAllClasses();
    
    const newClass = {
      id: crypto.randomBytes(8).toString('hex'),
      name: classData.name,
      usernames: classData.usernames || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastGradingDate: null,
      lastGradingResults: null,
    };

    classes.push(newClass);
    const classesFilePath = this.getClassesFilePath();
    await fs.writeFile(classesFilePath, JSON.stringify(classes, null, 2));
    
    return newClass;
  }

  /**
   * Update an existing class
   */
  async updateClass(id, updates) {
    const classes = await this.getAllClasses();
    const index = classes.findIndex(cls => cls.id === id);
    
    if (index === -1) {
      throw new Error(`Class with ID ${id} not found`);
    }

    classes[index] = {
      ...classes[index],
      ...updates,
      id: classes[index].id, // Preserve original ID
      createdAt: classes[index].createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    };

    const classesFilePath = this.getClassesFilePath();
    await fs.writeFile(classesFilePath, JSON.stringify(classes, null, 2));
    
    return classes[index];
  }

  /**
   * Delete a class
   */
  async deleteClass(id) {
    const classes = await this.getAllClasses();
    const filteredClasses = classes.filter(cls => cls.id !== id);
    
    if (filteredClasses.length === classes.length) {
      throw new Error(`Class with ID ${id} not found`);
    }

    const classesFilePath = this.getClassesFilePath();
    await fs.writeFile(classesFilePath, JSON.stringify(filteredClasses, null, 2));
    
    return true;
  }

  /**
   * Save grading results for a class
   */
  async saveClassGradingResults(id, results, reportPath = null) {
    const updates = {
      lastGradingDate: new Date().toISOString(),
      lastGradingResults: results,
    };
    
    if (reportPath) {
      updates.lastReportPath = reportPath;
    }
    
    return await this.updateClass(id, updates);
  }

  /**
   * Get grading history for a class
   */
  async getClassGradingHistory(id) {
    const cls = await this.getClassById(id);
    if (!cls) {
      throw new Error(`Class with ID ${id} not found`);
    }
    
    return {
      lastGradingDate: cls.lastGradingDate,
      results: cls.lastGradingResults,
    };
  }
}

module.exports = DataService;


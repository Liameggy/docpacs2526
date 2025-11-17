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
  async saveGradingResults(id, results) {
    return await this.updateTeam(id, {
      lastGradingDate: new Date().toISOString(),
      lastGradingResults: results,
    });
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
}

module.exports = DataService;


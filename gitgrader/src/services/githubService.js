const { Octokit } = require('@octokit/rest');

class GitHubService {
  constructor(token, dateRange = null) {
    this.octokit = new Octokit({
      auth: token,
    });
    this.cache = new Map();
    this.dateRange = dateRange; // { startDate, endDate }
  }

  /**
   * Set or update the date range for filtering
   */
  setDateRange(startDate, endDate) {
    this.dateRange = { startDate, endDate };
  }

  /**
   * Check if a date is within the configured date range
   */
  isWithinDateRange(date) {
    if (!this.dateRange) return true;
    
    const checkDate = new Date(date);
    const start = new Date(this.dateRange.startDate);
    const end = new Date(this.dateRange.endDate);
    
    // Set end date to end of day
    end.setHours(23, 59, 59, 999);
    
    return checkDate >= start && checkDate <= end;
  }

  /**
   * Parse GitHub repository URL to extract owner and repo name
   */
  parseRepoUrl(repoUrl) {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub repository URL');
    }
    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, ''),
    };
  }

  /**
   * Parse project board URL or number
   */
  parseProjectBoard(projectInput) {
    // If it's a number, return it directly
    if (/^\d+$/.test(projectInput)) {
      return parseInt(projectInput, 10);
    }
    
    // Try to extract project number from URL
    const match = projectInput.match(/projects\/(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    
    throw new Error('Invalid project board format. Provide project number or URL.');
  }

  /**
   * Get all issues assigned to a specific user in the repository
   */
  async getUserIssues(owner, repo, username) {
    const cacheKey = `issues-${owner}-${repo}-${username}-${JSON.stringify(this.dateRange)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const { data } = await this.octokit.issues.listForRepo({
        owner,
        repo,
        assignee: username,
        state: 'all',
        per_page: 100,
        sort: 'updated',
        direction: 'desc',
      });

      console.log(`      📅 Date range filter: ${this.dateRange ? 'ENABLED' : 'DISABLED'}`);
      if (this.dateRange) {
        console.log(`         Start: ${new Date(this.dateRange.startDate).toLocaleDateString()}`);
        console.log(`         End: ${new Date(this.dateRange.endDate).toLocaleDateString()}`);
      }
      
      console.log(`      🔍 Found ${data.length} total issue(s) assigned to ${username} in GitHub`);
      
      if (data.length > 0 && this.dateRange) {
        console.log(`      Filtering by date range...`);
        data.forEach(issue => {
          const issueDate = new Date(issue.updated_at);
          const inRange = this.isWithinDateRange(issue.updated_at);
          console.log(`         - Issue #${issue.number}: updated ${issueDate.toLocaleDateString()} ${inRange ? '✓ INCLUDED' : '✗ EXCLUDED (outside date range)'}`);
        });
      }

      // Filter by date range if specified
      const filteredData = this.dateRange 
        ? data.filter(issue => this.isWithinDateRange(issue.updated_at))
        : data;

      console.log(`      ✓ After date filtering: ${filteredData.length} issue(s)`);

      this.cache.set(cacheKey, filteredData);
      return filteredData;
    } catch (error) {
      console.error(`Error fetching issues for ${username}:`, error.message);
      throw new Error(`Failed to fetch issues for user ${username}: ${error.message}`);
    }
  }

  /**
   * Get commits for a specific issue
   */
  async getIssueCommits(owner, repo, issueNumber) {
    const cacheKey = `commits-${owner}-${repo}-${issueNumber}-${JSON.stringify(this.dateRange)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Get timeline events for the issue to find commits
      const { data: timeline } = await this.octokit.issues.listEventsForTimeline({
        owner,
        repo,
        issue_number: issueNumber,
        per_page: 100,
      });

      // Filter for commit references and filter by date if specified
      const commits = timeline
        .filter(event => event.event === 'referenced' || event.event === 'committed')
        .filter(event => !this.dateRange || this.isWithinDateRange(event.created_at))
        .map(event => ({
          sha: event.commit_id || event.sha,
          message: event.commit?.message || '',
          author: event.actor?.login || event.commit?.author?.name || '',
          date: event.created_at,
        }));

      // Also search for commits that mention the issue number
      const commitParams = {
        owner,
        repo,
        per_page: 100,
      };
      
      // Add date filtering for commits API if date range specified
      if (this.dateRange) {
        commitParams.since = this.dateRange.startDate;
        commitParams.until = this.dateRange.endDate;
      }

      const { data: allCommits } = await this.octokit.repos.listCommits(commitParams);

      const issuePattern = new RegExp(`#${issueNumber}\\b`, 'i');
      const mentioningCommits = allCommits
        .filter(commit => issuePattern.test(commit.commit.message))
        .map(commit => ({
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.author?.login || commit.commit.author.name,
          date: commit.commit.author.date,
        }));

      // Combine and deduplicate
      const allIssueCommits = [...commits, ...mentioningCommits];
      const uniqueCommits = Array.from(
        new Map(allIssueCommits.map(c => [c.sha, c])).values()
      );

      this.cache.set(cacheKey, uniqueCommits);
      return uniqueCommits;
    } catch (error) {
      console.error(`Error fetching commits for issue #${issueNumber}:`, error.message);
      return [];
    }
  }

  /**
   * Get pull requests associated with an issue
   */
  async getIssuePullRequests(owner, repo, issueNumber) {
    const cacheKey = `prs-${owner}-${repo}-${issueNumber}-${JSON.stringify(this.dateRange)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Get timeline events to find linked PRs
      const { data: timeline } = await this.octokit.issues.listEventsForTimeline({
        owner,
        repo,
        issue_number: issueNumber,
        per_page: 100,
      });

      // Find cross-referenced PRs
      const prNumbers = new Set();
      timeline.forEach(event => {
        if (event.event === 'cross-referenced' && event.source?.issue?.pull_request) {
          prNumbers.add(event.source.issue.number);
        }
        if (event.event === 'connected' || event.event === 'referenced') {
          // Some events might have PR references
          if (event.commit_id) {
            // We'll need to check if commits belong to PRs
          }
        }
      });

      // Also check if the issue itself is a PR
      try {
        const { data: pr } = await this.octokit.pulls.get({
          owner,
          repo,
          pull_number: issueNumber,
        });
        prNumbers.add(issueNumber);
      } catch {
        // Not a PR, that's fine
      }

      // Fetch full PR details and filter by date
      const prs = [];
      for (const prNumber of prNumbers) {
        try {
          const { data: pr } = await this.octokit.pulls.get({
            owner,
            repo,
            pull_number: prNumber,
          });
          
          // Filter by date range if specified
          // Check both created_at and merged_at/updated_at to catch PRs merged within date range
          if (!this.dateRange) {
            prs.push(pr);
          } else {
            const createdInRange = this.isWithinDateRange(pr.created_at);
            const mergedInRange = pr.merged_at ? this.isWithinDateRange(pr.merged_at) : false;
            const updatedInRange = pr.updated_at ? this.isWithinDateRange(pr.updated_at) : false;
            
            if (createdInRange || mergedInRange || updatedInRange) {
              prs.push(pr);
            }
          }
        } catch (error) {
          console.error(`Error fetching PR #${prNumber}:`, error.message);
        }
      }

      this.cache.set(cacheKey, prs);
      return prs;
    } catch (error) {
      console.error(`Error fetching PRs for issue #${issueNumber}:`, error.message);
      return [];
    }
  }

  /**
   * Get issues linked to a pull request
   */
  async getPullRequestLinkedIssues(owner, repo, prNumber) {
    const cacheKey = `pr-linked-issues-${owner}-${repo}-${prNumber}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Get PR details to check body for issue references
      const { data: pr } = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: prNumber,
      });

      const linkedIssues = [];

      // Extract issue numbers from PR body
      const issuePattern = /(?:closes?|fixes?|resolves?|completes?)\s*#(\d+)/gi;
      const matches = (pr.body || '').matchAll(issuePattern);
      const issueNumbers = Array.from(matches, m => parseInt(m[1]));

      // Fetch each linked issue
      for (const issueNumber of issueNumbers) {
        try {
          const { data: issue } = await this.octokit.issues.get({
            owner,
            repo,
            issue_number: issueNumber,
          });
          linkedIssues.push({
            number: issue.number,
            title: issue.title,
            body: issue.body || '',
            state: issue.state,
            html_url: issue.html_url,
          });
        } catch (error) {
          console.error(`Error fetching issue #${issueNumber} for PR #${prNumber}:`, error.message);
        }
      }

      this.cache.set(cacheKey, linkedIssues);
      return linkedIssues;
    } catch (error) {
      console.error(`Error fetching linked issues for PR #${prNumber}:`, error.message);
      return [];
    }
  }

  /**
   * Get all pull requests created by a specific user (including from forks)
   */
  async getUserPullRequests(owner, repo, username) {
    const cacheKey = `user-prs-${owner}-${repo}-${username}-${JSON.stringify(this.dateRange)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Get all PRs in the repository
      const { data: allPRs } = await this.octokit.pulls.list({
        owner,
        repo,
        state: 'all',
        per_page: 100,
        sort: 'created',
        direction: 'desc',
      });

      // Filter PRs by the user (including PRs from forks)
      // Check both created_at and merged_at/updated_at to catch PRs merged within date range
      const userPRs = allPRs.filter(pr => {
        const isUserPR = pr.user.login.toLowerCase() === username.toLowerCase();
        if (!isUserPR) return false;
        
        if (!this.dateRange) return true;
        
        // Check if PR was created, merged, or updated within the date range
        const createdInRange = this.isWithinDateRange(pr.created_at);
        const mergedInRange = pr.merged_at ? this.isWithinDateRange(pr.merged_at) : false;
        const updatedInRange = pr.updated_at ? this.isWithinDateRange(pr.updated_at) : false;
        
        return createdInRange || mergedInRange || updatedInRange;
      });

      this.cache.set(cacheKey, userPRs);
      return userPRs;
    } catch (error) {
      console.error(`Error fetching PRs for user ${username}:`, error.message);
      return [];
    }
  }

  /**
   * Get commits from a pull request (works for fork-based PRs)
   */
  async getPullRequestCommits(owner, repo, prNumber) {
    const cacheKey = `pr-commits-${owner}-${repo}-${prNumber}-${JSON.stringify(this.dateRange)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const { data: commits } = await this.octokit.pulls.listCommits({
        owner,
        repo,
        pull_number: prNumber,
        per_page: 100,
      });

      // Filter by date range if specified
      const filteredCommits = this.dateRange
        ? commits.filter(commit => this.isWithinDateRange(commit.commit.author.date))
        : commits;

      const formattedCommits = filteredCommits.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.author?.login || commit.commit.author.name,
        date: commit.commit.author.date,
      }));

      this.cache.set(cacheKey, formattedCommits);
      return formattedCommits;
    } catch (error) {
      console.error(`Error fetching commits for PR #${prNumber}:`, error.message);
      return [];
    }
  }

  /**
   * Get the diff/changes from a pull request
   */
  async getPullRequestDiff(owner, repo, prNumber) {
    const cacheKey = `pr-diff-${owner}-${repo}-${prNumber}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const { data } = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: prNumber,
        mediaType: {
          format: 'diff',
        },
      });

      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error fetching diff for PR #${prNumber}:`, error.message);
      return '';
    }
  }

  /**
   * Get project board columns and cards
   */
  async getProjectBoardColumns(owner, repo, projectNumber) {
    const cacheKey = `project-${owner}-${repo}-${projectNumber}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // First, get the project
      const { data: projects } = await this.octokit.projects.listForRepo({
        owner,
        repo,
      });

      const project = projects.find(p => p.number === projectNumber);
      if (!project) {
        throw new Error(`Project #${projectNumber} not found`);
      }

      // Get columns for the project
      const { data: columns } = await this.octokit.projects.listColumns({
        project_id: project.id,
      });

      // Get cards for each column
      const columnsWithCards = await Promise.all(
        columns.map(async column => {
          const { data: cards } = await this.octokit.projects.listCards({
            column_id: column.id,
          });
          return {
            ...column,
            cards,
          };
        })
      );

      this.cache.set(cacheKey, columnsWithCards);
      return columnsWithCards;
    } catch (error) {
      console.error(`Error fetching project board:`, error.message);
      throw new Error(`Failed to fetch project board: ${error.message}`);
    }
  }

  /**
   * Get the movement history of an issue across project board columns
   */
  async getIssueProjectHistory(owner, repo, issueNumber, projectNumber) {
    try {
      // Get timeline events for the issue
      const { data: timeline } = await this.octokit.issues.listEventsForTimeline({
        owner,
        repo,
        issue_number: issueNumber,
        per_page: 100,
      });

      // Filter for project card events and filter by date range
      const projectEvents = timeline
        .filter(
          event =>
            event.event === 'added_to_project' ||
            event.event === 'moved_columns_in_project' ||
            event.event === 'removed_from_project' ||
            event.event === 'converted_note_to_issue'
        )
        .filter(event => !this.dateRange || this.isWithinDateRange(event.created_at));

      return projectEvents.map(event => ({
        event: event.event,
        column: event.project_card?.column_name || 'Unknown',
        previousColumn: event.project_card?.previous_column_name,
        projectId: event.project_card?.project_id,
        createdAt: event.created_at,
      }));
    } catch (error) {
      console.error(`Error fetching project history for issue #${issueNumber}:`, error.message);
      return [];
    }
  }

  /**
   * Check if an issue went through the complete workflow
   * Requirements:
   * - Must have been in "To Do", "In Progress", and "Done" at some point
   * - Must end in "Done" (last column must be Done)
   * - Can have been in other columns in between
   */
  async checkWorkflowProgression(owner, repo, issueNumber, projectNumber, expectedColumns) {
    const history = await this.getIssueProjectHistory(owner, repo, issueNumber, projectNumber);
    
    if (history.length === 0) {
      return {
        passed: false,
        columns: [],
        message: 'Issue was not added to the project board',
      };
    }

    // Filter out "removed_from_project" events and get only column movements
    const columnEvents = history.filter(h => 
      h.event !== 'removed_from_project' && h.column && h.column !== 'Unknown'
    );

    if (columnEvents.length === 0) {
      return {
        passed: false,
        columns: [],
        history,
        message: 'Issue was removed from project board or has no valid column history',
      };
    }

    // Extract unique columns the issue has been in
    const columnsVisited = [...new Set(columnEvents.map(h => h.column))];

    // Check if all expected columns were visited (order doesn't matter)
    const expectedNames = Object.values(expectedColumns);
    const allVisited = expectedNames.every(expected =>
      columnsVisited.some(visited => 
        visited.toLowerCase().includes(expected.toLowerCase()) ||
        expected.toLowerCase().includes(visited.toLowerCase())
      )
    );

    // Check if the issue ends in "Done" (last column in history must be Done)
    // Sort events by timestamp to ensure we get the actual last column
    const sortedEvents = [...columnEvents].sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    );
    const lastEvent = sortedEvents[sortedEvents.length - 1];
    const lastColumn = lastEvent.column;
    
    // Find the "Done" column name from expected columns
    const doneColumn = expectedNames.find(name => 
      name.toLowerCase().includes('done') || name.toLowerCase() === 'done'
    );
    
    const endsInDone = doneColumn ? (() => {
      const doneLower = doneColumn.toLowerCase();
      const lastLower = lastColumn.toLowerCase();
      // Check if last column matches "Done" (case-insensitive, partial match)
      return lastLower.includes('done') || lastLower === 'done' || 
             lastLower.includes(doneLower) || doneLower.includes(lastLower);
    })() : false;

    const passed = allVisited && endsInDone;

    // Build detailed message
    let message;
    if (!allVisited) {
      const missing = expectedNames.filter(expected =>
        !columnsVisited.some(visited => 
          visited.toLowerCase().includes(expected.toLowerCase()) ||
          expected.toLowerCase().includes(visited.toLowerCase())
        )
      );
      message = `Issue did not visit all required columns. Missing: ${missing.join(', ')}. Visited: ${columnsVisited.join(' → ')}`;
    } else if (!endsInDone) {
      message = `Issue visited all required columns but did not end in "Done". Last column: ${lastColumn}. Visited: ${columnsVisited.join(' → ')}`;
    } else {
      message = 'Issue progressed through all workflow columns and ended in Done';
    }

    return {
      passed,
      columns: columnsVisited,
      history,
      lastColumn,
      message,
    };
  }

  /**
   * Get the authenticated user's information
   */
  async getAuthenticatedUser() {
    const cacheKey = 'authenticated-user';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const { data } = await this.octokit.users.getAuthenticated();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching authenticated user:', error.message);
      throw new Error(`Failed to fetch authenticated user: ${error.message}`);
    }
  }

  /**
   * Get all repositories owned by the authenticated user
   */
  async getUserRepositories() {
    const cacheKey = 'user-repositories';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const user = await this.getAuthenticatedUser();
      const repos = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const { data } = await this.octokit.repos.listForAuthenticatedUser({
          per_page: 100,
          page,
          sort: 'updated',
          direction: 'desc',
        });

        repos.push(...data);
        
        if (data.length < 100) {
          hasMore = false;
        } else {
          page++;
        }
      }

      // Filter to only public repos owned by the user (not forks unless they own them)
      const ownedRepos = repos.filter(repo => 
        repo.owner.login === user.login && !repo.fork && !repo.private
      );

      console.log(`Found ${ownedRepos.length} public repositories owned by ${user.login}`);
      this.cache.set(cacheKey, ownedRepos);
      return ownedRepos;
    } catch (error) {
      console.error('Error fetching user repositories:', error.message);
      throw new Error(`Failed to fetch user repositories: ${error.message}`);
    }
  }

  /**
   * Get all issues assigned to a user across multiple repositories
   */
  async getUserIssuesAcrossRepos(username) {
    const repos = await this.getUserRepositories();
    const allIssues = [];

    console.log(`Scanning ${repos.length} repositories for issues assigned to ${username}...`);

    for (const repo of repos) {
      try {
        const issues = await this.getUserIssues(repo.owner.login, repo.name, username);
        issues.forEach(issue => {
          allIssues.push({
            ...issue,
            repository: `${repo.owner.login}/${repo.name}`,
            repoOwner: repo.owner.login,
            repoName: repo.name,
          });
        });
      } catch (error) {
        console.error(`Error fetching issues from ${repo.owner.login}/${repo.name}:`, error.message);
        // Continue with other repos
      }
    }

    console.log(`Found ${allIssues.length} total issues across all repositories`);
    return allIssues;
  }

  /**
   * Get all pull requests created by a user across multiple repositories
   */
  async getUserPullRequestsAcrossRepos(username) {
    const repos = await this.getUserRepositories();
    const allPRs = [];

    console.log(`Scanning ${repos.length} repositories for PRs by ${username}...`);

    for (const repo of repos) {
      try {
        const prs = await this.getUserPullRequests(repo.owner.login, repo.name, username);
        prs.forEach(pr => {
          allPRs.push({
            ...pr,
            repository: `${repo.owner.login}/${repo.name}`,
            repoOwner: repo.owner.login,
            repoName: repo.name,
          });
        });
      } catch (error) {
        console.error(`Error fetching PRs from ${repo.owner.login}/${repo.name}:`, error.message);
        // Continue with other repos
      }
    }

    console.log(`Found ${allPRs.length} total PRs across all repositories`);
    return allPRs;
  }

  /**
   * Get commits for an issue across repositories (helper for multi-repo grading)
   */
  async getIssueCommitsForRepo(owner, repo, issueNumber) {
    return await this.getIssueCommits(owner, repo, issueNumber);
  }

  /**
   * Get PRs for an issue across repositories (helper for multi-repo grading)
   */
  async getIssuePullRequestsForRepo(owner, repo, issueNumber) {
    return await this.getIssuePullRequests(owner, repo, issueNumber);
  }

  /**
   * Get PR diff across repositories (helper for multi-repo grading)
   */
  async getPullRequestDiffForRepo(owner, repo, prNumber) {
    return await this.getPullRequestDiff(owner, repo, prNumber);
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
  }
}

module.exports = GitHubService;


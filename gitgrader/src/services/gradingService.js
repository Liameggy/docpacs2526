const GitHubService = require('./githubService');
const AIService = require('./aiService');

class GradingService {
  constructor(config, githubToken, aiConfig, dateRange = null) {
    this.config = config;
    this.githubService = new GitHubService(githubToken, dateRange);
    this.aiService = new AIService(aiConfig);
    this.rubric = config.rubric;
    this.dateRange = dateRange;
  }

  /**
   * Set or update the date range
   */
  setDateRange(startDate, endDate) {
    this.dateRange = { startDate, endDate };
    this.githubService.setDateRange(startDate, endDate);
  }

  /**
   * Grade a single student
   */
  async gradeStudent(owner, repo, projectNumber, username) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`GRADING STUDENT: ${username}`);
    console.log(`${'='.repeat(60)}`);
    
    const result = {
      username,
      totalScore: 0,
      maxScore: 100,
      criteria: {},
      issues: [],
      feedback: [],
    };

    try {
      // Get all issues assigned to the user
      console.log(`\n[1/6] Fetching issues assigned to ${username}...`);
      const issues = await this.githubService.getUserIssues(owner, repo, username);
      console.log(`   ✓ Found ${issues.length} issue(s)`);
      
      if (issues.length > 0) {
        issues.forEach(issue => {
          console.log(`      - Issue #${issue.number}: ${issue.title} (${issue.state})`);
        });
      }

      if (issues.length === 0) {
        console.log(`   ✗ No issues found for ${username}`);
        console.log(`   ⚠️  This may be due to:`);
        console.log(`      1. No issues assigned to this user in GitHub`);
        console.log(`      2. Issues exist but were filtered out by date range`);
        console.log(`      3. Username spelling mismatch`);
        console.log(`\n   💡 TIP: Check the date filtering details above`);
        console.log(`   💡 TIP: Try adjusting the date range to include older work\n`);
        
        result.feedback.push('No issues assigned to this student within the specified date range.');
        
        console.log(`\n${'='.repeat(60)}`);
        console.log(`FINAL SCORE FOR ${username}: 0/100 (0.0% - F)`);
        console.log(`REASON: No issues found to grade`);
        console.log(`${'='.repeat(60)}\n`);
        
        return result;
      }

      result.issues = issues.map(i => ({
        number: i.number,
        title: i.title,
        state: i.state,
        url: i.html_url,
      }));

      // Grade each criterion
      console.log(`\n[2/6] Grading: Issue Assigned...`);
      result.criteria.issueAssigned = await this.gradeIssueAssigned(issues);
      console.log(`   → ${result.criteria.issueAssigned.points}/${result.criteria.issueAssigned.maxPoints} points`);
      
      console.log(`\n[3/6] Grading: Commits Made...`);
      result.criteria.commitsMade = await this.gradeCommitsMade(owner, repo, issues, username);
      console.log(`   → ${result.criteria.commitsMade.points}/${result.criteria.commitsMade.maxPoints} points`);
      
      console.log(`\n[4/6] Grading: Pull Request Created...`);
      result.criteria.prCreated = await this.gradePRCreated(owner, repo, issues, username);
      console.log(`   → ${result.criteria.prCreated.points}/${result.criteria.prCreated.maxPoints} points`);
      
      console.log(`\n[5/6] Grading: Issue Completed (AI Verification)...`);
      result.criteria.issueCompleted = await this.gradeIssueCompleted(owner, repo, issues, username);
      console.log(`   → ${result.criteria.issueCompleted.points}/${result.criteria.issueCompleted.maxPoints} points`);
      
      console.log(`\n[6/6] Grading: Pull Request Merged...`);
      result.criteria.prMerged = await this.gradePRMerged(owner, repo, issues, username);
      console.log(`   → ${result.criteria.prMerged.points}/${result.criteria.prMerged.maxPoints} points`);
      
      console.log(`\n[7/6] Grading: Project Board Workflow...`);
      result.criteria.projectBoardWorkflow = await this.gradeProjectBoardWorkflow(
        owner,
        repo,
        projectNumber,
        issues
      );
      console.log(`   → ${result.criteria.projectBoardWorkflow.points}/${result.criteria.projectBoardWorkflow.maxPoints} points`);

      // Calculate total score
      result.totalScore = Object.values(result.criteria).reduce(
        (sum, criterion) => sum + (criterion.points || 0),
        0
      );

      // Calculate percentage and letter grade
      result.percentage = ((result.totalScore / result.maxScore) * 100).toFixed(1);
      result.letterGrade = this.calculateLetterGrade(result.percentage);

      // Compile feedback
      Object.values(result.criteria).forEach(criterion => {
        if (criterion.feedback) {
          result.feedback.push(criterion.feedback);
        }
      });

      console.log(`\n${'='.repeat(60)}`);
      console.log(`FINAL SCORE FOR ${username}: ${result.totalScore}/${result.maxScore} (${result.percentage}% - ${result.letterGrade})`);
      console.log(`${'='.repeat(60)}\n`);

    } catch (error) {
      console.error(`\n❌ ERROR grading ${username}:`, error.message);
      console.error(error.stack);
      result.error = error.message;
      result.feedback.push(`Error during grading: ${error.message}`);
    }

    return result;
  }

  /**
   * Grade multiple students
   */
  async gradeTeam(repoUrl, projectBoard, usernames) {
    const { owner, repo } = this.githubService.parseRepoUrl(repoUrl);
    const projectNumber = this.githubService.parseProjectBoard(projectBoard);

    console.log(`\n${'*'.repeat(70)}`);
    console.log(`STARTING TEAM GRADING`);
    console.log(`${'*'.repeat(70)}`);
    console.log(`Repository: ${owner}/${repo}`);
    console.log(`Project Board: #${projectNumber}`);
    console.log(`Students: ${usernames.join(', ')}`);
    
    if (this.dateRange) {
      console.log(`\n📅 DATE RANGE FILTER ACTIVE:`);
      console.log(`   Start: ${new Date(this.dateRange.startDate).toLocaleString()}`);
      console.log(`   End: ${new Date(this.dateRange.endDate).toLocaleString()}`);
      console.log(`   ⚠️  Only issues/PRs/commits within this range will be counted`);
    } else {
      console.log(`\n📅 No date range filter (all time)`);
    }
    console.log(`${'*'.repeat(70)}\n`);

    const results = {
      repository: `${owner}/${repo}`,
      projectBoard: projectNumber,
      gradedAt: new Date().toISOString(),
      dateRange: this.dateRange,
      students: [],
    };

    for (const username of usernames) {
      console.log(`\nGrading ${username}...`);
      try {
        const studentResult = await this.gradeStudent(owner, repo, projectNumber, username);
        results.students.push(studentResult);
      } catch (error) {
        console.error(`\n❌ CRITICAL ERROR grading ${username}:`, error.message);
        console.error(error.stack);
        // Add a result with error so we can continue to next student
        results.students.push({
          username,
          totalScore: 0,
          maxScore: 100,
          criteria: {},
          issues: [],
          feedback: [`Critical error during grading: ${error.message}`],
          error: error.message,
        });
      }
    }

    // Calculate class statistics
    results.statistics = this.calculateStatistics(results.students);

    return results;
  }

  /**
   * Criterion 1: Issue Assigned (10 points)
   */
  async gradeIssueAssigned(issues) {
    const passed = issues.length > 0;
    return {
      name: 'Issue Assigned',
      points: passed ? this.rubric.issueAssigned : 0,
      maxPoints: this.rubric.issueAssigned,
      passed,
      feedback: passed
        ? `✓ Student assigned ${issues.length} issue(s) to themselves`
        : '✗ Student did not assign any issues to themselves',
      details: {
        issueCount: issues.length,
      },
    };
  }

  /**
   * Criterion 2: Commits Made (20 points)
   */
  async gradeCommitsMade(owner, repo, issues, username) {
    console.log(`   🔍 Searching for commits by ${username}...`);
    let totalCommits = 0;
    const issuesWithCommits = [];
    const commitShas = new Set(); // Track unique commits

    // Method 1: Get commits from issue timeline
    console.log(`      Method 1: Checking commits in issue timelines...`);
    for (const issue of issues) {
      const commits = await this.githubService.getIssueCommits(owner, repo, issue.number);
      const studentCommits = commits.filter(c => 
        c.author.toLowerCase() === username.toLowerCase()
      );
      
      if (studentCommits.length > 0) {
        console.log(`         Issue #${issue.number}: ${studentCommits.length} commit(s)`);
        studentCommits.forEach(c => commitShas.add(c.sha));
        issuesWithCommits.push({
          issue: issue.number,
          commits: studentCommits.length,
        });
      }
    }

    // Method 2: Get commits from user's PRs (handles fork-based workflows)
    console.log(`      Method 2: Checking commits in user's PRs...`);
    const userPRs = await this.githubService.getUserPullRequests(owner, repo, username);
    console.log(`         Found ${userPRs.length} PR(s) by ${username}`);
    
    for (const pr of userPRs) {
      const prCommits = await this.githubService.getPullRequestCommits(owner, repo, pr.number);
      const studentCommits = prCommits.filter(c => 
        c.author.toLowerCase() === username.toLowerCase()
      );
      
      console.log(`         PR #${pr.number}: ${studentCommits.length} commit(s)`);
      
      // Add unique commits
      studentCommits.forEach(c => commitShas.add(c.sha));
    }

    totalCommits = commitShas.size;
    const passed = totalCommits > 0;
    console.log(`      ✓ Total unique commits: ${totalCommits}`);
    
    return {
      name: 'Commits Made',
      points: passed ? this.rubric.commitsMade : 0,
      maxPoints: this.rubric.commitsMade,
      passed,
      feedback: passed
        ? `✓ Student made ${totalCommits} commit(s) (including commits from forks)`
        : '✗ No commits found for this student',
      details: {
        totalCommits,
        issuesWithCommits,
        fromPRs: userPRs.length,
      },
    };
  }

  /**
   * Criterion 3: PR Created (20 points)
   */
  async gradePRCreated(owner, repo, issues, username) {
    console.log(`   🔍 Searching for pull requests by ${username}...`);
    let totalPRs = 0;
    const issuesWithPRs = [];
    const prNumbers = new Set();

    // Method 1: Get PRs linked to issues
    console.log(`      Method 1: Checking PRs linked to issues...`);
    for (const issue of issues) {
      const prs = await this.githubService.getIssuePullRequests(owner, repo, issue.number);
      if (prs.length > 0) {
        console.log(`         Issue #${issue.number}: ${prs.length} PR(s) - ${prs.map(pr => `#${pr.number}`).join(', ')}`);
        prs.forEach(pr => prNumbers.add(pr.number));
        issuesWithPRs.push({
          issue: issue.number,
          prs: prs.map(pr => pr.number),
        });
      } else {
        console.log(`         Issue #${issue.number}: No PRs linked`);
      }
    }

    // Method 2: Get all PRs by the user (handles fork-based workflows)
    console.log(`      Method 2: Checking all PRs by user...`);
    const userPRs = await this.githubService.getUserPullRequests(owner, repo, username);
    console.log(`         Found ${userPRs.length} PR(s) by ${username}`);
    userPRs.forEach(pr => {
      console.log(`         - PR #${pr.number}: ${pr.title}`);
      prNumbers.add(pr.number);
    });

    totalPRs = prNumbers.size;
    const passed = totalPRs > 0;
    console.log(`      ✓ Total unique PRs: ${totalPRs}`);
    
    return {
      name: 'Pull Request Created',
      points: passed ? this.rubric.prCreated : 0,
      maxPoints: this.rubric.prCreated,
      passed,
      feedback: passed
        ? `✓ Student created ${totalPRs} pull request(s) (including PRs from forks)`
        : '✗ No pull requests found for this student',
      details: {
        totalPRs,
        issuesWithPRs,
        userPRCount: userPRs.length,
      },
    };
  }

  /**
   * Criterion 4: Issue Completed - AI Verification (30 points)
   */
  async gradeIssueCompleted(owner, repo, issues, username) {
    console.log(`   📋 Analyzing issue completion with AI...`);
    const analyses = [];
    let passedCount = 0;

    // Get all user PRs for analysis
    console.log(`   🔍 Fetching all PRs created by ${username}...`);
    const userPRs = await this.githubService.getUserPullRequests(owner, repo, username);
    console.log(`      Found ${userPRs.length} PR(s) by ${username}`);
    
    if (userPRs.length > 0) {
      userPRs.forEach(pr => {
        console.log(`         - PR #${pr.number}: ${pr.title} (${pr.state}, merged: ${pr.merged_at ? 'yes' : 'no'})`);
      });
    }

    for (const issue of issues) {
      console.log(`\n   🔍 Checking issue #${issue.number}: ${issue.title}`);
      
      let prs = await this.githubService.getIssuePullRequests(owner, repo, issue.number);
      console.log(`      PRs linked to issue: ${prs.length}`);
      
      // If no PRs linked to issue, try to find user PRs that might relate
      if (prs.length === 0 && userPRs.length > 0) {
        console.log(`      ⚠️  No PRs linked to issue, using user's PR for analysis`);
        prs = [userPRs[0]];
      }
      
      if (prs.length === 0) {
        console.log(`      ✗ No PRs found for analysis`);
        analyses.push({
          issue: issue.number,
          passed: false,
          explanation: 'No pull request found for this issue or user',
        });
        continue;
      }

      // Analyze the first PR (or we could analyze all and take the best result)
      const pr = prs[0];
      console.log(`      🤖 Analyzing PR #${pr.number} with AI...`);
      console.log(`         Issue: "${issue.title}"`);
      console.log(`         PR: "${pr.title}"`);
      
      const diff = await this.githubService.getPullRequestDiff(owner, repo, pr.number);
      console.log(`         Diff size: ${diff.length} characters`);

      if (diff.length === 0) {
        console.log(`         ⚠️  Warning: Diff is empty - cannot perform AI analysis!`);
        analyses.push({
          issue: issue.number,
          pr: pr.number,
          passed: false,
          confidence: 0,
          explanation: 'PR diff is empty - no code changes to analyze',
        });
        continue;
      }

      // Show a preview of what files were changed
      const diffLines = diff.split('\n').filter(line => line.startsWith('diff --git'));
      if (diffLines.length > 0) {
        console.log(`         Files changed: ${diffLines.length}`);
        diffLines.slice(0, 5).forEach(line => {
          const match = line.match(/diff --git a\/(.*?) b\//);
          if (match) console.log(`            - ${match[1]}`);
        });
        if (diffLines.length > 5) {
          console.log(`            ... and ${diffLines.length - 5} more file(s)`);
        }
      }

      console.log(`         🔍 Sending to AI for code analysis...`);
      const analysis = await this.aiService.analyzeIssueCompletion(
        issue.title,
        issue.body || '',
        pr.title,
        pr.body || '',
        diff
      );

      console.log(`         AI Result: ${analysis.passed ? '✓ PASSED' : '✗ FAILED'} (confidence: ${Math.round(analysis.confidence * 100)}%)`);
      console.log(`         Explanation: ${analysis.explanation}`);

      analyses.push({
        issue: issue.number,
        pr: pr.number,
        passed: analysis.passed,
        confidence: analysis.confidence,
        explanation: analysis.explanation,
      });

      if (analysis.passed) {
        passedCount++;
      }
    }

    // Award full points if at least one issue was properly completed
    const passed = passedCount > 0;
    // Or we could scale points: (passedCount / issues.length) * this.rubric.issueCompleted
    const points = passed ? this.rubric.issueCompleted : 0;

    return {
      name: 'Issue Completed (AI Verified)',
      points,
      maxPoints: this.rubric.issueCompleted,
      passed,
      feedback: passed
        ? `✓ AI verified that ${passedCount} of ${issues.length} issue(s) were properly completed`
        : '✗ AI could not verify that any issues were properly completed',
      details: {
        analyses,
        passedCount,
        totalIssues: issues.length,
      },
    };
  }

  /**
   * Criterion 5: PR Merged (10 points)
   */
  async gradePRMerged(owner, repo, issues, username) {
    let mergedCount = 0;
    const mergedPRs = [];
    const mergedPRNumbers = new Set();

    // Check PRs linked to issues
    for (const issue of issues) {
      const prs = await this.githubService.getIssuePullRequests(owner, repo, issue.number);
      
      for (const pr of prs) {
        if (pr.merged_at && !mergedPRNumbers.has(pr.number)) {
          mergedPRNumbers.add(pr.number);
          mergedPRs.push({
            issue: issue.number,
            pr: pr.number,
            mergedAt: pr.merged_at,
          });
        }
      }
    }

    // Check all user PRs (handles fork-based workflows)
    const userPRs = await this.githubService.getUserPullRequests(owner, repo, username);
    for (const pr of userPRs) {
      if (pr.merged_at && !mergedPRNumbers.has(pr.number)) {
        mergedPRNumbers.add(pr.number);
        mergedPRs.push({
          issue: null,
          pr: pr.number,
          mergedAt: pr.merged_at,
        });
      }
    }

    mergedCount = mergedPRNumbers.size;
    const passed = mergedCount > 0;
    
    return {
      name: 'Pull Request Merged',
      points: passed ? this.rubric.prMerged : 0,
      maxPoints: this.rubric.prMerged,
      passed,
      feedback: passed
        ? `✓ ${mergedCount} pull request(s) were merged (including PRs from forks)`
        : '✗ No merged pull requests found for this student',
      details: {
        mergedCount,
        mergedPRs,
        allIssuesClosed: issues.every(issue => issue.state === 'closed'),
      },
    };
  }

  /**
   * Criterion 6: Project Board Workflow (10 points)
   */
  async gradeProjectBoardWorkflow(owner, repo, projectNumber, issues) {
    console.log(`   📊 Checking project board workflow...`);
    console.log(`      Project #${projectNumber}`);
    console.log(`      Expected columns: ${JSON.stringify(this.config.projectBoardColumns)}`);
    
    const workflowResults = [];
    let passedCount = 0;

    for (const issue of issues) {
      console.log(`\n   🔍 Checking workflow for issue #${issue.number}`);
      
      const workflow = await this.githubService.checkWorkflowProgression(
        owner,
        repo,
        issue.number,
        projectNumber,
        this.config.projectBoardColumns
      );

      console.log(`      Columns visited: ${workflow.columns.length > 0 ? workflow.columns.join(' → ') : 'none'}`);
      console.log(`      Status: ${workflow.passed ? '✓ PASSED' : '✗ FAILED'}`);
      console.log(`      Message: ${workflow.message}`);
      
      if (workflow.history && workflow.history.length > 0) {
        console.log(`      History (${workflow.history.length} events):`);
        workflow.history.forEach(event => {
          console.log(`         - ${event.event}: ${event.column} (${new Date(event.createdAt).toLocaleDateString()})`);
        });
      } else {
        console.log(`      ⚠️  No project board history found`);
      }

      workflowResults.push({
        issue: issue.number,
        passed: workflow.passed,
        columns: workflow.columns,
        message: workflow.message,
      });

      if (workflow.passed) {
        passedCount++;
      }
    }

    const passed = passedCount > 0;
    console.log(`\n   📈 Workflow summary: ${passedCount}/${issues.length} issues completed workflow`);
    
    return {
      name: 'Project Board Workflow',
      points: passed ? this.rubric.projectBoardWorkflow : 0,
      maxPoints: this.rubric.projectBoardWorkflow,
      passed,
      feedback: passed
        ? `✓ ${passedCount} of ${issues.length} issue(s) moved through the complete workflow`
        : '✗ Issues did not progress through the expected workflow columns',
      details: {
        workflowResults,
        passedCount,
        totalIssues: issues.length,
      },
    };
  }

  /**
   * Calculate letter grade from percentage
   */
  calculateLetterGrade(percentage) {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  /**
   * Calculate statistics for the class
   */
  calculateStatistics(students) {
    if (students.length === 0) {
      return {
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passingCount: 0,
        passingRate: 0,
      };
    }

    const scores = students.map(s => s.totalScore);
    const sum = scores.reduce((a, b) => a + b, 0);
    const passingCount = students.filter(s => s.percentage >= 60).length;

    return {
      averageScore: (sum / students.length).toFixed(1),
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      passingCount,
      passingRate: ((passingCount / students.length) * 100).toFixed(1),
      totalStudents: students.length,
    };
  }
}

module.exports = GradingService;


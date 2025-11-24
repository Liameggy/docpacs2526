class ReportGenerator {
  /**
   * Generate a standalone HTML report from grading results
   */
  generateHTMLReport(results, teamName = 'Team') {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GitHub Grading Report - ${this.escapeHtml(teamName)}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        header {
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        h1 {
            color: #2c3e50;
            margin-bottom: 10px;
        }

        .meta-info {
            color: #666;
            font-size: 0.9em;
        }

        .meta-info span {
            margin-right: 20px;
        }

        .statistics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 6px;
        }

        .stat-card {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #4CAF50;
        }

        .stat-label {
            color: #666;
            font-size: 0.9em;
            margin-top: 5px;
        }

        .student {
            margin-bottom: 30px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
        }

        .student-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .student-name {
            font-size: 1.3em;
            font-weight: bold;
        }

        .student-grade {
            text-align: right;
        }

        .grade-score {
            font-size: 2.5em;
            font-weight: bold;
        }

        .grade-letter {
            font-size: 1.5em;
            opacity: 0.9;
        }

        .student-body {
            padding: 20px;
        }

        .criteria-grid {
            display: grid;
            gap: 15px;
            margin-bottom: 20px;
        }

        .criterion {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 6px;
            border-left: 4px solid #ddd;
        }

        .criterion.passed {
            border-left-color: #4CAF50;
            background: #f1f8f4;
        }

        .criterion.partial {
            border-left-color: #ffc107;
            background: #fff9e6;
        }

        .criterion.failed {
            border-left-color: #f44336;
            background: #fef5f5;
        }

        .criterion-name {
            font-weight: 600;
            flex: 1;
        }

        .criterion-score {
            font-size: 1.2em;
            font-weight: bold;
            margin: 0 20px;
        }

        .criterion-status {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
        }

        .criterion.passed .criterion-status {
            background: #4CAF50;
        }

        .criterion.partial .criterion-status {
            background: #ffc107;
        }

        .criterion.failed .criterion-status {
            background: #f44336;
        }

        .feedback {
            margin-top: 15px;
            padding: 15px;
            background: #fff9e6;
            border-left: 4px solid #ffc107;
            border-radius: 4px;
        }

        .feedback-title {
            font-weight: 600;
            margin-bottom: 10px;
            color: #f57c00;
        }

        .feedback-list {
            list-style: none;
            padding-left: 0;
        }

        .feedback-list li {
            padding: 5px 0;
            color: #666;
        }

        .issues-section {
            margin-top: 15px;
            padding: 15px;
            background: #e3f2fd;
            border-radius: 6px;
        }

        .issues-title {
            font-weight: 600;
            margin-bottom: 10px;
            color: #1976d2;
        }

        .issue-link {
            display: inline-block;
            margin: 5px 10px 5px 0;
            padding: 5px 12px;
            background: white;
            border-radius: 4px;
            text-decoration: none;
            color: #1976d2;
            font-size: 0.9em;
            border: 1px solid #bbdefb;
        }

        .issue-link:hover {
            background: #bbdefb;
        }

        .rubric {
            margin-top: 40px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }

        .rubric h2 {
            margin-bottom: 15px;
            color: #2c3e50;
        }

        .rubric-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 6px;
            overflow: hidden;
        }

        .rubric-table th,
        .rubric-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
        }

        .rubric-table th {
            background: #667eea;
            color: white;
            font-weight: 600;
        }

        .rubric-table tr:last-child td {
            border-bottom: none;
        }

        /* AI Analysis Section */
        .ai-analysis-section {
            margin-top: 20px;
            padding: 20px;
            background: #f0f4ff;
            border-radius: 8px;
            border: 2px solid #667eea;
        }

        .ai-analysis-title {
            font-size: 1.1em;
            font-weight: 600;
            color: #667eea;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .ai-analysis-item {
            margin-bottom: 15px;
            padding: 15px;
            background: white;
            border-radius: 6px;
            border-left: 4px solid #ddd;
        }

        .ai-repository {
            padding: 4px 10px;
            background: #e8f5e9;
            border-radius: 4px;
            color: #2e7d32;
            font-weight: 500;
            font-size: 0.9em;
        }

        .ai-analysis-item.ai-passed {
            border-left-color: #4CAF50;
            background: #f1f8f4;
        }

        .ai-analysis-item.ai-failed {
            border-left-color: #f44336;
            background: #fef5f5;
        }

        .ai-analysis-header {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            align-items: center;
            margin-bottom: 10px;
            font-size: 0.95em;
        }

        .ai-issue-number,
        .ai-pr-number {
            padding: 4px 10px;
            background: #e3f2fd;
            border-radius: 4px;
            color: #1976d2;
            font-weight: 600;
        }

        .ai-result {
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: 600;
        }

        .ai-result-pass {
            background: #4CAF50;
            color: white;
        }

        .ai-result-fail {
            background: #f44336;
            color: white;
        }

        .ai-confidence {
            padding: 4px 10px;
            background: #fff9e6;
            border-radius: 4px;
            color: #f57c00;
            font-weight: 500;
        }

        .ai-explanation {
            margin-top: 10px;
            padding: 12px;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 4px;
            line-height: 1.6;
            color: #333;
            font-size: 0.95em;
        }

        .ai-explanation strong {
            color: #667eea;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }

            .container {
                box-shadow: none;
            }

            .student {
                page-break-inside: avoid;
            }
        }

        @media (max-width: 768px) {
            .statistics {
                grid-template-columns: 1fr;
            }

            .student-header {
                flex-direction: column;
                align-items: flex-start;
            }

            .student-grade {
                margin-top: 10px;
                text-align: left;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>GitHub Grading Report</h1>
            <div class="meta-info">
                <span><strong>${results.type === 'class' ? 'Class' : results.type === 'user' ? 'User' : 'Team'}:</strong> ${this.escapeHtml(teamName)}</span>
                ${results.type === 'class' || results.type === 'user' 
                    ? `<span><strong>Repositories Scanned:</strong> ${results.repositories ? results.repositories.length : 'All owned repos'}</span>`
                    : `<span><strong>Repository:</strong> ${this.escapeHtml(results.repository)}</span>
                       <span><strong>Project:</strong> #${results.projectBoard}</span>`}
                <span><strong>Graded:</strong> ${new Date(results.gradedAt).toLocaleString()}</span>
                ${results.dateRange ? `<span><strong>Date Range:</strong> ${new Date(results.dateRange.startDate).toLocaleDateString()} to ${new Date(results.dateRange.endDate).toLocaleDateString()}</span>` : ''}
            </div>
            ${results.repositories && results.repositories.length > 0 ? `
                <div style="margin-top: 15px; padding: 10px; background: #f0f4ff; border-radius: 4px;">
                    <strong>Repositories Scanned:</strong>
                    <ul style="margin: 10px 0 0 20px; columns: 2; column-gap: 20px;">
                        ${results.repositories.map(repo => `<li>${this.escapeHtml(repo)}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </header>

        ${this.generateStatistics(results.statistics)}

        <div class="students-section">
            ${results.students.map(student => this.generateStudentSection(student)).join('')}
        </div>

        ${this.generateRubric(results.students[0]?.criteria)}
    </div>
</body>
</html>`;

    return html;
  }

  /**
   * Generate statistics section
   */
  generateStatistics(stats) {
    if (!stats) return '';

    return `
        <div class="statistics">
            <div class="stat-card">
                <div class="stat-value">${stats.totalStudents}</div>
                <div class="stat-label">Total Students</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.averageScore}</div>
                <div class="stat-label">Average Score</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.highestScore}</div>
                <div class="stat-label">Highest Score</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.lowestScore}</div>
                <div class="stat-label">Lowest Score</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.passingRate}%</div>
                <div class="stat-label">Passing Rate</div>
            </div>
        </div>
    `;
  }

  /**
   * Generate student section
   */
  generateStudentSection(student) {
    return `
        <div class="student">
            <div class="student-header">
                <div class="student-name">
                    ${this.escapeHtml(student.username)}
                </div>
                <div class="student-grade">
                    <div class="grade-score">${student.totalScore}/${student.maxScore}</div>
                    <div class="grade-letter">${student.letterGrade} (${student.percentage}%)</div>
                </div>
            </div>
            <div class="student-body">
                <div class="criteria-grid">
                    ${Object.entries(student.criteria)
                      .map(([key, criterion]) => this.generateCriterion(criterion))
                      .join('')}
                </div>

                ${student.issues && student.issues.length > 0 ? `
                    <div class="issues-section">
                        <div class="issues-title">Assigned Issues:</div>
                        ${student.issues.map(issue => `
                            <a href="${issue.url}" class="issue-link" target="_blank">
                                ${issue.repository ? `${this.escapeHtml(issue.repository)} ` : ''}#${issue.number}: ${this.escapeHtml(issue.title)} (${issue.state})
                            </a>
                        `).join('')}
                    </div>
                ` : ''}

                ${this.generateAIAnalysisSection(student)}

                ${student.feedback && student.feedback.length > 0 ? `
                    <div class="feedback">
                        <div class="feedback-title">Detailed Feedback:</div>
                        <ul class="feedback-list">
                            ${student.feedback.map(f => `<li>${this.escapeHtml(f)}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
  }

  /**
   * Generate AI analysis section
   */
  generateAIAnalysisSection(student) {
    // Check if there are AI analysis details
    const issueCompletedCriterion = student.criteria?.issueCompleted;
    if (!issueCompletedCriterion || !issueCompletedCriterion.details?.analyses || 
        issueCompletedCriterion.details.analyses.length === 0) {
      return '';
    }

    const analyses = issueCompletedCriterion.details.analyses;
    
    return `
        <div class="ai-analysis-section">
            <div class="ai-analysis-title">
                🤖 AI Analysis Results (Issue Completion Verification)
            </div>
            ${analyses.map(analysis => `
                <div class="ai-analysis-item ${analysis.passed ? 'ai-passed' : 'ai-failed'}">
                    <div class="ai-analysis-header">
                        ${analysis.repository ? `<span class="ai-repository">${this.escapeHtml(analysis.repository)}</span>` : ''}
                        <span class="ai-issue-number">Issue #${analysis.issue}</span>
                        ${analysis.pr ? `<span class="ai-pr-number">PR #${analysis.pr}</span>` : ''}
                        <span class="ai-result ${analysis.passed ? 'ai-result-pass' : 'ai-result-fail'}">
                            ${analysis.passed ? '✓ PASSED' : '✗ FAILED'}
                        </span>
                        ${analysis.confidence !== undefined ? `
                            <span class="ai-confidence">
                                Confidence: ${Math.round(analysis.confidence * 100)}%
                            </span>
                        ` : ''}
                    </div>
                    <div class="ai-explanation">
                        <strong>AI Explanation:</strong><br>
                        ${this.escapeHtml(analysis.explanation)}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
  }

  /**
   * Generate criterion card
   * Color coding:
   * - Green (passed): 80% or more points earned
   * - Yellow (partial): 1% to 79% points earned
   * - Red (failed): 0% points earned
   */
  generateCriterion(criterion) {
    const percentage = criterion.maxPoints > 0 
      ? (criterion.points / criterion.maxPoints) * 100 
      : 0;
    
    let statusClass;
    let statusIcon;
    
    if (percentage >= 80) {
      statusClass = 'passed';
      statusIcon = '✓';
    } else if (percentage > 0) {
      statusClass = 'partial';
      statusIcon = '⚠';
    } else {
      statusClass = 'failed';
      statusIcon = '✗';
    }
    
    return `
        <div class="criterion ${statusClass}">
            <div class="criterion-name">${this.escapeHtml(criterion.name)}</div>
            <div class="criterion-score">${criterion.points}/${criterion.maxPoints}</div>
            <div class="criterion-status">${statusIcon}</div>
        </div>
    `;
  }

  /**
   * Generate rubric table
   */
  generateRubric(criteria) {
    if (!criteria) return '';

    // Calculate total max score from all criteria
    const totalMaxScore = Object.values(criteria).reduce(
      (sum, criterion) => sum + (criterion.maxPoints || 0),
      0
    );

    return `
        <div class="rubric">
            <h2>Grading Rubric</h2>
            <table class="rubric-table">
                <thead>
                    <tr>
                        <th>Criterion</th>
                        <th>Points</th>
                        <th>Percentage</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(criteria)
                      .map(
                        ([key, criterion]) => {
                          const percentage = totalMaxScore > 0 
                            ? ((criterion.maxPoints / totalMaxScore) * 100).toFixed(1)
                            : '0.0';
                          return `
                        <tr>
                            <td><strong>${this.escapeHtml(criterion.name)}</strong></td>
                            <td>${criterion.maxPoints}</td>
                            <td>${percentage}%</td>
                            <td>${this.escapeHtml(criterion.feedback)}</td>
                        </tr>
                    `;
                        }
                      )
                      .join('')}
                    <tr style="background: #f8f9fa; font-weight: 600;">
                        <td>Total</td>
                        <td>${totalMaxScore}</td>
                        <td>100.0%</td>
                        <td>Maximum possible score</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
  }
}

module.exports = ReportGenerator;


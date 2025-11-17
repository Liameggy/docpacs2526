const OpenAI = require('openai');

class AIService {
  constructor(config) {
    this.provider = config.provider || 'openai';
    
    if (this.provider === 'openai' && config.openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: config.openaiApiKey,
      });
    }

    if (this.provider === 'copilot' && config.copilotApiKey) {
      // GitHub Copilot API integration would go here
      // For now, fall back to OpenAI if Copilot is not available
      console.warn('GitHub Copilot API not yet implemented. Falling back to OpenAI.');
      this.provider = 'openai';
      if (config.openaiApiKey) {
        this.openai = new OpenAI({
          apiKey: config.openaiApiKey,
        });
      }
    }
  }

  /**
   * Analyze if a pull request actually resolves an issue
   * @param {string} issueTitle - The title of the issue
   * @param {string} issueBody - The description/body of the issue
   * @param {string} prTitle - The title of the pull request
   * @param {string} prBody - The description of the pull request
   * @param {string} prDiff - The diff/changes in the pull request
   * @returns {Object} Analysis result with passed boolean and explanation
   */
  async analyzeIssueCompletion(issueTitle, issueBody, prTitle, prBody, prDiff) {
    if (!this.openai) {
      return {
        passed: false,
        confidence: 0,
        explanation: 'AI analysis not available. OpenAI API key not configured.',
      };
    }

    try {
      // Truncate diff if it's too long (to avoid token limits)
      const maxDiffLength = 4000;
      const truncatedDiff = prDiff.length > maxDiffLength
        ? prDiff.substring(0, maxDiffLength) + '\n\n... (diff truncated for analysis)'
        : prDiff;

      const prompt = `You are a code reviewer evaluating if a pull request actually resolves an issue.

**Issue:**
Title: ${issueTitle}
Description: ${issueBody || 'No description provided'}

**Pull Request:**
Title: ${prTitle}
Description: ${prBody || 'No description provided'}

**Code Changes (diff):**
\`\`\`diff
${truncatedDiff}
\`\`\`

**IMPORTANT:** Base your analysis PRIMARILY on the actual code changes shown in the diff above. Do NOT just compare the issue description with the PR description.

Analyze whether the pull request CODE CHANGES actually address and resolve the issue. Consider:
1. **MOST IMPORTANT:** Look at the actual code diff - what files were changed, what code was added/removed/modified?
2. Do these specific code changes directly address the problem described in the issue?
3. Are the code modifications functionally relevant to solving the issue?
4. Would these code changes actually fix or implement what was requested?
5. Is the scope and nature of the code changes appropriate for the issue?

IGNORE vague descriptions - focus on the CONCRETE CODE CHANGES. If the issue says "fix login button" but the code changes don't touch anything related to a login button, it should FAIL.

Respond in JSON format with:
{
  "passed": true/false,
  "confidence": 0.0-1.0,
  "explanation": "Brief explanation focusing on what code was actually changed and whether it addresses the issue"
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert code reviewer and software development assessor. Your PRIMARY focus is analyzing actual code changes in diffs. Do NOT rely solely on comparing text descriptions - you must examine the actual code modifications. Provide objective, thorough analysis based on what code was actually changed. Respond in valid JSON format only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      const analysis = JSON.parse(content);

      return {
        passed: analysis.passed || false,
        confidence: analysis.confidence || 0.5,
        explanation: analysis.explanation || 'No explanation provided',
        model: 'gpt-4o-mini',
      };
    } catch (error) {
      console.error('Error in AI analysis:', error.message);
      return {
        passed: false,
        confidence: 0,
        explanation: `AI analysis failed: ${error.message}`,
        error: error.message,
      };
    }
  }

  /**
   * Analyze multiple issues in batch
   * @param {Array} analyses - Array of {issueTitle, issueBody, prTitle, prBody, prDiff}
   * @returns {Array} Array of analysis results
   */
  async analyzeBatch(analyses) {
    const results = [];
    
    for (const analysis of analyses) {
      const result = await this.analyzeIssueCompletion(
        analysis.issueTitle,
        analysis.issueBody,
        analysis.prTitle,
        analysis.prBody,
        analysis.prDiff
      );
      results.push(result);
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return results;
  }

  /**
   * Get a summary of code quality from commits
   * @param {Array} commits - Array of commit objects
   * @returns {Object} Quality assessment
   */
  async assessCommitQuality(commits) {
    if (!this.openai || commits.length === 0) {
      return {
        quality: 'unknown',
        feedback: 'Not enough information to assess commit quality',
      };
    }

    try {
      const commitMessages = commits
        .map((c, i) => `${i + 1}. ${c.message}`)
        .join('\n');

      const prompt = `Analyze the following commit messages for quality:

${commitMessages}

Evaluate:
1. Are the messages clear and descriptive?
2. Do they follow good commit message practices?
3. Do they indicate meaningful progress?

Respond in JSON format with:
{
  "quality": "excellent/good/fair/poor",
  "feedback": "Brief feedback on commit quality"
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a software development mentor evaluating student work. Provide constructive feedback in valid JSON format only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 300,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error assessing commit quality:', error.message);
      return {
        quality: 'unknown',
        feedback: 'Could not assess commit quality',
      };
    }
  }
}

module.exports = AIService;


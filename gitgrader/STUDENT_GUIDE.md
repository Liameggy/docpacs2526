# Student Guide: How to Get a Perfect Score

This guide explains exactly what you need to do to get the best possible score when your work is graded by the GitHub Grading Bot.

## Overview of Grading Criteria

Your work is graded on **100 points** total, broken down as follows:

| Criterion | Points | What It Measures |
|-----------|--------|------------------|
| **Issue Assigned** | 10 | You assigned at least one issue to yourself |
| **Commits Made** | 20 | You made commits that address the issue |
| **Pull Request Created** | 20 | You created a pull request for your changes |
| **Issue Completed** | 30 | AI verification that your work actually solves the issue |
| **Pull Request Merged** | 10 | Your pull request was accepted and merged |
| **Project Board Workflow** | 10 | You moved the issue through all workflow columns |

## Step-by-Step Guide to Maximum Points

Follow these steps **in order** to ensure you get full credit:

### Step 1: Create or Assign an Issue (10 points)

**What to do:**
1. Go to the **Issues** tab in your GitHub repository
2. Either create a new issue or find an existing one
3. **Assign it to yourself** by clicking on "Assignees" and selecting your username
4. Write a **clear, detailed description** of what needs to be done

**Best Practices:**
- ✅ Use a descriptive title (e.g., "Fix login button alignment" not "fix bug")
- ✅ Include specific details about what needs to be done
- ✅ Make sure the issue is assigned to YOU (your GitHub username)
- ✅ Do this BEFORE making any changes to the code

**Common Mistakes:**
- ❌ Starting work before creating/assigning the issue
- ❌ Forgetting to assign the issue to yourself
- ❌ Using vague descriptions like "make it better"

### Step 2: Move Issue to "In Progress" (Part of Project Board Workflow)

**What to do:**
1. Go to the **Projects** tab and open the project board
2. Find your issue card
3. Drag it from **"To Do"** to **"In Progress"**

**Why this matters:**
- The grading bot tracks your issue's movement through the workflow columns
- You need to move it through: **To Do → In Progress → Done**

### Step 3: Make Your Code Changes & Commit (20 points)

**What to do:**
1. Create a new branch for your work:
   ```bash
   git checkout -b fix-issue-<number>
   ```
2. Make your code changes
3. Commit your changes with **meaningful commit messages**:
   ```bash
   git add .
   git commit -m "Fix login button alignment - closes #<issue-number>"
   ```
4. Push your branch to GitHub:
   ```bash
   git push origin fix-issue-<number>
   ```

**Best Practices:**
- ✅ Reference the issue number in your commit message (e.g., "Fixes #42" or "Closes #42")
- ✅ Make multiple commits if needed - this shows your work process
- ✅ Use clear commit messages that describe what you changed
- ✅ Push your commits within the grading date range

**Common Mistakes:**
- ❌ Committing directly to the main branch without a pull request
- ❌ Not mentioning the issue number in commits
- ❌ Using vague commit messages like "update" or "changes"
- ❌ Working on a fork but not creating a PR to the main repository

**Working with Forks:**
If you're working on a forked repository:
1. Make sure you create a pull request from your fork to the main repository
2. The bot CAN detect work done in forks, but you must create a PR
3. Reference the issue number in your PR description

### Step 4: Create a Pull Request (20 points)

**What to do:**
1. Go to the **Pull Requests** tab in GitHub
2. Click **"New Pull Request"**
3. Select your branch
4. Fill out the PR description:
   ```markdown
   ## Description
   This PR fixes the login button alignment issue.
   
   ## Changes Made
   - Updated CSS for login button
   - Added responsive design for mobile
   
   Closes #<issue-number>
   ```
5. Click **"Create Pull Request"**

**Best Practices:**
- ✅ Use "Closes #<number>" or "Fixes #<number>" in the PR description
- ✅ Describe what changes you made and why
- ✅ Include screenshots if you made visual changes
- ✅ Request a review if required by your instructor
- ✅ Link the PR to the issue (GitHub does this automatically with "Closes #X")

**Common Mistakes:**
- ❌ Not mentioning the issue number in the PR
- ❌ Empty or vague PR descriptions
- ❌ Creating a PR but not linking it to your issue

### Step 5: Ensure Your Work Actually Solves the Issue (30 points - MOST IMPORTANT!)

**What to do:**
This is graded by **AI analysis** that examines your **ACTUAL CODE CHANGES** (the diff in your pull request) to verify they address the issue.

**⚠️ CRITICAL: The AI looks at your CODE, not just your descriptions!**

The AI doesn't just compare the issue description with the PR description. It actually reads the code diff (what files you changed, what lines you added/removed) and determines if those specific code modifications solve the problem stated in the issue.

**To get full credit:**
1. **Make sure your code changes directly address what the issue describes**
2. If the issue says "Fix the login button", you must modify code related to the login button
3. Don't make unrelated changes (e.g., fixing styling when the issue asks for functionality)
4. The AI will look at which files you modified and what code you changed

**Best Practices:**
- ✅ Read the issue carefully before making changes
- ✅ Make code changes that clearly solve the stated problem
- ✅ Modify the right files (if issue mentions login, modify login-related files)
- ✅ If you need to make additional changes, create separate issues for them
- ✅ Test your changes to ensure they work
- ✅ Make sure your code changes are substantial enough to solve the issue
- ✅ Don't just write a description - actually change the code!

**Common Mistakes:**
- ❌ Making changes that don't match the issue description
- ❌ Only partially completing the work
- ❌ Submitting work that doesn't actually solve the problem
- ❌ Making cosmetic changes when functional changes were requested
- ❌ Writing great descriptions but making minimal/wrong code changes
- ❌ Changing unrelated files (e.g., modifying README when issue is about a bug)
- ❌ Thinking you can "trick" the AI with clever descriptions (it reads the actual code!)

**Example of GOOD alignment:**
- **Issue:** "Login button is not centered on mobile devices"
- **Code Changes (what the AI sees):**
  - Modified `styles/login.css`
  - Added CSS rules: `.login-button { display: flex; justify-content: center; }`
  - Added media queries for mobile responsiveness
- **Result:** ✅ AI can verify the issue was solved by actual code changes

**Example of POOR alignment:**
- **Issue:** "Login button is not centered on mobile devices"
- **Code Changes (what the AI sees):**
  - Modified `components/Footer.jsx`
  - Changed button color from blue to green
  - Updated footer text
- **Result:** ❌ AI sees that no code related to login button centering was changed

**Example of TRYING TO CHEAT (doesn't work!):**
- **Issue:** "Login button is not centered on mobile devices"
- **PR Description:** "Fixed the login button centering issue by updating CSS and adding mobile responsiveness"
- **Code Changes (what the AI actually sees):**
  - Modified `README.md`
  - Added one comment to an unrelated file
- **Result:** ❌ AI will FAIL this because it reads the actual code, not your description

### Step 6: Get Your Pull Request Merged (10 points)

**What to do:**
1. Wait for your instructor or team lead to review your PR
2. Address any feedback or requested changes
3. Once approved, the PR will be merged into the main branch

**Best Practices:**
- ✅ Respond to review comments promptly
- ✅ Make requested changes in new commits
- ✅ Communicate with your reviewer if you have questions

**Common Mistakes:**
- ❌ Not waiting for approval before merging
- ❌ Force-merging without addressing feedback
- ❌ Closing the PR without merging (this counts as not merged!)

### Step 7: Move Issue to "Done" (10 points - Project Board Workflow)

**What to do:**
1. After your PR is merged, go back to the **Projects** tab
2. Find your issue card (it might have moved automatically)
3. Drag it to the **"Done"** column

**Important:**
- The grading bot checks that your issue went through: **To Do → In Progress → Done**
- All three columns must be visited to get full credit

**Common Mistakes:**
- ❌ Only moving the issue once (e.g., To Do → Done, skipping In Progress)
- ❌ Not moving the issue at all
- ❌ Moving it to the wrong column names (make sure your board uses "To Do", "In Progress", "Done")

## Date Range Considerations

**Important:** The grading bot only looks at work done within a specific date range (usually the last two weeks).

**To ensure your work is counted:**
- ✅ Complete all steps within the same grading period
- ✅ Don't start an issue in one grading period and finish it in another
- ✅ Check with your instructor about the exact date range being used
- ✅ Make sure your issue was **updated** (not just created) within the date range

**If you're being graded and nothing shows up:**
- Your work might be outside the date range
- Ask your instructor to adjust the date range to include your work
- Moving forward, complete all work within the current grading period

## Quick Checklist

Before you consider your work "done", check all of these:

- [ ] Issue is created and assigned to me
- [ ] Issue has a clear, detailed description
- [ ] Issue was added to the project board in "To Do"
- [ ] I moved the issue to "In Progress" when I started working
- [ ] I created a branch for my work
- [ ] I made meaningful commits that reference the issue number
- [ ] I pushed my commits to GitHub
- [ ] I created a pull request that references the issue
- [ ] My PR description explains what I changed
- [ ] My code changes actually solve the problem described in the issue
- [ ] My pull request was reviewed and merged
- [ ] I moved the issue to "Done" after merging
- [ ] All of this was done within the current grading period

## Common Scenarios

### Scenario 1: "I did all the work but got 0 points"

**Possible causes:**
- Your work was outside the grading date range
- You didn't assign the issue to yourself
- Your username in the grading system doesn't match your GitHub username
- You worked on a fork but didn't create a PR to the main repo

**Solution:**
- Check the grading period with your instructor
- Verify all issues are assigned to you
- Confirm your GitHub username is spelled correctly
- Make sure PRs from forks are submitted to the main repository

### Scenario 2: "I got points for everything except 'Issue Completed'"

**Possible causes:**
- Your changes don't clearly match the issue description
- The AI couldn't find a connection between what you did and what was requested

**Solution:**
- Make sure your issue description is clear and specific
- Ensure your code changes directly address the issue
- Use consistent terminology (if the issue says "login", don't only reference "authentication" in your code)
- Include comments in your code explaining what you fixed

### Scenario 3: "I got points for everything except 'Project Board Workflow'"

**Possible causes:**
- You didn't move the issue through all three columns
- Your project board uses different column names
- You moved the issue too quickly (e.g., To Do → Done)

**Solution:**
- Verify your board has columns named "To Do", "In Progress", and "Done"
- Make sure you move the issue as you work (not all at once at the end)
- Check the project board history to see which columns you actually used

## Tips for Success

1. **Be Specific:** Detailed issue descriptions help the AI understand what you're supposed to accomplish
2. **Stay Consistent:** Use the same terminology in your issue, commits, PR, and code
3. **Document Everything:** Write clear commit messages and PR descriptions
4. **Follow the Workflow:** Don't skip steps or try to combine them
5. **Work Within the Timeline:** Complete all work within the grading period
6. **Reference the Issue Number:** Always use "Fixes #X" or "Closes #X" in commits and PRs
7. **Test Your Work:** Make sure your changes actually work before submitting the PR
8. **Communicate:** If you're unsure, ask your instructor before the grading deadline

## Need Help?

If you're having trouble getting a good score:
1. Review this guide carefully
2. Check the verbose console output from the grading bot (if your instructor provides it)
3. Ask your instructor to verify your GitHub username and the date range
4. Make sure you're following all steps in order
5. Compare your workflow with a classmate who got a high score

## Summary

Getting a perfect score is straightforward if you follow these steps:

1. **Create** a detailed issue and **assign** it to yourself
2. **Move** it to "In Progress" on the project board
3. **Make** meaningful commits that reference the issue
4. **Create** a pull request that describes your changes
5. **Ensure** your work actually solves the stated problem
6. **Get** your pull request reviewed and merged
7. **Move** the issue to "Done" on the project board

Do all of this within the grading period, and you'll get 100/100! 🎉


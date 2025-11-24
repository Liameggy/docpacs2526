// State management
let currentResults = null;
let currentTeamName = null;
let currentReportPath = null;
let currentTeamId = null;
let currentClassId = null;
let teams = [];
let classes = [];

// DOM Elements
const teamsTab = document.getElementById('teams-tab');
const classesTab = document.getElementById('classes-tab');
const gradeTab = document.getElementById('grade-tab');
const resultsTab = document.getElementById('results-tab');
const teamsList = document.getElementById('teams-list');
const classesList = document.getElementById('classes-list');
const teamModal = document.getElementById('team-modal');
const classModal = document.getElementById('class-modal');
const teamForm = document.getElementById('team-form');
const classForm = document.getElementById('class-form');
const resultsContainer = document.getElementById('results-container');
const selectTeam = document.getElementById('select-team');
const selectClass = document.getElementById('select-class');

// ==================== DATE HELPERS ====================

/**
 * Get the most recent Monday (or today if today is Monday)
 */
function getMostRecentMonday() {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
}

/**
 * Get Monday from N weeks ago
 */
function getMondayWeeksAgo(weeks) {
    const recentMonday = getMostRecentMonday();
    const targetMonday = new Date(recentMonday);
    targetMonday.setDate(recentMonday.getDate() - (weeks * 7));
    return targetMonday;
}

/**
 * Format date for HTML date input (YYYY-MM-DD)
 */
function formatDateForInput(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Get default date range (two Mondays ago to most recent Monday)
 */
function getDefaultDateRange() {
    const endDate = getMostRecentMonday();
    const startDate = getMondayWeeksAgo(2);
    
    return {
        startDate: formatDateForInput(startDate),
        endDate: formatDateForInput(endDate),
    };
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initTeamModal();
    initClassModal();
    initGrading();
    initDateInputs();
    loadTeams();
    loadClasses();
    loadConfig();
});

// ==================== DATE INITIALIZATION ====================

function initDateInputs() {
    const defaults = getDefaultDateRange();
    
    // Populate saved team date inputs
    document.getElementById('saved-start-date').value = defaults.startDate;
    document.getElementById('saved-end-date').value = defaults.endDate;
    
    // Populate class date inputs
    document.getElementById('class-start-date').value = defaults.startDate;
    document.getElementById('class-end-date').value = defaults.endDate;
    
    // Populate user grade date inputs
    document.getElementById('user-start-date').value = defaults.startDate;
    document.getElementById('user-end-date').value = defaults.endDate;
    
    // Populate manual grade date inputs
    document.getElementById('manual-start-date').value = defaults.startDate;
    document.getElementById('manual-end-date').value = defaults.endDate;
}

// ==================== TAB NAVIGATION ====================

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// ==================== TEAMS MANAGEMENT ====================

async function loadTeams() {
    try {
        const response = await fetch('/api/teams');
        const data = await response.json();
        
        if (data.success) {
            teams = data.data;
            renderTeams(teams);
            updateTeamSelect(teams);
        } else {
            showError('Failed to load teams: ' + data.error);
        }
    } catch (error) {
        showError('Error loading teams: ' + error.message);
    }
}

function renderTeams(teams) {
    if (teams.length === 0) {
        teamsList.innerHTML = '<div class="empty-state">No teams yet. Click "Add New Team" to create one.</div>';
        return;
    }

    teamsList.innerHTML = teams.map(team => `
        <div class="team-card">
            <div class="team-card-header">
                <div class="team-name">${escapeHtml(team.name)}</div>
                <div class="team-actions">
                    <button class="btn btn-success" onclick="gradeTeam('${team.id}')">Grade</button>
                    <button class="btn btn-secondary" onclick="editTeam('${team.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteTeam('${team.id}')">Delete</button>
                </div>
            </div>
            <div class="team-info">
                <div class="team-info-item">
                    <span class="team-info-label">Repository:</span>
                    <span>${escapeHtml(team.repoUrl)}</span>
                </div>
                <div class="team-info-item">
                    <span class="team-info-label">Project Board:</span>
                    <span>#${escapeHtml(team.projectBoard)}</span>
                </div>
                <div class="team-info-item">
                    <span class="team-info-label">Created:</span>
                    <span>${formatDate(team.createdAt)}</span>
                </div>
                ${team.lastGradingDate ? `
                    <div class="team-info-item">
                        <span class="team-info-label">Last Graded:</span>
                        <span>${formatDate(team.lastGradingDate)}</span>
                    </div>
                ` : ''}
            </div>
            <div class="team-students">
                ${team.usernames.map(username => `
                    <span class="student-badge">${escapeHtml(username)}</span>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function updateTeamSelect(teams) {
    selectTeam.innerHTML = '<option value="">Select a team...</option>' +
        teams.map(team => `
            <option value="${team.id}">${escapeHtml(team.name)}</option>
        `).join('');
}

// ==================== CLASSES MANAGEMENT ====================

async function loadClasses() {
    try {
        const response = await fetch('/api/classes');
        const data = await response.json();
        
        if (data.success) {
            classes = data.data;
            renderClasses(classes);
            updateClassSelect(classes);
        } else {
            showError('Failed to load classes: ' + data.error);
        }
    } catch (error) {
        showError('Error loading classes: ' + error.message);
    }
}

function renderClasses(classes) {
    if (classes.length === 0) {
        classesList.innerHTML = '<div class="empty-state">No classes yet. Click "Add New Class" to create one.</div>';
        return;
    }

    classesList.innerHTML = classes.map(cls => `
        <div class="team-card">
            <div class="team-card-header">
                <div class="team-name">${escapeHtml(cls.name)}</div>
                <div class="team-actions">
                    <button class="btn btn-success" onclick="gradeClass('${cls.id}')">Grade</button>
                    <button class="btn btn-secondary" onclick="editClass('${cls.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteClass('${cls.id}')">Delete</button>
                </div>
            </div>
            <div class="team-info">
                <div class="team-info-item">
                    <span class="team-info-label">Created:</span>
                    <span>${formatDate(cls.createdAt)}</span>
                </div>
                ${cls.lastGradingDate ? `
                    <div class="team-info-item">
                        <span class="team-info-label">Last Graded:</span>
                        <span>${formatDate(cls.lastGradingDate)}</span>
                    </div>
                ` : ''}
            </div>
            <div class="team-students">
                ${cls.usernames.map(username => `
                    <span class="student-badge">${escapeHtml(username)}</span>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function updateClassSelect(classes) {
    selectClass.innerHTML = '<option value="">Select a class...</option>' +
        classes.map(cls => `
            <option value="${cls.id}">${escapeHtml(cls.name)}</option>
        `).join('');
}

// ==================== CLASS MODAL ====================

function initClassModal() {
    const addClassBtn = document.getElementById('add-class-btn');
    const closeBtn = classModal.querySelector('.close');
    const cancelBtn = document.getElementById('cancel-class-btn');

    addClassBtn.addEventListener('click', () => openClassModal());
    closeBtn.addEventListener('click', () => closeClassModal());
    cancelBtn.addEventListener('click', () => closeClassModal());
    
    classForm.addEventListener('submit', handleClassSubmit);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === classModal) {
            closeClassModal();
        }
    });
}

function openClassModal(cls = null) {
    const modalTitle = document.getElementById('class-modal-title');
    const classId = document.getElementById('class-id');
    
    if (cls) {
        modalTitle.textContent = 'Edit Class';
        classId.value = cls.id;
        document.getElementById('class-name').value = cls.name;
        document.getElementById('class-usernames').value = cls.usernames.join(', ');
    } else {
        modalTitle.textContent = 'Add New Class';
        classId.value = '';
        classForm.reset();
    }
    
    classModal.classList.add('active');
}

function closeClassModal() {
    classModal.classList.remove('active');
    classForm.reset();
}

async function handleClassSubmit(e) {
    e.preventDefault();
    
    const classId = document.getElementById('class-id').value;
    const classData = {
        name: document.getElementById('class-name').value,
        usernames: document.getElementById('class-usernames').value,
    };

    try {
        const url = classId ? `/api/classes/${classId}` : '/api/classes';
        const method = classId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(classData),
        });

        const data = await response.json();
        
        if (data.success) {
            closeClassModal();
            loadClasses();
            showSuccess(classId ? 'Class updated successfully!' : 'Class created successfully!');
        } else {
            showError('Failed to save class: ' + (data.details ? data.details.join(', ') : data.error));
        }
    } catch (error) {
        showError('Error saving class: ' + error.message);
    }
}

async function editClass(id) {
    const cls = classes.find(c => c.id === id);
    if (cls) {
        openClassModal(cls);
    }
}

async function deleteClass(id) {
    if (!confirm('Are you sure you want to delete this class?')) {
        return;
    }

    try {
        const response = await fetch(`/api/classes/${id}`, {
            method: 'DELETE',
        });

        const data = await response.json();
        
        if (data.success) {
            loadClasses();
            showSuccess('Class deleted successfully!');
        } else {
            showError('Failed to delete class: ' + data.error);
        }
    } catch (error) {
        showError('Error deleting class: ' + error.message);
    }
}

// ==================== TEAM MODAL ====================

function initTeamModal() {
    const addTeamBtn = document.getElementById('add-team-btn');
    const closeBtn = teamModal.querySelector('.close');
    const cancelBtn = document.getElementById('cancel-team-btn');

    addTeamBtn.addEventListener('click', () => openTeamModal());
    closeBtn.addEventListener('click', () => closeTeamModal());
    cancelBtn.addEventListener('click', () => closeTeamModal());
    
    teamForm.addEventListener('submit', handleTeamSubmit);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === teamModal) {
            closeTeamModal();
        }
    });
}

function openTeamModal(team = null) {
    const modalTitle = document.getElementById('modal-title');
    const teamId = document.getElementById('team-id');
    
    if (team) {
        modalTitle.textContent = 'Edit Team';
        teamId.value = team.id;
        document.getElementById('team-name').value = team.name;
        document.getElementById('repo-url').value = team.repoUrl;
        document.getElementById('project-board').value = team.projectBoard;
        document.getElementById('usernames').value = team.usernames.join(', ');
    } else {
        modalTitle.textContent = 'Add New Team';
        teamId.value = '';
        teamForm.reset();
    }
    
    teamModal.classList.add('active');
}

function closeTeamModal() {
    teamModal.classList.remove('active');
    teamForm.reset();
}

async function handleTeamSubmit(e) {
    e.preventDefault();
    
    const teamId = document.getElementById('team-id').value;
    const teamData = {
        name: document.getElementById('team-name').value,
        repoUrl: document.getElementById('repo-url').value,
        projectBoard: document.getElementById('project-board').value,
        usernames: document.getElementById('usernames').value,
    };

    try {
        const url = teamId ? `/api/teams/${teamId}` : '/api/teams';
        const method = teamId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(teamData),
        });

        const data = await response.json();
        
        if (data.success) {
            closeTeamModal();
            loadTeams();
            showSuccess(teamId ? 'Team updated successfully!' : 'Team created successfully!');
        } else {
            showError('Failed to save team: ' + (data.details ? data.details.join(', ') : data.error));
        }
    } catch (error) {
        showError('Error saving team: ' + error.message);
    }
}

async function editTeam(id) {
    const team = teams.find(t => t.id === id);
    if (team) {
        openTeamModal(team);
    }
}

async function deleteTeam(id) {
    if (!confirm('Are you sure you want to delete this team?')) {
        return;
    }

    try {
        const response = await fetch(`/api/teams/${id}`, {
            method: 'DELETE',
        });

        const data = await response.json();
        
        if (data.success) {
            loadTeams();
            showSuccess('Team deleted successfully!');
        } else {
            showError('Failed to delete team: ' + data.error);
        }
    } catch (error) {
        showError('Error deleting team: ' + error.message);
    }
}

// ==================== GRADING ====================

function initGrading() {
    const gradeSavedTeamBtn = document.getElementById('grade-saved-team-btn');
    const gradeSavedClassBtn = document.getElementById('grade-saved-class-btn');
    const userGradeForm = document.getElementById('user-grade-form');
    const manualGradeForm = document.getElementById('manual-grade-form');

    gradeSavedTeamBtn.addEventListener('click', handleGradeSavedTeam);
    gradeSavedClassBtn.addEventListener('click', handleGradeSavedClass);
    userGradeForm.addEventListener('submit', handleUserGrade);
    manualGradeForm.addEventListener('submit', handleManualGrade);
}

async function gradeTeam(teamId) {
    switchTab('grade');
    selectTeam.value = teamId;
    await handleGradeSavedTeam();
}

async function handleGradeSavedTeam() {
    const teamId = selectTeam.value;
    
    if (!teamId) {
        showError('Please select a team to grade');
        return;
    }

    const team = teams.find(t => t.id === teamId);
    if (!team) {
        showError('Team not found');
        return;
    }

    // Get date range values
    const startDate = document.getElementById('saved-start-date').value;
    const endDate = document.getElementById('saved-end-date').value;

    await performGrading({ 
        teamId,
        startDate,
        endDate
    }, team.name);
}

async function gradeClass(classId) {
    switchTab('grade');
    selectClass.value = classId;
    await handleGradeSavedClass();
}

async function handleGradeSavedClass() {
    const classId = selectClass.value;
    
    if (!classId) {
        showError('Please select a class to grade');
        return;
    }

    const cls = classes.find(c => c.id === classId);
    if (!cls) {
        showError('Class not found');
        return;
    }

    // Get date range values
    const startDate = document.getElementById('class-start-date').value;
    const endDate = document.getElementById('class-end-date').value;

    await performClassGrading({ 
        classId,
        startDate,
        endDate
    }, cls.name);
}

async function handleUserGrade(e) {
    e.preventDefault();
    
    const data = {
        username: document.getElementById('user-username').value,
        startDate: document.getElementById('user-start-date').value,
        endDate: document.getElementById('user-end-date').value,
    };

    await performUserGrading(data);
}

async function handleManualGrade(e) {
    e.preventDefault();
    
    const data = {
        repoUrl: document.getElementById('manual-repo-url').value,
        projectBoard: document.getElementById('manual-project-board').value,
        usernames: document.getElementById('manual-usernames').value,
        teamName: 'Manual Grading',
        startDate: document.getElementById('manual-start-date').value,
        endDate: document.getElementById('manual-end-date').value,
    };

    await performGrading(data, data.teamName);
}

async function performGrading(data, teamName) {
    const progressDiv = document.getElementById('grading-progress');
    const progressDetail = document.getElementById('progress-detail');
    
    progressDiv.style.display = 'block';
    progressDetail.textContent = 'Fetching GitHub data...';

    try {
        const response = await fetch('/grade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        
        if (result.success) {
            currentResults = result.data.results;
            currentTeamName = result.data.teamName || teamName;
            currentReportPath = result.data.reportPath || null;
            currentTeamId = result.data.teamId || null;
            currentClassId = null;
            
            progressDiv.style.display = 'none';
            switchTab('results');
            renderResults(currentResults, currentTeamName);
            showSuccess('Grading completed successfully! Report saved locally.');
        } else {
            progressDiv.style.display = 'none';
            showError('Grading failed: ' + result.error);
        }
    } catch (error) {
        progressDiv.style.display = 'none';
        showError('Error during grading: ' + error.message);
    }
}

async function performUserGrading(data) {
    const progressDiv = document.getElementById('grading-progress');
    const progressDetail = document.getElementById('progress-detail');
    
    progressDiv.style.display = 'block';
    progressDetail.textContent = 'Scanning all repositories...';

    try {
        const response = await fetch('/grade/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        
        if (result.success) {
            currentResults = result.data.results;
            currentTeamName = `User: ${result.data.username}`;
            currentReportPath = result.data.reportPath || null;
            currentTeamId = null;
            currentClassId = null;
            
            progressDiv.style.display = 'none';
            switchTab('results');
            renderResults(currentResults, currentTeamName);
            showSuccess('User grading completed successfully! Report saved locally.');
        } else {
            progressDiv.style.display = 'none';
            showError('User grading failed: ' + result.error);
        }
    } catch (error) {
        progressDiv.style.display = 'none';
        showError('Error during user grading: ' + error.message);
    }
}

async function performClassGrading(data, className) {
    const progressDiv = document.getElementById('grading-progress');
    const progressDetail = document.getElementById('progress-detail');
    
    progressDiv.style.display = 'block';
    progressDetail.textContent = 'Scanning all repositories...';

    try {
        const response = await fetch('/grade/class', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        
        if (result.success) {
            currentResults = result.data.results;
            currentTeamName = result.data.className || className;
            currentReportPath = result.data.reportPath || null;
            currentTeamId = null;
            currentClassId = result.data.classId || null;
            
            progressDiv.style.display = 'none';
            switchTab('results');
            renderResults(currentResults, currentTeamName);
            showSuccess('Class grading completed successfully! Report saved locally.');
        } else {
            progressDiv.style.display = 'none';
            showError('Class grading failed: ' + result.error);
        }
    } catch (error) {
        progressDiv.style.display = 'none';
        showError('Error during class grading: ' + error.message);
    }
}

// ==================== RESULTS ====================

function renderResults(results, teamName) {
    const exportBtn = document.getElementById('export-html-btn');
    exportBtn.style.display = 'block';
    exportBtn.onclick = () => exportHTML();

    const repoInfo = results.type === 'class' || results.type === 'user' 
        ? `<p><strong>Repositories Scanned:</strong> ${results.repositories ? results.repositories.length : 'All owned repos'}</p>`
        : `<p><strong>Repository:</strong> ${escapeHtml(results.repository)}</p>
           <p><strong>Project:</strong> #${results.projectBoard}</p>`;

    resultsContainer.innerHTML = `
        <div class="results-summary">
            <h3>Grading Summary</h3>
            <p><strong>${results.type === 'class' ? 'Class' : results.type === 'user' ? 'User' : 'Team'}:</strong> ${escapeHtml(teamName)}</p>
            ${repoInfo}
            <p><strong>Graded:</strong> ${formatDate(results.gradedAt)}</p>
            ${results.dateRange ? `
                <p><strong>Date Range:</strong> ${new Date(results.dateRange.startDate).toLocaleDateString()} to ${new Date(results.dateRange.endDate).toLocaleDateString()}</p>
            ` : ''}
            
            ${results.statistics ? `
                <div class="stats-grid">
                    <div class="stat-box">
                        <div class="stat-value">${results.statistics.totalStudents}</div>
                        <div class="stat-label">Students</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${results.statistics.averageScore}</div>
                        <div class="stat-label">Average Score</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${results.statistics.highestScore}</div>
                        <div class="stat-label">Highest Score</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${results.statistics.lowestScore}</div>
                        <div class="stat-label">Lowest Score</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${results.statistics.passingRate}%</div>
                        <div class="stat-label">Pass Rate</div>
                    </div>
                </div>
            ` : ''}
        </div>

        <div class="student-results">
            ${results.students.map(student => renderStudent(student)).join('')}
        </div>
    `;
}

function renderStudent(student) {
    return `
        <div class="student-card">
            <div class="student-header">
                <div class="student-username">${escapeHtml(student.username)}</div>
                <div class="student-score">
                    <div class="score-value">${student.totalScore}/${student.maxScore}</div>
                    <div class="score-grade">${student.letterGrade} (${student.percentage}%)</div>
                </div>
            </div>
            <div class="student-body">
                <div class="criteria-list">
                    ${Object.entries(student.criteria).map(([key, criterion]) => `
                        <div class="criterion-item ${criterion.passed ? 'passed' : 'failed'}">
                            <span class="criterion-name">${escapeHtml(criterion.name)}</span>
                            <span class="criterion-points">${criterion.points}/${criterion.maxPoints}</span>
                            <span class="criterion-status">${criterion.passed ? '✓' : '✗'}</span>
                        </div>
                    `).join('')}
                </div>
                
                ${student.issues && student.issues.length > 0 ? `
                    <div style="margin-top: 15px;">
                        <strong>Issues:</strong> ${student.issues.map(issue => 
                            `<a href="${issue.url}" target="_blank">#${issue.number}</a>`
                        ).join(', ')}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

async function exportHTML() {
    try {
        const requestBody = {};
        
        // Prefer teamId or classId if available, otherwise use reportPath
        if (currentTeamId) {
            requestBody.teamId = currentTeamId;
        } else if (currentClassId) {
            // For classes, we'll use reportPath since export endpoint doesn't support classes yet
            if (currentReportPath) {
                requestBody.reportPath = currentReportPath;
            } else {
                showError('No report available. Please re-grade the class.');
                return;
            }
        } else if (currentReportPath) {
            requestBody.reportPath = currentReportPath;
        } else {
            showError('No report available. Please re-grade.');
            return;
        }

        const response = await fetch('/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            // Extract filename from Content-Disposition header or use default
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `grading-report-${Date.now()}.html`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showSuccess('Report downloaded successfully!');
        } else {
            const errorData = await response.json();
            showError('Failed to export report: ' + (errorData.error || 'Unknown error'));
        }
    } catch (error) {
        showError('Error exporting report: ' + error.message);
    }
}

// ==================== CONFIG ====================

async function loadConfig() {
    try {
        const response = await fetch('/api/config');
        const data = await response.json();
        
        if (data.success) {
            console.log('Config loaded:', data.data);
        }
    } catch (error) {
        console.error('Error loading config:', error);
    }
}

// ==================== UTILITIES ====================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function showSuccess(message) {
    // Simple alert for now - could be enhanced with a toast notification
    alert('✓ ' + message);
}

function showError(message) {
    // Simple alert for now - could be enhanced with a toast notification
    alert('✗ ' + message);
}


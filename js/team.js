// check if user is logged in
const user = JSON.parse(sessionStorage.getItem('user') || 'null');
if (!user) {
  location.href = 'frontend/index.html';
} else {
  const nameEl = document.getElementById('userName');
  if (nameEl) nameEl.textContent = user.name;
}

// logout button
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('user');
    location.href = 'frontend/index.html';
  });
}

// get team id from url params
const params = new URLSearchParams(location.search);
const teamIdParam = params.get('teamId') || params.get('team_Id');

// load team page data
async function loadTeamPage(){
  const teamTitle = document.getElementById('teamTitle');
  const membersList = document.getElementById('membersList');
  
  if (teamIdParam) {
    if (membersList) membersList.innerHTML = '<div style="text-align: center; padding: 1rem; color: var(--text-light);">Loading...</div>';
    
    try {
      // Load team details
      const teamData = await window.api.getTeamDetails(teamIdParam);
      if (teamData.team) {
        teamTitle.textContent = `Team Dashboard - ${teamData.team.name}`;
      } else {
        teamTitle.textContent = `Team Dashboard - Team ${teamIdParam}`;
      }
      
      // Load team statistics
      const stats = await window.api.getTeamStats(teamIdParam);
      updateStatistics(stats);
      
      // Load team members with their tasks
      const data = await window.api.getTeamMembers(teamIdParam);
      membersList.innerHTML = '';
      
      if (data.members && data.members.length > 0) {
        // Get tasks for each member from stats
        const memberTasksMap = {};
        if (stats.tasksByMember) {
          stats.tasksByMember.forEach(m => {
            memberTasksMap[m.id] = m;
          });
        }
        
        // Load all tasks to get details
        const tasksData = await window.api.getTasksByTeam(teamIdParam);
        const tasksByMember = {};
        if (tasksData.tasks) {
          tasksData.tasks.forEach(t => {
            if (t.assigned_to) {
              if (!tasksByMember[t.assigned_to]) {
                tasksByMember[t.assigned_to] = [];
              }
              tasksByMember[t.assigned_to].push(t);
            }
          });
        }
        
        data.members.forEach(m => {
          const memberCard = document.createElement('div');
          memberCard.className = 'member-card';
          
          const memberInfo = memberTasksMap[m.id] || { task_count: 0, completed_count: 0 };
          const memberTasks = tasksByMember[m.id] || [];
          
          memberCard.innerHTML = `
            <h4>${m.name} <span style="font-size: 0.9rem; color: var(--text-light); font-weight: normal;">(${m.email})</span></h4>
            <div style="display: flex; gap: 1.5rem; margin-bottom: 1rem; font-size: 0.9rem;">
              <div><strong>Total Tasks:</strong> ${memberInfo.task_count || 0}</div>
              <div><strong>Completed:</strong> ${memberInfo.completed_count || 0}</div>
            </div>
            <div class="member-tasks">
              <strong style="font-size: 0.95rem; color: var(--text-light);">Assigned Tasks:</strong>
              ${memberTasks.length > 0 ? 
                memberTasks.map(t => `
                  <div class="member-task-item">
                    <div>
                      <strong>${t.title}</strong>
                      <span class="status-badge status-${(t.status || 'Pending').toLowerCase().replace(' ', '-')}" style="margin-left: 0.75rem;">${t.status || 'Pending'}</span>
                    </div>
                    <div style="color: var(--text-light); font-size: 0.85rem;">
                      ${t.due_date ? new Date(t.due_date).toLocaleDateString() : 'No due date'}
                    </div>
                  </div>
                `).join('') 
                : '<div style="color: var(--text-light); font-style: italic; padding: 0.5rem;">No tasks assigned</div>'
              }
            </div>
          `;
          membersList.appendChild(memberCard);
        });
      } else {
        membersList.innerHTML = '<div style="text-align: center; color: var(--text-light);">No members found</div>';
      }
    } catch (err) {
      membersList.innerHTML = '<div style="color: var(--danger);">Could not load team data</div>';
      console.error(err);
    }
  } else {
    if (teamTitle) teamTitle.textContent = 'Team Dashboard';
    if (membersList) membersList.innerHTML = '<div style="text-align: center; color: var(--text-light);">No team selected</div>';
  }
}

// Update statistics display
function updateStatistics(stats) {
  document.getElementById('totalTasks').textContent = stats.totalTasks || 0;
  document.getElementById('pendingTasks').textContent = stats.tasksByStatus?.Pending || 0;
  document.getElementById('inProgressTasks').textContent = stats.tasksByStatus?.['In Progress'] || 0;
  document.getElementById('completedTasks').textContent = stats.tasksByStatus?.Completed || 0;
  document.getElementById('memberCount').textContent = stats.memberCount || 0;
  
  // Update progress bar
  const total = stats.totalTasks || 1;
  const completed = stats.tasksByStatus?.Completed || 0;
  const percent = Math.round((completed / total) * 100);
  document.getElementById('completionPercent').textContent = `${percent}%`;
  document.getElementById('progressBar').style.width = `${percent}%`;
}

// join team form
const joinTeamForm = document.getElementById('joinTeamForm');
if (joinTeamForm) {
  joinTeamForm.addEventListener('submit', async e => {
    e.preventDefault();
    
    const teamId = document.getElementById('teamIdJoin').value.trim();
    const user = JSON.parse(sessionStorage.getItem('user') || 'null');
    
    if (!user) {
      alert('Please login');
      location.href = 'frontend/index.html';
      return;
    }
    
    if (!teamId) {
      alert('Please enter a team ID');
      return;
    }
    
    const submitBtn = joinTeamForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Joining...';
    
    try {
      const res = await window.api.joinTeam(parseInt(teamId, 10), user.id);
      submitBtn.textContent = 'Joined!';
      document.getElementById('teamIdJoin').value = '';
      
      setTimeout(() => {
        loadTeamPage();
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }, 1000);
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      alert(err.message || 'Join failed');
    }
  });
}

document.addEventListener('DOMContentLoaded', loadTeamPage);

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

// load teams and populate dropdowns
async function refreshTeamsAndSelect(){
  const teamList = document.getElementById('teamList');
  const selectTeam = document.getElementById('selectTeam');
  const assignUser = document.getElementById('assignUser');

  // show loading
  if (teamList) teamList.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-light);">Loading teams...</div>';
  if (selectTeam) selectTeam.innerHTML = '<option value="">Loading...</option>';
  
  try {
    const data = await window.api.getTeamsForUser(user ? user.id : null);

    if (teamList) teamList.innerHTML = '';
    if (selectTeam) selectTeam.innerHTML = '<option value="">Select a team</option>';

    if (data.teams && data.teams.length > 0) {
      data.teams.forEach(t => {
        if (teamList) {
          const d = document.createElement('div');
          d.className = 'team-box';
          d.innerHTML = `<h4>${t.name}</h4><div>Code: ${t.code || 'N/A'}</div><div>Team ID: ${t.id}</div>
            <a href="team.html?teamId=${t.id}">View Team</a>`;
          teamList.appendChild(d);
        }
        if (selectTeam) {
          const opt = document.createElement('option');
          opt.value = t.id;
          opt.textContent = `${t.name} (${t.code || t.id})`;
          selectTeam.appendChild(opt);
        }
      });
    } else {
      if (teamList) teamList.innerHTML = '<p style="text-align: center; color: var(--text-light);">No teams yet. Create one below!</p>';
    }

    // load users for assignment dropdown
    try {
      const usersRes = await fetch('http://localhost:4000/api/users');
      if (!usersRes.ok) throw new Error('Failed to fetch users');
      const usersData = await usersRes.json();
      if (assignUser && usersData.users) {
        assignUser.innerHTML = '<option value="">Unassigned</option>';
        usersData.users.forEach(u => {
          const opt = document.createElement('option');
          opt.value = u.id;
          opt.textContent = u.name;
          assignUser.appendChild(opt);
        });
      }
    } catch (err) {
      console.error('Could not load users:', err);
    }

  } catch (err) {
    console.error('Could not load teams/users:', err);
    if (teamList) teamList.innerHTML = '<p style="text-align: center; color: var(--danger);">Error loading teams</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  refreshTeamsAndSelect();
});

// create team form
const createTeamForm = document.getElementById('createTeamForm');
if (createTeamForm) {
  createTeamForm.addEventListener('submit', async e => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login first');
      location.href = 'frontend/index.html';
      return;
    }
    
    const teamName = document.getElementById('teamName').value.trim();
    if (!teamName) {
      alert('Please enter a team name');
      return;
    }
    
    const submitBtn = createTeamForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';
    
    try {
      const resp = await window.api.createTeam(teamName, user.id);
      submitBtn.textContent = 'Created!';
      document.getElementById('teamName').value = '';
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        refreshTeamsAndSelect();
      }, 1000);
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      alert(err.message || 'Create team failed');
    }
  });
}

// create task form
const taskForm = document.getElementById('taskForm');
if (taskForm) {
  taskForm.addEventListener('submit', async e => {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDesc').value.trim();
    const team_Id = document.getElementById('selectTeam').value;
    const assigned_to = document.getElementById('assignUser').value || null;
    const due_date = document.getElementById('taskDue').value || null;
    
    if (!team_Id) {
      alert('Please select a team first');
      return;
    }
    
    const submitBtn = taskForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';
    
    const status = document.getElementById('taskStatus').value;
    
    try {
      const res = await window.api.createTask({
        team_id: parseInt(team_Id, 10),
        title,
        description,
        assigned_to: assigned_to ? parseInt(assigned_to, 10) : null,
        due_date,
        status: status || 'Pending'
      });
      submitBtn.textContent = 'Created!';
      loadTasks(team_Id);
      taskForm.reset();
      document.getElementById('taskStatus').value = 'Pending';
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }, 1000);
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      alert(err.message || 'Task create failed');
    }
  });
}

// load tasks for selected team
async function loadTasks(teamId){
  if (!teamId) {
    const ul = document.getElementById('taskList');
    if (ul) ul.innerHTML = '<li style="text-align: center; color: var(--text-light);">Select a team to view tasks</li>';
    return;
  }
  
  const ul = document.getElementById('taskList');
  if (ul) ul.innerHTML = '<li style="text-align: center; padding: 2rem; color: var(--text-light);">Loading tasks...</li>';
  
  try {
    const data = await window.api.getTasksByTeam(teamId);
    ul.innerHTML = '';
    
    // Group tasks by status
    const tasksByStatus = {
      'Pending': [],
      'In Progress': [],
      'Completed': []
    };
    
    if (data.tasks && data.tasks.length > 0) {
      data.tasks.forEach(t => {
        const status = t.status || 'Pending';
        if (tasksByStatus[status]) {
          tasksByStatus[status].push(t);
        } else {
          tasksByStatus['Pending'].push(t);
        }
      });
      
      // Get filter value
      const filterStatus = document.getElementById('filterStatus')?.value || 'all';
      
      // Display tasks grouped by status
      ['Pending', 'In Progress', 'Completed'].forEach(status => {
        // Apply filter
        if (filterStatus !== 'all' && filterStatus !== status) {
          return;
        }
        
        if (tasksByStatus[status].length > 0) {
          const statusHeader = document.createElement('li');
          statusHeader.className = 'task-status-header';
          statusHeader.innerHTML = `<h4 style="margin: 1.5rem 0 1rem 0; color: var(--text); font-size: 1.2rem; font-weight: 700;">${status} (${tasksByStatus[status].length})</h4>`;
          ul.appendChild(statusHeader);
          
          tasksByStatus[status].forEach(t => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.dataset.taskId = t.id;
            const statusClass = t.status ? `status-${t.status.toLowerCase().replace(' ', '-')}` : 'status-pending';
            const statusBadge = `<span class="status-badge ${statusClass}">${t.status || 'Pending'}</span>`;
            
            li.innerHTML = `
              <div style="display: flex; justify-content: space-between; align-items: start; gap: 1rem;">
                <div style="flex: 1;">
                  <strong>${t.title}</strong>
                  ${t.description ? `<div style="margin-top: 0.5rem;">${t.description}</div>` : ''}
                  <div style="margin-top: 0.75rem; display: flex; gap: 1.5rem; flex-wrap: wrap; font-size: 0.9rem;">
                    <div><strong>Assigned:</strong> ${t.assigned_name || 'Unassigned'}</div>
                    <div><strong>Due:</strong> ${t.due_date ? new Date(t.due_date).toLocaleDateString() : 'No due date'}</div>
                  </div>
                  <div style="margin-top: 0.75rem;">${statusBadge}</div>
                </div>
                <div style="display: flex; gap: 0.5rem; flex-direction: column;">
                  <button class="btn-small" onclick="editTask(${t.id}, '${t.title.replace(/'/g, "\\'")}', '${(t.description || '').replace(/'/g, "\\'")}', ${t.assigned_to || 'null'}, '${t.due_date || ''}', '${t.status || 'Pending'}')" style="font-size: 0.8rem; padding: 0.5rem 1rem;">Edit</button>
                  <button class="btn-small" onclick="deleteTaskHandler(${t.id})" style="font-size: 0.8rem; padding: 0.5rem 1rem; background: linear-gradient(135deg, var(--danger), var(--danger-light));">Delete</button>
                </div>
              </div>
            `;
            ul.appendChild(li);
          });
        }
      });
    } else {
      ul.innerHTML = '<li style="text-align: center; color: var(--text-light);">No tasks yet. Create one below!</li>';
    }
  } catch (err) {
    console.error('Load tasks error', err);
    const ul = document.getElementById('taskList');
    if (ul) ul.innerHTML = '<li style="color: var(--danger);">Error loading tasks</li>';
  }
}

// Edit task handler
async function editTask(id, title, description, assignedTo, dueDate, status) {
  // Escape HTML entities for display in prompt
  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };
  
  const newTitle = prompt('Task Title:', escapeHtml(title));
  if (newTitle === null || !newTitle.trim()) return;
  
  const newDescription = prompt('Description:', escapeHtml(description || ''));
  if (newDescription === null) return;
  
  let newStatus = prompt('Status (Pending, In Progress, Completed):', status);
  if (newStatus === null) return;
  newStatus = newStatus.trim();
  
  if (!['Pending', 'In Progress', 'Completed'].includes(newStatus)) {
    alert('Status must be: Pending, In Progress, or Completed');
    return;
  }
  
  let newDueDate = prompt('Due Date (YYYY-MM-DD) or leave empty:', dueDate || '');
  if (newDueDate === null) return;
  newDueDate = newDueDate.trim();
  
  try {
    await window.api.updateTask(id, {
      title: newTitle.trim(),
      description: newDescription.trim(),
      status: newStatus,
      due_date: newDueDate || null
    });
    
    const teamId = document.getElementById('selectTeam')?.value;
    if (teamId) loadTasks(teamId);
  } catch (err) {
    alert(err.message || 'Failed to update task');
  }
}

// Delete task handler
async function deleteTaskHandler(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;
  
  try {
    await window.api.deleteTask(id);
    const teamId = document.getElementById('selectTeam')?.value;
    if (teamId) loadTasks(teamId);
  } catch (err) {
    alert(err.message || 'Failed to delete task');
  }
}

// when team selection changes, load tasks
document.getElementById('selectTeam')?.addEventListener('change', (e) => {
  loadTasks(e.target.value);
});

// when status filter changes, reload tasks
document.getElementById('filterStatus')?.addEventListener('change', (e) => {
  const teamId = document.getElementById('selectTeam')?.value;
  if (teamId) {
    loadTasks(teamId);
  }
});

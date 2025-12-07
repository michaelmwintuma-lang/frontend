// API functions for backend communication
const API_BASE = "http://localhost:4000/api";

const APU_URL = "https://backend-52bb.onrender.com/api";

// helper to handle json responses and errors
async function handleJSONResponse(res){
  const data = await res.json().catch(()=>({}));
  if (!res.ok) {
    const error = new Error(data.message || `HTTP error! status: ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function registerUser(name, email, password){
  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name, email, password})
    });
    return handleJSONResponse(res);
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(`Network error: Could not connect to server at ${API_BASE}. Make sure the backend server is running on port 4000.`);
    }
    throw err;
  }
}

async function loginUser(email, password){
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, password})
    });
    return handleJSONResponse(res);
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(`Network error: Could not connect to server at ${API_BASE}. Make sure the backend server is running on port 4000.`);
    }
    throw err;
  }
}

async function createTeam(teamName, user_Id){
  try {
    const res = await fetch(`${API_BASE}/team/create`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({teamName, user_Id})
    });
    return handleJSONResponse(res);
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(`Network error: Could not connect to server at ${API_BASE}. Make sure the backend server is running on port 4000.`);
    }
    throw err;
  }
}

async function joinTeam(teamId, user_Id){
  try {
    const res = await fetch(`${API_BASE}/team/join`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({teamId, user_Id})
    });
    return handleJSONResponse(res);
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(`Network error: Could not connect to server at ${API_BASE}. Make sure the backend server is running on port 4000.`);
    }
    throw err;
  }
}

async function getTeamMembers(team_Id){
  try {
    const res = await fetch(`${API_BASE}/team/${team_Id}/members`);
    return handleJSONResponse(res);
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(`Network error: Could not connect to server at ${API_BASE}. Make sure the backend server is running on port 4000.`);
    }
    throw err;
  }
}

// gets all teams - might filter by user later
async function getTeamsForUser(user_Id){
  try {
    const res = await fetch(`${API_BASE}/team`);
    return handleJSONResponse(res);
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(`Network error: Could not connect to server at ${API_BASE}. Make sure the backend server is running on port 4000.`);
    }
    throw err;
  }
}

async function getTeamStats(teamId){
  try {
    const res = await fetch(`${API_BASE}/team/${teamId}/stats`);
    return handleJSONResponse(res);
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(`Network error: Could not connect to server at ${API_BASE}. Make sure the backend server is running on port 4000.`);
    }
    throw err;
  }
}

async function getTeamDetails(teamId){
  try {
    const res = await fetch(`${API_BASE}/team/${teamId}`);
    return handleJSONResponse(res);
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(`Network error: Could not connect to server at ${API_BASE}. Make sure the backend server is running on port 4000.`);
    }
    throw err;
  }
}

async function createTask(task){
  try {
    const res = await fetch(`${API_BASE}/task`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(task)
    });
    return handleJSONResponse(res);
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(`Network error: Could not connect to server at ${API_BASE}. Make sure the backend server is running on port 4000.`);
    }
    throw err;
  }
}

async function getTasksByTeam(team_Id){
  try {
    const res = await fetch(`${API_BASE}/task/team/${team_Id}`);
    return handleJSONResponse(res);
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(`Network error: Could not connect to server at ${API_BASE}. Make sure the backend server is running on port 4000.`);
    }
    throw err;
  }
}

async function updateTask(id, fields){
  try {
    const res = await fetch(`${API_BASE}/task/${id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(fields)
    });
    return handleJSONResponse(res);
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(`Network error: Could not connect to server at ${API_BASE}. Make sure the backend server is running on port 4000.`);
    }
    throw err;
  }
}

async function deleteTask(id){
  try {
    const res = await fetch(`${API_BASE}/task/${id}`, {
      method: 'DELETE'
    });
    return handleJSONResponse(res);
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(`Network error: Could not connect to server at ${API_BASE}. Make sure the backend server is running on port 4000.`);
    }
    throw err;
  }
}

// expose to window for global access
window.api = {
  registerUser,
  loginUser,
  createTeam,
  joinTeam,
  getTeamMembers,
  createTask,
  getTasksByTeam,
  updateTask,
  deleteTask,
  getTeamsForUser,
  getTeamStats,
  getTeamDetails
};

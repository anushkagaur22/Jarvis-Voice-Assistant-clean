const API = import.meta.env.VITE_API_URL;

// ---------------- TOKEN HELPERS ----------------

function getToken() {
  return localStorage.getItem("token");
}

function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function setRefreshToken(token) {
  localStorage.setItem("refresh_token", token);
}

function logout() {
  localStorage.clear();
  window.location.href = "/login";
}

// ---------------- REFRESH TOKEN ----------------

async function refreshAccessToken() {
  const refresh = getRefreshToken();

  if (!refresh) return false;

  const r = await fetch(`${API}/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      refresh_token: refresh
    })
  });

  if (!r.ok) return false;

  const data = await r.json();

  setToken(data.access_token);

  return true;
}

// ---------------- AUTH FETCH WRAPPER ----------------

async function authFetch(endpoint, options = {}) {
  const token = getToken();

  const response = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  // Token expired → try refresh
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      return authFetch(endpoint, options);
    } else {
      logout();
      return;
    }
  }

  return response;
}

// ---------------- Conversations ----------------

export async function getConversations() {
  const r = await authFetch("/conversations");

  if (!r.ok) {
    throw new Error("Failed to load history");
  }

  return r.json();
}

// ---------------- Dashboard Sync ----------------

export async function syncProductivity() {
  const r = await authFetch("/performance/sync", {
    method: "POST"
  });

  if (!r.ok) {
    const errorText = await r.text();
    throw new Error(`Sync failed: ${errorText}`);
  }

  return r.json();
}

// ---------------- Chat ----------------

export async function sendMessage(message, conversation_id) {
  const r = await authFetch("/chat", {
    method: "POST",
    body: JSON.stringify({
      message,
      conversation_id
    })
  });

  if (!r.ok) {
    throw new Error("Chat failed");
  }

  return r.json();
}

// ---------------- Weekly Dashboard Trend ----------------

export async function getWeeklyTrend() {
  const r = await authFetch("/dashboard/weekly");

  if (!r.ok) {
    throw new Error("Failed to fetch weekly trend");
  }

  return r.json();
}


export async function getHeatmap() {
  const r = await authFetch("/dashboard/heatmap");

  if (!r.ok) {
    throw new Error("Failed to fetch heatmap");
  }

  return r.json();
}
const API = import.meta.env.VITE_API_URL;

// ---------------- TOKEN HELPERS ----------------

function getToken() {
  return localStorage.getItem("token");
}


function logout() {
  localStorage.clear();
  window.location.href = "/login";
}

// ---------------- REFRESH TOKEN ----------------


// ---------------- AUTH FETCH WRAPPER ----------------
async function authFetch(endpoint, options = {}) {
  const token = getToken();

  const response = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {})
    }
  });

  if (response.status === 401) {
    logout(); // simple and correct
    return;
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
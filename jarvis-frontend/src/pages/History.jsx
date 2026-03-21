import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./History.css";

const API = "http://127.0.0.1:8000";

export default function History() {
  const [conversations, setConversations] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ---------------- FETCH HISTORY ---------------- */

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch(`${API}/conversations`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!res.ok) throw new Error("Failed to load history");

        const data = await res.json();

        setConversations(Array.isArray(data) ? data : []);

      } catch (err) {
        console.error("History error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [navigate]);

  /* ---------------- SAFE NAVIGATION ---------------- */

  const openChat = async (chatId) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API}/conversations/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // 🔥 FIX: HANDLE 404 BEFORE NAVIGATING
      if (res.status === 404) {
        alert("⚠️ This conversation no longer exists");
        return;
      }

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      navigate(`/app/chat/${chatId}`);

    } catch (err) {
      console.error("Open chat error:", err);
    }
  };

  /* ---------------- FILTER ---------------- */

  const filtered = conversations.filter((c) =>
    (c.title || "Untitled").toLowerCase().includes(query.toLowerCase())
  );

  /* ---------------- UI ---------------- */

  return (
    <div className="history-page">

      <div className="history-header">
        <h1>Your Conversations</h1>
        <p>Pick up where you left off</p>
      </div>

      <div className="search-wrapper">
        <input
          className="history-search"
          placeholder="Search topics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="history-list">

        {loading ? (
          <p style={{ textAlign: "center", color: "#888" }}>
            Loading history...
          </p>

        ) : filtered.length === 0 ? (

          <div className="empty-history">
            <p>No conversations found.</p>
            <button
              onClick={() => navigate("/app/chat")}
              className="new-chat-btn"
            >
              Start New Chat
            </button>
          </div>

        ) : (

          <AnimatePresence>
            {filtered.map((chat) => (
              <motion.div
                key={chat.id}
                className="history-card"
                onClick={() => openChat(chat.id)} // 🔥 FIXED HERE
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >

                <div className="card-top">
                  <h3>{chat.title || "New Conversation"}</h3>

                  <span className="date-badge">
                    {chat.updated_at
                      ? new Date(chat.updated_at).toLocaleDateString()
                      : "Recent"}
                  </span>
                </div>

                <p className="preview">
                  {chat.preview || "No messages yet..."}
                </p>

                <div className="card-footer">
                  <span>💬 {chat.message_count || 0} messages</span>
                  <span className="resume-link">Resume →</span>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>

        )}

      </div>
    </div>
  );
}
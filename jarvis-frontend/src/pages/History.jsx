import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./History.css";

const API = import.meta.env.VITE_API_URL;

export default function History() {
  const [conversations, setConversations] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`${API}/conversations`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.status === 401) {
          localStorage.clear();
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

  /* 🔥 FIX: REMOVE PRE-FETCH (CAUSE OF GLITCH) */
  const openChat = (chatId) => {
    navigate(`/app/chat/${chatId}`);
  };

  const filtered = conversations.filter((c) =>
    (c.title || "Untitled").toLowerCase().includes(query.toLowerCase())
  );

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
                onClick={() => openChat(chat.id)}
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
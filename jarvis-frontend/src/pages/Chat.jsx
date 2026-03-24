import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useJarvisMode } from "../context/JarvisModeContext";

import Mascot from "../components/Mascot";
import MessageBubble from "../components/MessageBubble";

import { Mic, Square, Send } from "lucide-react";
import { MODES } from "../data/modes";

import "./Chat.css";

// ✅ FIXED: Using Environment Variable for deployed backend
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const SUGGESTIONS = [
  "Explain Quantum Physics ⚛️",
  "Write a Python script 🐍",
  "Tell me a fun fact 💡",
  "Debug my code 🐞"
];

export default function Chat() {

  const { id } = useParams();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const { mode, setMode } = useJarvisMode();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle");

  const token = localStorage.getItem("token")?.trim();

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  /* ---------------- LOAD HISTORY (FIXED) ---------------- */
  useEffect(() => {
    if (!id) {
      setMessages([]); // Clear messages if starting a new chat
      return;
    }

    const loadConversation = async () => {
      try {
        const res = await fetch(`${API}/conversations/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // ✅ FIX: Handle 404 properly if chat was deleted
        if (res.status === 404) {
          console.warn("Conversation not found. Redirecting to new chat.");
          navigate("/app/chat");
          return;
        }

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const data = await res.json();

        setMessages(
          (data.messages || []).map(m => ({
            role: m.role,
            content: m.content,
            animate: false
          }))
        );

      } catch (err) {
        console.error("Load error:", err);
      }
    };

    loadConversation();

  }, [id, token, navigate]);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- VOICE OUTPUT ---------------- */
  const speak = (text) => {
    if (!window.speechSynthesis) return;

    const config = MODES[mode];

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = config.voice.rate;
    utterance.pitch = config.voice.pitch;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  /* ---------------- VOICE INPUT ---------------- */
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    recognition.start();

    recognition.onstart = () => setStatus("listening");

    recognition.onresult = (e) => {
      setInput(e.results[0][0].transcript);
    };

    recognition.onend = () => setStatus("idle");
  };

  const stopAll = () => {
    window.speechSynthesis.cancel();
    setStatus("idle");
  };

  /* ---------------- SEND MESSAGE (FIXED) ---------------- */
  const send = async (text) => {

    const msg = typeof text === "string" ? text : input;
    if (!msg.trim()) return;

    const userMsg = {
      role: "user",
      content: msg,
      animate: false
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setStatus("thinking");

    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          message: msg,
          conversation_id: id ? parseInt(id) : null
        })
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Server error");
      }

      const data = await res.json();

      // ✅ FIX: Route to the newly created conversation ID
      if (!id && data.conversation_id) {
        navigate(`/app/chat/${data.conversation_id}`, { replace: true });
      }

      if (data.mode) {
        setMode(data.mode);
      }

      const botMsg = {
        role: "assistant",
        content: data.reply,
        animate: true
      };

      setMessages(prev => [...prev, botMsg]);
      speak(data.reply);

    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setStatus("idle");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="chat-screen">

      <div className="chat-column">

        <div className="chat-header-glass">

          <div className="header-mascot-wrapper">
            <Mascot active={status !== "idle"} />
          </div>

          <div className="header-info">
            <h2>Jarvis AI</h2>

            <div className="status-badge">
              <span className={`status-dot ${status === "idle" ? "online" : "busy"}`} />

              {status === "idle"
                ? "Online"
                : status === "listening"
                ? "Listening..."
                : status === "speaking"
                ? "Speaking..."
                : "Thinking..."}
            </div>
          </div>

        </div>

        <div className="chat-history">

          {messages.length === 0 && (
            <motion.div className="empty-state">
              <h2 className="empty-title">How can I help you?</h2>

              <div className="suggestion-grid">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} className="suggestion-chip" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div key={i} className={`chat-row ${m.role}`}>
                <MessageBubble
                  role={m.role}
                  content={m.content}
                  animate={m.animate !== false}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {status === "thinking" && (
            <div className="chat-row assistant">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}

          <div ref={bottomRef}></div>

        </div>

        <div className="input-container">

          <form
            className="chat-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >

            <button
              type="button"
              className={`action-btn mic-btn ${status === "listening" ? "active" : ""}`}
              onClick={status === "speaking" ? stopAll : startListening}
            >
              {status === "speaking"
                ? <Square size={18} />
                : <Mic size={20} />}
            </button>

            <input
              className="chat-input"
              placeholder="Message Jarvis..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <button type="submit" className="action-btn send-btn">
              <Send size={18} />
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}
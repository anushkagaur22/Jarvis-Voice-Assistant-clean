import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ImageSlider from "./ImageSlider1";
import AuthMascot from "./AuthMascot";
import "./Auth.css";

const API = "http://127.0.0.1:8000";

const AuthContainer = ({ initialMode = "login" }) => {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    github_username: "",
    leetcode_username: "",
  });

  const navigate = useNavigate();

  /* ---------------- AUTO LOGIN ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/landing");
    }
  }, [navigate]);

  /* ---------------- INPUT ---------------- */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  /* ---------------- GOOGLE LOGIN (TEMP SAFE) ---------------- */
  const handleGoogleLogin = () => {
    alert("Google login coming soon 🚀");
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "login" : "signup";

      const res = await fetch(`${API}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.username,
          password: formData.password,
          github_username: formData.github_username,
          leetcode_username: formData.leetcode_username,
        }),
      });

      const data = await res.json();

      // ❌ HANDLE ERROR
      if (!res.ok) {
        setError(data.detail || "Something went wrong");
        setLoading(false);
        return;
      }

      /* ---------------- LOGIN ---------------- */
      if (isLogin) {
        localStorage.setItem("token", data.access_token);

        // ✅ FIX: force app to re-read token
        window.location.href = "/landing";
      }

      /* ---------------- SIGNUP ---------------- */
      else {
        // backend should return token (auto login)
        localStorage.setItem("token", data.access_token);

        // ✅ same fix
        window.location.href = "/landing";
      }

    } catch (err) {
      console.error(err);
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="auth-container">
      
      {/* LEFT */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="auth-left"
      >
        <ImageSlider />
      </motion.div>

      {/* RIGHT */}
      <div className="auth-right">
        <motion.div
          className="auth-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AuthMascot />

          <h2>{isLogin ? "Welcome Back" : "Join Jarvis"}</h2>

          <button className="social-btn" onClick={handleGoogleLogin}>
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
            />
            <span>Continue with Google</span>
          </button>

          <div className="divider">
            <span>or use email</span>
          </div>

          {/* ERROR */}
          {error && (
            <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="auth-form-wrapper">

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="signup"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <input
                    type="text"
                    name="github_username"
                    placeholder="GitHub Username"
                    className="auth-input"
                    value={formData.github_username}
                    onChange={handleChange}
                    required
                  />

                  <input
                    type="text"
                    name="leetcode_username"
                    placeholder="LeetCode Username"
                    className="auth-input"
                    value={formData.leetcode_username}
                    onChange={handleChange}
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <input
              type="email"
              name="username"
              placeholder="Email Address"
              className="auth-input"
              value={formData.username}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              className="auth-input"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* FOOTER */}
          <div className="auth-footer">
            <span>{isLogin ? "New here?" : "Already a member?"}</span>

            <button
              className="toggle-btn"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
            >
              {isLogin ? "Create Account" : "Log In"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthContainer;
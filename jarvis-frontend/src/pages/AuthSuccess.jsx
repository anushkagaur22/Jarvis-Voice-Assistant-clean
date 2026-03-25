import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // 🔍 Get tokens from URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const refresh = params.get("refresh");

    console.log("TOKEN:", token);

    if (token) {
      try {
        // ✅ Save tokens
        localStorage.setItem("token", token);
        if (refresh) {
          localStorage.setItem("refresh_token", refresh);
        }

        // ✅ Small delay (fixes Vercel timing issues)
        setTimeout(() => {
          navigate("/landing", { replace: true });
        }, 100);

      } catch (error) {
        console.error("Storage error:", error);
        navigate("/login", { replace: true });
      }
    } else {
      // ❌ No token → go back to login
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Logging you in...</h2>
      <p>Please wait while we set things up 🚀</p>
    </div>
  );
}
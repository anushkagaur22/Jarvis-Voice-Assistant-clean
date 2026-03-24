import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");
    const refresh = params.get("refresh");

    console.log("TOKEN:", token); // debug

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("refresh_token", refresh);

      navigate("/app/chat");
    } else {
      navigate("/login");
    }
  }, []);

  return <h2>Logging you in...</h2>;
}
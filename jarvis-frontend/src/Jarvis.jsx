import Sidebar from "./components/Sidebar";
import { Outlet } from "react-router-dom";
import "./Jarvis.css";

export default function Jarvis() {
  return (
    <div className="jarvis-layout">
      <Sidebar />

      <div className="jarvis-main">
        <div className="jarvis-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

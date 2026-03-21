import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { AnimatePresence, motion } from "framer-motion";
import "./AppLayout.css";

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="app-content">
        <AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    style={{ height: "100%" }}
  >
    <Outlet />
  </motion.div>
</AnimatePresence>

      </main>
    </div>
  );
}

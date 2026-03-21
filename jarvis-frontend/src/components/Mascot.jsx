import { useJarvisMode } from "../context/JarvisModeContext";
import "./Mascot.css";

export default function Mascot({ active = false }) {
  const { config } = useJarvisMode();

  // Safety fallback (never crash)
  const avatar = config?.avatar;

  if (!avatar) return null;

  return (
    <div className={`mascot-wrapper ${active ? "active" : ""}`}>
      <img
        src={avatar}
        alt="Jarvis"
        className="mascot-img"
        draggable={false}
      />
    </div>
  );
}

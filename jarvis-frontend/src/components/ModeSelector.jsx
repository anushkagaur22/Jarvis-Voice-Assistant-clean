import { useJarvisMode } from "./JarvisModeContext";
import modes from "./modes";

export default function ModeSelector() {
  const { mode, setMode } = useJarvisMode();

  return (
    <div className="mode-selector">
      {Object.keys(modes).map((m) => (
        <button
          key={m}
          className={mode === m ? "active" : ""}
          onClick={() => setMode(m)}
        >
          {modes[m].label}
        </button>
      ))}
    </div>
  );
}

import { motion } from "framer-motion";
import "./VoiceWave.css";

export default function VoiceWave({ active, mode }) {
  const bars = Array.from({ length: 5 });

  return (
    <div className={`voice-wave mode-${mode}`}>
      {bars.map((_, i) => (
        <motion.span
          key={i}
          className="wave-bar"
          animate={
            active
              ? { scaleY: [1, 2.4, 1] }
              : { scaleY: 1 }
          }
          transition={{
            duration: 0.6,
            repeat: active ? Infinity : 0,
            delay: i * 0.12,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

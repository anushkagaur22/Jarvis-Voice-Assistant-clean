import friendly from "../assets/avatars/friendly.png";
import creative from "../assets/avatars/creative.png";
import professional from "../assets/avatars/professional.png";
import study from "../assets/avatars/study.png";
import supportive from "../assets/avatars/supportive.png";
import zippy from "../assets/avatars/zippy.png";

export const MODES = {
  friendly: {
    id: "friendly",
    name: "Friendly",
    avatar: friendly,
    bg: "linear-gradient(135deg, #ffe1ef, #fff3f8)",
    animation: {
      page: { y: 12, scale: 0.98 },
      bubble: { y: 10, scale: 0.96 },
      ease: "easeOut",
    },
    voice: { rate: 1, pitch: 1 },
  },

  creative: {
    id: "creative",
    name: "Creative",
    avatar: creative,
    bg: "linear-gradient(135deg, #ede4ff, #f7f3ff)",
    animation: {
      page: { rotate: -1, scale: 0.97 },
      bubble: { scale: 0.92 },
      ease: [0.22, 1, 0.36, 1],
    },
    voice: { rate: 1.05, pitch: 1.2 },
  },

  professional: {
    id: "professional",
    name: "Professional",
    avatar: professional,
    bg: "linear-gradient(135deg, #e6f2ff, #f4f9ff)",
    animation: {
      page: { y: 6 },
      bubble: { y: 6 },
      ease: "linear",
    },
    voice: { rate: 0.95, pitch: 0.9 },
  },

  study: {
    id: "study",
    name: "Study",
    avatar: study,
    bg: "linear-gradient(135deg, #e8fff1, #f3fff8)",
    animation: {
      page: { scale: 0.96 },
      bubble: { scale: 0.95 },
      ease: "easeInOut",
    },
    voice: { rate: 0.9, pitch: 0.85 },
  },

  supportive: {
    id: "supportive",
    name: "Supportive",
    avatar: supportive,
    bg: "linear-gradient(135deg, #fff5d6, #fffbea)",
    animation: {
      page: { y: 8 },
      bubble: { y: 8 },
      ease: "easeOut",
    },
    voice: { rate: 0.95, pitch: 1.05 },
  },

  zippy: {
    id: "zippy",
    name: "Zippy",
    avatar: zippy,
    bg: "linear-gradient(135deg, #ffe0e0, #fff0f0)",
    animation: {
      page: { y: 20, scale: 0.92 },
      bubble: { y: 14 },
      ease: [0.68, -0.55, 0.27, 1.55],
    },
    voice: { rate: 1.15, pitch: 1.25 },
  },
};

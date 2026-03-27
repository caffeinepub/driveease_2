import { useEffect, useState } from "react";

const TAGLINES = [
  "🛡️ Police Verified Drivers",
  "👨‍👩‍👧 Safe for Your Family",
  "📍 GPS Tracked Every Ride",
  "🔐 OTP Secured Trip Start",
  "⭐ Trusted by 1000+ Families",
];

type WelcomePhase = "hello" | "transitioning" | "welcome";

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [taglineFade, setTaglineFade] = useState(true);
  const [welcomePhase, setWelcomePhase] = useState<WelcomePhase>("hello");

  // Progress bar
  useEffect(() => {
    const start = Date.now();
    const duration = 5000;
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(timer);
        setFadeOut(true);
        setTimeout(onDone, 700);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [onDone]);

  // "Hello World" → "Welcome To DriveEase" transition
  useEffect(() => {
    const t1 = setTimeout(() => setWelcomePhase("transitioning"), 1500);
    const t2 = setTimeout(() => setWelcomePhase("welcome"), 1900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Tagline cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineFade(false);
      setTimeout(() => {
        setTaglineIndex((i) => (i + 1) % TAGLINES.length);
        setTaglineFade(true);
      }, 350);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background:
          "linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 50%, #f0fdf4 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.7s ease",
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? "none" : "all",
        overflow: "hidden",
      }}
    >
      {/* Background soft blobs */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)",
          top: "0%",
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)",
          bottom: "8%",
          right: "8%",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)",
          top: "30%",
          left: "6%",
          pointerEvents: "none",
        }}
      />

      {/* Welcome text area */}
      <div
        style={{
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.5rem",
          overflow: "hidden",
        }}
      >
        {welcomePhase === "hello" && (
          <div
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
              fontWeight: 700,
              color: "#15803d",
              animation: "splashSlideUp 0.6s cubic-bezier(0.22,1,0.36,1) both",
              textAlign: "center",
            }}
          >
            Hello World 👋
          </div>
        )}
        {welcomePhase === "transitioning" && (
          <div
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
              fontWeight: 700,
              color: "#15803d",
              animation: "splashFadeOut 0.35s ease forwards",
              textAlign: "center",
            }}
          >
            Hello World 👋
          </div>
        )}
        {welcomePhase === "welcome" && (
          <div
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "clamp(1.4rem, 4.5vw, 2rem)",
              fontWeight: 700,
              color: "#1e293b",
              animation: "splashSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) both",
              textAlign: "center",
            }}
          >
            Welcome To{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, #15803d 0%, #8B0000 60%, #8B0000 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontFamily: "'Orbitron', monospace",
              }}
            >
              DriveEase
            </span>
          </div>
        )}
      </div>

      {/* Logo circle */}
      <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #8B0000, #8B0000)",
            boxShadow:
              "0 8px 32px rgba(22,163,74,0.3), 0 2px 8px rgba(22,163,74,0.15)",
            marginBottom: "1.2rem",
            animation: "pulse-glow-light 2s ease-in-out infinite",
          }}
        >
          <span style={{ fontSize: "2.4rem" }}>🚗</span>
        </div>

        <div
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "clamp(2rem, 6vw, 2.8rem)",
            fontWeight: 800,
            background: "linear-gradient(135deg, #15803d, #8B0000, #8B0000)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "0.05em",
            lineHeight: 1.1,
          }}
        >
          DriveEase
        </div>

        <div
          style={{
            color: "#64748b",
            fontSize: "0.82rem",
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            marginTop: "0.5rem",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 500,
          }}
        >
          Personal Driver Network
        </div>
      </div>

      {/* Animated tagline */}
      <div
        style={{
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            color: taglineFade ? "#15803d" : "transparent",
            fontSize: "clamp(0.9rem, 3vw, 1.05rem)",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            letterSpacing: "0.03em",
            textAlign: "center",
            transition: "color 0.35s ease, transform 0.35s ease",
            transform: taglineFade ? "translateY(0)" : "translateY(8px)",
          }}
        >
          {TAGLINES[taglineIndex]}
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: "min(300px, 75vw)",
          height: 5,
          background: "rgba(22,163,74,0.12)",
          borderRadius: 99,
          overflow: "hidden",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #8B0000, #DC143C, #f87171)",
            borderRadius: 99,
            transition: "width 0.03s linear",
          }}
        />
      </div>

      <div
        style={{
          color: "#94a3b8",
          fontSize: "0.75rem",
          fontFamily: "'Poppins', sans-serif",
          letterSpacing: "0.1em",
        }}
      >
        Loading your experience...
      </div>

      <style>{`
        @keyframes pulse-glow-light {
          0%, 100% {
            box-shadow: 0 8px 32px rgba(22,163,74,0.3), 0 2px 8px rgba(22,163,74,0.15);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 12px 48px rgba(22,163,74,0.45), 0 4px 16px rgba(22,163,74,0.25);
            transform: scale(1.04);
          }
        }
      `}</style>
    </div>
  );
}

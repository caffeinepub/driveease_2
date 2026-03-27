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
        background: "#111111",
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
      {/* Background subtle glow orb */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,98,0,0.06) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
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
              color: "#FF6200",
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
              color: "#FF6200",
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
              color: "#ffffff",
              animation: "splashSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) both",
              textAlign: "center",
            }}
          >
            Welcome To{" "}
            <span
              style={{
                color: "#FF6200",
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
            background: "#FF6200",
            boxShadow:
              "0 8px 40px rgba(255,98,0,0.4), 0 2px 8px rgba(255,98,0,0.2)",
            marginBottom: "1.2rem",
            animation: "pulse-glow-orange 2s ease-in-out infinite",
          }}
        >
          <span style={{ fontSize: "2.4rem" }}>🚗</span>
        </div>

        <div
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "clamp(2rem, 6vw, 2.8rem)",
            fontWeight: 800,
            color: "#FF6200",
            letterSpacing: "0.05em",
            lineHeight: 1.1,
          }}
        >
          DriveEase
        </div>

        <div
          style={{
            color: "#888888",
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
            color: taglineFade ? "#aaaaaa" : "transparent",
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
          height: 4,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 99,
          overflow: "hidden",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "#FF6200",
            borderRadius: 99,
            transition: "width 0.03s linear",
            boxShadow: "0 0 12px rgba(255,98,0,0.6)",
          }}
        />
      </div>

      <div
        style={{
          color: "#555555",
          fontSize: "0.75rem",
          fontFamily: "'Poppins', sans-serif",
          letterSpacing: "0.1em",
        }}
      >
        Loading your experience...
      </div>

      <style>{`
        @keyframes pulse-glow-orange {
          0%, 100% {
            box-shadow: 0 8px 40px rgba(255,98,0,0.4), 0 2px 8px rgba(255,98,0,0.2);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 12px 60px rgba(255,98,0,0.6), 0 4px 16px rgba(255,98,0,0.3);
            transform: scale(1.04);
          }
        }
      `}</style>
    </div>
  );
}

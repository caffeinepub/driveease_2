import { useEffect, useState } from "react";

const TAGLINES = [
  "🛡️ Police Verified Drivers",
  "👨‍👩‍👧 Safe for Your Family",
  "📍 GPS Tracked Every Ride",
  "🔐 OTP Secured Trip Start",
  "⭐ Trusted by 1000+ Families",
];

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [taglineFade, setTaglineFade] = useState(true);

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
        setTimeout(onDone, 600);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [onDone]);

  // Cycle taglines every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineFade(false);
      setTimeout(() => {
        setTaglineIndex((i) => (i + 1) % TAGLINES.length);
        setTaglineFade(true);
      }, 300);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#0a0f0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.6s ease",
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? "none" : "all",
      }}
    >
      {/* Background glow blobs */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)",
          bottom: "15%",
          right: "15%",
          pointerEvents: "none",
        }}
      />

      {/* Logo area */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #16a34a, #059669)",
            boxShadow:
              "0 0 40px rgba(22,163,74,0.5), 0 0 80px rgba(22,163,74,0.2)",
            marginBottom: "1.2rem",
            animation: "pulse-glow 2s ease-in-out infinite",
          }}
        >
          <span style={{ fontSize: "2.2rem" }}>🚗</span>
        </div>

        <div
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "clamp(2rem, 6vw, 3rem)",
            fontWeight: 800,
            background: "linear-gradient(135deg, #4ade80, #22c55e, #16a34a)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "0.04em",
            lineHeight: 1.1,
          }}
        >
          DriveEase
        </div>

        <div
          style={{
            color: "rgba(134,239,172,0.7)",
            fontSize: "0.85rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            marginTop: "0.4rem",
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
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            color: taglineFade ? "rgba(74,222,128,0.95)" : "transparent",
            fontSize: "clamp(0.95rem, 3vw, 1.1rem)",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textAlign: "center",
            transition: "color 0.3s ease, transform 0.3s ease",
            transform: taglineFade ? "translateY(0)" : "translateY(6px)",
            textShadow: "0 0 20px rgba(74,222,128,0.5)",
          }}
        >
          {TAGLINES[taglineIndex]}
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: "min(280px, 70vw)",
          height: 3,
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
            background: "linear-gradient(90deg, #16a34a, #4ade80)",
            borderRadius: 99,
            transition: "width 0.03s linear",
            boxShadow: "0 0 8px rgba(74,222,128,0.6)",
          }}
        />
      </div>

      <div
        style={{
          color: "rgba(255,255,255,0.3)",
          fontSize: "0.72rem",
          fontFamily: "'Poppins', sans-serif",
          letterSpacing: "0.1em",
        }}
      >
        Loading your experience...
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 40px rgba(22,163,74,0.5), 0 0 80px rgba(22,163,74,0.2); }
          50% { box-shadow: 0 0 60px rgba(22,163,74,0.8), 0 0 100px rgba(22,163,74,0.35); }
        }
      `}</style>
    </div>
  );
}

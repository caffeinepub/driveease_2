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
        setTimeout(onDone, 700);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [onDone]);

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
          "linear-gradient(135deg, #060d16 0%, #0a1220 50%, #061008 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.7s ease",
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? "none" : "all",
      }}
    >
      {/* Background glow blobs */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)",
          top: "5%",
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
            "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
          bottom: "10%",
          right: "10%",
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
            "radial-gradient(circle, rgba(0,230,118,0.06) 0%, transparent 70%)",
          top: "30%",
          left: "8%",
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
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #16a34a, #059669)",
            boxShadow:
              "0 0 40px rgba(22,163,74,0.6), 0 0 80px rgba(22,163,74,0.25)",
            marginBottom: "1.4rem",
            animation: "pulse-glow 2s ease-in-out infinite",
          }}
        >
          <span style={{ fontSize: "2.4rem" }}>🚗</span>
        </div>

        <div
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "clamp(2.2rem, 7vw, 3.2rem)",
            fontWeight: 800,
            background: "linear-gradient(135deg, #4ade80, #22c55e, #00e676)",
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
            color: "rgba(134,239,172,0.85)",
            fontSize: "0.85rem",
            letterSpacing: "0.28em",
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
          marginBottom: "2.2rem",
        }}
      >
        <div
          style={{
            color: taglineFade ? "#4ade80" : "transparent",
            fontSize: "clamp(1rem, 3.5vw, 1.15rem)",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            letterSpacing: "0.04em",
            textAlign: "center",
            transition:
              "color 0.35s ease, transform 0.35s ease, text-shadow 0.35s ease",
            transform: taglineFade ? "translateY(0)" : "translateY(8px)",
            textShadow: taglineFade
              ? "0 0 18px rgba(74,222,128,0.7), 0 0 36px rgba(74,222,128,0.3)"
              : "none",
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
          background: "rgba(255,255,255,0.07)",
          borderRadius: 99,
          overflow: "hidden",
          marginBottom: "1.2rem",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #16a34a, #4ade80, #00e676)",
            borderRadius: 99,
            transition: "width 0.03s linear",
            boxShadow: "0 0 10px rgba(74,222,128,0.7)",
          }}
        />
      </div>

      <div
        style={{
          color: "rgba(148,163,184,0.8)",
          fontSize: "0.75rem",
          fontFamily: "'Poppins', sans-serif",
          letterSpacing: "0.12em",
        }}
      >
        Loading your experience...
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 40px rgba(22,163,74,0.6), 0 0 80px rgba(22,163,74,0.25);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 60px rgba(22,163,74,0.9), 0 0 110px rgba(22,163,74,0.4);
            transform: scale(1.04);
          }
        }
      `}</style>
    </div>
  );
}

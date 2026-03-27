import { useEffect, useState } from "react";

const QUOTES = [
  "🚗 DriveEase drivers are police-verified for your safety",
  "📍 GPS tracking on every ride — your family always knows where you are",
  "💡 Tip: Book your driver 1 hour in advance for guaranteed availability",
  "⭐ Rated 4.8/5 by 5000+ satisfied families across India",
  "🛡️ OTP-secured trip start — no ride begins without your approval",
  "🌙 Late night safe rides available 24/7 with verified captains",
  "💰 Transparent pricing — no hidden charges, ever",
  "🏥 Safe for elderly parents — trained, patient, and verified drivers",
  "📱 Track your ride live — share location with family in one tap",
  "🎯 Book by the hour or by the day — flexible plans for every need",
];

export default function RideQuoteTicker() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((prev) => (prev + 1) % QUOTES.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        background: "rgba(255,98,0,0.06)",
        borderLeft: "3px solid #FF6200",
        padding: "0.45rem 1rem",
        margin: "0 0 0.5rem 0",
      }}
    >
      <span
        style={{
          fontSize: "0.82rem",
          color: visible ? "#aaaaaa" : "transparent",
          transition: "opacity 0.4s ease",
          opacity: visible ? 1 : 0,
          flex: 1,
          textAlign: "center",
          fontStyle: "italic",
          letterSpacing: "0.01em",
        }}
      >
        {QUOTES[idx]}
      </span>
    </div>
  );
}

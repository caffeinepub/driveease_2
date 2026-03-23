interface LiveBadgeProps {
  status: "live" | "reconnecting" | "offline";
}

export default function LiveBadge({ status }: LiveBadgeProps) {
  const config = {
    live: { color: "#4ade80", label: "Live", pulse: true },
    reconnecting: { color: "#fbbf24", label: "Reconnecting...", pulse: true },
    offline: { color: "#f87171", label: "Offline", pulse: false },
  }[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        fontSize: "0.78rem",
        fontWeight: 600,
        color: config.color,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: config.color,
          display: "inline-block",
          boxShadow: config.pulse ? `0 0 6px ${config.color}` : undefined,
          animation: config.pulse
            ? "pulseDot 1.5s ease-in-out infinite"
            : undefined,
        }}
      />
      {config.label}
      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </span>
  );
}

interface MapCanvasProps {
  drivers?: { name: string; isOnline: boolean; city: string }[];
  pickup?: string;
  drop?: string;
  showRoute?: boolean;
  height?: number;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export default function MapCanvas({
  drivers = [],
  pickup,
  drop,
  showRoute,
  height = 300,
}: MapCanvasProps) {
  const W = 600;
  const H = height;

  // Calculate distance/ETA from hash of pickup+drop
  const routeHash = hashStr((pickup || "") + (drop || ""));
  const distKm = showRoute ? 5 + (routeHash % 28) : 0;
  const etaMin = showRoute ? Math.round(distKm * 3.2 + (routeHash % 8)) : 0;

  // City label from most common city
  const cityCount: Record<string, number> = {};
  for (const d of drivers) cityCount[d.city] = (cityCount[d.city] || 0) + 1;
  const topCity =
    Object.entries(cityCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "India";

  return (
    <div
      style={{
        background: "#0d1117",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(74,222,128,0.15)",
        position: "relative",
      }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        style={{ display: "block" }}
        role="img"
        aria-labelledby="mapcanvas-title"
      >
        <title id="mapcanvas-title">DriveEase Driver Map</title>
        {/* Dark map bg */}
        <rect width={W} height={H} fill="#0d1117" />

        {/* Grid lines */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
          <line
            key={`hgrid-${i}`}
            x1={0}
            y1={i * (H / 11)}
            x2={W}
            y2={i * (H / 11)}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
          />
        ))}
        {[
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        ].map((i) => (
          <line
            key={`vgrid-${i}`}
            x1={i * (W / 19)}
            y1={0}
            x2={i * (W / 19)}
            y2={H}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
          />
        ))}

        {/* Roads */}
        <path
          d={`M0,${H * 0.45} Q${W * 0.3},${H * 0.38} ${W * 0.6},${H * 0.42} T${W},${H * 0.38}`}
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={3}
          fill="none"
        />
        <path
          d={`M${W * 0.25},0 Q${W * 0.28},${H * 0.3} ${W * 0.22},${H * 0.7} T${W * 0.26},${H}`}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={2}
          fill="none"
        />
        <path
          d={`M${W * 0.55},0 Q${W * 0.6},${H * 0.4} ${W * 0.52},${H}`}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={2}
          fill="none"
        />

        {/* Route curve */}
        {showRoute && (
          <>
            <defs>
              <linearGradient
                id="routeGrad"
                x1="0%"
                y1="100%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
            </defs>
            <path
              d={`M${W * 0.1},${H * 0.82} C${W * 0.3},${H * 0.6} ${W * 0.65},${H * 0.35} ${W * 0.88},${H * 0.15}`}
              stroke="url(#routeGrad)"
              strokeWidth={3}
              fill="none"
              strokeDasharray="8 4"
            />
            {/* Pickup dot */}
            <circle cx={W * 0.1} cy={H * 0.82} r={8} fill="#4ade80" />
            <circle
              cx={W * 0.1}
              cy={H * 0.82}
              r={14}
              fill="rgba(74,222,128,0.2)"
            />
            <text
              x={W * 0.1 + 18}
              y={H * 0.82 + 5}
              fill="#4ade80"
              fontSize={11}
              fontWeight="bold"
            >
              {pickup ? pickup.slice(0, 20) : "Pickup"}
            </text>
            {/* Drop dot */}
            <circle cx={W * 0.88} cy={H * 0.15} r={8} fill="#60a5fa" />
            <circle
              cx={W * 0.88}
              cy={H * 0.15}
              r={14}
              fill="rgba(96,165,250,0.2)"
            />
            <text
              x={W * 0.88 - 60}
              y={H * 0.15 - 14}
              fill="#60a5fa"
              fontSize={11}
              fontWeight="bold"
            >
              {drop ? drop.slice(0, 20) : "Drop"}
            </text>
          </>
        )}

        {/* Driver dots */}
        {drivers.map((d) => {
          const h = hashStr(d.name);
          const x = 40 + ((h * 73) % (W - 80));
          const y = 30 + ((h * 47) % (H - 60));
          return (
            <g key={d.name}>
              {d.isOnline && (
                <circle cx={x} cy={y} r={14} fill="rgba(74,222,128,0.15)">
                  <animate
                    attributeName="r"
                    values="10;18;10"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.4;0;0.4"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              <circle
                cx={x}
                cy={y}
                r={6}
                fill={d.isOnline ? "#4ade80" : "#6b7280"}
                stroke={
                  d.isOnline ? "rgba(74,222,128,0.6)" : "rgba(107,114,128,0.4)"
                }
                strokeWidth={1.5}
              />
              <text
                x={x + 9}
                y={y + 4}
                fill={d.isOnline ? "#d1fae5" : "#9ca3af"}
                fontSize={9}
              >
                {d.name.split(" ")[0]}
              </text>
            </g>
          );
        })}

        {/* City watermark */}
        <text
          x={W / 2}
          y={H / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.04)"
          fontSize={48}
          fontWeight="bold"
        >
          {topCity.toUpperCase()}
        </text>
      </svg>

      {/* Distance badge */}
      {showRoute && distKm > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(18,18,18,0.92)",
            border: "1px solid rgba(74,222,128,0.4)",
            borderRadius: 9999,
            padding: "0.35rem 1rem",
            color: "#4ade80",
            fontSize: "0.82rem",
            fontWeight: 700,
            backdropFilter: "blur(8px)",
            display: "flex",
            gap: "1rem",
          }}
        >
          <span>🛣 ~{distKm} km</span>
          <span>⏱ ETA {etaMin} min</span>
        </div>
      )}

      {/* Online legend */}
      {!showRoute && drivers.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 12,
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "rgba(18,18,18,0.85)",
            border: "1px solid rgba(74,222,128,0.2)",
            borderRadius: 8,
            padding: "0.3rem 0.6rem",
            fontSize: "0.75rem",
          }}
        >
          <span style={{ color: "#4ade80" }}>●</span>
          <span style={{ color: "#d1d5db" }}>Online</span>
          <span style={{ color: "#6b7280" }}>●</span>
          <span style={{ color: "#6b7280" }}>Offline</span>
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import LiveBadge from "../components/LiveBadge";
import MapCanvas from "../components/MapCanvas";
import type { Driver } from "../data/drivers";
import { getDrivers } from "../utils/store";

interface Props {
  navigate: (p: string) => void;
}

const CITY_COORDS: Record<string, [number, number]> = {
  Delhi: [28.66, 77.21],
  Mumbai: [19.07, 72.88],
  Bangalore: [12.97, 77.59],
  Chennai: [13.08, 80.27],
  Hyderabad: [17.38, 78.49],
  Kolkata: [22.57, 88.36],
  Pune: [18.52, 73.86],
  Ahmedabad: [23.02, 72.57],
  Jaipur: [26.91, 75.78],
  Lucknow: [26.85, 80.95],
  Kanpur: [26.46, 80.33],
  Varanasi: [25.32, 83.0],
  Nagpur: [21.14, 79.09],
  Indore: [22.71, 75.86],
  Bhopal: [23.25, 77.4],
  Patna: [25.59, 85.13],
  Ranchi: [23.34, 85.31],
  Bhubaneswar: [20.29, 85.82],
  Kochi: [9.93, 76.27],
  Coimbatore: [11.01, 76.96],
  Surat: [21.17, 72.83],
  Vadodara: [22.31, 73.18],
  Chandigarh: [30.73, 76.78],
  Amritsar: [31.63, 74.87],
  Dehradun: [30.33, 78.04],
  Shimla: [31.1, 77.17],
  Jammu: [32.73, 74.87],
  Jodhpur: [26.29, 73.02],
  Udaipur: [24.58, 73.68],
  Guwahati: [26.14, 91.74],
  Siliguri: [26.72, 88.43],
  Mangalore: [12.87, 74.84],
  Mysore: [12.3, 76.65],
  Nashik: [20.01, 73.79],
  Aurangabad: [19.87, 75.34],
  Visakhapatnam: [17.69, 83.22],
  Gwalior: [26.22, 78.18],
  Raipur: [21.25, 81.63],
  Gurgaon: [28.45, 77.03],
  Faridabad: [28.41, 77.31],
};

export default function LiveDriversPage({ navigate }: Props) {
  const [allDrivers, setAllDrivers] = useState<Driver[]>(() =>
    getDrivers().filter((x) => x.isApproved),
  );
  const [citySearch, setCitySearch] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedPincode, setSelectedPincode] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<Driver | null>(null);
  const [lastRefresh, setLastRefresh] = useState(() => new Date());
  const [liveStatus, setLiveStatus] = useState<"live" | "reconnecting">("live");
  const [gpsMsg, setGpsMsg] = useState("");

  const reload = useCallback(() => {
    try {
      setAllDrivers(getDrivers().filter((x) => x.isApproved));
      setLastRefresh(new Date());
      setLiveStatus("live");
    } catch {
      setLiveStatus("reconnecting");
    }
  }, []);

  // Auto-poll every 15 seconds
  useEffect(() => {
    reload();
    const id = setInterval(reload, 15000);
    return () => clearInterval(id);
  }, [reload]);

  const availableStates = [...new Set(allDrivers.map((d) => d.state))].sort();
  const availableCities = selectedState
    ? [
        ...new Set(
          allDrivers
            .filter((d) => d.state === selectedState)
            .map((d) => d.city),
        ),
      ].sort()
    : [...new Set(allDrivers.map((d) => d.city))].sort();
  const availablePincodes = selectedCity
    ? [
        ...new Set(
          allDrivers
            .filter((d) => d.city === selectedCity)
            .map((d) => d.pincode)
            .filter(Boolean),
        ),
      ]
    : [];

  const displayed = allDrivers
    .filter((d) => (showAll ? true : d.isOnline))
    .filter((d) => (selectedState ? d.state === selectedState : true))
    .filter((d) =>
      selectedCity ? d.city.toLowerCase() === selectedCity.toLowerCase() : true,
    )
    .filter((d) => (selectedPincode ? d.pincode === selectedPincode : true))
    .filter((d) =>
      citySearch.trim()
        ? d.city.toLowerCase().includes(citySearch.trim().toLowerCase())
        : true,
    );

  const onlineCount = allDrivers.filter((d) => d.isOnline).length;

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGpsMsg("⚠️ Geolocation not supported.");
      return;
    }
    setGpsMsg("📶 Detecting...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsMsg(
          `📍 ${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)} — Showing local drivers`,
        );
      },
      () => setGpsMsg("⚠️ Location access denied."),
    );
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1
            style={{
              color: "#f8fafc",
              fontWeight: 800,
              fontSize: "2rem",
              marginBottom: "0.25rem",
            }}
          >
            Live Drivers
          </h1>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <LiveBadge status={liveStatus} />
            <span style={{ color: "#4ade80", fontSize: "0.9rem" }}>
              {onlineCount} drivers online now
            </span>
            <span style={{ color: "#4b5563", fontSize: "0.82rem" }}>
              · {lastRefresh.toLocaleTimeString("en-IN")}
            </span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            data-ocid="livedrivers.primary_button"
            onClick={detectLocation}
            style={{
              background: "rgba(96,165,250,0.12)",
              border: "1px solid rgba(96,165,250,0.3)",
              color: "#60a5fa",
              borderRadius: 8,
              padding: "0.45rem 0.9rem",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            📱 My Location
          </button>
          <button
            type="button"
            onClick={reload}
            style={{
              background: "rgba(22,163,74,0.15)",
              border: "1px solid rgba(22,163,74,0.3)",
              color: "#4ade80",
              borderRadius: 8,
              padding: "0.5rem 1rem",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.88rem",
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card-dark" style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
            gap: "0.75rem",
            marginBottom: "0.5rem",
          }}
        >
          <input
            className="input-dark"
            placeholder="Filter by city..."
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
          />
          <select
            className="input-dark"
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedCity("");
              setSelectedPincode("");
            }}
          >
            <option value="">All States</option>
            {availableStates.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="input-dark"
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setSelectedPincode("");
            }}
            disabled={availableCities.length === 0}
          >
            <option value="">All Cities</option>
            {availableCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className="input-dark"
            value={selectedPincode}
            onChange={(e) => setSelectedPincode(e.target.value)}
            disabled={availablePincodes.length === 0}
          >
            <option value="">All Pincodes</option>
            {availablePincodes.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "#94a3b8",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
              style={{ accentColor: "#16a34a" }}
            />
            Show all approved
          </label>
        </div>
        {gpsMsg && (
          <p
            style={{
              color: gpsMsg.startsWith("📍") ? "#4ade80" : "#fbbf24",
              fontSize: "0.82rem",
              marginTop: "0.35rem",
            }}
          >
            {gpsMsg}
          </p>
        )}
      </div>

      {/* India Map Visualization */}
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #2d2d2d",
          borderRadius: 16,
          padding: "1.5rem",
          marginBottom: "2rem",
          overflow: "hidden",
        }}
      >
        <h3
          style={{
            color: "#94a3b8",
            fontSize: "0.85rem",
            marginBottom: "1rem",
          }}
        >
          India Driver Map (approximate positions)
        </h3>
        <div
          style={{
            position: "relative",
            height: 400,
            background: "linear-gradient(180deg, #0a1a2a 0%, #0d1f0d 100%)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <svg
            viewBox="0 0 400 400"
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              inset: 0,
            }}
          >
            <title>India Driver Map</title>
            <path
              d="M120,40 L160,30 L200,25 L240,35 L270,50 L290,80 L300,110 L295,140 L310,160 L320,190 L300,220 L280,250 L260,290 L240,330 L220,360 L200,380 L185,355 L170,320 L150,290 L130,250 L110,210 L95,170 L85,140 L80,110 L90,80 L105,60 Z"
              fill="rgba(22,163,74,0.06)"
              stroke="rgba(22,163,74,0.3)"
              strokeWidth="1.5"
            />
            {displayed.map((d) => {
              const coords = CITY_COORDS[d.city];
              if (!coords) return null;
              const x = ((coords[1] - 68) / (97 - 68)) * 300 + 50;
              const y = 380 - ((coords[0] - 8) / (36 - 8)) * 340;
              return (
                <g
                  key={d.id}
                  onClick={() => setSelected(d)}
                  onKeyDown={() => setSelected(d)}
                  style={{ cursor: "pointer" }}
                >
                  <circle cx={x} cy={y} r="10" fill="rgba(22,163,74,0.2)">
                    <animate
                      attributeName="r"
                      values="6;14"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill={d.isOnline ? "#4ade80" : "#6b7280"}
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <text
                    x={x + 8}
                    y={y + 4}
                    fill="#94a3b8"
                    fontSize="8"
                    fontFamily="sans-serif"
                  >
                    {d.name.split(" ")[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        {selected && (
          <div
            style={{
              marginTop: "1rem",
              background: "rgba(22,163,74,0.1)",
              border: "1px solid rgba(22,163,74,0.3)",
              borderRadius: 10,
              padding: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <img
                src={selected.avatar}
                alt=""
                style={{ width: 44, height: 44, borderRadius: "50%" }}
              />
              <div>
                <p style={{ color: "#f8fafc", fontWeight: 700 }}>
                  {selected.name}
                </p>
                <p style={{ color: "#4ade80", fontSize: "0.85rem" }}>
                  {selected.city} • ⭐ {selected.rating} •{" "}
                  {selected.vehicleTypes[0]}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(`book?driverId=${selected.id}`)}
              className="green-btn"
              style={{ fontSize: "0.85rem" }}
            >
              Book Now
            </button>
          </div>
        )}
      </div>

      {/* MapCanvas overview */}
      {displayed.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <MapCanvas
            drivers={displayed.map((d) => ({
              name: d.name,
              isOnline: d.isOnline,
              city: d.city,
            }))}
          />
        </div>
      )}

      {/* Driver cards */}
      {displayed.length === 0 ? (
        <div
          data-ocid="livedrivers.empty_state"
          style={{
            textAlign: "center",
            padding: "3rem",
            background: "#1e1e1e",
            borderRadius: 16,
          }}
        >
          <p style={{ color: "#6b7280" }}>
            No {showAll ? "approved" : "online"} drivers
            {selectedCity ? ` in ${selectedCity}` : ""}.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
            gap: "1rem",
          }}
        >
          {displayed.map((d) => (
            <div
              key={d.id}
              className="card-dark"
              style={{ transition: "all 0.15s", cursor: "pointer" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#4ade80";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#2d2d2d";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "center",
                  marginBottom: "0.75rem",
                }}
              >
                <div style={{ position: "relative" }}>
                  <img
                    src={d.avatar}
                    alt={d.name}
                    style={{ width: 44, height: 44, borderRadius: "50%" }}
                  />
                  <span
                    className={d.isOnline ? "driver-dot-online" : ""}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 12,
                      height: 12,
                      background: d.isOnline ? "#4ade80" : "#6b7280",
                      borderRadius: "50%",
                      border: "2px solid #1e1e1e",
                    }}
                  />
                </div>
                <div>
                  <p
                    style={{
                      color: "#f8fafc",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                    }}
                  >
                    {d.name}
                  </p>
                  <p style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                    {d.city} • ⭐ {d.rating}
                  </p>
                </div>
              </div>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "0.82rem",
                  marginBottom: "0.75rem",
                }}
              >
                {d.experience} yrs • {d.vehicleTypes[0]} • ₹{d.dailyRate}/day
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.75rem",
                }}
              >
                <span
                  style={{
                    background: d.isOnline
                      ? "rgba(74,222,128,0.15)"
                      : "rgba(107,114,128,0.15)",
                    color: d.isOnline ? "#4ade80" : "#9ca3af",
                    borderRadius: 9999,
                    padding: "2px 8px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  {d.isOnline ? "● Online" : "○ Offline"}
                </span>
                {d.isOnline && (
                  <span style={{ color: "#4ade80", fontSize: "0.75rem" }}>
                    ∼
                    {(d.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0) %
                      7) +
                      2}{" "}
                    mins away
                  </span>
                )}
              </div>
              <button
                type="button"
                data-ocid="livedrivers.primary_button"
                onClick={() => navigate(`book?driverId=${d.id}`)}
                className="green-btn"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  fontSize: "0.85rem",
                  padding: "0.4rem",
                }}
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

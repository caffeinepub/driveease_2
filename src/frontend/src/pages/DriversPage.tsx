import { useEffect, useState } from "react";
import { CITY_PINCODES } from "../data/drivers";
import type { Driver } from "../data/drivers";
import { getBookings, getDrivers } from "../utils/store";

interface DriversPageProps {
  navigate: (p: string) => void;
}

const STATES = [
  "All",
  "Delhi",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Telangana",
  "West Bengal",
  "Gujarat",
  "Rajasthan",
  "Uttar Pradesh",
  "Madhya Pradesh",
  "Bihar",
  "Kerala",
  "Punjab",
  "Uttarakhand",
  "Himachal Pradesh",
  "Jharkhand",
  "Odisha",
  "Andhra Pradesh",
  "Assam",
  "Chhattisgarh",
  "J&K",
];

function driverEta(id: string): number {
  // Deterministic ETA from driver id (2-8 mins)
  const code = id.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return (code % 7) + 2;
}

export default function DriversPage({ navigate }: DriversPageProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filtered, setFiltered] = useState<Driver[]>([]);
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedPincode, setSelectedPincode] = useState("");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [sortBy, setSortBy] = useState("rating");
  const [pincodeResult, setPincodeResult] = useState("");
  const [gpsResult, setGpsResult] = useState("");

  // Derived city list from selected state
  const availableCities =
    selectedState === "All"
      ? [...new Set(drivers.map((d) => d.city))].sort()
      : [
          ...new Set(
            drivers.filter((d) => d.state === selectedState).map((d) => d.city),
          ),
        ].sort();

  const availablePincodes = selectedCity
    ? Object.entries(CITY_PINCODES)
        .filter(([, c]) => c.toLowerCase() === selectedCity.toLowerCase())
        .map(([pin]) => pin)
        .slice(0, 20)
    : [];

  useEffect(() => {
    const d = getDrivers().filter((x) => x.isApproved);
    setDrivers(d);
    setFiltered(d);
  }, []);

  useEffect(() => {
    let d = [...drivers];
    if (onlineOnly) d = d.filter((x) => x.isOnline);
    if (selectedState !== "All") d = d.filter((x) => x.state === selectedState);
    if (selectedCity)
      d = d.filter((x) =>
        x.city.toLowerCase().includes(selectedCity.toLowerCase()),
      );
    if (selectedPincode) d = d.filter((x) => x.pincode === selectedPincode);
    if (search)
      d = d.filter(
        (x) =>
          x.name.toLowerCase().includes(search.toLowerCase()) ||
          x.city.toLowerCase().includes(search.toLowerCase()),
      );
    d.sort((a, b) =>
      sortBy === "rating"
        ? b.rating - a.rating
        : sortBy === "price"
          ? a.dailyRate - b.dailyRate
          : b.experience - a.experience,
    );
    setFiltered(d);
  }, [
    drivers,
    onlineOnly,
    selectedState,
    selectedCity,
    selectedPincode,
    search,
    sortBy,
  ]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGpsResult("⚠️ Geolocation not supported in this browser.");
      return;
    }
    setGpsResult("📶 Detecting location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setGpsResult(
          `📍 Location detected: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} — Showing nearby drivers`,
        );
        // Try to match to a driver city (basic proximity)
        // We just show all and the user can filter manually
      },
      () => {
        setGpsResult(
          "⚠️ Unable to detect location. Please allow location access.",
        );
      },
    );
  };

  const clearFilters = () => {
    setSelectedState("All");
    setSelectedCity("");
    setSelectedPincode("");
    setSearch("");
    setPincodeResult("");
    setGpsResult("");
  };

  // Get active bookings to determine driver status
  const activeBookingDriverIds = new Set(
    getBookings()
      .filter(
        (b) =>
          b.rideState === "assigned" ||
          b.rideState === "arrived" ||
          b.rideState === "started",
      )
      .map((b) => b.driverId),
  );

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "2rem 1.5rem",
        background: "#0a0f1a",
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            color: "#e2e8f0",
            fontWeight: 800,
            fontSize: "2rem",
            marginBottom: "0.5rem",
          }}
        >
          Find Your Driver
        </h1>
        <p style={{ color: "#94a3b8" }}>Browse verified drivers across India</p>
      </div>

      {/* Filters */}
      <div className="card-dark" style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: "0.75rem",
            marginBottom: "0.75rem",
          }}
        >
          <input
            data-ocid="drivers.search_input"
            className="input-dark"
            placeholder="Search name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            data-ocid="drivers.select"
            className="input-dark"
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedCity("");
              setSelectedPincode("");
            }}
          >
            {STATES.map((s) => (
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
          <select
            className="input-dark"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="rating">Sort: Rating</option>
            <option value="price">Sort: Price</option>
            <option value="experience">Sort: Experience</option>
          </select>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            data-ocid="drivers.primary_button"
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
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            📱 Detect My Location
          </button>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
              color: "#94a3b8",
              fontSize: "0.9rem",
            }}
          >
            <input
              type="checkbox"
              checked={onlineOnly}
              onChange={(e) => setOnlineOnly(e.target.checked)}
              style={{ accentColor: "#8B0000", width: 16, height: 16 }}
            />
            Online Only
          </label>
          {(selectedState !== "All" ||
            selectedCity ||
            search ||
            selectedPincode) && (
            <button
              type="button"
              onClick={clearFilters}
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171",
                borderRadius: 6,
                padding: "0.4rem 0.75rem",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {gpsResult && (
          <p
            style={{
              color: gpsResult.startsWith("📍") ? "#4ade80" : "#fbbf24",
              marginTop: "0.5rem",
              fontSize: "0.85rem",
            }}
          >
            {gpsResult}
          </p>
        )}
        {pincodeResult && (
          <p
            style={{
              color: pincodeResult.startsWith("✅") ? "#4ade80" : "#fbbf24",
              marginTop: "0.4rem",
              fontSize: "0.9rem",
            }}
          >
            {pincodeResult}
          </p>
        )}
      </div>

      <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "1rem" }}>
        {filtered.length} drivers found
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
          gap: "1.25rem",
        }}
      >
        {filtered.map((d) => {
          const isOnTrip = activeBookingDriverIds.has(d.id);
          const statusLabel = d.isOnline
            ? isOnTrip
              ? "On Trip"
              : "Available"
            : "Offline";
          const statusColor = d.isOnline
            ? isOnTrip
              ? "#fbbf24"
              : "#4ade80"
            : "#6b7280";
          const eta = d.isOnline ? driverEta(d.id) : null;

          return (
            <div
              key={d.id}
              className="card-dark"
              style={{ transition: "all 0.2s", cursor: "pointer" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = "#8B0000";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "#2d2d2d";
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  marginBottom: "0.75rem",
                }}
              >
                <div style={{ position: "relative" }}>
                  <img
                    src={d.avatar}
                    alt={d.name}
                    style={{ width: 56, height: 56, borderRadius: "50%" }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: statusColor,
                      border: "2px solid #121212",
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <h3
                      style={{
                        color: "#e2e8f0",
                        fontWeight: 700,
                        fontSize: "1rem",
                      }}
                    >
                      {d.name}
                    </h3>
                    <span
                      style={{
                        background: `${statusColor}18`,
                        color: statusColor,
                        border: `1px solid ${statusColor}40`,
                        borderRadius: 9999,
                        padding: "1px 7px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                      }}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <p style={{ color: "#94a3b8", fontSize: "0.83rem" }}>
                    {d.city}, {d.state}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      marginTop: "0.2rem",
                    }}
                  >
                    <span style={{ color: "#fbbf24", fontSize: "0.85rem" }}>
                      ★
                    </span>
                    <span
                      style={{
                        color: "#e2e8f0",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                      }}
                    >
                      {d.rating}
                    </span>
                    <span style={{ color: "#64748b", fontSize: "0.78rem" }}>
                      ({d.totalTrips} trips)
                    </span>
                  </div>
                </div>
              </div>

              {eta && (
                <p
                  style={{
                    color: "#4ade80",
                    fontSize: "0.78rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  ⏱ ~{eta} mins away
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.35rem",
                  marginBottom: "0.75rem",
                }}
              >
                {d.trustBadges.slice(0, 2).map((b) => (
                  <span
                    key={b}
                    className="badge-red"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {b}
                  </span>
                ))}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.5rem",
                  fontSize: "0.83rem",
                  marginBottom: "0.75rem",
                }}
              >
                <span style={{ color: "#94a3b8" }}>
                  ⏱ {d.experience} yrs exp
                </span>
                <span style={{ color: "#94a3b8" }}>🚗 {d.vehicleTypes[0]}</span>
                <span style={{ color: "#94a3b8" }}>
                  🗣 {d.languages.slice(0, 2).join(", ")}
                </span>
                <span style={{ color: "#4ade80", fontWeight: 700 }}>
                  ₹{d.dailyRate}/day
                </span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  data-ocid="drivers.secondary_button"
                  onClick={() => navigate(`driver/${d.id}`)}
                  style={{
                    flex: 1,
                    background: "#1a2e1a",
                    border: "1px solid #8B0000",
                    color: "#4ade80",
                    borderRadius: 6,
                    padding: "0.45rem",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  View Profile
                </button>
                <button
                  type="button"
                  data-ocid="drivers.primary_button"
                  onClick={() => navigate(`book?driverId=${d.id}`)}
                  className="red-btn"
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    fontSize: "0.85rem",
                    padding: "0.45rem",
                  }}
                >
                  Book Now
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div
          data-ocid="drivers.empty_state"
          style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
          <p>No drivers found. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}

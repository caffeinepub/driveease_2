import { useEffect, useState } from "react";
import type { Driver } from "../data/drivers";
import { getDrivers } from "../utils/store";

interface Props {
  navigate: (p: string) => void;
  driverId: string;
}

export default function DriverProfilePage({ navigate, driverId }: Props) {
  const [driver, setDriver] = useState<Driver | null>(null);

  useEffect(() => {
    const d = getDrivers().find((x) => x.id === driverId);
    setDriver(d || null);
  }, [driverId]);

  if (!driver)
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        <p style={{ color: "#6b7280" }}>Driver not found.</p>
        <button
          type="button"
          onClick={() => navigate("drivers")}
          className="green-btn"
          style={{ marginTop: "1rem" }}
        >
          Back to Drivers
        </button>
      </div>
    );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <button
        type="button"
        onClick={() => navigate("drivers")}
        style={{
          color: "#94a3b8",
          background: "none",
          border: "none",
          cursor: "pointer",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          fontSize: "0.9rem",
        }}
      >
        ← Back to Drivers
      </button>

      <div className="card-dark" style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <img
            src={driver.avatar}
            alt={driver.name}
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              border: "3px solid #16a34a",
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <div>
                <h1
                  style={{
                    color: "#f8fafc",
                    fontWeight: 800,
                    fontSize: "1.5rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  {driver.name}
                </h1>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                  {driver.city}, {driver.state} • {driver.experience} years
                  experience
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "0.25rem",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: driver.isOnline ? "#4ade80" : "#6b7280",
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      color: driver.isOnline ? "#4ade80" : "#6b7280",
                      fontWeight: 600,
                    }}
                  >
                    {driver.isOnline ? "Online Now" : "Currently Offline"}
                  </span>
                </div>
                <span
                  style={{
                    color: "#4ade80",
                    fontWeight: 800,
                    fontSize: "1.2rem",
                  }}
                >
                  ₹{driver.dailyRate}/day
                </span>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginTop: "0.75rem",
              }}
            >
              <span style={{ color: "#fbbf24", fontSize: "1.1rem" }}>★</span>
              <span
                style={{
                  color: "#f8fafc",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                }}
              >
                {driver.rating}
              </span>
              <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                ({driver.totalTrips} completed trips)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {[
          {
            icon: "✅",
            label: "Police Verification",
            value: "Verified",
            color: "#4ade80",
          },
          {
            icon: "🔍",
            label: "Background Check",
            value: "Complete",
            color: "#4ade80",
          },
          {
            icon: "🎓",
            label: "Etiquette Training",
            value: "Certified",
            color: "#4ade80",
          },
          {
            icon: "🏥",
            label: "Medical Fitness",
            value: "Fit",
            color: "#4ade80",
          },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className="card-dark">
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
              {icon}
            </div>
            <p
              style={{
                color: "#94a3b8",
                fontSize: "0.82rem",
                marginBottom: "0.25rem",
              }}
            >
              {label}
            </p>
            <p style={{ color: color, fontWeight: 700, fontSize: "0.95rem" }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div className="card-dark">
          <h4
            style={{
              color: "#f8fafc",
              fontWeight: 600,
              marginBottom: "0.75rem",
            }}
          >
            Trust Badges
          </h4>
          {driver.trustBadges.map((b) => (
            <div
              key={b}
              className="badge-green"
              style={{ display: "inline-block", margin: "0.2rem" }}
            >
              {b}
            </div>
          ))}
        </div>
        <div className="card-dark">
          <h4
            style={{
              color: "#f8fafc",
              fontWeight: 600,
              marginBottom: "0.75rem",
            }}
          >
            Languages
          </h4>
          {driver.languages.map((l) => (
            <span
              key={l}
              style={{
                display: "inline-block",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid #3a3a3a",
                borderRadius: 6,
                padding: "0.2rem 0.6rem",
                color: "#d1d5db",
                fontSize: "0.85rem",
                margin: "0.2rem",
              }}
            >
              {l}
            </span>
          ))}
        </div>
        <div className="card-dark">
          <h4
            style={{
              color: "#f8fafc",
              fontWeight: 600,
              marginBottom: "0.75rem",
            }}
          >
            Vehicle Types
          </h4>
          {driver.vehicleTypes.map((v) => (
            <span
              key={v}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                background: "rgba(22,163,74,0.1)",
                border: "1px solid rgba(22,163,74,0.2)",
                borderRadius: 6,
                padding: "0.2rem 0.6rem",
                color: "#4ade80",
                fontSize: "0.85rem",
                margin: "0.2rem",
              }}
            >
              🚗 {v}
            </span>
          ))}
        </div>
        <div className="card-dark">
          <h4
            style={{
              color: "#f8fafc",
              fontWeight: 600,
              marginBottom: "0.75rem",
            }}
          >
            Stats
          </h4>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "0.88rem",
              marginBottom: "0.35rem",
            }}
          >
            Total Trips:{" "}
            <span style={{ color: "#f8fafc", fontWeight: 700 }}>
              {driver.totalTrips}
            </span>
          </p>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "0.88rem",
              marginBottom: "0.35rem",
            }}
          >
            Total Earnings:{" "}
            <span style={{ color: "#4ade80", fontWeight: 700 }}>
              ₹{driver.totalEarnings.toLocaleString("en-IN")}
            </span>
          </p>
          <p style={{ color: "#94a3b8", fontSize: "0.88rem" }}>
            Pincode:{" "}
            <span style={{ color: "#f8fafc", fontWeight: 700 }}>
              {driver.pincode}
            </span>
          </p>
        </div>
      </div>

      <div
        className="card-dark"
        style={{
          background: "rgba(22,163,74,0.05)",
          borderColor: "rgba(22,163,74,0.2)",
        }}
      >
        <p
          style={{
            color: "#d1d5db",
            fontStyle: "italic",
            marginBottom: "1rem",
          }}
        >
          "I trust DriveEase families with the same care I'd take for my own." —{" "}
          {driver.name.split(" ")[0]}
        </p>
        <button
          type="button"
          onClick={() => navigate(`book?driverId=${driver.id}`)}
          className="green-btn"
          style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}
        >
          Book {driver.name.split(" ")[0]} Now →
        </button>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { getDrivers } from "../utils/store";

interface HomePageProps {
  navigate: (p: string) => void;
}

function SparkSet() {
  return (
    <>
      <span className="spark">✦</span>
      <span className="spark">✧</span>
      <span className="spark">✦</span>
    </>
  );
}

/** Animated road strip with cars driving across */
function RoadStrip() {
  return (
    <div
      style={{
        position: "relative",
        height: 64,
        background: "linear-gradient(to right, #e2e8f0, #cbd5e1, #e2e8f0)",
        borderRadius: 16,
        overflow: "hidden",
        margin: "1.5rem 0",
        border: "1px solid #e2e8f0",
      }}
    >
      {/* Road surface */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#94a3b8",
          top: "35%",
          bottom: "35%",
        }}
      />
      {/* Centre dashes */}
      <div
        style={{
          position: "absolute",
          top: "48%",
          left: 0,
          right: 0,
          height: 3,
          overflow: "hidden",
        }}
      >
        <div
          className="road-dash"
          style={{ display: "flex", gap: 20, width: "200%" }}
        >
          {[
            "d1",
            "d2",
            "d3",
            "d4",
            "d5",
            "d6",
            "d7",
            "d8",
            "d9",
            "d10",
            "d11",
            "d12",
            "d13",
            "d14",
            "d15",
            "d16",
            "d17",
            "d18",
            "d19",
            "d20",
            "d21",
            "d22",
            "d23",
            "d24",
            "d25",
            "d26",
            "d27",
            "d28",
            "d29",
            "d30",
          ].map((id) => (
            <div
              key={id}
              style={{
                width: 32,
                height: 3,
                background: "#ffffff",
                borderRadius: 2,
                flexShrink: 0,
                opacity: 0.7,
              }}
            />
          ))}
        </div>
      </div>
      {/* Car 1 */}
      <div
        className="car-drive"
        style={{
          position: "absolute",
          top: 10,
          fontSize: "2rem",
          lineHeight: 1,
        }}
      >
        🚗
      </div>
      {/* Car 2 */}
      <div
        className="car-drive-slow"
        style={{
          position: "absolute",
          top: 26,
          fontSize: "1.5rem",
          lineHeight: 1,
          opacity: 0.7,
        }}
      >
        🚙
      </div>
      {/* Car 3 */}
      <div
        className="car-drive-med"
        style={{
          position: "absolute",
          top: 12,
          fontSize: "1.75rem",
          lineHeight: 1,
          opacity: 0.85,
        }}
      >
        🚕
      </div>
    </div>
  );
}

export default function HomePage({ navigate }: HomePageProps) {
  const [stats, setStats] = useState({ drivers: 0, online: 0 });
  const [onlineDrivers, setOnlineDrivers] = useState<
    {
      name: string;
      city: string;
      vehicleType: string;
      rating: number;
      isOnline: boolean;
    }[]
  >([]);

  useEffect(() => {
    const d = getDrivers();
    const online = d.filter((x) => x.isOnline && x.isApproved);
    setStats({ drivers: d.length, online: online.length });
    setOnlineDrivers(
      online.slice(0, 6).map((x) => ({
        name: x.name,
        city: x.city,
        vehicleType: x.vehicleTypes?.[0] || "Sedan",
        rating: x.rating || 4.8,
        isOnline: x.isOnline,
      })),
    );
  }, []);

  function hashStr(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }

  const getEta = (name: string) => 2 + (hashStr(name) % 8);
  const getFirstName = (name: string) => {
    const parts = name.trim().split(" ");
    return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
  };

  return (
    <div style={{ background: "#f8fff8" }}>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        style={{
          background:
            "linear-gradient(160deg, #ffffff 0%, #f0fdf4 50%, #dcfce7 100%)",
          minHeight: "82vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Soft green orbs */}
        <div
          className="orb-animate"
          style={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: 600,
            height: 600,
            background:
              "radial-gradient(circle, rgba(134,239,172,0.25) 0%, transparent 65%)",
            pointerEvents: "none",
            borderRadius: "50%",
          }}
        />
        <div
          className="orb-animate-slow"
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "-5%",
            width: 450,
            height: 450,
            background:
              "radial-gradient(circle, rgba(187,247,208,0.3) 0%, transparent 65%)",
            pointerEvents: "none",
            borderRadius: "50%",
          }}
        />

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "3rem 1.5rem",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3rem",
            alignItems: "center",
            width: "100%",
          }}
          className="hero-grid"
        >
          <div className="fade-in">
            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "#dcfce7",
                border: "1px solid #86efac",
                borderRadius: 9999,
                padding: "0.3rem 0.85rem",
                marginBottom: "1.5rem",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#16a34a",
                  display: "inline-block",
                }}
                className="driver-dot-online"
              />
              <span
                style={{
                  color: "#15803d",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                }}
              >
                India's First Personal Driver Network
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(1.6rem, 4vw, 2.8rem)",
                fontWeight: 800,
                lineHeight: 1.2,
                marginBottom: "1rem",
                color: "#14532d",
              }}
            >
              Your Trusted Personal Driver
              <span
                style={{
                  display: "block",
                  background: "linear-gradient(135deg,#16a34a,#22c55e)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontWeight: 900,
                }}
              >
                For Your Family
              </span>
            </h1>

            <p
              style={{
                color: "#4b7e4b",
                fontSize: "1rem",
                lineHeight: 1.7,
                marginBottom: "1.5rem",
                maxWidth: 460,
              }}
            >
              Verified, trained drivers for your family. Hourly, daily, or
              monthly. Safe rides for elders, kids and professionals.
            </p>

            {/* Animated road strip */}
            <RoadStrip />

            {/* CTA Buttons */}
            <div
              style={{
                display: "flex",
                gap: "0.85rem",
                flexWrap: "wrap",
                marginBottom: "2rem",
              }}
            >
              <button
                type="button"
                onClick={() => navigate("book")}
                data-ocid="hero.book_driver_button"
                className="sparkle-btn sparkle-btn-green btn-float"
              >
                <SparkSet />🚗 Book a Driver
              </button>

              <button
                type="button"
                onClick={() => navigate("driver-login")}
                data-ocid="hero.driver_login_button"
                className="sparkle-btn sparkle-btn-indigo"
              >
                <SparkSet />
                🧑‍🚗 Driver Login
              </button>
            </div>

            {/* Stats pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem" }}>
              {[
                ["5000+", "Trips"],
                [`${Math.max(stats.drivers, 500)}+`, "Drivers"],
                ["50+", "Cities"],
                ["4.9★", "Rating"],
              ].map(([v, l]) => (
                <div
                  key={l}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #bbf7d0",
                    borderRadius: 9999,
                    padding: "0.35rem 0.9rem",
                    display: "flex",
                    gap: "0.3rem",
                    alignItems: "baseline",
                    boxShadow: "0 2px 6px rgba(22,163,74,0.08)",
                  }}
                >
                  <span
                    style={{
                      color: "#16a34a",
                      fontWeight: 800,
                      fontSize: "0.82rem",
                    }}
                  >
                    {v}
                  </span>
                  <span style={{ color: "#6b7280", fontSize: "0.72rem" }}>
                    {l}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right card */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #bbf7d0",
                borderRadius: 20,
                padding: "2rem 1.75rem",
                maxWidth: 320,
                width: "100%",
                boxShadow:
                  "0 20px 60px rgba(22,163,74,0.12), 0 4px 16px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#dcfce7,#bbf7d0)",
                    border: "3px solid #86efac",
                    margin: "0 auto 1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                  }}
                >
                  🧑‍🚗
                </div>
                <h3
                  style={{
                    color: "#14532d",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  Ravi Kumar
                </h3>
                <p style={{ color: "#4b7e4b", fontSize: "0.82rem" }}>
                  Verified Personal Driver • Delhi
                </p>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    background: "#dcfce7",
                    border: "1px solid #86efac",
                    borderRadius: 9999,
                    padding: "0.2rem 0.65rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#16a34a",
                      display: "inline-block",
                    }}
                    className="driver-dot-online"
                  />
                  <span
                    style={{
                      color: "#15803d",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                    }}
                  >
                    Available Now
                  </span>
                </div>
              </div>

              {[
                { icon: "⭐", label: "Rating", value: "4.9 / 5.0" },
                { icon: "🗺️", label: "Experience", value: "6 Years" },
                { icon: "✅", label: "Verified", value: "Police + Aadhaar" },
              ].map(({ icon, label, value }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.55rem 0",
                    borderBottom: "1px solid #f0fdf4",
                  }}
                >
                  <span style={{ color: "#4b7e4b", fontSize: "0.85rem" }}>
                    {icon} {label}
                  </span>
                  <span
                    style={{
                      color: "#14532d",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}

              <button
                type="button"
                onClick={() => navigate("drivers")}
                data-ocid="hero.browse_drivers_button"
                style={{
                  width: "100%",
                  marginTop: "1.25rem",
                  background: "linear-gradient(135deg,#16a34a,#22c55e)",
                  color: "white",
                  border: "none",
                  borderRadius: 9999,
                  padding: "0.7rem",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(22,163,74,0.35)",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Browse All Drivers
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section
        style={{
          background: "#ffffff",
          borderTop: "1px solid #dcfce7",
          borderBottom: "1px solid #dcfce7",
          padding: "1rem 1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "2.5rem",
          }}
        >
          {[
            { v: `${stats.drivers}+`, l: "Verified Drivers" },
            { v: `${stats.online}`, l: "Online Now" },
            { v: "₹800", l: "Starting Rate/Day" },
            { v: "50+", l: "Cities Covered" },
          ].map(({ v, l }) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div
                style={{
                  color: "#16a34a",
                  fontSize: "1.5rem",
                  fontWeight: 800,
                }}
              >
                {v}
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.78rem" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Public Driver Wall */}
      {onlineDrivers.length > 0 && (
        <section style={{ padding: "3.5rem 1.5rem", background: "#f0fdf4" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <h2 className="section-heading">Available Drivers Near You</h2>
            <p className="section-sub">Verified, online, and ready to serve</p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))",
                gap: "1rem",
              }}
            >
              {onlineDrivers.map((d, idx) => (
                <div
                  key={d.name}
                  data-ocid={`drivers.item.${idx + 1}`}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #bbf7d0",
                    borderRadius: 14,
                    padding: "1.2rem 0.9rem",
                    textAlign: "center",
                    borderLeft: "4px solid #16a34a",
                    boxShadow: "0 2px 10px rgba(22,163,74,0.08)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 24px rgba(22,163,74,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 10px rgba(22,163,74,0.08)";
                  }}
                >
                  {/* Online dot */}
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      background: "#16a34a",
                    }}
                    className="driver-dot-online"
                  />
                  {/* Car bob animation */}
                  <div
                    className="car-bob"
                    style={{
                      fontSize: "1.1rem",
                      marginBottom: "0.4rem",
                      color: "#16a34a",
                    }}
                  >
                    🚗
                  </div>
                  {/* Avatar */}
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#dcfce7,#bbf7d0)",
                      border: "2px solid #86efac",
                      margin: "0 auto 0.65rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.4rem",
                    }}
                  >
                    🧑‍🚗
                  </div>
                  <p
                    style={{
                      color: "#14532d",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      marginBottom: "0.2rem",
                    }}
                  >
                    {getFirstName(d.name)}
                  </p>
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "0.72rem",
                      marginBottom: "0.3rem",
                    }}
                  >
                    {d.vehicleType}
                  </p>
                  <p
                    style={{
                      color: "#f59e0b",
                      fontSize: "0.72rem",
                      marginBottom: "0.45rem",
                    }}
                  >
                    ⭐ {d.rating.toFixed(1)}
                  </p>
                  <div
                    style={{
                      background: "#dcfce7",
                      border: "1px solid #86efac",
                      borderRadius: 9999,
                      padding: "0.18rem 0.5rem",
                      fontSize: "0.68rem",
                      color: "#15803d",
                      fontWeight: 600,
                      marginBottom: "0.65rem",
                      display: "inline-block",
                    }}
                  >
                    ~{getEta(d.name)} min away
                  </div>
                  <br />
                  <button
                    type="button"
                    onClick={() => navigate("book")}
                    data-ocid={`drivers.book_button.${idx + 1}`}
                    style={{
                      background: "linear-gradient(135deg,#16a34a,#22c55e)",
                      color: "white",
                      border: "none",
                      borderRadius: 9999,
                      padding: "0.35rem 0.9rem",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      boxShadow: "0 2px 8px rgba(22,163,74,0.25)",
                    }}
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section style={{ padding: "3.5rem 1.5rem", background: "#ffffff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 className="section-heading">How It Works</h2>
          <p className="section-sub">Simple steps, trusted results</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
              gap: "1.75rem",
            }}
          >
            {[
              {
                n: "1",
                emoji: "📋",
                title: "Choose a Plan",
                desc: "Select subscription or one-time driver booking based on your needs.",
              },
              {
                n: "2",
                emoji: "🚗",
                title: "Get Your Driver",
                desc: "Receive your assigned, trained, verified personal driver within hours.",
                animate: true,
              },
              {
                n: "3",
                emoji: "🤝",
                title: "Build Trust",
                desc: "Build a long-term relationship with a driver your family can rely on.",
              },
            ].map(({ n, emoji, title, desc, animate }) => (
              <div
                key={n}
                style={{
                  textAlign: "center",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 16,
                  padding: "1.5rem 1rem",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#dcfce7,#bbf7d0)",
                    border: "2px solid #86efac",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                    fontSize: "1.6rem",
                  }}
                >
                  {animate ? (
                    <span className="steer-spin">{emoji}</span>
                  ) : (
                    emoji
                  )}
                </div>
                <div
                  style={{
                    display: "inline-block",
                    background: "#16a34a",
                    color: "white",
                    borderRadius: 9999,
                    width: 24,
                    height: 24,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    lineHeight: "24px",
                    marginBottom: "0.6rem",
                  }}
                >
                  {n}
                </div>
                <h3
                  style={{
                    color: "#14532d",
                    fontWeight: 700,
                    marginBottom: "0.4rem",
                    fontSize: "0.95rem",
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    color: "#4b7e4b",
                    fontSize: "0.84rem",
                    lineHeight: 1.6,
                  }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DriveEase Difference */}
      <section style={{ padding: "3.5rem 1.5rem", background: "#f0fdf4" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 className="section-heading">The DriveEase Difference</h2>
          <p className="section-sub">
            We're not a ride-hailing app. We build long-term trust with your
            family.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: "1.25rem",
            }}
          >
            {[
              {
                icon: "👨‍👩‍👧",
                title: "Assigned Driver",
                desc: "Same trusted driver for office, parents, kids school, and medical visits. Consistency builds trust.",
              },
              {
                icon: "👨‍👩‍👧‍👦",
                title: "Family Account",
                desc: "One account for the whole family. SOS alerts go to family, not customer support.",
              },
              {
                icon: "📅",
                title: "Subscription Plans",
                desc: "Monthly, weekly and daily plans with transparent, predictable pricing. No surprise charges.",
              },
              {
                icon: "🛡️",
                title: "Trust Transparency",
                desc: "See police verification, training badges, medical fitness, languages and experience upfront.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                style={{
                  background: "#ffffff",
                  border: "1px solid #bbf7d0",
                  borderRadius: 14,
                  padding: "1.5rem",
                  boxShadow: "0 2px 8px rgba(22,163,74,0.06)",
                  transition: "transform 0.2s,box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(22,163,74,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(22,163,74,0.06)";
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
                  {icon}
                </div>
                <h3
                  style={{
                    color: "#14532d",
                    fontWeight: 700,
                    marginBottom: "0.4rem",
                    fontSize: "0.95rem",
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    color: "#4b7e4b",
                    fontSize: "0.84rem",
                    lineHeight: 1.6,
                  }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section
        style={{
          padding: "3rem 1.5rem",
          background: "linear-gradient(135deg,#dcfce7,#f0fdf4)",
          borderTop: "1px solid #bbf7d0",
          borderBottom: "1px solid #bbf7d0",
        }}
      >
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              fontSize: "2.5rem",
              color: "#16a34a",
              marginBottom: "0.5rem",
            }}
          >
            "
          </div>
          <p
            style={{
              color: "#166534",
              fontSize: "1rem",
              fontStyle: "italic",
              lineHeight: 1.7,
              marginBottom: "1.25rem",
            }}
          >
            My parents feel safer now. The same driver comes every day.
            DriveEase gave us peace of mind we never had before.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.65rem",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#16a34a,#22c55e)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              R
            </div>
            <div style={{ textAlign: "left" }}>
              <p
                style={{
                  color: "#14532d",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                }}
              >
                Rohit Sharma
              </p>
              <p style={{ color: "#6b7280", fontSize: "0.76rem" }}>
                Verified Family User • Delhi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Ambassador */}
      <section style={{ padding: "3.5rem 1.5rem", background: "#ffffff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h2 className="section-heading">Brand Ambassador</h2>
          <div
            style={{
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.85rem",
              background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
              border: "1px solid #86efac",
              borderRadius: 16,
              padding: "2rem 3rem",
              marginTop: "1rem",
              boxShadow: "0 4px 20px rgba(22,163,74,0.1)",
            }}
          >
            <div style={{ fontSize: "2.5rem" }}>
              <span className="wave-hand">👋</span> <span>👤</span>
            </div>
            <div>
              <h3
                style={{
                  color: "#14532d",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                }}
              >
                Himanshu Thakur
              </h3>
              <p style={{ color: "#16a34a", fontSize: "0.85rem" }}>
                Brand Ambassador — DriveEase India
              </p>
              <p
                style={{
                  color: "#4b7e4b",
                  fontSize: "0.78rem",
                  marginTop: "0.35rem",
                }}
              >
                Promoting safe, trusted personal driver services across India
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Payment info */}
      <section style={{ padding: "3.5rem 1.5rem", background: "#f0fdf4" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 className="section-heading">Payment Details</h2>
          <p className="section-sub">
            Secure bank transfer and UPI payment accepted
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
              gap: "1.25rem",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #bbf7d0",
                borderRadius: 14,
                padding: "1.5rem",
                boxShadow: "0 2px 8px rgba(22,163,74,0.07)",
              }}
            >
              <h4
                style={{
                  color: "#16a34a",
                  fontWeight: 700,
                  marginBottom: "0.85rem",
                  fontSize: "0.95rem",
                }}
              >
                🏦 Bank Transfer
              </h4>
              {[
                ["Bank", "Axis Bank"],
                ["Account No.", "922010062230782"],
                ["IFSC", "UTIB0004620"],
                ["Name", "KRISHNA KANT PANDEY"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.5rem 0",
                    borderBottom: "1px solid #f0fdf4",
                    fontSize: "0.88rem",
                  }}
                >
                  <span style={{ color: "#6b7280" }}>{k}</span>
                  <span style={{ color: "#14532d", fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #bbf7d0",
                borderRadius: 14,
                padding: "1.5rem",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(22,163,74,0.07)",
              }}
            >
              <h4
                style={{
                  color: "#16a34a",
                  fontWeight: 700,
                  marginBottom: "0.85rem",
                  fontSize: "0.95rem",
                }}
              >
                📱 UPI / PhonePe
              </h4>
              <div
                style={{
                  fontSize: "3rem",
                  margin: "0.5rem auto",
                  background: "#f0fdf4",
                  borderRadius: 12,
                  padding: "1.5rem",
                  border: "1px solid #bbf7d0",
                  display: "inline-block",
                }}
              >
                📲
              </div>
              <p
                style={{
                  color: "#4b7e4b",
                  fontSize: "0.88rem",
                  marginTop: "0.75rem",
                }}
              >
                Scan QR or pay via UPI to
              </p>
              <p
                style={{
                  color: "#14532d",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                7836887228@ybl
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        style={{
          padding: "3rem 1.5rem",
          background: "linear-gradient(135deg,#16a34a,#22c55e)",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            color: "white",
            fontWeight: 800,
            fontSize: "clamp(1.4rem,3vw,2rem)",
            marginBottom: "0.75rem",
          }}
        >
          Ready for a Trusted Driver?
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.85)",
            marginBottom: "1.75rem",
            fontSize: "0.95rem",
          }}
        >
          Join 5000+ families who trust DriveEase across India
        </p>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => navigate("book")}
            data-ocid="cta.book_driver_button"
            style={{
              background: "white",
              color: "#16a34a",
              border: "none",
              borderRadius: 9999,
              padding: "0.8rem 2rem",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            🚗 Book a Driver
          </button>
          <button
            type="button"
            onClick={() => navigate("plans")}
            data-ocid="cta.view_plans_button"
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "white",
              border: "2px solid rgba(255,255,255,0.5)",
              borderRadius: 9999,
              padding: "0.8rem 2rem",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            }}
          >
            View Plans
          </button>
        </div>
      </section>
    </div>
  );
}

import { useEffect, useState } from "react";
import { getDrivers } from "../utils/store";

interface HomePageProps {
  navigate: (p: string) => void;
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
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        style={{
          background: "#0a0a0a",
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated gradient orbs */}
        <div
          className="orb-animate"
          style={{
            position: "absolute",
            top: "-15%",
            right: "-5%",
            width: 700,
            height: 700,
            background:
              "radial-gradient(circle, rgba(74,222,128,0.09) 0%, transparent 65%)",
            pointerEvents: "none",
            borderRadius: "50%",
          }}
        />
        <div
          className="orb-animate-slow"
          style={{
            position: "absolute",
            bottom: "-15%",
            left: "-8%",
            width: 500,
            height: 500,
            background:
              "radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 65%)",
            pointerEvents: "none",
            borderRadius: "50%",
          }}
        />
        <div
          className="orb-animate"
          style={{
            position: "absolute",
            top: "40%",
            left: "45%",
            width: 350,
            height: 350,
            background:
              "radial-gradient(circle, rgba(129,140,248,0.05) 0%, transparent 65%)",
            pointerEvents: "none",
            borderRadius: "50%",
            animationDelay: "-5s",
          }}
        />

        {/* Grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(74,222,128,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.035) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "4rem 1.5rem",
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
                gap: "0.5rem",
                background: "rgba(74,222,128,0.08)",
                border: "1px solid rgba(74,222,128,0.25)",
                borderRadius: 9999,
                padding: "0.35rem 0.9rem",
                marginBottom: "1.5rem",
              }}
            >
              <span className="live-dot" />
              <span
                style={{
                  color: "#4ade80",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                India's First Personal Driver Network
              </span>
            </div>

            {/* Orbitron headline */}
            <h1
              style={{
                fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
                lineHeight: 1.15,
                marginBottom: "1.25rem",
                letterSpacing: "0.02em",
              }}
            >
              <span
                className="orbitron-gradient"
                style={{
                  display: "block",
                  fontSize: "clamp(1.6rem,4.5vw,3rem)",
                }}
              >
                DriveEase
              </span>
              <span
                style={{
                  color: "#f8fafc",
                  display: "block",
                  fontWeight: 800,
                  fontSize: "clamp(1.3rem,3.5vw,2.2rem)",
                  letterSpacing: "-0.01em",
                  marginTop: "0.3rem",
                }}
              >
                India's Most Trusted
              </span>
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #4ade80 0%, #16a34a 60%, #f8fafc 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  display: "block",
                  fontWeight: 900,
                  fontSize: "clamp(1.3rem,3.5vw,2.2rem)",
                }}
              >
                Personal Driver Network
              </span>
            </h1>

            <p
              style={{
                color: "#94a3b8",
                fontSize: "1.1rem",
                lineHeight: 1.7,
                marginBottom: "2.5rem",
                maxWidth: 480,
              }}
            >
              Verified drivers for your family. Hourly, daily, or monthly.
            </p>

            {/* 3D CTA Buttons */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                marginBottom: "2.5rem",
              }}
            >
              <button
                type="button"
                onClick={() => navigate("book")}
                data-ocid="hero.book_driver_button"
                style={{
                  background: "linear-gradient(135deg, #16a34a, #15803d)",
                  color: "white",
                  border: "none",
                  borderRadius: 14,
                  padding: "1rem 2rem",
                  cursor: "pointer",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  fontFamily: "'Orbitron', monospace",
                  boxShadow:
                    "0 8px 32px rgba(22,163,74,0.4), inset 0 1px 0 rgba(255,255,255,0.15), 0 6px 0 #0d5c28",
                  transform: "perspective(300px) rotateX(3deg)",
                  transition: "transform 0.15s, box-shadow 0.15s",
                  letterSpacing: "0.03em",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "perspective(300px) rotateX(0deg) translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 48px rgba(22,163,74,0.55), inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 0 #0d5c28";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform =
                    "perspective(300px) rotateX(3deg)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(22,163,74,0.4), inset 0 1px 0 rgba(255,255,255,0.15), 0 6px 0 #0d5c28";
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform =
                    "perspective(300px) rotateX(6deg) translateY(3px)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(22,163,74,0.3), 0 2px 0 #0d5c28";
                }}
              >
                🚗 Book a Driver
              </button>

              <button
                type="button"
                onClick={() => navigate("driver-login")}
                data-ocid="hero.driver_login_button"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(34,211,238,0.1))",
                  color: "#a5b4fc",
                  border: "2px solid rgba(129,140,248,0.4)",
                  borderRadius: 14,
                  padding: "1rem 2rem",
                  cursor: "pointer",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  fontFamily: "'Orbitron', monospace",
                  boxShadow:
                    "0 8px 32px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.08), 0 6px 0 rgba(67,56,202,0.5)",
                  transform: "perspective(300px) rotateX(3deg)",
                  transition: "transform 0.15s, box-shadow 0.15s",
                  letterSpacing: "0.03em",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "perspective(300px) rotateX(0deg) translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 48px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 0 rgba(67,56,202,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform =
                    "perspective(300px) rotateX(3deg)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.08), 0 6px 0 rgba(67,56,202,0.5)";
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform =
                    "perspective(300px) rotateX(6deg) translateY(3px)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(99,102,241,0.2), 0 2px 0 rgba(67,56,202,0.4)";
                }}
              >
                🧑‍🚗 Driver Login
              </button>
            </div>

            {/* Stats pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem" }}>
              {[
                ["5000+", "Trips"],
                [`${Math.max(stats.drivers, 500)}+`, "Drivers"],
                ["50+", "Cities"],
                ["4.9★", "Rating"],
              ].map(([v, l]) => (
                <div
                  key={l}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(74,222,128,0.15)",
                    backdropFilter: "blur(12px)",
                    borderRadius: 9999,
                    padding: "0.45rem 1rem",
                    display: "flex",
                    gap: "0.35rem",
                    alignItems: "baseline",
                  }}
                >
                  <span
                    style={{
                      color: "#4ade80",
                      fontWeight: 800,
                      fontFamily: "'Orbitron', monospace",
                      fontSize: "0.9rem",
                    }}
                  >
                    {v}
                  </span>
                  <span style={{ color: "#6b7280", fontSize: "0.8rem" }}>
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
                background: "rgba(30,30,30,0.85)",
                border: "1px solid rgba(74,222,128,0.15)",
                borderRadius: 24,
                padding: "2rem",
                maxWidth: 340,
                width: "100%",
                backdropFilter: "blur(20px)",
                boxShadow:
                  "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(74,222,128,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#16a34a,#15803d)",
                    margin: "0 auto 1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2.5rem",
                    boxShadow: "0 0 32px rgba(74,222,128,0.3)",
                  }}
                >
                  🧑‍✈️
                </div>
                <h3
                  style={{
                    color: "#f8fafc",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                  }}
                >
                  Your Personal Driver
                </h3>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                  Background Verified • Family Trained
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "0.4rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <span>⭐⭐⭐⭐⭐</span>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                {[
                  "✅ Police Verified",
                  "🎓 Etiquette Trained",
                  "🏥 Medical Fit",
                  "👨‍👩‍👧 Family Driver",
                ].map((b) => (
                  <div
                    key={b}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      background: "rgba(74,222,128,0.06)",
                      border: "1px solid rgba(74,222,128,0.15)",
                      borderRadius: 8,
                      padding: "0.4rem 0.75rem",
                    }}
                  >
                    <span style={{ color: "#4ade80", fontSize: "0.85rem" }}>
                      {b}
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => navigate("drivers")}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #16a34a, #15803d)",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  padding: "0.75rem",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  boxShadow: "0 4px 0 #0d5c28",
                  transition: "transform 0.1s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Browse Drivers
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section
        style={{
          background: "#0d1a0d",
          borderTop: "1px solid rgba(74,222,128,0.1)",
          borderBottom: "1px solid rgba(74,222,128,0.1)",
          padding: "1.25rem 1.5rem",
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
                  color: "#4ade80",
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  fontFamily: "'Orbitron', monospace",
                }}
              >
                {v}
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.82rem" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Public Driver Wall */}
      {onlineDrivers.length > 0 && (
        <section style={{ padding: "4rem 1.5rem", background: "#121212" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <h2
              className="section-heading"
              style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: "1.6rem",
              }}
            >
              Available Drivers Near You
            </h2>
            <p className="section-sub">Verified, online, and ready to serve</p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              {onlineDrivers.map((d) => (
                <div
                  key={d.name}
                  className="card-dark"
                  style={{
                    textAlign: "center",
                    padding: "1.5rem 1rem",
                    border: "1px solid rgba(74,222,128,0.15)",
                    transition: "transform 0.2s, border-color 0.2s",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.borderColor = "rgba(74,222,128,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "rgba(74,222,128,0.15)";
                  }}
                >
                  {/* Online indicator */}
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "#4ade80",
                    }}
                    className="driver-dot-online"
                  />
                  {/* Avatar */}
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #16a34a, #0d9488)",
                      margin: "0 auto 0.75rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.6rem",
                      boxShadow: "0 0 20px rgba(74,222,128,0.25)",
                    }}
                  >
                    🧑‍🚗
                  </div>
                  <p
                    style={{
                      color: "#f8fafc",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {getFirstName(d.name)}
                  </p>
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "0.78rem",
                      marginBottom: "0.35rem",
                    }}
                  >
                    {d.vehicleType}
                  </p>
                  <p
                    style={{
                      color: "#fbbf24",
                      fontSize: "0.78rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    ⭐ {d.rating.toFixed(1)}
                  </p>
                  <div
                    style={{
                      background: "rgba(74,222,128,0.1)",
                      border: "1px solid rgba(74,222,128,0.2)",
                      borderRadius: 9999,
                      padding: "0.2rem 0.6rem",
                      fontSize: "0.72rem",
                      color: "#4ade80",
                      fontWeight: 600,
                      marginBottom: "0.75rem",
                      display: "inline-block",
                    }}
                  >
                    ~{getEta(d.name)} min away
                  </div>
                  <br />
                  <button
                    type="button"
                    onClick={() => navigate("book")}
                    style={{
                      background: "#16a34a",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      padding: "0.4rem 1rem",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "0.8rem",
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

      {/* Differentiators */}
      <section style={{ padding: "5rem 1.5rem", background: "#121212" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 className="section-heading">The DriveEase Difference</h2>
          <p className="section-sub">
            We're not a ride-hailing app. We build long-term trust with your
            family.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
              gap: "1.5rem",
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
                className="card-dark"
                style={{ transition: "transform 0.2s,border-color 0.2s" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.borderColor = "#16a34a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "#2d2d2d";
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                  {icon}
                </div>
                <h3
                  style={{
                    color: "#f8fafc",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                    fontSize: "1.1rem",
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.9rem",
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

      {/* How it works */}
      <section style={{ padding: "5rem 1.5rem", background: "#0d0d0d" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 className="section-heading">How It Works</h2>
          <p className="section-sub">Simple, reassuring, non-technical</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: "2rem",
            }}
          >
            {[
              {
                n: "1",
                title: "Choose a Plan",
                desc: "Select subscription or one-time driver booking based on your needs.",
              },
              {
                n: "2",
                title: "Get Your Driver",
                desc: "Receive your assigned, trained, verified personal driver within hours.",
              },
              {
                n: "3",
                title: "Build Trust",
                desc: "Build a long-term relationship with a driver your family can rely on.",
              },
            ].map(({ n, title, desc }) => (
              <div key={n} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: "rgba(74,222,128,0.1)",
                    border: "2px solid #16a34a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                    fontSize: "1.5rem",
                    fontWeight: 900,
                    color: "#4ade80",
                    fontFamily: "'Orbitron', monospace",
                  }}
                >
                  {n}
                </div>
                <h3
                  style={{
                    color: "#f8fafc",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.9rem",
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
          padding: "4rem 1.5rem",
          background: "rgba(74,222,128,0.04)",
          borderTop: "1px solid rgba(74,222,128,0.1)",
          borderBottom: "1px solid rgba(74,222,128,0.1)",
        }}
      >
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>"</div>
          <p
            style={{
              color: "#d1d5db",
              fontSize: "1.25rem",
              fontStyle: "italic",
              lineHeight: 1.7,
              marginBottom: "1.5rem",
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
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
              }}
            >
              R
            </div>
            <div style={{ textAlign: "left" }}>
              <p
                style={{
                  color: "#f8fafc",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                Rohit Sharma
              </p>
              <p style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                Verified Family User • Delhi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Ambassador */}
      <section style={{ padding: "4rem 1.5rem", background: "#121212" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h2 className="section-heading">Brand Ambassador</h2>
          <div
            style={{
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              background: "rgba(30,30,30,0.9)",
              border: "1px solid rgba(74,222,128,0.15)",
              borderRadius: 16,
              padding: "2rem 3rem",
              marginTop: "1rem",
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#16a34a,#0f766e)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
                boxShadow: "0 0 32px rgba(74,222,128,0.25)",
              }}
            >
              👤
            </div>
            <div>
              <h3
                style={{
                  color: "#f8fafc",
                  fontWeight: 700,
                  fontSize: "1.3rem",
                }}
              >
                Himanshu Thakur
              </h3>
              <p style={{ color: "#4ade80", fontSize: "0.9rem" }}>
                Brand Ambassador — DriveEase India
              </p>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: "0.85rem",
                  marginTop: "0.4rem",
                }}
              >
                Promoting safe, trusted personal driver services across India
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Payment info */}
      <section style={{ padding: "4rem 1.5rem", background: "#0d0d0d" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 className="section-heading">Payment Details</h2>
          <p className="section-sub">
            Secure bank transfer & UPI payment accepted
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
              gap: "1.5rem",
            }}
          >
            <div className="card-dark">
              <h4
                style={{
                  color: "#4ade80",
                  fontWeight: 700,
                  marginBottom: "1rem",
                  fontSize: "1rem",
                }}
              >
                🏦 Bank Transfer
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {[
                  ["Bank", "Axis Bank"],
                  ["A/C No.", "922010062230782"],
                  ["IFSC", "UTIB0004620"],
                  ["Name", "KRISHNA KANT PANDEY"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0.4rem 0",
                      borderBottom: "1px solid #2a2a2a",
                    }}
                  >
                    <span style={{ color: "#6b7280", fontSize: "0.88rem" }}>
                      {k}
                    </span>
                    <span
                      style={{
                        color: "#f8fafc",
                        fontSize: "0.88rem",
                        fontWeight: 600,
                      }}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="card-dark"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
              }}
            >
              <h4
                style={{ color: "#4ade80", fontWeight: 700, fontSize: "1rem" }}
              >
                📱 PhonePe / UPI
              </h4>
              <div
                style={{
                  width: 140,
                  height: 140,
                  background: "white",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "4px solid #16a34a",
                }}
              >
                <div style={{ textAlign: "center", color: "#121212" }}>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      marginBottom: "0.25rem",
                    }}
                  >
                    SCAN & PAY
                  </div>
                  <div style={{ fontSize: "2rem" }}>📱</div>
                  <div
                    style={{
                      fontSize: "0.6rem",
                      marginTop: "0.25rem",
                      color: "#16a34a",
                      fontWeight: 700,
                    }}
                  >
                    DriveEase
                  </div>
                </div>
              </div>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "0.85rem",
                  textAlign: "center",
                }}
              >
                UPI: 7836887228@phonepe
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section
        style={{
          padding: "4rem 1.5rem",
          background: "linear-gradient(135deg,#0f2010,#0f1520)",
          borderTop: "1px solid rgba(74,222,128,0.15)",
        }}
      >
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              color: "#f8fafc",
              fontWeight: 800,
              fontSize: "2rem",
              marginBottom: "1rem",
              fontFamily: "'Orbitron', monospace",
            }}
          >
            Ready to get a trusted driver?
          </h2>
          <p
            style={{ color: "#94a3b8", marginBottom: "2rem", fontSize: "1rem" }}
          >
            Join thousands of Indian families who trust DriveEase
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
              style={{
                background: "linear-gradient(135deg, #16a34a, #15803d)",
                color: "white",
                border: "none",
                borderRadius: 12,
                padding: "0.85rem 2rem",
                cursor: "pointer",
                fontWeight: 800,
                fontSize: "1.05rem",
                boxShadow: "0 5px 0 #0d5c28, 0 7px 16px rgba(22,163,74,0.4)",
                transition: "transform 0.1s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Book a Driver Now
            </button>
            <button
              type="button"
              onClick={() => navigate("register-driver")}
              style={{
                background: "none",
                border: "2px solid #16a34a",
                color: "#4ade80",
                borderRadius: 12,
                padding: "0.85rem 2rem",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "1.05rem",
              }}
            >
              Register as Driver
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

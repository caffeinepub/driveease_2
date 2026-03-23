import { useEffect, useRef, useState } from "react";
import { getCurrentCustomer, logoutCustomer } from "../utils/store";

interface HeaderProps {
  currentPage: string;
  navigate: (p: string) => void;
}

export default function Header({ currentPage, navigate }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const promptRef = useRef<Event | null>(null);
  const customer = getCurrentCustomer();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      promptRef.current = e;
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (!promptRef.current) return;
    const evt = promptRef.current as BeforeInstallPromptEvent;
    await evt.prompt();
    setInstallPrompt(null);
  };

  const navLink = (label: string, page: string) => {
    const isActive = currentPage === page;
    return (
      <button
        type="button"
        key={page}
        data-ocid={`nav.${page.replace("-", "_")}_link`}
        onClick={() => {
          navigate(page);
          setMobileOpen(false);
        }}
        style={{
          background: isActive ? "#16a34a" : "transparent",
          color: isActive ? "#ffffff" : "#166534",
          border: "none",
          cursor: "pointer",
          fontWeight: isActive ? 600 : 500,
          padding: "0.3rem 0.9rem",
          borderRadius: 9999,
          fontSize: "0.875rem",
          transition: "all 0.18s",
          fontFamily: "'Poppins', sans-serif",
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "#f0fdf4";
            e.currentTarget.style.color = "#15803d";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#166534";
          }
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <header
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #bbf7d0",
        boxShadow: "0 2px 12px rgba(22,163,74,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        {/* Logo */}
        <button
          type="button"
          onClick={() => navigate("home")}
          data-ocid="nav.home_link"
          aria-label="DriveEase Home"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg,#16a34a,#22c55e)",
              borderRadius: 10,
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 3px 10px rgba(22,163,74,0.3)",
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>🚗</span>
          </div>
          <span
            style={{
              color: "#14532d",
              fontWeight: 800,
              fontSize: "1.25rem",
              fontFamily: "'Orbitron', monospace",
              letterSpacing: "-0.02em",
            }}
          >
            DriveEase
          </span>
          <span
            style={{
              color: "#16a34a",
              fontSize: "0.6rem",
              fontWeight: 700,
              background: "#dcfce7",
              padding: "2px 6px",
              borderRadius: 4,
              border: "1px solid #bbf7d0",
              letterSpacing: "0.05em",
            }}
          >
            INDIA
          </span>
        </button>

        {/* Desktop Nav — pill-tab bar */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.15rem",
            background: "#f0fdf4",
            borderRadius: 9999,
            padding: "0.3rem 0.4rem",
            border: "1px solid #bbf7d0",
          }}
          className="hidden md:flex"
        >
          {navLink("Home", "home")}
          {navLink("Drivers", "drivers")}
          {navLink("Live", "live")}
          {navLink("Plans", "plans")}
          {navLink("Insurance", "insurance")}
          <button
            type="button"
            data-ocid="header.driver_login_button"
            onClick={() => navigate("driver-login")}
            style={{
              background:
                currentPage === "driver-login" ? "#0ea5e9" : "transparent",
              color: currentPage === "driver-login" ? "#ffffff" : "#0369a1",
              border: "none",
              borderRadius: 9999,
              padding: "0.3rem 0.9rem",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.875rem",
              transition: "all 0.18s",
              fontFamily: "'Poppins', sans-serif",
            }}
            onMouseEnter={(e) => {
              if (currentPage !== "driver-login") {
                e.currentTarget.style.background = "#e0f2fe";
                e.currentTarget.style.color = "#0369a1";
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== "driver-login") {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#0369a1";
              }
            }}
          >
            🧑‍🚗 Driver Login
          </button>
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setServicesOpen(!servicesOpen)}
              aria-haspopup="true"
              aria-expanded={servicesOpen}
              style={{
                background: "transparent",
                color: "#166534",
                border: "none",
                cursor: "pointer",
                padding: "0.3rem 0.9rem",
                borderRadius: 9999,
                fontSize: "0.875rem",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "4px",
                transition: "all 0.18s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f0fdf4";
              }}
              onMouseLeave={(e) => {
                if (!servicesOpen)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              More ▾
            </button>
            {servicesOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  background: "#ffffff",
                  border: "1px solid #bbf7d0",
                  borderRadius: 12,
                  minWidth: 160,
                  zIndex: 200,
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(22,163,74,0.12)",
                }}
                onMouseLeave={() => setServicesOpen(false)}
              >
                {[
                  ["My Bookings", "my-bookings"],
                  ["Payment", "payment"],
                  ["Register Driver", "register-driver"],
                ].map(([l, p]) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => {
                      navigate(p);
                      setServicesOpen(false);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "0.65rem 1rem",
                      background: "none",
                      border: "none",
                      color: "#166534",
                      cursor: "pointer",
                      fontSize: "0.88rem",
                      fontFamily: "'Poppins', sans-serif",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f0fdf4";
                      e.currentTarget.style.color = "#16a34a";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "none";
                      e.currentTarget.style.color = "#166534";
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          {installPrompt && (
            <button
              type="button"
              onClick={installApp}
              data-ocid="header.install_button"
              style={{
                background: "#dcfce7",
                border: "1px solid #bbf7d0",
                color: "#15803d",
                borderRadius: 8,
                padding: "0.35rem 0.75rem",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              📲 Install
            </button>
          )}
          {customer ? (
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span
                style={{
                  color: "#15803d",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                }}
              >
                👤 {customer.phone}
              </span>
              <button
                type="button"
                onClick={() => {
                  logoutCustomer();
                  window.location.reload();
                }}
                style={{
                  color: "#6b7280",
                  background: "none",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  padding: "4px 10px",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate("login")}
              style={{
                color: "#166534",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 8,
                padding: "0.4rem 0.9rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#dcfce7";
                e.currentTarget.style.borderColor = "#86efac";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f0fdf4";
                e.currentTarget.style.borderColor = "#bbf7d0";
              }}
            >
              Login
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate("book")}
            data-ocid="header.book_driver_button"
            style={{
              background: "linear-gradient(135deg,#16a34a,#22c55e)",
              color: "white",
              border: "none",
              borderRadius: 9999,
              padding: "0.45rem 1.1rem",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.875rem",
              fontFamily: "'Poppins', sans-serif",
              boxShadow: "0 3px 12px rgba(22,163,74,0.35)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(22,163,74,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 3px 12px rgba(22,163,74,0.35)";
            }}
          >
            🚗 Book Now
          </button>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              background: "none",
              border: "1px solid #bbf7d0",
              color: "#166534",
              cursor: "pointer",
              fontSize: "1.2rem",
              borderRadius: 8,
              padding: "0.3rem 0.5rem",
              lineHeight: 1,
            }}
            className="block md:hidden"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{
            background: "#ffffff",
            borderTop: "1px solid #dcfce7",
            padding: "1rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          {[
            ["🏠 Home", "home"],
            ["🧑‍🚗 Drivers", "drivers"],
            ["📍 Live Drivers", "live"],
            ["📋 Plans", "plans"],
            ["🛡️ Insurance", "insurance"],
            ["💳 Payment", "payment"],
            ["📅 My Bookings", "my-bookings"],
            ["✍️ Register Driver", "register-driver"],
            ["🔐 Driver Login", "driver-login"],
          ].map(([l, p]) => (
            <button
              type="button"
              key={p}
              onClick={() => {
                navigate(p);
                setMobileOpen(false);
              }}
              style={{
                color: currentPage === p ? "#16a34a" : "#166534",
                background: currentPage === p ? "#f0fdf4" : "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                padding: "0.6rem 0.75rem",
                fontSize: "0.95rem",
                borderRadius: 8,
                fontWeight: currentPage === p ? 600 : 400,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {l}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  }
}

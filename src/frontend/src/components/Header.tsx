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

  const navLink = (label: string, page: string) => (
    <button
      type="button"
      onClick={() => {
        navigate(page);
        setMobileOpen(false);
      }}
      style={{
        color: currentPage === page ? "#4ade80" : "#d1d5db",
        background: "none",
        border: "none",
        cursor: "pointer",
        fontWeight: currentPage === page ? "600" : "400",
        padding: "0.25rem 0.5rem",
        fontSize: "0.9rem",
        transition: "color 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#4ade80";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color =
          currentPage === page ? "#4ade80" : "#d1d5db";
      }}
    >
      {label}
    </button>
  );

  return (
    <header
      style={{
        background: "rgba(18,18,18,0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #2d2d2d",
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
              background: "#16a34a",
              borderRadius: 8,
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{ color: "white", fontWeight: 900, fontSize: "1.1rem" }}
            >
              D
            </span>
          </div>
          <span
            style={{ color: "#f8fafc", fontWeight: 700, fontSize: "1.2rem" }}
          >
            DriveEase
          </span>
          <span
            style={{
              color: "#4ade80",
              fontSize: "0.65rem",
              fontWeight: 600,
              background: "rgba(22,163,74,0.15)",
              padding: "2px 6px",
              borderRadius: 4,
              border: "1px solid rgba(22,163,74,0.3)",
            }}
          >
            INDIA
          </span>
        </button>

        {/* Desktop Nav */}
        <nav
          style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          className="hidden md:flex"
        >
          {navLink("Home", "home")}
          {navLink("Drivers", "drivers")}
          {navLink("Live Drivers", "live")}
          <button
            type="button"
            data-ocid="header.driver_login_button"
            onClick={() => navigate("driver-login")}
            style={{
              background:
                currentPage === "driver-login"
                  ? "rgba(99,102,241,0.15)"
                  : "rgba(99,102,241,0.08)",
              border: "1px solid rgba(129,140,248,0.3)",
              color: "#a5b4fc",
              borderRadius: 8,
              padding: "0.3rem 0.85rem",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.85rem",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(99,102,241,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                currentPage === "driver-login"
                  ? "rgba(99,102,241,0.15)"
                  : "rgba(99,102,241,0.08)";
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
                color: "#d1d5db",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.25rem 0.5rem",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#4ade80";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#d1d5db";
              }}
            >
              Services ▾
            </button>
            {servicesOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  background: "#1e1e1e",
                  border: "1px solid #3a3a3a",
                  borderRadius: 8,
                  minWidth: 160,
                  zIndex: 200,
                  overflow: "hidden",
                }}
                onMouseLeave={() => setServicesOpen(false)}
              >
                {[
                  ["Plans", "plans"],
                  ["Insurance", "insurance"],
                  ["Payment", "payment"],
                  ["My Bookings", "my-bookings"],
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
                      padding: "0.6rem 1rem",
                      background: "none",
                      border: "none",
                      color: "#d1d5db",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#16a34a";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "none";
                      e.currentTarget.style.color = "#d1d5db";
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>
          {navLink("Register Driver", "register-driver")}
        </nav>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {installPrompt && (
            <button
              type="button"
              onClick={installApp}
              data-ocid="header.install_button"
              aria-label="Install DriveEase app"
              style={{
                background: "rgba(22,163,74,0.15)",
                border: "1px solid rgba(22,163,74,0.3)",
                color: "#4ade80",
                borderRadius: 8,
                padding: "0.35rem 0.75rem",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                whiteSpace: "nowrap",
              }}
            >
              📲 Install App
            </button>
          )}
          {customer ? (
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span
                style={{
                  color: "#4ade80",
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
                  color: "#94a3b8",
                  background: "none",
                  border: "1px solid #3a3a3a",
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
                color: "#f8fafc",
                background: "none",
                border: "1px solid #3a3a3a",
                borderRadius: 8,
                padding: "0.4rem 0.9rem",
                cursor: "pointer",
                fontSize: "0.9rem",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#16a34a";
                e.currentTarget.style.color = "#4ade80";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#3a3a3a";
                e.currentTarget.style.color = "#f8fafc";
              }}
            >
              Login
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate("drivers")}
            className="green-btn"
            style={{ fontSize: "0.9rem" }}
          >
            Book a Driver
          </button>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              color: "#f8fafc",
              cursor: "pointer",
              fontSize: "1.5rem",
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
            background: "#1a1a1a",
            borderTop: "1px solid #2d2d2d",
            padding: "1rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          {[
            ["Home", "home"],
            ["Drivers", "drivers"],
            ["Live Drivers", "live"],
            ["Plans", "plans"],
            ["Insurance", "insurance"],
            ["Payment", "payment"],
            ["My Bookings", "my-bookings"],
            ["Register Driver", "register-driver"],
          ].map(([l, p]) => (
            <button
              type="button"
              key={p}
              onClick={() => {
                navigate(p);
                setMobileOpen(false);
              }}
              style={{
                color: "#d1d5db",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                padding: "0.5rem 0",
                fontSize: "1rem",
                borderBottom: "1px solid #2a2a2a",
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

// Global type for beforeinstallprompt
declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  }
}

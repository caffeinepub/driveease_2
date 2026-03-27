import { useEffect, useRef, useState } from "react";
import { getCurrentCustomer, logoutCustomer } from "../utils/store";

interface HeaderProps {
  currentPage: string;
  navigate: (p: string) => void;
}

export default function Header({ currentPage, navigate }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const customer = getCurrentCustomer();
  const isLoggedIn = !!customer;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    if (mobileOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen]);

  const go = (page: string) => {
    navigate(page);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logoutCustomer();
    setMobileOpen(false);
    navigate("home");
    window.location.reload();
  };

  const navItems = [
    { label: "Home", page: "home", color: "#FF6B6B" },
    { label: "Book Driver", page: "book", color: "#42A5F5" },
    { label: "Become a Driver", page: "register-driver", color: "#66BB6A" },
    ...(isLoggedIn
      ? [{ label: "My Bookings", page: "my-bookings", color: "#FFCA28" }]
      : []),
  ];

  const isActive = (page: string) =>
    page === "home"
      ? currentPage === "home" || currentPage === ""
      : currentPage === page;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: scrolled
          ? "rgba(255,255,255,0.98)"
          : "rgba(255,255,255,0.96)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: scrolled
          ? "2px solid transparent"
          : "1px solid rgba(0,0,0,0.08)",
        backgroundImage: scrolled
          ? "linear-gradient(white,white), linear-gradient(90deg,#FF6B6B,#42A5F5,#FFCA28,#66BB6A)"
          : "none",
        backgroundOrigin: "border-box",
        backgroundClip: scrolled ? "padding-box, border-box" : "initial",
        boxShadow: scrolled ? "0 2px 16px rgba(0,0,0,0.1)" : "none",
        transition: "background 0.3s, box-shadow 0.3s",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 68,
          gap: "1rem",
        }}
      >
        {/* Logo */}
        <button
          type="button"
          data-ocid="nav.home_link"
          onClick={() => go("home")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg,#FF6B6B,#42A5F5)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
            }}
          >
            🚗
          </div>
          <span
            style={{
              fontFamily: "'Orbitron', monospace",
              fontWeight: 700,
              fontSize: "1.2rem",
              background: "linear-gradient(135deg,#FF6B6B,#42A5F5,#66BB6A)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.04em",
            }}
          >
            DriveEase
          </span>
        </button>

        {/* Desktop nav */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            flex: 1,
            justifyContent: "center",
          }}
          className="hidden-mobile"
        >
          {navItems.map((item) => (
            <button
              type="button"
              key={item.page}
              data-ocid={`nav.${item.page.replace("-", "_")}_link`}
              onClick={() => go(item.page)}
              style={{
                background: isActive(item.page)
                  ? `${item.color}18`
                  : "transparent",
                color: isActive(item.page) ? item.color : "#334155",
                border: isActive(item.page)
                  ? `1px solid ${item.color}44`
                  : "1px solid transparent",
                borderRadius: 9999,
                padding: "0.45rem 1rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: isActive(item.page) ? 600 : 500,
                fontFamily: "'Poppins', sans-serif",
                transition: "all 0.18s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.page)) {
                  e.currentTarget.style.color = item.color;
                  e.currentTarget.style.background = `${item.color}12`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.page)) {
                  e.currentTarget.style.color = "#334155";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right side: auth + Driver Login + Book Now */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexShrink: 0,
          }}
          className="hidden-mobile"
        >
          {isLoggedIn ? (
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#42A5F5,#66BB6A)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "#ffffff",
                  cursor: "pointer",
                  border: "2px solid rgba(66,165,245,0.3)",
                }}
              >
                {(customer?.name || customer?.phone || "U")[0].toUpperCase()}
              </div>
              <button
                type="button"
                data-ocid="nav.logout_button"
                onClick={handleLogout}
                style={{
                  background: "none",
                  border: "1px solid rgba(255,107,107,0.4)",
                  color: "#e53935",
                  borderRadius: 8,
                  padding: "0.35rem 0.75rem",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              type="button"
              data-ocid="nav.login_link"
              onClick={() => go("login")}
              style={{
                background: "none",
                border: "1px solid rgba(66,165,245,0.4)",
                color: "#1976D2",
                borderRadius: 8,
                padding: "0.45rem 1rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              Login / Signup
            </button>
          )}
          {/* Driver Login button */}
          <button
            type="button"
            data-ocid="nav.driver_login_button"
            onClick={() => go("driver-login")}
            style={{
              background: "none",
              border: "1px solid rgba(255,202,40,0.5)",
              color: "#F57F17",
              borderRadius: 8,
              padding: "0.45rem 1rem",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 500,
              whiteSpace: "nowrap",
              transition: "all 0.18s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,202,40,0.1)";
              e.currentTarget.style.borderColor = "rgba(255,202,40,0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.borderColor = "rgba(255,202,40,0.5)";
            }}
          >
            🚖 Driver Login
          </button>
          <button
            type="button"
            data-ocid="nav.book_now_button"
            onClick={() => go("book")}
            className="red-btn"
            style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}
          >
            Book Now
          </button>
        </div>

        {/* Hamburger */}
        <button
          type="button"
          data-ocid="nav.hamburger_button"
          onClick={() => setMobileOpen((v) => !v)}
          className="show-mobile"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "none",
            flexDirection: "column",
            gap: 5,
            padding: "0.5rem",
          }}
          aria-label="Toggle menu"
        >
          <span
            style={{
              display: "block",
              width: 24,
              height: 2,
              background: mobileOpen ? "#42A5F5" : "#334155",
              borderRadius: 2,
              transition: "all 0.2s",
              transform: mobileOpen ? "translateY(7px) rotate(45deg)" : "none",
            }}
          />
          <span
            style={{
              display: "block",
              width: 24,
              height: 2,
              background: mobileOpen ? "transparent" : "#334155",
              borderRadius: 2,
              transition: "all 0.2s",
            }}
          />
          <span
            style={{
              display: "block",
              width: 24,
              height: 2,
              background: mobileOpen ? "#42A5F5" : "#334155",
              borderRadius: 2,
              transition: "all 0.2s",
              transform: mobileOpen
                ? "translateY(-7px) rotate(-45deg)"
                : "none",
            }}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          ref={menuRef}
          style={{
            background: "rgba(255,255,255,0.98)",
            borderTop: "2px solid transparent",
            backgroundImage:
              "linear-gradient(white,white), linear-gradient(90deg,#FF6B6B,#42A5F5,#FFCA28,#66BB6A)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
            padding: "1rem 1.5rem 1.5rem",
          }}
        >
          <nav
            style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
          >
            {navItems.map((item) => (
              <button
                type="button"
                key={item.page}
                data-ocid={`nav.mobile_${item.page.replace("-", "_")}_link`}
                onClick={() => go(item.page)}
                style={{
                  background: isActive(item.page)
                    ? `${item.color}15`
                    : "transparent",
                  color: isActive(item.page) ? item.color : "#334155",
                  border: isActive(item.page)
                    ? `1px solid ${item.color}40`
                    : "1px solid transparent",
                  borderRadius: 10,
                  padding: "0.75rem 1rem",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  fontFamily: "'Poppins', sans-serif",
                  textAlign: "left",
                  minHeight: 44,
                }}
              >
                {item.label}
              </button>
            ))}
            <div
              style={{
                height: 1,
                background:
                  "linear-gradient(90deg,#FF6B6B,#42A5F5,#FFCA28,#66BB6A)",
                margin: "0.5rem 0",
                opacity: 0.3,
              }}
            />
            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: "transparent",
                  color: "#e53935",
                  border: "1px solid rgba(255,107,107,0.3)",
                  borderRadius: 10,
                  padding: "0.75rem 1rem",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  fontFamily: "'Poppins', sans-serif",
                  textAlign: "left",
                  minHeight: 44,
                }}
              >
                Logout
              </button>
            ) : (
              <button
                type="button"
                onClick={() => go("login")}
                style={{
                  background: "transparent",
                  color: "#1976D2",
                  border: "1px solid rgba(66,165,245,0.3)",
                  borderRadius: 10,
                  padding: "0.75rem 1rem",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  fontFamily: "'Poppins', sans-serif",
                  textAlign: "left",
                  minHeight: 44,
                }}
              >
                Login / Signup
              </button>
            )}
            {/* Driver Login - mobile */}
            <button
              type="button"
              data-ocid="nav.mobile_driver_login_button"
              onClick={() => go("driver-login")}
              style={{
                background: "transparent",
                color: "#F57F17",
                border: "1px solid rgba(255,202,40,0.35)",
                borderRadius: 10,
                padding: "0.75rem 1rem",
                cursor: "pointer",
                fontSize: "0.95rem",
                fontFamily: "'Poppins', sans-serif",
                textAlign: "left",
                minHeight: 44,
              }}
            >
              🚖 Driver Login
            </button>
            <button
              type="button"
              onClick={() => go("book")}
              className="red-btn"
              style={{
                marginTop: "0.5rem",
                width: "100%",
                justifyContent: "center",
                minHeight: 48,
              }}
            >
              Book Now
            </button>
          </nav>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
          .hidden-mobile { display: flex !important; }
        }
      `}</style>
    </header>
  );
}

interface FooterProps {
  navigate: (p: string) => void;
}
export default function Footer({ navigate }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        background: "#f0fdf4",
        borderTop: "1px solid #bbf7d0",
        padding: "3rem 1.5rem 1.5rem",
        marginTop: "auto",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
            gap: "2rem",
            marginBottom: "2.5rem",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg,#16a34a,#22c55e)",
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(22,163,74,0.25)",
                }}
              >
                <span style={{ fontSize: "1rem" }}>🚗</span>
              </div>
              <span
                style={{
                  color: "#14532d",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  fontFamily: "'Orbitron', monospace",
                }}
              >
                DriveEase
              </span>
            </div>
            <p
              style={{ color: "#4b7e4b", fontSize: "0.88rem", lineHeight: 1.6 }}
            >
              India's First Personal Driver Network. Trusted by families across
              India.
            </p>
            <p
              style={{
                color: "#16a34a",
                marginTop: "0.75rem",
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              "Not just a ride, a trusted driver."
            </p>
          </div>
          <div>
            <h4
              style={{
                color: "#14532d",
                fontWeight: 700,
                marginBottom: "0.75rem",
                fontSize: "0.95rem",
              }}
            >
              Quick Links
            </h4>
            {[
              ["Home", "home"],
              ["Book Driver", "drivers"],
              ["Register Driver", "register-driver"],
              ["My Bookings", "my-bookings"],
              ["Plans", "plans"],
              ["Insurance", "insurance"],
            ].map(([l, p]) => (
              <button
                type="button"
                key={p}
                onClick={() => navigate(p)}
                style={{
                  display: "block",
                  color: "#4b7e4b",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.2rem 0",
                  fontSize: "0.88rem",
                  textAlign: "left",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#16a34a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#4b7e4b";
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <div>
            <h4
              style={{
                color: "#14532d",
                fontWeight: 700,
                marginBottom: "0.75rem",
                fontSize: "0.95rem",
              }}
            >
              Contact & Support
            </h4>
            <p
              style={{
                color: "#4b7e4b",
                fontSize: "0.88rem",
                marginBottom: "0.5rem",
              }}
            >
              📞 Krishna Pandey
            </p>
            <a
              href="tel:+917836887228"
              style={{
                color: "#16a34a",
                fontSize: "0.9rem",
                display: "block",
                marginBottom: "0.5rem",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              +91-7836887228
            </a>
            <a
              href="mailto:support@driveease.in"
              style={{
                color: "#4b7e4b",
                fontSize: "0.88rem",
                textDecoration: "none",
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              support@driveease.in
            </a>
            <a
              href="https://wa.me/917836887228"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "#25d366",
                color: "white",
                padding: "0.4rem 0.8rem",
                borderRadius: 6,
                fontSize: "0.85rem",
                textDecoration: "none",
                marginTop: "0.5rem",
                fontWeight: 500,
              }}
            >
              💬 WhatsApp
            </a>
          </div>
          <div>
            <h4
              style={{
                color: "#14532d",
                fontWeight: 700,
                marginBottom: "0.75rem",
                fontSize: "0.95rem",
              }}
            >
              Emergency
            </h4>
            <a
              href="tel:108"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#dc2626",
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                fontSize: "0.88rem",
                textDecoration: "none",
                marginBottom: "0.75rem",
              }}
            >
              🚨 Ambulance: 108
            </a>
            <a
              href="tel:100"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(59,130,246,0.08)",
                border: "1px solid rgba(59,130,246,0.2)",
                color: "#2563eb",
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                fontSize: "0.88rem",
                textDecoration: "none",
              }}
            >
              🚔 Police: 100
            </a>
          </div>
        </div>
        <div
          style={{
            borderTop: "1px solid #dcfce7",
            paddingTop: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <p style={{ color: "#6b7280", fontSize: "0.82rem" }}>
            © {year} DriveEase. All rights reserved.
          </p>
          <p style={{ color: "#6b7280", fontSize: "0.82rem" }}>
            © {year}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "#16a34a",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
      {/* WhatsApp float */}
      <a
        href="https://wa.me/917836887228"
        target="_blank"
        rel="noreferrer"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          background: "#25d366",
          color: "white",
          width: 52,
          height: 52,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.6rem",
          boxShadow: "0 4px 20px rgba(37,211,102,0.4)",
          zIndex: 999,
          textDecoration: "none",
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        💬
      </a>
    </footer>
  );
}

interface FooterProps {
  navigate: (p: string) => void;
}
export default function Footer({ navigate }: FooterProps) {
  return (
    <footer
      style={{
        background: "#0d0d0d",
        borderTop: "1px solid #1e1e1e",
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
                  background: "#16a34a",
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{ color: "white", fontWeight: 900, fontSize: "1rem" }}
                >
                  D
                </span>
              </div>
              <span
                style={{
                  color: "#f8fafc",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                }}
              >
                DriveEase
              </span>
            </div>
            <p
              style={{ color: "#6b7280", fontSize: "0.88rem", lineHeight: 1.6 }}
            >
              India's First Personal Driver Network. Trusted by families across
              India.
            </p>
            <p
              style={{
                color: "#4ade80",
                marginTop: "0.75rem",
                fontSize: "0.9rem",
              }}
            >
              "Not just a ride, a trusted driver."
            </p>
          </div>
          <div>
            <h4
              style={{
                color: "#f8fafc",
                fontWeight: 600,
                marginBottom: "0.75rem",
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
                  color: "#6b7280",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.2rem 0",
                  fontSize: "0.88rem",
                  textAlign: "left",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#4ade80";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#6b7280";
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <div>
            <h4
              style={{
                color: "#f8fafc",
                fontWeight: 600,
                marginBottom: "0.75rem",
              }}
            >
              Contact & Support
            </h4>
            <p
              style={{
                color: "#6b7280",
                fontSize: "0.88rem",
                marginBottom: "0.5rem",
              }}
            >
              📞 Krishna Pandey
            </p>
            <a
              href="tel:+917836887228"
              style={{
                color: "#4ade80",
                fontSize: "0.9rem",
                display: "block",
                marginBottom: "0.5rem",
                textDecoration: "none",
              }}
            >
              +91-7836887228
            </a>
            <a
              href="mailto:support@driveease.in"
              style={{
                color: "#6b7280",
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
              }}
            >
              💬 WhatsApp
            </a>
          </div>
          <div>
            <h4
              style={{
                color: "#f8fafc",
                fontWeight: 600,
                marginBottom: "0.75rem",
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
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171",
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                fontSize: "0.9rem",
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
                background: "rgba(59,130,246,0.1)",
                border: "1px solid rgba(59,130,246,0.3)",
                color: "#60a5fa",
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                fontSize: "0.9rem",
                textDecoration: "none",
              }}
            >
              🚔 Police: 100
            </a>
          </div>
        </div>
        <div
          style={{
            borderTop: "1px solid #1e1e1e",
            paddingTop: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <p style={{ color: "#4b5563", fontSize: "0.82rem" }}>
            © 2026 DriveEase. All rights reserved.
          </p>
          <p style={{ color: "#4b5563", fontSize: "0.82rem" }}>
            Made with ❤️ for Indian Families
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

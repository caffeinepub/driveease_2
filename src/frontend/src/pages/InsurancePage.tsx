interface Props {
  navigate: (p: string) => void;
}
export default function InsurancePage({ navigate }: Props) {
  return (
    <div
      style={{ background: "#0a0f1a", minHeight: "100vh", padding: "2rem 0" }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 1.5rem" }}>
        {/* Header with driver wave animation */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>
            <span className="wave-hand">🙋‍♂️</span>
          </div>
          <h1
            style={{
              color: "#e2e8f0",
              fontWeight: 800,
              fontSize: "2rem",
              marginBottom: "0.5rem",
            }}
          >
            🛡️ Ride Insurance & Helpline
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1rem" }}>
            Your safety is our top priority. Every ride can be insured.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            gap: "1.25rem",
            marginBottom: "3rem",
          }}
        >
          {[
            {
              icon: "🚑",
              title: "Emergency Ambulance",
              desc: "One-tap ambulance call. Available 24/7 across India.",
              action: "Call 108",
              href: "tel:108",
              color: "#ef4444",
            },
            {
              icon: "🗣️",
              title: "Police Emergency",
              desc: "Instant police helpline for any security concern during ride.",
              action: "Call 100",
              href: "tel:100",
              color: "#3b82f6",
            },
            {
              icon: "💬",
              title: "DriveEase Support",
              desc: "Our support team available around the clock. Contact Krishna Pandey.",
              action: "WhatsApp",
              href: "https://wa.me/917836887228",
              color: "#25d366",
            },
          ].map(({ icon, title, desc, action, href, color }) => (
            <div
              key={title}
              style={{
                background: "#0d1420",
                border: "1px solid rgba(0,230,118,0.2)",
                borderRadius: 14,
                padding: "1.5rem",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,230,118,0.07)",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
                {icon}
              </div>
              <h3
                style={{
                  color: "#e2e8f0",
                  fontWeight: 700,
                  marginBottom: "0.5rem",
                  fontSize: "0.95rem",
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "0.88rem",
                  marginBottom: "1rem",
                  lineHeight: 1.6,
                }}
              >
                {desc}
              </p>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : "_self"}
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  background: color,
                  color: "white",
                  borderRadius: 8,
                  padding: "0.5rem 1.25rem",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  textDecoration: "none",
                }}
              >
                {action}
              </a>
            </div>
          ))}
        </div>

        <div
          style={{
            background: "#0d1420",
            border: "1px solid rgba(0,230,118,0.2)",
            borderRadius: 14,
            padding: "1.5rem",
            marginBottom: "1.5rem",
            boxShadow: "0 2px 8px rgba(0,230,118,0.07)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              <h2
                style={{
                  color: "#e2e8f0",
                  fontWeight: 800,
                  fontSize: "1.4rem",
                  marginBottom: "0.25rem",
                }}
              >
                Per-Ride Insurance Plan
              </h2>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                Pay per ride. Insurance expires automatically when the ride
                completes.
              </p>
            </div>
            <div
              style={{
                background: "#1a2e1a20",
                border: "2px solid #86efac",
                borderRadius: 12,
                padding: "1rem 1.5rem",
                textAlign: "center",
              }}
            >
              <div
                style={{ color: "#00e676", fontWeight: 900, fontSize: "2rem" }}
              >
                ₹49
              </div>
              <div style={{ color: "#94a3b8", fontSize: "0.82rem" }}>
                per ride
              </div>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
              gap: "0.75rem",
            }}
          >
            {[
              "✅ Accident coverage during ride",
              "✅ Medical expenses up to ₹50,000",
              "✅ Driver negligence covered",
              "✅ 24/7 claim support",
              "✅ No paperwork needed",
              "✅ Instant activation on booking",
            ].map((f) => (
              <div
                key={f}
                style={{
                  color: "#e2e8f0",
                  fontSize: "0.88rem",
                  padding: "0.4rem 0",
                }}
              >
                {f}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "#0d1420",
            border: "1px solid rgba(0,230,118,0.2)",
            borderRadius: 14,
            padding: "1.5rem",
            boxShadow: "0 2px 8px rgba(0,230,118,0.07)",
          }}
        >
          <h3
            style={{ color: "#e2e8f0", fontWeight: 700, marginBottom: "1rem" }}
          >
            How to Claim Insurance
          </h3>
          {[
            {
              n: "1",
              t: "Contact Support",
              d: "Call or WhatsApp +91-7836887228 immediately after an incident",
            },
            {
              n: "2",
              t: "Share Booking ID",
              d: "Provide your booking ID and describe the incident",
            },
            {
              n: "3",
              t: "Medical Assistance",
              d: "Get emergency treatment — we cover up to ₹50,000",
            },
            {
              n: "4",
              t: "Claim Processing",
              d: "Our team processes claims within 3-5 business days",
            },
          ].map(({ n, t, d }) => (
            <div
              key={n}
              style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#1a2e1a20",
                  border: "2px solid #86efac",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#00e676",
                  fontWeight: 700,
                  flexShrink: 0,
                  fontSize: "0.9rem",
                }}
              >
                {n}
              </div>
              <div>
                <p
                  style={{
                    color: "#e2e8f0",
                    fontWeight: 600,
                    marginBottom: "0.2rem",
                    fontSize: "0.93rem",
                  }}
                >
                  {t}
                </p>
                <p style={{ color: "#94a3b8", fontSize: "0.88rem" }}>{d}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button
            type="button"
            onClick={() => navigate("drivers")}
            data-ocid="insurance.book_driver_button"
            className="red-btn"
            style={{ fontSize: "1rem", padding: "0.8rem 2rem" }}
          >
            Book a Driver with Insurance
          </button>
        </div>
      </div>
    </div>
  );
}

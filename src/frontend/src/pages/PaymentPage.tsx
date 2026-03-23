export default function PaymentPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1
          style={{
            color: "#14532d",
            fontWeight: 800,
            fontSize: "2.25rem",
            marginBottom: "0.5rem",
          }}
        >
          💳 Payment Details
        </h1>
        <p style={{ color: "#4b7e4b" }}>
          Pay securely via bank transfer or UPI
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div className="card-dark">
          <h3
            style={{
              color: "#4ade80",
              fontWeight: 700,
              fontSize: "1.1rem",
              marginBottom: "1.25rem",
            }}
          >
            🏦 Bank Transfer
          </h3>
          {[
            ["Bank Name", "Axis Bank"],
            ["Account No.", "922010062230782"],
            ["IFSC Code", "UTIB0004620"],
            ["Account Holder", "KRISHNA KANT PANDEY"],
            ["Account Type", "Savings"],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.6rem 0",
                borderBottom: "1px solid #dcfce7",
              }}
            >
              <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>{k}</span>
              <span
                style={{
                  color: "#14532d",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  userSelect: "all",
                }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>

        <div
          className="card-dark"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <h3 style={{ color: "#4ade80", fontWeight: 700, fontSize: "1.1rem" }}>
            📱 PhonePe / UPI
          </h3>
          <div
            style={{
              width: 180,
              height: 180,
              background: "white",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "4px solid #16a34a",
              padding: "1rem",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  color: "#121212",
                  marginBottom: "0.5rem",
                }}
              >
                SCAN TO PAY
              </div>
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Payment QR Code</title>
                <rect width="120" height="120" fill="white" />
                {/* QR pattern */}
                <rect
                  x="10"
                  y="10"
                  width="40"
                  height="40"
                  fill="none"
                  stroke="black"
                  strokeWidth="4"
                />
                <rect x="18" y="18" width="24" height="24" fill="black" />
                <rect
                  x="70"
                  y="10"
                  width="40"
                  height="40"
                  fill="none"
                  stroke="black"
                  strokeWidth="4"
                />
                <rect x="78" y="18" width="24" height="24" fill="black" />
                <rect
                  x="10"
                  y="70"
                  width="40"
                  height="40"
                  fill="none"
                  stroke="black"
                  strokeWidth="4"
                />
                <rect x="18" y="78" width="24" height="24" fill="black" />
                <rect x="70" y="70" width="10" height="10" fill="black" />
                <rect x="85" y="70" width="10" height="10" fill="black" />
                <rect x="100" y="70" width="10" height="10" fill="black" />
                <rect x="70" y="85" width="10" height="10" fill="black" />
                <rect x="100" y="85" width="10" height="10" fill="black" />
                <rect x="70" y="100" width="10" height="10" fill="black" />
                <rect x="85" y="100" width="25" height="10" fill="black" />
                <rect x="55" y="10" width="10" height="10" fill="black" />
                <rect x="55" y="25" width="10" height="10" fill="black" />
                <rect x="55" y="55" width="10" height="10" fill="black" />
                <rect x="10" y="55" width="10" height="10" fill="black" />
                <rect x="25" y="55" width="10" height="10" fill="black" />
                <rect x="40" y="55" width="10" height="10" fill="black" />
              </svg>
              <div
                style={{
                  fontSize: "0.65rem",
                  color: "#16a34a",
                  fontWeight: 800,
                  marginTop: "0.5rem",
                }}
              >
                DriveEase Pay
              </div>
            </div>
          </div>
          <p
            style={{
              color: "#4b7e4b",
              fontSize: "0.88rem",
              textAlign: "center",
            }}
          >
            UPI ID: krishnakant@axisbank
          </p>
          <p
            style={{
              color: "#6b7280",
              fontSize: "0.8rem",
              textAlign: "center",
            }}
          >
            Scan using PhonePe, GPay, Paytm or any UPI app
          </p>
        </div>
      </div>

      <div
        className="card-dark"
        style={{
          background: "rgba(251,191,36,0.05)",
          borderColor: "rgba(251,191,36,0.2)",
        }}
      >
        <h4
          style={{ color: "#fbbf24", fontWeight: 700, marginBottom: "0.75rem" }}
        >
          ⚠️ Payment Instructions
        </h4>
        <ul
          style={{
            color: "#4b7e4b",
            fontSize: "0.9rem",
            lineHeight: 1.9,
            paddingLeft: "1.25rem",
          }}
        >
          <li>
            For Driver Registration: Pay{" "}
            <strong style={{ color: "#14532d" }}>₹150</strong> as registration
            fee
          </li>
          <li>For Ride Booking: Pay as per price shown in your booking</li>
          <li>
            After payment, share screenshot on WhatsApp:{" "}
            <a href="https://wa.me/917836887228" style={{ color: "#25d366" }}>
              +91-7836887228
            </a>
          </li>
          <li>Booking confirmed within 1-2 hours after payment verification</li>
          <li>For refunds or issues, contact Krishna Pandey directly</li>
        </ul>
      </div>
    </div>
  );
}

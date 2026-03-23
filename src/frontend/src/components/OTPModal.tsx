import { useState } from "react";
import { loginCustomer } from "../utils/store";

interface OTPModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function OTPModal({ onClose, onSuccess }: OTPModalProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOTP = () => {
    if (phone.length !== 10) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      setError("");
    }, 1000);
  };

  const verifyOTP = () => {
    if (otp.length !== 6) {
      setError("Enter 6-digit OTP");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      loginCustomer(phone, name || "Customer");
      onSuccess();
    }, 800);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "#1e1e1e",
          border: "1px solid #3a3a3a",
          borderRadius: 16,
          padding: "2rem",
          width: "100%",
          maxWidth: 400,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ color: "#f8fafc", fontWeight: 700, fontSize: "1.3rem" }}>
            Login to DriveEase
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              color: "#6b7280",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.4rem",
            }}
          >
            ×
          </button>
        </div>
        {step === "phone" ? (
          <div>
            <p
              style={{
                color: "#94a3b8",
                marginBottom: "1.25rem",
                fontSize: "0.9rem",
              }}
            >
              Enter your mobile number to continue
            </p>
            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="otp-name"
                style={{
                  color: "#d1d5db",
                  fontSize: "0.85rem",
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                Your Name
              </label>
              <input
                className="input-dark"
                id="otp-name"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <p
                style={{
                  color: "#d1d5db",
                  fontSize: "0.85rem",
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                Mobile Number
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <span
                  style={{
                    background: "#2a2a2a",
                    border: "1px solid #3a3a3a",
                    borderRadius: 8,
                    padding: "0.6rem 0.8rem",
                    color: "#94a3b8",
                    fontSize: "0.9rem",
                  }}
                >
                  +91
                </span>
                <input
                  className="input-dark"
                  placeholder="10 digit number"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  maxLength={10}
                />
              </div>
            </div>
            {error && (
              <p
                style={{
                  color: "#f87171",
                  fontSize: "0.85rem",
                  marginBottom: "0.75rem",
                }}
              >
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={sendOTP}
              disabled={loading}
              className="green-btn"
              style={{
                width: "100%",
                justifyContent: "center",
                fontSize: "1rem",
                padding: "0.7rem",
              }}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
            <p
              style={{
                color: "#4b5563",
                fontSize: "0.8rem",
                textAlign: "center",
                marginTop: "0.75rem",
              }}
            >
              OTP will be sent via SMS
            </p>
          </div>
        ) : (
          <div>
            <p
              style={{
                color: "#94a3b8",
                marginBottom: "1.25rem",
                fontSize: "0.9rem",
              }}
            >
              OTP sent to +91-{phone}. <br />
              <span style={{ color: "#4ade80" }}>
                (Use any 6 digits for demo)
              </span>
            </p>
            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="otp-code"
                style={{
                  color: "#d1d5db",
                  fontSize: "0.85rem",
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                Enter OTP
              </label>
              <input
                id="otp-code"
                className="input-dark"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength={6}
                style={{
                  letterSpacing: "0.3em",
                  fontSize: "1.2rem",
                  textAlign: "center",
                }}
              />
            </div>
            {error && (
              <p
                style={{
                  color: "#f87171",
                  fontSize: "0.85rem",
                  marginBottom: "0.75rem",
                }}
              >
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={verifyOTP}
              disabled={loading}
              className="green-btn"
              style={{
                width: "100%",
                justifyContent: "center",
                fontSize: "1rem",
                padding: "0.7rem",
              }}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setError("");
              }}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                marginTop: "0.75rem",
                fontSize: "0.88rem",
              }}
            >
              ← Change Number
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

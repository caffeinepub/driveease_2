import { useEffect, useRef, useState } from "react";
import {
  type Registration,
  addRegistration,
  getRegistrations,
  uid,
} from "../utils/store";

const STATES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "J&K",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const VEHICLE_TYPES = [
  "Sedan",
  "SUV",
  "Hatchback",
  "Tempo Traveller",
  "Mini Bus",
  "MUV",
];

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DriverRegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    state: "Delhi",
    experience: 1,
    vehicleType: "Sedan",
    languages: "Hindi",
    aadharDesc: "",
    dlDesc: "",
    selfieDesc: "",
    paymentRef: "",
    paymentScreenshot: "",
  });
  const [phoneOtp, setPhoneOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(1800);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [error, setError] = useState("");

  // Check if phone already registered and pending
  useEffect(() => {
    if (submitted) {
      timerRef.current = setInterval(() => {
        setCountdown((c) => (c > 0 ? c - 1 : 0));
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [submitted]);

  useEffect(() => {
    // Check if returning user with pending registration
    const savedPhone = localStorage.getItem("de_reg_phone");
    if (savedPhone) {
      const regs = getRegistrations();
      const existing = regs.find(
        (r) => r.phone === savedPhone && r.status === "pending",
      );
      if (existing) {
        setSubmitted(true);
        const elapsed = Math.floor(
          (Date.now() - new Date(existing.submittedAt).getTime()) / 1000,
        );
        setCountdown(Math.max(0, 1800 - elapsed));
      }
    }
  }, []);

  const upd = (k: string, v: string | number) =>
    setForm((p) => ({ ...p, [k]: v }));

  const sendOtp = () => {
    if (form.phone.length !== 10) {
      setOtpError("Enter valid 10-digit mobile number");
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setPhoneOtp(otp); // Show inline for simulation
    setOtpSent(true);
    setOtpError("");
  };

  const verifyOtp = () => {
    if (enteredOtp === generatedOtp) {
      setOtpVerified(true);
      setOtpError("");
    } else {
      setOtpError("Invalid OTP. Please try again.");
    }
  };

  const handleFileUpload = async (key: string, file: File | undefined) => {
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      upd(key, base64);
    } catch {
      setError("File upload failed. Try again.");
    }
  };

  const nextStep = () => {
    setError("");
    if (step === 1) {
      if (!form.name.trim()) {
        setError("Enter full name");
        return;
      }
      if (!otpVerified) {
        setError("Please verify your phone with OTP");
        return;
      }
      if (!form.city.trim()) {
        setError("Enter city");
        return;
      }
    }
    if (step === 2) {
      if (!form.dlDesc) {
        setError("Upload Driving License");
        return;
      }
      if (!form.aadharDesc) {
        setError("Upload Aadhaar Card");
        return;
      }
      if (!form.selfieDesc) {
        setError("Upload Live Selfie");
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const submit = () => {
    if (!form.paymentScreenshot) {
      setError("Upload payment screenshot");
      return;
    }
    const r: Registration = {
      id: uid(),
      name: form.name,
      phone: form.phone,
      city: form.city,
      state: form.state,
      experience: Number(form.experience),
      vehicleType: form.vehicleType,
      languages: form.languages,
      aadharDesc: form.aadharDesc,
      dlDesc: form.dlDesc,
      selfieDesc: form.selfieDesc,
      paymentRef: form.paymentRef,
      paymentScreenshot: form.paymentScreenshot,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
    addRegistration(r);
    localStorage.setItem("de_reg_phone", form.phone);
    setSubmitted(true);
  };

  const formatTimer = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (submitted)
    return (
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: "3rem 1.5rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: "rgba(22,163,74,0.08)",
            border: "2px solid rgba(22,163,74,0.4)",
            borderRadius: 20,
            padding: "3rem 2rem",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
          <h2
            style={{
              color: "#4ade80",
              fontWeight: 800,
              fontSize: "1.6rem",
              marginBottom: "0.75rem",
            }}
          >
            Registration Submitted!
          </h2>
          <p
            style={{ color: "#4b7e4b", marginBottom: "2rem", lineHeight: 1.7 }}
          >
            Verification in Progress. Our team is reviewing your documents and
            payment.
          </p>
          <div
            style={{
              background: "#1a1a1a",
              borderRadius: 16,
              padding: "1.5rem",
              marginBottom: "2rem",
              border: "1px solid #2d2d2d",
            }}
          >
            <p
              style={{
                color: "#6b7280",
                fontSize: "0.8rem",
                marginBottom: "0.5rem",
              }}
            >
              ESTIMATED WAIT TIME
            </p>
            <div
              style={{
                fontSize: "3.5rem",
                fontWeight: 900,
                color: countdown > 0 ? "#fbbf24" : "#4ade80",
                letterSpacing: "0.05em",
                fontFamily: "monospace",
              }}
            >
              {formatTimer(countdown)}
            </div>
            <p
              style={{
                color: "#6b7280",
                fontSize: "0.82rem",
                marginTop: "0.5rem",
              }}
            >
              {countdown > 0 ? "Minutes remaining" : "Review in progress..."}
            </p>
          </div>
          <p
            style={{
              color: "#4b7e4b",
              fontSize: "0.88rem",
              marginBottom: "1.5rem",
              lineHeight: 1.6,
            }}
          >
            You will receive a notification once approved. You can then login as
            a driver.
          </p>
          <a
            href="https://wa.me/917836887228?text=Hi%2C%20I%20just%20registered%20as%20a%20DriveEase%20driver%20and%20need%20help"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              background: "#25D366",
              color: "white",
              padding: "0.65rem 1.5rem",
              borderRadius: 8,
              fontWeight: 600,
              textDecoration: "none",
              fontSize: "0.95rem",
            }}
          >
            💬 Contact Support on WhatsApp
          </a>
        </div>
      </div>
    );

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#1e1e1e",
    border: "1px solid #2d2d2d",
    borderRadius: 8,
    padding: "0.65rem 0.9rem",
    color: "#14532d",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    color: "#374151",
    fontSize: "0.85rem",
    display: "block",
    marginBottom: "0.35rem",
    fontWeight: 500,
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1
          style={{
            color: "#14532d",
            fontWeight: 800,
            fontSize: "1.75rem",
            marginBottom: "0.25rem",
          }}
        >
          Register as Driver
        </h1>
        <p style={{ color: "#4b7e4b", fontSize: "0.9rem" }}>
          Complete verification to start earning with DriveEase
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 9999,
              background: step >= s ? "#16a34a" : "#2d2d2d",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      <p
        style={{
          color: "#6b7280",
          fontSize: "0.82rem",
          marginBottom: "1.5rem",
        }}
      >
        Step {step} of 3 —{" "}
        {step === 1 ? "Personal Info" : step === 2 ? "Documents" : "Payment"}
      </p>

      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #2d2d2d",
          borderRadius: 16,
          padding: "2rem",
        }}
      >
        {/* STEP 1 */}
        {step === 1 && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            <div>
              <p style={labelStyle}>Full Name *</p>
              <input
                style={inputStyle}
                placeholder="Your full legal name"
                value={form.name}
                onChange={(e) => upd("name", e.target.value)}
              />
            </div>

            <div>
              <p style={labelStyle}>Phone Number *</p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="10-digit mobile"
                  value={form.phone}
                  onChange={(e) => {
                    upd(
                      "phone",
                      e.target.value.replace(/\D/g, "").slice(0, 10),
                    );
                    setOtpSent(false);
                    setOtpVerified(false);
                  }}
                />
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={otpVerified}
                  style={{
                    background: otpVerified ? "#14532d" : "#16a34a",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    padding: "0 1rem",
                    cursor: otpVerified ? "default" : "pointer",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  {otpVerified ? "✓ Verified" : "Send OTP"}
                </button>
              </div>
              {otpSent && !otpVerified && (
                <div
                  style={{
                    marginTop: "0.75rem",
                    background: "rgba(22,163,74,0.08)",
                    border: "1px solid rgba(22,163,74,0.2)",
                    borderRadius: 8,
                    padding: "0.75rem",
                  }}
                >
                  <p
                    style={{
                      color: "#4ade80",
                      fontSize: "0.82rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    📱 OTP sent! Your OTP:{" "}
                    <strong style={{ letterSpacing: "0.15em" }}>
                      {phoneOtp}
                    </strong>
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      style={{
                        ...inputStyle,
                        flex: 1,
                        letterSpacing: "0.3em",
                        textAlign: "center",
                      }}
                      placeholder="Enter OTP"
                      value={enteredOtp}
                      maxLength={6}
                      onChange={(e) =>
                        setEnteredOtp(
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={verifyOtp}
                      style={{
                        background: "#16a34a",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        padding: "0 1rem",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                      }}
                    >
                      Verify
                    </button>
                  </div>
                </div>
              )}
              {otpError && (
                <p
                  style={{
                    color: "#f87171",
                    fontSize: "0.82rem",
                    marginTop: "0.4rem",
                  }}
                >
                  {otpError}
                </p>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div>
                <p style={labelStyle}>City *</p>
                <input
                  style={inputStyle}
                  placeholder="e.g. Kanpur"
                  value={form.city}
                  onChange={(e) => upd("city", e.target.value)}
                />
              </div>
              <div>
                <p style={labelStyle}>State *</p>
                <select
                  style={inputStyle}
                  value={form.state}
                  onChange={(e) => upd("state", e.target.value)}
                >
                  {STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div>
                <p style={labelStyle}>Experience (Years)</p>
                <input
                  type="number"
                  style={inputStyle}
                  min={0}
                  max={50}
                  value={form.experience}
                  onChange={(e) => upd("experience", Number(e.target.value))}
                />
              </div>
              <div>
                <p style={labelStyle}>Vehicle Type</p>
                <select
                  style={inputStyle}
                  value={form.vehicleType}
                  onChange={(e) => upd("vehicleType", e.target.value)}
                >
                  {VEHICLE_TYPES.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <p style={labelStyle}>Languages Known (comma separated)</p>
              <input
                style={inputStyle}
                placeholder="Hindi, English, Punjabi"
                value={form.languages}
                onChange={(e) => upd("languages", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <p
              style={{
                color: "#4b7e4b",
                fontSize: "0.88rem",
                background: "rgba(22,163,74,0.08)",
                border: "1px solid rgba(22,163,74,0.2)",
                borderRadius: 8,
                padding: "0.75rem",
              }}
            >
              📋 Upload clear, readable photos of your documents. Max 5MB each.
            </p>

            {[
              { key: "dlDesc", label: "Driving License *", icon: "🪪" },
              { key: "aadharDesc", label: "Aadhaar Card *", icon: "📄" },
              { key: "selfieDesc", label: "Live Selfie *", icon: "🤳" },
            ].map(({ key, label, icon }) => (
              <div key={key}>
                <p style={labelStyle}>
                  {icon} {label}
                </p>
                <div
                  style={{
                    border: `2px dashed ${form[key as keyof typeof form] ? "#16a34a" : "#3a3a3a"}`,
                    borderRadius: 12,
                    padding: "1.25rem",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                    position: "relative",
                  }}
                >
                  {form[key as keyof typeof form] ? (
                    <div>
                      <img
                        src={form[key as keyof typeof form] as string}
                        alt="uploaded"
                        style={{
                          maxHeight: 120,
                          borderRadius: 8,
                          maxWidth: "100%",
                        }}
                      />
                      <p
                        style={{
                          color: "#4ade80",
                          fontSize: "0.82rem",
                          marginTop: "0.5rem",
                        }}
                      >
                        ✓ Uploaded
                      </p>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                        📁
                      </div>
                      <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                        Click to upload or drag & drop
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(key, e.target.files?.[0])}
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: 0,
                      cursor: "pointer",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <div
              style={{
                background: "rgba(22,163,74,0.08)",
                border: "1px solid rgba(22,163,74,0.3)",
                borderRadius: 12,
                padding: "1.25rem",
              }}
            >
              <h3
                style={{
                  color: "#4ade80",
                  fontWeight: 700,
                  marginBottom: "1rem",
                  fontSize: "1rem",
                }}
              >
                💳 Pay ₹150 Verification Fee
              </h3>
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
                  ["UPI", "7836887228 (PhonePe)"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0.35rem 0",
                      borderBottom: "1px solid #2a2a2a",
                    }}
                  >
                    <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                      {k}
                    </span>
                    <span
                      style={{
                        color: "#14532d",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                      }}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p style={labelStyle}>📸 Upload Payment Screenshot *</p>
              <div
                style={{
                  border: `2px dashed ${form.paymentScreenshot ? "#16a34a" : "#3a3a3a"}`,
                  borderRadius: 12,
                  padding: "1.25rem",
                  textAlign: "center",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                {form.paymentScreenshot ? (
                  <div>
                    <img
                      src={form.paymentScreenshot}
                      alt="payment"
                      style={{
                        maxHeight: 120,
                        borderRadius: 8,
                        maxWidth: "100%",
                      }}
                    />
                    <p
                      style={{
                        color: "#4ade80",
                        fontSize: "0.82rem",
                        marginTop: "0.5rem",
                      }}
                    >
                      ✓ Screenshot uploaded
                    </p>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                      📷
                    </div>
                    <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                      Upload screenshot of payment confirmation
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileUpload("paymentScreenshot", e.target.files?.[0])
                  }
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0,
                    cursor: "pointer",
                  }}
                />
              </div>
            </div>

            <div>
              <p style={labelStyle}>Payment Reference / Note (optional)</p>
              <input
                style={inputStyle}
                placeholder="Transaction ID or any reference"
                value={form.paymentRef}
                onChange={(e) => upd("paymentRef", e.target.value)}
              />
            </div>

            <div
              style={{
                background: "rgba(251,191,36,0.08)",
                border: "1px solid rgba(251,191,36,0.2)",
                borderRadius: 8,
                padding: "0.75rem",
                fontSize: "0.82rem",
                color: "#fbbf24",
              }}
            >
              ⚠️ After submitting, your registration will be reviewed within 30
              minutes. You will be able to login as a driver only after admin
              approval.
            </div>
          </div>
        )}

        {error && (
          <p
            style={{
              color: "#f87171",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 8,
              padding: "0.65rem",
              marginTop: "1rem",
              fontSize: "0.88rem",
            }}
          >
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              style={{
                flex: 1,
                background: "none",
                border: "1px solid #3a3a3a",
                color: "#4b7e4b",
                borderRadius: 8,
                padding: "0.75rem",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ← Back
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              style={{
                flex: 2,
                background: "#16a34a",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "0.75rem",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              style={{
                flex: 2,
                background: "#16a34a",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "0.75rem",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "1rem",
                boxShadow: "0 4px 0 #0d7a30",
              }}
            >
              🚀 Submit Registration
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

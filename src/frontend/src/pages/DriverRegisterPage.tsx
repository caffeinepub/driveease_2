import { useRef, useState } from "react";
import { type Registration, addRegistration, uid } from "../utils/store";
import { pushItem, sendSMS } from "../utils/syncService";

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

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DriverRegisterPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    state: "Delhi",
    experience: 1,
    dlFile: "",
    profilePhoto: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [displayOtp, setDisplayOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const dlRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const upd = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const sendOtp = () => {
    if (!form.phone || form.phone.length < 10) {
      setOtpError("Enter a valid 10-digit phone number");
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setDisplayOtp(otp);
    setOtpSent(true);
    setOtpError("");
  };

  const verifyOtp = () => {
    if (enteredOtp === generatedOtp) {
      setOtpVerified(true);
      setOtpError("");
    } else {
      setOtpError("Invalid OTP. Try again.");
    }
  };

  const handleFile = async (key: string, file: File | undefined) => {
    if (!file) return;
    try {
      const b64 = await fileToBase64(file);
      upd(key, b64);
    } catch {
      setError("File upload failed. Try a smaller file.");
    }
  };

  const submit = async () => {
    setError("");
    if (!form.name.trim()) {
      setError("Enter your full name");
      return;
    }
    if (!otpVerified) {
      setError("Please verify your phone number with OTP");
      return;
    }
    if (!form.city.trim()) {
      setError("Enter your city");
      return;
    }
    if (!form.dlFile) {
      setError("Please upload your Driving License");
      return;
    }

    const r: Registration = {
      id: uid(),
      name: form.name,
      phone: form.phone,
      city: form.city,
      state: form.state,
      experience: Number(form.experience),
      vehicleType: "Sedan",
      languages: "",
      aadharDesc: "",
      dlDesc: form.dlFile,
      selfieDesc: form.profilePhoto,
      paymentRef: "",
      paymentScreenshot: "",
      status: "pending",
      submittedAt: new Date().toISOString(),
    };

    // Save full data (including base64 files) to localStorage
    addRegistration(r);

    // Push only metadata to Firestore (no base64 blobs to avoid size limits)
    const firestoreData = {
      id: r.id,
      name: r.name,
      phone: r.phone,
      city: r.city,
      state: r.state,
      experience: r.experience,
      vehicleType: r.vehicleType,
      status: r.status,
      submittedAt: r.submittedAt,
      hasLicense: !!r.dlDesc,
      hasPhoto: !!r.selfieDesc,
    };
    await pushItem("registrations", firestoreData as unknown as { id: string });
    await sendSMS(
      form.phone,
      "Welcome to DriveEase! Your driver application is under review.",
    );
    setSubmitted(true);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#1e293b",
    borderRadius: 10,
    padding: "0.75rem 1rem",
    fontSize: "1rem",
    fontFamily: "'Poppins', sans-serif",
    outline: "none",
    boxSizing: "border-box",
  };

  if (submitted) {
    return (
      <div
        style={{
          maxWidth: 520,
          margin: "0 auto",
          padding: "3rem 1rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: "#f0fdf4",
            border: "2px solid #fecaca",
            borderRadius: 20,
            padding: "3rem 2rem",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
          <h2
            style={{
              color: "#8B0000",
              fontWeight: 800,
              fontSize: "1.5rem",
              marginBottom: "0.75rem",
            }}
          >
            Application Submitted!
          </h2>
          <p
            style={{ color: "#374151", lineHeight: 1.7, marginBottom: "2rem" }}
          >
            Our team is reviewing your documents. You'll be notified via SMS.
          </p>

          {/* Timeline */}
          <div style={{ textAlign: "left" }}>
            <h3
              style={{
                color: "#1e293b",
                fontSize: "0.95rem",
                fontWeight: 600,
                marginBottom: "1rem",
              }}
            >
              Application Status
            </h3>
            {[
              { label: "Submitted", done: true, icon: "✅" },
              { label: "Under Review", done: false, icon: "🔍" },
              { label: "Approved / Rejected", done: false, icon: "📋" },
            ].map((s, i) => (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  paddingBottom: i < 2 ? "0.75rem" : 0,
                  position: "relative",
                }}
              >
                {i < 2 && (
                  <div
                    style={{
                      position: "absolute",
                      left: 17,
                      top: 36,
                      width: 2,
                      height: 20,
                      background: "#e2e8f0",
                    }}
                  />
                )}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: s.done ? "#fff5f5" : "#f1f5f9",
                    border: `2px solid ${s.done ? "#8B0000" : "#e2e8f0"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                    flexShrink: 0,
                  }}
                >
                  {s.icon}
                </div>
                <div>
                  <div
                    style={{
                      color: s.done ? "#8B0000" : "#64748b",
                      fontWeight: s.done ? 600 : 400,
                      fontSize: "0.9rem",
                    }}
                  >
                    {s.label}
                  </div>
                  {s.done && (
                    <div style={{ color: "#8B0000", fontSize: "0.75rem" }}>
                      Pending Approval
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: "2rem 1rem",
        background: "#fff",
        minHeight: "100vh",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1
          style={{
            color: "#1e293b",
            fontWeight: 800,
            fontSize: "1.75rem",
            marginBottom: "0.5rem",
          }}
        >
          Become a Driver
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
          Join 1000+ verified drivers on DriveEase
        </p>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: "2rem",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        {error && (
          <div
            data-ocid="driver_register.error_state"
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 10,
              padding: "0.75rem 1rem",
              color: "#dc2626",
              marginBottom: "1.25rem",
              fontSize: "0.875rem",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {/* Full Name */}
          <div>
            <label
              htmlFor="_"
              style={{
                color: "#374151",
                fontSize: "0.85rem",
                fontWeight: 500,
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              Full Name *
            </label>
            <input
              data-ocid="driver_register.name_input"
              style={inputStyle}
              placeholder="Enter your full name"
              value={form.name}
              onChange={(e) => upd("name", e.target.value)}
            />
          </div>

          {/* Phone + OTP */}
          <div>
            <label
              htmlFor="_"
              style={{
                color: "#374151",
                fontSize: "0.85rem",
                fontWeight: 500,
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              Phone Number *
            </label>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <input
                data-ocid="driver_register.phone_input"
                style={{ ...inputStyle, flex: 1 }}
                placeholder="10-digit mobile number"
                value={form.phone}
                maxLength={10}
                onChange={(e) =>
                  upd("phone", e.target.value.replace(/\D/g, ""))
                }
              />
              {!otpVerified && (
                <button
                  type="button"
                  data-ocid="driver_register.send_otp_button"
                  onClick={sendOtp}
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #86efac",
                    color: "#8B0000",
                    borderRadius: 10,
                    padding: "0 1rem",
                    cursor: "pointer",
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    minHeight: 48,
                  }}
                >
                  {otpSent ? "Resend" : "Send OTP"}
                </button>
              )}
              {otpVerified && (
                <span
                  style={{
                    color: "#8B0000",
                    fontSize: "0.85rem",
                    alignSelf: "center",
                    whiteSpace: "nowrap",
                    fontWeight: 600,
                  }}
                >
                  ✓ Verified
                </span>
              )}
            </div>
            {otpSent && !otpVerified && (
              <div style={{ marginTop: "0.75rem" }}>
                {displayOtp && (
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#92400e",
                      background: "#fef9c3",
                      border: "1px solid #fde68a",
                      borderRadius: 8,
                      padding: "0.5rem 0.75rem",
                      marginBottom: "0.4rem",
                      fontWeight: 600,
                    }}
                  >
                    Demo OTP:{" "}
                    <strong
                      style={{ fontSize: "1.1rem", letterSpacing: "0.15em" }}
                    >
                      {displayOtp}
                    </strong>
                  </div>
                )}
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <input
                    data-ocid="driver_register.otp_input"
                    style={{
                      ...inputStyle,
                      flex: 1,
                      letterSpacing: "0.2em",
                      textAlign: "center",
                    }}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) =>
                      setEnteredOtp(e.target.value.replace(/\D/g, ""))
                    }
                  />
                  <button
                    type="button"
                    data-ocid="driver_register.verify_otp_button"
                    onClick={verifyOtp}
                    className="red-btn"
                    style={{ minHeight: 48 }}
                  >
                    Verify
                  </button>
                </div>
                {otpError && (
                  <div
                    style={{
                      color: "#dc2626",
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: 8,
                      padding: "0.4rem 0.75rem",
                      fontSize: "0.8rem",
                      marginTop: "0.4rem",
                    }}
                  >
                    {otpError}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DL Upload */}
          <div>
            <label
              htmlFor="_"
              style={{
                color: "#374151",
                fontSize: "0.85rem",
                fontWeight: 500,
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              Driving License *
            </label>
            <input
              ref={dlRef}
              type="file"
              accept=".jpg,.png,.pdf"
              style={{ display: "none" }}
              onChange={(e) => handleFile("dlFile", e.target.files?.[0])}
            />
            <button
              type="button"
              data-ocid="driver_register.dl_upload_button"
              onClick={() => dlRef.current?.click()}
              style={{
                width: "100%",
                background: form.dlFile ? "#f0fdf4" : "#f8fafc",
                border: `2px dashed ${form.dlFile ? "#8B0000" : "#e2e8f0"}`,
                borderRadius: 10,
                padding: "1.25rem",
                cursor: "pointer",
                color: form.dlFile ? "#8B0000" : "#64748b",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "0.875rem",
                textAlign: "center",
                minHeight: 64,
              }}
            >
              {form.dlFile
                ? "✅ License uploaded"
                : "📄 Upload Driving License (.jpg, .png, .pdf)"}
            </button>
          </div>

          {/* Experience */}
          <div>
            <label
              htmlFor="_"
              style={{
                color: "#374151",
                fontSize: "0.85rem",
                fontWeight: 500,
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              Driving Experience (years)
            </label>
            <input
              data-ocid="driver_register.experience_input"
              type="number"
              min="0"
              max="50"
              style={inputStyle}
              value={form.experience}
              onChange={(e) => upd("experience", Number(e.target.value))}
            />
          </div>

          {/* City + State */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            <div>
              <label
                htmlFor="_"
                style={{
                  color: "#374151",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                City *
              </label>
              <input
                data-ocid="driver_register.city_input"
                style={inputStyle}
                placeholder="e.g. Delhi"
                value={form.city}
                onChange={(e) => upd("city", e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="_"
                style={{
                  color: "#374151",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                State
              </label>
              <select
                data-ocid="driver_register.state_select"
                style={{ ...inputStyle, cursor: "pointer" }}
                value={form.state}
                onChange={(e) => upd("state", e.target.value)}
              >
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Profile Photo */}
          <div>
            <label
              htmlFor="_"
              style={{
                color: "#374151",
                fontSize: "0.85rem",
                fontWeight: 500,
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              Profile Photo
            </label>
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleFile("profilePhoto", e.target.files?.[0])}
            />
            <button
              type="button"
              data-ocid="driver_register.photo_upload_button"
              onClick={() => photoRef.current?.click()}
              style={{
                width: "100%",
                background: form.profilePhoto ? "#f0fdf4" : "#f8fafc",
                border: `2px dashed ${form.profilePhoto ? "#8B0000" : "#e2e8f0"}`,
                borderRadius: 10,
                padding: "1.25rem",
                cursor: "pointer",
                color: form.profilePhoto ? "#8B0000" : "#64748b",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "0.875rem",
                textAlign: "center",
                minHeight: 64,
              }}
            >
              {form.profilePhoto
                ? "✅ Photo uploaded"
                : "📸 Upload Profile Photo"}
            </button>
          </div>

          <button
            type="button"
            data-ocid="driver_register.submit_button"
            onClick={submit}
            className="red-btn"
            style={{
              width: "100%",
              justifyContent: "center",
              minHeight: 52,
              fontSize: "1rem",
              marginTop: "0.5rem",
            }}
          >
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
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

const EARN_STATS = [
  { icon: "💰", label: "Avg Monthly Earnings", value: "₹35,000+" },
  { icon: "⭐", label: "Verified Drivers", value: "1000+" },
  { icon: "🚗", label: "Cities Active", value: "50+" },
  { icon: "🎯", label: "Rides Completed", value: "10,000+" },
];

const BENEFITS = [
  {
    icon: "💵",
    title: "Earn Daily",
    desc: "Get paid for every ride, same day settlement",
  },
  {
    icon: "🛡️",
    title: "Safe Platform",
    desc: "Police verified, insured rides for your safety",
  },
  {
    icon: "📅",
    title: "Flexible Hours",
    desc: "Work when you want, take breaks anytime",
  },
  {
    icon: "📈",
    title: "Grow Income",
    desc: "Bonuses for top drivers every week",
  },
];

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Star particle type
type Star = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  color: string;
};

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = ["#FF6B6B", "#42A5F5", "#FFCA28", "#66BB6A", "#fff"];
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    starsRef.current = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.4 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of starsRef.current) {
        ctx.save();
        ctx.globalAlpha = s.opacity;
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        s.y -= s.speed;
        s.opacity += Math.sin(Date.now() / 800 + s.x) * 0.005;
        s.opacity = Math.max(0.1, Math.min(0.9, s.opacity));
        if (s.y < -10) {
          s.y = canvas.height + 10;
          s.x = Math.random() * canvas.width;
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
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
      upd(key, await fileToBase64(file));
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
    addRegistration(r);
    await pushItem("registrations", {
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
    } as unknown as { id: string });
    await sendSMS(
      form.phone,
      "Welcome to DriveEase! Your driver application is under review.",
    );
    setSubmitted(true);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.85)",
    border: "1.5px solid rgba(255,255,255,0.6)",
    color: "#1e293b",
    borderRadius: 12,
    padding: "0.75rem 1rem",
    fontSize: "1rem",
    fontFamily: "'Poppins', sans-serif",
    outline: "none",
    boxSizing: "border-box",
    backdropFilter: "blur(8px)",
  };

  if (submitted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #fff5f5 0%, #eff6ff 35%, #fffbeb 65%, #f0fdf4 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1rem",
        }}
      >
        <StarField />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 520,
            width: "100%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(16px)",
              borderRadius: 24,
              padding: "3rem 2rem",
              border: "1.5px solid rgba(255,255,255,0.8)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                margin: "0 auto 1.5rem",
                background: "linear-gradient(135deg, #66BB6A, #42A5F5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.2rem",
                boxShadow: "0 8px 24px rgba(102,187,106,0.35)",
              }}
            >
              ✅
            </div>
            <h2
              style={{
                fontFamily: "'Orbitron', monospace",
                background:
                  "linear-gradient(135deg, #FF6B6B 0%, #42A5F5 40%, #FFCA28 70%, #66BB6A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontWeight: 800,
                fontSize: "1.6rem",
                marginBottom: "0.75rem",
              }}
            >
              Application Submitted!
            </h2>
            <p
              style={{
                color: "#475569",
                lineHeight: 1.7,
                marginBottom: "2rem",
              }}
            >
              Our team is reviewing your documents. You'll be notified via SMS
              within 24 hours.
            </p>
            <div style={{ textAlign: "left" }}>
              {[
                { label: "Submitted", done: true, icon: "✅" },
                { label: "Under Review", done: false, icon: "🔍" },
                { label: "Approved", done: false, icon: "🏆" },
              ].map((s, i) => (
                <div
                  key={s.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    paddingBottom: i < 2 ? "1rem" : 0,
                    position: "relative",
                  }}
                >
                  {i < 2 && (
                    <div
                      style={{
                        position: "absolute",
                        left: 17,
                        top: 40,
                        width: 2,
                        height: 24,
                        background: "linear-gradient(#42A5F5,#66BB6A)",
                      }}
                    />
                  )}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: s.done
                        ? "linear-gradient(135deg,#FF6B6B,#FFCA28)"
                        : "#f1f5f9",
                      border: `2px solid ${s.done ? "#FF6B6B" : "#e2e8f0"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1rem",
                      flexShrink: 0,
                    }}
                  >
                    {s.icon}
                  </div>
                  <div
                    style={{
                      color: s.done ? "#1e293b" : "#94a3b8",
                      fontWeight: s.done ? 600 : 400,
                      fontSize: "0.9rem",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #fff5f5 0%, #eff6ff 35%, #fffbeb 65%, #f0fdf4 100%)",
      }}
    >
      <StarField />

      {/* Soft color blobs */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,107,107,0.09) 0%, transparent 70%)",
          top: "-5%",
          left: "-10%",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(66,165,245,0.09) 0%, transparent 70%)",
          top: "10%",
          right: "-8%",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,202,40,0.09) 0%, transparent 70%)",
          bottom: "5%",
          left: "10%",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(102,187,106,0.08) 0%, transparent 70%)",
          bottom: "10%",
          right: "8%",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 660,
          margin: "0 auto",
          padding: "2rem 1rem 4rem",
        }}
      >
        {/* Hero section */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "2.5rem",
            paddingTop: "1rem",
          }}
        >
          {/* Earn logo */}
          <div
            style={{
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(16px)",
              borderRadius: 24,
              padding: "1.5rem 2.5rem",
              border: "1.5px solid rgba(255,255,255,0.8)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.08)",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                marginBottom: "0.75rem",
                background:
                  "linear-gradient(135deg, #FF6B6B, #42A5F5, #FFCA28, #66BB6A)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                boxShadow: "0 8px 28px rgba(255,107,107,0.3)",
                animation: "pulseGlow 2.5s ease-in-out infinite",
              }}
            >
              🚗
            </div>
            <div
              style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: "clamp(1.6rem,5vw,2.2rem)",
                fontWeight: 800,
                background:
                  "linear-gradient(135deg, #FF6B6B 0%, #42A5F5 35%, #FFCA28 65%, #66BB6A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "0.05em",
                lineHeight: 1.1,
              }}
            >
              DriveEase
            </div>
            <div
              style={{
                color: "#64748b",
                fontSize: "0.75rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                marginTop: "0.3rem",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
              }}
            >
              Driver Partner Program
            </div>
          </div>

          <h1
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.6rem,5vw,2.2rem)",
              color: "#1e293b",
              marginBottom: "0.5rem",
              lineHeight: 1.2,
            }}
          >
            Become a Driver &amp;{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #FF6B6B, #FFCA28)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Start Earning Today
            </span>
          </h1>
          <p
            style={{
              color: "#64748b",
              fontSize: "1rem",
              fontFamily: "'Poppins',sans-serif",
            }}
          >
            Join 1000+ verified drivers across India and earn ₹35,000+ per month
          </p>
        </div>

        {/* Earning stats strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))",
            gap: "0.75rem",
            marginBottom: "2rem",
          }}
        >
          {EARN_STATS.map((s, i) => {
            const gradients = [
              "linear-gradient(135deg,#FF6B6B,#FF8E53)",
              "linear-gradient(135deg,#FFCA28,#FFB300)",
              "linear-gradient(135deg,#42A5F5,#1976D2)",
              "linear-gradient(135deg,#66BB6A,#388E3C)",
            ];
            return (
              <div
                key={s.label}
                style={{
                  background: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(12px)",
                  borderRadius: 16,
                  padding: "1rem 0.75rem",
                  textAlign: "center",
                  border: "1.5px solid rgba(255,255,255,0.8)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    margin: "0 auto 0.5rem",
                    background: gradients[i % 4],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.2rem",
                  }}
                >
                  {s.icon}
                </div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    color: "#1e293b",
                    fontFamily: "'Poppins',sans-serif",
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    color: "#64748b",
                    fontSize: "0.72rem",
                    fontFamily: "'Poppins',sans-serif",
                  }}
                >
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Benefits */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
            gap: "0.75rem",
            marginBottom: "2rem",
          }}
        >
          {BENEFITS.map((b, i) => {
            const colors = ["#FF6B6B", "#42A5F5", "#FFCA28", "#66BB6A"];
            return (
              <div
                key={b.title}
                style={{
                  background: "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(12px)",
                  borderRadius: 16,
                  padding: "1rem 1.25rem",
                  border: `1.5px solid ${colors[i]}33`,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `${colors[i]}22`,
                    border: `1.5px solid ${colors[i]}66`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                    flexShrink: 0,
                  }}
                >
                  {b.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: "#1e293b",
                      fontSize: "0.9rem",
                      fontFamily: "'Poppins',sans-serif",
                    }}
                  >
                    {b.title}
                  </div>
                  <div
                    style={{
                      color: "#64748b",
                      fontSize: "0.78rem",
                      marginTop: "0.2rem",
                      fontFamily: "'Poppins',sans-serif",
                    }}
                  >
                    {b.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Registration form */}
        <div
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(16px)",
            borderRadius: 24,
            padding: "2rem",
            border: "1.5px solid rgba(255,255,255,0.8)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg,#FF6B6B,#42A5F5,#FFCA28,#66BB6A)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
              }}
            >
              📋
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  color: "#1e293b",
                  fontFamily: "'Poppins',sans-serif",
                  fontSize: "1.1rem",
                }}
              >
                Driver Application
              </div>
              <div
                style={{
                  color: "#64748b",
                  fontSize: "0.8rem",
                  fontFamily: "'Poppins',sans-serif",
                }}
              >
                Fill in your details to get started
              </div>
            </div>
          </div>

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
                  fontWeight: 600,
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
                  fontWeight: 600,
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
                      background: "linear-gradient(135deg,#42A5F5,#1976D2)",
                      border: "none",
                      color: "#fff",
                      borderRadius: 12,
                      padding: "0 1rem",
                      cursor: "pointer",
                      fontFamily: "'Poppins',sans-serif",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      minHeight: 48,
                      boxShadow: "0 4px 12px rgba(66,165,245,0.35)",
                    }}
                  >
                    {otpSent ? "Resend" : "Send OTP"}
                  </button>
                )}
                {otpVerified && (
                  <span
                    style={{
                      color: "#66BB6A",
                      fontSize: "0.85rem",
                      alignSelf: "center",
                      whiteSpace: "nowrap",
                      fontWeight: 700,
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
                      style={{
                        background: "linear-gradient(135deg,#66BB6A,#388E3C)",
                        border: "none",
                        color: "#fff",
                        borderRadius: 12,
                        padding: "0 1.25rem",
                        cursor: "pointer",
                        fontFamily: "'Poppins',sans-serif",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        minHeight: 48,
                        boxShadow: "0 4px 12px rgba(102,187,106,0.35)",
                      }}
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
                  fontWeight: 600,
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
                  background: form.dlFile
                    ? "rgba(102,187,106,0.1)"
                    : "rgba(255,255,255,0.7)",
                  border: `2px dashed ${form.dlFile ? "#66BB6A" : "#cbd5e1"}`,
                  borderRadius: 12,
                  padding: "1.25rem",
                  cursor: "pointer",
                  color: form.dlFile ? "#388E3C" : "#64748b",
                  fontFamily: "'Poppins',sans-serif",
                  fontSize: "0.875rem",
                  textAlign: "center",
                  minHeight: 64,
                  fontWeight: 600,
                  backdropFilter: "blur(8px)",
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
                  fontWeight: 600,
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
                    fontWeight: 600,
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
                    fontWeight: 600,
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
                  fontWeight: 600,
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
                onChange={(e) =>
                  handleFile("profilePhoto", e.target.files?.[0])
                }
              />
              <button
                type="button"
                data-ocid="driver_register.photo_upload_button"
                onClick={() => photoRef.current?.click()}
                style={{
                  width: "100%",
                  background: form.profilePhoto
                    ? "rgba(66,165,245,0.1)"
                    : "rgba(255,255,255,0.7)",
                  border: `2px dashed ${form.profilePhoto ? "#42A5F5" : "#cbd5e1"}`,
                  borderRadius: 12,
                  padding: "1.25rem",
                  cursor: "pointer",
                  color: form.profilePhoto ? "#1976D2" : "#64748b",
                  fontFamily: "'Poppins',sans-serif",
                  fontSize: "0.875rem",
                  textAlign: "center",
                  minHeight: 64,
                  fontWeight: 600,
                  backdropFilter: "blur(8px)",
                }}
              >
                {form.profilePhoto
                  ? "✅ Photo uploaded"
                  : "📸 Upload Profile Photo"}
              </button>
            </div>

            {/* Submit */}
            <button
              type="button"
              data-ocid="driver_register.submit_button"
              onClick={submit}
              style={{
                width: "100%",
                minHeight: 56,
                fontSize: "1rem",
                fontWeight: 700,
                fontFamily: "'Poppins',sans-serif",
                cursor: "pointer",
                background:
                  "linear-gradient(135deg, #FF6B6B 0%, #42A5F5 40%, #FFCA28 70%, #66BB6A 100%)",
                border: "none",
                borderRadius: 16,
                color: "#fff",
                marginTop: "0.5rem",
                boxShadow: "0 8px 28px rgba(255,107,107,0.35)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              🚀 Submit Application &amp; Start Earning
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 8px 28px rgba(255,107,107,0.3); transform: scale(1); }
          50% { box-shadow: 0 12px 44px rgba(66,165,245,0.45), 0 4px 16px rgba(255,202,40,0.25); transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
}

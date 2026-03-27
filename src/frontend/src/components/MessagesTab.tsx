import { useState } from "react";

const TEMPLATES = [
  {
    name: "Booking Confirmed",
    text: "Dear [Customer Name], your driver booking with DriveEase has been confirmed! 🚗\nDriver: [Driver Name] | Vehicle: [Vehicle Type]\nPickup: [Time] | Fare: ₹[Amount]\nTrack live at driveease.app\n\nधन्यवाद DriveEase में आपका स्वागत है! 🙏",
  },
  {
    name: "Driver Assigned",
    text: "Hello [Name]! Your DriveEase driver is on the way. 🟢\nDriver: [Driver Name] | ETA: [X] mins\nOTP for ride start: [OTP] (share only with driver)\nNeed help? Call: 7836887228\n\nआपका ड्राइवर रास्ते में है। OTP: [OTP]",
  },
  {
    name: "Ride OTP Reminder",
    text: "DriveEase Ride OTP: [OTP] 🔐\nShare this 6-digit code with your driver to start the ride.\nDo NOT share with anyone else.\n\nOTP: [OTP] — केवल अपने ड्राइवर को बताएं।",
  },
  {
    name: "Plan Offer",
    text: "🌟 Special Offer from DriveEase!\nMonthly Driver Plan @ ₹24,000/month (8 hrs/day)\nIncludes: Verified Driver + Family Tracking + SOS Support\nBook now: driveease.app/plans\n\nसीमित ऑफर! अभी बुक करें।",
  },
  {
    name: "Registration Approved",
    text: "Congratulations [Driver Name]! ✅\nYour DriveEase driver account is approved.\nYou can now go online and start accepting rides.\nLogin: driveease.app/driver-login\n\nबधाई हो! आपका अकाउंट अप्रूव हो गया है।",
  },
  {
    name: "Support Follow-up",
    text: "Hi [Name], this is DriveEase support. 🙏\nWe noticed your recent enquiry. Our team will contact you within 2 hours.\nFor urgent help: WhatsApp 7836887228\n\nहम जल्द ही आपसे संपर्क करेंगे।",
  },
];

const STATES = [
  "Pan India",
  "Uttar Pradesh",
  "Delhi",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Gujarat",
  "Rajasthan",
  "West Bengal",
  "Madhya Pradesh",
];

function generateTemplate(prompt: string, state: string, type: string): string {
  const p = prompt.toLowerCase();
  let body = "";
  const region = state === "Pan India" ? "across India" : `in ${state}`;

  if (p.includes("expir")) {
    body =
      "Dear [Customer Name], 🔔\nYour DriveEase Monthly Plan expires in 3 days.\nRenew now and get 10% off — Offer valid till [Date].\nRenew: driveease.app/plans\n\nप्रिय ग्राहक, आपकी DriveEase मासिक योजना 3 दिनों में समाप्त हो रही है।\nअभी नवीनीकरण करें और 10% छूट पाएं — ऑफर सीमित समय के लिए।";
  } else if (p.includes("promo") || p.includes("offer")) {
    body = `🎉 Exclusive Offer for DriveEase customers ${region}!\n₹800/day for Hourly Driver (8 hrs) — Limited slots available.\nBook now: driveease.app | Call: 7836887228\n\nसीमित ऑफर! DriveEase के साथ किफायती ड्राइवर सेवा पाएं ${region}।\nअभी बुक करें।`;
  } else if (p.includes("driver") || p.includes("register")) {
    body = `Hi [Driver Name]! Welcome to DriveEase 🚗\nYour onboarding is in progress. Complete your KYC to start earning ${region}.\nUpload docs: driveease.app/register-driver\nSupport: 7836887228\n\nनमस्ते [Driver Name]! DriveEase में आपका स्वागत है।\nकृपया अपने दस्तावेज़ अपलोड करें और जल्द कमाई शुरू करें।`;
  } else {
    body = `Dear [Customer Name], 🙏\nThank you for reaching out to DriveEase ${region}.\nOur support team will assist you within 2 hours.\nFor urgent help: WhatsApp 7836887228 | driveease.app\n\nप्रिय ग्राहक, DriveEase सपोर्ट टीम जल्द आपसे संपर्क करेगी।\nधन्यवाद।`;
  }

  if (type === "SMS (160 chars)") {
    return body.split("\n")[0].slice(0, 160);
  }
  if (type === "Email Subject + Body") {
    return `Subject: DriveEase — Important Update for You\n\n${body}`;
  }
  return body;
}

function TemplateCard({ name, text }: { name: string; text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const preview = text.slice(0, 80);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      style={{
        background: "#1a1a1a",
        border: "1px solid #2d2d2d",
        borderRadius: 10,
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ color: "#f8fafc", fontWeight: 700, fontSize: "0.9rem" }}>
          {name}
        </span>
        <span
          style={{
            background: "#8B000022",
            border: "1px solid #8B000055",
            color: "#4ade80",
            fontSize: "0.7rem",
            borderRadius: 4,
            padding: "1px 6px",
          }}
        >
          EN+HI
        </span>
      </div>
      <p
        style={{
          color: "#9ca3af",
          fontSize: "0.78rem",
          margin: 0,
          whiteSpace: "pre-wrap",
          lineHeight: 1.5,
        }}
      >
        {expanded ? text : `${preview}${text.length > 80 ? "..." : ""}`}
      </p>
      {text.length > 80 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{
            background: "none",
            border: "none",
            color: "#60a5fa",
            cursor: "pointer",
            fontSize: "0.75rem",
            padding: 0,
            textAlign: "left",
          }}
        >
          {expanded ? "▲ Show less" : "▼ Show full"}
        </button>
      )}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={handleCopy}
          className="red-btn"
          style={{ fontSize: "0.78rem", padding: "0.3rem 0.7rem" }}
          data-ocid="messages.copy_button"
        >
          {copied ? "✅ Copied" : "📋 Copy"}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: "#075e54",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "0.3rem 0.7rem",
            fontSize: "0.78rem",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
          data-ocid="messages.whatsapp_button"
        >
          📲 Send via WhatsApp
        </a>
      </div>
    </div>
  );
}

export function MessagesTab() {
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiState, setAiState] = useState("" as "" | "loading" | "done");
  const [aiRegion, setAiRegion] = useState("Pan India");
  const [aiType, setAiType] = useState("WhatsApp");
  const [aiResult, setAiResult] = useState("");
  const [aiCopied, setAiCopied] = useState(false);

  const [customName, setCustomName] = useState("");
  const [customText, setCustomText] = useState("");
  const [saved, setSaved] = useState<{ name: string; text: string }[]>([]);

  const handleGenerate = () => {
    if (!aiPrompt.trim()) return;
    setAiState("loading");
    setAiResult("");
    setTimeout(() => {
      setAiResult(generateTemplate(aiPrompt, aiRegion, aiType));
      setAiState("done");
    }, 1500);
  };

  const handleSave = () => {
    if (!customName.trim() || !customText.trim()) return;
    setSaved((prev) => [...prev, { name: customName, text: customText }]);
    setCustomName("");
    setCustomText("");
  };

  const inputStyle = {
    background: "#111",
    border: "1px solid #2d2d2d",
    borderRadius: 7,
    color: "#f8fafc",
    padding: "0.5rem 0.75rem",
    fontSize: "0.82rem",
    width: "100%",
    boxSizing: "border-box" as const,
    outline: "none",
  };

  const sectionHead = (text: string) => (
    <h3
      style={{
        color: "#f8fafc",
        fontWeight: 700,
        fontSize: "1rem",
        margin: "0 0 0.25rem 0",
      }}
    >
      {text}
    </h3>
  );

  return (
    <div
      style={{ color: "#f8fafc", paddingBottom: "3rem" }}
      data-ocid="messages.panel"
    >
      {/* Header */}
      <h2
        style={{
          color: "#f8fafc",
          fontWeight: 700,
          fontSize: "1.15rem",
          marginBottom: "0.25rem",
        }}
      >
        ✉️ Message Templates — CX Communication Hub
      </h2>
      <p
        style={{
          color: "#6b7280",
          fontSize: "0.82rem",
          marginBottom: "1.75rem",
        }}
      >
        Create, customize, and send message templates to customers across pan
        India
      </p>

      {/* Pre-built Templates */}
      <div style={{ marginBottom: "2rem" }}>
        {sectionHead("📦 Pre-built Templates")}
        <p
          style={{
            color: "#6b7280",
            fontSize: "0.78rem",
            marginBottom: "1rem",
          }}
        >
          Bilingual (English + Hindi) ready-to-send templates
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "0.85rem",
          }}
        >
          {TEMPLATES.map((t) => (
            <TemplateCard key={t.name} name={t.name} text={t.text} />
          ))}
        </div>
      </div>

      {/* AI Generator */}
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #8B000044",
          borderRadius: 12,
          padding: "1.25rem",
          marginBottom: "2rem",
        }}
      >
        {sectionHead("🤖 AI Template Generator")}
        <p
          style={{
            color: "#6b7280",
            fontSize: "0.78rem",
            marginBottom: "1rem",
          }}
        >
          Describe what message you want to send — get a ready-to-use template
          in seconds
        </p>
        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="e.g. Remind customer their monthly plan is expiring in 3 days, offer renewal discount..."
          rows={3}
          style={{ ...inputStyle, marginBottom: "0.75rem", resize: "vertical" }}
          data-ocid="messages.textarea"
        />
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            marginBottom: "0.75rem",
          }}
        >
          <div style={{ flex: 1, minWidth: 160 }}>
            <label
              htmlFor="ai-region"
              style={{
                color: "#9ca3af",
                fontSize: "0.75rem",
                display: "block",
                marginBottom: 4,
              }}
            >
              State / Region
            </label>
            <select
              id="ai-region"
              value={aiRegion}
              onChange={(e) => setAiRegion(e.target.value)}
              style={inputStyle}
              data-ocid="messages.select"
            >
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label
              htmlFor="ai-type"
              style={{
                color: "#9ca3af",
                fontSize: "0.75rem",
                display: "block",
                marginBottom: 4,
              }}
            >
              Message Type
            </label>
            <select
              id="ai-type"
              value={aiType}
              onChange={(e) => setAiType(e.target.value)}
              style={inputStyle}
              data-ocid="messages.select"
            >
              {["WhatsApp", "SMS (160 chars)", "Email Subject + Body"].map(
                (t) => (
                  <option key={t}>{t}</option>
                ),
              )}
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          className="red-btn"
          disabled={aiState === "loading" || !aiPrompt.trim()}
          style={{
            opacity: aiState === "loading" || !aiPrompt.trim() ? 0.6 : 1,
          }}
          data-ocid="messages.primary_button"
        >
          {aiState === "loading" ? "⏳ Generating..." : "✦ Generate Template"}
        </button>

        {aiState === "loading" && (
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            data-ocid="messages.loading_state"
          >
            <div
              style={{
                width: 16,
                height: 16,
                border: "2px solid #8B000044",
                borderTop: "2px solid #8B0000",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>
              AI is crafting your bilingual template...
            </span>
          </div>
        )}

        {aiState === "done" && aiResult && (
          <div
            style={{
              marginTop: "1rem",
              background: "#111",
              border: "1px solid #8B000055",
              borderRadius: 8,
              padding: "0.85rem",
            }}
            data-ocid="messages.success_state"
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: "0.5rem",
              }}
            >
              <span
                style={{
                  color: "#4ade80",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                }}
              >
                ✦ Generated Template
              </span>
              <span
                style={{
                  background: "#8B000022",
                  border: "1px solid #8B000055",
                  color: "#4ade80",
                  fontSize: "0.68rem",
                  borderRadius: 4,
                  padding: "1px 5px",
                }}
              >
                EN+HI
              </span>
            </div>
            <p
              style={{
                color: "#d1fae5",
                fontSize: "0.8rem",
                whiteSpace: "pre-wrap",
                margin: "0 0 0.75rem 0",
                lineHeight: 1.55,
              }}
            >
              {aiResult}
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(aiResult);
                  setAiCopied(true);
                  setTimeout(() => setAiCopied(false), 1500);
                }}
                className="red-btn"
                style={{ fontSize: "0.78rem", padding: "0.3rem 0.7rem" }}
                data-ocid="messages.copy_button"
              >
                {aiCopied ? "✅ Copied" : "📋 Copy"}
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(aiResult)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#075e54",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "0.3rem 0.7rem",
                  fontSize: "0.78rem",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
                data-ocid="messages.whatsapp_button"
              >
                📲 Send via WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Custom Template Editor */}
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #2d2d2d",
          borderRadius: 12,
          padding: "1.25rem",
        }}
      >
        {sectionHead("📝 My Saved Templates")}
        <p
          style={{
            color: "#6b7280",
            fontSize: "0.78rem",
            marginBottom: "1rem",
          }}
        >
          Write and save your own custom templates
        </p>
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="Template name..."
          style={{ ...inputStyle, marginBottom: "0.5rem" }}
          data-ocid="messages.input"
        />
        <textarea
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Write your message template here..."
          rows={4}
          style={{ ...inputStyle, marginBottom: "0.75rem", resize: "vertical" }}
          data-ocid="messages.textarea"
        />
        <button
          type="button"
          onClick={handleSave}
          className="red-btn"
          disabled={!customName.trim() || !customText.trim()}
          style={{
            opacity: !customName.trim() || !customText.trim() ? 0.6 : 1,
          }}
          data-ocid="messages.save_button"
        >
          💾 Save Template
        </button>

        {saved.length === 0 ? (
          <p
            style={{
              color: "#4b5563",
              fontSize: "0.78rem",
              marginTop: "1rem",
              textAlign: "center",
            }}
            data-ocid="messages.empty_state"
          >
            No saved templates yet. Create one above.
          </p>
        ) : (
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.65rem",
            }}
          >
            {saved.map((t, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: keyed by name
                key={t.name + String(i)}
                style={{
                  background: "#111",
                  border: "1px solid #2d2d2d",
                  borderRadius: 8,
                  padding: "0.75rem",
                }}
                data-ocid={`messages.item.${i + 1}`}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.4rem",
                  }}
                >
                  <span
                    style={{
                      color: "#f8fafc",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    {t.name}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSaved((prev) => prev.filter((_, j) => j !== i))
                    }
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                      fontSize: "0.78rem",
                    }}
                    data-ocid={`messages.delete_button.${i + 1}`}
                  >
                    🗑 Delete
                  </button>
                </div>
                <p
                  style={{
                    color: "#9ca3af",
                    fontSize: "0.78rem",
                    margin: "0 0 0.5rem 0",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {t.text}
                </p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(t.text)}
                    className="red-btn"
                    style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
                    data-ocid={`messages.copy_button.${i + 1}`}
                  >
                    📋 Copy
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(t.text)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: "#075e54",
                      color: "#fff",
                      borderRadius: 6,
                      padding: "0.25rem 0.6rem",
                      fontSize: "0.75rem",
                      textDecoration: "none",
                    }}
                  >
                    📲 WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

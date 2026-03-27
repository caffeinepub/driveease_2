import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  time: string;
}

function getBotReply(msg: string): string {
  const m = msg.toLowerCase();
  if (/hello|hi|hey|namaste/.test(m))
    return "👋 Hello! Welcome to DriveEase. I'm here to help you with bookings, pricing, driver info, and more. What can I do for you today?";
  if (/book|booking/.test(m))
    return '📍 Booking is simple! Click "Book a Driver" on the homepage, enter your pickup and drop locations, see the fare estimate, and confirm. A verified driver will be assigned within minutes. You\'ll get a unique 6-digit OTP to start your ride.';
  if (/price|fare|cost|rate|charge/.test(m))
    return "💰 Our pricing is transparent: Base Fare ₹50 + ₹15/km + ₹2/min. Minimum fare: ₹120. Night surcharge (10 PM–6 AM): +20%. Example: a 10km, 30-min ride = ₹50 + ₹150 + ₹60 = ₹260.";
  if (/driver|register|registration|join/.test(m))
    return "🚗 Drivers can join in 3 easy steps: (1) Fill personal info & upload DL + Aadhaar, (2) Pay the ₹150 verification fee, (3) Wait ~30 minutes for admin approval. Once approved, you can go online and start accepting rides!";
  if (/otp|verify|verification/.test(m))
    return '🔐 Every ride has a unique 6-digit OTP. You\'ll see it on your "My Bookings" page. Share it ONLY with your driver when they arrive — they must enter it to start the ride. This ensures your safety.';
  if (/cancel|refund/.test(m))
    return "❌ You can cancel a booking before the driver arrives. If the driver has already arrived and you don't show up within 5 minutes, a no-show fee applies. Refunds are processed within 3–5 business days.";
  if (/plan|subscription|monthly|hourly/.test(m))
    return "📅 Our Plans:\n• Casual Booking: ₹800/day (8 hours)\n• Monthly Subscription: ₹24,000/month\nCoverage: 7 AM–9 PM, 8 hrs/day. Includes family tracking, SOS support, and senior care add-ons.";
  if (/insurance/.test(m))
    return "🛡️ DriveEase offers trip insurance for ₹49/ride. It covers accidents, damage, and medical emergencies during your trip. You can add it during booking checkout.";
  if (/payment|pay|upi|card|wallet/.test(m))
    return "💳 We accept UPI, Credit/Debit Cards, and Wallet payments. You can also choose postpaid (pay after the ride). All transactions are secured via Razorpay.";
  return "🤖 I can help you with bookings, pricing, driver registration, OTP security, plans, insurance, and payments. What would you like to know?";
}

function nowIST(): string {
  return new Date().toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "bot",
      text: "👋 Hi! I'm the DriveEase Assistant. Ask me about bookings, pricing, driver registration, or anything else!",
      time: nowIST(),
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = {
      id: `u${Date.now()}`,
      role: "user",
      text,
      time: nowIST(),
    };
    const botMsg: Message = {
      id: `b${Date.now()}`,
      role: "bot",
      text: getBotReply(text),
      time: nowIST(),
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        data-ocid="chatbot.open_modal_button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open DriveEase chatbot"
        style={{
          position: "fixed",
          bottom: "5.5rem",
          right: "1.5rem",
          zIndex: 1000,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #FF6B6B, #42A5F5, #66BB6A)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          boxShadow: "0 4px 20px rgba(66,165,245,0.4)",
          animation: "chatbot-ring 2s ease-in-out infinite",
        }}
      >
        🤖
      </button>

      {/* Chat panel */}
      {open && (
        <div
          data-ocid="chatbot.dialog"
          style={{
            position: "fixed",
            bottom: "7.5rem",
            right: "1.5rem",
            zIndex: 1001,
            width: "min(400px, calc(100vw - 2rem))",
            height: 500,
            background: "rgba(15,23,42,0.97)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(66,165,245,0.25)",
            borderRadius: 20,
            display: "flex",
            flexDirection: "column",
            boxShadow:
              "0 0 40px rgba(66,165,245,0.12), 0 20px 60px rgba(0,0,0,0.5)",
            overflow: "hidden",
            animation: "slideUpIn 0.25s ease-out",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "0.9rem 1rem",
              borderBottom: "1px solid rgba(66,165,245,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background:
                "linear-gradient(90deg, rgba(255,107,107,0.08), rgba(66,165,245,0.08), rgba(102,187,106,0.08))",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#66BB6A",
                  boxShadow: "0 0 8px #66BB6A",
                  animation: "glow-pulse 1.5s ease-in-out infinite",
                }}
              />
              <span
                style={{
                  color: "#f8fafc",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                }}
              >
                DriveEase Assistant
              </span>
            </div>
            <button
              type="button"
              data-ocid="chatbot.close_button"
              onClick={() => setOpen(false)}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                borderRadius: 6,
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.9rem",
                fontWeight: 700,
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "0.75rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "0.55rem 0.85rem",
                    borderRadius:
                      msg.role === "user"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, #42A5F5, #66BB6A)"
                        : "rgba(40,40,40,0.9)",
                    border:
                      msg.role === "user"
                        ? "none"
                        : "1px solid rgba(255,255,255,0.08)",
                    color: "#f8fafc",
                    fontSize: "0.87rem",
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.text}
                </div>
                <span
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.7rem",
                    marginTop: "0.2rem",
                  }}
                >
                  {msg.time}
                </span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "0.7rem",
              borderTop: "1px solid rgba(66,165,245,0.12)",
              display: "flex",
              gap: "0.5rem",
            }}
          >
            <input
              data-ocid="chatbot.input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about bookings, pricing..."
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(66,165,245,0.2)",
                borderRadius: 10,
                color: "#f8fafc",
                padding: "0.5rem 0.75rem",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
            <button
              type="button"
              data-ocid="chatbot.submit_button"
              onClick={send}
              style={{
                background: "linear-gradient(135deg, #42A5F5, #66BB6A)",
                border: "none",
                borderRadius: 10,
                color: "white",
                padding: "0.5rem 0.9rem",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.85rem",
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}

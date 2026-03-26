import { useEffect, useRef, useState } from "react";
import {
  type CallRecording,
  type CallbackRequest,
  type CommentEntry,
  type CustomerNote,
  type StaffCallLog,
  addCommentEntry,
  getBookings,
  getCallRecordings,
  getCallbackRequests,
  getCommentHistory,
  getCustomerNote,
  getEnquiries,
  getStaffCallLogs,
  getSubEnquiries,
  saveCallRecording,
  saveCustomerNote,
  saveStaffCallLog,
  uid,
  updateCallbackRequest,
} from "../utils/store";
import { pullAllAndMerge, pushItem } from "../utils/syncService";

interface Executive {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

function getExecs(): Executive[] {
  try {
    return JSON.parse(localStorage.getItem("de_executives") || "[]");
  } catch {
    return [];
  }
}

interface CustomerProfile {
  name: string;
  phone: string;
  bookingsCount: number;
  enquiriesCount: number;
}

function searchCustomer(phone: string): CustomerProfile | null {
  const q = phone.trim().replace(/\s/g, "");
  if (!q) return null;
  const bookings = getBookings().filter(
    (b) => b.customerPhone === q || b.customerPhone?.includes(q),
  );
  const enqs = getEnquiries().filter(
    (e) => e.phone === q || e.phone?.includes(q),
  );
  const subEnqs = getSubEnquiries().filter(
    (e) => e.phone === q || e.phone?.includes(q),
  );
  if (bookings.length === 0 && enqs.length === 0 && subEnqs.length === 0)
    return null;
  const nameFromBooking = bookings[0]?.customerName || "";
  const nameFromEnq = enqs[0]?.name || subEnqs[0]?.name || "";
  return {
    name: nameFromBooking || nameFromEnq || "Unknown Customer",
    phone: q,
    bookingsCount: bookings.length,
    enquiriesCount: enqs.length + subEnqs.length,
  };
}

const TAG_COLORS: Record<string, string> = {
  "follow-up": "#f59e0b",
  "hot-lead": "#ef4444",
  complaint: "#8b5cf6",
  vip: "#22c55e",
  "": "#64748b",
};

const S = {
  root: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "'Poppins', sans-serif",
    background: "#0f172a",
    color: "#e2e8f0",
  } as React.CSSProperties,
  sidebar: {
    width: 220,
    minHeight: "100vh",
    background: "#020617",
    borderRight: "1px solid #1e293b",
    display: "flex",
    flexDirection: "column" as const,
    padding: "1rem 0",
    flexShrink: 0,
  } as React.CSSProperties,
  logo: {
    padding: "0.75rem 1.25rem 1.25rem",
    borderBottom: "1px solid #1e293b",
    marginBottom: "0.75rem",
  } as React.CSSProperties,
  logoText: {
    color: "#22c55e",
    fontWeight: 800,
    fontSize: "1rem",
    letterSpacing: "0.02em",
  } as React.CSSProperties,
  logoSub: {
    color: "#475569",
    fontSize: "0.72rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
  } as React.CSSProperties,
  navBtn: (active: boolean) =>
    ({
      display: "flex",
      alignItems: "center",
      gap: "0.6rem",
      padding: "0.65rem 1.25rem",
      background: active ? "rgba(34,197,94,0.12)" : "transparent",
      border: "none",
      color: active ? "#22c55e" : "#94a3b8",
      fontWeight: active ? 700 : 400,
      fontSize: "0.88rem",
      cursor: "pointer",
      width: "100%",
      textAlign: "left" as const,
      borderLeft: active ? "3px solid #22c55e" : "3px solid transparent",
      transition: "all 0.15s",
    }) as React.CSSProperties,
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
  } as React.CSSProperties,
  topbar: {
    background: "#0f172a",
    borderBottom: "1px solid #1e293b",
    padding: "0.85rem 1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  } as React.CSSProperties,
  main: {
    flex: 1,
    padding: "1.5rem",
    overflowY: "auto" as const,
  } as React.CSSProperties,
  card: {
    background: "#1e293b",
    borderRadius: 12,
    padding: "1.25rem",
    border: "1px solid #334155",
  } as React.CSSProperties,
  statCard: {
    background: "#1e293b",
    borderRadius: 10,
    padding: "1rem 1.25rem",
    border: "1px solid #334155",
    flex: 1,
  } as React.CSSProperties,
  input: {
    background: "#0f172a",
    border: "1px solid #334155",
    color: "#e2e8f0",
    borderRadius: 8,
    padding: "0.6rem 0.9rem",
    fontSize: "0.9rem",
    width: "100%",
    outline: "none",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
  textarea: {
    background: "#0f172a",
    border: "1px solid #334155",
    color: "#e2e8f0",
    borderRadius: 8,
    padding: "0.6rem 0.9rem",
    fontSize: "0.88rem",
    width: "100%",
    outline: "none",
    resize: "vertical" as const,
    minHeight: 70,
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
  btnGreen: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: 7,
    padding: "0.55rem 1.1rem",
    fontSize: "0.88rem",
    fontWeight: 600,
    cursor: "pointer",
  } as React.CSSProperties,
  btnOutline: {
    background: "transparent",
    color: "#94a3b8",
    border: "1px solid #334155",
    borderRadius: 7,
    padding: "0.5rem 1rem",
    fontSize: "0.85rem",
    cursor: "pointer",
  } as React.CSSProperties,
  tab: (active: boolean) =>
    ({
      padding: "0.4rem 0.9rem",
      borderRadius: 20,
      border: "none",
      background: active ? "#22c55e" : "#334155",
      color: active ? "#000" : "#94a3b8",
      fontWeight: active ? 700 : 400,
      fontSize: "0.82rem",
      cursor: "pointer",
      transition: "all 0.15s",
    }) as React.CSSProperties,
};

// ──────────────────────────────────────────────────────────────────────────────
// Login Screen
// ──────────────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (exec: Executive) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const execs = getExecs();
    const exec = execs.find(
      (e) => e.email === email && e.password === password,
    );
    if (!exec) {
      setError("Invalid email or password");
      return;
    }
    sessionStorage.setItem("de_staff_crm_auth", JSON.stringify(exec));
    onLogin(exec);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        style={{
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 16,
          padding: "2.5rem 2rem",
          width: "100%",
          maxWidth: 380,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              color: "#22c55e",
              fontSize: "2rem",
              fontWeight: 800,
              marginBottom: "0.25rem",
            }}
          >
            🎧 DriveEase CRM
          </div>
          <div style={{ color: "#64748b", fontSize: "0.85rem" }}>
            Staff Portal Login
          </div>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="staff-email"
            style={{
              color: "#94a3b8",
              fontSize: "0.82rem",
              display: "block",
              marginBottom: "0.35rem",
            }}
          >
            Email
          </label>
          <input
            id="staff-email"
            data-ocid="staff.input"
            style={S.input}
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: "1.25rem" }}>
          <label
            htmlFor="staff-password"
            style={{
              color: "#94a3b8",
              fontSize: "0.82rem",
              display: "block",
              marginBottom: "0.35rem",
            }}
          >
            Password
          </label>
          <input
            id="staff-password"
            data-ocid="staff.input"
            style={S.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>
        {error && (
          <p
            data-ocid="staff.error_state"
            style={{
              color: "#ef4444",
              fontSize: "0.82rem",
              marginBottom: "1rem",
            }}
          >
            {error}
          </p>
        )}
        <button
          data-ocid="staff.submit_button"
          type="button"
          onClick={handleLogin}
          style={{
            ...S.btnGreen,
            width: "100%",
            padding: "0.7rem",
            fontSize: "0.95rem",
          }}
        >
          Login to CRM
        </button>
        <p
          style={{
            color: "#475569",
            fontSize: "0.78rem",
            textAlign: "center",
            marginTop: "1rem",
          }}
        >
          Access managed by DriveEase Admin
        </p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Call Modal
// ──────────────────────────────────────────────────────────────────────────────
function CallModal({
  customer,
  staffName,
  staffEmail,
  onClose,
}: {
  customer: CustomerProfile;
  staffName: string;
  staffEmail: string;
  onClose: () => void;
}) {
  const [callActive, setCallActive] = useState(false);
  const [held, setHeld] = useState(false);
  const [muted, setMuted] = useState(false);
  const [secs, setSecs] = useState(0);
  const [notes, setNotes] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCall = () => {
    // Free calling via device (tel: protocol) - no API cost
    const cleaned = customer.phone.replace(/\D/g, "");
    const dialNum = cleaned.startsWith("91") ? cleaned : `91${cleaned}`;
    window.open(`tel:+${dialNum}`, "_self");
    setCallActive(true);
    timerRef.current = setInterval(() => setSecs((s) => s + 1), 1000);
  };

  const endCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const rec: CallRecording = {
      id: uid(),
      staffName,
      customerName: customer.name,
      customerPhone: customer.phone,
      recordedAt: new Date().toISOString(),
      durationSecs: secs,
      notes,
    };
    saveCallRecording(rec);
    pushItem("call_recordings", rec as unknown as { id: string });
    // Also save to staff call logs for activity tracking
    const callLog: StaffCallLog = {
      id: uid(),
      staffName,
      staffEmail,
      customerPhone: customer.phone,
      customerName: customer.name,
      callType: "manual-dial",
      duration: secs,
      timestamp: new Date().toISOString(),
      disposition: "completed",
      notes,
    };
    saveStaffCallLog(callLog);
    if (notes.trim())
      addCommentEntry(customer.phone, staffName, `[Call Note] ${notes}`);
    onClose();
  };

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        data-ocid="staff.modal"
        style={{
          background: "#1e293b",
          borderRadius: 16,
          padding: "2rem",
          width: "100%",
          maxWidth: 380,
          border: "1px solid #334155",
        }}
      >
        <h3
          style={{ color: "#e2e8f0", fontWeight: 700, marginBottom: "0.5rem" }}
        >
          📞 {customer.name}
        </h3>
        <p
          style={{
            color: "#64748b",
            fontSize: "0.88rem",
            marginBottom: "1.25rem",
          }}
        >
          {customer.phone}
        </p>

        <div
          style={{
            background: "#0f172a",
            borderRadius: 10,
            padding: "1rem",
            textAlign: "center",
            marginBottom: "1.25rem",
          }}
        >
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: callActive ? "#22c55e" : "#475569",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {mm}:{ss}
          </div>
          {callActive && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                marginTop: "0.5rem",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#ef4444",
                  display: "inline-block",
                  animation: "pulse 1s infinite",
                }}
              />
              <span
                style={{
                  color: "#ef4444",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                }}
              >
                REC
              </span>
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          {!callActive ? (
            <button
              data-ocid="staff.primary_button"
              type="button"
              onClick={startCall}
              style={{ ...S.btnGreen, flex: 1, padding: "0.65rem" }}
            >
              📞 Start Call
            </button>
          ) : (
            <>
              <button
                data-ocid="staff.toggle"
                type="button"
                onClick={() => setHeld(!held)}
                style={{
                  flex: 1,
                  border: "none",
                  borderRadius: 7,
                  padding: "0.6rem",
                  background: held ? "#f59e0b" : "#334155",
                  color: held ? "#000" : "#e2e8f0",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                {held ? "▶ Resume" : "⏸ Hold"}
              </button>
              <button
                data-ocid="staff.toggle"
                type="button"
                onClick={() => setMuted(!muted)}
                style={{
                  flex: 1,
                  border: "none",
                  borderRadius: 7,
                  padding: "0.6rem",
                  background: muted ? "#ef4444" : "#334155",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                {muted ? "🔇 Muted" : "🎤 Mute"}
              </button>
            </>
          )}
        </div>

        <textarea
          data-ocid="staff.textarea"
          style={{ ...S.textarea, marginBottom: "1rem" }}
          placeholder="Call notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div style={{ display: "flex", gap: "0.5rem" }}>
          {callActive && (
            <button
              data-ocid="staff.delete_button"
              type="button"
              onClick={endCall}
              style={{
                flex: 1,
                background: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: 7,
                padding: "0.65rem",
                fontWeight: 600,
                fontSize: "0.88rem",
                cursor: "pointer",
              }}
            >
              📴 End & Save
            </button>
          )}
          <button
            data-ocid="staff.cancel_button"
            type="button"
            onClick={onClose}
            style={{ ...S.btnOutline, flex: callActive ? undefined : 1 }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main CRM Page
// ──────────────────────────────────────────────────────────────────────────────
export default function StaffCRMPage() {
  const [exec, setExec] = useState<Executive | null>(() => {
    try {
      const s = sessionStorage.getItem("de_staff_crm_auth");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "search" | "calls" | "callbacks"
  >("search");
  const [searchPhone, setSearchPhone] = useState("");
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [customerTab, setCustomerTab] = useState<
    "comments" | "bookings" | "enquiries" | "calls"
  >("comments");
  const [comments, setComments] = useState<CommentEntry[]>([]);
  const [customerNote, setCustomerNote] = useState<CustomerNote | null>(null);
  const [newComment, setNewComment] = useState("");
  const [noteTag, setNoteTag] = useState("");
  const [noteText, setNoteText] = useState("");
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>([]);
  const [staffStatus, setStaffStatus] = useState<"available" | "busy">(
    "available",
  );
  const [staffCallLogs, setStaffCallLogs] = useState<StaffCallLog[]>([]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional refresh on tab change
  useEffect(() => {
    setRecordings(getCallRecordings());
    setCallbacks(getCallbackRequests());
    setStaffCallLogs(
      getStaffCallLogs().filter((l) => l.staffEmail === exec?.email),
    );
  }, [activeTab, exec?.email]);

  const doSearch = () => {
    const found = searchCustomer(searchPhone);
    setCustomer(found);
    setNotFound(!found);
    if (found) {
      setComments(getCommentHistory(found.phone));
      const cn = getCustomerNote(found.phone);
      setCustomerNote(cn);
      setNoteTag(cn?.tag || "");
      setNoteText(cn?.notes || "");
    }
  };

  const saveComment = () => {
    if (!newComment.trim() || !customer || !exec) return;
    addCommentEntry(customer.phone, exec.name, newComment.trim());
    pushItem("comment_history", {
      id: Date.now().toString(),
      recordId: customer.phone,
      text: newComment.trim(),
      staffName: exec.name,
      createdAt: new Date().toISOString(),
    } as unknown as { id: string });
    setComments(getCommentHistory(customer.phone));
    setNewComment("");
  };

  const saveNote = () => {
    if (!customer || !exec) return;
    const n: CustomerNote = {
      id: customerNote?.id || uid(),
      phone: customer.phone,
      staffName: exec.name,
      tag: noteTag,
      notes: noteText,
      updatedAt: new Date().toISOString(),
    };
    saveCustomerNote(n);
    setCustomerNote(n);
  };

  if (!exec) return <LoginScreen onLogin={setExec} />;

  const myRecordings = recordings.filter((r) => r.staffName === exec.name);
  const pendingCallbacks = callbacks.filter((c) => c.status === "pending");

  const _todayCalls = myRecordings.filter((r) => {
    const d = new Date(r.recordedAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  return (
    <div style={S.root}>
      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={S.logo}>
          <div style={S.logoText}>🎧 DriveEase</div>
          <div style={S.logoSub}>CRM Portal</div>
        </div>

        {(
          [
            ["dashboard", "📊", "Dashboard"],
            ["search", "🔍", "Search Customer"],
            ["calls", "📞", "My Calls"],
            [
              "callbacks",
              "🔔",
              `Callbacks${pendingCallbacks.length > 0 ? ` (${pendingCallbacks.length})` : ""}`,
            ],
          ] as const
        ).map(([tab, icon, label]) => (
          <button
            key={tab}
            data-ocid={`staff.${tab}.tab`}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={S.navBtn(activeTab === tab)}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}

        <div style={{ flex: 1 }} />
        <div
          style={{ padding: "1rem 1.25rem", borderTop: "1px solid #1e293b" }}
        >
          <div
            style={{ color: "#e2e8f0", fontSize: "0.82rem", fontWeight: 600 }}
          >
            {exec.name}
          </div>
          <div
            style={{
              color: "#475569",
              fontSize: "0.75rem",
              marginBottom: "0.5rem",
            }}
          >
            {exec.role}
          </div>
          <button
            data-ocid="staff.cancel_button"
            type="button"
            onClick={() => {
              sessionStorage.removeItem("de_staff_crm_auth");
              setExec(null);
            }}
            style={{
              ...S.btnOutline,
              fontSize: "0.78rem",
              padding: "0.35rem 0.7rem",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={S.content}>
        <div style={S.topbar}>
          <h1
            style={{
              color: "#e2e8f0",
              fontWeight: 700,
              fontSize: "1rem",
              margin: 0,
            }}
          >
            {activeTab === "dashboard" && "Dashboard"}
            {activeTab === "search" && "Search Customer"}
            {activeTab === "calls" && "My Calls"}
            {activeTab === "callbacks" && "Callbacks"}
          </h1>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <span
              style={{
                background: "rgba(34,197,94,0.12)",
                color: "#22c55e",
                borderRadius: 20,
                padding: "0.2rem 0.6rem",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              ● Live
            </span>
            <span style={{ color: "#64748b", fontSize: "0.82rem" }}>
              {exec.name}
            </span>
          </div>
        </div>

        <div style={S.main}>
          {/* ── Dashboard ── */}
          {activeTab === "dashboard" && (
            <div>
              {/* Live Monitoring Header - Ameyo style */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #020617 0%, #0f172a 100%)",
                  border: "1px solid #1e3a5f",
                  borderRadius: 12,
                  padding: "1rem 1.25rem",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background:
                        staffStatus === "available" ? "#22c55e" : "#f59e0b",
                      boxShadow: `0 0 8px ${staffStatus === "available" ? "#22c55e" : "#f59e0b"}`,
                    }}
                  />
                  <span
                    style={{
                      color: "#e2e8f0",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                    }}
                  >
                    Live Monitoring — {exec.name}
                  </span>
                  <span style={{ color: "#475569", fontSize: "0.78rem" }}>
                    {new Date().toLocaleString("en-IN")}
                  </span>
                </div>
                <button
                  data-ocid="staff.toggle"
                  type="button"
                  onClick={() =>
                    setStaffStatus((s) =>
                      s === "available" ? "busy" : "available",
                    )
                  }
                  style={{
                    border: "none",
                    borderRadius: 20,
                    padding: "0.3rem 1rem",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    background:
                      staffStatus === "available"
                        ? "rgba(34,197,94,0.2)"
                        : "rgba(245,158,11,0.2)",
                    color: staffStatus === "available" ? "#22c55e" : "#f59e0b",
                  }}
                >
                  {staffStatus === "available" ? "● Available" : "⚡ On Call"}
                </button>
              </div>

              {/* Stats cards */}
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  flexWrap: "wrap",
                  marginBottom: "1.5rem",
                }}
              >
                {(() => {
                  const todayLogsCount = staffCallLogs.filter(
                    (l) =>
                      new Date(l.timestamp).toDateString() ===
                      new Date().toDateString(),
                  );
                  const avgDur =
                    todayLogsCount.length > 0
                      ? Math.round(
                          todayLogsCount.reduce((a, b) => a + b.duration, 0) /
                            todayLogsCount.length,
                        )
                      : 0;
                  const uniqueCx = new Set(
                    todayLogsCount.map((l) => l.customerPhone),
                  ).size;
                  return [
                    ["📞", "Calls Today", todayLogsCount.length, "#22c55e"],
                    [
                      "⏱️",
                      "Avg Duration",
                      `${Math.floor(avgDur / 60)}m ${avgDur % 60}s`,
                      "#3b82f6",
                    ],
                    ["👥", "Customers Contacted", uniqueCx, "#8b5cf6"],
                    [
                      "🔔",
                      "Pending Callbacks",
                      pendingCallbacks.length,
                      "#f59e0b",
                    ],
                  ].map(([icon, label, val, color]) => (
                    <div key={label as string} style={S.statCard}>
                      <div
                        style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}
                      >
                        {icon}
                      </div>
                      <div
                        style={{
                          color: color as string,
                          fontSize: "1.5rem",
                          fontWeight: 800,
                        }}
                      >
                        {val}
                      </div>
                      <div style={{ color: "#64748b", fontSize: "0.82rem" }}>
                        {label}
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* My Call Activity table */}
              <div style={S.card}>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    marginBottom: "1rem",
                  }}
                >
                  📋 My Call Activity Today
                </p>
                {staffCallLogs.filter(
                  (l) =>
                    new Date(l.timestamp).toDateString() ===
                    new Date().toDateString(),
                ).length === 0 ? (
                  <p
                    data-ocid="staff.empty_state"
                    style={{ color: "#475569", fontSize: "0.85rem" }}
                  >
                    No calls recorded today. Start a call from the Search
                    Customer tab.
                  </p>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "0.83rem",
                      }}
                    >
                      <thead>
                        <tr>
                          {[
                            "Customer",
                            "Phone",
                            "Duration",
                            "Disposition",
                            "Time",
                          ].map((h) => (
                            <th
                              key={h}
                              style={{
                                color: "#64748b",
                                fontWeight: 600,
                                padding: "0.5rem 0.75rem",
                                textAlign: "left",
                                borderBottom: "1px solid #334155",
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {staffCallLogs
                          .filter(
                            (l) =>
                              new Date(l.timestamp).toDateString() ===
                              new Date().toDateString(),
                          )
                          .map((log, i) => (
                            <tr
                              key={log.id}
                              data-ocid={`staff.item.${i + 1}`}
                              style={{ borderBottom: "1px solid #1e293b" }}
                            >
                              <td
                                style={{
                                  color: "#e2e8f0",
                                  padding: "0.5rem 0.75rem",
                                }}
                              >
                                {log.customerName}
                              </td>
                              <td
                                style={{
                                  color: "#22c55e",
                                  padding: "0.5rem 0.75rem",
                                }}
                              >
                                {log.customerPhone}
                              </td>
                              <td
                                style={{
                                  color: "#94a3b8",
                                  padding: "0.5rem 0.75rem",
                                }}
                              >
                                {Math.floor(log.duration / 60)}m{" "}
                                {log.duration % 60}s
                              </td>
                              <td style={{ padding: "0.5rem 0.75rem" }}>
                                <span
                                  style={{
                                    background: "rgba(34,197,94,0.15)",
                                    color: "#22c55e",
                                    borderRadius: 20,
                                    padding: "0.15rem 0.5rem",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  {log.disposition || "completed"}
                                </span>
                              </td>
                              <td
                                style={{
                                  color: "#64748b",
                                  padding: "0.5rem 0.75rem",
                                }}
                              >
                                {new Date(log.timestamp).toLocaleTimeString(
                                  "en-IN",
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Search Customer ── */}
          {activeTab === "search" && (
            <div>
              <div style={{ ...S.card, marginBottom: "1.25rem" }}>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.85rem",
                    marginBottom: "0.6rem",
                  }}
                >
                  Search by Phone Number
                </p>
                <div style={{ display: "flex", gap: "0.6rem" }}>
                  <input
                    data-ocid="staff.search_input"
                    style={{ ...S.input, flex: 1 }}
                    placeholder="Enter customer phone (e.g. 9876543210)"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doSearch()}
                  />
                  <button
                    data-ocid="staff.primary_button"
                    type="button"
                    onClick={doSearch}
                    style={S.btnGreen}
                  >
                    🔍 Search
                  </button>
                </div>
                {notFound && (
                  <p
                    data-ocid="staff.error_state"
                    style={{
                      color: "#ef4444",
                      fontSize: "0.82rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    No customer found with this phone number.
                  </p>
                )}
              </div>

              {customer && (
                <>
                  {/* Customer card */}
                  <div
                    style={{
                      ...S.card,
                      marginBottom: "1rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg, #16a34a, #0284c7)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.2rem",
                            fontWeight: 700,
                            color: "#fff",
                          }}
                        >
                          {customer.name[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div
                            style={{
                              color: "#e2e8f0",
                              fontWeight: 700,
                              fontSize: "1rem",
                            }}
                          >
                            {customer.name}
                          </div>
                          <div
                            style={{ color: "#22c55e", fontSize: "0.85rem" }}
                          >
                            {customer.phone}
                          </div>
                        </div>
                        {customerNote?.tag && (
                          <span
                            style={{
                              background:
                                TAG_COLORS[customerNote.tag] || "#64748b",
                              color: "#fff",
                              borderRadius: 20,
                              padding: "0.15rem 0.6rem",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              textTransform: "capitalize",
                            }}
                          >
                            {customerNote.tag}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={{ color: "#64748b", fontSize: "0.82rem" }}>
                          📋 {customer.bookingsCount} bookings
                        </span>
                        <span style={{ color: "#64748b", fontSize: "0.82rem" }}>
                          📬 {customer.enquiriesCount} enquiries
                        </span>
                      </div>
                    </div>
                    <button
                      data-ocid="staff.primary_button"
                      type="button"
                      onClick={() => setCallModalOpen(true)}
                      style={S.btnGreen}
                    >
                      📞 Start Call
                    </button>
                  </div>

                  {/* Tabs */}
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginBottom: "1rem",
                      flexWrap: "wrap",
                    }}
                  >
                    {(
                      ["comments", "bookings", "enquiries", "calls"] as const
                    ).map((t) => (
                      <button
                        key={t}
                        data-ocid={`staff.${t}.tab`}
                        type="button"
                        onClick={() => setCustomerTab(t)}
                        style={S.tab(customerTab === t)}
                      >
                        {t === "comments"
                          ? "💬 Comments & Notes"
                          : t === "bookings"
                            ? "📋 Bookings"
                            : t === "enquiries"
                              ? "📬 Enquiries"
                              : "📞 Call History"}
                      </button>
                    ))}
                  </div>

                  {/* Comments & Notes */}
                  {customerTab === "comments" && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      {/* Add comment */}
                      <div style={S.card}>
                        <p
                          style={{
                            color: "#94a3b8",
                            fontSize: "0.82rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Add Comment
                        </p>
                        <textarea
                          data-ocid="staff.textarea"
                          style={{ ...S.textarea, marginBottom: "0.6rem" }}
                          placeholder="Type your comment about this customer..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button
                          data-ocid="staff.save_button"
                          type="button"
                          onClick={saveComment}
                          style={S.btnGreen}
                        >
                          💾 Save Comment
                        </button>
                      </div>

                      {/* Customer notes + tag */}
                      <div style={S.card}>
                        <p
                          style={{
                            color: "#94a3b8",
                            fontSize: "0.82rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Customer Tag
                        </p>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            flexWrap: "wrap",
                            marginBottom: "0.75rem",
                          }}
                        >
                          {[
                            "",
                            "follow-up",
                            "hot-lead",
                            "complaint",
                            "vip",
                          ].map((t) => (
                            <button
                              key={t}
                              data-ocid="staff.toggle"
                              type="button"
                              onClick={() => setNoteTag(t)}
                              style={{
                                border: "none",
                                borderRadius: 20,
                                padding: "0.25rem 0.65rem",
                                fontSize: "0.78rem",
                                cursor: "pointer",
                                fontWeight: noteTag === t ? 700 : 400,
                                background:
                                  noteTag === t
                                    ? TAG_COLORS[t] || "#334155"
                                    : "#334155",
                                color:
                                  noteTag === t
                                    ? t === ""
                                      ? "#e2e8f0"
                                      : "#fff"
                                    : "#94a3b8",
                              }}
                            >
                              {t === ""
                                ? "No Tag"
                                : t
                                    .replace("-", " ")
                                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                            </button>
                          ))}
                        </div>
                        <p
                          style={{
                            color: "#94a3b8",
                            fontSize: "0.82rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          General Notes
                        </p>
                        <textarea
                          data-ocid="staff.textarea"
                          style={{ ...S.textarea, marginBottom: "0.6rem" }}
                          placeholder="General notes about this customer..."
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                        />
                        <button
                          data-ocid="staff.save_button"
                          type="button"
                          onClick={saveNote}
                          style={S.btnGreen}
                        >
                          💾 Save Notes
                        </button>
                      </div>

                      {/* Comment timeline */}
                      <div style={S.card}>
                        <p
                          style={{
                            color: "#94a3b8",
                            fontSize: "0.82rem",
                            marginBottom: "0.75rem",
                          }}
                        >
                          Comment History ({comments.length})
                        </p>
                        {comments.length === 0 ? (
                          <p
                            data-ocid="staff.empty_state"
                            style={{ color: "#475569", fontSize: "0.85rem" }}
                          >
                            No comments yet.
                          </p>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.75rem",
                            }}
                          >
                            {comments.map((c, i) => (
                              <div
                                key={c.id}
                                data-ocid={`staff.item.${i + 1}`}
                                style={{
                                  background: "#0f172a",
                                  borderRadius: 8,
                                  padding: "0.75rem",
                                  borderLeft: "3px solid #22c55e",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "0.35rem",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#22c55e",
                                      fontSize: "0.8rem",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {c.staffName}
                                  </span>
                                  <span
                                    style={{
                                      color: "#475569",
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    {new Date(c.createdAt).toLocaleString(
                                      "en-IN",
                                    )}
                                  </span>
                                </div>
                                <p
                                  style={{
                                    color: "#cbd5e1",
                                    fontSize: "0.85rem",
                                    margin: 0,
                                  }}
                                >
                                  {c.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bookings */}
                  {customerTab === "bookings" && (
                    <div style={S.card}>
                      <p
                        style={{
                          color: "#94a3b8",
                          fontSize: "0.82rem",
                          marginBottom: "0.75rem",
                        }}
                      >
                        Bookings for {customer.phone}
                      </p>
                      {getBookings().filter(
                        (b) => b.customerPhone === customer.phone,
                      ).length === 0 ? (
                        <p
                          data-ocid="staff.empty_state"
                          style={{ color: "#475569", fontSize: "0.85rem" }}
                        >
                          No bookings found.
                        </p>
                      ) : (
                        getBookings()
                          .filter((b) => b.customerPhone === customer.phone)
                          .map((b, i) => (
                            <div
                              key={b.id}
                              data-ocid={`staff.item.${i + 1}`}
                              style={{
                                background: "#0f172a",
                                borderRadius: 8,
                                padding: "0.75rem",
                                marginBottom: "0.5rem",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  flexWrap: "wrap",
                                  gap: "0.5rem",
                                }}
                              >
                                <div>
                                  <p
                                    style={{
                                      color: "#e2e8f0",
                                      fontWeight: 600,
                                      margin: 0,
                                    }}
                                  >
                                    {b.pickup} → {b.drop}
                                  </p>
                                  <p
                                    style={{
                                      color: "#64748b",
                                      fontSize: "0.8rem",
                                      margin: "0.2rem 0 0",
                                    }}
                                  >
                                    {new Date(b.createdAt).toLocaleString(
                                      "en-IN",
                                    )}
                                  </p>
                                </div>
                                <span
                                  style={{
                                    background:
                                      b.status === "completed"
                                        ? "rgba(34,197,94,0.2)"
                                        : b.status === "cancelled"
                                          ? "rgba(239,68,68,0.2)"
                                          : "rgba(59,130,246,0.2)",
                                    color:
                                      b.status === "completed"
                                        ? "#22c55e"
                                        : b.status === "cancelled"
                                          ? "#ef4444"
                                          : "#60a5fa",
                                    borderRadius: 20,
                                    padding: "0.2rem 0.6rem",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  {b.status}
                                </span>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  )}

                  {/* Enquiries */}
                  {customerTab === "enquiries" && (
                    <div style={S.card}>
                      <p
                        style={{
                          color: "#94a3b8",
                          fontSize: "0.82rem",
                          marginBottom: "0.75rem",
                        }}
                      >
                        Enquiries for {customer.phone}
                      </p>
                      {getEnquiries().filter((e) => e.phone === customer.phone)
                        .length === 0 ? (
                        <p
                          data-ocid="staff.empty_state"
                          style={{ color: "#475569", fontSize: "0.85rem" }}
                        >
                          No enquiries found.
                        </p>
                      ) : (
                        getEnquiries()
                          .filter((e) => e.phone === customer.phone)
                          .map((e, i) => (
                            <div
                              key={e.id}
                              data-ocid={`staff.item.${i + 1}`}
                              style={{
                                background: "#0f172a",
                                borderRadius: 8,
                                padding: "0.75rem",
                                marginBottom: "0.5rem",
                              }}
                            >
                              <p
                                style={{
                                  color: "#e2e8f0",
                                  fontWeight: 600,
                                  margin: 0,
                                }}
                              >
                                {e.name}
                              </p>
                              <p
                                style={{
                                  color: "#64748b",
                                  fontSize: "0.8rem",
                                  margin: "0.2rem 0 0",
                                }}
                              >
                                {e.message ? e.message.slice(0, 40) : ""} ·{" "}
                                {new Date(e.createdAt).toLocaleString("en-IN")}
                              </p>
                            </div>
                          ))
                      )}
                    </div>
                  )}

                  {/* Call History */}
                  {customerTab === "calls" && (
                    <div style={S.card}>
                      <p
                        style={{
                          color: "#94a3b8",
                          fontSize: "0.82rem",
                          marginBottom: "0.75rem",
                        }}
                      >
                        Call History for {customer.phone}
                      </p>
                      {recordings.filter(
                        (r) => r.customerPhone === customer.phone,
                      ).length === 0 ? (
                        <p
                          data-ocid="staff.empty_state"
                          style={{ color: "#475569", fontSize: "0.85rem" }}
                        >
                          No calls recorded yet.
                        </p>
                      ) : (
                        recordings
                          .filter((r) => r.customerPhone === customer.phone)
                          .map((r, i) => (
                            <div
                              key={r.id}
                              data-ocid={`staff.item.${i + 1}`}
                              style={{
                                background: "#0f172a",
                                borderRadius: 8,
                                padding: "0.75rem",
                                marginBottom: "0.5rem",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  flexWrap: "wrap",
                                  gap: "0.5rem",
                                }}
                              >
                                <div>
                                  <p
                                    style={{
                                      color: "#e2e8f0",
                                      fontWeight: 600,
                                      margin: 0,
                                    }}
                                  >
                                    {r.staffName}
                                  </p>
                                  {r.notes && (
                                    <p
                                      style={{
                                        color: "#64748b",
                                        fontSize: "0.8rem",
                                        margin: "0.2rem 0 0",
                                      }}
                                    >
                                      {r.notes}
                                    </p>
                                  )}
                                </div>
                                <div style={{ textAlign: "right" }}>
                                  <p
                                    style={{
                                      color: "#94a3b8",
                                      fontSize: "0.75rem",
                                      margin: 0,
                                    }}
                                  >
                                    {new Date(r.recordedAt).toLocaleString(
                                      "en-IN",
                                    )}
                                  </p>
                                  <p
                                    style={{
                                      color: "#f59e0b",
                                      fontSize: "0.78rem",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {Math.floor(r.durationSecs / 60)}m{" "}
                                    {r.durationSecs % 60}s
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── My Calls ── */}
          {activeTab === "calls" && (
            <div style={S.card}>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "0.85rem",
                  marginBottom: "1rem",
                }}
              >
                📞 My Call Recordings ({myRecordings.length})
              </p>
              {myRecordings.length === 0 ? (
                <p data-ocid="staff.empty_state" style={{ color: "#475569" }}>
                  No calls recorded yet.
                </p>
              ) : (
                myRecordings.map((r, i) => (
                  <div
                    key={r.id}
                    data-ocid={`staff.item.${i + 1}`}
                    style={{
                      background: "#0f172a",
                      borderRadius: 8,
                      padding: "0.85rem",
                      marginBottom: "0.6rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            color: "#e2e8f0",
                            fontWeight: 700,
                            margin: 0,
                          }}
                        >
                          {r.customerName}{" "}
                          <span
                            style={{
                              color: "#64748b",
                              fontWeight: 400,
                              fontSize: "0.82rem",
                            }}
                          >
                            {r.customerPhone}
                          </span>
                        </p>
                        {r.notes && (
                          <p
                            style={{
                              color: "#64748b",
                              fontSize: "0.8rem",
                              margin: "0.2rem 0 0",
                            }}
                          >
                            {r.notes}
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p
                          style={{
                            color: "#94a3b8",
                            fontSize: "0.75rem",
                            margin: 0,
                          }}
                        >
                          {new Date(r.recordedAt).toLocaleString("en-IN")}
                        </p>
                        <p
                          style={{
                            color: "#f59e0b",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                          }}
                        >
                          {Math.floor(r.durationSecs / 60)}m{" "}
                          {r.durationSecs % 60}s
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Callbacks ── */}
          {activeTab === "callbacks" && (
            <div style={S.card}>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "0.85rem",
                  marginBottom: "1rem",
                }}
              >
                🔔 Pending Callbacks ({pendingCallbacks.length})
              </p>
              {pendingCallbacks.length === 0 ? (
                <p data-ocid="staff.empty_state" style={{ color: "#475569" }}>
                  No pending callbacks.
                </p>
              ) : (
                pendingCallbacks.map((cb, i) => (
                  <div
                    key={cb.id}
                    data-ocid={`staff.item.${i + 1}`}
                    style={{
                      background: "#0f172a",
                      borderRadius: 8,
                      padding: "0.85rem",
                      marginBottom: "0.6rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                    }}
                  >
                    <div>
                      <p
                        style={{ color: "#e2e8f0", fontWeight: 700, margin: 0 }}
                      >
                        {cb.customerName}
                      </p>
                      <p
                        style={{
                          color: "#22c55e",
                          fontSize: "0.85rem",
                          margin: "0.2rem 0",
                        }}
                      >
                        {cb.customerPhone}
                      </p>
                      {cb.note && (
                        <p
                          style={{
                            color: "#64748b",
                            fontSize: "0.8rem",
                            margin: 0,
                          }}
                        >
                          {cb.note}
                        </p>
                      )}
                    </div>
                    <button
                      data-ocid="staff.confirm_button"
                      type="button"
                      onClick={() => {
                        updateCallbackRequest(cb.id, { status: "done" });
                        setCallbacks(getCallbackRequests());
                      }}
                      style={{
                        ...S.btnGreen,
                        fontSize: "0.8rem",
                        padding: "0.4rem 0.8rem",
                      }}
                    >
                      ✓ Mark Done
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {callModalOpen && customer && (
        <CallModal
          customer={customer}
          staffName={exec.name}
          staffEmail={exec.email}
          onClose={() => {
            setCallModalOpen(false);
            setRecordings(getCallRecordings());
            if (customer) setComments(getCommentHistory(customer.phone));
          }}
        />
      )}
    </div>
  );
}

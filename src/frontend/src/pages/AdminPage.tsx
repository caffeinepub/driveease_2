import { useEffect, useRef, useState } from "react";
import LiveBadge from "../components/LiveBadge";
import { MessagesTab } from "../components/MessagesTab";
import type { Driver } from "../data/drivers";
import { toIST } from "../utils/dateUtils";
import {
  type Booking,
  type CallRecording,
  type CallbackRequest,
  type Enquiry,
  type PricingConfig,
  type Registration,
  clearCallRecordings,
  getBookings,
  getCallRecordings,
  getCallbackRequests,
  getComment,
  getCustomers,
  getDrivers,
  getEnquiries,
  getPricingConfig,
  getRegistrations,
  getSubEnquiries,
  saveCallRecording,
  saveComment,
  saveDrivers,
  savePricingConfig,
  uid,
  updateBooking,
  updateCallbackRequest,
  updateEnquiry,
  updateRegistration,
} from "../utils/store";

const ADMIN_PASS = "126312";

// ─── Executive types ───────────────────────────────────────────────────────
interface ExecPermissions {
  bookings: boolean;
  drivers: boolean;
  registrations: boolean;
  customers: boolean;
  enquiries: boolean;
  finance: boolean;
  pricing: boolean;
  messages: boolean;
  live: boolean;
  recordings: boolean;
  callbacks: boolean;
}

interface Executive {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  permissions: ExecPermissions;
  createdAt: string;
}

function getExecutives(): Executive[] {
  try {
    return JSON.parse(localStorage.getItem("de_executives") || "[]");
  } catch {
    return [];
  }
}

function saveExecutives(execs: Executive[]) {
  localStorage.setItem("de_executives", JSON.stringify(execs));
}

// ─── Auth types ────────────────────────────────────────────────────────────
interface AuthState {
  type: "founder" | "executive";
  name: string;
  role: string;
  permissions: ExecPermissions | null; // null = founder (all access)
}

const FULL_PERMISSIONS: ExecPermissions = {
  bookings: true,
  drivers: true,
  registrations: true,
  customers: true,
  enquiries: true,
  finance: true,
  pricing: true,
  messages: true,
  live: true,
  recordings: true,
  callbacks: true,
};

function getAuthState(): AuthState | null {
  try {
    const s = sessionStorage.getItem("de_auth_v2");
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

function setAuthState(state: AuthState) {
  sessionStorage.setItem("de_auth_v2", JSON.stringify(state));
}

function clearAuthState() {
  sessionStorage.removeItem("de_auth_v2");
  sessionStorage.removeItem("de_admin");
}

// ─── Audio alert ──────────────────────────────────────────────────────────
function playAlert() {
  try {
    const ACtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new ACtx();
    const beep = (freq: number, start: number, duration: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = freq;
      o.type = "sine";
      g.gain.setValueAtTime(0.4, ctx.currentTime + start);
      g.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + start + duration,
      );
      o.start(ctx.currentTime + start);
      o.stop(ctx.currentTime + start + duration);
    };
    beep(880, 0, 0.18);
    beep(1100, 0.22, 0.18);
    beep(1320, 0.44, 0.25);
  } catch {
    /* noop */
  }
}

// ─── Login Page ───────────────────────────────────────────────────────────
function LoginPage({ onAuth }: { onAuth: (s: AuthState) => void }) {
  const [mode, setMode] = useState<"founder" | "exec">("founder");
  const [pass, setPass] = useState("");
  const [email, setEmail] = useState("");
  const [execPass, setExecPass] = useState("");
  const [err, setErr] = useState("");

  const loginFounder = () => {
    if (pass === ADMIN_PASS) {
      const state: AuthState = {
        type: "founder",
        name: "Founder",
        role: "Super Admin",
        permissions: null,
      };
      setAuthState(state);
      sessionStorage.setItem("de_admin", "1");
      onAuth(state);
    } else {
      setErr("Incorrect password");
    }
  };

  const loginExec = () => {
    const execs = getExecutives();
    const exec = execs.find(
      (e) =>
        e.email.toLowerCase() === email.toLowerCase() &&
        e.password === execPass,
    );
    if (exec) {
      const state: AuthState = {
        type: "executive",
        name: exec.name,
        role: exec.role,
        permissions: exec.permissions,
      };
      setAuthState(state);
      onAuth(state);
    } else {
      setErr("Invalid email or password");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        fontFamily: "'Poppins',sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                background: "linear-gradient(135deg,#22c55e,#16a34a)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
              }}
            >
              🚗
            </div>
            <span
              style={{
                color: "#f1f5f9",
                fontWeight: 800,
                fontSize: "1.5rem",
                letterSpacing: "-0.02em",
              }}
            >
              DriveEase
            </span>
          </div>
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
            CRM Admin Panel
          </p>
        </div>

        {/* Mode toggle */}
        <div
          style={{
            display: "flex",
            background: "#1e293b",
            borderRadius: 12,
            padding: 4,
            marginBottom: "1.5rem",
          }}
        >
          {(["founder", "exec"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setErr("");
              }}
              style={{
                flex: 1,
                padding: "0.6rem",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: mode === m ? "#22c55e" : "transparent",
                color: mode === m ? "#fff" : "#64748b",
                fontWeight: mode === m ? 700 : 400,
                fontSize: "0.88rem",
                transition: "all 0.15s",
              }}
            >
              {m === "founder" ? "🔑 Founder Access" : "👤 Staff Login"}
            </button>
          ))}
        </div>

        {/* Form */}
        <div
          style={{
            background: "#1e293b",
            borderRadius: 16,
            padding: "1.75rem",
          }}
        >
          {mode === "founder" ? (
            <>
              <label
                htmlFor="founder-pass"
                style={{
                  color: "#94a3b8",
                  fontSize: "0.82rem",
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                Admin Password
              </label>
              <input
                id="founder-pass"
                type="password"
                placeholder="Enter admin password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loginFounder()}
                style={{
                  width: "100%",
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  padding: "0.65rem 1rem",
                  color: "#f1f5f9",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                  letterSpacing: "0.15em",
                  marginBottom: "1rem",
                }}
              />
            </>
          ) : (
            <>
              <label
                htmlFor="exec-email"
                style={{
                  color: "#94a3b8",
                  fontSize: "0.82rem",
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                Email Address
              </label>
              <input
                id="exec-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  padding: "0.65rem 1rem",
                  color: "#f1f5f9",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: "0.75rem",
                }}
              />
              <label
                htmlFor="exec-pass"
                style={{
                  color: "#94a3b8",
                  fontSize: "0.82rem",
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                Password
              </label>
              <input
                id="exec-pass"
                type="password"
                placeholder="Your password"
                value={execPass}
                onChange={(e) => setExecPass(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loginExec()}
                style={{
                  width: "100%",
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  padding: "0.65rem 1rem",
                  color: "#f1f5f9",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: "1rem",
                }}
              />
            </>
          )}
          {err && (
            <p
              style={{
                color: "#f87171",
                fontSize: "0.82rem",
                marginBottom: "0.75rem",
              }}
            >
              {err}
            </p>
          )}
          <button
            type="button"
            onClick={mode === "founder" ? loginFounder : loginExec}
            style={{
              width: "100%",
              background: "linear-gradient(135deg,#22c55e,#16a34a)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "0.75rem",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(34,197,94,0.3)",
            }}
          >
            {mode === "founder" ? "Login as Founder" : "Login as Staff"}
          </button>
        </div>

        <p
          style={{
            textAlign: "center",
            color: "#475569",
            fontSize: "0.78rem",
            marginTop: "1.5rem",
          }}
        >
          DriveEase Admin CRM · Secure Access
        </p>
      </div>
    </div>
  );
}

// ─── Staff Management Tab ─────────────────────────────────────────────────
const PERM_LABELS: { key: keyof ExecPermissions; label: string }[] = [
  { key: "bookings", label: "Bookings" },
  { key: "drivers", label: "Drivers" },
  { key: "registrations", label: "Registrations" },
  { key: "customers", label: "Customers" },
  { key: "enquiries", label: "Enquiries" },
  { key: "finance", label: "Finance" },
  { key: "live", label: "Live GPS" },
  { key: "pricing", label: "Pricing" },
  { key: "messages", label: "Messages" },
];

function StaffTab() {
  const [execs, setExecs] = useState<Executive[]>(getExecutives);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Executive | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    permissions: { ...FULL_PERMISSIONS },
  });

  const resetForm = () =>
    setForm({
      name: "",
      email: "",
      password: "",
      role: "",
      permissions: { ...FULL_PERMISSIONS },
    });

  const openAdd = () => {
    resetForm();
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (exec: Executive) => {
    setForm({
      name: exec.name,
      email: exec.email,
      password: exec.password,
      role: exec.role,
      permissions: { ...exec.permissions },
    });
    setEditing(exec);
    setShowForm(true);
  };

  const saveForm = () => {
    if (!form.name || !form.email || !form.password || !form.role) return;
    const all = getExecutives();
    if (editing) {
      const updated = all.map((e) =>
        e.id === editing.id ? { ...e, ...form } : e,
      );
      saveExecutives(updated);
      setExecs(updated);
    } else {
      const newExec: Executive = {
        id: `exec_${Date.now()}`,
        ...form,
        createdAt: new Date().toLocaleDateString("en-IN"),
      };
      const updated = [...all, newExec];
      saveExecutives(updated);
      setExecs(updated);
    }
    setShowForm(false);
  };

  const deleteExec = (id: string) => {
    if (!window.confirm("Remove this staff member?")) return;
    const updated = getExecutives().filter((e) => e.id !== id);
    saveExecutives(updated);
    setExecs(updated);
  };

  const togglePerm = (key: keyof ExecPermissions) => {
    setForm((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: !prev.permissions[key] },
    }));
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h2
            style={{
              color: "#1e293b",
              fontWeight: 700,
              fontSize: "1.2rem",
              margin: 0,
            }}
          >
            Staff Management
          </h2>
          <p
            style={{
              color: "#64748b",
              fontSize: "0.85rem",
              margin: "0.25rem 0 0",
            }}
          >
            Manage executive accounts and their CRM permissions
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          style={{
            background: "linear-gradient(135deg,#22c55e,#16a34a)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "0.6rem 1.2rem",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "0.88rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          + Add Executive
        </button>
      </div>

      {execs.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            background: "#fff",
            borderRadius: 12,
            border: "2px dashed #e2e8f0",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>👥</div>
          <p style={{ color: "#64748b", fontWeight: 600 }}>
            No staff members yet
          </p>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
            Add executives to give them controlled access to this CRM
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.88rem",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                  borderBottom: "2px solid #e2e8f0",
                }}
              >
                {[
                  "Name",
                  "Email",
                  "Role",
                  "Permissions",
                  "Added",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      color: "#64748b",
                      textAlign: "left",
                      padding: "0.75rem 1rem",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {execs.map((exec) => (
                <tr key={exec.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg,#22c55e,#16a34a)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          flexShrink: 0,
                        }}
                      >
                        {exec.name
                          .split(" ")
                          .map((x) => x[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <span style={{ color: "#1e293b", fontWeight: 600 }}>
                        {exec.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "#64748b" }}>
                    {exec.email}
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span
                      style={{
                        background: "#eff6ff",
                        color: "#3b82f6",
                        borderRadius: 6,
                        padding: "2px 8px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                    >
                      {exec.role}
                    </span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 4,
                        maxWidth: 280,
                      }}
                    >
                      {PERM_LABELS.filter((p) => exec.permissions[p.key]).map(
                        (p) => (
                          <span
                            key={p.key}
                            style={{
                              background: "#f0fdf4",
                              color: "#16a34a",
                              borderRadius: 4,
                              padding: "1px 6px",
                              fontSize: "0.72rem",
                              fontWeight: 600,
                            }}
                          >
                            {p.label}
                          </span>
                        ),
                      )}
                      {PERM_LABELS.filter((p) => !exec.permissions[p.key])
                        .length === PERM_LABELS.length && (
                        <span style={{ color: "#ef4444", fontSize: "0.78rem" }}>
                          No access
                        </span>
                      )}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "0.85rem 1rem",
                      color: "#94a3b8",
                      fontSize: "0.82rem",
                    }}
                  >
                    {exec.createdAt}
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={() => openEdit(exec)}
                        style={{
                          background: "#eff6ff",
                          color: "#3b82f6",
                          border: "none",
                          borderRadius: 6,
                          padding: "0.3rem 0.7rem",
                          cursor: "pointer",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteExec(exec.id)}
                        style={{
                          background: "#fef2f2",
                          color: "#ef4444",
                          border: "none",
                          borderRadius: 6,
                          padding: "0.3rem 0.7rem",
                          cursor: "pointer",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "1.75rem",
              width: "100%",
              maxWidth: 520,
              maxHeight: "90vh",
              overflowY: "auto",
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
              <h3
                style={{
                  color: "#1e293b",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  margin: 0,
                }}
              >
                {editing ? "Edit Executive" : "Add New Executive"}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  fontSize: "1.5rem",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              {[
                { key: "name", label: "Full Name", ph: "Rahul Sharma" },
                { key: "email", label: "Email", ph: "rahul@driveease.com" },
                { key: "password", label: "Password", ph: "Set a password" },
                { key: "role", label: "Role Title", ph: "Booking Manager" },
              ].map((f) => (
                <div key={f.key}>
                  <label
                    htmlFor={`exec-field-${f.key}`}
                    style={{
                      color: "#64748b",
                      fontSize: "0.8rem",
                      display: "block",
                      marginBottom: "0.35rem",
                      fontWeight: 600,
                    }}
                  >
                    {f.label}
                  </label>
                  <input
                    id={`exec-field-${f.key}`}
                    type={f.key === "password" ? "password" : "text"}
                    placeholder={f.ph}
                    value={(form as unknown as Record<string, string>)[f.key]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [f.key]: e.target.value }))
                    }
                    style={{
                      width: "100%",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: 8,
                      padding: "0.55rem 0.75rem",
                      fontSize: "0.88rem",
                      outline: "none",
                      boxSizing: "border-box",
                      color: "#1e293b",
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  color: "#64748b",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: "0.75rem",
                }}
              >
                CRM Module Permissions
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: "0.5rem",
                }}
              >
                {PERM_LABELS.map((p) => (
                  <label
                    key={p.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                      padding: "0.5rem 0.75rem",
                      borderRadius: 8,
                      border: `1.5px solid ${form.permissions[p.key] ? "#22c55e" : "#e2e8f0"}`,
                      background: form.permissions[p.key]
                        ? "#f0fdf4"
                        : "#f8fafc",
                      transition: "all 0.15s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.permissions[p.key]}
                      onChange={() => togglePerm(p.key)}
                      style={{ accentColor: "#22c55e" }}
                    />
                    <span
                      style={{
                        color: form.permissions[p.key] ? "#16a34a" : "#64748b",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                      }}
                    >
                      {p.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  flex: 1,
                  background: "#f1f5f9",
                  color: "#64748b",
                  border: "none",
                  borderRadius: 8,
                  padding: "0.7rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveForm}
                style={{
                  flex: 2,
                  background: "linear-gradient(135deg,#22c55e,#16a34a)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "0.7rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {editing ? "Save Changes" : "Create Executive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Page ───────────────────────────────────────────────────────
export default function AdminPage() {
  const [auth, setAuth] = useState<AuthState | null>(getAuthState);
  const [tab, setTab] = useState("dashboard");
  const [lastSync, setLastSync] = useState(() => new Date());
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const [liveStatus, setLiveStatus] = useState<"live" | "reconnecting">("live");
  const [pricingForm, setPricingForm] = useState(() => getPricingConfig());
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [regs, setRegs] = useState<Registration[]>([]);
  const [customers, setCustomers] = useState<ReturnType<typeof getCustomers>>(
    [],
  );
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [subEnqs, setSubEnqs] = useState<ReturnType<typeof getSubEnquiries>>(
    [],
  );
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [regDetail, setRegDetail] = useState<Registration | null>(null);
  const [prevPendingRegs, setPrevPendingRegs] = useState(0);
  const [prevPendingBookings, setPrevPendingBookings] = useState(0);
  const prevEnquiries = useRef(0);
  const prevSubEnqs = useRef(0);

  // Comment / call / recording state
  const [openComment, setOpenComment] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [callModal, setCallModal] = useState<{
    name: string;
    phone: string;
  } | null>(null);
  const [callActive, setCallActive] = useState(false);
  const [callHold, setCallHold] = useState(false);
  const [callMute, setCallMute] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [callNotes, setCallNotes] = useState("");
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>([]);

  const loadData = (withAlert = false) => {
    setRecordings(getCallRecordings());
    setCallbacks(getCallbackRequests());
    const newBookings = getBookings();
    const newRegs = getRegistrations();
    const pendingRegs = newRegs.filter((r) => r.status === "pending").length;
    const pendingBookings = newBookings.filter(
      (b) => b.status === "pending",
    ).length;
    if (
      withAlert &&
      (pendingRegs > prevPendingRegs || pendingBookings > prevPendingBookings)
    )
      playAlert();
    const newEnqs = getEnquiries();
    const newSubEnqs = getSubEnquiries();
    if (
      withAlert &&
      (pendingRegs > prevPendingRegs ||
        pendingBookings > prevPendingBookings ||
        newEnqs.length > prevEnquiries.current ||
        newSubEnqs.length > prevSubEnqs.current)
    ) {
      playAlert();
      setSyncDone(true);
      setTimeout(() => setSyncDone(false), 3000);
    }
    setPrevPendingRegs(pendingRegs);
    setPrevPendingBookings(pendingBookings);
    prevEnquiries.current = newEnqs.length;
    prevSubEnqs.current = newSubEnqs.length;
    setBookings(newBookings);
    setDrivers(getDrivers());
    setRegs(newRegs);
    setCustomers(getCustomers());
    setEnquiries(newEnqs);
    setSubEnqs(newSubEnqs);
    setLastSync(new Date());
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: initial load only
  useEffect(() => {
    if (!auth) return;
    try {
      loadData();
      setLiveStatus("live");
    } catch {
      setLiveStatus("reconnecting");
    }
    const id = setInterval(() => {
      try {
        loadData(true);
        setLiveStatus("live");
      } catch {
        setLiveStatus("reconnecting");
      }
    }, 20000);
    return () => clearInterval(id);
  }, [auth]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: tab sync
  useEffect(() => {
    if (auth) loadData();
  }, [tab]);

  // Real-time sync: listen for localStorage changes from other tabs (website)
  // biome-ignore lint/correctness/useExhaustiveDependencies: storage listener
  useEffect(() => {
    if (!auth) return;
    const handler = (e: StorageEvent) => {
      const watchedKeys = [
        "de_bookings",
        "de_registrations",
        "de_enquiries",
        "de_sub_enquiries",
        "de_customers",
        "de_drivers",
      ];
      if (e.key && watchedKeys.includes(e.key)) {
        loadData(true);
        setLiveStatus("live");
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [auth]);

  const syncNow = () => {
    setSyncLoading(true);
    try {
      loadData(true);
      setLiveStatus("live");
      setSyncDone(true);
      setTimeout(() => setSyncDone(false), 3000);
    } catch {
      setLiveStatus("reconnecting");
    }
    setTimeout(() => setSyncLoading(false), 600);
  };

  const refresh = () => loadData();

  const downloadCSV = (data: object[], name: string) => {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const rows = [
      keys.join(","),
      ...data.map((r) =>
        keys
          .map((k) => JSON.stringify((r as Record<string, unknown>)[k] ?? ""))
          .join(","),
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name}.csv`;
    a.click();
  };

  const removeDriver = (id: string) => {
    saveDrivers(getDrivers().filter((d) => d.id !== id));
    refresh();
  };

  const sendReply = (id: string) => {
    updateEnquiry(id, { adminReply: replyText[id] || "", status: "closed" });
    refresh();
  };

  const handleSaveComment = (id: string) => {
    saveComment(id, commentDraft[id] ?? "");
    setOpenComment(null);
  };

  const openCallModal = (name: string, phone: string) => {
    setCallModal({ name, phone });
    setCallActive(false);
    setCallHold(false);
    setCallMute(false);
    setCallStartTime(null);
    setCallNotes("");
  };

  const startCall = (phone: string) => {
    window.open(`tel:+91${phone.replace(/\D/g, "")}`, "_self");
    setCallActive(true);
    setCallStartTime(new Date());
  };

  const endAndSaveCall = () => {
    if (!callModal) return;
    const durationSecs = callStartTime
      ? Math.round((Date.now() - callStartTime.getTime()) / 1000)
      : 0;
    const rec: CallRecording = {
      id: uid(),
      staffName: auth?.name || "Admin",
      customerName: callModal.name,
      customerPhone: callModal.phone,
      recordedAt: new Date().toISOString(),
      durationSecs,
      notes: callNotes,
    };
    saveCallRecording(rec);
    setRecordings(getCallRecordings());
    setCallModal(null);
    setCallActive(false);
  };

  const pendingCallbacksCount = callbacks.filter(
    (c) => c.status === "pending",
  ).length;

  // ─── Permission check ───────────────────────────────────────────────────
  const can = (key: keyof ExecPermissions): boolean => {
    if (!auth) return false;
    if (auth.type === "founder") return true;
    return auth.permissions?.[key] ?? false;
  };

  const isFounder = auth?.type === "founder";

  // ─── Sidebar items ──────────────────────────────────────────────────────
  const NAV_ITEMS = [
    { id: "dashboard", icon: "📊", label: "Dashboard", perm: null },
    {
      id: "bookings",
      icon: "📄",
      label: "Bookings",
      perm: "bookings" as keyof ExecPermissions,
    },
    {
      id: "drivers",
      icon: "🚗",
      label: "Drivers",
      perm: "drivers" as keyof ExecPermissions,
    },
    {
      id: "registrations",
      icon: "📝",
      label: "Registrations",
      perm: "registrations" as keyof ExecPermissions,
    },
    {
      id: "customers",
      icon: "👥",
      label: "Customers",
      perm: "customers" as keyof ExecPermissions,
    },
    {
      id: "enquiries",
      icon: "💬",
      label: "Enquiries",
      perm: "enquiries" as keyof ExecPermissions,
    },
    {
      id: "sub-enquiries",
      icon: "💳",
      label: "Plan Enquiries",
      perm: "enquiries" as keyof ExecPermissions,
    },
    {
      id: "live",
      icon: "📍",
      label: "Live GPS",
      perm: "live" as keyof ExecPermissions,
    },
    {
      id: "finance",
      icon: "💰",
      label: "Finance",
      perm: "finance" as keyof ExecPermissions,
    },
    {
      id: "pricing",
      icon: "⚙️",
      label: "Pricing",
      perm: "pricing" as keyof ExecPermissions,
    },
    {
      id: "messages",
      icon: "✉️",
      label: "Messages",
      perm: "messages" as keyof ExecPermissions,
    },
    {
      id: "recordings",
      icon: "🎙️",
      label: "Recordings",
      perm: "recordings" as keyof ExecPermissions,
    },
    {
      id: "callbacks",
      icon: "🔔",
      label: "Callbacks",
      perm: "callbacks" as keyof ExecPermissions,
    },
    ...(isFounder
      ? [{ id: "staff", icon: "🧑‍💼", label: "Staff", perm: null }]
      : []),
  ];

  const visibleNav = NAV_ITEMS.filter(
    (item) => item.perm === null || can(item.perm),
  );

  if (!auth)
    return (
      <LoginPage
        onAuth={(state) => {
          setAuth(state);
          setTab("dashboard");
        }}
      />
    );

  const stats = [
    {
      l: "Total Bookings",
      v: bookings.length,
      c: "#3b82f6",
      bg: "#eff6ff",
      icon: "📄",
    },
    {
      l: "Active Drivers",
      v: drivers.filter((d) => d.isOnline).length,
      c: "#22c55e",
      bg: "#f0fdf4",
      icon: "🚗",
    },
    {
      l: "Customers",
      v: customers.length,
      c: "#f59e0b",
      bg: "#fffbeb",
      icon: "👥",
    },
    {
      l: "Pending Regs",
      v: regs.filter((r) => r.status === "pending").length,
      c: "#ef4444",
      bg: "#fef2f2",
      icon: "📝",
    },
  ];

  // ─── Comment Box Component ──────────────────────────────────────────────
  const CommentBox = ({ recordId }: { recordId: string }) => {
    const existing = getComment(recordId);
    return (
      <div
        style={{
          background: "#fffbeb",
          border: "1.5px solid #fde68a",
          borderRadius: 10,
          padding: "0.75rem",
          marginTop: "0.5rem",
        }}
      >
        <p
          style={{
            color: "#92400e",
            fontSize: "0.78rem",
            fontWeight: 600,
            marginBottom: "0.4rem",
          }}
        >
          📝 Staff Comment
        </p>
        <textarea
          rows={2}
          defaultValue={commentDraft[recordId] ?? existing}
          onChange={(e) =>
            setCommentDraft((prev) => ({ ...prev, [recordId]: e.target.value }))
          }
          placeholder="Add a note about this booking/customer..."
          style={{
            width: "100%",
            border: "1px solid #fde68a",
            borderRadius: 6,
            padding: "0.45rem 0.65rem",
            fontSize: "0.83rem",
            background: "#fff",
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box",
            color: "#1e293b",
          }}
        />
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <button
            type="button"
            data-ocid="comment.save_button"
            onClick={() => handleSaveComment(recordId)}
            style={{
              background: "#f59e0b",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "0.35rem 0.8rem",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: 600,
            }}
          >
            Save Comment
          </button>
          <button
            type="button"
            data-ocid="comment.cancel_button"
            onClick={() => setOpenComment(null)}
            style={{
              background: "#f1f5f9",
              color: "#64748b",
              border: "none",
              borderRadius: 6,
              padding: "0.35rem 0.8rem",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  // ─── Layout ─────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f1f5f9",
        fontFamily: "'Poppins',sans-serif",
      }}
    >
      {/* ── Call Modal ── */}
      {callModal && (
        <div
          data-ocid="call.modal"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: "2rem",
              width: "100%",
              maxWidth: 420,
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            }}
          >
            <h3
              style={{
                color: "#1e293b",
                fontWeight: 700,
                marginBottom: "0.35rem",
              }}
            >
              📞 Call Customer
            </h3>
            <p
              style={{ color: "#1e293b", fontWeight: 600, fontSize: "1.05rem" }}
            >
              {callModal.name}
            </p>
            <p style={{ color: "#64748b", marginBottom: "1.25rem" }}>
              {callModal.phone}
            </p>

            {!callActive ? (
              <button
                type="button"
                data-ocid="call.primary_button"
                onClick={() => startCall(callModal.phone)}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg,#22c55e,#16a34a)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "0.85rem",
                  fontSize: "1rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  marginBottom: "0.75rem",
                }}
              >
                📞 Start Call
              </button>
            ) : (
              <div>
                {/* Recording always on indicator */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "#fef2f2",
                    border: "1.5px solid #fca5a5",
                    borderRadius: 8,
                    padding: "0.5rem 0.75rem",
                    marginBottom: "1rem",
                  }}
                >
                  <span
                    className="blink"
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "#ef4444",
                    }}
                  />
                  <span
                    style={{
                      color: "#ef4444",
                      fontWeight: 700,
                      fontSize: "0.88rem",
                    }}
                  >
                    🔴 RECORDING — Always On
                  </span>
                </div>

                {/* Controls */}
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    marginBottom: "1rem",
                  }}
                >
                  <button
                    type="button"
                    data-ocid="call.toggle"
                    onClick={() => setCallHold((p) => !p)}
                    style={{
                      flex: 1,
                      background: callHold ? "#f97316" : "#fff7ed",
                      color: callHold ? "#fff" : "#f97316",
                      border: "1.5px solid #f97316",
                      borderRadius: 10,
                      padding: "0.6rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.88rem",
                    }}
                  >
                    {callHold ? "▶ Resume" : "⏸ Hold"}
                  </button>
                  <button
                    type="button"
                    data-ocid="call.toggle"
                    onClick={() => setCallMute((p) => !p)}
                    style={{
                      flex: 1,
                      background: callMute ? "#ef4444" : "#fef2f2",
                      color: callMute ? "#fff" : "#ef4444",
                      border: "1.5px solid #ef4444",
                      borderRadius: 10,
                      padding: "0.6rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.88rem",
                    }}
                  >
                    {callMute ? "🔊 Unmute" : "🔇 Mute"}
                  </button>
                </div>

                <textarea
                  rows={2}
                  placeholder="Notes about this call..."
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  style={{
                    width: "100%",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 8,
                    padding: "0.5rem 0.75rem",
                    fontSize: "0.88rem",
                    marginBottom: "0.75rem",
                    outline: "none",
                    boxSizing: "border-box",
                    resize: "vertical",
                    color: "#1e293b",
                  }}
                />

                <button
                  type="button"
                  data-ocid="call.confirm_button"
                  onClick={endAndSaveCall}
                  style={{
                    width: "100%",
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  ✅ End Call & Save Recording
                </button>
              </div>
            )}

            <button
              type="button"
              data-ocid="call.close_button"
              onClick={() => setCallModal(null)}
              style={{
                width: "100%",
                background: "#f1f5f9",
                color: "#64748b",
                border: "none",
                borderRadius: 10,
                padding: "0.6rem",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.88rem",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? 240 : 64,
          background: "#0f172a",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          transition: "width 0.2s",
          overflow: "hidden",
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 10,
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: "1.25rem",
            borderBottom: "1px solid #1e293b",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg,#22c55e,#16a34a)",
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              flexShrink: 0,
            }}
          >
            🚗
          </div>
          {sidebarOpen && (
            <span
              style={{
                color: "#f1f5f9",
                fontWeight: 800,
                fontSize: "1.05rem",
                whiteSpace: "nowrap",
              }}
            >
              DriveEase
            </span>
          )}
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "0.75rem 0" }}>
          {visibleNav.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  width: "100%",
                  padding: sidebarOpen ? "0.7rem 1.25rem" : "0.7rem",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  border: "none",
                  cursor: "pointer",
                  background: active ? "rgba(34,197,94,0.15)" : "transparent",
                  borderLeft: active
                    ? "3px solid #22c55e"
                    : "3px solid transparent",
                  color: active ? "#22c55e" : "#94a3b8",
                  fontWeight: active ? 700 : 400,
                  fontSize: "0.88rem",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    {item.label}
                    {item.id === "callbacks" && pendingCallbacksCount > 0 && (
                      <span
                        style={{
                          background: "#ef4444",
                          color: "#fff",
                          borderRadius: 9999,
                          padding: "1px 6px",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          lineHeight: 1.4,
                        }}
                      >
                        {pendingCallbacksCount}
                      </span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div
          style={{
            padding: "0.75rem",
            borderTop: "1px solid #1e293b",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => {
              clearAuthState();
              setAuth(null);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              width: "100%",
              padding: "0.6rem",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 8,
              color: "#f87171",
              cursor: "pointer",
              fontSize: "0.82rem",
              justifyContent: sidebarOpen ? "flex-start" : "center",
            }}
          >
            <span>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Top Header */}
        <header
          style={{
            background: "#fff",
            borderBottom: "1px solid #e2e8f0",
            padding: "0 1.5rem",
            height: 64,
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexShrink: 0,
            position: "sticky",
            top: 0,
            zIndex: 5,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen((p) => !p)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#64748b",
              fontSize: "1.25rem",
              padding: "0.25rem",
              flexShrink: 0,
            }}
          >
            ☰
          </button>

          <div style={{ flex: 1 }}>
            <h1
              style={{
                color: "#1e293b",
                fontWeight: 700,
                fontSize: "1rem",
                margin: 0,
              }}
            >
              {visibleNav.find((n) => n.id === tab)?.label || "Dashboard"}
            </h1>
          </div>

          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <LiveBadge status={liveStatus} />
            <button
              type="button"
              onClick={syncNow}
              disabled={syncLoading}
              style={{
                background: syncLoading ? "#e2e8f0" : "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: syncLoading ? "#94a3b8" : "#16a34a",
                borderRadius: 8,
                padding: "0.4rem 0.9rem",
                cursor: syncLoading ? "default" : "pointer",
                fontSize: "0.82rem",
                fontWeight: 600,
              }}
            >
              {syncLoading ? "Syncing…" : "⟳ Sync"}
            </button>
            <span
              style={{ color: "#94a3b8", fontSize: "0.72rem", display: "none" }}
            >
              Last: {toIST(lastSync.toISOString())}
            </span>
            {syncDone && (
              <span
                style={{
                  background: "#dcfce7",
                  color: "#15803d",
                  border: "1px solid #86efac",
                  borderRadius: 8,
                  padding: "0.3rem 0.8rem",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  animation: "fadeIn 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                ✓ Synced
              </span>
            )}

            {/* User badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: "0.35rem 0.75rem",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#22c55e,#16a34a)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.72rem",
                }}
              >
                {auth.name[0]}
              </div>
              <div>
                <div
                  style={{
                    color: "#1e293b",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    lineHeight: 1.2,
                  }}
                >
                  {auth.name}
                </div>
                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.7rem",
                    lineHeight: 1.2,
                  }}
                >
                  {auth.role}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main style={{ flex: 1, padding: "1.5rem", overflowY: "auto" }}>
          {/* Dashboard */}
          {tab === "dashboard" && (
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                {stats.map((s) => (
                  <div
                    key={s.l}
                    style={{
                      background: "#fff",
                      borderRadius: 12,
                      padding: "1.25rem",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      display: "flex",
                      gap: "1rem",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        background: s.bg,
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.4rem",
                        flexShrink: 0,
                      }}
                    >
                      {s.icon}
                    </div>
                    <div>
                      <div
                        style={{
                          color: "#94a3b8",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                        }}
                      >
                        {s.l}
                      </div>
                      <div
                        style={{
                          color: s.c,
                          fontWeight: 800,
                          fontSize: "1.75rem",
                          lineHeight: 1,
                        }}
                      >
                        {s.v}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: "1.25rem",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <h3
                    style={{
                      color: "#1e293b",
                      fontWeight: 700,
                      marginBottom: "1rem",
                      fontSize: "0.95rem",
                    }}
                  >
                    Recent Bookings
                  </h3>
                  {bookings.slice(0, 5).length === 0 ? (
                    <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                      No bookings yet
                    </p>
                  ) : (
                    bookings.slice(0, 5).map((b) => (
                      <div
                        key={b.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "0.6rem 0",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              color: "#1e293b",
                              fontWeight: 600,
                              fontSize: "0.85rem",
                            }}
                          >
                            {b.customerName}
                          </div>
                          <div
                            style={{ color: "#94a3b8", fontSize: "0.75rem" }}
                          >
                            {b.pickup} → {b.drop}
                          </div>
                        </div>
                        <span
                          style={{
                            background:
                              b.status === "confirmed"
                                ? "#f0fdf4"
                                : b.status === "cancelled"
                                  ? "#fef2f2"
                                  : "#fffbeb",
                            color:
                              b.status === "confirmed"
                                ? "#16a34a"
                                : b.status === "cancelled"
                                  ? "#ef4444"
                                  : "#d97706",
                            borderRadius: 6,
                            padding: "2px 8px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            height: "fit-content",
                          }}
                        >
                          {b.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: "1.25rem",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <h3
                    style={{
                      color: "#1e293b",
                      fontWeight: 700,
                      marginBottom: "1rem",
                      fontSize: "0.95rem",
                    }}
                  >
                    Recent Registrations
                  </h3>
                  {regs.slice(0, 5).length === 0 ? (
                    <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                      No registrations yet
                    </p>
                  ) : (
                    regs.slice(0, 5).map((r) => (
                      <div
                        key={r.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "0.6rem 0",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              color: "#1e293b",
                              fontWeight: 600,
                              fontSize: "0.85rem",
                            }}
                          >
                            {r.name}
                          </div>
                          <div
                            style={{ color: "#94a3b8", fontSize: "0.75rem" }}
                          >
                            {r.city}, {r.state}
                          </div>
                        </div>
                        <span
                          style={{
                            background:
                              r.status === "approved"
                                ? "#f0fdf4"
                                : r.status === "rejected"
                                  ? "#fef2f2"
                                  : "#fffbeb",
                            color:
                              r.status === "approved"
                                ? "#16a34a"
                                : r.status === "rejected"
                                  ? "#ef4444"
                                  : "#d97706",
                            borderRadius: 6,
                            padding: "2px 8px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            height: "fit-content",
                          }}
                        >
                          {r.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bookings */}
          {tab === "bookings" && can("bookings") && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.25rem",
                }}
              >
                <h2
                  style={{
                    color: "#1e293b",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    margin: 0,
                  }}
                >
                  All Bookings ({bookings.length})
                </h2>
                <button
                  type="button"
                  onClick={() => downloadCSV(bookings, "bookings")}
                  style={{
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    color: "#3b82f6",
                    borderRadius: 8,
                    padding: "0.45rem 0.9rem",
                    cursor: "pointer",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                  }}
                >
                  ⬇ Export CSV
                </button>
              </div>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  overflow: "hidden",
                }}
              >
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.85rem",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "#f8fafc",
                          borderBottom: "2px solid #e2e8f0",
                        }}
                      >
                        {[
                          "ID",
                          "Customer",
                          "Driver",
                          "Pickup",
                          "Drop",
                          "Date",
                          "Days",
                          "Amount",
                          "OTP",
                          "Ride State",
                          "Status",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            style={{
                              color: "#64748b",
                              textAlign: "left",
                              padding: "0.75rem 0.75rem",
                              whiteSpace: "nowrap",
                              fontWeight: 600,
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.length === 0 ? (
                        <tr>
                          <td
                            colSpan={12}
                            style={{
                              color: "#94a3b8",
                              textAlign: "center",
                              padding: "2rem",
                            }}
                          >
                            No bookings yet
                          </td>
                        </tr>
                      ) : (
                        bookings.map((b) => (
                          <tr
                            key={b.id}
                            style={{ borderBottom: "1px solid #f1f5f9" }}
                          >
                            <td
                              style={{
                                color: "#94a3b8",
                                padding: "0.75rem",
                                fontSize: "0.75rem",
                              }}
                            >
                              {b.id.slice(-8)}
                            </td>
                            <td style={{ padding: "0.75rem" }}>
                              <div
                                style={{ color: "#1e293b", fontWeight: 600 }}
                              >
                                {b.customerName}
                              </div>
                              <div
                                style={{
                                  color: "#94a3b8",
                                  fontSize: "0.75rem",
                                }}
                              >
                                {b.customerPhone}
                              </div>
                            </td>
                            <td
                              style={{ color: "#1e293b", padding: "0.75rem" }}
                            >
                              {b.driverName}
                            </td>
                            <td
                              style={{
                                color: "#64748b",
                                padding: "0.75rem",
                                maxWidth: 100,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {b.pickup}
                            </td>
                            <td
                              style={{
                                color: "#64748b",
                                padding: "0.75rem",
                                maxWidth: 100,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {b.drop}
                            </td>
                            <td
                              style={{
                                color: "#94a3b8",
                                padding: "0.75rem",
                                whiteSpace: "nowrap",
                                fontSize: "0.78rem",
                              }}
                            >
                              {toIST(b.createdAt)}
                            </td>
                            <td
                              style={{
                                color: "#1e293b",
                                padding: "0.75rem",
                                textAlign: "center",
                              }}
                            >
                              {b.days}
                            </td>
                            <td
                              style={{
                                color: "#16a34a",
                                padding: "0.75rem",
                                fontWeight: 700,
                              }}
                            >
                              ₹{b.amount}
                            </td>
                            <td
                              style={{
                                color: "#d97706",
                                padding: "0.75rem",
                                fontFamily: "monospace",
                                fontWeight: 700,
                              }}
                            >
                              {b.rideOtp || "-"}
                            </td>
                            <td style={{ padding: "0.75rem" }}>
                              {b.rideState ? (
                                <span
                                  style={{
                                    background: "#f0f9ff",
                                    color: "#0369a1",
                                    borderRadius: 6,
                                    padding: "2px 8px",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    textTransform: "capitalize",
                                  }}
                                >
                                  {b.rideState}
                                </span>
                              ) : (
                                <span style={{ color: "#cbd5e1" }}>-</span>
                              )}
                            </td>
                            <td style={{ padding: "0.75rem" }}>
                              <span
                                style={{
                                  background:
                                    b.status === "confirmed"
                                      ? "#f0fdf4"
                                      : b.status === "cancelled"
                                        ? "#fef2f2"
                                        : "#fffbeb",
                                  color:
                                    b.status === "confirmed"
                                      ? "#16a34a"
                                      : b.status === "cancelled"
                                        ? "#ef4444"
                                        : "#d97706",
                                  borderRadius: 6,
                                  padding: "2px 8px",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                }}
                              >
                                {b.status}
                              </span>
                            </td>
                            <td style={{ padding: "0.75rem" }}>
                              <div style={{ display: "flex", gap: 4 }}>
                                {b.status === "pending" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateBooking(b.id, {
                                        status: "confirmed",
                                      });
                                      refresh();
                                    }}
                                    style={{
                                      background: "#f0fdf4",
                                      color: "#16a34a",
                                      border: "none",
                                      borderRadius: 5,
                                      padding: "3px 7px",
                                      cursor: "pointer",
                                      fontSize: "0.75rem",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Confirm
                                  </button>
                                )}
                                {b.status !== "cancelled" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateBooking(b.id, {
                                        status: "cancelled",
                                      });
                                      refresh();
                                    }}
                                    style={{
                                      background: "#fef2f2",
                                      color: "#ef4444",
                                      border: "none",
                                      borderRadius: 5,
                                      padding: "3px 7px",
                                      cursor: "pointer",
                                      fontSize: "0.75rem",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Cancel
                                  </button>
                                )}
                                <button
                                  type="button"
                                  data-ocid="booking.secondary_button"
                                  onClick={() =>
                                    setOpenComment(
                                      openComment === b.id ? null : b.id,
                                    )
                                  }
                                  style={{
                                    background: "#fffbeb",
                                    color: "#d97706",
                                    border: "1px solid #fde68a",
                                    borderRadius: 5,
                                    padding: "3px 7px",
                                    cursor: "pointer",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  💬
                                </button>
                                <button
                                  type="button"
                                  data-ocid="booking.primary_button"
                                  onClick={() =>
                                    openCallModal(
                                      b.customerName,
                                      b.customerPhone,
                                    )
                                  }
                                  style={{
                                    background: "#f0fdf4",
                                    color: "#16a34a",
                                    border: "1px solid #bbf7d0",
                                    borderRadius: 5,
                                    padding: "3px 7px",
                                    cursor: "pointer",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  📞
                                </button>
                              </div>
                              {openComment === b.id && (
                                <CommentBox recordId={b.id} />
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Drivers */}
          {tab === "drivers" && can("drivers") && (
            <div>
              <h2
                style={{
                  color: "#1e293b",
                  fontWeight: 700,
                  marginBottom: "1.25rem",
                  fontSize: "1.1rem",
                }}
              >
                All Drivers ({drivers.length})
              </h2>
              {drivers.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "3rem",
                    background: "#fff",
                    borderRadius: 12,
                  }}
                >
                  <p style={{ color: "#94a3b8" }}>No drivers registered yet.</p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
                    gap: "1rem",
                  }}
                >
                  {drivers.map((d) => (
                    <div
                      key={d.id}
                      style={{
                        background: "#fff",
                        borderRadius: 12,
                        padding: "1.25rem",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                        border: d.isOnline
                          ? "1.5px solid #bbf7d0"
                          : "1.5px solid #e2e8f0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "0.6rem",
                            alignItems: "center",
                          }}
                        >
                          <img
                            src={d.avatar}
                            alt={d.name}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                          <div>
                            <p
                              style={{
                                color: "#1e293b",
                                fontWeight: 700,
                                fontSize: "0.9rem",
                                margin: 0,
                              }}
                            >
                              {d.name}
                            </p>
                            <p
                              style={{
                                color: "#64748b",
                                fontSize: "0.78rem",
                                margin: 0,
                              }}
                            >
                              {d.city}, {d.state}
                            </p>
                          </div>
                        </div>
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: d.isOnline ? "#22c55e" : "#cbd5e1",
                            display: "inline-block",
                            marginTop: 6,
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "0.4rem",
                          fontSize: "0.82rem",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <span style={{ color: "#64748b" }}>
                          Trips:{" "}
                          <strong style={{ color: "#1e293b" }}>
                            {d.totalTrips}
                          </strong>
                        </span>
                        <span style={{ color: "#64748b" }}>
                          Earnings:{" "}
                          <strong style={{ color: "#16a34a" }}>
                            ₹{d.totalEarnings.toLocaleString("en-IN")}
                          </strong>
                        </span>
                        <span style={{ color: "#64748b" }}>
                          Rate:{" "}
                          <strong style={{ color: "#1e293b" }}>
                            ₹{d.dailyRate}/day
                          </strong>
                        </span>
                        <span style={{ color: "#64748b" }}>
                          Rating:{" "}
                          <strong style={{ color: "#d97706" }}>
                            ⭐{d.rating}
                          </strong>
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          type="button"
                          onClick={() => {
                            const all = getDrivers().map((dr) =>
                              dr.id === d.id
                                ? { ...dr, isOnline: !dr.isOnline }
                                : dr,
                            );
                            saveDrivers(all);
                            refresh();
                          }}
                          style={{
                            flex: 1,
                            background: d.isOnline ? "#f0fdf4" : "#f8fafc",
                            border: `1px solid ${d.isOnline ? "#bbf7d0" : "#e2e8f0"}`,
                            color: d.isOnline ? "#16a34a" : "#64748b",
                            borderRadius: 6,
                            padding: "0.4rem",
                            cursor: "pointer",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                          }}
                        >
                          {d.isOnline ? "Set Offline" : "Set Online"}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeDriver(d.id)}
                          style={{
                            background: "#fef2f2",
                            border: "1px solid #fecaca",
                            color: "#ef4444",
                            borderRadius: 6,
                            padding: "0.4rem 0.7rem",
                            cursor: "pointer",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Registrations */}
          {tab === "registrations" && can("registrations") && (
            <div>
              <h2
                style={{
                  color: "#1e293b",
                  fontWeight: 700,
                  marginBottom: "1.25rem",
                  fontSize: "1.1rem",
                }}
              >
                Driver Registrations ({regs.length})
              </h2>
              {regDetail && (
                <div
                  style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 200,
                    padding: "1rem",
                  }}
                >
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      padding: "1.75rem",
                      maxWidth: 520,
                      width: "100%",
                      maxHeight: "92vh",
                      overflowY: "auto",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "1.25rem",
                      }}
                    >
                      <h3
                        style={{ color: "#1e293b", fontWeight: 700, margin: 0 }}
                      >
                        Registration Details
                      </h3>
                      <button
                        type="button"
                        onClick={() => setRegDetail(null)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#94a3b8",
                          fontSize: "1.5rem",
                        }}
                      >
                        ×
                      </button>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0.75rem",
                        marginBottom: "1rem",
                        fontSize: "0.85rem",
                      }}
                    >
                      {[
                        ["Name", regDetail.name],
                        ["Phone", regDetail.phone],
                        ["City", regDetail.city],
                        ["State", regDetail.state],
                        ["Vehicle", regDetail.vehicleType],
                        ["Submitted", toIST(regDetail.submittedAt)],
                      ].map(([l, v]) => (
                        <div key={l}>
                          <span style={{ color: "#94a3b8" }}>{l}: </span>
                          <strong style={{ color: "#1e293b" }}>{v}</strong>
                        </div>
                      ))}
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3,1fr)",
                        gap: "0.5rem",
                        marginBottom: "1rem",
                      }}
                    >
                      {[
                        { label: "DL", src: regDetail.dlDesc },
                        { label: "Aadhaar", src: regDetail.aadharDesc },
                        { label: "Selfie", src: regDetail.selfieDesc },
                      ].map(({ label, src }) =>
                        src ? (
                          <div key={label} style={{ textAlign: "center" }}>
                            <a href={src} target="_blank" rel="noreferrer">
                              <img
                                src={src}
                                alt={label}
                                style={{
                                  width: "100%",
                                  height: 80,
                                  objectFit: "cover",
                                  borderRadius: 8,
                                  border: "1px solid #e2e8f0",
                                }}
                              />
                            </a>
                            <p
                              style={{
                                color: "#94a3b8",
                                fontSize: "0.72rem",
                                marginTop: "0.25rem",
                              }}
                            >
                              {label}
                            </p>
                          </div>
                        ) : (
                          <div
                            key={label}
                            style={{
                              textAlign: "center",
                              background: "#f8fafc",
                              borderRadius: 8,
                              padding: "1.5rem 0",
                            }}
                          >
                            <p
                              style={{ color: "#cbd5e1", fontSize: "0.72rem" }}
                            >
                              {label} N/A
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                    {regDetail.paymentScreenshot && (
                      <div style={{ marginBottom: "1rem" }}>
                        <p
                          style={{
                            color: "#64748b",
                            fontSize: "0.82rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Payment Screenshot:
                        </p>
                        <a
                          href={regDetail.paymentScreenshot}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img
                            src={regDetail.paymentScreenshot}
                            alt="Payment"
                            style={{
                              maxWidth: "100%",
                              borderRadius: 8,
                              border: "2px solid #bbf7d0",
                            }}
                          />
                        </a>
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <button
                        type="button"
                        onClick={() => {
                          updateRegistration(regDetail.id, {
                            status: "approved",
                          });
                          setRegDetail(null);
                          refresh();
                        }}
                        style={{
                          flex: 1,
                          background: "linear-gradient(135deg,#22c55e,#16a34a)",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8,
                          padding: "0.65rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        ✅ Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateRegistration(regDetail.id, {
                            status: "rejected",
                          });
                          setRegDetail(null);
                          refresh();
                        }}
                        style={{
                          flex: 1,
                          background: "#fef2f2",
                          color: "#ef4444",
                          border: "1px solid #fecaca",
                          borderRadius: 8,
                          padding: "0.65rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {regs.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      background: "#fff",
                      borderRadius: 12,
                    }}
                  >
                    <p style={{ color: "#94a3b8" }}>No registrations yet.</p>
                  </div>
                )}
                {regs.map((reg) => (
                  <div
                    key={reg.id}
                    style={{
                      background: "#fff",
                      borderRadius: 12,
                      padding: "1.25rem",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <p
                        style={{ color: "#1e293b", fontWeight: 700, margin: 0 }}
                      >
                        {reg.name} · {reg.phone}
                      </p>
                      <p
                        style={{
                          color: "#64748b",
                          fontSize: "0.82rem",
                          margin: "0.2rem 0 0",
                        }}
                      >
                        {reg.city}, {reg.state} · {reg.vehicleType}
                      </p>
                      <p
                        style={{
                          color: "#94a3b8",
                          fontSize: "0.75rem",
                          margin: "0.1rem 0 0",
                        }}
                      >
                        {toIST(reg.submittedAt)}
                      </p>
                    </div>
                    {reg.paymentScreenshot && (
                      <a
                        href={reg.paymentScreenshot}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          src={reg.paymentScreenshot}
                          alt="Payment"
                          style={{
                            width: 52,
                            height: 52,
                            objectFit: "cover",
                            borderRadius: 6,
                            border: "2px solid #bbf7d0",
                          }}
                        />
                      </a>
                    )}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          background:
                            reg.status === "approved"
                              ? "#f0fdf4"
                              : reg.status === "rejected"
                                ? "#fef2f2"
                                : "#fffbeb",
                          color:
                            reg.status === "approved"
                              ? "#16a34a"
                              : reg.status === "rejected"
                                ? "#ef4444"
                                : "#d97706",
                          borderRadius: 999,
                          padding: "2px 10px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                        }}
                      >
                        {reg.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => setRegDetail(reg)}
                        style={{
                          background: "#eff6ff",
                          border: "none",
                          color: "#3b82f6",
                          borderRadius: 6,
                          padding: "0.35rem 0.75rem",
                          cursor: "pointer",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                        }}
                      >
                        Review
                      </button>
                      {reg.status === "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              updateRegistration(reg.id, {
                                status: "approved",
                              });
                              refresh();
                            }}
                            style={{
                              background: "#f0fdf4",
                              border: "none",
                              color: "#16a34a",
                              borderRadius: 6,
                              padding: "0.35rem 0.75rem",
                              cursor: "pointer",
                              fontSize: "0.82rem",
                              fontWeight: 600,
                            }}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              updateRegistration(reg.id, {
                                status: "rejected",
                              });
                              refresh();
                            }}
                            style={{
                              background: "#fef2f2",
                              border: "none",
                              color: "#ef4444",
                              borderRadius: 6,
                              padding: "0.35rem 0.75rem",
                              cursor: "pointer",
                              fontSize: "0.82rem",
                              fontWeight: 600,
                            }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers */}
          {tab === "customers" && can("customers") && (
            <div>
              <h2
                style={{
                  color: "#1e293b",
                  fontWeight: 700,
                  marginBottom: "1.25rem",
                  fontSize: "1.1rem",
                }}
              >
                Customers ({customers.length})
              </h2>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  overflow: "hidden",
                }}
              >
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.88rem",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "#f8fafc",
                          borderBottom: "2px solid #e2e8f0",
                        }}
                      >
                        {["Name", "Phone", "Last Login", "Actions"].map((h) => (
                          <th
                            key={h}
                            style={{
                              color: "#64748b",
                              textAlign: "left",
                              padding: "0.75rem 1rem",
                              fontWeight: 600,
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {customers.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            style={{
                              color: "#94a3b8",
                              textAlign: "center",
                              padding: "2rem",
                            }}
                          >
                            No customers yet
                          </td>
                        </tr>
                      ) : (
                        customers.map((c) => (
                          <tr
                            key={c.phone}
                            style={{ borderBottom: "1px solid #f1f5f9" }}
                          >
                            <td
                              style={{
                                color: "#1e293b",
                                padding: "0.75rem 1rem",
                                fontWeight: 500,
                              }}
                            >
                              {c.name}
                            </td>
                            <td
                              style={{
                                color: "#64748b",
                                padding: "0.75rem 1rem",
                              }}
                            >
                              {c.phone}
                            </td>
                            <td
                              style={{
                                color: "#94a3b8",
                                padding: "0.75rem 1rem",
                                fontSize: "0.78rem",
                              }}
                            >
                              {toIST(c.loginTime)}
                            </td>
                            <td style={{ padding: "0.75rem 1rem" }}>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "0.35rem",
                                }}
                              >
                                <div
                                  style={{ display: "flex", gap: "0.35rem" }}
                                >
                                  <button
                                    type="button"
                                    data-ocid="customer.secondary_button"
                                    onClick={() =>
                                      setOpenComment(
                                        openComment === c.phone
                                          ? null
                                          : c.phone,
                                      )
                                    }
                                    style={{
                                      background: "#fffbeb",
                                      color: "#d97706",
                                      border: "1px solid #fde68a",
                                      borderRadius: 5,
                                      padding: "3px 8px",
                                      cursor: "pointer",
                                      fontSize: "0.75rem",
                                      fontWeight: 600,
                                    }}
                                  >
                                    💬 Comment
                                  </button>
                                  <button
                                    type="button"
                                    data-ocid="customer.primary_button"
                                    onClick={() =>
                                      openCallModal(c.name, c.phone)
                                    }
                                    style={{
                                      background: "#f0fdf4",
                                      color: "#16a34a",
                                      border: "1px solid #bbf7d0",
                                      borderRadius: 5,
                                      padding: "3px 8px",
                                      cursor: "pointer",
                                      fontSize: "0.75rem",
                                      fontWeight: 600,
                                    }}
                                  >
                                    📞 Call
                                  </button>
                                </div>
                                {openComment === c.phone && (
                                  <CommentBox recordId={c.phone} />
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Enquiries */}
          {tab === "enquiries" && can("enquiries") && (
            <div>
              <h2
                style={{
                  color: "#1e293b",
                  fontWeight: 700,
                  marginBottom: "1.25rem",
                  fontSize: "1.1rem",
                }}
              >
                Enquiries ({enquiries.length})
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {enquiries.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      background: "#fff",
                      borderRadius: 12,
                    }}
                  >
                    <p style={{ color: "#94a3b8" }}>No enquiries yet</p>
                  </div>
                )}
                {enquiries.map((e) => (
                  <div
                    key={e.id}
                    style={{
                      background: "#fff",
                      borderRadius: 12,
                      padding: "1.25rem",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            color: "#1e293b",
                            fontWeight: 700,
                            margin: 0,
                          }}
                        >
                          {e.name} · {e.phone}
                        </p>
                      </div>
                      <span
                        style={{
                          background:
                            e.status === "closed" ? "#f0fdf4" : "#fffbeb",
                          color: e.status === "closed" ? "#16a34a" : "#d97706",
                          borderRadius: 999,
                          padding: "2px 10px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          height: "fit-content",
                        }}
                      >
                        {e.status}
                      </span>
                    </div>
                    <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
                      {e.message}
                    </p>
                    {e.adminReply && (
                      <p
                        style={{
                          color: "#16a34a",
                          fontSize: "0.85rem",
                          background: "#f0fdf4",
                          borderRadius: 6,
                          padding: "0.5rem",
                        }}
                      >
                        Reply: {e.adminReply}
                      </p>
                    )}
                    {e.status === "open" && (
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          marginTop: "0.75rem",
                        }}
                      >
                        <input
                          style={{
                            flex: 1,
                            border: "1.5px solid #e2e8f0",
                            borderRadius: 8,
                            padding: "0.5rem 0.75rem",
                            fontSize: "0.88rem",
                            outline: "none",
                            color: "#1e293b",
                          }}
                          placeholder="Reply..."
                          value={replyText[e.id] || ""}
                          onChange={(ev) =>
                            setReplyText((p) => ({
                              ...p,
                              [e.id]: ev.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() => sendReply(e.id)}
                          style={{
                            background:
                              "linear-gradient(135deg,#22c55e,#16a34a)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            padding: "0.5rem 1rem",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          Send
                        </button>
                      </div>
                    )}
                    {/* Comment + Call row */}
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginTop: "0.75rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type="button"
                        data-ocid="enquiry.secondary_button"
                        onClick={() =>
                          setOpenComment(openComment === e.id ? null : e.id)
                        }
                        style={{
                          background: "#fffbeb",
                          color: "#d97706",
                          border: "1px solid #fde68a",
                          borderRadius: 6,
                          padding: "4px 10px",
                          cursor: "pointer",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                        }}
                      >
                        💬 Comment
                      </button>
                      <button
                        type="button"
                        data-ocid="enquiry.primary_button"
                        onClick={() => openCallModal(e.name, e.phone)}
                        style={{
                          background: "#f0fdf4",
                          color: "#16a34a",
                          border: "1px solid #bbf7d0",
                          borderRadius: 6,
                          padding: "4px 10px",
                          cursor: "pointer",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                        }}
                      >
                        📞 Call
                      </button>
                    </div>
                    {openComment === e.id && (
                      <div style={{ marginTop: "0.5rem" }}>
                        <CommentBox recordId={e.id} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Plan Enquiries */}
          {tab === "sub-enquiries" && can("enquiries") && (
            <div>
              <h2
                style={{
                  color: "#1e293b",
                  fontWeight: 700,
                  marginBottom: "1.25rem",
                  fontSize: "1.1rem",
                }}
              >
                Plan Enquiries ({subEnqs.length})
              </h2>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  overflow: "hidden",
                }}
              >
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.88rem",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "#f8fafc",
                          borderBottom: "2px solid #e2e8f0",
                        }}
                      >
                        {["Name", "Phone", "Plan", "Date"].map((h) => (
                          <th
                            key={h}
                            style={{
                              color: "#64748b",
                              textAlign: "left",
                              padding: "0.75rem 1rem",
                              fontWeight: 600,
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {subEnqs.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            style={{
                              color: "#94a3b8",
                              textAlign: "center",
                              padding: "2rem",
                            }}
                          >
                            No plan enquiries yet
                          </td>
                        </tr>
                      ) : (
                        subEnqs.map((s) => (
                          <tr
                            key={s.id}
                            style={{ borderBottom: "1px solid #f1f5f9" }}
                          >
                            <td
                              style={{
                                color: "#1e293b",
                                padding: "0.75rem 1rem",
                                fontWeight: 500,
                              }}
                            >
                              {s.name}
                            </td>
                            <td
                              style={{
                                color: "#64748b",
                                padding: "0.75rem 1rem",
                              }}
                            >
                              {s.phone}
                            </td>
                            <td style={{ padding: "0.75rem 1rem" }}>
                              <span
                                style={{
                                  background: "#f0fdf4",
                                  color: "#16a34a",
                                  borderRadius: 6,
                                  padding: "2px 8px",
                                  fontSize: "0.8rem",
                                  fontWeight: 600,
                                }}
                              >
                                {s.plan}
                              </span>
                            </td>
                            <td
                              style={{
                                color: "#94a3b8",
                                padding: "0.75rem 1rem",
                                fontSize: "0.78rem",
                              }}
                            >
                              {toIST(s.createdAt)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Live GPS */}
          {tab === "live" && can("live") && (
            <div>
              <h2
                style={{
                  color: "#1e293b",
                  fontWeight: 700,
                  marginBottom: "1.25rem",
                  fontSize: "1.1rem",
                }}
              >
                Live Driver Status
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
                  gap: "1rem",
                }}
              >
                {drivers.length === 0 ? (
                  <p style={{ color: "#94a3b8" }}>No drivers registered yet</p>
                ) : (
                  drivers.map((d) => (
                    <div
                      key={d.id}
                      style={{
                        background: "#fff",
                        borderRadius: 12,
                        padding: "1.25rem",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                        border: d.isOnline
                          ? "1.5px solid #bbf7d0"
                          : "1.5px solid #e2e8f0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        <img
                          src={d.avatar}
                          alt={d.name}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              color: "#1e293b",
                              fontWeight: 700,
                              margin: 0,
                            }}
                          >
                            {d.name}
                          </p>
                          <p
                            style={{
                              color: "#64748b",
                              fontSize: "0.78rem",
                              margin: 0,
                            }}
                          >
                            {d.city} · {d.vehicleTypes[0]}
                          </p>
                        </div>
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: d.isOnline ? "#22c55e" : "#cbd5e1",
                            display: "inline-block",
                          }}
                        />
                      </div>
                      <p
                        style={{
                          color: d.isOnline ? "#16a34a" : "#94a3b8",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          marginTop: "0.75rem",
                        }}
                      >
                        {d.isOnline ? "● Online" : "○ Offline"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Finance */}
          {tab === "finance" && can("finance") && (
            <div>
              <h2
                style={{
                  color: "#1e293b",
                  fontWeight: 700,
                  marginBottom: "1.25rem",
                  fontSize: "1.1rem",
                }}
              >
                Finance & Revenue
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                {[
                  {
                    l: "Total Revenue",
                    v: `₹${bookings
                      .filter((b) => b.status === "completed")
                      .reduce((s, b) => s + b.amount, 0)
                      .toLocaleString("en-IN")}`,
                    c: "#16a34a",
                    bg: "#f0fdf4",
                  },
                  {
                    l: "Total Commission",
                    v: `₹${bookings.reduce((s, b) => s + (b.commissionAmount || 0), 0).toLocaleString("en-IN")}`,
                    c: "#d97706",
                    bg: "#fffbeb",
                  },
                  {
                    l: "Driver Earnings",
                    v: `₹${bookings.reduce((s, b) => s + (b.driverEarnings || 0), 0).toLocaleString("en-IN")}`,
                    c: "#3b82f6",
                    bg: "#eff6ff",
                  },
                ].map(({ l, v, c }) => (
                  <div
                    key={l}
                    style={{
                      background: "#fff",
                      borderRadius: 12,
                      padding: "1.25rem",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      borderLeft: `4px solid ${c}`,
                    }}
                  >
                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "0.78rem",
                        margin: 0,
                      }}
                    >
                      {l}
                    </p>
                    <p
                      style={{
                        color: c,
                        fontWeight: 800,
                        fontSize: "1.6rem",
                        margin: "0.25rem 0 0",
                        lineHeight: 1,
                      }}
                    >
                      {v}
                    </p>
                  </div>
                ))}
              </div>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  overflow: "hidden",
                }}
              >
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.85rem",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "#f8fafc",
                          borderBottom: "2px solid #e2e8f0",
                        }}
                      >
                        {[
                          "ID",
                          "Customer",
                          "Amount",
                          "Commission",
                          "Driver Earnings",
                          "Status",
                        ].map((h) => (
                          <th
                            key={h}
                            style={{
                              color: "#64748b",
                              textAlign: "left",
                              padding: "0.75rem 1rem",
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            style={{
                              color: "#94a3b8",
                              padding: "2rem",
                              textAlign: "center",
                            }}
                          >
                            No bookings yet
                          </td>
                        </tr>
                      ) : (
                        bookings.map((b) => (
                          <tr
                            key={b.id}
                            style={{ borderBottom: "1px solid #f1f5f9" }}
                          >
                            <td
                              style={{
                                color: "#94a3b8",
                                padding: "0.75rem 1rem",
                                fontSize: "0.75rem",
                              }}
                            >
                              {b.id.slice(-8)}
                            </td>
                            <td
                              style={{
                                color: "#1e293b",
                                padding: "0.75rem 1rem",
                                fontWeight: 500,
                              }}
                            >
                              {b.customerName}
                            </td>
                            <td
                              style={{
                                color: "#16a34a",
                                padding: "0.75rem 1rem",
                                fontWeight: 700,
                              }}
                            >
                              ₹{b.amount}
                            </td>
                            <td
                              style={{
                                color: "#d97706",
                                padding: "0.75rem 1rem",
                              }}
                            >
                              ₹
                              {b.commissionAmount ||
                                Math.floor(b.amount * 0.15)}
                            </td>
                            <td
                              style={{
                                color: "#3b82f6",
                                padding: "0.75rem 1rem",
                              }}
                            >
                              ₹{b.driverEarnings || Math.floor(b.amount * 0.85)}
                            </td>
                            <td style={{ padding: "0.75rem 1rem" }}>
                              <span
                                style={{
                                  background:
                                    b.status === "completed"
                                      ? "#f0fdf4"
                                      : "#fffbeb",
                                  color:
                                    b.status === "completed"
                                      ? "#16a34a"
                                      : "#d97706",
                                  borderRadius: 6,
                                  padding: "2px 8px",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                }}
                              >
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Pricing */}
          {tab === "pricing" && can("pricing") && (
            <div style={{ maxWidth: 600 }}>
              <h2
                style={{
                  color: "#1e293b",
                  fontWeight: 700,
                  marginBottom: "0.5rem",
                  fontSize: "1.1rem",
                }}
              >
                Pricing Configuration
              </h2>
              <p
                style={{
                  color: "#64748b",
                  fontSize: "0.82rem",
                  marginBottom: "1.5rem",
                }}
              >
                Formula: Total = max(₹{pricingForm.minimumFare}, ₹
                {pricingForm.baseFare} + distance × ₹{pricingForm.ratePerKm}/km
                + time × ₹{pricingForm.ratePerMin}/min) +{" "}
                {pricingForm.nightSurchargePercent}% night
              </p>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: "1.5rem",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  display: "grid",
                  gap: "1rem",
                }}
              >
                {[
                  { key: "baseFare", label: "Base Fare (₹)" },
                  { key: "ratePerKm", label: "Rate per km (₹)" },
                  { key: "ratePerMin", label: "Rate per min (₹)" },
                  { key: "minimumFare", label: "Minimum Fare (₹)" },
                  {
                    key: "nightSurchargePercent",
                    label: "Night Surcharge (%)",
                  },
                  { key: "commissionPercent", label: "Commission (%)" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label
                      htmlFor={`pricing-${key}`}
                      style={{
                        color: "#64748b",
                        fontSize: "0.85rem",
                        display: "block",
                        marginBottom: "0.3rem",
                        fontWeight: 600,
                      }}
                    >
                      {label}
                    </label>
                    <input
                      id={`pricing-${key}`}
                      type="number"
                      min={0}
                      value={
                        (pricingForm as unknown as Record<string, number>)[key]
                      }
                      onChange={(e) =>
                        setPricingForm((prev) => ({
                          ...prev,
                          [key]: Number(e.target.value),
                        }))
                      }
                      style={{
                        width: "100%",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: 8,
                        padding: "0.6rem 0.9rem",
                        fontSize: "0.9rem",
                        outline: "none",
                        color: "#1e293b",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    savePricingConfig(pricingForm as PricingConfig);
                    window.alert("Pricing saved!");
                  }}
                  style={{
                    background: "linear-gradient(135deg,#22c55e,#16a34a)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "0.95rem",
                  }}
                >
                  💾 Save Pricing Config
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          {tab === "messages" && can("messages") && <MessagesTab />}

          {/* Recordings */}
          {tab === "recordings" && can("recordings") && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.25rem",
                }}
              >
                <h2
                  style={{
                    color: "#1e293b",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    margin: 0,
                  }}
                >
                  🎙️ Call Recordings ({recordings.length})
                </h2>
                <button
                  type="button"
                  data-ocid="recordings.delete_button"
                  onClick={() => {
                    clearCallRecordings();
                    setRecordings([]);
                  }}
                  style={{
                    background: "#fef2f2",
                    color: "#ef4444",
                    border: "1px solid #fca5a5",
                    borderRadius: 8,
                    padding: "0.4rem 0.85rem",
                    cursor: "pointer",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                  }}
                >
                  🗑 Clear All
                </button>
              </div>
              {recordings.length === 0 ? (
                <div
                  data-ocid="recordings.empty_state"
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: "3rem",
                    textAlign: "center",
                  }}
                >
                  <p style={{ color: "#94a3b8" }}>
                    No call recordings yet. Make calls from Bookings, Enquiries
                    or Customers tabs.
                  </p>
                </div>
              ) : (
                (() => {
                  const grouped: Record<string, typeof recordings> = {};
                  for (const r of recordings) {
                    if (!grouped[r.staffName]) grouped[r.staffName] = [];
                    grouped[r.staffName].push(r);
                  }
                  return Object.entries(grouped).map(([staff, recs]) => (
                    <div key={staff} style={{ marginBottom: "1.5rem" }}>
                      <h3
                        style={{
                          color: "#1e293b",
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          marginBottom: "0.6rem",
                          padding: "0.4rem 0.75rem",
                          background: "#f1f5f9",
                          borderRadius: 8,
                        }}
                      >
                        👤 {staff} ({recs.length} calls)
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                        }}
                      >
                        {recs.map((r, i) => (
                          <div
                            key={r.id}
                            data-ocid={`recordings.item.${i + 1}`}
                            style={{
                              background: "#fff",
                              borderRadius: 10,
                              padding: "0.85rem 1rem",
                              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                              display: "flex",
                              justifyContent: "space-between",
                              flexWrap: "wrap",
                              gap: "0.5rem",
                              alignItems: "flex-start",
                            }}
                          >
                            <div>
                              <p
                                style={{
                                  color: "#1e293b",
                                  fontWeight: 700,
                                  margin: 0,
                                }}
                              >
                                {r.customerName}
                                <span
                                  style={{
                                    color: "#64748b",
                                    fontWeight: 400,
                                    fontSize: "0.85rem",
                                    marginLeft: "0.5rem",
                                  }}
                                >
                                  {r.customerPhone}
                                </span>
                              </p>
                              {r.notes && (
                                <p
                                  style={{
                                    color: "#64748b",
                                    fontSize: "0.82rem",
                                    marginTop: "0.25rem",
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
                                  fontSize: "0.78rem",
                                  margin: 0,
                                }}
                              >
                                {toIST(r.recordedAt)}
                              </p>
                              <p
                                style={{
                                  color: "#f59e0b",
                                  fontSize: "0.78rem",
                                  fontWeight: 600,
                                }}
                              >
                                ⏱ {Math.floor(r.durationSecs / 60)}m{" "}
                                {r.durationSecs % 60}s
                              </p>
                            </div>
                            {/* Play / Download */}
                            <div
                              style={{
                                display: "flex",
                                gap: "0.5rem",
                                marginTop: "0.5rem",
                                flexWrap: "wrap",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setPlayingId(playingId === r.id ? null : r.id)
                                }
                                style={{
                                  background: "#f0fdf4",
                                  border: "1px solid #bbf7d0",
                                  color: "#16a34a",
                                  borderRadius: 6,
                                  padding: "0.3rem 0.75rem",
                                  cursor: "pointer",
                                  fontSize: "0.82rem",
                                  fontWeight: 600,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.4rem",
                                }}
                              >
                                {playingId === r.id ? (
                                  <>
                                    <span
                                      style={{
                                        display: "flex",
                                        gap: 2,
                                        alignItems: "flex-end",
                                        height: 14,
                                      }}
                                    >
                                      {[1, 2, 3, 4].map((b) => (
                                        <span
                                          key={b}
                                          style={{
                                            width: 3,
                                            background: "#16a34a",
                                            borderRadius: 2,
                                            height: [8, 12, 6, 10][b - 1],
                                            animation:
                                              "waveBar 0.8s ease-in-out infinite",
                                            animationDelay: `${b * 0.15}s`,
                                          }}
                                        />
                                      ))}
                                    </span>
                                    ⏸ Pause
                                  </>
                                ) : (
                                  "▶ Play"
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const content2 = `DriveEase Call Recording

Staff: ${r.staffName}
Customer: ${r.customerName} (${r.customerPhone})
Date: ${r.recordedAt}
Duration: ${Math.floor(r.durationSecs / 60)}m ${r.durationSecs % 60}s
Notes: ${r.notes}`;
                                  const blob = new Blob([content2], {
                                    type: "text/plain",
                                  });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download = `recording_${r.customerPhone}_${r.id}.txt`;
                                  a.click();
                                  URL.revokeObjectURL(url);
                                }}
                                style={{
                                  background: "#eff6ff",
                                  border: "1px solid #bfdbfe",
                                  color: "#2563eb",
                                  borderRadius: 6,
                                  padding: "0.3rem 0.75rem",
                                  cursor: "pointer",
                                  fontSize: "0.82rem",
                                  fontWeight: 600,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.3rem",
                                }}
                              >
                                ⬇ Download
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()
              )}
            </div>
          )}

          {/* Callbacks */}
          {tab === "callbacks" && can("callbacks") && (
            <div>
              <h2
                style={{
                  color: "#1e293b",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  marginBottom: "1.25rem",
                }}
              >
                🔔 Callback Requests ({callbacks.length})
                {pendingCallbacksCount > 0 && (
                  <span
                    style={{
                      background: "#ef4444",
                      color: "#fff",
                      borderRadius: 9999,
                      padding: "2px 8px",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      marginLeft: "0.5rem",
                    }}
                  >
                    {pendingCallbacksCount} pending
                  </span>
                )}
              </h2>
              {callbacks.length === 0 ? (
                <div
                  data-ocid="callbacks.empty_state"
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: "3rem",
                    textAlign: "center",
                  }}
                >
                  <p style={{ color: "#94a3b8" }}>
                    No callback requests yet. Customers can request callbacks
                    from their booking page.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {callbacks.map((cb, i) => (
                    <div
                      key={cb.id}
                      data-ocid={`callbacks.item.${i + 1}`}
                      style={{
                        background: "#fff",
                        borderRadius: 12,
                        padding: "1rem 1.25rem",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: "0.75rem",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            color: "#1e293b",
                            fontWeight: 700,
                            margin: 0,
                          }}
                        >
                          {cb.customerName}
                          <span
                            style={{
                              color: "#64748b",
                              fontWeight: 400,
                              marginLeft: "0.5rem",
                            }}
                          >
                            {cb.customerPhone}
                          </span>
                        </p>
                        <p
                          style={{
                            color: "#94a3b8",
                            fontSize: "0.78rem",
                            marginTop: "0.2rem",
                          }}
                        >
                          Requested: {toIST(cb.requestedAt)}
                        </p>
                        {cb.note && (
                          <p
                            style={{
                              color: "#64748b",
                              fontSize: "0.83rem",
                              marginTop: "0.25rem",
                            }}
                          >
                            Note: {cb.note}
                          </p>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            background:
                              cb.status === "done" ? "#f0fdf4" : "#fffbeb",
                            color: cb.status === "done" ? "#16a34a" : "#d97706",
                            borderRadius: 999,
                            padding: "3px 10px",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                          }}
                        >
                          {cb.status === "done" ? "✅ Done" : "⏳ Pending"}
                        </span>
                        {cb.status === "pending" && (
                          <>
                            <button
                              type="button"
                              data-ocid="callbacks.primary_button"
                              onClick={() =>
                                openCallModal(cb.customerName, cb.customerPhone)
                              }
                              style={{
                                background: "#f0fdf4",
                                color: "#16a34a",
                                border: "1px solid #bbf7d0",
                                borderRadius: 6,
                                padding: "4px 10px",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                              }}
                            >
                              📞 Call Now
                            </button>
                            <button
                              type="button"
                              data-ocid="callbacks.confirm_button"
                              onClick={() => {
                                updateCallbackRequest(cb.id, {
                                  status: "done",
                                });
                                setCallbacks(getCallbackRequests());
                              }}
                              style={{
                                background: "#eff6ff",
                                color: "#3b82f6",
                                border: "1px solid #bfdbfe",
                                borderRadius: 6,
                                padding: "4px 10px",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                              }}
                            >
                              Mark Done
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Staff */}
          {tab === "staff" && isFounder && <StaffTab />}
        </main>
      </div>
    </div>
  );
}

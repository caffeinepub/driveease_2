import { useEffect, useState } from "react";
import LiveBadge from "../components/LiveBadge";
import { MessagesTab } from "../components/MessagesTab";
import type { Driver } from "../data/drivers";
import { toIST } from "../utils/dateUtils";
import {
  type Booking,
  type Enquiry,
  type PricingConfig,
  type Registration,
  getBookings,
  getCustomers,
  getDrivers,
  getEnquiries,
  getPricingConfig,
  getRegistrations,
  getSubEnquiries,
  saveDrivers,
  savePricingConfig,
  updateBooking,
  updateEnquiry,
  updateRegistration,
} from "../utils/store";

const ADMIN_PASS = "126312";

function playAlert() {
  try {
    const ctx = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    )();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = 880;
    o.type = "sine";
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    o.start();
    o.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio not available
  }
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("de_admin") === "1",
  );
  const [pass, setPass] = useState("");
  const [passErr, setPassErr] = useState("");
  const [tab, setTab] = useState("bookings");
  const [lastSync, setLastSync] = useState(() => new Date());
  const [syncLoading, setSyncLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState<"live" | "reconnecting">("live");
  const [pricingForm, setPricingForm] = useState(() => getPricingConfig());

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

  const loadData = (withAlert = false) => {
    const newBookings = getBookings();
    const newRegs = getRegistrations();
    const pendingRegs = newRegs.filter((r) => r.status === "pending").length;
    const pendingBookings = newBookings.filter(
      (b) => b.status === "pending",
    ).length;

    if (withAlert) {
      if (
        pendingRegs > prevPendingRegs ||
        pendingBookings > prevPendingBookings
      ) {
        playAlert();
      }
    }

    setPrevPendingRegs(pendingRegs);
    setPrevPendingBookings(pendingBookings);
    setBookings(newBookings);
    setDrivers(getDrivers());
    setRegs(newRegs);
    setCustomers(getCustomers());
    setEnquiries(getEnquiries());
    setSubEnqs(getSubEnquiries());
    setLastSync(new Date());
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: initial load only
  useEffect(() => {
    if (!authed) return;
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
  }, [authed]);

  const syncNow = () => {
    setSyncLoading(true);
    try {
      loadData(true);
      setLiveStatus("live");
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

  if (!authed)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          padding: "1rem",
        }}
      >
        <div
          className="card-dark"
          style={{ width: "100%", maxWidth: 380, textAlign: "center" }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              background: "#16a34a",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.75rem",
              margin: "0 auto 1rem",
            }}
          >
            🔐
          </div>
          <h1
            style={{
              color: "#f8fafc",
              fontWeight: 800,
              fontSize: "1.5rem",
              marginBottom: "0.25rem",
            }}
          >
            DriveEase Admin
          </h1>
          <p
            style={{
              color: "#94a3b8",
              marginBottom: "1.5rem",
              fontSize: "0.88rem",
            }}
          >
            Master Control Panel
          </p>
          <input
            type="password"
            className="input-dark"
            placeholder="Enter admin password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (pass === ADMIN_PASS) {
                  sessionStorage.setItem("de_admin", "1");
                  setAuthed(true);
                } else setPassErr("Incorrect password");
              }
            }}
            style={{
              marginBottom: "0.75rem",
              textAlign: "center",
              letterSpacing: "0.2em",
            }}
          />
          {passErr && (
            <p
              style={{
                color: "#f87171",
                fontSize: "0.85rem",
                marginBottom: "0.75rem",
              }}
            >
              {passErr}
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              if (pass === ADMIN_PASS) {
                sessionStorage.setItem("de_admin", "1");
                setAuthed(true);
              } else setPassErr("Incorrect password");
            }}
            className="green-btn"
            style={{ width: "100%", justifyContent: "center" }}
          >
            Login to Admin
          </button>
        </div>
      </div>
    );

  const TABS: [string, string][] = [
    ["bookings", "📄 Bookings"],
    ["drivers", "🚗 Drivers"],
    ["registrations", "📝 Registrations"],
    ["customers", "👥 Customers"],
    ["enquiries", "💬 Enquiries"],
    ["sub-enquiries", "💳 Plan Enquiries"],
    ["live", "📍 Live GPS"],
    ["finance", "💰 Finance"],
    ["pricing", "⚙️ Pricing"],
    ["messages", "✉️ Messages"],
  ];

  const stats = [
    { l: "Total Drivers", v: drivers.length, c: "#4ade80" },
    { l: "Total Bookings", v: bookings.length, c: "#60a5fa" },
    { l: "Customers", v: customers.length, c: "#fbbf24" },
    {
      l: "Pending Regs",
      v: regs.filter((r) => r.status === "pending").length,
      c: "#f87171",
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Header bar with Sync */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
          background: "#1a1a1a",
          border: "1px solid #2d2d2d",
          borderRadius: 12,
          padding: "1rem 1.25rem",
        }}
      >
        <div>
          <h1
            style={{
              color: "#f8fafc",
              fontWeight: 800,
              fontSize: "1.5rem",
              marginBottom: "0.15rem",
            }}
          >
            DriveEase Admin
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <LiveBadge status={liveStatus} />
              <span style={{ color: "#4b5563", fontSize: "0.78rem" }}>
                Last sync: {lastSync.toLocaleTimeString("en-IN")}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            type="button"
            onClick={syncNow}
            disabled={syncLoading}
            style={{
              background: "rgba(22,163,74,0.15)",
              border: "1px solid rgba(22,163,74,0.4)",
              color: "#4ade80",
              borderRadius: 8,
              padding: "0.5rem 1.25rem",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              opacity: syncLoading ? 0.7 : 1,
            }}
          >
            {syncLoading ? "⏳" : "🔄"} {syncLoading ? "Syncing..." : "Sync"}
          </button>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem("de_admin");
              setAuthed(false);
            }}
            style={{
              color: "#f87171",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 6,
              padding: "0.4rem 0.9rem",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        {stats.map(({ l, v, c }) => (
          <div key={l} className="card-dark">
            <p style={{ color: "#6b7280", fontSize: "0.78rem" }}>{l}</p>
            <p style={{ color: c, fontWeight: 800, fontSize: "1.75rem" }}>
              {v}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.35rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
        }}
      >
        {TABS.map(([id, label]) => (
          <button
            type="button"
            key={id}
            onClick={() => setTab(id)}
            style={{
              background: tab === id ? "#16a34a" : "#1e1e1e",
              color: tab === id ? "white" : "#94a3b8",
              border: `1px solid ${tab === id ? "#16a34a" : "#2d2d2d"}`,
              borderRadius: 8,
              padding: "0.45rem 0.9rem",
              cursor: "pointer",
              fontSize: "0.88rem",
              fontWeight: tab === id ? 700 : 400,
              transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => downloadCSV(bookings, "bookings")}
          style={{
            marginLeft: "auto",
            background: "rgba(96,165,250,0.1)",
            border: "1px solid rgba(96,165,250,0.3)",
            color: "#60a5fa",
            borderRadius: 8,
            padding: "0.45rem 0.9rem",
            cursor: "pointer",
            fontSize: "0.85rem",
          }}
        >
          ⬇ Export CSV
        </button>
      </div>

      {/* Bookings */}
      {tab === "bookings" && (
        <div>
          <h2
            style={{
              color: "#f8fafc",
              fontWeight: 700,
              marginBottom: "1rem",
              fontSize: "1.15rem",
            }}
          >
            All Bookings ({bookings.length})
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.85rem",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "2px solid #2d2d2d" }}>
                  {[
                    "ID",
                    "Customer",
                    "Driver",
                    "Pickup",
                    "Drop",
                    "Dates",
                    "Days",
                    "Amount",
                    "Ride OTP",
                    "Ride State",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        color: "#94a3b8",
                        textAlign: "left",
                        padding: "0.5rem 0.6rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} style={{ borderBottom: "1px solid #1e1e1e" }}>
                    <td
                      style={{
                        color: "#6b7280",
                        padding: "0.6rem",
                        fontSize: "0.78rem",
                      }}
                    >
                      {b.id}
                    </td>
                    <td style={{ color: "#f8fafc", padding: "0.6rem" }}>
                      {b.customerName}
                      <br />
                      <span style={{ color: "#6b7280", fontSize: "0.78rem" }}>
                        {b.customerPhone}
                      </span>
                    </td>
                    <td style={{ color: "#f8fafc", padding: "0.6rem" }}>
                      {b.driverName}
                    </td>
                    <td
                      style={{
                        color: "#94a3b8",
                        padding: "0.6rem",
                        maxWidth: 100,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {b.pickup}
                    </td>
                    <td
                      style={{
                        color: "#94a3b8",
                        padding: "0.6rem",
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
                        padding: "0.6rem",
                        whiteSpace: "nowrap",
                        fontSize: "0.78rem",
                      }}
                    >
                      {toIST(b.createdAt)}
                    </td>
                    <td
                      style={{
                        color: "#f8fafc",
                        padding: "0.6rem",
                        textAlign: "center",
                      }}
                    >
                      {b.days}
                    </td>
                    <td
                      style={{
                        color: "#4ade80",
                        padding: "0.6rem",
                        fontWeight: 700,
                      }}
                    >
                      ₹{b.amount}
                    </td>
                    <td
                      style={{
                        color: "#fbbf24",
                        padding: "0.6rem",
                        fontFamily: "monospace",
                        fontWeight: 700,
                      }}
                    >
                      {b.rideOtp || "-"}
                    </td>
                    <td style={{ padding: "0.6rem" }}>
                      {b.rideState ? (
                        <span
                          style={{
                            background:
                              b.rideState === "searching"
                                ? "rgba(251,191,36,0.15)"
                                : b.rideState === "assigned"
                                  ? "rgba(96,165,250,0.15)"
                                  : b.rideState === "arrived"
                                    ? "rgba(167,139,250,0.15)"
                                    : b.rideState === "started"
                                      ? "rgba(74,222,128,0.15)"
                                      : b.rideState === "completed"
                                        ? "rgba(107,114,128,0.15)"
                                        : "rgba(248,113,113,0.15)",
                            color:
                              b.rideState === "searching"
                                ? "#fbbf24"
                                : b.rideState === "assigned"
                                  ? "#60a5fa"
                                  : b.rideState === "arrived"
                                    ? "#a78bfa"
                                    : b.rideState === "started"
                                      ? "#4ade80"
                                      : b.rideState === "completed"
                                        ? "#9ca3af"
                                        : "#f87171",
                            borderRadius: 9999,
                            padding: "2px 8px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            textTransform: "capitalize",
                          }}
                        >
                          {b.rideState}
                        </span>
                      ) : (
                        <span style={{ color: "#4b5563", fontSize: "0.78rem" }}>
                          -
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "0.6rem" }}>
                      <span
                        style={{
                          background:
                            b.status === "confirmed"
                              ? "rgba(74,222,128,0.15)"
                              : b.status === "cancelled"
                                ? "rgba(248,113,113,0.15)"
                                : "rgba(251,191,36,0.15)",
                          color:
                            b.status === "confirmed"
                              ? "#4ade80"
                              : b.status === "cancelled"
                                ? "#f87171"
                                : "#fbbf24",
                          borderRadius: 9999,
                          padding: "2px 8px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                        }}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.6rem" }}>
                      <div style={{ display: "flex", gap: "0.35rem" }}>
                        {b.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => {
                              updateBooking(b.id, { status: "confirmed" });
                              refresh();
                            }}
                            style={{
                              background: "rgba(22,163,74,0.15)",
                              color: "#4ade80",
                              border: "1px solid rgba(22,163,74,0.3)",
                              borderRadius: 5,
                              padding: "3px 8px",
                              cursor: "pointer",
                              fontSize: "0.78rem",
                            }}
                          >
                            Confirm
                          </button>
                        )}
                        {b.status !== "cancelled" && (
                          <button
                            type="button"
                            onClick={() => {
                              updateBooking(b.id, { status: "cancelled" });
                              refresh();
                            }}
                            style={{
                              background: "rgba(239,68,68,0.1)",
                              color: "#f87171",
                              border: "1px solid rgba(239,68,68,0.3)",
                              borderRadius: 5,
                              padding: "3px 8px",
                              cursor: "pointer",
                              fontSize: "0.78rem",
                            }}
                          >
                            Cancel
                          </button>
                        )}
                        {b.status === "confirmed" && (
                          <button
                            type="button"
                            onClick={() => {
                              updateBooking(b.id, { status: "completed" });
                              refresh();
                            }}
                            style={{
                              background: "rgba(96,165,250,0.1)",
                              color: "#60a5fa",
                              border: "1px solid rgba(96,165,250,0.3)",
                              borderRadius: 5,
                              padding: "3px 8px",
                              cursor: "pointer",
                              fontSize: "0.78rem",
                            }}
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td
                      colSpan={11}
                      style={{
                        color: "#4b5563",
                        textAlign: "center",
                        padding: "2rem",
                      }}
                    >
                      No bookings yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drivers */}
      {tab === "drivers" && (
        <div>
          <h2
            style={{
              color: "#f8fafc",
              fontWeight: 700,
              marginBottom: "1rem",
              fontSize: "1.15rem",
            }}
          >
            All Drivers ({drivers.length})
          </h2>
          {drivers.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                background: "#1e1e1e",
                borderRadius: 16,
              }}
            >
              <p style={{ color: "#6b7280" }}>
                No drivers registered yet. Approve driver registrations to add
                them.
              </p>
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
                <div key={d.id} className="card-dark">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
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
                        style={{ width: 36, height: 36, borderRadius: "50%" }}
                      />
                      <div>
                        <p
                          style={{
                            color: "#f8fafc",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                          }}
                        >
                          {d.name}
                        </p>
                        <p style={{ color: "#94a3b8", fontSize: "0.78rem" }}>
                          {d.city}, {d.state}
                        </p>
                      </div>
                    </div>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: d.isOnline ? "#4ade80" : "#6b7280",
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
                    <span style={{ color: "#94a3b8" }}>
                      Trips:{" "}
                      <strong style={{ color: "#f8fafc" }}>
                        {d.totalTrips}
                      </strong>
                    </span>
                    <span style={{ color: "#94a3b8" }}>
                      Earnings:{" "}
                      <strong style={{ color: "#4ade80" }}>
                        ₹{d.totalEarnings.toLocaleString("en-IN")}
                      </strong>
                    </span>
                    <span style={{ color: "#94a3b8" }}>
                      Rate:{" "}
                      <strong style={{ color: "#f8fafc" }}>
                        ₹{d.dailyRate}/day
                      </strong>
                    </span>
                    <span style={{ color: "#94a3b8" }}>
                      Rating:{" "}
                      <strong style={{ color: "#fbbf24" }}>⭐{d.rating}</strong>
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
                        background: d.isOnline
                          ? "rgba(22,163,74,0.15)"
                          : "rgba(107,114,128,0.15)",
                        border: `1px solid ${d.isOnline ? "rgba(22,163,74,0.3)" : "#3a3a3a"}`,
                        color: d.isOnline ? "#4ade80" : "#9ca3af",
                        borderRadius: 6,
                        padding: "0.35rem",
                        cursor: "pointer",
                        fontSize: "0.82rem",
                      }}
                    >
                      {d.isOnline ? "Set Offline" : "Set Online"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeDriver(d.id)}
                      style={{
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.25)",
                        color: "#f87171",
                        borderRadius: 6,
                        padding: "0.35rem 0.6rem",
                        cursor: "pointer",
                        fontSize: "0.82rem",
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
      {tab === "registrations" && (
        <div>
          <h2
            style={{
              color: "#f8fafc",
              fontWeight: 700,
              marginBottom: "1rem",
              fontSize: "1.15rem",
            }}
          >
            Driver Registrations ({regs.length})
          </h2>
          {regDetail && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.88)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 200,
                padding: "1rem",
              }}
            >
              <div
                className="card-dark"
                style={{
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
                    marginBottom: "1rem",
                  }}
                >
                  <h3 style={{ color: "#f8fafc", fontWeight: 700 }}>
                    Registration Details
                  </h3>
                  <button
                    type="button"
                    onClick={() => setRegDetail(null)}
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
                {[
                  ["Name", regDetail.name],
                  ["Phone", regDetail.phone],
                  ["City", regDetail.city],
                  ["State", regDetail.state],
                  ["Experience", `${String(regDetail.experience)} yrs`],
                  ["Vehicle", regDetail.vehicleType],
                  ["Languages", regDetail.languages],
                  ["Payment Ref", regDetail.paymentRef || "-"],
                  ["Submitted", toIST(regDetail.submittedAt)],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0.45rem 0",
                      borderBottom: "1px solid #2a2a2a",
                    }}
                  >
                    <span style={{ color: "#6b7280", fontSize: "0.88rem" }}>
                      {k}
                    </span>
                    <span
                      style={{
                        color: "#f8fafc",
                        fontSize: "0.88rem",
                        fontWeight: 500,
                        maxWidth: 260,
                        textAlign: "right",
                      }}
                    >
                      {v}
                    </span>
                  </div>
                ))}

                {/* Document thumbnails */}
                <div style={{ marginTop: "1rem" }}>
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "0.82rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    Documents:
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
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
                                border: "1px solid #3a3a3a",
                              }}
                            />
                          </a>
                          <p
                            style={{
                              color: "#6b7280",
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
                            background: "#1a1a1a",
                            borderRadius: 8,
                            padding: "1.5rem 0",
                          }}
                        >
                          <p style={{ color: "#4b5563", fontSize: "0.72rem" }}>
                            {label} N/A
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                  {regDetail.paymentScreenshot && (
                    <div>
                      <p
                        style={{
                          color: "#6b7280",
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
                            border: "2px solid rgba(22,163,74,0.3)",
                          }}
                        />
                      </a>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    marginTop: "1.5rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      updateRegistration(regDetail.id, { status: "approved" });
                      setRegDetail(null);
                      refresh();
                    }}
                    className="green-btn"
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    ✅ Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateRegistration(regDetail.id, { status: "rejected" });
                      setRegDetail(null);
                      refresh();
                    }}
                    style={{
                      flex: 1,
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "#f87171",
                      borderRadius: 8,
                      padding: "0.5rem",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            </div>
          )}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {regs.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  background: "#1e1e1e",
                  borderRadius: 16,
                }}
              >
                <p style={{ color: "#6b7280" }}>No registrations yet.</p>
              </div>
            )}
            {regs.map((reg) => (
              <div
                key={reg.id}
                className="card-dark"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ color: "#f8fafc", fontWeight: 700 }}>
                    {reg.name} • {reg.phone}
                  </p>
                  <p style={{ color: "#94a3b8", fontSize: "0.82rem" }}>
                    {reg.city}, {reg.state} • {reg.vehicleType}
                  </p>
                  <p style={{ color: "#4b5563", fontSize: "0.78rem" }}>
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
                        width: 56,
                        height: 56,
                        objectFit: "cover",
                        borderRadius: 6,
                        border: "2px solid rgba(22,163,74,0.3)",
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
                          ? "rgba(74,222,128,0.15)"
                          : reg.status === "rejected"
                            ? "rgba(248,113,113,0.15)"
                            : "rgba(251,191,36,0.15)",
                      color:
                        reg.status === "approved"
                          ? "#4ade80"
                          : reg.status === "rejected"
                            ? "#f87171"
                            : "#fbbf24",
                      borderRadius: 9999,
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
                      background: "rgba(96,165,250,0.1)",
                      border: "1px solid rgba(96,165,250,0.3)",
                      color: "#60a5fa",
                      borderRadius: 6,
                      padding: "0.35rem 0.75rem",
                      cursor: "pointer",
                      fontSize: "0.82rem",
                    }}
                  >
                    Review
                  </button>
                  {reg.status === "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          updateRegistration(reg.id, { status: "approved" });
                          refresh();
                        }}
                        style={{
                          background: "rgba(22,163,74,0.15)",
                          border: "1px solid rgba(22,163,74,0.3)",
                          color: "#4ade80",
                          borderRadius: 6,
                          padding: "0.35rem 0.75rem",
                          cursor: "pointer",
                          fontSize: "0.82rem",
                        }}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateRegistration(reg.id, { status: "rejected" });
                          refresh();
                        }}
                        style={{
                          background: "rgba(239,68,68,0.1)",
                          border: "1px solid rgba(239,68,68,0.3)",
                          color: "#f87171",
                          borderRadius: 6,
                          padding: "0.35rem 0.75rem",
                          cursor: "pointer",
                          fontSize: "0.82rem",
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
      {tab === "customers" && (
        <div>
          <h2
            style={{
              color: "#f8fafc",
              fontWeight: 700,
              marginBottom: "1rem",
              fontSize: "1.15rem",
            }}
          >
            Customers ({customers.length})
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.85rem",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "2px solid #2d2d2d" }}>
                  {["Name", "Phone", "Last Login"].map((h) => (
                    <th
                      key={h}
                      style={{
                        color: "#94a3b8",
                        textAlign: "left",
                        padding: "0.5rem 0.6rem",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c.phone}
                    style={{ borderBottom: "1px solid #1e1e1e" }}
                  >
                    <td style={{ color: "#f8fafc", padding: "0.6rem" }}>
                      {c.name}
                    </td>
                    <td style={{ color: "#94a3b8", padding: "0.6rem" }}>
                      {c.phone}
                    </td>
                    <td
                      style={{
                        color: "#6b7280",
                        padding: "0.6rem",
                        fontSize: "0.78rem",
                      }}
                    >
                      {toIST(c.loginTime)}
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        color: "#4b5563",
                        textAlign: "center",
                        padding: "2rem",
                      }}
                    >
                      No customers yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enquiries */}
      {tab === "enquiries" && (
        <div>
          <h2
            style={{
              color: "#f8fafc",
              fontWeight: 700,
              marginBottom: "1rem",
              fontSize: "1.15rem",
            }}
          >
            Enquiries ({enquiries.length})
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {enquiries.map((e) => (
              <div key={e.id} className="card-dark">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <p style={{ color: "#f8fafc", fontWeight: 600 }}>
                    {e.name} • {e.phone}
                  </p>
                  <span
                    style={{
                      color: e.status === "closed" ? "#4ade80" : "#fbbf24",
                      fontSize: "0.8rem",
                    }}
                  >
                    {e.status}
                  </span>
                </div>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.88rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {e.message}
                </p>
                <p
                  style={{
                    color: "#4b5563",
                    fontSize: "0.75rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  {toIST(e.createdAt)}
                </p>
                {e.adminReply && (
                  <p
                    style={{
                      color: "#4ade80",
                      fontSize: "0.85rem",
                      background: "rgba(22,163,74,0.08)",
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
                      className="input-dark"
                      placeholder="Reply..."
                      value={replyText[e.id] || ""}
                      onChange={(ev) =>
                        setReplyText((p) => ({ ...p, [e.id]: ev.target.value }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => sendReply(e.id)}
                      className="green-btn"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            ))}
            {enquiries.length === 0 && (
              <p style={{ color: "#4b5563" }}>No enquiries yet</p>
            )}
          </div>
        </div>
      )}

      {/* Sub Enquiries */}
      {tab === "sub-enquiries" && (
        <div>
          <h2
            style={{
              color: "#f8fafc",
              fontWeight: 700,
              marginBottom: "1rem",
              fontSize: "1.15rem",
            }}
          >
            Plan Enquiries ({subEnqs.length})
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.85rem",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "2px solid #2d2d2d" }}>
                  {["Name", "Phone", "Plan", "Date"].map((h) => (
                    <th
                      key={h}
                      style={{
                        color: "#94a3b8",
                        textAlign: "left",
                        padding: "0.5rem 0.6rem",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subEnqs.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #1e1e1e" }}>
                    <td style={{ color: "#f8fafc", padding: "0.6rem" }}>
                      {s.name}
                    </td>
                    <td style={{ color: "#94a3b8", padding: "0.6rem" }}>
                      {s.phone}
                    </td>
                    <td style={{ color: "#4ade80", padding: "0.6rem" }}>
                      {s.plan}
                    </td>
                    <td
                      style={{
                        color: "#6b7280",
                        padding: "0.6rem",
                        fontSize: "0.78rem",
                      }}
                    >
                      {toIST(s.createdAt)}
                    </td>
                  </tr>
                ))}
                {subEnqs.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        color: "#4b5563",
                        textAlign: "center",
                        padding: "2rem",
                      }}
                    >
                      No plan enquiries yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Live GPS */}
      {tab === "live" && (
        <div>
          <h2
            style={{
              color: "#f8fafc",
              fontWeight: 700,
              marginBottom: "1rem",
              fontSize: "1.15rem",
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
            {drivers.map((d) => (
              <div
                key={d.id}
                className="card-dark"
                style={{
                  borderColor: d.isOnline ? "rgba(22,163,74,0.3)" : undefined,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <img
                    src={d.avatar}
                    alt={d.name}
                    style={{ width: 40, height: 40, borderRadius: "50%" }}
                  />
                  <div>
                    <p style={{ color: "#f8fafc", fontWeight: 700 }}>
                      {d.name}
                    </p>
                    <p style={{ color: "#94a3b8", fontSize: "0.78rem" }}>
                      {d.city} • {d.vehicleTypes[0]}
                    </p>
                  </div>
                  <span
                    style={{
                      marginLeft: "auto",
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: d.isOnline ? "#4ade80" : "#6b7280",
                      display: "inline-block",
                    }}
                  />
                </div>
                <p
                  style={{
                    color: d.isOnline ? "#4ade80" : "#6b7280",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                  }}
                >
                  {d.isOnline ? "● Online" : "○ Offline"}
                </p>
              </div>
            ))}
            {drivers.length === 0 && (
              <p style={{ color: "#4b5563" }}>No drivers registered yet</p>
            )}
          </div>
        </div>
      )}

      {/* Finance */}
      {tab === "finance" && (
        <div>
          <h2
            style={{
              color: "#f8fafc",
              fontWeight: 700,
              marginBottom: "1rem",
              fontSize: "1.15rem",
            }}
          >
            Finance & Revenue
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: "0.75rem",
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
                c: "#4ade80",
              },
              {
                l: "Total Commission",
                v: `₹${bookings.reduce((s, b) => s + (b.commissionAmount || 0), 0).toLocaleString("en-IN")}`,
                c: "#fbbf24",
              },
              {
                l: "Driver Earnings",
                v: `₹${bookings.reduce((s, b) => s + (b.driverEarnings || 0), 0).toLocaleString("en-IN")}`,
                c: "#60a5fa",
              },
            ].map(({ l, v, c }) => (
              <div key={l} className="card-dark">
                <p style={{ color: "#6b7280", fontSize: "0.78rem" }}>{l}</p>
                <p style={{ color: c, fontWeight: 800, fontSize: "1.5rem" }}>
                  {v}
                </p>
              </div>
            ))}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.85rem",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "2px solid #2d2d2d" }}>
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
                        color: "#94a3b8",
                        textAlign: "left",
                        padding: "0.5rem 0.6rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} style={{ borderBottom: "1px solid #1e1e1e" }}>
                    <td
                      style={{
                        color: "#6b7280",
                        padding: "0.6rem",
                        fontSize: "0.75rem",
                      }}
                    >
                      {b.id}
                    </td>
                    <td style={{ color: "#f8fafc", padding: "0.6rem" }}>
                      {b.customerName}
                    </td>
                    <td
                      style={{
                        color: "#4ade80",
                        padding: "0.6rem",
                        fontWeight: 700,
                      }}
                    >
                      ₹{b.amount}
                    </td>
                    <td style={{ color: "#fbbf24", padding: "0.6rem" }}>
                      ₹{b.commissionAmount || Math.floor(b.amount * 0.15)}
                    </td>
                    <td style={{ color: "#60a5fa", padding: "0.6rem" }}>
                      ₹{b.driverEarnings || Math.floor(b.amount * 0.85)}
                    </td>
                    <td style={{ padding: "0.6rem" }}>
                      <span
                        style={{
                          background:
                            b.status === "completed"
                              ? "rgba(74,222,128,0.15)"
                              : "rgba(251,191,36,0.15)",
                          color:
                            b.status === "completed" ? "#4ade80" : "#fbbf24",
                          borderRadius: 9999,
                          padding: "2px 8px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        color: "#4b5563",
                        padding: "1.5rem",
                        textAlign: "center",
                      }}
                    >
                      No bookings yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pricing */}
      {tab === "pricing" && (
        <div style={{ maxWidth: 600 }}>
          <h2
            style={{
              color: "#f8fafc",
              fontWeight: 700,
              marginBottom: "0.5rem",
              fontSize: "1.15rem",
            }}
          >
            ⚙️ Pricing Configuration
          </h2>
          <p
            style={{
              color: "#6b7280",
              fontSize: "0.82rem",
              marginBottom: "1.5rem",
            }}
          >
            Formula: Total = max(₹{pricingForm.minimumFare}, ₹
            {pricingForm.baseFare} + distance × ₹{pricingForm.ratePerKm}/km +
            time × ₹{pricingForm.ratePerMin}/min) +{" "}
            {pricingForm.nightSurchargePercent}% night
          </p>
          <div className="card-dark" style={{ display: "grid", gap: "1rem" }}>
            {[
              { key: "baseFare", label: "Base Fare (₹)", min: 0 },
              { key: "ratePerKm", label: "Rate per km (₹)", min: 0 },
              { key: "ratePerMin", label: "Rate per min (₹)", min: 0 },
              { key: "minimumFare", label: "Minimum Fare (₹)", min: 0 },
              {
                key: "nightSurchargePercent",
                label: "Night Surcharge (%)",
                min: 0,
              },
              { key: "commissionPercent", label: "Commission (%)", min: 0 },
            ].map(({ key, label, min }) => (
              <div key={key}>
                <p
                  style={{
                    color: "#d1d5db",
                    fontSize: "0.85rem",
                    marginBottom: "0.3rem",
                  }}
                >
                  {label}
                </p>
                <input
                  type="number"
                  className="input-dark"
                  min={min}
                  value={
                    (pricingForm as unknown as Record<string, number>)[key]
                  }
                  onChange={(e) =>
                    setPricingForm((prev) => ({
                      ...prev,
                      [key]: Number(e.target.value),
                    }))
                  }
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                savePricingConfig(pricingForm as PricingConfig);
                window.alert("Pricing saved!");
              }}
              className="green-btn"
              style={{ justifyContent: "center" }}
            >
              💾 Save Pricing Config
            </button>
          </div>
        </div>
      )}
      {tab === "messages" && <MessagesTab />}
    </div>
  );
}

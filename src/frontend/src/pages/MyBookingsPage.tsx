import { useCallback, useEffect, useState } from "react";
import OTPModal from "../components/OTPModal";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { toIST } from "../utils/dateUtils";
import {
  type Booking,
  getBookings,
  getCurrentCustomer,
  updateBooking,
} from "../utils/store";
import { pushItem, sendSMS } from "../utils/syncService";

interface Props {
  navigate: (p: string) => void;
}

const STATUS_COLOR: Record<string, string> = {
  pending: "#fbbf24",
  confirmed: "#4ade80",
  completed: "#60a5fa",
  cancelled: "#f87171",
  "in-progress": "#a78bfa",
};

// --- Invoice Generator ---
function downloadInvoice(b: Booking) {
  const invoiceNumber = `DE-${b.id.slice(-6).toUpperCase()}`;
  const date = b.createdAt
    ? toIST(b.createdAt)
    : new Date().toLocaleString("en-IN");
  const fare = b.fareBreakdown;
  const distance = b.distanceKm ? `${b.distanceKm.toFixed(1)} km` : "N/A";
  const duration = b.durationMin ? `${b.durationMin} min` : "N/A";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>DriveEase Invoice ${invoiceNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Poppins', Arial, sans-serif; background: #f8fafc; color: #1e293b; }
    .page { max-width: 700px; margin: 0 auto; background: #fff; padding: 0; }
    .header { background: linear-gradient(135deg, #0d1a2e 0%, #162640 100%); padding: 32px 40px; display: flex; justify-content: space-between; align-items: flex-start; }
    .logo-area h1 { font-size: 28px; font-weight: 700; color: #00e676; letter-spacing: 1px; }
    .logo-area p { color: #94a3b8; font-size: 12px; margin-top: 4px; }
    .invoice-meta { text-align: right; }
    .invoice-meta .inv-num { color: #00e676; font-size: 18px; font-weight: 600; }
    .invoice-meta .inv-label { color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
    .invoice-meta .inv-date { color: #cbd5e1; font-size: 12px; margin-top: 6px; }
    .status-bar { background: ${STATUS_COLOR[b.status] || "#94a3b8"}22; border-bottom: 3px solid ${STATUS_COLOR[b.status] || "#94a3b8"}; padding: 10px 40px; display: flex; align-items: center; gap: 10px; }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; background: ${STATUS_COLOR[b.status] || "#94a3b8"}; }
    .status-text { color: ${STATUS_COLOR[b.status] || "#94a3b8"}; font-weight: 600; font-size: 13px; text-transform: capitalize; }
    .body { padding: 32px 40px; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 12px; font-weight: 600; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .info-item label { font-size: 11px; color: #94a3b8; display: block; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-item span { font-size: 14px; color: #1e293b; font-weight: 500; }
    .route-box { background: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; }
    .route-point { display: flex; align-items: flex-start; gap: 12px; }
    .route-point + .route-point { margin-top: 16px; padding-top: 16px; border-top: 1px dashed #cbd5e1; }
    .dot { width: 12px; height: 12px; border-radius: 50%; margin-top: 2px; flex-shrink: 0; }
    .dot.pickup { background: #00e676; }
    .dot.drop { background: #f87171; }
    .route-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
    .route-addr { font-size: 14px; color: #1e293b; font-weight: 500; margin-top: 2px; }
    .fare-table { width: 100%; border-collapse: collapse; }
    .fare-table td { padding: 9px 0; font-size: 14px; }
    .fare-table td:last-child { text-align: right; font-weight: 500; }
    .fare-table tr { border-bottom: 1px solid #f1f5f9; }
    .fare-table .total-row td { border-bottom: none; border-top: 2px solid #0d1a2e; padding-top: 14px; font-size: 17px; font-weight: 700; color: #0d1a2e; }
    .fare-table .total-row td:last-child { color: #00b84c; }
    .driver-card { display: flex; align-items: center; gap: 16px; background: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; }
    .driver-avatar { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #00e676, #0d9488); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; color: #fff; flex-shrink: 0; }
    .driver-name { font-size: 16px; font-weight: 600; color: #1e293b; }
    .driver-meta { font-size: 12px; color: #64748b; margin-top: 3px; }
    .footer { background: #0d1a2e; padding: 20px 40px; text-align: center; }
    .footer p { color: #475569; font-size: 11px; line-height: 1.7; }
    .footer .brand { color: #00e676; font-weight: 600; font-size: 12px; }
    .payment-badge { display: inline-block; background: #fff5f5; color: #8B0000; border: 1px solid #86efac; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .stats-row { display: flex; gap: 20px; }
    .stat-box { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; text-align: center; }
    .stat-val { font-size: 18px; font-weight: 700; color: #0d1a2e; }
    .stat-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 3px; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="logo-area">
        <h1>🚗 DriveEase</h1>
        <p>India's Personal Driver Network</p>
        <p style="color:#475569;font-size:11px;margin-top:8px;">GST: 22AAAAA0000A1Z5 &nbsp;|&nbsp; support: +91-7836887228</p>
      </div>
      <div class="invoice-meta">
        <div class="inv-label">Invoice</div>
        <div class="inv-num">${invoiceNumber}</div>
        <div class="inv-date">${date}</div>
        ${b.paymentMethod ? `<div style="margin-top:8px;"><span class="payment-badge">${b.paymentMethod} Paid</span></div>` : ""}
      </div>
    </div>

    <div class="status-bar">
      <div class="status-dot"></div>
      <div class="status-text">Ride ${b.status}</div>
      <div style="margin-left:auto;color:#64748b;font-size:12px;">Booking ID: ${b.id.slice(-10).toUpperCase()}</div>
    </div>

    <div class="body">

      <div class="section">
        <div class="section-title">Customer Details</div>
        <div class="info-grid">
          <div class="info-item"><label>Name</label><span>${b.customerName || "Customer"}</span></div>
          <div class="info-item"><label>Phone</label><span>${b.customerPhone || "—"}</span></div>
          <div class="info-item"><label>Ride Date</label><span>${b.startDate || "—"}</span></div>
          <div class="info-item"><label>End Date</label><span>${b.endDate || "—"}</span></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Driver Details</div>
        <div class="driver-card">
          <div class="driver-avatar">${(b.driverName || "D").slice(0, 2).toUpperCase()}</div>
          <div>
            <div class="driver-name">${b.driverName || "Driver TBD"}</div>
            <div class="driver-meta">${b.driverCity || ""} &nbsp;|&nbsp; Verified DriveEase Driver</div>
            <div class="driver-meta" style="margin-top:4px;">⭐ Rated &amp; Background Checked</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Route Details</div>
        <div class="route-box">
          <div class="route-point">
            <div class="dot pickup"></div>
            <div><div class="route-label">Pickup</div><div class="route-addr">${b.pickup}</div></div>
          </div>
          <div class="route-point">
            <div class="dot drop"></div>
            <div><div class="route-label">Drop</div><div class="route-addr">${b.drop}</div></div>
          </div>
        </div>
        ${
          distance !== "N/A" || duration !== "N/A"
            ? `
        <div class="stats-row" style="margin-top:16px;">
          <div class="stat-box"><div class="stat-val">${distance}</div><div class="stat-label">Distance</div></div>
          <div class="stat-box"><div class="stat-val">${duration}</div><div class="stat-label">Duration</div></div>
          <div class="stat-box"><div class="stat-val">${b.days || 1} day${(b.days || 1) > 1 ? "s" : ""}</div><div class="stat-label">Booking Days</div></div>
        </div>`
            : ""
        }
      </div>

      <div class="section">
        <div class="section-title">Fare Breakdown</div>
        <table class="fare-table">
          ${
            fare
              ? `
          <tr><td>Base Fare</td><td>₹${fare.baseFare?.toFixed(2) || "0.00"}</td></tr>
          ${fare.distanceFare ? `<tr><td>Distance Fare (${distance})</td><td>₹${fare.distanceFare.toFixed(2)}</td></tr>` : ""}
          ${fare.timeFare ? `<tr><td>Time Fare (${duration})</td><td>₹${fare.timeFare.toFixed(2)}</td></tr>` : ""}
          ${fare.nightSurcharge ? `<tr><td>Night Surcharge</td><td>₹${fare.nightSurcharge.toFixed(2)}</td></tr>` : ""}
          ${b.insurance ? "<tr><td>Insurance Add-on</td><td>₹200.00</td></tr>" : ""}
          <tr class="total-row"><td>Total Amount</td><td>₹${b.amount?.toFixed(2) || "0.00"}</td></tr>
          `
              : `
          <tr><td>Ride Charge</td><td>₹${b.amount?.toFixed(2) || "0.00"}</td></tr>
          ${b.insurance ? "<tr><td>Insurance Add-on</td><td>₹200.00</td></tr>" : ""}
          <tr class="total-row"><td>Total Amount</td><td>₹${b.amount?.toFixed(2) || "0.00"}</td></tr>
          `
          }
        </table>
      </div>

    </div>

    <div class="footer">
      <p class="brand">DriveEase – India's First Personal Driver Network</p>
      <p>This is a computer-generated invoice. For support, contact us at +91-7836887228</p>
      <p style="margin-top:6px;color:#334155;">Thank you for choosing DriveEase. Drive Safe! 🚗</p>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `DriveEase-Invoice-${invoiceNumber}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// --- Mini Map for route ---
function RouteMap({ pickup, drop }: { pickup: string; drop: string }) {
  const [showMap, setShowMap] = useState(false);

  const encodedPickup = encodeURIComponent(`${pickup}, India`);
  const encodedDrop = encodeURIComponent(`${drop}, India`);

  return (
    <div style={{ marginTop: 12 }}>
      <button
        type="button"
        onClick={() => setShowMap((v) => !v)}
        style={{
          background: showMap
            ? "rgba(248,113,113,0.1)"
            : "rgba(220,20,60,0.08)",
          border: `1px solid ${showMap ? "rgba(248,113,113,0.3)" : "rgba(0,230,118,0.3)"}`,
          color: showMap ? "#f87171" : "#00e676",
          borderRadius: 8,
          padding: "0.4rem 0.9rem",
          cursor: "pointer",
          fontSize: "0.82rem",
          fontFamily: "'Poppins', sans-serif",
          display: "flex",
          alignItems: "center",
          gap: 6,
          minHeight: 36,
        }}
      >
        <span>{showMap ? "🗺️ Hide Map" : "🗺️ View Route Map"}</span>
      </button>
      {showMap && (
        <div
          style={{
            marginTop: 10,
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid rgba(0,230,118,0.2)",
            background: "#0a1628",
          }}
        >
          <div
            style={{
              background: "#0d1a2e",
              padding: "8px 12px",
              display: "flex",
              gap: 16,
              fontSize: "0.76rem",
              flexWrap: "wrap",
            }}
          >
            <span style={{ color: "#00e676" }}>📍 {pickup}</span>
            <span style={{ color: "#94a3b8" }}>→</span>
            <span style={{ color: "#f87171" }}>🏁 {drop}</span>
          </div>
          <iframe
            title="Route Map"
            src="https://www.openstreetmap.org/export/embed.html?layer=mapnik"
            width="100%"
            height="240"
            style={{
              border: "none",
              display: "block",
              filter: "brightness(0.9) saturate(1.2)",
            }}
            loading="lazy"
          />
          <div
            style={{
              background: "#0d1a2e",
              padding: "8px 12px",
              textAlign: "center",
            }}
          >
            <a
              href={`https://www.openstreetmap.org/directions?from=${encodedPickup}&to=${encodedDrop}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#00e676",
                fontSize: "0.78rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              🔗 Open Full Route in Maps
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingCard({ b, onCancel }: { b: Booking; onCancel?: () => void }) {
  const isCompleted = b.status === "completed";

  return (
    <div
      data-ocid="bookings.item.1"
      style={{
        background: "#0d1420",
        border: "1px solid rgba(0,230,118,0.15)",
        borderRadius: 14,
        padding: "1.25rem",
        boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "0.75rem",
        }}
      >
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>
            {b.driverName || "Driver TBD"}
          </div>
          <div style={{ color: "#64748b", fontSize: "0.78rem", marginTop: 2 }}>
            {b.createdAt ? toIST(b.createdAt) : ""}
          </div>
        </div>
        <span
          style={{
            background: `${STATUS_COLOR[b.status] || "#94a3b8"}22`,
            color: STATUS_COLOR[b.status] || "#94a3b8",
            border: `1px solid ${STATUS_COLOR[b.status] || "#94a3b8"}44`,
            padding: "0.25rem 0.75rem",
            borderRadius: 9999,
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "capitalize",
          }}
        >
          {b.status}
        </span>
      </div>
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          paddingTop: "0.75rem",
          marginBottom: "0.75rem",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "flex-start",
            marginBottom: "0.4rem",
          }}
        >
          <span style={{ color: "#00e676", fontSize: "0.8rem", marginTop: 2 }}>
            📍
          </span>
          <div>
            <div style={{ color: "#94a3b8", fontSize: "0.72rem" }}>PICKUP</div>
            <div style={{ color: "#e2e8f0", fontSize: "0.85rem" }}>
              {b.pickup}
            </div>
          </div>
        </div>
        <div
          style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}
        >
          <span style={{ color: "#f87171", fontSize: "0.8rem", marginTop: 2 }}>
            🏁
          </span>
          <div>
            <div style={{ color: "#94a3b8", fontSize: "0.72rem" }}>DROP</div>
            <div style={{ color: "#e2e8f0", fontSize: "0.85rem" }}>
              {b.drop}
            </div>
          </div>
        </div>

        {/* Route Map */}
        <RouteMap pickup={b.pickup} drop={b.drop} />
      </div>

      {/* Fare & action row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <div style={{ color: "#4ade80", fontWeight: 700, fontSize: "1rem" }}>
            ₹{b.amount}
          </div>
          {b.distanceKm && (
            <div
              style={{ color: "#64748b", fontSize: "0.75rem", marginTop: 2 }}
            >
              {b.distanceKm.toFixed(1)} km
              {b.durationMin ? ` • ${b.durationMin} min` : ""}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {isCompleted && (
            <button
              type="button"
              onClick={() => downloadInvoice(b)}
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,230,118,0.15), rgba(220,20,60,0.08))",
                border: "1px solid rgba(0,230,118,0.4)",
                color: "#00e676",
                borderRadius: 8,
                padding: "0.4rem 0.9rem",
                cursor: "pointer",
                fontSize: "0.82rem",
                fontFamily: "'Poppins', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 5,
                minHeight: 36,
                fontWeight: 600,
              }}
            >
              ⬇️ Download Invoice
            </button>
          )}
          {b.status === "pending" && onCancel && (
            <button
              type="button"
              data-ocid="bookings.cancel_button"
              onClick={onCancel}
              style={{
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.3)",
                color: "#f87171",
                borderRadius: 8,
                padding: "0.4rem 0.9rem",
                cursor: "pointer",
                fontSize: "0.82rem",
                fontFamily: "'Poppins', sans-serif",
                minHeight: 36,
              }}
            >
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyBookingsPage({ navigate }: Props) {
  const customer = getCurrentCustomer();
  const [showOTP, setShowOTP] = useState(!customer);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [profileName, setProfileName] = useState(customer?.name || "");
  const [profileEmail, setProfileEmail] = useState("");

  const loadBookings = useCallback(() => {
    const c = getCurrentCustomer();
    if (!c) return;
    const all = getBookings().filter((b) => b.customerId === c.phone);
    setBookings(all.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)));
  }, []);

  useEffect(() => {
    if (!showOTP) loadBookings();
  }, [showOTP, loadBookings]);

  const cancelBooking = useCallback(
    async (b: Booking) => {
      if (!window.confirm("Cancel this booking?")) return;

      updateBooking(b.id, { status: "cancelled" });
      await pushItem("de_bookings", { ...b, status: "cancelled" });
      const c = getCurrentCustomer();
      if (c?.phone) {
        await sendSMS(
          c.phone,
          `DriveEase: Your booking for ${b.driverName} has been cancelled. Booking ID: ${b.id.slice(-6).toUpperCase()}`,
        );
      }
      loadBookings();
    },
    [loadBookings],
  );

  const saveProfile = useCallback(() => {
    const c = getCurrentCustomer();
    if (!c) return;
    const updated = { ...c, name: profileName };
    localStorage.setItem("de_current_customer", JSON.stringify(updated));
    setEditMode(false);
  }, [profileName]);

  if (showOTP) {
    return (
      <OTPModal
        onSuccess={() => {
          setShowOTP(false);
          loadBookings();
        }}
        onClose={() => navigate("home")}
      />
    );
  }

  const activeBookings = bookings.filter((b) =>
    ["pending", "confirmed", "in-progress"].includes(b.status),
  );
  const historyBookings = bookings.filter((b) =>
    ["completed", "cancelled"].includes(b.status),
  );

  const cardStyle: React.CSSProperties = {
    background: "#0d1420",
    border: "1px solid rgba(0,230,118,0.12)",
    borderRadius: 14,
    padding: "1.5rem",
    boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#0a1628",
    border: "1px solid rgba(0,230,118,0.2)",
    color: "#e2e8f0",
    borderRadius: 8,
    padding: "0.6rem 0.85rem",
    fontSize: "0.9rem",
    fontFamily: "'Poppins', sans-serif",
    outline: "none",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060d1a",
        padding: "2rem 1rem",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: "1.4rem",
              marginBottom: "0.25rem",
            }}
          >
            My Bookings
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
            Manage your rides and download invoices
          </p>
        </div>

        <Tabs defaultValue="active">
          <TabsList
            style={{
              background: "#0d1420",
              border: "1px solid rgba(0,230,118,0.12)",
              marginBottom: "1.25rem",
              width: "100%",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
            }}
          >
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeBookings.length === 0 ? (
              <div
                data-ocid="bookings.active.empty_state"
                style={{ ...cardStyle, textAlign: "center", padding: "3rem" }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚗</div>
                <h3
                  style={{
                    color: "#94a3b8",
                    fontWeight: 600,
                    fontSize: "1rem",
                  }}
                >
                  No active bookings
                </h3>
                <p
                  style={{
                    color: "#64748b",
                    fontSize: "0.875rem",
                    marginTop: "0.5rem",
                  }}
                >
                  Ready to book your next ride?
                </p>
                <button
                  type="button"
                  onClick={() => navigate("book")}
                  className="red-btn"
                  style={{ marginTop: "1.25rem" }}
                >
                  Book a Driver
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {activeBookings.map((b) => (
                  <BookingCard
                    key={b.id}
                    b={b}
                    onCancel={() => cancelBooking(b)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {historyBookings.length === 0 ? (
              <div
                data-ocid="bookings.history.empty_state"
                style={{ ...cardStyle, textAlign: "center", padding: "3rem" }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🕐</div>
                <h3 style={{ color: "#94a3b8", fontWeight: 600 }}>
                  No booking history yet
                </h3>
                <p
                  style={{
                    color: "#64748b",
                    fontSize: "0.85rem",
                    marginTop: "0.5rem",
                  }}
                >
                  Completed rides will appear here with invoice download
                </p>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    background: "rgba(0,230,118,0.06)",
                    border: "1px solid rgba(0,230,118,0.15)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: "1rem" }}>💡</span>
                  <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                    Tap{" "}
                    <strong style={{ color: "#00e676" }}>
                      ⬇️ Download Invoice
                    </strong>{" "}
                    on completed rides to get your bill
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {historyBookings.map((b) => (
                    <BookingCard key={b.id} b={b} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <div style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h2
                  style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}
                >
                  Profile Settings
                </h2>
                <button
                  type="button"
                  data-ocid="bookings.profile.edit_button"
                  onClick={() => setEditMode((v) => !v)}
                  style={{
                    background: editMode
                      ? "rgba(248,113,113,0.1)"
                      : "rgba(0,230,118,0.1)",
                    border: `1px solid ${
                      editMode ? "rgba(248,113,113,0.3)" : "rgba(0,230,118,0.3)"
                    }`,
                    color: editMode ? "#f87171" : "#00e676",
                    borderRadius: 8,
                    padding: "0.4rem 0.9rem",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontFamily: "'Poppins', sans-serif",
                    minHeight: 36,
                  }}
                >
                  {editMode ? "Cancel" : "Edit Profile"}
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    htmlFor="_"
                    style={{
                      color: "#94a3b8",
                      fontSize: "0.82rem",
                      display: "block",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Full Name
                  </label>
                  {editMode ? (
                    <input
                      data-ocid="bookings.profile.name_input"
                      style={inputStyle}
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Your name"
                    />
                  ) : (
                    <div
                      style={{
                        color: "#e2e8f0",
                        fontSize: "0.95rem",
                        padding: "0.6rem 0",
                      }}
                    >
                      {customer?.name || "—"}
                    </div>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="_"
                    style={{
                      color: "#94a3b8",
                      fontSize: "0.82rem",
                      display: "block",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Phone Number
                  </label>
                  <div
                    style={{
                      color: "#e2e8f0",
                      fontSize: "0.95rem",
                      padding: "0.6rem 0",
                    }}
                  >
                    {customer?.phone}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="_"
                    style={{
                      color: "#94a3b8",
                      fontSize: "0.82rem",
                      display: "block",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Email
                  </label>
                  {editMode ? (
                    <input
                      data-ocid="bookings.profile.email_input"
                      style={inputStyle}
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                  ) : (
                    <div
                      style={{
                        color: "#e2e8f0",
                        fontSize: "0.95rem",
                        padding: "0.6rem 0",
                      }}
                    >
                      {profileEmail || "—"}
                    </div>
                  )}
                </div>
                {editMode && (
                  <button
                    type="button"
                    data-ocid="bookings.profile.save_button"
                    onClick={saveProfile}
                    className="red-btn"
                    style={{ marginTop: "0.5rem", minHeight: 48 }}
                  >
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

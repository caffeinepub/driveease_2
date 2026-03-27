import { useCallback, useEffect, useState } from "react";
import OTPModal from "../components/OTPModal";
import { Badge } from "../components/ui/badge";
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

function BookingCard({ b, onCancel }: { b: Booking; onCancel?: () => void }) {
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
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ color: "#4ade80", fontWeight: 700, fontSize: "1rem" }}>
          ₹{b.amount}
        </div>
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
  );
}

export default function MyBookingsPage({ navigate }: Props) {
  const customer = getCurrentCustomer();
  const [showOTP, setShowOTP] = useState(!customer);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [profileName, setProfileName] = useState(customer?.name || "");
  const [profileEmail, setProfileEmail] = useState("");

  const load = useCallback(() => {
    const c = getCurrentCustomer();
    if (c) {
      setBookings(getBookings().filter((b) => b.customerPhone === c.phone));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cancelBooking = async (b: Booking) => {
    updateBooking(b.id, { status: "cancelled" });
    const updated = { ...b, status: "cancelled" as Booking["status"] };
    await pushItem("bookings", updated as unknown as { id: string });
    if (customer) {
      await sendSMS(
        customer.phone,
        "Your DriveEase booking has been cancelled.",
      );
    }
    load();
  };

  const saveProfile = () => {
    const c = getCurrentCustomer();
    if (!c) return;
    const updated = { ...c, name: profileName, email: profileEmail };
    localStorage.setItem("de_user", JSON.stringify(updated));
    setEditMode(false);
  };

  if (showOTP) {
    return (
      <OTPModal
        onClose={() => navigate("home")}
        onSuccess={() => {
          setShowOTP(false);
          load();
        }}
      />
    );
  }

  const activeBookings = bookings.filter((b) =>
    [
      "pending",
      "confirmed",
      "in-progress",
      "searching",
      "assigned",
      "arrived",
      "started",
    ].includes(b.status),
  );
  const historyBookings = bookings.filter((b) =>
    ["completed", "cancelled"].includes(b.status),
  );

  const cardStyle: React.CSSProperties = {
    background: "#0d1420",
    border: "1px solid rgba(0,230,118,0.15)",
    borderRadius: 14,
    padding: "1.5rem",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#111827",
    border: "1px solid rgba(0,230,118,0.25)",
    color: "#e2e8f0",
    borderRadius: 10,
    padding: "0.75rem 1rem",
    fontSize: "1rem",
    fontFamily: "'Poppins', sans-serif",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            color: "#fff",
            fontWeight: 800,
            fontSize: "1.75rem",
            marginBottom: "0.25rem",
          }}
        >
          My Dashboard
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
          Logged in as:{" "}
          <span style={{ color: "#4ade80" }}>{customer?.phone}</span>
        </p>
      </div>

      <Tabs defaultValue="active">
        <TabsList
          data-ocid="bookings.tab"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: "0.25rem",
            marginBottom: "1.5rem",
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
          }}
        >
          <TabsTrigger value="active" data-ocid="bookings.active_tab">
            Active Bookings
          </TabsTrigger>
          <TabsTrigger value="history" data-ocid="bookings.history_tab">
            Booking History
          </TabsTrigger>
          <TabsTrigger value="profile" data-ocid="bookings.profile_tab">
            Profile Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeBookings.length === 0 ? (
            <div
              data-ocid="bookings.empty_state"
              style={{ ...cardStyle, textAlign: "center", padding: "3rem" }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
              <h3 style={{ color: "#94a3b8", fontWeight: 600 }}>
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
                className="green-btn"
                style={{ marginTop: "1.25rem" }}
              >
                Book a Driver
              </button>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
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
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {historyBookings.map((b) => (
                <BookingCard key={b.id} b={b} />
              ))}
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
                  border: `1px solid ${editMode ? "rgba(248,113,113,0.3)" : "rgba(0,230,118,0.3)"}`,
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
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
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
                  className="green-btn"
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
  );
}

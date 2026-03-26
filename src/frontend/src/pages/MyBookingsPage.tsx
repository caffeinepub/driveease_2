import { useCallback, useEffect, useState } from "react";
import OTPModal from "../components/OTPModal";
import { toIST } from "../utils/dateUtils";
import {
  type Booking,
  type CallbackRequest,
  type WalletTransaction,
  addWalletTransaction,
  getBookings,
  getCurrentCustomer,
  getWallet,
  saveCallbackRequest,
  uid,
  updateBooking,
} from "../utils/store";
import { pushItem } from "../utils/syncService";

interface Props {
  navigate: (p: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#fbbf24",
  confirmed: "#4ade80",
  cancelled: "#f87171",
  completed: "#60a5fa",
  "in-progress": "#a78bfa",
};

const RIDE_STATES: Array<Booking["rideState"]> = [
  "searching",
  "assigned",
  "arrived",
  "started",
  "completed",
];

const RIDE_STATE_COLORS: Record<string, string> = {
  searching: "#fbbf24",
  assigned: "#60a5fa",
  arrived: "#a78bfa",
  started: "#4ade80",
  completed: "#6b7280",
  cancelled: "#f87171",
};

function RideStateStepper({ state }: { state?: Booking["rideState"] }) {
  if (!state || state === "cancelled") return null;
  const currentIdx = RIDE_STATES.indexOf(state);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        margin: "0.75rem 0",
        overflowX: "auto",
        paddingBottom: "0.25rem",
      }}
    >
      {RIDE_STATES.map((s, i) => (
        <>
          <div
            key={s}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.25rem",
              minWidth: 60,
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: i <= currentIdx ? "#16a34a" : "#1e1e1e",
                border: `2px solid ${i <= currentIdx ? "#16a34a" : "#2a2a2a"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.65rem",
                color: i <= currentIdx ? "white" : "#6b7280",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {i < currentIdx ? "✓" : i + 1}
            </div>
            <span
              style={{
                fontSize: "0.62rem",
                color: i <= currentIdx ? "#4ade80" : "#6b7280",
                textAlign: "center",
                textTransform: "capitalize",
                whiteSpace: "nowrap",
              }}
            >
              {s}
            </span>
          </div>
          {i < RIDE_STATES.length - 1 && (
            <div
              key={`line-${s}`}
              style={{
                flex: 1,
                height: 2,
                background: i < currentIdx ? "#16a34a" : "#2a2a2a",
                minWidth: 12,
                marginBottom: 18,
              }}
            />
          )}
        </>
      ))}
    </div>
  );
}

function FareBreakdown({ b }: { b: Booking }) {
  const [open, setOpen] = useState(false);
  if (!b.fareBreakdown) return null;
  const fd = b.fareBreakdown;
  return (
    <div style={{ marginTop: "0.5rem" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          background: "none",
          border: "none",
          color: "#60a5fa",
          cursor: "pointer",
          fontSize: "0.8rem",
          padding: 0,
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
        }}
      >
        {open ? "▼" : "▶"} Fare Breakdown
      </button>
      {open && (
        <div
          style={{
            marginTop: "0.5rem",
            background: "rgba(96,165,250,0.05)",
            border: "1px solid rgba(96,165,250,0.15)",
            borderRadius: 8,
            padding: "0.75rem",
            fontSize: "0.82rem",
          }}
        >
          {[
            ["Base Fare", `₹${fd.baseFare}`],
            ["Distance Fare", `₹${fd.distanceFare.toFixed(0)}`],
            ["Time Fare", `₹${fd.timeFare.toFixed(0)}`],
            ...(fd.isNightCharge
              ? [["Night Surcharge", `+₹${fd.nightSurcharge}`]]
              : []),
          ].map(([l, v]) => (
            <div
              key={l}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.2rem 0",
                color: "#4b7e4b",
              }}
            >
              <span>{l}</span>
              <span style={{ color: "#14532d" }}>{v}</span>
            </div>
          ))}
          <hr style={{ borderColor: "#2a2a2a", margin: "0.4rem 0" }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "#4ade80",
              fontWeight: 700,
            }}
          >
            <span>Total</span>
            <span>₹{fd.total}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyBookingsPage({ navigate }: Props) {
  const customer = getCurrentCustomer();
  const [showOTP, setShowOTP] = useState(!customer);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wallet, setWallet] = useState(() =>
    customer
      ? getWallet(customer.phone)
      : { balance: 0, transactions: [] as WalletTransaction[] },
  );
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addAmount, setAddAmount] = useState("500");
  const [callbackModal, setCallbackModal] = useState<string | null>(null); // bookingId
  const [callbackNote, setCallbackNote] = useState("");
  const [callbackSuccess, setCallbackSuccess] = useState<string | null>(null);

  const load = useCallback(() => {
    const c = getCurrentCustomer();
    if (c) {
      setBookings(getBookings().filter((b) => b.customerPhone === c.phone));
      setWallet(getWallet(c.phone));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddMoney = () => {
    if (!customer) return;
    const amt = Number(addAmount);
    if (!amt || amt <= 0) return;
    addWalletTransaction(
      customer.phone,
      amt,
      "credit",
      "Wallet top-up via UPI",
    );
    setAddAmount("500");
    setShowAddMoney(false);
    load();
  };

  if (showOTP)
    return (
      <OTPModal
        onClose={() => navigate("home")}
        onSuccess={() => {
          setShowOTP(false);
          load();
        }}
      />
    );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1
        style={{
          color: "#14532d",
          fontWeight: 800,
          fontSize: "1.75rem",
          marginBottom: "0.25rem",
        }}
      >
        My Bookings
      </h1>
      <p style={{ color: "#4b7e4b", marginBottom: "2rem", fontSize: "0.9rem" }}>
        Logged in as: {customer?.phone}
      </p>

      {/* Wallet Section */}
      <div
        className="card-dark"
        style={{ marginBottom: "1.75rem", borderColor: "rgba(96,165,250,0.2)" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "0.75rem",
            marginBottom: wallet.transactions.length > 0 ? "1rem" : 0,
          }}
        >
          <div>
            <p
              style={{
                color: "#6b7280",
                fontSize: "0.78rem",
                marginBottom: "0.25rem",
              }}
            >
              👛 WALLET BALANCE
            </p>
            <p
              style={{ color: "#60a5fa", fontWeight: 800, fontSize: "1.75rem" }}
            >
              ₹{wallet.balance}
            </p>
          </div>
          <button
            type="button"
            data-ocid="wallet.primary_button"
            onClick={() => setShowAddMoney(true)}
            style={{
              background: "rgba(96,165,250,0.15)",
              border: "1px solid rgba(96,165,250,0.3)",
              color: "#60a5fa",
              borderRadius: 8,
              padding: "0.5rem 1rem",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.85rem",
            }}
          >
            + Add Money
          </button>
        </div>

        {wallet.transactions.length > 0 && (
          <div
            style={{ borderTop: "1px solid #2a2a2a", paddingTop: "0.75rem" }}
          >
            <p
              style={{
                color: "#6b7280",
                fontSize: "0.75rem",
                marginBottom: "0.5rem",
              }}
            >
              RECENT TRANSACTIONS
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
                maxHeight: 160,
                overflowY: "auto",
              }}
            >
              {wallet.transactions.slice(0, 6).map((tx) => (
                <div
                  key={tx.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.82rem",
                  }}
                >
                  <span style={{ color: "#4b7e4b" }}>{tx.description}</span>
                  <span
                    style={{
                      color: tx.type === "credit" ? "#4ade80" : "#f87171",
                      fontWeight: 600,
                    }}
                  >
                    {tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Money Modal */}
      {showAddMoney && (
        <div
          data-ocid="wallet.modal"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "1rem",
          }}
        >
          <div
            className="card-dark"
            style={{ width: "100%", maxWidth: 400, textAlign: "center" }}
          >
            <h3
              style={{
                color: "#14532d",
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              👛 Add Money to Wallet
            </h3>
            <p
              style={{
                color: "#4b7e4b",
                fontSize: "0.85rem",
                marginBottom: "1.25rem",
              }}
            >
              Pay via PhonePe / UPI to:
              <br />
              <strong style={{ color: "#4ade80" }}>
                +91-7836887228 (Krishna Pandey)
              </strong>
            </p>
            <input
              className="input-dark"
              type="number"
              placeholder="Amount (₹)"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              style={{ marginBottom: "1rem" }}
            />
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                data-ocid="wallet.cancel_button"
                onClick={() => setShowAddMoney(false)}
                style={{
                  flex: 1,
                  background: "none",
                  border: "1px solid #2a2a2a",
                  color: "#4b7e4b",
                  borderRadius: 8,
                  padding: "0.65rem",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="wallet.confirm_button"
                onClick={handleAddMoney}
                className="green-btn"
                style={{ flex: 2, justifyContent: "center" }}
              >
                Confirm Add ₹{addAmount}
              </button>
            </div>
          </div>
        </div>
      )}

      {bookings.length === 0 ? (
        <div
          data-ocid="bookings.empty_state"
          style={{
            textAlign: "center",
            padding: "4rem",
            background: "#1e1e1e",
            borderRadius: 16,
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚗</div>
          <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
            No bookings yet
          </p>
          <button
            type="button"
            onClick={() => navigate("drivers")}
            className="green-btn"
          >
            Book Your First Driver
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {bookings.map((b, idx) => (
            <div
              key={b.id}
              data-ocid={`bookings.item.${idx + 1}`}
              className="card-dark"
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <div>
                  <span style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                    #{b.id}
                  </span>
                  <h3
                    style={{
                      color: "#14532d",
                      fontWeight: 700,
                      fontSize: "1.05rem",
                    }}
                  >
                    {b.driverName} • {b.driverCity}
                  </h3>
                </div>
                <div
                  style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}
                >
                  {b.rideState && b.rideState !== "cancelled" && (
                    <span
                      style={{
                        background: `${RIDE_STATE_COLORS[b.rideState] || "#94a3b8"}15`,
                        color: RIDE_STATE_COLORS[b.rideState] || "#94a3b8",
                        border: `1px solid ${RIDE_STATE_COLORS[b.rideState] || "#94a3b8"}40`,
                        borderRadius: 9999,
                        padding: "0.2rem 0.75rem",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {b.rideState}
                    </span>
                  )}
                  <span
                    style={{
                      background: `${STATUS_COLORS[b.status] || "#94a3b8"}20`,
                      color: STATUS_COLORS[b.status] || "#94a3b8",
                      border: `1px solid ${STATUS_COLORS[b.status] || "#94a3b8"}40`,
                      borderRadius: 9999,
                      padding: "0.2rem 0.75rem",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  >
                    {b.status}
                  </span>
                </div>
              </div>

              {/* Ride state stepper */}
              <RideStateStepper state={b.rideState} />

              {/* OTP */}
              {b.rideOtp &&
                (b.status === "pending" || b.status === "confirmed") && (
                  <div
                    style={{
                      background: "rgba(22,163,74,0.1)",
                      border: "2px solid rgba(22,163,74,0.4)",
                      borderRadius: 12,
                      padding: "1rem",
                      marginBottom: "0.75rem",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        color: "#4b7e4b",
                        fontSize: "0.78rem",
                        marginBottom: "0.35rem",
                      }}
                    >
                      YOUR RIDE OTP
                    </p>
                    <div
                      style={{
                        fontSize: "2.5rem",
                        fontWeight: 900,
                        color: "#4ade80",
                        letterSpacing: "0.3em",
                        fontFamily: "monospace",
                      }}
                    >
                      {b.rideOtp}
                    </div>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "0.78rem",
                        marginTop: "0.35rem",
                      }}
                    >
                      Share this OTP with your driver to start the ride
                    </p>
                  </div>
                )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                  gap: "0.5rem",
                  fontSize: "0.88rem",
                  marginBottom: "0.75rem",
                }}
              >
                <span style={{ color: "#4b7e4b" }}>
                  📍 From: <span style={{ color: "#14532d" }}>{b.pickup}</span>
                </span>
                <span style={{ color: "#4b7e4b" }}>
                  To: <span style={{ color: "#14532d" }}>{b.drop}</span>
                </span>
                {b.distanceKm && (
                  <span style={{ color: "#4b7e4b" }}>
                    Distance:{" "}
                    <span style={{ color: "#14532d" }}>{b.distanceKm} km</span>
                  </span>
                )}
                {b.paymentMethod && (
                  <span style={{ color: "#4b7e4b" }}>
                    Payment:{" "}
                    <span style={{ color: "#14532d" }}>{b.paymentMethod}</span>
                  </span>
                )}
                <span style={{ color: "#4b7e4b" }}>
                  Amount:{" "}
                  <span style={{ color: "#4ade80", fontWeight: 700 }}>
                    ₹{b.amount}
                  </span>
                </span>
                {b.insurance && (
                  <span style={{ color: "#60a5fa", fontSize: "0.82rem" }}>
                    🛡️ Insurance included
                  </span>
                )}
              </div>

              <FareBreakdown b={b} />

              <p
                style={{
                  color: "#4b5563",
                  fontSize: "0.78rem",
                  marginTop: "0.5rem",
                }}
              >
                Booked: {toIST(b.createdAt)}
              </p>

              {b.status === "confirmed" && (
                <button
                  type="button"
                  onClick={() => {
                    updateBooking(b.id, {
                      status: "completed",
                      rideState: "completed",
                    });
                    load();
                  }}
                  style={{
                    background: "rgba(96,165,250,0.15)",
                    border: "1px solid rgba(96,165,250,0.3)",
                    color: "#60a5fa",
                    borderRadius: 8,
                    padding: "0.45rem 1rem",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    marginTop: "0.5rem",
                  }}
                >
                  ✅ Complete & Pay
                </button>
              )}
              {/* Callback request */}
              <button
                type="button"
                data-ocid="booking.secondary_button"
                onClick={() => {
                  setCallbackModal(b.id);
                  setCallbackNote("");
                  setCallbackSuccess(null);
                }}
                style={{
                  background: "rgba(251,191,36,0.12)",
                  border: "1px solid rgba(251,191,36,0.35)",
                  color: "#fbbf24",
                  borderRadius: 8,
                  padding: "0.45rem 1rem",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  marginTop: "0.4rem",
                  marginLeft: "0.4rem",
                }}
              >
                📞 Request Callback
              </button>
              {callbackSuccess === b.id && (
                <p
                  data-ocid="booking.success_state"
                  style={{
                    color: "#4ade80",
                    fontSize: "0.82rem",
                    marginTop: "0.4rem",
                  }}
                >
                  ✅ We'll call you back soon!
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Callback Modal */}
      {callbackModal && (
        <div
          data-ocid="callback.modal"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "1rem",
          }}
        >
          <div className="card-dark" style={{ width: "100%", maxWidth: 420 }}>
            <h3
              style={{
                color: "#14532d",
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              📞 Request Callback
            </h3>
            <p
              style={{
                color: "#4b7e4b",
                fontSize: "0.88rem",
                marginBottom: "1rem",
              }}
            >
              Tell us your preferred time or any note for the call:
            </p>
            <textarea
              className="input-dark"
              rows={3}
              placeholder="e.g. Please call after 5 PM, I have a question about my booking..."
              value={callbackNote}
              onChange={(e) => setCallbackNote(e.target.value)}
              style={{ marginBottom: "1rem", resize: "vertical" }}
            />
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                data-ocid="callback.cancel_button"
                onClick={() => setCallbackModal(null)}
                style={{
                  flex: 1,
                  background: "none",
                  border: "1px solid #2a2a2a",
                  color: "#4b7e4b",
                  borderRadius: 8,
                  padding: "0.65rem",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="callback.confirm_button"
                onClick={() => {
                  if (!customer) return;
                  const req: CallbackRequest = {
                    id: uid(),
                    customerName: customer.name,
                    customerPhone: customer.phone,
                    requestedAt: new Date().toISOString(),
                    status: "pending",
                    note: callbackNote,
                  };
                  saveCallbackRequest(req);
                  pushItem(
                    "callback_requests",
                    req as unknown as { id: string },
                  );
                  setCallbackSuccess(callbackModal);
                  setCallbackModal(null);
                }}
                className="green-btn"
                style={{ flex: 2, justifyContent: "center" }}
              >
                Request Callback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

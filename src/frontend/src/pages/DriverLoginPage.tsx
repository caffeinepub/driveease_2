import { useCallback, useEffect, useRef, useState } from "react";
import type { Driver } from "../data/drivers";
import { toIST } from "../utils/dateUtils";
import {
  getBookings,
  getCurrentDriver,
  getDrivers,
  logoutDriver,
  setCurrentDriver,
  updateBooking,
  updateBookingRideOtp,
} from "../utils/store";

function NoShowTimer({
  arrivedAt,
  onNoShow,
}: { arrivedAt: string; onNoShow: () => void }) {
  const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
  const [elapsed, setElapsed] = useState(0);
  const cbRef = useRef(onNoShow);
  cbRef.current = onNoShow;

  useEffect(() => {
    const t = setInterval(() => {
      const e = Date.now() - new Date(arrivedAt).getTime();
      setElapsed(e);
    }, 1000);
    return () => clearInterval(t);
  }, [arrivedAt]);

  const remaining = Math.max(0, TIMEOUT_MS - elapsed);
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const expired = remaining === 0;

  return (
    <div
      style={{
        background: expired ? "rgba(239,68,68,0.08)" : "rgba(251,191,36,0.08)",
        border: `1px solid ${expired ? "rgba(239,68,68,0.3)" : "rgba(251,191,36,0.3)"}`,
        borderRadius: 8,
        padding: "0.75rem",
        marginBottom: "0.75rem",
        textAlign: "center",
      }}
    >
      <p
        style={{
          color: expired ? "#f87171" : "#fbbf24",
          fontSize: "0.8rem",
          marginBottom: "0.25rem",
        }}
      >
        {expired ? "Wait time expired!" : "Customer wait time"}
      </p>
      <div
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          color: expired ? "#f87171" : "#fbbf24",
          fontFamily: "monospace",
        }}
      >
        {expired ? "0:00" : `${mins}:${secs.toString().padStart(2, "0")}`}
      </div>
    </div>
  );
}

export default function DriverLoginPage() {
  const session = getCurrentDriver();
  const [step, setStep] = useState<"login" | "otp" | "portal">(
    session ? "portal" : "login",
  );
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [driver, setDriver] = useState<Driver | null>(null);
  const [onlineTime, setOnlineTime] = useState(0);
  const [_refresh, setRefresh] = useState(0);
  const [rideOtpInputs, setRideOtpInputs] = useState<Record<string, string>>(
    {},
  );
  const [rideOtpErrors, setRideOtpErrors] = useState<Record<string, string>>(
    {},
  );
  const [withdrawalAccount, setWithdrawalAccount] = useState("");

  const loadDriver = useCallback((ph: string) => {
    const d = getDrivers().find(
      (x) => x.phone === ph || x.name.toLowerCase().includes(ph.toLowerCase()),
    );
    setDriver(d || null);
  }, []);

  useEffect(() => {
    if (session) loadDriver(session.phone);
  }, [session, loadDriver]);

  useEffect(() => {
    if (session?.isOnline && session.onlineSince) {
      const t = setInterval(() => {
        setOnlineTime(
          Math.floor(
            (Date.now() - new Date(session.onlineSince!).getTime()) / 1000,
          ),
        );
      }, 1000);
      return () => clearInterval(t);
    }
  }, [session]);

  const myBookings = driver
    ? getBookings().filter(
        (b) => b.driverId === driver.id && b.status === "pending",
      )
    : [];
  const myTrips = driver
    ? getBookings().filter(
        (b) => b.driverId === driver.id && b.status === "confirmed",
      )
    : [];
  const inProgressTrips = driver
    ? getBookings().filter(
        (b) => b.driverId === driver.id && b.status === "in-progress",
      )
    : [];

  // Active ride: any booking with rideState assigned/arrived/started
  const activeRides = driver
    ? getBookings().filter(
        (b) =>
          b.driverId === driver.id &&
          (b.rideState === "assigned" ||
            b.rideState === "arrived" ||
            b.rideState === "started"),
      )
    : [];

  const commission = 0.15;
  const grossEarnings = driver?.totalEarnings || 0;
  const netEarnings = Math.floor(grossEarnings * (1 - commission));

  // Completed rides earnings from bookings
  const completedBookingsEarnings = driver
    ? getBookings()
        .filter((b) => b.driverId === driver.id && b.status === "completed")
        .reduce(
          (sum, b) => sum + (b.driverEarnings || Math.floor(b.amount * 0.85)),
          0,
        )
    : 0;
  const totalEarnings = grossEarnings + completedBookingsEarnings;

  const toggleOnline = () => {
    const s = getCurrentDriver();
    if (!s) return;
    const newStatus = !s.isOnline;
    setCurrentDriver({
      ...s,
      isOnline: newStatus,
      onlineSince: newStatus ? new Date().toISOString() : undefined,
    });
    if (driver) {
      const all = getDrivers();
      const updated = all.map((d) =>
        d.id === driver.id ? { ...d, isOnline: newStatus } : d,
      );
      localStorage.setItem("de_drivers", JSON.stringify(updated));
      setDriver({ ...driver, isOnline: newStatus });
    }
    setRefresh((r) => r + 1);
  };

  const acceptBooking = (id: string) => {
    updateBooking(id, { status: "confirmed" });
    setRefresh((r) => r + 1);
  };
  const rejectBooking = (id: string) => {
    updateBooking(id, { status: "cancelled" });
    setRefresh((r) => r + 1);
  };

  const verifyRideOtp = (bookingId: string, expectedOtp: string) => {
    const entered = rideOtpInputs[bookingId] || "";
    if (entered === expectedOtp) {
      updateBookingRideOtp(bookingId, "verified");
      updateBooking(bookingId, { rideState: "started" });
      setRideOtpErrors((prev) => ({ ...prev, [bookingId]: "" }));
      setRefresh((r) => r + 1);
    } else {
      setRideOtpErrors((prev) => ({
        ...prev,
        [bookingId]: "Invalid OTP. Please ask customer for correct OTP.",
      }));
    }
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 3600)
      .toString()
      .padStart(2, "0")}:${Math.floor((s % 3600) / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (step === "portal" && session)
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h1
              style={{
                color: "#f8fafc",
                fontWeight: 800,
                fontSize: "1.75rem",
                marginBottom: "0.25rem",
              }}
            >
              Driver Portal
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
              {driver?.name || session.phone} • {driver?.city}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              type="button"
              data-ocid="driver.toggle"
              onClick={toggleOnline}
              style={{
                background: session.isOnline
                  ? "rgba(22,163,74,0.15)"
                  : "rgba(107,114,128,0.15)",
                border: `1px solid ${session.isOnline ? "#16a34a" : "#4b5563"}`,
                color: session.isOnline ? "#4ade80" : "#9ca3af",
                borderRadius: 9999,
                padding: "0.45rem 1rem",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: session.isOnline ? "#4ade80" : "#6b7280",
                  display: "inline-block",
                }}
              />
              {session.isOnline ? "Online" : "Go Online"}
            </button>
            <button
              type="button"
              onClick={() => {
                logoutDriver();
                window.location.reload();
              }}
              style={{
                color: "#6b7280",
                background: "none",
                border: "1px solid #3a3a3a",
                borderRadius: 6,
                padding: "0.4rem 0.8rem",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {session.isOnline && (
          <div
            style={{
              background: "rgba(22,163,74,0.08)",
              border: "1px solid rgba(22,163,74,0.2)",
              borderRadius: 10,
              padding: "0.75rem 1rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#4ade80",
                animation: "pulseDot 1.5s infinite",
                display: "inline-block",
              }}
            />
            <span
              style={{ color: "#4ade80", fontWeight: 600, fontSize: "0.9rem" }}
            >
              Online
            </span>
            <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>
              • {formatTime(onlineTime)} active
            </span>
            <style>
              {"@keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.4} }"}
            </style>
          </div>
        )}

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          {[
            {
              l: "Total Earnings",
              v: `₹${totalEarnings.toLocaleString("en-IN")}`,
              c: "#4ade80",
            },
            {
              l: "Net (after 15%)",
              v: `₹${netEarnings.toLocaleString("en-IN")}`,
              c: "#fbbf24",
            },
            {
              l: "Total Trips",
              v: String(driver?.totalTrips || 0),
              c: "#60a5fa",
            },
            { l: "Rating", v: `⭐ ${driver?.rating || "--"}`, c: "#f8fafc" },
          ].map(({ l, v, c }) => (
            <div key={l} className="card-dark">
              <p style={{ color: "#94a3b8", fontSize: "0.82rem" }}>{l}</p>
              <p
                style={{
                  color: c,
                  fontWeight: 800,
                  fontSize: "1.4rem",
                  marginTop: "0.25rem",
                }}
              >
                {v}
              </p>
            </div>
          ))}
        </div>

        {/* ============ ACTIVE RIDE CARD (new rideState flow) ============ */}
        {activeRides.length > 0 ? (
          <div
            className="card-dark"
            style={{
              marginBottom: "1.5rem",
              borderColor: "rgba(22,163,74,0.3)",
            }}
          >
            <h3
              style={{
                color: "#4ade80",
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              🟢 Active Ride
            </h3>
            {activeRides.map((b) => (
              <div key={b.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div>
                    <p style={{ color: "#f8fafc", fontWeight: 700 }}>
                      {b.customerName}
                    </p>
                    <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                      {b.pickup} → {b.drop}
                    </p>
                    <p style={{ color: "#4ade80", fontWeight: 700 }}>
                      ₹{b.amount}
                    </p>
                  </div>
                  <span
                    style={{
                      background:
                        b.rideState === "started"
                          ? "rgba(74,222,128,0.15)"
                          : b.rideState === "arrived"
                            ? "rgba(167,139,250,0.15)"
                            : "rgba(96,165,250,0.15)",
                      color:
                        b.rideState === "started"
                          ? "#4ade80"
                          : b.rideState === "arrived"
                            ? "#a78bfa"
                            : "#60a5fa",
                      borderRadius: 9999,
                      padding: "0.2rem 0.75rem",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  >
                    {b.rideState}
                  </span>
                </div>

                {/* assigned: "I've Arrived" button */}
                {b.rideState === "assigned" && (
                  <button
                    type="button"
                    data-ocid="driver.primary_button"
                    onClick={() => {
                      updateBooking(b.id, {
                        rideState: "arrived",
                        driverArrivedAt: new Date().toISOString(),
                      });
                      setRefresh((r) => r + 1);
                    }}
                    className="green-btn"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    📍 I've Arrived
                  </button>
                )}

                {/* arrived: timer + OTP + No Show */}
                {b.rideState === "arrived" && b.driverArrivedAt && (
                  <>
                    <NoShowTimer
                      arrivedAt={b.driverArrivedAt}
                      onNoShow={() => {}}
                    />

                    <div
                      style={{
                        background: "#161616",
                        borderRadius: 8,
                        padding: "0.75rem",
                        border: "1px solid #2d2d2d",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <p
                        style={{
                          color: "#94a3b8",
                          fontSize: "0.8rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Enter customer's Ride OTP to start:
                      </p>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                          data-ocid="driver.input"
                          style={{
                            flex: 1,
                            background: "#0a0a0a",
                            border: "1px solid #3a3a3a",
                            borderRadius: 8,
                            padding: "0.5rem",
                            color: "#f8fafc",
                            fontSize: "1.1rem",
                            letterSpacing: "0.3em",
                            textAlign: "center",
                            outline: "none",
                          }}
                          placeholder="6-digit OTP"
                          maxLength={6}
                          value={rideOtpInputs[b.id] || ""}
                          onChange={(e) =>
                            setRideOtpInputs((prev) => ({
                              ...prev,
                              [b.id]: e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 6),
                            }))
                          }
                        />
                        <button
                          type="button"
                          data-ocid="driver.submit_button"
                          onClick={() => verifyRideOtp(b.id, b.rideOtp || "")}
                          style={{
                            background: "#16a34a",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            padding: "0.5rem 1rem",
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                          }}
                        >
                          Start Ride
                        </button>
                      </div>
                      {rideOtpErrors[b.id] && (
                        <p
                          style={{
                            color: "#f87171",
                            fontSize: "0.8rem",
                            marginTop: "0.4rem",
                          }}
                        >
                          {rideOtpErrors[b.id]}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      data-ocid="driver.delete_button"
                      onClick={() => {
                        updateBooking(b.id, {
                          rideState: "cancelled",
                          status: "cancelled",
                          noShowAt: new Date().toISOString(),
                        });
                        setRefresh((r) => r + 1);
                      }}
                      style={{
                        width: "100%",
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        color: "#f87171",
                        borderRadius: 8,
                        padding: "0.5rem",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                      }}
                    >
                      Mark No Show (Cancellation fee applies)
                    </button>
                  </>
                )}

                {/* started: Complete Ride */}
                {b.rideState === "started" && (
                  <>
                    <p
                      style={{
                        color: "#4ade80",
                        fontSize: "0.85rem",
                        marginBottom: "0.75rem",
                      }}
                    >
                      ✅ OTP verified • Ride in progress
                    </p>
                    <div
                      style={{
                        marginBottom: "0.75rem",
                        color: "#94a3b8",
                        fontSize: "0.85rem",
                      }}
                    >
                      Driver Earnings:{" "}
                      <strong style={{ color: "#4ade80" }}>
                        ₹{b.driverEarnings || Math.floor(b.amount * 0.85)}
                      </strong>
                    </div>
                    <button
                      type="button"
                      data-ocid="driver.primary_button"
                      onClick={() => {
                        updateBooking(b.id, {
                          rideState: "completed",
                          status: "completed",
                        });
                        setRefresh((r) => r + 1);
                      }}
                      style={{
                        width: "100%",
                        background: "rgba(96,165,250,0.15)",
                        border: "1px solid rgba(96,165,250,0.3)",
                        color: "#60a5fa",
                        borderRadius: 8,
                        padding: "0.65rem",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                      }}
                    >
                      ✅ Complete Ride
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            className="card-dark"
            style={{
              marginBottom: "1.5rem",
              textAlign: "center",
              padding: "2rem",
            }}
          >
            <div
              style={{
                fontSize: "2.5rem",
                marginBottom: "0.5rem",
                opacity: 0.5,
              }}
            >
              🚗
            </div>
            <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
              Waiting for ride requests...
            </p>
            {session.isOnline && (
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "0.78rem",
                  marginTop: "0.4rem",
                }}
              >
                You are online and visible to customers
              </p>
            )}
          </div>
        )}

        {/* New booking requests (legacy flow) */}
        {myBookings.length > 0 && (
          <div className="card-dark" style={{ marginBottom: "1.5rem" }}>
            <h3
              style={{
                color: "#fbbf24",
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              🔔 New Booking Requests ({myBookings.length})
            </h3>
            {myBookings.map((b) => (
              <div
                key={b.id}
                style={{
                  background: "#161616",
                  borderRadius: 8,
                  padding: "1rem",
                  marginBottom: "0.75rem",
                  border: "1px solid #2d2d2d",
                }}
              >
                <p
                  style={{
                    color: "#f8fafc",
                    fontWeight: 600,
                    marginBottom: "0.25rem",
                  }}
                >
                  {b.customerName} • {b.customerPhone}
                </p>
                <p style={{ color: "#94a3b8", fontSize: "0.88rem" }}>
                  {b.pickup} → {b.drop}
                </p>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                  {b.startDate} to {b.endDate} ({b.days} days) • ₹{b.amount}
                </p>
                <p
                  style={{
                    color: "#4b5563",
                    fontSize: "0.78rem",
                    marginTop: "0.25rem",
                  }}
                >
                  {toIST(b.createdAt)}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginTop: "0.75rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => acceptBooking(b.id)}
                    data-ocid="driver.primary_button"
                    className="green-btn"
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      fontSize: "0.85rem",
                      padding: "0.4rem",
                    }}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => rejectBooking(b.id)}
                    data-ocid="driver.delete_button"
                    style={{
                      flex: 1,
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "#f87171",
                      borderRadius: 6,
                      padding: "0.4rem",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active Trips - OTP verification (legacy confirmed flow) */}
        {myTrips.length > 0 && (
          <div className="card-dark" style={{ marginBottom: "1.5rem" }}>
            <h3
              style={{
                color: "#f8fafc",
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              Active Trips ({myTrips.length})
            </h3>
            {myTrips.map((b) => (
              <div
                key={b.id}
                style={{
                  background: "rgba(22,163,74,0.08)",
                  borderRadius: 8,
                  padding: "1rem",
                  marginBottom: "0.75rem",
                  border: "1px solid rgba(22,163,74,0.2)",
                }}
              >
                <p
                  style={{
                    color: "#f8fafc",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  {b.pickup} → {b.drop}
                </p>
                <p style={{ color: "#94a3b8", fontSize: "0.83rem" }}>
                  {b.customerName} • {b.startDate}
                </p>
                <p style={{ color: "#4b5563", fontSize: "0.78rem" }}>
                  {toIST(b.createdAt)}
                </p>
                <div
                  style={{
                    marginTop: "0.75rem",
                    background: "#161616",
                    borderRadius: 8,
                    padding: "0.75rem",
                    border: "1px solid #2d2d2d",
                  }}
                >
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: "0.8rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Enter customer's Ride OTP to start the ride:
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      style={{
                        flex: 1,
                        background: "#0a0a0a",
                        border: "1px solid #3a3a3a",
                        borderRadius: 8,
                        padding: "0.5rem",
                        color: "#f8fafc",
                        fontSize: "1.1rem",
                        letterSpacing: "0.3em",
                        textAlign: "center",
                        outline: "none",
                      }}
                      placeholder="6-digit OTP"
                      maxLength={6}
                      value={rideOtpInputs[b.id] || ""}
                      onChange={(e) =>
                        setRideOtpInputs((prev) => ({
                          ...prev,
                          [b.id]: e.target.value.replace(/\D/g, "").slice(0, 6),
                        }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => verifyRideOtp(b.id, b.rideOtp || "")}
                      style={{
                        background: "#16a34a",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        padding: "0.5rem 1rem",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                      }}
                    >
                      Start Ride
                    </button>
                  </div>
                  {rideOtpErrors[b.id] && (
                    <p
                      style={{
                        color: "#f87171",
                        fontSize: "0.8rem",
                        marginTop: "0.4rem",
                      }}
                    >
                      {rideOtpErrors[b.id]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* In-progress trips */}
        {inProgressTrips.length > 0 && (
          <div className="card-dark" style={{ marginBottom: "1.5rem" }}>
            <h3
              style={{
                color: "#a78bfa",
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              🚗 In Progress ({inProgressTrips.length})
            </h3>
            {inProgressTrips.map((b) => (
              <div
                key={b.id}
                style={{
                  background: "rgba(167,139,250,0.08)",
                  borderRadius: 8,
                  padding: "0.75rem",
                  marginBottom: "0.5rem",
                  border: "1px solid rgba(167,139,250,0.2)",
                }}
              >
                <p style={{ color: "#f8fafc", fontWeight: 600 }}>
                  {b.pickup} → {b.drop}
                </p>
                <p style={{ color: "#94a3b8", fontSize: "0.83rem" }}>
                  {b.customerName} • ₹{b.amount}
                </p>
                <p
                  style={{
                    color: "#4ade80",
                    fontSize: "0.78rem",
                    marginTop: "0.25rem",
                  }}
                >
                  ✅ Ride started - OTP verified
                </p>
                <p style={{ color: "#94a3b8", fontSize: "0.78rem" }}>
                  Your Earnings: ₹
                  {b.driverEarnings || Math.floor(b.amount * 0.85)} (after 15%
                  commission)
                </p>
                <button
                  type="button"
                  onClick={() => {
                    updateBooking(b.id, {
                      status: "completed",
                      rideState: "completed",
                    });
                    setRefresh((r) => r + 1);
                  }}
                  style={{
                    marginTop: "0.5rem",
                    background: "rgba(96,165,250,0.15)",
                    border: "1px solid rgba(96,165,250,0.3)",
                    color: "#60a5fa",
                    borderRadius: 6,
                    padding: "0.35rem 0.75rem",
                    cursor: "pointer",
                    fontSize: "0.82rem",
                  }}
                >
                  Complete Ride
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="card-dark">
          <h3
            style={{ color: "#f8fafc", fontWeight: 700, marginBottom: "1rem" }}
          >
            Withdrawal Request
          </h3>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "0.88rem",
              marginBottom: "1rem",
            }}
          >
            Daily payout available. Enter your bank or UPI details below.
          </p>
          <input
            className="input-dark"
            placeholder="Bank A/C or UPI ID for withdrawal"
            value={withdrawalAccount}
            onChange={(e) => setWithdrawalAccount(e.target.value)}
            style={{ marginBottom: "0.75rem" }}
          />
          <button
            type="button"
            className="green-btn"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => {
              if (withdrawalAccount) {
                window.alert(
                  "Withdrawal request submitted! Admin will process within 24 hours.",
                );
                setWithdrawalAccount("");
              }
            }}
          >
            Request Withdrawal
          </button>
        </div>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#0a0a0a,#0f1f0f)",
        padding: "1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#16a34a",
              margin: "0 auto 1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.75rem",
            }}
          >
            🚗
          </div>
          <h1
            style={{
              color: "#f8fafc",
              fontWeight: 800,
              fontSize: "1.5rem",
              marginBottom: "0.25rem",
            }}
          >
            Driver Portal
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
            Login to access your dashboard
          </p>
        </div>

        {step === "login" && (
          <div className="card-dark">
            <p
              style={{
                color: "#d1d5db",
                fontSize: "0.85rem",
                display: "block",
                marginBottom: "0.4rem",
              }}
            >
              Phone Number / Name
            </p>
            <input
              data-ocid="driverlogin.input"
              className="input-dark"
              placeholder="Enter your registered phone or name"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ marginBottom: "1rem" }}
            />
            <button
              type="button"
              data-ocid="driverlogin.primary_button"
              className="green-btn"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => {
                if (!phone) return;
                setStep("otp");
              }}
            >
              Send OTP
            </button>
          </div>
        )}

        {step === "otp" && (
          <div className="card-dark">
            <p
              style={{
                color: "#94a3b8",
                fontSize: "0.85rem",
                marginBottom: "1rem",
              }}
            >
              OTP sent to {phone}. Enter any 6 digits to verify (demo mode).
            </p>
            <input
              data-ocid="driverlogin.input"
              className="input-dark"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              style={{
                marginBottom: "1rem",
                letterSpacing: "0.3em",
                textAlign: "center",
                fontSize: "1.2rem",
              }}
            />
            <button
              type="button"
              data-ocid="driverlogin.submit_button"
              className="green-btn"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => {
                if (otp.length < 4) return;
                const d = getDrivers().find(
                  (x) =>
                    x.phone === phone ||
                    x.name.toLowerCase().includes(phone.toLowerCase()),
                );
                if (!d || !d.isApproved) {
                  window.alert(
                    "Driver not found or not approved. Please complete registration first.",
                  );
                  return;
                }
                setCurrentDriver({
                  phone: d.phone,
                  name: d.name,
                  isOnline: false,
                });
                setDriver(d);
                setStep("portal");
              }}
            >
              Verify & Login
            </button>
            <button
              type="button"
              onClick={() => setStep("login")}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                color: "#6b7280",
                cursor: "pointer",
                marginTop: "0.5rem",
                fontSize: "0.85rem",
              }}
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

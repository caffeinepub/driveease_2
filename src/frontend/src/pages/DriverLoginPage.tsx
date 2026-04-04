import { useCallback, useEffect, useRef, useState } from "react";
import RideQuoteTicker from "../components/RideQuoteTicker";

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
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "history" | "withdrawals"
  >("dashboard");

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
                color: "#e2e8f0",
                fontWeight: 800,
                fontSize: "1.75rem",
                marginBottom: "0.25rem",
              }}
            >
              Captain Portal
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
                  ? "rgba(0,230,118,0.15)"
                  : "rgba(107,114,128,0.15)",
                border: `1px solid ${session.isOnline ? "#8B0000" : "#94a3b8"}`,
                color: session.isOnline ? "#4ade80" : "#64748b",
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
                color: "#64748b",
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
              background: "rgba(220,20,60,0.08)",
              border: "1px solid rgba(0,230,118,0.2)",
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
            <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
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

        {/* ===== TAB NAVIGATION ===== */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {(["dashboard", "history", "withdrawals"] as const).map((tab) => {
            const labels: Record<string, string> = {
              dashboard: "🚗 Dashboard",
              history: "📋 Ride History",
              withdrawals: "💰 Withdrawals",
            };
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                data-ocid={`driver.${tab}.tab`}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: isActive
                    ? "rgba(0,230,118,0.15)"
                    : "rgba(255,255,255,0.05)",
                  border: `1px solid ${isActive ? "#8B0000" : "#2d2d2d"}`,
                  color: isActive ? "#4ade80" : "#64748b",
                  borderRadius: 9999,
                  padding: "0.45rem 1.2rem",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  transition: "all 0.2s",
                }}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {activeTab === "dashboard" && (
          <>
            {/* ============ ACTIVE RIDE CARD (new rideState flow) ============ */}
            {activeRides.length > 0 ? (
              <div
                className="card-dark"
                style={{
                  marginBottom: "1.5rem",
                  borderColor: "rgba(0,230,118,0.3)",
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
                        <p style={{ color: "#e2e8f0", fontWeight: 700 }}>
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
                        className="red-btn"
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
                                color: "#e2e8f0",
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
                              onClick={() =>
                                verifyRideOtp(b.id, b.rideOtp || "")
                              }
                              style={{
                                background: "#00e676",
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
                <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
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
                        color: "#e2e8f0",
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
                        color: "#94a3b8",
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
                        className="red-btn"
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
                    color: "#e2e8f0",
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
                      background: "rgba(220,20,60,0.08)",
                      borderRadius: 8,
                      padding: "1rem",
                      marginBottom: "0.75rem",
                      border: "1px solid rgba(0,230,118,0.2)",
                    }}
                  >
                    <p
                      style={{
                        color: "#e2e8f0",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      {b.pickup} → {b.drop}
                    </p>
                    <p style={{ color: "#94a3b8", fontSize: "0.83rem" }}>
                      {b.customerName} • {b.startDate}
                    </p>
                    <p style={{ color: "#94a3b8", fontSize: "0.78rem" }}>
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
                            color: "#e2e8f0",
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
                          onClick={() => verifyRideOtp(b.id, b.rideOtp || "")}
                          style={{
                            background: "#00e676",
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
                    <p style={{ color: "#e2e8f0", fontWeight: 600 }}>
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
                      {b.driverEarnings || Math.floor(b.amount * 0.85)} (after
                      15% commission)
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
          </>
        )}

        {activeTab === "history" && (
          <DriverRideHistory driver={driver} session={session} />
        )}

        {activeTab === "withdrawals" && (
          <DriverWithdrawals
            session={session}
            totalEarnings={totalEarnings}
            withdrawalAccount={withdrawalAccount}
            setWithdrawalAccount={setWithdrawalAccount}
          />
        )}
      </div>
    );

  function DriverRideHistory({
    driver,
    session,
  }: { driver: any; session: any }) {
    const completedRides = getBookings().filter(
      (b: any) =>
        b.status === "completed" &&
        (b.driverId === driver?.id ||
          b.driverPhone === session.phone ||
          b.driverName === driver?.name),
    );

    // Group by day
    const groups: Record<string, any[]> = {};
    for (const b of completedRides) {
      const d = new Date(
        (b as any).completedAt || (b as any).updatedAt || b.createdAt,
      );
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      let key: string;
      if (d.toDateString() === today.toDateString()) key = "Today";
      else if (d.toDateString() === yesterday.toDateString()) key = "Yesterday";
      else
        key = d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      if (!groups[key]) groups[key] = [];
      groups[key].push(b);
    }
    const dayKeys = Object.keys(groups);

    const downloadInvoice = (b: any) => {
      const driverName = driver?.name || session.phone;
      const driverPhone = driver?.phone || session.phone;
      const baseFare = (b as any).amount || b.amount || 0;
      const commission = Math.floor(baseFare * 0.15);
      const net = baseFare - commission;
      const invNum = `RIDE-${b.id.slice(-6).toUpperCase()}`;
      const dateStr = new Date(
        b.completedAt || b.updatedAt || b.createdAt,
      ).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoice ${invNum}</title>
<style>
body{font-family:'Segoe UI',sans-serif;background:#0a0a0a;color:#e2e8f0;margin:0;padding:2rem;}
.logo{font-size:2rem;font-weight:900;color:#00e676;letter-spacing:-1px;margin-bottom:0.25rem;}
.sub{color:#94a3b8;font-size:0.85rem;margin-bottom:2rem;}
h2{color:#4ade80;font-size:1.1rem;margin:1.5rem 0 0.5rem;}
table{width:100%;border-collapse:collapse;margin-top:0.5rem;}
td{padding:0.5rem 0;border-bottom:1px solid #1e1e1e;color:#e2e8f0;font-size:0.92rem;}
td:last-child{text-align:right;font-weight:600;}
.total td{border-top:2px solid #00e676;color:#4ade80;font-weight:800;font-size:1rem;}
.badge{display:inline-block;background:rgba(0,230,118,0.15);border:1px solid #8B0000;color:#4ade80;border-radius:4px;padding:0.15rem 0.6rem;font-size:0.8rem;margin-left:0.5rem;}
.footer{margin-top:3rem;text-align:center;color:#475569;font-size:0.82rem;border-top:1px solid #1e1e1e;padding-top:1rem;}
@media print{body{background:#fff;color:#111;} .logo{color:#8B0000;} table td{color:#111;} .total td{color:#8B0000;} .sub,.footer{color:#64748b;} h2{color:#8B0000;}}
</style></head><body>
<div class="logo">DriveEase</div>
<div class="sub">India's #1 Personal Driver Network</div>
<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;">
  <div><strong>INVOICE</strong><span class="badge">COMPLETED</span><br/><span style="color:#94a3b8;font-size:0.85rem;">${invNum}</span></div>
  <div style="text-align:right;color:#94a3b8;font-size:0.85rem;">${dateStr}</div>
</div>
<h2>Driver Details</h2>
<table><tr><td>Name</td><td>${driverName}</td></tr><tr><td>Phone</td><td>${driverPhone}</td></tr></table>
<h2>Customer Details</h2>
<table><tr><td>Name</td><td>${b.customerName || "Customer"}</td></tr><tr><td>Phone</td><td>${b.customerPhone || "-"}</td></tr></table>
<h2>Trip Details</h2>
<table>
<tr><td>Pickup</td><td>${b.pickup || "-"}</td></tr>
<tr><td>Drop</td><td>${b.drop || "-"}</td></tr>
<tr><td>Date</td><td>${b.startDate || dateStr}</td></tr>
</table>
<h2>Fare Breakdown</h2>
<table>
<tr><td>Base Fare</td><td>₹${baseFare.toLocaleString("en-IN")}</td></tr>
<tr><td>DriveEase Commission (15%)</td><td>- ₹${commission.toLocaleString("en-IN")}</td></tr>
<tr class="total"><td>Your Net Earnings</td><td>₹${net.toLocaleString("en-IN")}</td></tr>
</table>
<div class="footer">Thank you for driving with DriveEase 🚗<br/>Support: +91-7836887228 | driveease.in</div>
<script>window.onload=function(){window.print();}</script>
</body></html>`;
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
      }
    };

    if (dayKeys.length === 0)
      return (
        <div
          className="card-dark"
          style={{ textAlign: "center", padding: "2rem" }}
        >
          <div
            style={{ fontSize: "2.5rem", opacity: 0.4, marginBottom: "0.5rem" }}
          >
            📋
          </div>
          <p style={{ color: "#64748b" }}>No completed rides yet.</p>
        </div>
      );

    return (
      <div>
        {dayKeys.map((day) => {
          const rides = groups[day];
          const dayEarnings = rides.reduce(
            (s: number, b: any) => s + Math.floor((b.amount || 0) * 0.85),
            0,
          );
          return (
            <div key={day} style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.75rem",
                }}
              >
                <span
                  style={{
                    color: "#4ade80",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                  }}
                >
                  {day}
                </span>
                <span style={{ color: "#94a3b8", fontSize: "0.83rem" }}>
                  {rides.length} trip{rides.length !== 1 ? "s" : ""} • ₹
                  {dayEarnings.toLocaleString("en-IN")} earned
                </span>
              </div>
              {rides.map((b: any) => (
                <div
                  key={b.id}
                  className="card-dark"
                  style={{
                    marginBottom: "0.75rem",
                    borderColor: "rgba(100,116,139,0.3)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          color: "#e2e8f0",
                          fontWeight: 700,
                          marginBottom: "0.2rem",
                        }}
                      >
                        {b.pickup || "-"} → {b.drop || "-"}
                      </p>
                      <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                        {b.customerName || "Customer"} •{" "}
                        {toIST(
                          (b as any).completedAt ||
                            (b as any).updatedAt ||
                            b.createdAt,
                        )}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ color: "#e2e8f0", fontWeight: 700 }}>
                        ₹{(b.amount || 0).toLocaleString("en-IN")}
                      </p>
                      <p style={{ color: "#4ade80", fontSize: "0.83rem" }}>
                        Earned: ₹
                        {(
                          b.driverEarnings || Math.floor((b.amount || 0) * 0.85)
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    data-ocid="driver.history.secondary_button"
                    onClick={() => downloadInvoice(b)}
                    style={{
                      marginTop: "0.75rem",
                      background: "rgba(0,230,118,0.1)",
                      border: "1px solid rgba(0,230,118,0.3)",
                      color: "#4ade80",
                      borderRadius: 6,
                      padding: "0.4rem 0.9rem",
                      cursor: "pointer",
                      fontSize: "0.83rem",
                      fontWeight: 600,
                    }}
                  >
                    📄 Download Invoice PDF
                  </button>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  function DriverWithdrawals({
    session,
    totalEarnings,
    withdrawalAccount,
    setWithdrawalAccount,
  }: {
    session: any;
    totalEarnings: number;
    withdrawalAccount: string;
    setWithdrawalAccount: (v: string) => void;
  }) {
    const storageKey = `de_driver_withdrawals_${session.phone}`;
    const [history, setHistory] = useState<any[]>(() => {
      try {
        return JSON.parse(localStorage.getItem(storageKey) || "[]");
      } catch {
        return [];
      }
    });

    const submit = () => {
      if (!withdrawalAccount) return;
      const req = {
        id: Date.now().toString(),
        account: withdrawalAccount,
        amount: totalEarnings,
        requestedAt: new Date().toISOString(),
        status: "pending",
      };
      const updated = [req, ...history];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setHistory(updated);
      setWithdrawalAccount("");
      window.alert(
        "Withdrawal request submitted! Admin will process within 24 hours.",
      );
    };

    return (
      <div>
        <div className="card-dark" style={{ marginBottom: "1.5rem" }}>
          <h3
            style={{ color: "#e2e8f0", fontWeight: 700, marginBottom: "1rem" }}
          >
            Withdrawal Request
          </h3>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "0.88rem",
              marginBottom: "0.75rem",
            }}
          >
            Available earnings:{" "}
            <strong style={{ color: "#4ade80" }}>
              ₹{totalEarnings.toLocaleString("en-IN")}
            </strong>
          </p>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "0.85rem",
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
            data-ocid="driver.withdrawals.input"
          />
          <button
            type="button"
            className="red-btn"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={submit}
            data-ocid="driver.withdrawals.submit_button"
          >
            Request Withdrawal
          </button>
        </div>
        <div className="card-dark">
          <h3
            style={{ color: "#e2e8f0", fontWeight: 700, marginBottom: "1rem" }}
          >
            Withdrawal History
          </h3>
          {history.length === 0 ? (
            <p
              style={{
                color: "#64748b",
                textAlign: "center",
                padding: "1rem 0",
              }}
            >
              No withdrawal requests yet.
            </p>
          ) : (
            <div>
              {history.map((w: any, i: number) => (
                <div
                  key={w.id}
                  data-ocid={`driver.withdrawals.item.${i + 1}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem 0",
                    borderBottom: "1px solid #1e1e1e",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <div>
                    <p
                      style={{
                        color: "#e2e8f0",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      ₹{(w.amount || 0).toLocaleString("en-IN")}
                    </p>
                    <p style={{ color: "#94a3b8", fontSize: "0.78rem" }}>
                      {new Date(w.requestedAt).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })}{" "}
                      • ****{(w.account || "").slice(-4)}
                    </p>
                  </div>
                  <span
                    style={{
                      background:
                        w.status === "paid"
                          ? "rgba(74,222,128,0.15)"
                          : "rgba(251,191,36,0.15)",
                      border: `1px solid ${w.status === "paid" ? "#8B0000" : "#d97706"}`,
                      color: w.status === "paid" ? "#4ade80" : "#fbbf24",
                      borderRadius: 9999,
                      padding: "0.2rem 0.75rem",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                    }}
                  >
                    {w.status === "paid" ? "✓ Paid" : "⏳ Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #052e16 0%, #166534 100%)",
        padding: "1rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes loginGlow{0%,100%{box-shadow:0 0 18px 4px #22C55E55,0 0 32px 8px #16653455}50%{box-shadow:0 0 24px 8px #22C55E66,0 0 40px 12px #16653444}}
        @keyframes logoPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
      `}</style>
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          position: "relative",
          zIndex: 1,
        }}
      >
        <RideQuoteTicker />
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "#22C55E",
              margin: "0 auto 1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              animation:
                "loginGlow 3s ease-in-out infinite, logoPulse 2.5s ease-in-out infinite",
            }}
          >
            🚗
          </div>
          <h1
            style={{
              fontWeight: 800,
              fontSize: "1.6rem",
              marginBottom: "0.25rem",
              color: "#ffffff",
            }}
          >
            Captain Portal
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem" }}>
            Login to access your Captain dashboard
          </p>
        </div>

        {step === "login" && (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 16,
              padding: "1.5rem",
              position: "relative",
            }}
          >
            <p
              style={{
                color: "#e2e8f0",
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
              className="red-btn"
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
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 16,
              padding: "1.5rem",
              position: "relative",
            }}
          >
            <p
              style={{
                color: "#e2e8f0",
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
              className="red-btn"
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
                color: "#64748b",
                cursor: "pointer",
                marginTop: "0.5rem",
                fontSize: "0.85rem",
              }}
            >
              ← Back
            </button>
          </div>
        )}
        <div style={{ position: "relative" }}>
          {step === "login" || step === "otp" ? (
            <img
              src="/assets/generated/indian-car-small-transparent.dim_200x120.png"
              alt="Indian car"
              style={{
                position: "absolute",
                bottom: -10,
                right: -10,
                width: 120,
                opacity: 0.5,
                pointerEvents: "none",
                zIndex: 0,
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

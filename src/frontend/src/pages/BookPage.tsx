import { useEffect, useState } from "react";
import MapCanvas from "../components/MapCanvas";
import OTPModal from "../components/OTPModal";
import type { Driver } from "../data/drivers";
import {
  type Booking,
  addBooking,
  calculateFare,
  generateRideOtp,
  getCurrentCustomer,
  getDrivers,
  getPricingConfig,
  getSavedAddresses,
  saveAddress,
  uid,
} from "../utils/store";

interface Props {
  navigate: (p: string) => void;
  driverId?: string;
}

type Step = "details" | "fare" | "confirm" | "success";
type PaymentMethod = "UPI" | "Card" | "Wallet" | "Postpaid";

export default function BookPage({ navigate, driverId }: Props) {
  const customer = getCurrentCustomer();
  const [showOTP, setShowOTP] = useState(!customer);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [step, setStep] = useState<Step>("details");

  // Form state
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [distanceKm, setDistanceKm] = useState(10);
  const [durationMin, setDurationMin] = useState(30);
  const [bookingDateTime, setBookingDateTime] = useState(() =>
    new Date().toISOString().slice(0, 16),
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [insurance, setInsurance] = useState(false);
  const [savePickup, setSavePickup] = useState(false);
  const [saveDrop, setSaveDrop] = useState(false);
  const [savedAddrs, setSavedAddrs] = useState<string[]>([]);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (driverId) {
      const d = getDrivers().find((x) => x.id === driverId);
      setDriver(d || null);
    }
    if (customer) setSavedAddrs(getSavedAddresses(customer.phone));
  }, [driverId, customer]);

  const fare = calculateFare(
    distanceKm,
    durationMin,
    new Date(bookingDateTime),
  );
  const cfg = getPricingConfig();

  const goToFare = () => {
    if (!pickup || !drop) {
      setError("Please fill pickup and drop locations");
      return;
    }
    setError("");
    setStep("fare");
  };

  const goToConfirm = () => {
    setStep("confirm");
  };

  const confirm = () => {
    if (!customer) return;
    if (!driver) {
      // auto-assign nearest driver (first online approved driver)
      const drivers = getDrivers().filter((d) => d.isApproved && d.isOnline);
      const assigned = drivers[0] || null;
      if (!assigned) {
        setError("No drivers available right now. Try again shortly.");
        return;
      }
      setDriver(assigned);
    }

    if (savePickup) saveAddress(customer.phone, pickup);
    if (saveDrop) saveAddress(customer.phone, drop);

    const commissionAmount = Math.round(
      fare.total * (cfg.commissionPercent / 100),
    );
    const driverEarnings = fare.total - commissionAmount;

    const selectedDriver =
      driver ||
      getDrivers().filter((d) => d.isApproved && d.isOnline)[0] ||
      getDrivers().filter((d) => d.isApproved)[0];

    const b: Booking = {
      id: uid(),
      customerId: customer.phone,
      customerName: customer.name,
      customerPhone: customer.phone,
      driverId: selectedDriver?.id || "unassigned",
      driverName: selectedDriver?.name || "Searching...",
      driverCity: selectedDriver?.city || "",
      pickup,
      drop,
      startDate: bookingDateTime.slice(0, 10),
      endDate: bookingDateTime.slice(0, 10),
      days: 1,
      amount: fare.total,
      insurance,
      status: "pending",
      createdAt: new Date().toISOString(),
      rideOtp: generateRideOtp(),
      rideOtpStatus: "pending",
      rideState: "searching",
      distanceKm,
      durationMin,
      fareBreakdown: {
        baseFare: fare.baseFare,
        distanceFare: fare.distanceFare,
        timeFare: fare.timeFare,
        nightSurcharge: fare.nightSurcharge,
        total: fare.total,
        isNightCharge: fare.isNightCharge,
      },
      paymentMethod,
      commissionAmount,
      driverEarnings,
    };
    addBooking(b);
    setBooking(b);
    setSearching(true);

    // Simulate driver assignment after 3 seconds
    setTimeout(() => {
      setSearching(false);
      import("../utils/store").then(
        ({ updateBookingRideState, updateBooking }) => {
          updateBookingRideState(b.id, "assigned");
          updateBooking(b.id, { status: "confirmed", rideState: "assigned" });
        },
      );
      setStep("success");
    }, 3000);
  };

  if (showOTP)
    return (
      <OTPModal
        onClose={() => navigate("home")}
        onSuccess={() => {
          setShowOTP(false);
        }}
      />
    );

  if (step === "success" && booking)
    return (
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: "2rem 1.5rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "3.5rem",
            marginBottom: "0.75rem",
            animation: "bounceIn 0.5s",
          }}
        >
          🎉
        </div>
        <h2
          style={{
            color: "#4ade80",
            fontWeight: 800,
            fontSize: "1.5rem",
            marginBottom: "0.5rem",
          }}
        >
          Booking Confirmed!
        </h2>
        <p
          style={{
            color: "#94a3b8",
            marginBottom: "1.5rem",
            fontSize: "0.9rem",
          }}
        >
          Driver Assigned • Ride #{booking.id}
        </p>

        {/* OTP */}
        <div
          style={{
            background: "rgba(0,230,118,0.1)",
            border: "2px solid rgba(0,230,118,0.4)",
            borderRadius: 16,
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <p
            style={{
              color: "#94a3b8",
              fontSize: "0.8rem",
              marginBottom: "0.5rem",
              letterSpacing: "0.1em",
            }}
          >
            YOUR RIDE OTP
          </p>
          <div
            style={{
              fontSize: "3rem",
              fontWeight: 900,
              color: "#4ade80",
              letterSpacing: "0.35em",
              fontFamily: "monospace",
              marginBottom: "0.5rem",
            }}
          >
            {booking.rideOtp}
          </div>
          <p style={{ color: "#64748b", fontSize: "0.78rem" }}>
            Share only with your driver to start the ride
          </p>
        </div>

        {/* Ride state badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "rgba(96,165,250,0.1)",
            border: "1px solid rgba(96,165,250,0.3)",
            borderRadius: 9999,
            padding: "0.35rem 0.85rem",
            marginBottom: "1.5rem",
            fontSize: "0.85rem",
            color: "#60a5fa",
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#60a5fa",
              display: "inline-block",
            }}
          />
          Driver Assigned
        </div>

        {/* Summary */}
        <div
          className="card-dark"
          style={{ textAlign: "left", marginBottom: "1.5rem" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
              fontSize: "0.88rem",
            }}
          >
            <span style={{ color: "#94a3b8" }}>📍 Pickup</span>
            <span style={{ color: "#e2e8f0" }}>{booking.pickup}</span>
            <span style={{ color: "#94a3b8" }}>🎯 Drop</span>
            <span style={{ color: "#e2e8f0" }}>{booking.drop}</span>
            <span style={{ color: "#94a3b8" }}>🚗 Driver</span>
            <span style={{ color: "#e2e8f0" }}>{booking.driverName}</span>
            <span style={{ color: "#94a3b8" }}>💳 Payment</span>
            <span style={{ color: "#e2e8f0" }}>{booking.paymentMethod}</span>
            <span style={{ color: "#94a3b8" }}>💰 Amount</span>
            <span style={{ color: "#4ade80", fontWeight: 700 }}>
              ₹{booking.amount}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("my-bookings")}
          className="green-btn"
          style={{
            width: "100%",
            justifyContent: "center",
            marginBottom: "0.75rem",
          }}
        >
          View My Bookings
        </button>
        <button
          type="button"
          onClick={() => navigate("home")}
          style={{
            width: "100%",
            background: "none",
            border: "1px solid #2a2a2a",
            color: "#94a3b8",
            borderRadius: 8,
            padding: "0.65rem",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Back to Home
        </button>
      </div>
    );

  if (searching)
    return (
      <div
        style={{
          maxWidth: 500,
          margin: "4rem auto",
          padding: "2rem 1.5rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "3rem",
            marginBottom: "1rem",
            animation: "spin 1s linear infinite",
          }}
        >
          🔍
        </div>
        <h2
          style={{ color: "#e2e8f0", fontWeight: 700, marginBottom: "0.5rem" }}
        >
          Finding your driver...
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
          Matching with nearest available driver
        </p>
        <style>
          {
            "@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }"
          }
        </style>
      </div>
    );

  return (
    <div
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "2rem 1.5rem",
        background: "#0a0f1a",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          color: "#e2e8f0",
          fontWeight: 800,
          fontSize: "1.75rem",
          marginBottom: "0.25rem",
        }}
      >
        Book a Ride
      </h1>
      {/* Mini car animation strip */}
      <div
        style={{
          position: "relative",
          height: 44,
          background: "#e2e8f0",
          borderRadius: 10,
          overflow: "hidden",
          marginBottom: "1.5rem",
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#94a3b8",
            top: "38%",
            bottom: "38%",
          }}
        />
        <div
          className="car-drive"
          style={{
            position: "absolute",
            top: 6,
            fontSize: "1.5rem",
            lineHeight: 1,
          }}
        >
          🚗
        </div>
        <div
          className="car-drive-slow"
          style={{
            position: "absolute",
            top: 14,
            fontSize: "1.1rem",
            lineHeight: 1,
            opacity: 0.6,
          }}
        >
          🚙
        </div>
      </div>
      {driver && (
        <p
          style={{
            color: "#4ade80",
            fontSize: "0.9rem",
            marginBottom: "1.5rem",
          }}
        >
          With {driver.name} • {driver.city}
        </p>
      )}
      {!driver && (
        <p
          style={{
            color: "#94a3b8",
            fontSize: "0.9rem",
            marginBottom: "1.5rem",
          }}
        >
          Nearest available driver will be assigned automatically
        </p>
      )}

      {/* Step indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1.75rem",
        }}
      >
        {(["details", "fare", "confirm"] as Step[]).map((s, i) => (
          <>
            <div
              key={s}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background:
                  step === s
                    ? "#16a34a"
                    : (step === "confirm" && i < 2) ||
                        (step === "fare" && i < 1)
                      ? "#16a34a"
                      : "#1e1e1e",
                border: `2px solid ${step === s ? "#16a34a" : "#2a2a2a"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 700,
                color:
                  step === s ||
                  (step === "confirm" && i < 2) ||
                  (step === "fare" && i < 1)
                    ? "white"
                    : "#6b7280",
              }}
            >
              {i + 1}
            </div>
            {i < 2 && (
              <div
                key={`line-${s}`}
                style={{
                  flex: 1,
                  height: 2,
                  background:
                    (step === "confirm" && i < 2) || (step === "fare" && i < 1)
                      ? "#16a34a"
                      : "#2a2a2a",
                }}
              />
            )}
          </>
        ))}
      </div>

      {/* STEP 1: Trip Details */}
      {step === "details" && (
        <>
          <div className="card-dark" style={{ marginBottom: "1rem" }}>
            <h3
              style={{
                color: "#e2e8f0",
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              📍 Trip Details
            </h3>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              <div>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.85rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  Pickup Location
                </p>
                {savedAddrs.length > 0 && (
                  <select
                    className="input-dark"
                    style={{ marginBottom: "0.5rem" }}
                    onChange={(e) => {
                      if (e.target.value) setPickup(e.target.value);
                    }}
                  >
                    <option value="">Select saved address...</option>
                    {savedAddrs.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  data-ocid="book.input"
                  className="input-dark"
                  placeholder="Enter pickup address or landmark"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                />
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    marginTop: "0.4rem",
                    cursor: "pointer",
                    color: "#94a3b8",
                    fontSize: "0.82rem",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={savePickup}
                    onChange={(e) => setSavePickup(e.target.checked)}
                    style={{ accentColor: "#16a34a" }}
                  />
                  Save this address
                </label>
              </div>
              <div>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.85rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  Drop Location
                </p>
                {savedAddrs.length > 0 && (
                  <select
                    className="input-dark"
                    style={{ marginBottom: "0.5rem" }}
                    onChange={(e) => {
                      if (e.target.value) setDrop(e.target.value);
                    }}
                  >
                    <option value="">Select saved address...</option>
                    {savedAddrs.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  className="input-dark"
                  placeholder="Enter drop address or landmark"
                  value={drop}
                  onChange={(e) => setDrop(e.target.value)}
                />
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    marginTop: "0.4rem",
                    cursor: "pointer",
                    color: "#94a3b8",
                    fontSize: "0.82rem",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={saveDrop}
                    onChange={(e) => setSaveDrop(e.target.checked)}
                    style={{ accentColor: "#16a34a" }}
                  />
                  Save this address
                </label>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    htmlFor="distance-km"
                    style={{
                      color: "#94a3b8",
                      fontSize: "0.85rem",
                      display: "block",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Estimated Distance (km)
                  </label>
                  <input
                    id="distance-km"
                    type="number"
                    className="input-dark"
                    min={1}
                    max={200}
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                  />
                </div>
                <div>
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: "0.85rem",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Estimated Duration (min)
                  </p>
                  <input
                    type="number"
                    className="input-dark"
                    min={5}
                    max={480}
                    value={durationMin}
                    onChange={(e) => setDurationMin(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.85rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  Booking Date & Time
                </p>
                <input
                  type="datetime-local"
                  className="input-dark"
                  value={bookingDateTime}
                  onChange={(e) => setBookingDateTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.85rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  Payment Method
                </p>
                <div
                  style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                >
                  {(
                    ["UPI", "Card", "Wallet", "Postpaid"] as PaymentMethod[]
                  ).map((m) => (
                    <button
                      key={m}
                      type="button"
                      data-ocid={`book.${m.toLowerCase()}.toggle`}
                      onClick={() => setPaymentMethod(m)}
                      style={{
                        background:
                          paymentMethod === m
                            ? "rgba(0,230,118,0.2)"
                            : "#1e1e1e",
                        border: `1px solid ${paymentMethod === m ? "#16a34a" : "#2a2a2a"}`,
                        color: paymentMethod === m ? "#4ade80" : "#94a3b8",
                        borderRadius: 8,
                        padding: "0.45rem 1rem",
                        cursor: "pointer",
                        fontWeight: paymentMethod === m ? 700 : 400,
                        fontSize: "0.88rem",
                      }}
                    >
                      {m === "UPI"
                        ? "📱 UPI"
                        : m === "Card"
                          ? "💳 Card"
                          : m === "Wallet"
                            ? "👛 Wallet"
                            : "📋 Postpaid"}
                    </button>
                  ))}
                </div>
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={insurance}
                  onChange={(e) => setInsurance(e.target.checked)}
                  style={{ accentColor: "#16a34a", width: 18, height: 18 }}
                />
                <div>
                  <p
                    style={{
                      color: "#e2e8f0",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                    }}
                  >
                    🛡️ Add Ride Insurance (+₹49)
                  </p>
                  <p style={{ color: "#94a3b8", fontSize: "0.82rem" }}>
                    Coverage for accidents • Emergency helpline
                  </p>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <p
              style={{
                color: "#f87171",
                fontSize: "0.9rem",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 8,
                padding: "0.75rem",
                marginBottom: "1rem",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={goToFare}
            data-ocid="book.primary_button"
            className="green-btn"
            style={{
              width: "100%",
              justifyContent: "center",
              fontSize: "1.05rem",
              padding: "0.9rem",
            }}
          >
            View Fare Estimate →
          </button>
        </>
      )}

      {/* STEP 2: Fare Estimate */}
      {step === "fare" && (
        <>
          <div
            className="card-dark"
            style={{
              background: "rgba(0,230,118,0.05)",
              borderColor: "rgba(0,230,118,0.25)",
              marginBottom: "1rem",
            }}
          >
            <h3
              style={{
                color: "#e2e8f0",
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              💰 Fare Estimate
            </h3>

            {[
              ["Base Fare", "", `₹${fare.baseFare}`],
              [
                `Distance (${distanceKm}km × ₹${cfg.ratePerKm}/km)`,
                "",
                `₹${fare.distanceFare.toFixed(0)}`,
              ],
              [
                `Time (${durationMin}min × ₹${cfg.ratePerMin}/min)`,
                "",
                `₹${fare.timeFare.toFixed(0)}`,
              ],
              ...(fare.isNightCharge
                ? [
                    [
                      `Night Surcharge (${cfg.nightSurchargePercent}%)`,
                      "10PM–6AM",
                      `+₹${fare.nightSurcharge}`,
                    ],
                  ]
                : []),
              ...(insurance ? [["Insurance", "", "+₹49"]] : []),
              ["sep", "", ""],
              ["Total", "", `₹${fare.total + (insurance ? 49 : 0)}`],
            ].map(([l, m, v]) =>
              l === "sep" ? (
                <hr
                  key="sep"
                  style={{ borderColor: "#2a2a2a", margin: "0.5rem 0" }}
                />
              ) : (
                <div
                  key={l}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.35rem 0",
                  }}
                >
                  <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                    {l}
                    {m && (
                      <span style={{ color: "#64748b", fontSize: "0.78rem" }}>
                        {" "}
                        ({m})
                      </span>
                    )}
                  </span>
                  <span
                    style={{
                      color: l === "Total" ? "#4ade80" : "#f8fafc",
                      fontWeight: l === "Total" ? 800 : 600,
                      fontSize: l === "Total" ? "1.15rem" : "0.9rem",
                    }}
                  >
                    {v}
                  </span>
                </div>
              ),
            )}

            {fare.isNightCharge && (
              <p
                style={{
                  color: "#fbbf24",
                  fontSize: "0.78rem",
                  marginTop: "0.75rem",
                  background: "rgba(251,191,36,0.08)",
                  borderRadius: 6,
                  padding: "0.5rem",
                }}
              >
                🌙 Night surcharge applies (10 PM – 6 AM)
              </p>
            )}
          </div>

          <p
            style={{
              color: "#64748b",
              fontSize: "0.78rem",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            Formula: max(₹{cfg.minimumFare}, ₹{cfg.baseFare} + distance × ₹
            {cfg.ratePerKm}/km + time × ₹{cfg.ratePerMin}/min)
          </p>

          {/* Route Preview */}
          <div style={{ marginBottom: "1rem" }}>
            <h4
              style={{
                color: "#94a3b8",
                fontSize: "0.85rem",
                marginBottom: "0.75rem",
                fontWeight: 600,
              }}
            >
              🗺️ Route Preview
            </h4>
            <MapCanvas
              pickup={pickup}
              drop={drop}
              showRoute={true}
              drivers={[]}
              height={240}
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={() => setStep("details")}
              style={{
                flex: 1,
                background: "none",
                border: "1px solid #2a2a2a",
                color: "#94a3b8",
                borderRadius: 8,
                padding: "0.65rem",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={goToConfirm}
              data-ocid="book.primary_button"
              className="green-btn"
              style={{
                flex: 2,
                justifyContent: "center",
                padding: "0.75rem",
                fontSize: "1rem",
              }}
            >
              Continue to Book →
            </button>
          </div>
        </>
      )}

      {/* STEP 3: Confirm */}
      {step === "confirm" && (
        <>
          <div className="card-dark" style={{ marginBottom: "1rem" }}>
            <h3
              style={{
                color: "#e2e8f0",
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              ✅ Confirm Booking
            </h3>

            {driver ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem",
                  background: "rgba(0,230,118,0.08)",
                  borderRadius: 10,
                  marginBottom: "1rem",
                  border: "1px solid rgba(0,230,118,0.2)",
                }}
              >
                <img
                  src={driver.avatar}
                  alt={driver.name}
                  style={{ width: 48, height: 48, borderRadius: "50%" }}
                />
                <div>
                  <p style={{ color: "#e2e8f0", fontWeight: 700 }}>
                    {driver.name}
                  </p>
                  <p style={{ color: "#94a3b8", fontSize: "0.82rem" }}>
                    {driver.city} • ⭐ {driver.rating} •{" "}
                    {driver.vehicleTypes[0]}
                  </p>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "0.75rem",
                  background: "rgba(251,191,36,0.08)",
                  borderRadius: 10,
                  marginBottom: "1rem",
                  border: "1px solid rgba(251,191,36,0.2)",
                  color: "#fbbf24",
                  fontSize: "0.88rem",
                }}
              >
                🔍 Finding nearest driver automatically...
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "0.5rem 1rem",
                fontSize: "0.88rem",
              }}
            >
              <span style={{ color: "#64748b" }}>Pickup</span>
              <span style={{ color: "#e2e8f0" }}>{pickup}</span>
              <span style={{ color: "#64748b" }}>Drop</span>
              <span style={{ color: "#e2e8f0" }}>{drop}</span>
              <span style={{ color: "#64748b" }}>Distance</span>
              <span style={{ color: "#e2e8f0" }}>{distanceKm} km</span>
              <span style={{ color: "#64748b" }}>Duration</span>
              <span style={{ color: "#e2e8f0" }}>{durationMin} min</span>
              <span style={{ color: "#64748b" }}>Payment</span>
              <span style={{ color: "#e2e8f0" }}>{paymentMethod}</span>
              <span style={{ color: "#64748b" }}>Total Fare</span>
              <span
                style={{
                  color: "#4ade80",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                }}
              >
                ₹{fare.total + (insurance ? 49 : 0)}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={() => setStep("fare")}
              style={{
                flex: 1,
                background: "none",
                border: "1px solid #2a2a2a",
                color: "#94a3b8",
                borderRadius: 8,
                padding: "0.65rem",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={confirm}
              data-ocid="book.submit_button"
              className="green-btn"
              style={{
                flex: 2,
                justifyContent: "center",
                padding: "0.75rem",
                fontSize: "1rem",
              }}
            >
              🚗 Confirm Booking
            </button>
          </div>
        </>
      )}
    </div>
  );
}

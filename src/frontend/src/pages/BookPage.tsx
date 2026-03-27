import { useCallback, useEffect, useRef, useState } from "react";
import OTPModal from "../components/OTPModal";
import RideQuoteTicker from "../components/RideQuoteTicker";
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
import { pushItem, sendSMS } from "../utils/syncService";

function loadLeaflet(): Promise<any> {
  return new Promise((resolve) => {
    if ((window as any).L) {
      resolve((window as any).L);
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve((window as any).L);
    document.head.appendChild(script);
  });
}

interface Props {
  navigate: (p: string) => void;
  driverId?: string;
}

type BookingType = "One Way" | "Full Day" | "Monthly";

const MOCK_DRIVERS = [
  {
    id: "d1",
    name: "Rajesh Kumar",
    city: "Delhi",
    rating: 4.9,
    experience: 8,
    rides: 542,
    initials: "RK",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  },
  {
    id: "d2",
    name: "Suresh Mehta",
    city: "Mumbai",
    rating: 4.8,
    experience: 6,
    rides: 389,
    initials: "SM",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
  },
  {
    id: "d3",
    name: "Amit Sharma",
    city: "Bangalore",
    rating: 4.7,
    experience: 10,
    rides: 621,
    initials: "AS",
    photo:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face",
  },
];

const STEP_LABELS = [
  "Select Location",
  "Choose Driver",
  "Date & Time",
  "Confirm Booking",
];

export default function BookPage({ navigate, driverId: _driverId }: Props) {
  const customer = getCurrentCustomer();
  const [showOTP, setShowOTP] = useState(!customer);
  const [step, setStep] = useState(1);

  // Step 1
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [dropSuggestions, setDropSuggestions] = useState<any[]>([]);
  const [pickupCoords, setPickupCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [dropCoords, setDropCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [distanceKm, setDistanceKm] = useState(10);
  const [durationMin, setDurationMin] = useState(30);
  const [osrmLoading, setOsrmLoading] = useState(false);

  // Step 2
  const [selectedDriver, setSelectedDriver] = useState<
    (typeof MOCK_DRIVERS)[0] | null
  >(null);

  // Step 3
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingType, setBookingType] = useState<BookingType>("One Way");

  // Step 4
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Map
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const dropMarkerRef = useRef<any>(null);

  const pickupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const calcHaversine = useCallback(
    (p: { lat: number; lng: number }, d: { lat: number; lng: number }) => {
      const R = 6371;
      const dLat = ((d.lat - p.lat) * Math.PI) / 180;
      const dLng = ((d.lng - p.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((p.lat * Math.PI) / 180) *
          Math.cos((d.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    },
    [],
  );

  // Fetch OSRM route when both coords are set
  useEffect(() => {
    if (!pickupCoords || !dropCoords) return;
    const fallback = calcHaversine(pickupCoords, dropCoords);
    setDistanceKm(fallback);
    setDurationMin(Math.round(fallback * 3));

    setOsrmLoading(true);
    const url = `https://router.project-osrm.org/route/v1/driving/${pickupCoords.lng},${pickupCoords.lat};${dropCoords.lng},${dropCoords.lat}?overview=false&annotations=false`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.routes?.[0]) {
          const route = data.routes[0];
          setDistanceKm(route.distance / 1000);
          setDurationMin(Math.round(route.duration / 60));
        }
      })
      .catch(() => {
        // silently fall back to haversine
      })
      .finally(() => setOsrmLoading(false));
  }, [pickupCoords, dropCoords, calcHaversine]);

  // Init leaflet map on step 1
  useEffect(() => {
    if (step !== 1 || !mapRef.current) return;
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !mapRef.current || mapInstanceRef.current) return;
      const map = L.map(mapRef.current, {
        center: [20.5937, 78.9629],
        zoom: 5,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);
      mapInstanceRef.current = map;
    });
    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [step]);

  const updateMapMarkers = useCallback(
    (L: any) => {
      const map = mapInstanceRef.current;
      if (!map || !L) return;
      const greenIcon = L.divIcon({
        className: "",
        html: '<div style="background:#42A5F5;width:14px;height:14px;border-radius:50%;border:2px solid white"></div>',
        iconSize: [14, 14],
      });
      const redIcon = L.divIcon({
        className: "",
        html: '<div style="background:#ef4444;width:14px;height:14px;border-radius:50%;border:2px solid white"></div>',
        iconSize: [14, 14],
      });
      if (pickupCoords) {
        if (pickupMarkerRef.current)
          pickupMarkerRef.current.setLatLng([
            pickupCoords.lat,
            pickupCoords.lng,
          ]);
        else
          pickupMarkerRef.current = L.marker(
            [pickupCoords.lat, pickupCoords.lng],
            { icon: greenIcon },
          ).addTo(map);
      }
      if (dropCoords) {
        if (dropMarkerRef.current)
          dropMarkerRef.current.setLatLng([dropCoords.lat, dropCoords.lng]);
        else
          dropMarkerRef.current = L.marker([dropCoords.lat, dropCoords.lng], {
            icon: redIcon,
          }).addTo(map);
      }
      if (pickupCoords && dropCoords) {
        map.fitBounds(
          [
            [pickupCoords.lat, pickupCoords.lng],
            [dropCoords.lat, dropCoords.lng],
          ],
          { padding: [40, 40] },
        );
      } else if (pickupCoords) {
        map.setView([pickupCoords.lat, pickupCoords.lng], 13);
      }
    },
    [pickupCoords, dropCoords],
  );

  useEffect(() => {
    if (step === 1 && mapInstanceRef.current) {
      loadLeaflet().then((L) => updateMapMarkers(L));
    }
  }, [step, updateMapMarkers]);

  const fetchSuggestions = async (q: string, setter: (s: any[]) => void) => {
    if (q.length < 3) {
      setter([]);
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&countrycodes=in`,
      );
      const data = await res.json();
      setter(data);
    } catch {
      setter([]);
    }
  };

  const onPickupChange = (v: string) => {
    setPickup(v);
    if (pickupTimerRef.current) clearTimeout(pickupTimerRef.current);
    pickupTimerRef.current = setTimeout(
      () => fetchSuggestions(v, setPickupSuggestions),
      400,
    );
  };
  const onDropChange = (v: string) => {
    setDrop(v);
    if (dropTimerRef.current) clearTimeout(dropTimerRef.current);
    dropTimerRef.current = setTimeout(
      () => fetchSuggestions(v, setDropSuggestions),
      400,
    );
  };

  const selectPickup = (s: any) => {
    setPickup(s.display_name);
    setPickupCoords({
      lat: Number.parseFloat(s.lat),
      lng: Number.parseFloat(s.lon),
    });
    setPickupSuggestions([]);
  };
  const selectDrop = (s: any) => {
    setDrop(s.display_name);
    setDropCoords({
      lat: Number.parseFloat(s.lat),
      lng: Number.parseFloat(s.lon),
    });
    setDropSuggestions([]);
  };

  const estimatedFare = () => {
    if (bookingType === "Full Day") return 1800;
    if (bookingType === "Monthly") return 12000;
    return Math.max(200, Math.round(distanceKm * 18));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!pickup.trim()) {
        setError("Enter pickup location");
        return false;
      }
      if (!drop.trim()) {
        setError("Enter drop location");
        return false;
      }
    }
    if (step === 2) {
      if (!selectedDriver) {
        setError("Please select a driver");
        return false;
      }
    }
    if (step === 3) {
      if (!bookingDate) {
        setError("Please select a date");
        return false;
      }
      if (!bookingTime) {
        setError("Please select a time");
        return false;
      }
    }
    setError("");
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, 4));
  };
  const prevStep = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  };

  const confirmBooking = async () => {
    if (!customer || !selectedDriver) return;
    setConfirming(true);
    const bookingId = uid();
    const booking: Booking = {
      id: bookingId,
      customerId: customer.phone,
      customerPhone: customer.phone,
      customerName: customer.name || customer.phone,
      driverId: selectedDriver.id,
      driverName: selectedDriver.name,
      driverCity: selectedDriver.city,
      pickup,
      drop,
      startDate: `${bookingDate}T${bookingTime}`,
      endDate: `${bookingDate}T${bookingTime}`,
      days: bookingType === "Monthly" ? 30 : 1,
      amount: estimatedFare(),
      distanceKm,
      durationMin,
      fareBreakdown: undefined,
      insurance: false,
      status: "pending" as Booking["status"],
      rideState: "searching" as Booking["rideState"],
      paymentMethod: "UPI" as Booking["paymentMethod"],
      rideOtp: generateRideOtp(),
      createdAt: new Date().toISOString(),
    };
    addBooking(booking);
    await pushItem("bookings", booking as unknown as { id: string });
    await sendSMS(
      customer.phone,
      `Your DriveEase booking is confirmed! Booking ID: ${bookingId}`,
    );
    setConfirming(false);
    setSuccess(true);
    setTimeout(() => navigate("my-bookings"), 2500);
  };

  if (showOTP) {
    return (
      <OTPModal
        onClose={() => navigate("home")}
        onSuccess={() => setShowOTP(false)}
      />
    );
  }

  // Light theme styles
  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: "2rem",
    boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#f8fafc",
    border: "1px solid #cbd5e1",
    color: "#1e293b",
    borderRadius: 10,
    padding: "0.75rem 1rem",
    fontSize: "1rem",
    fontFamily: "'Poppins', sans-serif",
    outline: "none",
    boxSizing: "border-box",
  };

  if (success) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#f8fafc",
        }}
      >
        <div style={{ ...cardStyle, textAlign: "center", maxWidth: 440 }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
          <h2
            style={{
              color: "#1565C0",
              fontWeight: 800,
              fontSize: "1.5rem",
              marginBottom: "0.5rem",
            }}
          >
            Booking Confirmed!
          </h2>
          <p style={{ color: "#475569", marginBottom: "0.5rem" }}>
            Your driver has been notified.
          </p>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
            Redirecting to My Bookings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "2rem 1rem",
        background: "#f8fafc",
        minHeight: "80vh",
      }}
    >
      <RideQuoteTicker />
      <h1
        style={{
          color: "#1e293b",
          fontWeight: 800,
          fontSize: "1.75rem",
          marginBottom: "0.5rem",
          textAlign: "center",
        }}
      >
        Book a Driver
      </h1>
      <p
        style={{
          color: "#64748b",
          textAlign: "center",
          marginBottom: "2rem",
          fontSize: "0.9rem",
        }}
      >
        Follow the steps below to complete your booking
      </p>

      {/* Progress Bar */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.75rem",
          }}
        >
          {STEP_LABELS.map((label, i) => {
            const num = i + 1;
            const done = step > num;
            const active = step === num;
            return (
              <div
                key={label}
                data-ocid={`book.step_${num}_tab`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.35rem",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: done
                      ? "#1565C0"
                      : active
                        ? "rgba(22,163,74,0.12)"
                        : "#f1f5f9",
                    border: active
                      ? "2px solid #1565C0"
                      : done
                        ? "2px solid #1565C0"
                        : "2px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: done ? "#fff" : active ? "#1565C0" : "#94a3b8",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    transition: "all 0.3s",
                  }}
                >
                  {done ? "✓" : num}
                </div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: active ? "#1565C0" : done ? "#42A5F5" : "#94a3b8",
                    textAlign: "center",
                    lineHeight: 1.3,
                  }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
        <div
          style={{
            height: 4,
            background: "#e2e8f0",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "#FF6200",
              width: `${((step - 1) / 3) * 100}%`,
              transition: "width 0.4s ease",
              borderRadius: 99,
            }}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          data-ocid="book.error_state"
          style={{
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 10,
            padding: "0.75rem 1rem",
            color: "#dc2626",
            marginBottom: "1rem",
            fontSize: "0.9rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Step 1: Select Location */}
      {step === 1 && (
        <div style={cardStyle}>
          <h2
            style={{
              color: "#1e293b",
              fontWeight: 700,
              fontSize: "1.2rem",
              marginBottom: "1.5rem",
            }}
          >
            📍 Select Location
          </h2>
          <div style={{ marginBottom: "1.25rem" }}>
            <label
              htmlFor="_"
              style={{
                color: "#475569",
                fontSize: "0.85rem",
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: 500,
              }}
            >
              Pickup Location
            </label>
            <input
              data-ocid="book.pickup_input"
              style={inputStyle}
              placeholder="Enter pickup address..."
              value={pickup}
              onChange={(e) => onPickupChange(e.target.value)}
            />
            {pickupSuggestions.length > 0 && (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  marginTop: 4,
                  maxHeight: 200,
                  overflowY: "auto",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                {pickupSuggestions.map((s) => (
                  <button
                    key={s.place_id}
                    type="button"
                    onClick={() => selectPickup(s)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "0.6rem 0.9rem",
                      background: "none",
                      border: "none",
                      color: "#334155",
                      cursor: "pointer",
                      fontSize: "0.82rem",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    {s.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              htmlFor="_"
              style={{
                color: "#475569",
                fontSize: "0.85rem",
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: 500,
              }}
            >
              Drop Location
            </label>
            <input
              data-ocid="book.drop_input"
              style={inputStyle}
              placeholder="Enter drop address..."
              value={drop}
              onChange={(e) => onDropChange(e.target.value)}
            />
            {dropSuggestions.length > 0 && (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  marginTop: 4,
                  maxHeight: 200,
                  overflowY: "auto",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                {dropSuggestions.map((s) => (
                  <button
                    key={s.place_id}
                    type="button"
                    onClick={() => selectDrop(s)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "0.6rem 0.9rem",
                      background: "none",
                      border: "none",
                      color: "#334155",
                      cursor: "pointer",
                      fontSize: "0.82rem",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    {s.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {pickupCoords && dropCoords && (
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #fecaca",
                borderRadius: 8,
                padding: "0.6rem 0.9rem",
                marginBottom: "1rem",
                color: "#66BB6A",
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            >
              {osrmLoading
                ? "🚦 Calculating road distance..."
                : `📍 ${distanceKm.toFixed(1)} km road distance • ~${durationMin} min estimated`}
            </div>
          )}
          <div
            ref={mapRef}
            style={{
              height: 220,
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid #e2e8f0",
              marginBottom: "1.5rem",
            }}
          />
        </div>
      )}

      {/* Step 2: Choose Driver */}
      {step === 2 && (
        <div style={cardStyle}>
          <h2
            style={{
              color: "#1e293b",
              fontWeight: 700,
              fontSize: "1.2rem",
              marginBottom: "1.5rem",
            }}
          >
            👤 Choose a Driver
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {MOCK_DRIVERS.map((d) => (
              <button
                key={d.id}
                type="button"
                data-ocid={`book.driver_${d.id}_button`}
                onClick={() => setSelectedDriver(d)}
                style={{
                  background:
                    selectedDriver?.id === d.id ? "#f0fdf4" : "#ffffff",
                  border: `2px solid ${
                    selectedDriver?.id === d.id ? "#1565C0" : "#e2e8f0"
                  }`,
                  borderRadius: 12,
                  padding: "1rem 1.25rem",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                  boxShadow:
                    selectedDriver?.id === d.id
                      ? "0 2px 12px rgba(22,163,74,0.15)"
                      : "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <img
                    src={d.photo}
                    alt={d.name}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #e2e8f0",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        color: "#1e293b",
                        fontWeight: 700,
                        fontSize: "1rem",
                      }}
                    >
                      {d.name}
                    </div>
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: "0.82rem",
                        marginTop: 2,
                      }}
                    >
                      {d.city} · {d.experience} yrs exp · {d.rides} rides
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        color: "#f59e0b",
                        fontWeight: 700,
                        fontSize: "1rem",
                      }}
                    >
                      ⭐ {d.rating}
                    </div>
                    {selectedDriver?.id === d.id && (
                      <div
                        style={{
                          color: "#1565C0",
                          fontSize: "0.8rem",
                          marginTop: 4,
                          fontWeight: 600,
                        }}
                      >
                        ✓ Selected
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Date & Time */}
      {step === 3 && (
        <div style={cardStyle}>
          <h2
            style={{
              color: "#1e293b",
              fontWeight: 700,
              fontSize: "1.2rem",
              marginBottom: "1.5rem",
            }}
          >
            📅 Select Date & Time
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <label
                htmlFor="_"
                style={{
                  color: "#475569",
                  fontSize: "0.85rem",
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 500,
                }}
              >
                Date
              </label>
              <input
                data-ocid="book.date_input"
                type="date"
                style={{ ...inputStyle, colorScheme: "light" }}
                value={bookingDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setBookingDate(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="_"
                style={{
                  color: "#475569",
                  fontSize: "0.85rem",
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 500,
                }}
              >
                Time
              </label>
              <input
                data-ocid="book.time_input"
                type="time"
                style={{ ...inputStyle, colorScheme: "light" }}
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="_"
              style={{
                color: "#475569",
                fontSize: "0.85rem",
                display: "block",
                marginBottom: "0.75rem",
                fontWeight: 500,
              }}
            >
              Booking Type
            </label>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {(["One Way", "Full Day", "Monthly"] as BookingType[]).map(
                (t) => (
                  <button
                    key={t}
                    type="button"
                    data-ocid={`book.type_${t.replace(" ", "_").toLowerCase()}_toggle`}
                    onClick={() => setBookingType(t)}
                    style={{
                      padding: "0.6rem 1.25rem",
                      borderRadius: 9999,
                      border: `2px solid ${
                        bookingType === t ? "#1565C0" : "#e2e8f0"
                      }`,
                      background: bookingType === t ? "#f0fdf4" : "#ffffff",
                      color: bookingType === t ? "#1565C0" : "#64748b",
                      cursor: "pointer",
                      fontWeight: bookingType === t ? 600 : 400,
                      fontSize: "0.875rem",
                      fontFamily: "'Poppins', sans-serif",
                      minHeight: 44,
                      transition: "all 0.2s",
                    }}
                  >
                    {t}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div style={cardStyle}>
          <h2
            style={{
              color: "#1e293b",
              fontWeight: 700,
              fontSize: "1.2rem",
              marginBottom: "1.5rem",
            }}
          >
            ✅ Confirm Booking
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            {[
              ["📍 Pickup", pickup],
              ["🏁 Drop", drop],
              ["👤 Driver", selectedDriver?.name ?? ""],
              [
                "📅 Date & Time",
                bookingDate && bookingTime
                  ? `${bookingDate} at ${bookingTime}`
                  : "",
              ],
              ["🚗 Type", bookingType],
              ["💰 Estimated Fare", `₹${estimatedFare()}`],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "0.6rem",
                }}
              >
                <span style={{ color: "#64748b", fontSize: "0.875rem" }}>
                  {label}
                </span>
                <span
                  style={{
                    color: "#1e293b",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    maxWidth: "55%",
                    textAlign: "right",
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #fecaca",
              borderRadius: 10,
              padding: "0.75rem 1rem",
              marginBottom: "1.5rem",
              fontSize: "0.82rem",
              color: "#66BB6A",
            }}
          >
            ℹ️ A confirmation SMS will be sent to your registered phone number.
          </div>
          <button
            type="button"
            data-ocid="book.confirm_button"
            onClick={confirmBooking}
            disabled={confirming}
            className="red-btn"
            style={{
              width: "100%",
              justifyContent: "center",
              minHeight: 50,
              fontSize: "1rem",
            }}
          >
            {confirming ? "Confirming..." : "Confirm Booking"}
          </button>
        </div>
      )}

      {/* Navigation buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "1.5rem",
          gap: "1rem",
        }}
      >
        {step > 1 ? (
          <button
            type="button"
            data-ocid="book.back_button"
            onClick={prevStep}
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              color: "#475569",
              borderRadius: 10,
              padding: "0.75rem 1.5rem",
              cursor: "pointer",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "0.9rem",
              minHeight: 48,
              fontWeight: 500,
            }}
          >
            ← Back
          </button>
        ) : (
          <div />
        )}
        {step < 4 && (
          <button
            type="button"
            data-ocid="book.next_button"
            onClick={nextStep}
            className="red-btn"
            style={{
              minHeight: 48,
              padding: "0.75rem 2rem",
              fontSize: "0.95rem",
            }}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}

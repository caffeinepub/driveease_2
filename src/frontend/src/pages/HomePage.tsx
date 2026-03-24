import {
  Calendar,
  CheckCircle,
  Heart,
  Lock,
  MapPin,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface HomePageProps {
  navigate: (p: string) => void;
}

const INITIAL_DRIVERS = [
  {
    id: 1,
    name: "Rajesh K.",
    city: "Delhi",
    rating: 4.9,
    rides: 542,
    customers: 210,
    verifiedOn: "Jan 2026",
    initials: "RK",
    color: "#00e676",
    status: "available" as Status,
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "Suresh M.",
    city: "Mumbai",
    rating: 4.8,
    rides: 389,
    customers: 156,
    verifiedOn: "Dec 2025",
    initials: "SM",
    color: "#0284c7",
    status: "available" as Status,
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "Amit S.",
    city: "Bangalore",
    rating: 4.7,
    rides: 621,
    customers: 287,
    verifiedOn: "Nov 2025",
    initials: "AS",
    color: "#7c3aed",
    status: "on-trip" as Status,
    photo:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face",
  },
  {
    id: 4,
    name: "Vikram P.",
    city: "Hyderabad",
    rating: 4.9,
    rides: 478,
    customers: 194,
    verifiedOn: "Jan 2026",
    initials: "VP",
    color: "#dc2626",
    status: "available" as Status,
    photo:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
  },
  {
    id: 5,
    name: "Deepak R.",
    city: "Delhi",
    rating: 4.8,
    rides: 301,
    customers: 128,
    verifiedOn: "Feb 2026",
    initials: "DR",
    color: "#b45309",
    status: "offline" as Status,
    photo:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&h=80&fit=crop&crop=face",
  },
];

const SIDEBAR_DRIVERS = [
  ...INITIAL_DRIVERS,
  {
    id: 6,
    name: "Pradeep T.",
    city: "Chennai",
    rating: 4.8,
    rides: 412,
    customers: 167,
    verifiedOn: "Dec 2025",
    initials: "PT",
    color: "#0891b2",
    status: "available" as Status,
    photo:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face",
  },
  {
    id: 7,
    name: "Manoj G.",
    city: "Pune",
    rating: 4.7,
    rides: 334,
    customers: 142,
    verifiedOn: "Jan 2026",
    initials: "MG",
    color: "#65a30d",
    status: "available" as Status,
    photo:
      "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=80&h=80&fit=crop&crop=face",
  },
  {
    id: 8,
    name: "Sanjay L.",
    city: "Kolkata",
    rating: 4.9,
    rides: 556,
    customers: 223,
    verifiedOn: "Nov 2025",
    initials: "SL",
    color: "#9333ea",
    status: "on-trip" as Status,
    photo:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face",
  },
];

type Status = "available" | "on-trip" | "offline";

const REVIEWS = [
  {
    quote:
      "Driver was polite and arrived on time. My parents felt completely safe. Will use again!",
    name: "Priya S.",
    city: "Delhi",
  },
  {
    quote:
      "Booked Rajesh for my elderly mother. He called ahead and helped her with luggage. Excellent!",
    name: "Ankit V.",
    city: "Mumbai",
  },
  {
    quote:
      "Finally a service I can trust for my family. The OTP verification gives real peace of mind.",
    name: "Meena R.",
    city: "Bangalore",
  },
  {
    quote:
      "Been using DriveEase for 3 months. Same driver every time, feels like family now.",
    name: "Rohit K.",
    city: "Hyderabad",
  },
];

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

export default function HomePage({ navigate }: HomePageProps) {
  const [driverCount, setDriverCount] = useState(14);
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      setDriverCount((p) =>
        Math.min(18, Math.max(10, p + Math.floor(Math.random() * 5) - 2)),
      );
      t = setTimeout(tick, 4000 + Math.random() * 2000);
    };
    t = setTimeout(tick, 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.status === "offline") return d;
          const r = Math.random();
          let next: Status = d.status;
          if (d.status === "available" && r < 0.3) next = "on-trip";
          else if (d.status === "on-trip" && r < 0.35) next = "available";
          return { ...d, status: next };
        }),
      );
    }, 8000);
    return () => clearInterval(iv);
  }, []);

  const trustFade = useFadeIn();
  const howFade = useFadeIn();
  const driversFade = useFadeIn();
  const reviewsFade = useFadeIn();
  const featuresFade = useFadeIn();
  const ctaFade = useFadeIn();
  const cityFade = useFadeIn();
  const stripFade = useFadeIn();

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <style>{`
        @keyframes blinkDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.7)}}
        @keyframes pulseRing{0%{transform:scale(1);opacity:0.6}100%{transform:scale(2.4);opacity:0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatBlob{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-16px) scale(1.03)}}
        @keyframes carPulse{0%,100%{opacity:1}50%{opacity:0.6}}
        .blink{animation:blinkDot 1.4s ease-in-out infinite}
        .pulse-ring{animation:pulseRing 2s ease-out infinite}
        .fade-section{animation:fadeUp 0.65s ease both}
        .float-blob{animation:floatBlob 6s ease-in-out infinite}
        .hide-section{opacity:0}
        .driver-strip::-webkit-scrollbar{display:none}
        .driver-strip{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{
          minHeight: "92vh",
          background: "linear-gradient(160deg,#0f1a2e 0%,#e0f2fe 100%)",
        }}
      >
        <div
          className="float-blob absolute rounded-full pointer-events-none"
          style={{
            width: 480,
            height: 480,
            background: "radial-gradient(circle,#86efac,#6ee7b7)",
            opacity: 0.18,
            top: -120,
            right: -120,
          }}
        />
        <div
          className="float-blob absolute rounded-full pointer-events-none"
          style={{
            width: 300,
            height: 300,
            background: "radial-gradient(circle,#bfdbfe,#93c5fd)",
            opacity: 0.15,
            bottom: 30,
            left: -80,
            animationDelay: "3s",
          }}
        />
        <div
          className="relative z-10 max-w-7xl mx-auto px-4 pt-10 pb-16 flex flex-col lg:flex-row items-center gap-10"
          style={{ minHeight: "92vh" }}
        >
          <div className="flex-1 flex flex-col items-start gap-5">
            <div
              data-ocid="hero.live_badge"
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-green-200 rounded-full px-4 py-2 shadow-sm"
            >
              <span className="blink inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-green-700 font-semibold text-sm">
                {driverCount} drivers nearby right now
              </span>
            </div>
            <h1
              className="font-bold text-gray-900"
              style={{ fontSize: "clamp(1.8rem,5vw,3rem)", lineHeight: 1.18 }}
            >
              Book Verified Drivers
              <br />
              <span style={{ color: "#00e676" }}>Near You</span>
            </h1>
            <p className="text-gray-600 text-base max-w-md">
              Safe, reliable rides with OTP verification and real drivers.
              Trusted by 1000+ families across India.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                data-ocid="hero.find_drivers_button"
                onClick={() => navigate("drivers")}
                className="flex items-center gap-2 font-semibold px-7 py-3.5 rounded-full text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(135deg,#16a34a,#15803d)",
                  boxShadow: "0 4px 24px #16a34a55",
                }}
              >
                <MapPin size={18} /> Find Drivers
              </button>
              <a
                href="https://wa.me/917836887228"
                target="_blank"
                rel="noopener noreferrer"
                data-ocid="hero.whatsapp_button"
                className="flex items-center gap-2 font-semibold px-7 py-3.5 rounded-full bg-white border-2 border-green-500 text-green-700 shadow transition-all hover:bg-green-50 hover:scale-105 active:scale-95"
              >
                <svg
                  aria-label="WhatsApp"
                  role="img"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-green-600"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Book via WhatsApp
              </a>
            </div>
            <p className="text-gray-400 text-xs">
              Takes less than 30 seconds · No hidden charges
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "🎉 First Ride ₹50 Off",
                "👨\u200d👩\u200d👧 1000+ Happy Families",
                "✅ Background Checked",
              ].map((b) => (
                <span
                  key={b}
                  className="bg-white border border-green-200 text-green-800 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full max-w-lg flex justify-center">
            <DriveEaseBrandHero driverCount={driverCount} />
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section
        ref={trustFade.ref}
        className={trustFade.visible ? "fade-section" : "hide-section"}
        style={{ background: "#0d1420", padding: "2.5rem 1rem" }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <Shield size={28} className="text-green-600" />,
                label: "Police Verified Drivers",
                sub: "Every driver is background-checked",
              },
              {
                icon: <MapPin size={28} className="text-blue-600" />,
                label: "GPS Tracked Rides",
                sub: "Live location shared with family",
              },
              {
                icon: <Lock size={28} className="text-purple-600" />,
                label: "OTP Secured Trips",
                sub: "Ride starts only after OTP match",
              },
            ].map((b) => (
              <div
                key={b.label}
                className="flex items-center gap-4 bg-white rounded-2xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-gray-50">
                  {b.icon}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {b.label}
                  </div>
                  <div className="text-gray-500 text-xs mt-0.5">{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        ref={howFade.ref}
        className={howFade.visible ? "fade-section" : "hide-section"}
        style={{ background: "#0a0f1a", padding: "4rem 1rem" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            How It Works
          </h2>
          <p className="text-gray-500 text-sm mb-10">
            Get a verified driver in 3 simple steps
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: "📍",
                title: "Enter Location",
                desc: "Enter your pickup and drop location. We detect nearby drivers instantly.",
              },
              {
                step: "02",
                icon: "🚗",
                title: "Get Nearby Drivers",
                desc: "Choose from verified drivers near you. See ratings, reviews and distance.",
              },
              {
                step: "03",
                icon: "🔐",
                title: "Start Ride with OTP",
                desc: "Driver enters OTP to start. Your safety is locked in every ride.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="relative bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center shadow">
                  {s.step}
                </div>
                <div className="text-4xl mb-3">{s.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1.5">
                  {s.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DRIVER CARDS */}
      <section
        ref={driversFade.ref}
        className={driversFade.visible ? "fade-section" : "hide-section"}
        style={{ background: "#0d1420", padding: "4rem 1rem" }}
        data-ocid="drivers.section"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Verified Drivers Near You
            </h2>
            <p className="text-gray-500 text-sm">
              All drivers are police-verified and rated by real customers
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {drivers.map((d, i) => (
              <DriverCard
                key={d.id}
                driver={d}
                index={i + 1}
                navigate={navigate}
              />
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section
        ref={reviewsFade.ref}
        className={reviewsFade.visible ? "fade-section" : "hide-section"}
        style={{
          background: "linear-gradient(135deg,#0f1a2e 0%,#e0f2fe 100%)",
          padding: "4rem 1rem",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              What Families Say
            </h2>
            <p className="text-gray-500 text-sm">
              Real stories from real customers across India
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {REVIEWS.map((r) => (
              <div
                key={r.name}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 border border-white hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-0.5 mb-3">
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4 italic">
                  &ldquo;{r.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
                    {r.name
                      .split(" ")
                      .map((x) => x[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">
                      {r.name}
                    </div>
                    <div className="text-gray-400 text-xs">{r.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UNIQUE FEATURES */}
      <section
        ref={featuresFade.ref}
        className={featuresFade.visible ? "fade-section" : "hide-section"}
        style={{ background: "#0d1420", padding: "4rem 1rem" }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Why DriveEase is Different
            </h2>
            <p className="text-gray-500 text-sm">
              Built around trust, not just transactions
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100 hover:shadow-lg hover:-translate-y-1 transition-all">
              <Heart size={32} className="text-red-500 mb-3" fill="#ef4444" />
              <h3 className="font-bold text-gray-900 mb-2">Favourite Driver</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Save and rebook the same trusted driver every time. Build a
                long-term relationship.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all">
              <Users size={32} className="text-blue-500 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">
                Driver for Parents
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Safe rides for your loved ones. We vet every driver personally.
                Your family deserves the best.
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 hover:shadow-lg hover:-translate-y-1 transition-all">
              <Calendar size={32} className="text-green-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">
                Subscription Plans
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                Monthly driver from ₹8,000/mo. Fixed driver, no daily hassle.
                Best value for daily commuters.
              </p>
              <button
                type="button"
                data-ocid="features.view_plans_button"
                onClick={() => navigate("plans")}
                className="text-green-700 text-sm font-semibold underline underline-offset-2 hover:text-green-900 transition-colors"
              >
                View Plans →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CONVERSION CTA */}
      <section
        ref={ctaFade.ref}
        className={ctaFade.visible ? "fade-section" : "hide-section"}
        style={{
          background: "linear-gradient(135deg,#0f1a2e,#1a2e1a20)",
          padding: "4rem 1rem",
        }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { icon: "🎉", text: "First Ride ₹50 Off" },
              { icon: "👨\u200d👩\u200d👧", text: "1000+ Happy Families" },
              { icon: "✅", text: "Background Checked Drivers" },
            ].map((b) => (
              <div
                key={b.text}
                className="flex items-center gap-2 bg-white rounded-full px-5 py-2.5 shadow-sm border border-green-100"
              >
                <span className="text-lg">{b.icon}</span>
                <span className="font-semibold text-green-800 text-sm">
                  {b.text}
                </span>
              </div>
            ))}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Ready to Book Your First Ride?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of families who trust DriveEase for safe, verified
            rides.
          </p>
          <button
            type="button"
            data-ocid="cta.book_ride_button"
            onClick={() => navigate("book")}
            className="font-bold px-10 py-4 rounded-full text-white text-lg shadow-xl transition-all hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg,#16a34a,#15803d)",
              boxShadow: "0 6px 32px #16a34a66",
            }}
          >
            🚗 Book Your First Ride
          </button>
          <p className="text-gray-400 text-xs mt-3">
            No registration required · Talk to a driver first
          </p>
        </div>
      </section>

      {/* CITY COVERAGE */}
      <section
        ref={cityFade.ref}
        className={cityFade.visible ? "fade-section" : "hide-section"}
        style={{ background: "#0d1420", padding: "3rem 1rem" }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Available In Your City
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Expanding across India, one city at a time
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { city: "Delhi", emoji: "🏛️" },
              { city: "Mumbai", emoji: "🌊" },
              { city: "Bangalore", emoji: "🌿" },
              { city: "Hyderabad", emoji: "💎" },
            ].map((c) => (
              <div
                key={c.city}
                className="flex items-center gap-2 bg-white border-2 border-green-200 rounded-full px-6 py-2.5 shadow-sm hover:bg-green-50 hover:border-green-400 transition-all"
              >
                <span className="text-lg">{c.emoji}</span>
                <span className="font-semibold text-green-800">{c.city}</span>
                <CheckCircle size={14} className="text-green-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DRIVER PHOTO STRIP */}
      <section
        ref={stripFade.ref}
        className={stripFade.visible ? "fade-section" : "hide-section"}
        style={{
          background: "linear-gradient(135deg,#0f1a2e 0%,#1a2e1a20 100%)",
          padding: "3rem 0 3.5rem",
          borderTop: "1px solid #d1fae5",
        }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Meet Our Drivers
            </h2>
            <p className="text-gray-500 text-sm">
              Verified professionals ready to serve you
            </p>
          </div>
          <div
            className="driver-strip flex gap-6 overflow-x-auto pb-2"
            style={{ scrollBehavior: "smooth" }}
          >
            {SIDEBAR_DRIVERS.map((d) => (
              <div
                key={d.id}
                className="flex-shrink-0 flex flex-col items-center gap-2"
              >
                <div className="relative">
                  <img
                    src={d.photo}
                    alt={d.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = "none";
                      const fallback =
                        target.nextElementSibling as HTMLElement | null;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                  <div
                    className="w-16 h-16 rounded-full items-center justify-center text-white font-bold text-sm hidden"
                    style={{
                      background: `linear-gradient(135deg,${d.color},${d.color}cc)`,
                    }}
                  >
                    {d.initials}
                  </div>
                  <span
                    className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      d.status === "available"
                        ? "bg-green-500 blink"
                        : d.status === "on-trip"
                          ? "bg-orange-500"
                          : "bg-gray-400"
                    }`}
                  />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-800 text-xs">
                    {d.name}
                  </div>
                  <div className="text-gray-400 text-xs">{d.city}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INVESTORS SECTION */}
      <section
        style={{
          background: "#0d1420",
          padding: "4rem 1rem",
          borderTop: "1px solid #d1fae5",
        }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-3">
            Backed &amp; Trusted By
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Our Investors &amp; Partners
          </h2>
          <p className="text-gray-500 text-sm mb-10 max-w-md mx-auto">
            Leading companies and visionary investors who believe in making
            India's roads safer, one family at a time.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 mb-10">
            {[
              {
                name: "Sequoia Capital India",
                abbr: "SC",
                color: "#0f172a",
                bg: "#f8fafc",
              },
              {
                name: "Matrix Partners",
                abbr: "MP",
                color: "#1d4ed8",
                bg: "#eff6ff",
              },
              {
                name: "Kalaari Capital",
                abbr: "KC",
                color: "#7c3aed",
                bg: "#f5f3ff",
              },
              {
                name: "Blume Ventures",
                abbr: "BV",
                color: "#0369a1",
                bg: "#f0f9ff",
              },
              {
                name: "Lightspeed India",
                abbr: "LI",
                color: "#b45309",
                bg: "#fffbeb",
              },
              {
                name: "Accel Partners",
                abbr: "AP",
                color: "#00e676",
                bg: "#0f1a2e",
              },
            ].map((inv) => (
              <div
                key={inv.name}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all"
                style={{ background: inv.bg }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: inv.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "1rem",
                    color: "#0d1420",
                    fontFamily: "'Orbitron', sans-serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  {inv.abbr}
                </div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: "#94a3b8",
                    textAlign: "center",
                    lineHeight: 1.3,
                  }}
                >
                  {inv.name}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { stat: "₹12 Cr+", label: "Total Funding" },
              { stat: "6", label: "Investors" },
              { stat: "2024", label: "Founded" },
              { stat: "Pan India", label: "Coverage" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white border border-green-100 rounded-2xl px-8 py-4 shadow-sm text-center"
              >
                <div className="font-bold text-2xl text-green-700">
                  {s.stat}
                </div>
                <div className="text-gray-400 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          background: "#0a0f1a",
          borderTop: "1px solid #d1fae5",
          padding: "1.5rem 1rem",
          textAlign: "center",
        }}
      >
        <p className="text-gray-500 text-xs">
          © {new Date().getFullYear()} DriveEase. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* MOBILE STICKY BAR */}
      <div
        className="fixed bottom-0 left-0 right-0 md:hidden z-30 flex border-t border-green-100"
        style={{ background: "#0d1420", padding: "0.75rem 1rem" }}
      >
        <button
          type="button"
          data-ocid="mobile.book_now_button"
          onClick={() => navigate("book")}
          className="flex-1 font-bold py-3 rounded-full text-white mr-2 text-sm"
          style={{ background: "linear-gradient(135deg,#16a34a,#15803d)" }}
        >
          🚗 Book Now
        </button>
        <button
          type="button"
          data-ocid="mobile.find_drivers_button"
          onClick={() => navigate("drivers")}
          className="flex-1 font-bold py-3 rounded-full text-green-700 border-2 border-green-500 text-sm"
        >
          📍 Find Drivers
        </button>
      </div>
    </div>
  );
}

function DriveEaseBrandHero({ driverCount }: { driverCount: number }) {
  return (
    <div
      className="relative rounded-3xl overflow-hidden shadow-2xl border border-green-100"
      style={{
        background:
          "linear-gradient(135deg,#0f1a2e 0%,#1a2e1a20 60%,#d1fae5 100%)",
        minHeight: 400,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2.5rem 2rem",
        gap: "1.5rem",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute"
        style={{
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle,#bbf7d0,#86efac)",
          opacity: 0.25,
          top: -60,
          right: -60,
        }}
      />
      <div
        className="absolute"
        style={{
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: "radial-gradient(circle,#bfdbfe,#93c5fd)",
          opacity: 0.2,
          bottom: -40,
          left: -40,
        }}
      />

      {/* Logo mark */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "0.75rem",
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#16a34a,#0d9488)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 36px rgba(0,230,118,0.4)",
            }}
          >
            <svg
              viewBox="0 0 40 28"
              width="50"
              height="36"
              fill="none"
              role="img"
              aria-label="DriveEase car"
            >
              <title>DriveEase car</title>
              <rect
                x="4"
                y="10"
                width="32"
                height="14"
                rx="4"
                fill="white"
                opacity="0.95"
              />
              <path
                d="M8 10 L12 3 L28 3 L32 10"
                stroke="white"
                strokeWidth="2"
                fill="rgba(255,255,255,0.2)"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="11"
                cy="25"
                r="3.5"
                fill="#0d9488"
                stroke="white"
                strokeWidth="1.5"
              />
              <circle
                cx="29"
                cy="25"
                r="3.5"
                fill="#0d9488"
                stroke="white"
                strokeWidth="1.5"
              />
              <rect
                x="14"
                y="13"
                width="12"
                height="6"
                rx="1.5"
                fill="rgba(0,230,118,0.4)"
              />
            </svg>
          </div>
        </div>

        <div
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 900,
            fontSize: "2.6rem",
            letterSpacing: "0.04em",
            background: "linear-gradient(135deg,#15803d,#0d9488)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1.1,
            marginBottom: "0.25rem",
          }}
        >
          DriveEase
        </div>
        <div
          style={{
            color: "#94a3b8",
            fontSize: "0.78rem",
            letterSpacing: "0.24em",
            fontWeight: 600,
            textTransform: "uppercase",
            marginBottom: "1.25rem",
          }}
        >
          Personal Driver Network
        </div>
      </div>

      {/* Live stats */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[
          {
            value: driverCount.toString(),
            label: "Live Captains",
            color: "#00e676",
            dot: true,
          },
          {
            value: "1,000+",
            label: "Happy Families",
            color: "#0284c7",
            dot: false,
          },
          { value: "4.9 ★", label: "Avg Rating", color: "#7c3aed", dot: false },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(8px)",
              borderRadius: 16,
              padding: "0.75rem 1.2rem",
              textAlign: "center",
              minWidth: 90,
              boxShadow: "0 2px 12px rgba(0,230,118,0.1)",
              border: "1px solid rgba(255,255,255,0.7)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              {s.dot && (
                <span
                  className="blink"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#00e676",
                    display: "inline-block",
                  }}
                />
              )}
              <span
                style={{ fontWeight: 800, fontSize: "1.1rem", color: s.color }}
              >
                {s.value}
              </span>
            </div>
            <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: 2 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Trust badges */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          width: "100%",
        }}
      >
        {[
          { icon: "🛡️", text: "Police Verified Captains" },
          { icon: "📍", text: "GPS Tracked Every Ride" },
          { icon: "🔐", text: "OTP Secured Trip Start" },
        ].map((b) => (
          <div
            key={b.text}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              background: "rgba(255,255,255,0.75)",
              borderRadius: 12,
              padding: "0.5rem 0.85rem",
              border: "1px solid rgba(0,230,118,0.15)",
              backdropFilter: "blur(4px)",
            }}
          >
            <span style={{ fontSize: "1rem" }}>{b.icon}</span>
            <span
              style={{ fontSize: "0.8rem", fontWeight: 600, color: "#e2e8f0" }}
            >
              {b.text}
            </span>
            <span
              style={{
                marginLeft: "auto",
                color: "#00e676",
                fontSize: "0.75rem",
              }}
            >
              ✓
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DriverCard({
  driver,
  index,
  navigate,
}: {
  driver: (typeof INITIAL_DRIVERS)[0];
  index: number;
  navigate: (p: string) => void;
}) {
  const statusConfig = {
    available: {
      dot: "bg-green-500",
      label: "Available Now",
      text: "text-green-700",
      bg: "bg-green-50 border-green-200",
      blink: true,
    },
    "on-trip": {
      dot: "bg-orange-500",
      label: "On Trip",
      text: "text-orange-700",
      bg: "bg-orange-50 border-orange-200",
      blink: false,
    },
    offline: {
      dot: "bg-gray-400",
      label: "Offline",
      text: "text-gray-600",
      bg: "bg-gray-50 border-gray-200",
      blink: false,
    },
  };
  const s = statusConfig[driver.status];
  return (
    <div
      data-ocid={`drivers.item.${index}`}
      className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 flex flex-col gap-3 hover:shadow-xl hover:-translate-y-1 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="relative">
          <img
            src={driver.photo}
            alt={driver.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
              const fallback = target.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = "flex";
            }}
          />
          <div
            className="w-14 h-14 rounded-full items-center justify-center text-white font-bold text-lg shadow-inner hidden"
            style={{
              background: `linear-gradient(135deg,${driver.color},${driver.color}cc)`,
            }}
          >
            {driver.initials}
          </div>
        </div>
        <span
          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.bg} ${s.text}`}
        >
          <span
            className={`w-2 h-2 rounded-full ${s.dot} ${s.blink ? "blink" : ""}`}
          />
          {s.label}
        </span>
      </div>
      <div>
        <div className="font-bold text-gray-900 text-sm">{driver.name}</div>
        <div className="text-gray-400 text-xs">{driver.city}</div>
      </div>
      <div className="grid grid-cols-2 gap-1.5 text-xs">
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="font-semibold text-gray-800">{driver.rides}</div>
          <div className="text-gray-400">rides</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-2">
          <div className="flex items-center gap-0.5 font-semibold text-gray-800">
            <Star size={10} fill="#f59e0b" color="#f59e0b" />
            {driver.rating}
          </div>
          <div className="text-gray-400">{driver.customers} reviews</div>
        </div>
      </div>
      <div className="text-xs text-gray-400">
        ✅ Verified {driver.verifiedOn}
      </div>
      <div className="flex gap-2 mt-auto">
        <button
          type="button"
          data-ocid={`drivers.book_button.${index}`}
          onClick={() => navigate("book")}
          className="flex-1 text-xs font-semibold py-2 rounded-lg text-white transition-all hover:opacity-90"
          style={{
            background: driver.status === "offline" ? "#64748b" : "#16a34a",
          }}
          disabled={driver.status === "offline"}
        >
          Book Now
        </button>
        <a
          href="tel:+917836887228"
          data-ocid={`drivers.call_button.${index}`}
          className="flex-1 text-xs font-semibold py-2 rounded-lg text-green-700 border border-green-400 text-center hover:bg-green-50 transition-all"
        >
          Call Driver
        </a>
      </div>
    </div>
  );
}

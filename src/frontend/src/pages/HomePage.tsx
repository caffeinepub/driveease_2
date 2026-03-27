import {
  Calendar,
  CheckCircle,
  Heart,
  Lock,
  MapPin,
  Phone,
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
  const [heroSlide, setHeroSlide] = useState(0);

  const HERO_IMAGES = [
    "/assets/generated/indian-driver-hero.dim_1920x1080.jpg",
    "/assets/uploads/experience_luxury_with_black_car_services-019d203f-148d-76bf-b70f-f749e8b7ad54-1.jpg",
    "/assets/uploads/experience_luxury_with_our_limo_service-019d203f-15a8-7504-85d7-179717824a70-3.jpg",
    "/assets/uploads/download_2-019d203f-15ac-742a-9cf1-ccd9f37f334f-4.jpg",
  ];

  useEffect(() => {
    const iv = setInterval(() => {
      setHeroSlide((p) => (p + 1) % HERO_IMAGES.length);
    }, 3000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        @keyframes slideIn{from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:scale(1)}}
        .hero-slide{animation:slideIn 0.9s ease both}
        .blink{animation:blinkDot 1.4s ease-in-out infinite}
        .pulse-ring{animation:pulseRing 2s ease-out infinite}
        .fade-section{animation:fadeUp 0.65s ease both}
        .float-blob{animation:floatBlob 6s ease-in-out infinite}
        .hide-section{opacity:0}
        .driver-strip::-webkit-scrollbar{display:none}
        .driver-strip{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      {/* ANNOUNCEMENT STRIP */}
      <div
        style={{
          background:
            "linear-gradient(90deg,#FF6B6B,#42A5F5,#FFCA28,#66BB6A,#FF6B6B,#42A5F5,#FFCA28,#66BB6A)",
          overflow: "hidden",
          padding: "0.55rem 0",
          position: "relative",
          zIndex: 5,
        }}
      >
        <div className="marquee-track" style={{ gap: "0 3rem" }}>
          {["a", "b"].map((k) => (
            <span
              key={k}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2rem",
                paddingRight: "3rem",
              }}
            >
              {[
                "🚗 Book Your Driver Today",
                "🎉 20% Off First Ride",
                "🛡️ Police Verified Drivers",
                "📍 GPS Tracked Every Ride",
                "👨‍👩‍👧 Trusted by 5000+ Families",
                "📞 24/7 Support Available",
                "⚡ Book in Under 60 Seconds",
                "🏆 India's #1 Driver Network",
              ].map((text) => (
                <span
                  key={text}
                  style={{
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {text}
                  <span
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: "0.7rem",
                    }}
                  >
                    •
                  </span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* HERO - Split layout */}
      <section
        className="relative overflow-hidden flex flex-col md:flex-row"
        style={{ minHeight: "100vh" }}
      >
        {/* LEFT: Text & CTAs */}
        <div
          className="flex flex-col justify-center gap-5 px-8 py-16 md:py-20 w-full md:w-1/2"
          style={{
            background: "linear-gradient(135deg,#eff6ff 0%,#f0fdf4 100%)",
            zIndex: 2,
          }}
        >
          <div
            data-ocid="hero.live_badge"
            className="flex items-center gap-2 border border-blue-400/40 rounded-full px-4 py-2 w-fit"
            style={{ background: "rgba(66,165,245,0.08)" }}
          >
            <span className="blink inline-block w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span className="text-blue-500 font-semibold text-sm">
              {driverCount} drivers nearby right now
            </span>
          </div>
          <h1
            className="font-bold text-gray-900"
            style={{ fontSize: "clamp(1.8rem,4vw,3rem)", lineHeight: 1.15 }}
          >
            Book Professional Drivers
            <br />
            <span style={{ color: "#42A5F5" }}>Anytime, Anywhere</span>
          </h1>
          <p
            className="text-gray-600 text-base max-w-sm"
            style={{ lineHeight: 1.7 }}
          >
            Safe, Verified, Affordable Drivers at Your Service. Trusted by 1000+
            families across India.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              data-ocid="hero.book_driver_button"
              onClick={() => navigate("book")}
              className="flex items-center gap-2 font-semibold px-6 py-3 rounded-full text-white shadow-lg transition-all hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg,#FF6B6B,#42A5F5,#66BB6A)",
                boxShadow: "0 4px 24px #1565C077",
                minHeight: 48,
              }}
            >
              <MapPin size={18} /> Book a Driver Now
            </button>
            <button
              type="button"
              data-ocid="hero.become_driver_button"
              onClick={() => navigate("register-driver")}
              className="flex items-center gap-2 font-semibold px-6 py-3 rounded-full border-2 border-red-400 text-blue-500 shadow transition-all hover:bg-red-950/30 hover:scale-105 active:scale-95"
              style={{ background: "rgba(0,0,0,0.2)", minHeight: 48 }}
            >
              🚗 Become a Driver
            </button>
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
                className="border border-red-400/30 text-red-200 text-xs font-medium px-3 py-1.5 rounded-full"
                style={{ background: "rgba(0,230,118,0.07)" }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT: Auto-play photo slideshow */}
        <div
          className="relative w-full md:w-1/2 overflow-hidden"
          style={{ minHeight: "40vh", height: "auto", background: "#000" }}
        >
          {HERO_IMAGES.map((img, i) => (
            <img
              key={img}
              src={img}
              alt={`DriveEase luxury vehicle ${i + 1}`}
              className={heroSlide === i ? "hero-slide" : ""}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: heroSlide === i ? 1 : 0,
                transition: "opacity 0.9s ease",
                zIndex: heroSlide === i ? 1 : 0,
              }}
            />
          ))}
          {/* Slide dots */}
          <div
            style={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 6,
              zIndex: 5,
            }}
          >
            {[0, 1, 2, 3].map((dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                aria-label={`Slide ${dotIdx + 1}`}
                onClick={() => setHeroSlide(dotIdx)}
                style={{
                  width: heroSlide === dotIdx ? 20 : 8,
                  height: 8,
                  borderRadius: 9999,
                  border: "none",
                  background:
                    heroSlide === dotIdx ? "#00e676" : "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* BRANDING BANNER */}
      <section
        style={{
          background:
            "linear-gradient(135deg,#FF6B6B 0%,#42A5F5 35%,#FFCA28 65%,#66BB6A 100%)",
          padding: "3.5rem 1rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.05) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.12)",
              borderRadius: 9999,
              padding: "0.3rem 1rem",
              marginBottom: "1rem",
            }}
          >
            <span
              style={{
                color: "#ffd6d6",
                fontWeight: 600,
                fontSize: "0.82rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              India's Most Trusted Platform
            </span>
          </div>
          <h2
            style={{
              color: "#ffffff",
              fontWeight: 900,
              fontSize: "clamp(1.8rem,4vw,3rem)",
              marginBottom: "0.75rem",
              lineHeight: 1.2,
              fontFamily: "'Orbitron',monospace",
              letterSpacing: "-0.01em",
            }}
          >
            India's #1 Personal Driver Network
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: "1.1rem",
              marginBottom: "2.5rem",
              maxWidth: 600,
              margin: "0 auto 2.5rem",
            }}
          >
            Connecting 5,000+ Families with Verified, Background-Checked,
            Trusted Drivers Across 50+ Cities
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1.5rem",
              justifyContent: "center",
            }}
          >
            {[
              { num: "5,000+", label: "Happy Families", icon: "👨‍👩‍👧" },
              { num: "500+", label: "Verified Drivers", icon: "🛡️" },
              { num: "50+", label: "Cities Served", icon: "🏙️" },
              { num: "4.9★", label: "Average Rating", icon: "⭐" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(8px)",
                  borderRadius: 16,
                  padding: "1.5rem 2rem",
                  border: "1px solid rgba(255,255,255,0.2)",
                  minWidth: 160,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "1.8rem", marginBottom: "0.4rem" }}>
                  {stat.icon}
                </div>
                <div
                  style={{
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: "1.8rem",
                    lineHeight: 1,
                  }}
                >
                  {stat.num}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    fontSize: "0.82rem",
                    marginTop: "0.3rem",
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROMO CARDS */}
      <section
        style={{
          background:
            "linear-gradient(135deg,#fff5f5 0%,#eff6ff 50%,#f0fdf4 100%)",
          padding: "2.5rem 1rem",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: "1.25rem",
          }}
        >
          {[
            {
              icon: "🎯",
              title: "First Ride Offer",
              desc: "Get 20% off your very first booking with DriveEase. Premium drivers, unbeatable price.",
              badge: "LIMITED OFFER",
            },
            {
              icon: "🛡️",
              title: "100% Police Verified",
              desc: "Every driver undergoes thorough background checks. Your family's safety is our #1 priority.",
              badge: "GUARANTEED",
            },
            {
              icon: "⚡",
              title: "Book in 60 Seconds",
              desc: "Fastest booking experience — select location, confirm, done. Your driver is on the way.",
              badge: "INSTANT",
            },
          ].map((card) => (
            <div
              key={card.title}
              style={{
                background: "#ffffff",
                borderRadius: 16,
                padding: "1.75rem",
                borderLeft: "4px solid #42A5F5",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                }}
              >
                <span style={{ fontSize: "2rem" }}>{card.icon}</span>
                <span
                  style={{
                    background: "#42A5F5",
                    color: "#fff",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.6rem",
                    borderRadius: 9999,
                    letterSpacing: "0.06em",
                  }}
                >
                  {card.badge}
                </span>
              </div>
              <h3
                style={{
                  color: "#f1f5f9",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  margin: 0,
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "0.88rem",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST BADGES */}
      <section
        ref={trustFade.ref}
        className={trustFade.visible ? "fade-section" : "hide-section"}
        style={{ background: "#f8fafc", padding: "2.5rem 1rem" }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <Shield size={28} className="text-red-600" />,
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
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100">
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
        style={{ background: "#ffffff", padding: "4rem 1rem" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            How It Works
          </h2>
          <p className="text-gray-600 text-sm mb-10">
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
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-red-700 text-white text-xs font-bold flex items-center justify-center shadow">
                  {s.step}
                </div>
                <div className="text-4xl mb-3">{s.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1.5">
                  {s.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
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
        style={{ background: "#f8fafc", padding: "4rem 1rem" }}
        data-ocid="drivers.section"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Verified Drivers Near You
            </h2>
            <p className="text-gray-600 text-sm">
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
          background:
            "linear-gradient(135deg,#fff5f5 0%,#eff6ff 50%,#f0fdf4 100%)",
          padding: "4rem 1rem",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              What Families Say
            </h2>
            <p className="text-gray-600 text-sm">
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
                  <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-xs">
                    {r.name
                      .split(" ")
                      .map((x) => x[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">
                      {r.name}
                    </div>
                    <div className="text-gray-500 text-xs">{r.city}</div>
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
        style={{ background: "#f8fafc", padding: "4rem 1rem" }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Why DriveEase is Different
            </h2>
            <p className="text-gray-600 text-sm">
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
            <div className="bg-gradient-to-br from-red-50 to-red-50 rounded-2xl p-6 border border-red-100 hover:shadow-lg hover:-translate-y-1 transition-all">
              <Calendar size={32} className="text-red-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">
                Subscription Plans
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-3">
                Monthly driver from ₹8,000/mo. Fixed driver, no daily hassle.
                Best value for daily commuters.
              </p>
              <button
                type="button"
                data-ocid="features.view_plans_button"
                onClick={() => navigate("plans")}
                className="text-red-700 text-sm font-semibold underline underline-offset-2 hover:text-red-900 transition-colors"
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
          background: "#f0fdf4",
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
                className="flex items-center gap-2 bg-white rounded-full px-5 py-2.5 shadow-sm border border-red-100"
              >
                <span className="text-lg">{b.icon}</span>
                <span className="font-semibold text-red-800 text-sm">
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
              background: "linear-gradient(135deg,#FF6B6B,#42A5F5,#66BB6A)",
              boxShadow: "0 6px 32px #1565C066",
            }}
          >
            🚗 Book Your First Ride
          </button>
          <p className="text-gray-500 text-xs mt-3">
            No registration required · Talk to a driver first
          </p>
        </div>
      </section>

      {/* CITY COVERAGE */}
      <section
        ref={cityFade.ref}
        className={cityFade.visible ? "fade-section" : "hide-section"}
        style={{ background: "#f8fafc", padding: "3rem 1rem" }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Available In Your City
          </h2>
          <p className="text-gray-600 text-sm mb-6">
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
                className="flex items-center gap-2 bg-white border-2 border-red-200 rounded-full px-6 py-2.5 shadow-sm hover:bg-red-50 hover:border-red-400 transition-all"
              >
                <span className="text-lg">{c.emoji}</span>
                <span className="font-semibold text-red-800">{c.city}</span>
                <CheckCircle size={14} className="text-red-500" />
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
          background: "#f8fafc",
          padding: "3rem 0 3.5rem",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Meet Our Drivers
            </h2>
            <p className="text-gray-600 text-sm">
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
                        ? "bg-red-500 blink"
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
                  <div className="text-gray-500 text-xs">{d.city}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY FAMILIES TRUST DRIVEEASE */}
      <section
        style={{
          background:
            "linear-gradient(135deg, #fff5f5 0%, #eff6ff 50%, #f0fdf4 100%)",
          padding: "5rem 1rem",
          borderTop: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p
              style={{
                color: "#42A5F5",
                fontSize: "0.8rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "0.5rem",
              }}
            >
              Trusted & Verified
            </p>
            <h2
              style={{
                color: "#1e293b",
                fontWeight: 800,
                fontSize: "clamp(1.6rem,3vw,2.4rem)",
                marginBottom: "0.75rem",
              }}
            >
              Why Families Trust DriveEase
            </h2>
            <p
              style={{
                color: "#64748b",
                maxWidth: 500,
                margin: "0 auto",
                lineHeight: 1.7,
                fontSize: "0.95rem",
              }}
            >
              We put safety, reliability, and peace of mind first—every single
              ride.
            </p>
          </div>

          {/* Trust Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
              gap: "1.25rem",
              marginBottom: "4rem",
            }}
          >
            {[
              {
                icon: "✅",
                title: "Verified Drivers",
                desc: "Police verified, background checked, and trained professionals.",
              },
              {
                icon: "🛡️",
                title: "Safety Guarantee",
                desc: "OTP-secured rides and real-time GPS tracking on every trip.",
              },
              {
                icon: "⭐",
                title: "5-Star Ratings",
                desc: "1000+ happy families across India rate us 4.8/5 on average.",
              },
              {
                icon: "📞",
                title: "24/7 Support",
                desc: "Our support team is always here when you need us, day or night.",
              },
            ].map((card) => (
              <div
                key={card.title}
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(0,230,118,0.15)",
                  borderRadius: 16,
                  padding: "1.75rem",
                  textAlign: "center",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 40px rgba(0,230,118,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                  {card.icon}
                </div>
                <h3
                  style={{
                    color: "#1e293b",
                    fontWeight: 700,
                    fontSize: "1rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    color: "#64748b",
                    fontSize: "0.875rem",
                    lineHeight: 1.6,
                  }}
                >
                  {card.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <h3
            style={{
              color: "#1e293b",
              fontWeight: 700,
              fontSize: "1.4rem",
              textAlign: "center",
              marginBottom: "1.5rem",
            }}
          >
            What Our Customers Say
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
              gap: "1.25rem",
            }}
          >
            {[
              {
                name: "Priya Sharma",
                city: "Delhi",
                text: "DriveEase found me the perfect driver for my elderly parents. Very reliable and professional!",
                rating: 5,
                initials: "PS",
              },
              {
                name: "Rajesh Kumar",
                city: "Mumbai",
                text: "Professional, punctual, and affordable. Booked the same driver three times already!",
                rating: 5,
                initials: "RK",
              },
              {
                name: "Meera Patel",
                city: "Bangalore",
                text: "Finally a service I can trust for my family. Highly recommended to everyone.",
                rating: 5,
                initials: "MP",
              },
            ].map((review) => (
              <div
                key={review.name}
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(0,230,118,0.12)",
                  borderRadius: 16,
                  padding: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "0.25rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  {"⭐".repeat(review.rating)}
                </div>
                <p
                  style={{
                    color: "#475569",
                    fontSize: "0.9rem",
                    lineHeight: 1.7,
                    marginBottom: "1rem",
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{review.text}&rdquo;
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg,#FF6B6B,#42A5F5,#66BB6A)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      color: "#0a0f1a",
                    }}
                  >
                    {review.initials}
                  </div>
                  <div>
                    <div
                      style={{
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      {review.name}
                    </div>
                    <div style={{ color: "#64748b", fontSize: "0.78rem" }}>
                      {review.city}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INVESTORS SECTION */}
      <section
        style={{
          background: "linear-gradient(135deg,#eff6ff 0%,#fff5f5 100%)",
          padding: "4rem 1rem",
          borderTop: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold mb-3">
            Backed &amp; Trusted By
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Our Investors &amp; Partners
          </h2>
          <p className="text-gray-600 text-sm mb-10 max-w-md mx-auto">
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
                className="bg-white border border-red-100 rounded-2xl px-8 py-4 shadow-sm text-center"
              >
                <div className="font-bold text-2xl text-red-700">{s.stat}</div>
                <div className="text-gray-500 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          background: "#0f172a",
          borderTop: "1px solid rgba(255,255,255,0.08)",
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
            className="text-red-600 hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* MOBILE STICKY BAR */}
      <div
        className="fixed bottom-0 left-0 right-0 md:hidden z-30 flex border-t border-red-100"
        style={{ background: "#f8fafc", padding: "0.75rem 1rem" }}
      >
        <button
          type="button"
          data-ocid="mobile.book_now_button"
          onClick={() => navigate("book")}
          className="flex-1 font-bold py-3 rounded-full text-white mr-2 text-sm"
          style={{
            background: "linear-gradient(135deg,#FF6B6B,#42A5F5,#66BB6A)",
          }}
        >
          🚗 Book Now
        </button>
        <button
          type="button"
          data-ocid="mobile.find_drivers_button"
          onClick={() => navigate("drivers")}
          className="flex-1 font-bold py-3 rounded-full text-red-700 border-2 border-red-600 text-sm"
        >
          📍 Find Drivers
        </button>
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
      dot: "bg-red-500",
      label: "Available Now",
      text: "text-red-700",
      bg: "bg-red-50 border-red-200",
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
      text: "text-slate-300",
      bg: "bg-slate-800 border-slate-700",
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
        <div className="text-gray-500 text-xs">{driver.city}</div>
      </div>
      <div className="grid grid-cols-2 gap-1.5 text-xs">
        <div className="bg-gray-100 rounded-lg p-2">
          <div className="font-semibold text-slate-100">{driver.rides}</div>
          <div className="text-gray-500">rides</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-2">
          <div className="flex items-center gap-0.5 font-semibold text-gray-800">
            <Star size={10} fill="#f59e0b" color="#f59e0b" />
            {driver.rating}
          </div>
          <div className="text-gray-500">{driver.customers} reviews</div>
        </div>
      </div>
      <div className="text-xs text-gray-500">
        ✅ Verified {driver.verifiedOn}
      </div>
      <div className="flex gap-2 mt-auto">
        <button
          type="button"
          data-ocid={`drivers.book_button.${index}`}
          onClick={() => navigate("book")}
          className="flex-1 text-xs font-semibold py-2 rounded-lg text-white transition-all hover:opacity-90"
          style={{
            background: driver.status === "offline" ? "#94a3b8" : "#1565C0",
          }}
          disabled={driver.status === "offline"}
        >
          Book Now
        </button>
        <a
          href="tel:+917836887228"
          data-ocid={`drivers.call_button.${index}`}
          className="flex-1 text-xs font-semibold py-2 rounded-lg text-red-700 border border-red-400 text-center hover:bg-red-50 transition-all"
        >
          Call Driver
        </a>
      </div>
    </div>
  );
}

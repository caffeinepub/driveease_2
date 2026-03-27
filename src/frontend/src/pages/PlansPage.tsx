import { useState } from "react";
import { type SubEnquiry, addSubEnquiry, uid } from "../utils/store";
import { pushItem } from "../utils/syncService";

const PLANS = [
  {
    id: "hourly",
    name: "Hourly (8 Hours)",
    price: "₹800",
    period: "day",
    monthly: "₹24,000/month",
    badge: "Most Popular",
    color: "#00e676",
    desc: "8 hours/day flexible scheduling between 7 AM – 9 PM. Same verified driver every day.",
    features: [
      "8 hrs/day coverage",
      "Flexible 7AM–9PM schedule",
      "Verified driver assigned",
      "Family tracking & SOS",
      "Senior care priority",
    ],
  },
  {
    id: "fullday",
    name: "Full Day (12 Hours)",
    price: "₹1,200",
    period: "day",
    monthly: "₹36,000/month",
    badge: "Best Value",
    color: "#0ea5e9",
    desc: "12 hours daily coverage for heavy usage. Ideal for professionals and busy families.",
    features: [
      "12 hrs/day coverage",
      "Multiple trips per day",
      "Assigned personal driver",
      "Monthly billing option",
      "Priority support",
    ],
  },
  {
    id: "family",
    name: "Family Monthly Plan",
    price: "₹28,000",
    period: "month",
    monthly: "",
    badge: "Premium Care",
    color: "#8b5cf6",
    desc: "Complete family coverage with dedicated driver, live tracking, SOS alerts, and medical priority.",
    features: [
      "Dedicated family driver",
      "Live location tracking",
      "SOS alert to family",
      "Medical appointment priority",
      "Etiquette-trained driver",
    ],
  },
  {
    id: "corporate",
    name: "Corporate Plan",
    price: "Custom",
    period: "",
    monthly: "",
    badge: "Enterprise",
    color: "#f59e0b",
    desc: "Custom pricing for corporates. Executive trained drivers, multiple vehicles, invoice billing.",
    features: [
      "Multiple drivers",
      "Executive trained",
      "Uniform & groomed",
      "Invoice/GST billing",
      "Dedicated account manager",
    ],
  },
];

export default function PlansPage(_: { navigate: (p: string) => void }) {
  const [modalPlan, setModalPlan] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [success, setSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const openModal = (planId: string) => {
    setModalPlan(planId);
    setSuccess(false);
    setForm({ name: "", phone: "" });
  };

  const submit = () => {
    if (!form.name || !form.phone) return;
    const plan = PLANS.find((p) => p.id === modalPlan);
    const e: SubEnquiry = {
      id: uid(),
      name: form.name,
      phone: form.phone,
      plan: plan?.name || modalPlan || "",
      createdAt: new Date().toISOString(),
    };
    addSubEnquiry(e);
    pushItem("sub_enquiries", e as unknown as { id: string });
    setSuccess(true);
    setSubmitted(true);
  };

  const activePlan = PLANS.find((p) => p.id === modalPlan);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1
          style={{
            color: "#e2e8f0",
            fontWeight: 800,
            fontSize: "2.25rem",
            marginBottom: "0.5rem",
          }}
        >
          Subscription Plans
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "1rem" }}>
          What you see is what you pay. No surprise charges, ever.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: "1.25rem",
          marginBottom: "4rem",
        }}
      >
        {PLANS.map((p) => (
          <div
            key={p.id}
            className="card-dark"
            style={{ position: "relative", transition: "all 0.2s" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.borderColor = p.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "#2d2d2d";
            }}
          >
            <span
              style={{
                position: "absolute",
                top: -12,
                left: "50%",
                transform: "translateX(-50%)",
                background: p.color,
                color: "white",
                borderRadius: 9999,
                padding: "0.2rem 0.75rem",
                fontSize: "0.75rem",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {p.badge}
            </span>
            <div
              style={{
                textAlign: "center",
                marginBottom: "1.25rem",
                paddingTop: "0.5rem",
              }}
            >
              <h3
                style={{
                  color: "#e2e8f0",
                  fontWeight: 800,
                  fontSize: "1.15rem",
                  marginBottom: "0.25rem",
                }}
              >
                {p.name}
              </h3>
              <div
                style={{ color: p.color, fontWeight: 900, fontSize: "2rem" }}
              >
                {p.price}
                {p.period && (
                  <span
                    style={{
                      color: "#64748b",
                      fontSize: "0.9rem",
                      fontWeight: 400,
                    }}
                  >
                    /{p.period}
                  </span>
                )}
              </div>
              {p.monthly && (
                <div
                  style={{
                    color: "#64748b",
                    fontSize: "0.78rem",
                    marginTop: "0.25rem",
                  }}
                >
                  {p.monthly}
                </div>
              )}
            </div>
            <p
              style={{
                color: "#94a3b8",
                fontSize: "0.88rem",
                marginBottom: "1rem",
                lineHeight: 1.6,
              }}
            >
              {p.desc}
            </p>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                marginBottom: "1.25rem",
              }}
            >
              {p.features.map((f) => (
                <li
                  key={f}
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.87rem",
                    padding: "0.2rem 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <span style={{ color: p.color }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => openModal(p.id)}
              style={{
                width: "100%",
                background: p.color,
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "0.65rem",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.9rem",
                boxShadow: `0 3px 0 ${p.color}88`,
                transition: "transform 0.1s, box-shadow 0.1s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "translateY(2px)";
                e.currentTarget.style.boxShadow = "none";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 3px 0 ${p.color}88`;
              }}
            >
              Get This Plan
            </button>
          </div>
        ))}
      </div>

      {/* Plan Modal */}
      {modalPlan && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#0d1420",
              border: "1px solid rgba(0,230,118,0.2)",
              borderRadius: 20,
              padding: "2rem",
              maxWidth: 420,
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
              }}
            >
              <div>
                <h3
                  style={{
                    color: "#e2e8f0",
                    fontWeight: 800,
                    fontSize: "1.2rem",
                  }}
                >
                  {activePlan?.name}
                </h3>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                  Submit enquiry to get started
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalPlan(null);
                  setSubmitted(false);
                }}
                style={{
                  color: "#64748b",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.5rem",
                }}
              >
                ×
              </button>
            </div>
            {success ? (
              <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                <h3
                  style={{
                    color: "#4ade80",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                  }}
                >
                  Enquiry Submitted!
                </h3>
                <p style={{ color: "#94a3b8", fontSize: "0.88rem" }}>
                  Plan enquiry submitted! We'll contact you within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setModalPlan(null);
                    setSubmitted(false);
                  }}
                  style={{
                    marginTop: "1.5rem",
                    background: "#00e676",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    padding: "0.65rem 1.5rem",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Done
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
                <div>
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: "0.85rem",
                      display: "block",
                      marginBottom: "0.35rem",
                    }}
                  >
                    Full Name *
                  </p>
                  <input
                    className="input-dark"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: "0.85rem",
                      display: "block",
                      marginBottom: "0.35rem",
                    }}
                  >
                    Phone Number *
                  </p>
                  <input
                    className="input-dark"
                    placeholder="10-digit mobile"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                      }))
                    }
                  />
                </div>
                <div
                  style={{
                    background: "rgba(220,20,60,0.08)",
                    border: "1px solid rgba(0,230,118,0.2)",
                    borderRadius: 8,
                    padding: "0.75rem",
                  }}
                >
                  <p
                    style={{
                      color: "#4ade80",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    Selected Plan: {activePlan?.name}
                  </p>
                  <p style={{ color: "#94a3b8", fontSize: "0.82rem" }}>
                    {activePlan?.price}
                    {activePlan?.period ? `/${activePlan.period}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={submit}
                  disabled={!form.name || !form.phone}
                  style={{
                    background:
                      !form.name || !form.phone
                        ? "#94a3b8"
                        : activePlan?.color || "#8B0000",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    padding: "0.75rem",
                    cursor:
                      !form.name || !form.phone ? "not-allowed" : "pointer",
                    fontWeight: 700,
                    fontSize: "1rem",
                  }}
                >
                  Submit Enquiry
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Existing enquiry form at bottom */}
      <div className="card-dark" style={{ maxWidth: 560, margin: "0 auto" }}>
        <h2
          style={{
            color: "#e2e8f0",
            fontWeight: 700,
            fontSize: "1.2rem",
            marginBottom: "0.5rem",
          }}
        >
          Have questions about plans?
        </h2>
        <p
          style={{
            color: "#94a3b8",
            fontSize: "0.88rem",
            marginBottom: "1rem",
          }}
        >
          Our team will call you within 24 hours
        </p>
        {!submitted ? (
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <a
              href="https://wa.me/917836887228?text=Hi%2C%20I%20want%20to%20know%20more%20about%20DriveEase%20plans"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "#25D366",
                color: "white",
                padding: "0.65rem 1.25rem",
                borderRadius: 8,
                fontWeight: 600,
                textDecoration: "none",
                fontSize: "0.9rem",
              }}
            >
              💬 WhatsApp Us
            </a>
          </div>
        ) : (
          <p style={{ color: "#4ade80", fontWeight: 600 }}>
            ✓ Enquiry submitted! We'll contact you soon.
          </p>
        )}
      </div>
    </div>
  );
}

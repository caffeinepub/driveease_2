import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import ChatBot from "./components/ChatBot";
import Footer from "./components/Footer";
import Header from "./components/Header";
import OTPModal from "./components/OTPModal";
import SplashScreen from "./components/SplashScreen";
import AdminPage from "./pages/AdminPage";
import BookPage from "./pages/BookPage";
import DriverLoginPage from "./pages/DriverLoginPage";
import DriverProfilePage from "./pages/DriverProfilePage";
import DriverRegisterPage from "./pages/DriverRegisterPage";
import DriversPage from "./pages/DriversPage";
import HomePage from "./pages/HomePage";
import InsurancePage from "./pages/InsurancePage";
import LiveDriversPage from "./pages/LiveDriversPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import PaymentPage from "./pages/PaymentPage";
import PlansPage from "./pages/PlansPage";
import StaffCRMPage from "./pages/StaffCRMPage";
import { initStore } from "./utils/store";

initStore();

function getPage() {
  const path = window.location.pathname.replace(/^\//, "") || "home";
  const search = window.location.search;
  return { path, search };
}

export default function App() {
  const [{ path, search }, setRoute] = useState(getPage);
  const [showLogin, setShowLogin] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const pageKeyRef = useRef(0);

  const handleSplashDone = useCallback(() => setSplashDone(true), []);

  useEffect(() => {
    const handler = () => {
      pageKeyRef.current += 1;
      setRoute(getPage());
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const navigate = (p: string) => {
    const url = p === "home" ? "/" : `/${p}`;
    window.history.pushState({}, "", url);
    pageKeyRef.current += 1;
    setRoute(getPage());
    window.scrollTo(0, 0);
  };

  const noShellPages = ["admin", "driver-login", "staff-crm"];
  const showShell = !noShellPages.includes(path);

  const params = new URLSearchParams(search);
  const driverId = params.get("driverId") || undefined;

  let content: ReactNode;
  const cleanPath = path.split("?")[0];

  if (cleanPath === "home" || cleanPath === "") {
    content = <HomePage navigate={navigate} />;
  } else if (cleanPath === "drivers") {
    content = <DriversPage navigate={navigate} />;
  } else if (cleanPath.startsWith("driver/")) {
    const id = cleanPath.replace("driver/", "");
    content = <DriverProfilePage navigate={navigate} driverId={id} />;
  } else if (cleanPath === "book") {
    content = <BookPage navigate={navigate} driverId={driverId} />;
  } else if (cleanPath === "my-bookings") {
    content = <MyBookingsPage navigate={navigate} />;
  } else if (cleanPath === "register-driver") {
    content = <DriverRegisterPage />;
  } else if (cleanPath === "driver-login") {
    content = <DriverLoginPage />;
  } else if (cleanPath === "plans") {
    content = <PlansPage navigate={navigate} />;
  } else if (cleanPath === "insurance") {
    content = <InsurancePage navigate={navigate} />;
  } else if (cleanPath === "payment") {
    content = <PaymentPage />;
  } else if (cleanPath === "live") {
    content = <LiveDriversPage navigate={navigate} />;
  } else if (cleanPath === "staff-crm") {
    content = <StaffCRMPage />;
  } else if (cleanPath === "admin") {
    content = <AdminPage />;
  } else if (cleanPath === "login") {
    content = (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <OTPModal
          onClose={() => navigate("home")}
          onSuccess={() => navigate("home")}
        />
      </div>
    );
  } else {
    content = (
      <div style={{ textAlign: "center", padding: "6rem 1rem" }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔍</div>
        <h2
          style={{
            color: "#1e293b",
            fontSize: "1.5rem",
            marginBottom: "0.5rem",
          }}
        >
          Page Not Found
        </h2>
        <button
          type="button"
          onClick={() => navigate("home")}
          className="green-btn"
          style={{ marginTop: "1rem" }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <>
      {!splashDone && <SplashScreen onDone={handleSplashDone} />}
      {showShell ? (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            background: "#f8fafc",
            opacity: splashDone ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          <Header currentPage={cleanPath || "home"} navigate={navigate} />
          <main
            key={pageKeyRef.current}
            className="page-enter"
            style={{ flex: 1 }}
          >
            {content}
          </main>
          <Footer navigate={navigate} />
          {showLogin && (
            <OTPModal
              onClose={() => setShowLogin(false)}
              onSuccess={() => {
                setShowLogin(false);
                window.location.reload();
              }}
            />
          )}
          {/* AI ChatBot */}
          <ChatBot />
        </div>
      ) : (
        <div
          style={{
            opacity: splashDone ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          {content}
        </div>
      )}
    </>
  );
}

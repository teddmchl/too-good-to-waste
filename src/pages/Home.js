import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import PublicNavbar from "../components/PublicNavbar";
import CustomerNavbar from "../components/CustomerNavbar";
import VendorNavbar from "../components/VendorNavbar";

const Home = () => {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        // Fetch role and name from Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserRole(userData.role);

          // Get user name based on role
          if (userData.role === "vendor") {
            setUserName(
              userData.username || userData.restaurantName || "Vendor"
            );
          } else {
            // For customers, use username or email prefix
            setUserName(
              userData.username || user.email?.split("@")[0] || "Customer"
            );
          }
        } else {
          setUserRole("customer");
          setUserName(user.email?.split("@")[0] || "Customer");
        }
        setCheckingAuth(false);
      } else {
        setUser(null);
        setUserRole(null);
        setUserName("");
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Auto-navigate for logged-in users
  useEffect(() => {
    if (user && userRole) {
      if (userRole === "vendor") {
        navigate("/dashboard");
      } else {
        navigate("/explore");
      }
    }
  }, [user, userRole, navigate]);

  if (checkingAuth) return null;

  // If user is logged in, show welcome message before redirecting
  if (user && userRole) {
    return (
      <>
        {userRole === "vendor" ? <VendorNavbar /> : <CustomerNavbar />}
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(120deg, #f1f5f9 60%, #2c7a7b 100%)",
            padding: "2rem",
          }}
        >
          <img
            src="/logo.png"
            alt="Too Good To Waste"
            style={{ width: 90, marginBottom: 24 }}
          />
          <h1
            style={{ fontSize: "2.5rem", color: "#2c7a7b", marginBottom: 12 }}
          >
            Karibu, @{userName}
          </h1>
          <p
            style={{
              color: "#4a5568",
              fontSize: "1.2rem",
              maxWidth: 480,
              marginBottom: 32,
              textAlign: "center",
            }}
          >
            Welcome back to Too Good To Waste! Redirecting you to your
            dashboard...
          </p>
          <div style={{ color: "#4a5568", fontSize: "1rem" }}>
            Redirecting...
          </div>
        </div>
      </>
    );
  }

  // Public landing page for non-logged-in users
  return (
    <>
      <PublicNavbar />
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(120deg, #f1f5f9 60%, #2c7a7b 100%)",
          padding: "2rem",
        }}
      >
        <img
          src="/logo.png"
          alt="Too Good To Waste"
          style={{ width: 90, marginBottom: 24 }}
        />
        <h1 style={{ fontSize: "2.5rem", color: "#2c7a7b", marginBottom: 12 }}>
          Too Good To Waste
        </h1>
        <p
          style={{
            color: "#4a5568",
            fontSize: "1.2rem",
            maxWidth: 480,
            marginBottom: 32,
          }}
        >
          Join us in fighting food waste and hunger in Nairobi. Discover surplus
          meals, reserve what you need, and make a difference—one plate at a
          time.
        </p>
        <button
          style={{
            background: "#2c7a7b",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "0.9rem 2.2rem",
            fontSize: "1.1rem",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 18,
            transition: "background 0.2s",
          }}
          onClick={() => navigate("/register")}
        >
          Get Started
        </button>
        <div style={{ color: "#4a5568", fontSize: "1rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#2c7a7b", fontWeight: 600 }}>
            Login
          </Link>
        </div>
      </div>
    </>
  );
};

export default Home;

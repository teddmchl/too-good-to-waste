import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./VendorNavbar.css";

const VendorNavbar = () => {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  const [restaurantName, setRestaurantName] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchRestaurantName = async () => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setRestaurantName(userData.restaurantName || "Restaurant");
            setUsername(userData.username || "");
          }
        } catch (error) {
          console.error("Error fetching restaurant name:", error);
          setRestaurantName("Restaurant");
          setUsername("");
        }
      }
    };

    if (!loading) {
      fetchRestaurantName();
    }
  }, [user, loading]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav className="vendor-navbar">
      <div className="nav-brand">
        <img src="/logo.png" alt="logo" className="nav-logo" />
        <span>Too Good To Waste</span>
      </div>
      <div className="nav-welcome">
        <span>Karibu @{username || restaurantName}</span>
      </div>
      <div className="nav-links">
        <NavLink to="/dashboard" className="nav-link">
          Dashboard
        </NavLink>
        <NavLink to="/profile" className="nav-link">
          My Profile
        </NavLink>
        <NavLink to="/orders" className="nav-link">
          Orders
        </NavLink>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default VendorNavbar;

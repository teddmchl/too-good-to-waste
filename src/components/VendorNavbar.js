import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "./VendorNavbar.css";

const VendorNavbar = () => {
  const navigate = useNavigate();

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
      <div className="nav-links">
        <NavLink to="/dashboard" className="nav-link">
          Dashboard
        </NavLink>
        <NavLink to="/add" className="nav-link">
          Add Meal
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

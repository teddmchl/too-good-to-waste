import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "./CustomerNavbar.css";

const CustomerNavbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleNavClick = () => setMenuOpen(false);

  return (
    <nav className="customer-navbar">
      <div
        className="nav-brand"
        onClick={() => {
          navigate("/explore");
          setMenuOpen(false);
        }}
      >
        <img src="/logo.png" alt="logo" className="nav-logo" />
        <span>Too Good To Waste</span>
      </div>
      <div className={`nav-links${menuOpen ? " open" : ""}`}>
        <NavLink
          to="/explore"
          className="nav-link"
          onClick={handleNavClick}
          end
        >
          Explore
        </NavLink>
        <NavLink to="/my-orders" className="nav-link" onClick={handleNavClick}>
          My Reserved Meals
        </NavLink>
        <NavLink to="/profile" className="nav-link" onClick={handleNavClick}>
          Profile
        </NavLink>
        <button
          className="logout-btn"
          onClick={() => {
            handleLogout();
            setMenuOpen(false);
          }}
        >
          Logout
        </button>
      </div>
      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  );
};

export default CustomerNavbar;

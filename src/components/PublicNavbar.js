import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./PublicNavbar.css";

const PublicNavbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="public-navbar">
      <div
        className="nav-brand"
        onClick={() => {
          navigate("/");
          setMenuOpen(false);
        }}
      >
        <img src="/logo.png" alt="logo" className="nav-logo" />
        <span>Too Good To Waste</span>
      </div>
      <div className={`nav-links${menuOpen ? " open" : ""}`}>
        <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
          Home
        </Link>
        {/* <Link to="/explore" className="nav-link" onClick={() => setMenuOpen(false)}>Explore</Link> */}
        <Link
          to="/register"
          className="nav-link"
          onClick={() => setMenuOpen(false)}
        >
          Register
        </Link>
        <Link
          to="/login"
          className="nav-link"
          onClick={() => setMenuOpen(false)}
        >
          Login
        </Link>
      </div>
      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  );
};

export default PublicNavbar;

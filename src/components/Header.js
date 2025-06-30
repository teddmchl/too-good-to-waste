import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="main-header">
      <div className="header-left">
        <img src="/logo.png" alt="Too Good To Waste logo" className="logo" />
        <span className="brand-text">Too Good To Waste</span>
      </div>
      <nav className="header-right">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/orders">Orders</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/login">Logout</Link>
      </nav>
    </header>
  );
}

export default Header;

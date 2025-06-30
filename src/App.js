import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./pages/VendorDashboard";
import Explore from "./CustomerDashboard";
import "./styles.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Orders from "./pages/Orders";

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <header className="app-header">
          <img src="/logo192.png" alt="Logo" className="logo" />
          <h1>Too Good To Waste KE</h1>
        </header>

        <main>
          <ToastContainer position="top-center" />
          <Routes>
            <Route path="/orders" element={<Orders />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

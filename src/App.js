import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import Dashboard from "./Dashboard";
import "./styles.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <header className="app-header">
          <img src="/logo192.png" alt="Logo" className="logo" />
          <h1>Too Good To Waste KE</h1>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>

        <ToastContainer position="bottom-center" />
      </div>
    </Router>
  );
}

export default App;

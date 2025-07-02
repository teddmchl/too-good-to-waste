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
import Explore from "./pages/Explore";
import "./styles.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Orders from "./pages/Orders";
import ProtectedRoute from "./ProtectedRoute";
import ProtectedVendorRoute from "./ProtectedVendorRoute";
import AddMeal from "./pages/AddMeal";
import MealDetails from "./pages/MealDetails";
import MyOrders from "./pages/MyOrders";

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
            <Route
              path="/orders"
              element={
                <ProtectedVendorRoute>
                  <Orders />
                </ProtectedVendorRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedVendorRoute>
                  <Dashboard />
                </ProtectedVendorRoute>
              }
            />
            <Route
              path="/explore"
              element={
                <ProtectedRoute>
                  <Explore />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add"
              element={
                <ProtectedVendorRoute>
                  <AddMeal />
                </ProtectedVendorRoute>
              }
            />
            <Route
              path="/meal/:id"
              element={
                <ProtectedRoute>
                  <MealDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

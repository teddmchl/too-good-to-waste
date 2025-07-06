import React, { useState, useEffect, useCallback } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import VendorNavbar from "../components/VendorNavbar";
import { updateOrderStatus } from "../database/dbUtils";
import { cleanupExpiredOrders } from "../database/dbUtils";
import { toast } from "react-toastify";
import "./Orders.css";

const Orders = () => {
  const [user, loading] = useAuthState(auth);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, reserved, picked_up, cancelled
  const [updatingOrders, setUpdatingOrders] = useState(new Set());
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    pendingOrders: 0,
  });

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setOrdersLoading(false);
      return;
    }

    try {
      setOrdersLoading(true);
      // Clean up expired orders before fetching
      await cleanupExpiredOrders();
      console.log("Fetching orders for vendor:", user.uid);

      // Simplified query without orderBy to avoid index issues
      const ordersQuery = query(
        collection(db, "orders"),
        where("vendorId", "==", user.uid)
      );
      const snapshot = await getDocs(ordersQuery);
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort in JavaScript instead of Firestore
      ordersData.sort((a, b) => {
        const dateA = a.createdAt?.toDate
          ? a.createdAt.toDate()
          : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate
          ? b.createdAt.toDate()
          : new Date(b.createdAt || 0);
        return dateB - dateA; // Most recent first
      });

      console.log("Fetched orders:", ordersData);
      setOrders(ordersData);

      // Calculate statistics
      const stats = {
        totalOrders: ordersData.length,
        totalRevenue: ordersData
          .filter((order) => order.status === "picked_up")
          .reduce((sum, order) => sum + (order.totalPrice || 0), 0),
        completedOrders: ordersData.filter(
          (order) => order.status === "picked_up"
        ).length,
        cancelledOrders: ordersData.filter(
          (order) => order.status === "cancelled"
        ).length,
        pendingOrders: ordersData.filter((order) => order.status === "reserved")
          .length,
      };
      console.log("Calculated stats:", stats);
      setStats(stats);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error loading orders: " + error.message);
      // Set empty arrays to prevent errors
      setOrders([]);
      setStats({
        totalOrders: 0,
        totalRevenue: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        pendingOrders: 0,
      });
    } finally {
      setOrdersLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading) {
      fetchOrders();
    }
  }, [loading, fetchOrders]);

  const getStatusText = (status) => {
    switch (status) {
      case "reserved":
        return "Reserved";
      case "picked_up":
        return "Picked Up";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const handleMarkAsPickedUp = async (orderId) => {
    try {
      // Show confirmation dialog
      const confirmed = window.confirm(
        "Mark this order as picked up? This will add the order value to your revenue."
      );

      if (!confirmed) {
        return;
      }

      // Add order to updating set
      setUpdatingOrders((prev) => new Set(prev).add(orderId));

      // Show loading toast
      const loadingToast = toast.loading("Updating order status...");

      // Update the order status
      await updateOrderStatus(orderId, "picked_up");

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success("Order marked as picked up! Revenue updated.");

      // Remove order from updating set
      setUpdatingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });

      // Refresh the orders list to update stats
      await fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error(
        error.message || "Failed to update order status. Please try again."
      );

      // Remove order from updating set on error
      setUpdatingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  // Remove all expired orders for this vendor
  const handleRemoveExpiredOrders = async () => {
    if (!user) return;
    try {
      const confirmed = window.confirm(
        "Are you sure you want to remove all expired orders? This cannot be undone."
      );
      if (!confirmed) return;
      const expiredOrdersQuery = query(
        collection(db, "orders"),
        where("vendorId", "==", user.uid),
        where("status", "==", "expired")
      );
      const snapshot = await getDocs(expiredOrdersQuery);
      let count = 0;
      for (const docSnap of snapshot.docs) {
        await deleteDoc(docSnap.ref);
        count++;
      }
      toast.success(`Removed ${count} expired order(s).`);
      await fetchOrders();
    } catch (error) {
      console.error("Error removing expired orders:", error);
      toast.error("Failed to remove expired orders.");
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  console.log("Filtered orders:", filteredOrders);
  console.log("Current filter:", filter);
  console.log("Total orders:", orders.length);

  if (loading || ordersLoading) {
    return (
      <>
        <VendorNavbar />
        <div className="orders-container">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            Loading orders...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <VendorNavbar />
      <div className="orders-container">
        <div className="orders-header">
          <h1 style={{ fontSize: "2.3rem" }}>📊 Orders & Analytics</h1>
          <p style={{ fontSize: "1.2rem" }}>
            View comprehensive reports and manage your orders
          </p>

          {/* Button row */}
          <div style={{ display: "flex", gap: "1.5rem", marginTop: "1.5rem" }}>
            <button
              onClick={fetchOrders}
              style={{
                background: "#319795",
                color: "white",
                border: "none",
                padding: "0.8rem 1.5rem",
                borderRadius: "6px",
                fontSize: "1.15rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleRemoveExpiredOrders}
              style={{
                background: "#e53e3e",
                color: "white",
                border: "none",
                padding: "0.8rem 1.5rem",
                borderRadius: "6px",
                fontSize: "1.15rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              🗑️ Remove Expired Orders
            </button>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="stats-grid" style={{ gap: "2rem", marginTop: "2rem" }}>
          <div
            className="stat-card"
            style={{ fontSize: "1.15rem", padding: "1.5rem 1rem" }}
          >
            <div className="stat-icon" style={{ fontSize: "2.2rem" }}>
              📦
            </div>
            <div className="stat-info">
              <h3 style={{ fontSize: "2rem", margin: 0 }}>
                {stats.totalOrders}
              </h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div
            className="stat-card"
            style={{ fontSize: "1.15rem", padding: "1.5rem 1rem" }}
          >
            <div className="stat-icon" style={{ fontSize: "2.2rem" }}>
              💰
            </div>
            <div className="stat-info">
              <h3 style={{ fontSize: "2rem", margin: 0 }}>
                KES {stats.totalRevenue}
              </h3>
              <p>Total Revenue</p>
            </div>
          </div>
          <div
            className="stat-card"
            style={{ fontSize: "1.15rem", padding: "1.5rem 1rem" }}
          >
            <div className="stat-icon" style={{ fontSize: "2.2rem" }}>
              ✅
            </div>
            <div className="stat-info">
              <h3 style={{ fontSize: "2rem", margin: 0 }}>
                {stats.completedOrders}
              </h3>
              <p>Completed</p>
            </div>
          </div>
          <div
            className="stat-card"
            style={{ fontSize: "1.15rem", padding: "1.5rem 1rem" }}
          >
            <div className="stat-icon" style={{ fontSize: "2.2rem" }}>
              ⏳
            </div>
            <div className="stat-info">
              <h3 style={{ fontSize: "2rem", margin: 0 }}>
                {stats.pendingOrders}
              </h3>
              <p>Pending</p>
            </div>
          </div>
          <div
            className="stat-card"
            style={{ fontSize: "1.15rem", padding: "1.5rem 1rem" }}
          >
            <div className="stat-icon" style={{ fontSize: "2.2rem" }}>
              ❌
            </div>
            <div className="stat-info">
              <h3 style={{ fontSize: "2rem", margin: 0 }}>
                {stats.cancelledOrders}
              </h3>
              <p>Cancelled</p>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Orders
          </button>
          <button
            className={`filter-btn ${filter === "reserved" ? "active" : ""}`}
            onClick={() => setFilter("reserved")}
          >
            Reserved
          </button>
          <button
            className={`filter-btn ${filter === "picked_up" ? "active" : ""}`}
            onClick={() => setFilter("picked_up")}
          >
            Picked Up
          </button>
          <button
            className={`filter-btn ${filter === "cancelled" ? "active" : ""}`}
            onClick={() => setFilter("cancelled")}
          >
            Cancelled
          </button>
        </div>

        {/* Recent Orders */}
        <div className="recent-orders">
          <h2 style={{ fontSize: "1.6rem", marginBottom: "1.2rem" }}>
            Recent Orders
          </h2>
          {filteredOrders.length === 0 ? (
            <p className="no-orders">
              No orders yet. Start posting meals to see orders here!
            </p>
          ) : (
            <div className="orders-list" style={{ gap: "1.5rem" }}>
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="order-item"
                  style={{ fontSize: "1.13rem", padding: "1.3rem 1rem" }}
                >
                  <div className="order-info">
                    <h4>{order.mealTitle || "Meal"}</h4>
                    <p>Customer: @{order.username || order.customerEmail}</p>
                    <p>Amount: KES {order.totalPrice}</p>
                    <p>Quantity: {order.quantity}</p>
                    <p>
                      Date:{" "}
                      {order.createdAt?.toDate
                        ? order.createdAt.toDate().toLocaleString()
                        : "Unknown"}
                    </p>
                  </div>
                  <div className="order-actions">
                    <div className="order-status">
                      <span className={`status-${order.status}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    {order.status === "reserved" && (
                      <button
                        className="pickup-btn"
                        onClick={() => handleMarkAsPickedUp(order.id)}
                        disabled={updatingOrders.has(order.id)}
                        style={
                          updatingOrders.has(order.id)
                            ? { opacity: 0.6, pointerEvents: "none" }
                            : {}
                        }
                      >
                        {updatingOrders.has(order.id) ? (
                          <span>
                            <span
                              className="spinner"
                              style={{ marginRight: 6 }}
                            ></span>
                            Updating...
                          </span>
                        ) : (
                          "Mark as Picked Up"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Orders;

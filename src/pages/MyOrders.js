import React, { useState, useEffect, useCallback } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import {
  getOrdersByCustomer,
  cancelOrder,
  cleanupExpiredOrders,
} from "../database/dbUtils";
import CustomerNavbar from "../components/CustomerNavbar";
import "./MyOrders.css";
import { toast } from "react-toastify";

const MyOrders = () => {
  const [user, loading] = useAuthState(auth);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, reserved, picked_up, cancelled, expired
  const [cancellingOrders, setCancellingOrders] = useState(new Set());

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setOrdersLoading(false);
      return;
    }

    try {
      setOrdersLoading(true);
      // Clean up expired orders before fetching
      await cleanupExpiredOrders();
      console.log("Fetching orders for customer:", user.uid);
      const userOrders = await getOrdersByCustomer(user.uid);
      console.log("Fetched orders:", userOrders);
      setOrders(userOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error loading your orders");
    } finally {
      setOrdersLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading) {
      fetchOrders();
    }
  }, [loading, fetchOrders]);

  // Refresh orders when component comes into focus (e.g., after navigation)
  useEffect(() => {
    const handleFocus = () => {
      if (user && !loading) {
        console.log("Window focused, refreshing orders...");
        fetchOrders();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user, loading, fetchOrders]);

  // Refresh orders when component mounts (for immediate refresh after navigation)
  useEffect(() => {
    if (user && !loading) {
      console.log("Component mounted, fetching orders...");
      fetchOrders();
    }
  }, [user, loading, fetchOrders]);

  const handleCancelOrder = async (orderId) => {
    try {
      // Show confirmation dialog
      const confirmed = window.confirm(
        "Are you sure you want to cancel this order? This action cannot be undone."
      );

      if (!confirmed) {
        return;
      }

      // Add order to cancelling set
      setCancellingOrders((prev) => new Set(prev).add(orderId));

      // Show loading toast
      const loadingToast = toast.loading("Cancelling your order...");

      // Call the cancel order function
      await cancelOrder(orderId);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success("Order cancelled successfully!");

      // Remove order from cancelling set
      setCancellingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });

      // Refresh the orders list
      await fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(error.message || "Failed to cancel order. Please try again.");

      // Remove order from cancelling set on error
      setCancellingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "reserved":
        return "status-reserved";
      case "picked_up":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      case "expired":
        return "status-expired";
      default:
        return "status-pending";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "reserved":
        return "Reserved";
      case "picked_up":
        return "Picked Up";
      case "cancelled":
        return "Cancelled";
      case "expired":
        return "Expired";
      default:
        return status;
    }
  };

  const getPaymentStatusText = (paymentStatus) => {
    switch (paymentStatus) {
      case "pending":
        return "Pending";
      case "completed":
        return "Paid";
      case "failed":
        return "Failed";
      case "refunded":
        return "Refunded";
      default:
        return paymentStatus;
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return order.status !== "expired";
    return order.status === filter && order.status !== "expired";
  });

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      reserved: orders.filter((o) => o.status === "reserved").length,
      picked_up: orders.filter((o) => o.status === "picked_up").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      expired: orders.filter((o) => o.status === "expired").length,
    };
    return stats;
  };

  const stats = getOrderStats();

  const renderMealImage = (order) => {
    // Only show emoji dietary icons, no real images
    if (order.dietaryType) {
      const getDietaryIcon = (dietaryType) => {
        switch (dietaryType) {
          case "omnivorous":
            return "🥩";
          case "vegetarian":
            return "🌱";
          case "any":
            return "🍽️";
          default:
            return "🍽️";
        }
      };

      return (
        <div className="order-meal-image-emoji">
          <span className="dietary-icon-large">
            {getDietaryIcon(order.dietaryType)}
          </span>
        </div>
      );
    }
    // If no dietary type, don't render anything
    return null;
  };

  if (loading || ordersLoading) {
    return (
      <>
        <CustomerNavbar />
        <div className="my-orders-container">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            Loading your orders...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CustomerNavbar />
      <div className="my-orders-container">
        <h1>🍽️ My Order History</h1>
        <p className="page-subtitle">View and manage your meal reservations</p>

        {/* Manual refresh button */}
        <button
          onClick={fetchOrders}
          style={{
            background: "#2c7a7b",
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            marginBottom: "1rem",
            cursor: "pointer",
          }}
        >
          🔄 Refresh Orders
        </button>

        {/* Order Statistics */}
        <div className="order-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Orders</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.reserved}</span>
            <span className="stat-label">Reserved</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.picked_up}</span>
            <span className="stat-label">Picked Up</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.cancelled}</span>
            <span className="stat-label">Cancelled</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.expired}</span>
            <span className="stat-label">Expired</span>
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
          <button
            className={`filter-btn ${filter === "expired" ? "active" : ""}`}
            onClick={() => setFilter("expired")}
          >
            Expired
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found for the selected filter.</p>
            {filter === "all" && <p>Explore available meals to get started!</p>}
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map((order) => {
              const canCancel = order.status === "reserved";

              return (
                <div className="order-card" key={order.id}>
                  {renderMealImage(order)}
                  <div className="order-info">
                    <h4>{order.mealTitle || "Meal"}</h4>
                    <p className="vendor">
                      Vendor: {order.vendorName || "Unknown"}
                    </p>
                    <p className={`status ${getStatusColor(order.status)}`}>
                      Status: {getStatusText(order.status)}
                    </p>
                    <p className="payment-status">
                      Payment: {getPaymentStatusText(order.paymentStatus)}
                    </p>
                    {order.totalPrice && (
                      <p className="price">Price: KES {order.totalPrice}</p>
                    )}
                    {order.mpesaTransactionId && (
                      <p className="transaction-id">
                        Transaction: {order.mpesaTransactionId}
                      </p>
                    )}
                    <p className="timestamp">
                      Reserved:{" "}
                      {order.reservedAt?.toDate
                        ? order.reservedAt.toDate().toLocaleString()
                        : order.timestamp?.toDate
                        ? order.timestamp.toDate().toLocaleString()
                        : "Unknown"}
                    </p>
                    {order.pickedUpAt && (
                      <p className="timestamp">
                        Picked Up: {order.pickedUpAt.toDate().toLocaleString()}
                      </p>
                    )}
                    {canCancel && (
                      <button
                        className="cancel-btn"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingOrders.has(order.id)}
                        style={
                          cancellingOrders.has(order.id)
                            ? { opacity: 0.6, pointerEvents: "none" }
                            : {}
                        }
                      >
                        {cancellingOrders.has(order.id) ? (
                          <span>
                            <span
                              className="spinner"
                              style={{ marginRight: 6 }}
                            ></span>
                            Cancelling...
                          </span>
                        ) : (
                          "Cancel Order"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default MyOrders;

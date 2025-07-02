import React from "react";
import VendorNavbar from "../components/VendorNavbar";

const Orders = () => {
  // Fetch and display orders for this vendor
  return (
    <>
      <VendorNavbar />
      <div style={{ padding: "2rem" }}>
        <h2>📦 Orders</h2>
        <p>Coming soon: List of customer pickups/reservations.</p>
      </div>
    </>
  );
};

export default Orders;

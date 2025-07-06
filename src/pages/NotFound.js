import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>😕</div>
      <h1 style={{ fontSize: "2.5rem", color: "#2c7a7b" }}>
        404 - Page Not Found
      </h1>
      <p style={{ color: "#4a5568", margin: "1rem 0 2rem" }}>
        Sorry, the page you are looking for does not exist.
        <br />
        You can go back to the homepage or explore meals.
      </p>
      <button
        style={{
          background: "#2c7a7b",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "0.8rem 2rem",
          fontSize: "1.1rem",
          fontWeight: 600,
          cursor: "pointer",
          transition: "background 0.2s",
        }}
        onClick={() => navigate("/explore")}
      >
        Go to Explore
      </button>
    </div>
  );
};

export default NotFound;

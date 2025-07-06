// src/pages/VendorDashboard.js

import React, { useState, useEffect } from "react";
import VendorNavbar from "../components/VendorNavbar";
import "./VendorDashboard.css";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  const [meals, setMeals] = useState([]);
  const [stats, setStats] = useState({
    mealsPosted: 0,
    mealsReserved: 0,
  });
  const [restaurantName, setRestaurantName] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchVendorData = async () => {
      if (!user) return;

      try {
        // Fetch vendor's meals
        const mealsQuery = query(
          collection(db, "meals"),
          where("vendorId", "==", user.uid)
        );
        const mealsSnapshot = await getDocs(mealsQuery);
        const mealsData = mealsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMeals(mealsData);

        // Calculate stats
        const activeMeals = mealsData.filter(
          (meal) => meal.status === "available"
        );
        const reservedMeals = mealsData.filter(
          (meal) => meal.status === "reserved"
        );

        setStats({
          mealsPosted: activeMeals.length,
          mealsReserved: reservedMeals.length,
        });

        // Get restaurant name and username from user profile
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setRestaurantName(userData.restaurantName || "Restaurant");
          setUsername(userData.username || "");
        }
      } catch (error) {
        console.error("Error fetching vendor data:", error);
      }
    };

    if (!loading) {
      fetchVendorData();
    }
  }, [user, loading]);

  function timeLeft(expiryDate) {
    if (!expiryDate) return "?";
    const now = new Date();
    const expiry = expiryDate.toDate
      ? expiryDate.toDate()
      : new Date(expiryDate);
    const diff = expiry - now;
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
  }

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

  if (loading) {
    return (
      <>
        <VendorNavbar />
        <div className="dashboard-container">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            Loading dashboard...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <VendorNavbar />
      <main className="dashboard-container">
        <div className="greeting">
          <h1 style={{ fontSize: "2.5rem" }}>
            Karibu, @{username || restaurantName}
          </h1>
          <p>Here's how you're making an impact today 🌍</p>
          <p
            style={{
              fontSize: "1.2rem",
              marginTop: "1rem",
              color: "#2c7a7b",
              fontWeight: 500,
            }}
          >
            Reducing waste one dish at a time.
          </p>
        </div>

        <div className="stats-grid large-stats">
          <div className="stat-box">
            <span className="icon" style={{ fontSize: "3rem" }}>
              🍛
            </span>
            <div>
              <h3 style={{ fontSize: "2.5rem" }}>{stats.mealsPosted}</h3>
              <p style={{ fontSize: "1.2rem" }}>Active Listings</p>
            </div>
          </div>
          <div className="stat-box">
            <span className="icon" style={{ fontSize: "3rem" }}>
              ♻️
            </span>
            <div>
              <h3 style={{ fontSize: "2.5rem" }}>{stats.mealsReserved}</h3>
              <p style={{ fontSize: "1.2rem" }}>Reserved Meals</p>
            </div>
          </div>
        </div>

        {meals.length === 0 ? (
          <div className="empty-listings">
            <div className="empty-icon">🍽️</div>
            <h3>No meals posted yet</h3>
            <p>
              Start by adding your first surplus meal to help reduce food waste!
            </p>
            <button
              className="add-first-meal-btn"
              onClick={() => navigate("/add")}
            >
              + Add Your First Meal
            </button>
          </div>
        ) : (
          <div className="meals-grid">
            {meals
              .filter((meal) => meal.dietaryType) // Only show meals with dietary types
              .map((meal) => (
                <div className="meal-card" key={meal.id}>
                  <div className="meal-image">
                    <span className="dietary-icon">
                      {getDietaryIcon(meal.dietaryType)}
                    </span>
                  </div>
                  <div className="meal-info">
                    <h4>{meal.title}</h4>
                    <p className="qty">
                      {meal.status === "sold_out" ? (
                        <span className="sold-out">Sold Out</span>
                      ) : (
                        `${meal.quantity || 0} available`
                      )}
                    </p>
                    <p className="price">KES {meal.discountedPrice}</p>
                    <p className="expires">
                      ⏰ Expires in {timeLeft(meal.expiresAt)} hrs
                    </p>
                    <p className="status">
                      Status:{" "}
                      <span className={`status-${meal.status}`}>
                        {meal.status === "sold_out" ? "Sold Out" : meal.status}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}

        <button className="floating-button" onClick={() => navigate("/add")}>
          + New Post
        </button>
      </main>
    </>
  );
};

export default VendorDashboard;

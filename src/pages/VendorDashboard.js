// src/pages/VendorDashboard.js

import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import VendorNavbar from "../components/VendorNavbar";
import "./VendorDashboard.css";
import { toast } from "react-toastify";

const VendorDashboard = () => {
  const vendorName = "Scott Foods"; // Optionally fetch from Firebase Auth
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const stats = [
    { icon: "🍛", label: "Meals Posted", value: meals.length },
    { icon: "♻️", label: "Meals Saved", value: meals.length * 0.8 },
    { icon: "💰", label: "Revenue (KES)", value: meals.length * 150 },
  ];

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const q = query(collection(db, "meals"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMeals(items);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching meals:", err);
      }
    };

    fetchMeals();
  }, []);

  return (
    <>
      <VendorNavbar />
      <main className="dashboard-container">
        <div className="greeting">
          <h1>Karibu, {vendorName}</h1>
          <p>Here's how you're making an impact today 🌍</p>
        </div>

        <div className="stats-grid">
          {stats.map((stat, idx) => (
            <div className="stat-box" key={idx}>
              <span className="icon">{stat.icon}</span>
              <div>
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="section-title">📦 My Listings</h2>

        {loading ? (
          <p className="loading">Loading meals...</p>
        ) : meals.length === 0 ? (
          <p className="no-listings">You haven't posted any meals yet.</p>
        ) : (
          <div className="meals-grid">
            {meals.map((meal) => (
              <div className="meal-card" key={meal.id}>
                <img src={meal.imageUrl} alt={meal.title} />
                <div className="meal-info">
                  <h4>{meal.title}</h4>
                  <p className="qty">{meal.quantity}</p>
                  <p className="expires">
                    ⏰ Expires in {timeLeft(meal.expiresAt?.seconds)} hrs
                  </p>
                </div>
                <button
                  onClick={async () => {
                    if (window.confirm("Delete this meal?")) {
                      await deleteDoc(doc(db, "meals", meal.id));
                      setMeals(meals.filter((m) => m.id !== meal.id));
                      toast.success("Meal deleted.");
                    }
                  }}
                  className="delete-btn"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          className="floating-button"
          onClick={() => (window.location.href = "/add")}
        >
          + New Post
        </button>
      </main>
    </>
  );
};

// ⏳ Helper: calculate hours left from timestamp
function timeLeft(expirySeconds) {
  if (!expirySeconds) return "?";
  const now = Date.now();
  const expiry = expirySeconds * 1000;
  const diff = expiry - now;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
}

export default VendorDashboard;

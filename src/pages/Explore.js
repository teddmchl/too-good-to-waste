import React, { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./Explore.css";

const Explore = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const q = query(
          collection(db, "meals"),
          where("claimed", "in", [false, null]), // Only unclaimed meals
          orderBy("expiresAt", "asc")
        );
        const snapshot = await getDocs(q);
        setMeals(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        // fallback: show all if claimed field missing
        const q = query(collection(db, "meals"), orderBy("expiresAt", "asc"));
        const snapshot = await getDocs(q);
        setMeals(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } finally {
        setLoading(false);
      }
    };
    fetchMeals();
  }, []);

  return (
    <div className="explore-container">
      <h1>🍲 Explore Surplus Meals</h1>
      {loading ? (
        <p>Loading meals...</p>
      ) : meals.length === 0 ? (
        <p>No meals available right now. Check back soon!</p>
      ) : (
        <div className="meals-grid">
          {meals.map((meal) => (
            <div
              className="meal-card"
              key={meal.id}
              onClick={() => navigate(`/meal/${meal.id}`)}
            >
              <img src={meal.imageUrl} alt={meal.title} />
              <div className="meal-info">
                <h4>{meal.title}</h4>
                <p className="qty">{meal.quantity}</p>
                <p className="expires">
                  ⏰ Expires in {timeLeft(meal.expiresAt?.seconds)} hrs
                </p>
                <p className="vendor">{meal.vendorName || "Vendor"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function timeLeft(expirySeconds) {
  if (!expirySeconds) return "?";
  const now = Date.now();
  const expiry = expirySeconds * 1000;
  const diff = expiry - now;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
}

export default Explore;

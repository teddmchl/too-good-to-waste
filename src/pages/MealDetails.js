import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import "./MealDetails.css";

const MealDetails = () => {
  const { id } = useParams();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeal = async () => {
      const docRef = doc(db, "meals", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setMeal({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    };
    fetchMeal();
  }, [id]);

  const handleReserve = async () => {
    if (!auth.currentUser) {
      toast.error("You must be logged in to reserve.");
      return;
    }
    setReserving(true);
    try {
      // Prevent double booking
      if (meal.claimed) {
        toast.error("Sorry, this meal has already been reserved.");
        setReserving(false);
        return;
      }
      // Save to orders
      await addDoc(collection(db, "orders"), {
        customerId: auth.currentUser.uid,
        mealId: meal.id,
        timestamp: Timestamp.now(),
        status: "reserved",
      });
      // Mark meal as claimed
      await updateDoc(doc(db, "meals", meal.id), { claimed: true });
      toast.success("Meal reserved! Check your orders.");
      navigate("/my-orders");
    } catch (err) {
      toast.error("Failed to reserve meal.");
    } finally {
      setReserving(false);
    }
  };

  if (loading)
    return (
      <div className="meal-details-container">
        <p>Loading...</p>
      </div>
    );
  if (!meal)
    return (
      <div className="meal-details-container">
        <p>Meal not found.</p>
      </div>
    );

  return (
    <div className="meal-details-container">
      <div className="meal-details-card">
        <img
          src={meal.imageUrl}
          alt={meal.title}
          className="meal-details-img"
        />
        <div className="meal-details-info">
          <h2>{meal.title}</h2>
          <p className="vendor">By: {meal.vendorName || "Vendor"}</p>
          <p className="qty">Quantity: {meal.quantity}</p>
          <p className="expires">
            ⏰ Expires in {timeLeft(meal.expiresAt?.seconds)} hrs
          </p>
          <div className="badges">
            {meal.vegetarian && <span className="badge">🌱 Vegetarian</span>}
            {meal.spicy && <span className="badge">🔥 Spicy</span>}
            {meal.expiresAt && (
              <span className="badge">
                ⏰ {timeLeft(meal.expiresAt?.seconds)} hrs left
              </span>
            )}
          </div>
          <button
            className="reserve-btn"
            onClick={handleReserve}
            disabled={reserving || meal.claimed}
          >
            {meal.claimed
              ? "Already Reserved"
              : reserving
              ? "Reserving..."
              : "Reserve"}
          </button>
        </div>
      </div>
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

export default MealDetails;

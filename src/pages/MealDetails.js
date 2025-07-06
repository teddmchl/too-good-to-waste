import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import CustomerNavbar from "../components/CustomerNavbar";
import "./MealDetails.css";
import { toast } from "react-toastify";

function timeLeft(expiryDate) {
  if (!expiryDate) return "?";
  const now = new Date();
  const expiry = expiryDate.toDate ? expiryDate.toDate() : new Date(expiryDate);
  const diff = expiry - now;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
}

const MealDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);

  // Fetch meal data
  useEffect(() => {
    const fetchMeal = async () => {
      try {
        setLoading(true);
        const mealRef = doc(db, "meals", id);
        const mealSnap = await getDoc(mealRef);

        if (mealSnap.exists()) {
          setMeal({ id: mealSnap.id, ...mealSnap.data() });
        } else {
          toast.error("Meal not found");
          navigate("/explore");
        }
      } catch (error) {
        console.error("Error fetching meal:", error);
        toast.error("Error loading meal details");
        navigate("/explore");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMeal();
    }
  }, [id, navigate]);

  const handleReserve = async () => {
    if (!user) {
      toast.error("Please log in to reserve meals");
      return;
    }

    // Check if meal is still available
    if (!meal.status || meal.status !== "available") {
      toast.error("This meal is no longer available");
      return;
    }

    // Check if meal has quantity
    if (!meal.quantity || meal.quantity <= 0) {
      toast.error("This meal is out of stock");
      return;
    }

    // Check if meal has expired
    if (
      meal.expiresAt &&
      meal.expiresAt.toDate &&
      meal.expiresAt.toDate() <= new Date()
    ) {
      toast.error("This meal has expired");
      return;
    }

    // Redirect to checkout with the meal
    const checkoutData = {
      id: meal.id,
      title: meal.title,
      imageUrl: meal.imageUrl,
      vendorName: meal.vendorName,
      vendorId: meal.vendorId,
      price: meal.discountedPrice || 0,
      quantity: 1,
      expiresAt: meal.expiresAt,
      dietaryType: meal.dietaryType,
    };

    console.log("Navigating to checkout with data:", checkoutData);
    console.log("Meal data:", meal);

    navigate("/checkout", {
      state: {
        checkoutItems: [checkoutData],
      },
    });
  };

  const renderDietaryBadge = (dietaryType) => {
    switch (dietaryType) {
      case "vegetarian":
        return <span className="dietary-badge vegetarian">🌱 Vegetarian</span>;
      case "omnivorous":
        return <span className="dietary-badge omnivorous">🥩 Omnivorous</span>;
      default:
        return null;
    }
  };

  const renderMealImage = (meal) => {
    // Only show emoji dietary icons, no real images
    if (meal.dietaryType) {
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
        <div className="meal-image-emoji">
          <span className="dietary-icon-large">
            {getDietaryIcon(meal.dietaryType)}
          </span>
        </div>
      );
    }
    // If no dietary type, don't render anything
    return null;
  };

  if (loading || !meal) {
    return (
      <>
        <CustomerNavbar />
        <div className="meal-details-container">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            Loading meal details...
          </div>
        </div>
      </>
    );
  }

  // Redirect if meal doesn't have dietary type
  if (!meal.dietaryType) {
    toast.error("This meal is not available");
    navigate("/explore");
    return null;
  }

  return (
    <>
      <CustomerNavbar />
      <div className="meal-details-container">
        <div className="meal-details-card">
          {renderMealImage(meal)}
          <div className="meal-details-info">
            <h2>{meal.title}</h2>
            <p className="vendor">By: {meal.vendorName}</p>
            <p className="qty">Quantity: {meal.quantity}</p>
            <p className="expires">
              ⏰ Expires in {timeLeft(meal.expiresAt)} hrs
            </p>
            {meal.discountedPrice && (
              <p className="price">💰 Price: KES {meal.discountedPrice}</p>
            )}
            <div className="dietary-badges">
              {renderDietaryBadge(meal.dietaryType)}
            </div>
            <button
              className="reserve-btn"
              onClick={handleReserve}
              disabled={loading}
            >
              {loading ? "Reserving..." : "Reserve"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MealDetails;

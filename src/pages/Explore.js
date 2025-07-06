import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAvailableMeals } from "../database/dbUtils";
import CustomerNavbar from "../components/CustomerNavbar";
import "./Explore.css";
import { toast } from "react-toastify";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

function timeLeft(expiryDate) {
  if (!expiryDate) return "?";
  const now = new Date();
  const expiry = expiryDate.toDate ? expiryDate.toDate() : new Date(expiryDate);
  const diff = expiry - now;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
}

const Explore = () => {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  const [meals, setMeals] = useState([]);
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [username, setUsername] = useState("");

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUsername(userData.username || "");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    if (!loading) {
      fetchUserData();
    }
  }, [user, loading]);

  const refreshMeals = async () => {
    try {
      setLoadingMeals(true);
      console.log("=== REFRESH: Checking all meals in database ===");

      // Test basic collection access
      console.log("Testing collection access...");
      const allMealsSnapshot = await getDocs(collection(db, "meals"));
      console.log(
        "Collection access successful, found",
        allMealsSnapshot.size,
        "documents"
      );

      const allMeals = allMealsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("All meals:", allMeals);

      // Check each meal's status and expiry
      allMeals.forEach((meal) => {
        console.log(`Meal: ${meal.title}`);
        console.log(`  Status: ${meal.status}`);
        console.log(`  ExpiresAt: ${meal.expiresAt}`);
        console.log(`  VendorId: ${meal.vendorId}`);
        console.log(`  VendorName: ${meal.vendorName}`);
        console.log(`  CreatedAt: ${meal.createdAt}`);
        console.log("---");
      });

      // Test the filtering logic
      const now = new Date();
      const availableMeals = allMeals.filter((meal) => {
        const isAvailable = meal.status === "available";
        const notExpired =
          meal.expiresAt &&
          meal.expiresAt.toDate &&
          meal.expiresAt.toDate() > now;
        console.log(
          `Filtering ${meal.title}: available=${isAvailable}, notExpired=${notExpired}`
        );
        return isAvailable && notExpired;
      });

      console.log("Available meals after filtering:", availableMeals);

      // Update the meals state with the fresh data
      setMeals(availableMeals);

      toast.info(
        `Refreshed! Found ${allMeals.length} total meals, ${availableMeals.length} available`
      );
    } catch (error) {
      console.error("Refresh error:", error);
      toast.error("Refresh failed: " + error.message);
    } finally {
      setLoadingMeals(false);
    }
  };

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const availableMeals = await getAvailableMeals();
        console.log("Fetched meals:", availableMeals); // Debug log
        setMeals(availableMeals);
      } catch (error) {
        console.error("Error fetching meals:", error);
        toast.error("Error loading available meals");
      } finally {
        setLoadingMeals(false);
      }
    };

    fetchMeals();
  }, []);

  const renderDietaryBadge = (dietaryType) => {
    switch (dietaryType) {
      case "vegetarian":
        return <span className="dietary-badge vegetarian">🌱 Vegetarian</span>;
      case "omnivorous":
        return <span className="dietary-badge omnivorous">🥩 Omnivorous</span>;
      case "any":
        return <span className="dietary-badge any">🍽️ Any</span>;
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

  if (loading || loadingMeals) {
    return (
      <>
        <CustomerNavbar />
        <div className="explore-container">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            Loading available meals...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CustomerNavbar />
      <div className="explore-container">
        {/* Welcome Message */}
        <div className="greeting">
          <h1>Karibu, @{username || "Customer"}</h1>
          <p>Discover fresh surplus meals and help reduce food waste 🌍</p>
        </div>

        <h2
          style={{
            textAlign: "center",
            marginBottom: "1.5rem",
            color: "#2c7a7b",
          }}
        >
          🍲 Available Surplus Meals
        </h2>

        {/* Refresh button */}
        <button
          onClick={refreshMeals}
          style={{
            background: "#38a169",
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            marginBottom: "1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            margin: "0 auto 1rem auto",
          }}
        >
          🔄 Refresh Meals
        </button>

        {meals.length === 0 ? (
          <div className="no-meals">
            <p>No meals available at the moment.</p>
            <p>Check back later for fresh surplus meals!</p>
          </div>
        ) : (
          <div className="meals-grid">
            {meals
              .filter((meal) => meal.dietaryType) // Only show meals with dietary types
              .map((meal) => (
                <div
                  className="meal-card"
                  key={meal.id}
                  onClick={() => navigate(`/meal/${meal.id}`)}
                >
                  {renderMealImage(meal)}
                  <div className="meal-info">
                    <h4>{meal.title}</h4>
                    <p className="qty">{meal.quantity}</p>
                    <p className="expires">
                      ⏰ Expires in {timeLeft(meal.expiresAt)} hrs
                    </p>
                    <p className="vendor">{meal.vendorName}</p>
                    {meal.discountedPrice && (
                      <p className="price">💰 KES {meal.discountedPrice}</p>
                    )}
                    <div className="dietary-badges">
                      {renderDietaryBadge(meal.dietaryType)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Explore;

// src/pages/AddMeal.js

import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth } from "../firebase";
import { toast } from "react-toastify";
import VendorNavbar from "../components/VendorNavbar";
import "./AddMeal.css";

const AddMeal = () => {
  const [form, setForm] = useState({
    title: "",
    quantity: "",
    originalPrice: "",
    discountedPrice: "",
    expiresInHours: "",
    dietaryType: "omnivorous", // omnivorous, vegetarian, any
  });
  const [uploading, setUploading] = useState(false);
  const [user, loading] = useAuthState(auth);
  const [vendorInfo, setVendorInfo] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchVendorInfo = async () => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setVendorInfo(userSnap.data());
          }
        } catch (error) {
          console.error("Error fetching vendor info:", error);
        }
      }
    };

    if (!loading) {
      fetchVendorInfo();
    }
  }, [user, loading]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getDietaryIcon = (dietaryType) => {
    switch (dietaryType) {
      case "omnivorous":
        return "🥩";
      case "vegetarian":
        return "🌱";
      case "any":
      default:
        return "🍽️";
    }
  };

  const getDietaryText = (dietaryType) => {
    switch (dietaryType) {
      case "omnivorous":
        return "Omnivorous (Contains meat)";
      case "vegetarian":
        return "Vegetarian (No meat)";
      case "any":
      default:
        return "Any will do";
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();

    if (!vendorInfo) {
      toast.error("Vendor information not found");
      return;
    }

    console.log("Vendor info:", vendorInfo); // Debug log
    console.log("User UID:", user.uid); // Debug log
    console.log("Restaurant name:", vendorInfo.restaurantName); // Debug log

    setUploading(true);
    try {
      const expiryTimestamp = Timestamp.fromDate(
        new Date(Date.now() + form.expiresInHours * 60 * 60 * 1000)
      );

      // Ensure we have a proper vendor name
      const vendorName =
        vendorInfo.restaurantName || vendorInfo.name || "Unknown Vendor";

      // Create meal data
      const mealData = {
        title: form.title,
        quantity: parseInt(form.quantity),
        originalPrice: parseFloat(form.originalPrice),
        discountedPrice: parseFloat(form.discountedPrice),
        expiresAt: expiryTimestamp,
        status: "available",
        vendorId: user.uid,
        vendorName: vendorName,
        vendorEmail: user.email,
        dietaryInfo: {
          [form.dietaryType]: true,
        },
        dietaryType: form.dietaryType,
        category: "Surplus Food",
        ingredients: ["Fresh ingredients"],
        allergens: [],
        pickupLocation: "Restaurant Location",
        pickupInstructions: "Pick up from restaurant",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log("Saving meal data:", mealData); // Debug log
      const docRef = await addDoc(collection(db, "meals"), mealData);
      console.log("Meal saved with ID:", docRef.id); // Debug log

      // Verify the meal was saved by fetching it back
      const savedMealRef = doc(db, "meals", docRef.id);
      const savedMealSnap = await getDoc(savedMealRef);
      if (savedMealSnap.exists()) {
        console.log("Verified saved meal:", savedMealSnap.data());
      } else {
        console.error("Failed to verify saved meal");
      }

      toast.success("Meal posted successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Failed to post meal: " + err.message);
      console.error("AddMeal error:", err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <>
        <VendorNavbar />
        <div className="add-meal-wrapper">
          <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <VendorNavbar />
      <div className="add-meal-wrapper">
        <div className="add-meal-card">
          <h2>📝 Post a New Surplus Meal</h2>
          <p className="subtext">Help Nairobi reduce food waste.</p>

          <form className="add-meal-form" onSubmit={handlePost}>
            <div className="form-group">
              <label>Meal Name:</label>
              <input
                name="title"
                placeholder="e.g., Chapati Pack, Githeri Combo"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Quantity Available:</label>
              <input
                name="quantity"
                placeholder="e.g., 5 packs, 3 plates"
                value={form.quantity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Original Price (KES):</label>
                <input
                  name="originalPrice"
                  type="number"
                  placeholder="200"
                  value={form.originalPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="10"
                />
              </div>
              <div className="form-group">
                <label>Discounted Price (KES):</label>
                <input
                  name="discountedPrice"
                  type="number"
                  placeholder="100"
                  value={form.discountedPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="10"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Expires In (Hours):</label>
              <input
                name="expiresInHours"
                type="number"
                placeholder="2"
                value={form.expiresInHours}
                onChange={handleChange}
                required
                min="1"
                max="24"
              />
            </div>

            <div className="form-group">
              <label>Dietary Type:</label>
              <div className="dietary-options">
                <label className="dietary-option">
                  <input
                    type="radio"
                    name="dietaryType"
                    value="omnivorous"
                    checked={form.dietaryType === "omnivorous"}
                    onChange={handleChange}
                  />
                  <span className="option-icon">🥩</span>
                  <span className="option-text">
                    Omnivorous (Contains meat)
                  </span>
                </label>

                <label className="dietary-option">
                  <input
                    type="radio"
                    name="dietaryType"
                    value="vegetarian"
                    checked={form.dietaryType === "vegetarian"}
                    onChange={handleChange}
                  />
                  <span className="option-icon">🌱</span>
                  <span className="option-text">Vegetarian (No meat)</span>
                </label>

                <label className="dietary-option">
                  <input
                    type="radio"
                    name="dietaryType"
                    value="any"
                    checked={form.dietaryType === "any"}
                    onChange={handleChange}
                  />
                  <span className="option-icon">🍽️</span>
                  <span className="option-text">Any will do</span>
                </label>
              </div>
            </div>

            <div className="meal-preview">
              <h4>Meal Preview:</h4>
              <div className="preview-card">
                <div className="preview-image">
                  {getDietaryIcon(form.dietaryType)}
                </div>
                <div className="preview-details">
                  <h5>{form.title || "Meal Name"}</h5>
                  <p className="preview-dietary">
                    {getDietaryText(form.dietaryType)}
                  </p>
                  <p className="preview-price">
                    <span className="original-price">
                      KES {form.originalPrice || "0"}
                    </span>
                    <span className="discounted-price">
                      KES {form.discountedPrice || "0"}
                    </span>
                  </p>
                  <p className="preview-quantity">
                    Quantity: {form.quantity || "0"}
                  </p>
                </div>
              </div>
            </div>

            <button type="submit" disabled={uploading}>
              {uploading ? "Posting..." : "📦 Post Meal"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddMeal;

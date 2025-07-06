// src/Register.js

import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./Register.css";

const Register = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    phone: "",
    username: "",
    role: "customer",
    restaurantName: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [newUserId, setNewUserId] = useState(null);
  const [dietaryPreference, setDietaryPreference] = useState("any");

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePreferenceChange = (e) => {
    setDietaryPreference(e.target.value);
  };

  // Function to check if username is unique
  const checkUsernameUnique = async (username) => {
    try {
      const { collection, query, where, getDocs } = await import(
        "firebase/firestore"
      );
      const usersQuery = query(
        collection(db, "users"),
        where("username", "==", username)
      );
      const snapshot = await getDocs(usersQuery);
      return snapshot.empty; // Returns true if username is unique
    } catch (error) {
      console.error("Error checking username uniqueness:", error);
      return false;
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic phone number validation
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    if (!phoneRegex.test(form.phone)) {
      toast.error(
        "Please enter a valid Kenyan phone number (e.g., +254712345678 or 0712345678)"
      );
      setLoading(false);
      return;
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(form.username)) {
      toast.error(
        "Username must be 3-20 characters long and contain only letters, numbers, and underscores"
      );
      setLoading(false);
      return;
    }

    // Check if username is unique
    const isUsernameUnique = await checkUsernameUnique(form.username);
    if (!isUsernameUnique) {
      toast.error("Username is already taken. Please choose a different one.");
      setLoading(false);
      return;
    }

    // Validate restaurant name for vendors
    if (form.role === "vendor" && !form.restaurantName.trim()) {
      toast.error("Please enter your restaurant name");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      // Save basic user data to Firestore
      const userRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userRef, {
        uid: userCredential.user.uid,
        email: form.email,
        phone: form.phone,
        username: form.username.toLowerCase(),
        role: form.role,
        restaurantName:
          form.role === "vendor" ? form.restaurantName.trim() : null,
        createdAt: new Date(),
        lastLogin: new Date(),
        impact:
          form.role === "vendor"
            ? {
                mealsPosted: 0,
                mealsReserved: 0,
                mealsPickedUp: 0,
                mealsWasted: 0,
                totalRevenue: 0,
              }
            : { mealsReserved: 0, mealsPickedUp: 0, totalSavings: 0 },
      });

      setNewUserId(userCredential.user.uid);
      setShowPreferencesModal(true);
      setLoading(false);
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      // Update user with preferences based on role
      const userRef = doc(db, "users", newUserId);

      if (form.role === "vendor") {
        // For vendors, save restaurant name
        await setDoc(
          userRef,
          {
            restaurantName: form.restaurantName.trim(),
          },
          { merge: true }
        );
      } else {
        // For customers, save dietary preferences
        await setDoc(
          userRef,
          {
            dietaryPreference,
            preferences: getPreferenceText(dietaryPreference),
          },
          { merge: true }
        );
      }

      toast.success("Account created successfully!");
      setShowPreferencesModal(false);

      // Navigate based on role
      if (form.role === "vendor") {
        navigate("/dashboard");
      } else {
        navigate("/explore");
      }
    } catch (error) {
      toast.error("Error saving preferences: " + error.message);
    }
  };

  const getPreferenceText = (preference) => {
    switch (preference) {
      case "omnivorous":
        return "Omnivorous (Eats everything)";
      case "vegetarian":
        return "Vegetarian";
      case "any":
      default:
        return "Any will do";
    }
  };

  return (
    <>
      <div className="page-content">
        <div className="auth-container">
          <div
            className="auth-left"
            style={{
              background: `url(${
                process.env.PUBLIC_URL + "/market.jpg"
              }) center/cover no-repeat`,
            }}
          >
            <div className="brand-intro">
              <h1>Too Good To Waste</h1>
              <p className="tagline">Feeding Nairobi, saving surplus</p>
              <p className="zone">📍 Nairobi County</p>
            </div>
          </div>
          <div className="auth-right">
            <form className="auth-form" onSubmit={handleRegister}>
              <h2>Create Account</h2>

              <input
                name="email"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />

              <input
                name="password"
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />

              <input
                name="phone"
                placeholder="Phone Number (e.g., +254712345678)"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                required
              />

              <input
                name="username"
                placeholder="Username (3-20 characters, letters, numbers, _)"
                type="text"
                value={form.username}
                onChange={handleChange}
                required
              />

              {form.role === "vendor" && (
                <input
                  name="restaurantName"
                  placeholder="Restaurant Name"
                  type="text"
                  value={form.restaurantName}
                  onChange={handleChange}
                  required
                />
              )}

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                required
              >
                <option value="customer">I'm a Customer</option>
                <option value="vendor">I'm a Vendor</option>
              </select>

              <button type="submit" disabled={loading}>
                {loading ? "Creating Account..." : "Register"}
              </button>

              <div className="form-footer">
                Already have an account? <Link to="/login">Login</Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferencesModal && (
        <div className="modal-overlay">
          <div className="preferences-modal">
            {form.role === "vendor" ? (
              <>
                <h3>🏪 Restaurant Information</h3>
                <p>Please provide your restaurant details</p>

                <div className="restaurant-input">
                  <label>Restaurant Name:</label>
                  <input
                    type="text"
                    value={form.restaurantName}
                    onChange={(e) =>
                      setForm({ ...form, restaurantName: e.target.value })
                    }
                    placeholder="Enter your restaurant name"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <h3>🍽️ Dietary Preference</h3>
                <p>Help us recommend meals that suit your dietary needs</p>

                <div className="preferences-options">
                  <label className="preference-option">
                    <input
                      type="radio"
                      name="dietaryPreference"
                      value="any"
                      checked={dietaryPreference === "any"}
                      onChange={handlePreferenceChange}
                    />
                    <div className="option-content">
                      <span className="option-icon">🍽️</span>
                      <div>
                        <span className="option-title">Any will do</span>
                        <span className="option-description">
                          No dietary restrictions
                        </span>
                      </div>
                    </div>
                  </label>

                  <label className="preference-option">
                    <input
                      type="radio"
                      name="dietaryPreference"
                      value="vegetarian"
                      checked={dietaryPreference === "vegetarian"}
                      onChange={handlePreferenceChange}
                    />
                    <div className="option-content">
                      <span className="option-icon">🌱</span>
                      <div>
                        <span className="option-title">Vegetarian</span>
                        <span className="option-description">
                          No meat, but includes dairy and eggs
                        </span>
                      </div>
                    </div>
                  </label>

                  <label className="preference-option">
                    <input
                      type="radio"
                      name="dietaryPreference"
                      value="omnivorous"
                      checked={dietaryPreference === "omnivorous"}
                      onChange={handlePreferenceChange}
                    />
                    <div className="option-content">
                      <span className="option-icon">🥩</span>
                      <div>
                        <span className="option-title">Omnivorous</span>
                        <span className="option-description">
                          Eats everything including meat
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
              </>
            )}

            <div className="modal-buttons">
              <button
                className="skip-btn"
                onClick={() => {
                  setShowPreferencesModal(false);
                  if (form.role === "vendor") {
                    navigate("/dashboard");
                  } else {
                    navigate("/explore");
                  }
                }}
              >
                Skip for now
              </button>
              <button className="save-btn" onClick={handleSavePreferences}>
                {form.role === "vendor"
                  ? "Save Restaurant Info"
                  : "Save Preference"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Register;

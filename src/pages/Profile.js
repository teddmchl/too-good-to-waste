import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import CustomerNavbar from "../components/CustomerNavbar";
import VendorNavbar from "../components/VendorNavbar";
import { toast } from "react-toastify";
import "./Profile.css";

const Profile = () => {
  const [user, loading] = useAuthState(auth);
  const [role, setRole] = useState("customer");
  const [form, setForm] = useState({
    email: "",
    phone: "",
    prefs: "Vegetarian, No pork",
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userLoading, setUserLoading] = useState(true);

  // Fetch user data and role from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          // Fetch user role and data from Firestore
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setRole(userData.role || "customer");

            setForm({
              email: user.email || "",
              phone: userData.phone || user.phoneNumber || "",
              prefs:
                userData.preferences ||
                userData.dietaryPreference ||
                "Vegetarian, No pork",
            });
          } else {
            // Fallback to basic user data
            setForm({
              email: user.email || "",
              phone: user.phoneNumber || "",
              prefs: "Vegetarian, No pork",
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Fallback to basic user data
          setForm({
            email: user.email || "",
            phone: user.phoneNumber || "",
            prefs: "Vegetarian, No pork",
          });
        }
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update user profile in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        phone: form.phone,
        preferences: form.prefs,
        updatedAt: serverTimestamp(),
      });

      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    const fetchUserData = async () => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setForm({
              email: user.email || "",
              phone: userData.phone || user.phoneNumber || "",
              prefs:
                userData.preferences ||
                userData.dietaryPreference ||
                "Vegetarian, No pork",
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
    setEditing(false);
  };

  if (loading || userLoading) {
    return (
      <>
        {role === "vendor" ? <VendorNavbar /> : <CustomerNavbar />}
        <div className="profile-container">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            Loading profile...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {role === "vendor" ? <VendorNavbar /> : <CustomerNavbar />}
      <div className="profile-container">
        <div className="profile-header">
          <h1>👤 Profile</h1>
          <p>Manage your account information and preferences</p>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <h2>Account Information</h2>

            <div className="form-group">
              <label>Email:</label>
              <input
                name="email"
                value={form.email}
                disabled
                placeholder="Email address"
              />
              <small>Email cannot be changed</small>
            </div>

            <div className="form-group">
              <label>Phone Number:</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                disabled={!editing}
                placeholder="e.g. +254712345678"
              />
            </div>

            {role === "customer" && (
              <div className="form-group">
                <label>Dietary Preferences:</label>
                <input
                  name="prefs"
                  value={form.prefs}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="e.g. Vegetarian, No pork"
                />
              </div>
            )}

            <div className="profile-actions">
              {editing ? (
                <>
                  <button
                    className="save-btn"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button className="edit-btn" onClick={() => setEditing(true)}>
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {role === "customer" && (
            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <button
                className="explore-btn"
                onClick={() => (window.location.href = "/explore")}
              >
                🍲 Explore Meals
              </button>
              <button
                className="orders-btn"
                onClick={() => (window.location.href = "/my-orders")}
              >
                📋 My Orders
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;

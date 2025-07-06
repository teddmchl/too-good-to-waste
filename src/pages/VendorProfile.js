import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import VendorNavbar from "../components/VendorNavbar";
import "./VendorProfile.css";

const VendorProfile = () => {
  const [user, loading] = useAuthState(auth);
  const [profile, setProfile] = useState({
    restaurantName: "",
    email: "",
    phone: "",
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setProfile({
            restaurantName: userData.restaurantName || "",
            email: userData.email || user.email,
            phone: userData.phone || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Error loading profile");
      }
    };

    if (!loading) {
      fetchProfile();
    }
  }, [user, loading]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        restaurantName: profile.restaurantName.trim(),
        phone: profile.phone,
        updatedAt: serverTimestamp(),
      });

      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAddMeal = () => {
    navigate("/add");
  };

  if (loading) {
    return (
      <>
        <VendorNavbar />
        <div className="vendor-profile-container">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            Loading profile...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <VendorNavbar />
      <div className="vendor-profile-container">
        <div className="profile-header">
          <h1>🏪 Vendor Profile</h1>
          <p>Manage your restaurant information</p>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <h2>Restaurant Information</h2>
            
            <div className="form-group">
              <label>Restaurant Name:</label>
              <input
                type="text"
                value={profile.restaurantName}
                onChange={(e) => setProfile({...profile, restaurantName: e.target.value})}
                disabled={!editing}
                placeholder="Enter your restaurant name"
              />
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={profile.email}
                disabled
                placeholder="Email address"
              />
              <small>Email cannot be changed</small>
            </div>

            <div className="form-group">
              <label>Phone Number:</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                disabled={!editing}
                placeholder="Phone number"
              />
            </div>

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
                    onClick={() => setEditing(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="edit-btn"
                  onClick={() => setEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <button
              className="add-meal-btn"
              onClick={handleAddMeal}
            >
              + Add New Meal
            </button>
            <button
              className="orders-btn"
              onClick={() => navigate("/orders")}
            >
              📊 View Orders & Analytics
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VendorProfile;

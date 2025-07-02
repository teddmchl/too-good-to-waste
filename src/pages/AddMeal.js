// src/pages/AddMeal.js

import React, { useState } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import VendorNavbar from "../components/VendorNavbar";
import "./AddMeal.css";

const AddMeal = () => {
  const [form, setForm] = useState({
    title: "",
    quantity: "",
    expiresInHours: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error("Please select an image.");
      return;
    }
    setUploading(true);
    try {
      // Upload image to Firebase Storage
      const storageRef = ref(storage, `meals/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(storageRef);

      const expiryTimestamp = Timestamp.fromDate(
        new Date(Date.now() + form.expiresInHours * 60 * 60 * 1000)
      );

      await addDoc(collection(db, "meals"), {
        ...form,
        imageUrl,
        createdAt: Timestamp.now(),
        expiresAt: expiryTimestamp,
        // Add vendorId or vendorEmail if needed
      });

      toast.success("Meal posted successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Failed to post meal: " + err.message);
      console.error("AddMeal error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <VendorNavbar />
      <div className="add-meal-wrapper">
        <div className="add-meal-card">
          <h2>📝 Post a New Surplus Meal</h2>
          <p className="subtext">Help Nairobi reduce food waste.</p>
          <form className="add-meal-form" onSubmit={handlePost}>
            <input
              name="title"
              placeholder="Meal Title (e.g. Chapati Pack)"
              value={form.title}
              onChange={handleChange}
              required
            />
            <input
              name="quantity"
              placeholder="Quantity (e.g. 5 packs)"
              value={form.quantity}
              onChange={handleChange}
              required
            />
            <input
              name="expiresInHours"
              placeholder="Expires in (hours)"
              type="number"
              value={form.expiresInHours}
              onChange={handleChange}
              required
              min="1"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                style={{ width: "100%", margin: "1rem 0", borderRadius: 8 }}
              />
            )}
            <button type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : "📦 Post Meal"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddMeal;

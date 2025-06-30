// src/pages/AddMeal.js

import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import VendorNavbar from "../components/VendorNavbar";
import "./AddMeal.css";

const AddMeal = () => {
  const [form, setForm] = useState({
    title: "",
    quantity: "",
    expiresInHours: "",
    imageUrl: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      const expiryTimestamp = Timestamp.fromDate(
        new Date(Date.now() + form.expiresInHours * 60 * 60 * 1000)
      );

      await addDoc(collection(db, "meals"), {
        ...form,
        createdAt: Timestamp.now(),
        expiresAt: expiryTimestamp,
      });

      toast.success("Meal posted successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Failed to post meal. Please try again.");
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
              name="imageUrl"
              placeholder="Image URL (hosted image)"
              value={form.imageUrl}
              onChange={handleChange}
              required
            />
            <button type="submit">📦 Post Meal</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddMeal;

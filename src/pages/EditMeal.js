import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, storage } from "../firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import VendorNavbar from "../components/VendorNavbar";
import "./AddMeal.css";

const EditMeal = () => {
  const { mealId } = useParams();
  const [form, setForm] = useState({
    title: "",
    quantity: "",
    expiresInHours: "",
    imageUrl: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeal = async () => {
      const mealRef = doc(db, "meals", mealId);
      const mealSnap = await getDoc(mealRef);
      if (mealSnap.exists()) {
        const data = mealSnap.data();
        setForm({
          title: data.title || "",
          quantity: data.quantity || "",
          expiresInHours: data.expiresAt
            ? Math.max(
                1,
                Math.round(
                  (data.expiresAt.seconds * 1000 - Date.now()) /
                    (1000 * 60 * 60)
                )
              )
            : "",
          imageUrl: data.imageUrl || "",
        });
        setPreview(data.imageUrl || null);
      }
      setLoading(false);
    };
    fetchMeal();
  }, [mealId]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setPreview(file ? URL.createObjectURL(file) : form.imageUrl);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = form.imageUrl;
      if (imageFile) {
        const storageRef = ref(
          storage,
          `meals/${Date.now()}_${imageFile.name}`
        );
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
      const expiryTimestamp = form.expiresInHours
        ? Timestamp.fromDate(
            new Date(Date.now() + form.expiresInHours * 60 * 60 * 1000)
          )
        : null;
      const mealRef = doc(db, "meals", mealId);
      await updateDoc(mealRef, {
        title: form.title,
        quantity: form.quantity,
        imageUrl,
        ...(expiryTimestamp && { expiresAt: expiryTimestamp }),
      });
      toast.success("Meal updated!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Failed to update meal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</div>
    );

  return (
    <>
      <VendorNavbar />
      <div className="add-meal-wrapper">
        <div className="add-meal-card">
          <h2>✏️ Edit Meal</h2>
          <form className="add-meal-form" onSubmit={handleUpdate}>
            <input
              name="title"
              placeholder="Meal Title"
              value={form.title}
              onChange={handleChange}
              required
            />
            <input
              name="quantity"
              placeholder="Quantity"
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
              min="1"
              required
            />
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                style={{ width: "100%", margin: "1rem 0", borderRadius: 8 }}
              />
            )}
            <button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Meal"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditMeal;

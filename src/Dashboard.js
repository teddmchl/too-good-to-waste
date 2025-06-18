import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { toast } from "react-toastify";

const Dashboard = () => {
  const navigate = useNavigate();

  // State for food listing form
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [expiry, setExpiry] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "listings"), {
        name,
        price,
        expiry,
        createdAt: new Date(),
      });
      toast.success("Food listing added!");
      setName("");
      setPrice("");
      setExpiry("");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="card">
      <h2>Dashboard</h2>
      <p>You're logged in! 🎉</p>
      <button onClick={() => signOut(auth).then(() => navigate("/login"))}>
        Logout
      </button>

      <div className="card" style={{ marginTop: 32 }}>
        <h2>Add Surplus Food</h2>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Price (KES)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <input
            type="date"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            required
          />
          <button type="submit">Add Listing</button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;

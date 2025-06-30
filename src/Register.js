// src/Register.js

import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "./components/Header";
import "./Register.css";

const Register = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "customer",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      // Save additional data to Firestore
      const userRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userRef, {
        uid: userCredential.user.uid,
        email: form.email,
        role: form.role,
        createdAt: new Date(),
      });

      toast.success("Account created successfully!");
      navigate("/login");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
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
    </>
  );
};

export default Register;

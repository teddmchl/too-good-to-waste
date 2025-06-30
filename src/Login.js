import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import Header from "./components/Header";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import "./Register.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCredential.user;
      // Fetch user role from Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const role = userSnap.data().role;
        toast.success("Login successful!");
        if (role === "vendor") {
          navigate("/dashboard");
        } else {
          navigate("/explore");
        }
      } else {
        toast.error("User role not found. Please contact support.");
      }
    } catch (err) {
      toast.error(err.message);
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
            <form className="auth-form" onSubmit={handleLogin}>
              <h2>Login to Too Good To Waste</h2>
              <input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <div className="pwd-wrap">
                <input
                  type={showPwd ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <span onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <button type="submit">Login</button>
              <div className="form-footer">
                Don’t have an account? <Link to="/register">Sign up</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;

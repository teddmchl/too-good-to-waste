import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

const spinnerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
};

const Spinner = () => (
  <div style={spinnerStyle}>
    <div className="lds-dual-ring"></div>
    <style>{`
      .lds-dual-ring {
        display: inline-block;
        width: 64px;
        height: 64px;
      }
      .lds-dual-ring:after {
        content: " ";
        display: block;
        width: 46px;
        height: 46px;
        margin: 1px;
        border-radius: 50%;
        border: 6px solid #2c7a7b;
        border-color: #2c7a7b transparent #2c7a7b transparent;
        animation: lds-dual-ring 1.2s linear infinite;
      }
      @keyframes lds-dual-ring {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(undefined);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
    });
    return () => unsubscribe();
  }, []);
  if (user === undefined) return <Spinner />;
  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

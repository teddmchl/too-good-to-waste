import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

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

const ProtectedVendorRoute = ({ children }) => {
  const [status, setStatus] = useState("loading"); // loading, unauthorized, authorized

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setStatus("unauthorized");
        return;
      }
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().role === "vendor") {
        setStatus("authorized");
      } else {
        setStatus("unauthorized");
      }
    });
    return () => unsubscribe();
  }, []);

  if (status === "loading") return <Spinner />;
  if (status === "unauthorized") return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedVendorRoute;

import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import "./MyOrders.css";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [meals, setMeals] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!auth.currentUser) return;
      const q = query(
        collection(db, "orders"),
        where("customerId", "==", auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersData);

      // Fetch meal details for each order
      const mealPromises = ordersData.map((order) =>
        getDoc(doc(db, "meals", order.mealId))
      );
      const mealSnaps = await Promise.all(mealPromises);
      const mealsMap = {};
      mealSnaps.forEach((snap) => {
        if (snap.exists()) mealsMap[snap.id] = snap.data();
      });
      setMeals(mealsMap);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  return (
    <div className="my-orders-container">
      <h1>🍽️ My Orders</h1>
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>You have no reservations yet.</p>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => {
            const meal = meals[order.mealId];
            return (
              <div className="order-card" key={order.id}>
                {meal && <img src={meal.imageUrl} alt={meal.title} />}
                <div className="order-info">
                  <h4>{meal ? meal.title : "Meal"}</h4>
                  <p>Status: {order.status}</p>
                  <p>
                    Reserved:{" "}
                    {order.timestamp?.toDate
                      ? order.timestamp.toDate().toLocaleString()
                      : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;

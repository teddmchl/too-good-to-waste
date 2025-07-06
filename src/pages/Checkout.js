import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import CustomerNavbar from "../components/CustomerNavbar";
import { toast } from "react-toastify";
import "./Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, loading] = useAuthState(auth);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [mpesaPrompt, setMpesaPrompt] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");

  // Get checkout items from location state (passed from MealDetails)
  useEffect(() => {
    if (location.state?.checkoutItems) {
      setCheckoutItems(location.state.checkoutItems);
    } else {
      // If no items in state, redirect back to explore
      toast.error("No items to checkout");
      navigate("/explore");
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (user) {
      // Get user's phone number and username from Firestore
      const fetchUserData = async () => {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setPhoneNumber(userData.phone || "");
            setUsername(userData.username || "");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [user]);

  const calculateTotal = () => {
    return checkoutItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    setCheckoutItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (itemId) => {
    setCheckoutItems((prevItems) =>
      prevItems.filter((item) => item.id !== itemId)
    );
  };

  const initiateMpesaPayment = async () => {
    if (!phoneNumber) {
      toast.error("Please provide your phone number");
      return;
    }

    setProcessing(true);
    try {
      // Create orders for all items
      const orderPromises = checkoutItems.map(async (item) => {
        const orderData = {
          customerId: user.uid,
          customerEmail: user.email,
          mealId: item.id,
          vendorId: item.vendorId || "unknown",
          vendorName: item.vendorName,
          mealTitle: item.title,
          dietaryType: item.dietaryType,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
          status: "reserved",
          reservedAt: serverTimestamp(),
          pickupDeadline: item.expiresAt,
          paymentStatus: "pending",
          paymentMethod: "mpesa",
          customerPhone: phoneNumber,
          username: username,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const orderRef = await addDoc(collection(db, "orders"), orderData);
        return { ...orderData, id: orderRef.id };
      });

      const orders = await Promise.all(orderPromises);

      // Simulate M-PESA STK Push
      setMpesaPrompt(true);

      // In a real implementation, you would call your M-PESA API here
      // For now, we'll simulate the payment process
      setTimeout(() => {
        // Simulate successful payment
        orders.forEach(async (order) => {
          const orderRef = doc(db, "orders", order.id);
          await updateDoc(orderRef, {
            paymentStatus: "completed",
            mpesaTransactionId: `MPESA${Date.now()}`,
            updatedAt: serverTimestamp(),
          });
        });

        setMpesaPrompt(false);
        setProcessing(false);
        toast.success("Payment successful! Your meals have been reserved.");

        // Force a small delay to ensure Firestore has updated
        setTimeout(() => {
          navigate("/my-orders");
        }, 500);
      }, 3000);
    } catch (error) {
      console.error("Error processing checkout:", error);
      toast.error("Failed to process checkout. Please try again.");
      setProcessing(false);
    }
  };

  const handleReserveWithoutPayment = async () => {
    setProcessing(true);
    try {
      // Create orders for all items without payment
      const orderPromises = checkoutItems.map(async (item) => {
        const orderData = {
          customerId: user.uid,
          customerEmail: user.email,
          mealId: item.id,
          vendorId: item.vendorId || "unknown",
          vendorName: item.vendorName,
          mealTitle: item.title,
          dietaryType: item.dietaryType,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
          status: "reserved",
          reservedAt: serverTimestamp(),
          pickupDeadline: item.expiresAt,
          paymentStatus: "pending",
          paymentMethod: "cash",
          customerPhone: phoneNumber,
          username: username,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const orderRef = await addDoc(collection(db, "orders"), orderData);
        return { ...orderData, id: orderRef.id };
      });

      await Promise.all(orderPromises);

      toast.success("Meals reserved successfully! Pay on pickup.");

      // Force a small delay to ensure Firestore has updated
      setTimeout(() => {
        navigate("/my-orders");
      }, 500);
    } catch (error) {
      console.error("Error reserving meals:", error);
      toast.error("Failed to reserve meals. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const renderMealImage = (item) => {
    // Only show emoji dietary icons, no real images
    if (item.dietaryType) {
      const getDietaryIcon = (dietaryType) => {
        switch (dietaryType) {
          case "omnivorous":
            return "🥩";
          case "vegetarian":
            return "🌱";
          case "any":
            return "🍽️";
          default:
            return "🍽️";
        }
      };

      return (
        <div className="checkout-meal-image-emoji">
          <span className="dietary-icon-large">
            {getDietaryIcon(item.dietaryType)}
          </span>
        </div>
      );
    }
    // If no dietary type, don't render anything
    return null;
  };

  if (loading) {
    return (
      <>
        <CustomerNavbar />
        <div className="checkout-container">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            Loading checkout...
          </div>
        </div>
      </>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <>
        <CustomerNavbar />
        <div className="checkout-container">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            No items to checkout
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CustomerNavbar />
      <div className="checkout-container">
        <h1>🛒 Checkout</h1>

        <div className="checkout-content">
          <div className="checkout-items">
            <h2>Your Items</h2>
            {checkoutItems.map((item) => (
              <div key={item.id} className="checkout-item">
                {renderMealImage(item)}
                <div className="item-details">
                  <h3>{item.title}</h3>
                  <p className="vendor">Vendor: {item.vendorName}</p>
                  <p className="price">KES {item.price}</p>
                  <div className="quantity-controls">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="item-total">
                  <p>KES {item.price * item.quantity}</p>
                  <button
                    className="remove-btn"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-summary">
            <h2>Order Summary</h2>
            <div className="summary-item">
              <span>Subtotal:</span>
              <span>KES {calculateTotal()}</span>
            </div>
            <div className="summary-item">
              <span>Service Fee:</span>
              <span>KES 0</span>
            </div>
            <div className="summary-total">
              <span>Total:</span>
              <span>KES {calculateTotal()}</span>
            </div>

            <div className="payment-section">
              <h3>Payment Method</h3>
              <div className="phone-input">
                <label>Phone Number (M-PESA):</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g., +254712345678"
                  required
                />
              </div>

              <div className="payment-buttons">
                <button
                  className="mpesa-btn"
                  onClick={initiateMpesaPayment}
                  disabled={processing || !phoneNumber}
                >
                  {processing ? "Processing..." : "💳 Pay with M-PESA"}
                </button>
                <button
                  className="cash-btn"
                  onClick={handleReserveWithoutPayment}
                  disabled={processing}
                >
                  {processing ? "Processing..." : "💵 Pay on Pickup"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* M-PESA Prompt Modal */}
        {mpesaPrompt && (
          <div className="mpesa-modal">
            <div className="mpesa-content">
              <h3>📱 M-PESA Payment</h3>
              <p>Please check your phone for the M-PESA prompt</p>
              <div className="mpesa-loading">
                <div className="spinner"></div>
                <p>Processing payment...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Checkout;

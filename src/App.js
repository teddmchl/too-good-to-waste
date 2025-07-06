import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./pages/VendorDashboard";
import Explore from "./pages/Explore";
import "./styles.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Orders from "./pages/Orders";
import ProtectedRoute from "./ProtectedRoute";
import ProtectedVendorRoute from "./ProtectedVendorRoute";
import AddMeal from "./pages/AddMeal";
import MealDetails from "./pages/MealDetails";
import MyOrders from "./pages/MyOrders";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import EditMeal from "./pages/EditMeal";
import Profile from "./pages/Profile";
import VendorProfile from "./pages/VendorProfile";

// Helper component to conditionally render header
const AppHeader = () => {
  const location = useLocation();
  const customerPages = [
    "/explore",
    "/my-orders",
    "/meal",
    "/profile",
    "/checkout",
  ];
  const isCustomerPage = customerPages.some((page) =>
    location.pathname.startsWith(page)
  );

  // Don't show global header on customer pages (they have their own navbar)
  if (isCustomerPage) {
    return null;
  }

  return (
    <header className="app-header">
      <img src="/logo192.png" alt="Logo" className="logo" />
      <h1>Too Good To Waste KE</h1>
    </header>
  );
};

// Profile wrapper component that shows different profiles based on user role
const ProfileWrapper = () => {
  const [user, loading] = useAuthState(auth);
  const [userRole, setUserRole] = React.useState(null);

  React.useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserRole(userSnap.data().role);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
    };

    if (!loading) {
      fetchUserRole();
    }
  }, [user, loading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (userRole === "vendor") {
    return <VendorProfile />;
  } else {
    return <Profile />;
  }
};

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <AppHeader />
        <main>
          <ToastContainer position="top-center" />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/orders"
              element={
                <ProtectedVendorRoute>
                  <Orders />
                </ProtectedVendorRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedVendorRoute>
                  <Dashboard />
                </ProtectedVendorRoute>
              }
            />
            <Route
              path="/explore"
              element={
                <ProtectedRoute>
                  <Explore />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add"
              element={
                <ProtectedVendorRoute>
                  <AddMeal />
                </ProtectedVendorRoute>
              }
            />
            <Route
              path="/meal/:id"
              element={
                <ProtectedRoute>
                  <MealDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit/:mealId"
              element={
                <ProtectedVendorRoute>
                  <EditMeal />
                </ProtectedVendorRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfileWrapper />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

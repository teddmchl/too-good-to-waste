// Database utility functions for common operations
import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from "firebase/firestore";

// User operations
export const getUserById = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return false;
  }
};

// Meal operations
export const getAvailableMeals = async () => {
  try {
    console.log("Fetching available meals...");

    // First, let's get all meals to see what's in the database
    const allMealsQuery = query(collection(db, "meals"));
    const allMealsSnapshot = await getDocs(allMealsQuery);
    const allMeals = allMealsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("All meals in database:", allMeals);

    // Now filter for available meals that haven't expired, have dietary types, and are not sold out
    const availableMeals = allMeals.filter((meal) => {
      const isAvailable = meal.status === "available";
      const notExpired =
        meal.expiresAt &&
        meal.expiresAt.toDate &&
        meal.expiresAt.toDate() > new Date();
      const hasDietaryType = meal.dietaryType; // Only include meals with dietary types
      const notSoldOut = meal.status !== "sold_out" && (meal.quantity || 0) > 0;
      console.log(
        `Meal ${meal.title}: available=${isAvailable}, notExpired=${notExpired}, hasDietaryType=${hasDietaryType}, notSoldOut=${notSoldOut}, quantity=${meal.quantity}, expiresAt=${meal.expiresAt}`
      );
      return isAvailable && notExpired && hasDietaryType && notSoldOut;
    });

    console.log("Available meals after filtering:", availableMeals);
    return availableMeals;
  } catch (error) {
    console.error("Error fetching available meals:", error);
    return [];
  }
};

export const getMealsByVendor = async (vendorId) => {
  try {
    const mealsQuery = query(
      collection(db, "meals"),
      where("vendorId", "==", vendorId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(mealsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching vendor meals:", error);
    return [];
  }
};

export const getMealById = async (mealId) => {
  try {
    const mealDoc = await getDoc(doc(db, "meals", mealId));
    if (mealDoc.exists()) {
      return { id: mealDoc.id, ...mealDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching meal:", error);
    return null;
  }
};

export const updateMealStatus = async (mealId, status) => {
  try {
    const mealRef = doc(db, "meals", mealId);
    await updateDoc(mealRef, {
      status,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error updating meal status:", error);
    return false;
  }
};

// Order operations
export const getOrdersByCustomer = async (customerId) => {
  try {
    console.log("Fetching orders for customer:", customerId);

    // Simplified query without orderBy to avoid index issues
    const ordersQuery = query(
      collection(db, "orders"),
      where("customerId", "==", customerId)
    );
    const snapshot = await getDocs(ordersQuery);
    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Sort in JavaScript instead of Firestore
    orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate
        ? a.createdAt.toDate()
        : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate
        ? b.createdAt.toDate()
        : new Date(b.createdAt || 0);
      return dateB - dateA; // Most recent first
    });

    console.log("Found orders for customer:", orders.length);
    return orders;
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return [];
  }
};

export const getOrdersByVendor = async (vendorId) => {
  try {
    const ordersQuery = query(
      collection(db, "orders"),
      where("vendorId", "==", vendorId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(ordersQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    return [];
  }
};

export const getOrderById = async (orderId) => {
  try {
    const orderDoc = await getDoc(doc(db, "orders", orderId));
    if (orderDoc.exists()) {
      return { id: orderDoc.id, ...orderDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
};

export const cancelOrder = async (orderId) => {
  const batch = writeBatch(db);

  try {
    // Get the order details first
    const orderDoc = await getDoc(doc(db, "orders", orderId));
    if (!orderDoc.exists()) {
      throw new Error("Order not found");
    }

    const orderData = orderDoc.data();

    // Only allow cancellation of reserved orders
    if (orderData.status !== "reserved") {
      throw new Error("Only reserved orders can be cancelled");
    }

    // Update order status to cancelled
    const orderRef = doc(db, "orders", orderId);
    batch.update(orderRef, {
      status: "cancelled",
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // If the order has a mealId, we might want to restore the meal quantity
    // This depends on your business logic - you might want to make the meal available again
    if (orderData.mealId) {
      const mealRef = doc(db, "meals", orderData.mealId);
      // You could add logic here to restore meal availability if needed
      // For now, we'll just update the meal's updatedAt timestamp
      batch.update(mealRef, {
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, newStatus) => {
  const batch = writeBatch(db);

  try {
    console.log(`=== Updating order ${orderId} to status: ${newStatus} ===`);

    // Get the order details first
    const orderDoc = await getDoc(doc(db, "orders", orderId));
    if (!orderDoc.exists()) {
      throw new Error("Order not found");
    }

    const orderData = orderDoc.data();
    console.log("Order data:", orderData);

    // Only allow status updates for reserved orders
    if (orderData.status !== "reserved") {
      throw new Error("Only reserved orders can have their status updated");
    }

    // Only allow updating to picked_up status
    if (newStatus !== "picked_up") {
      throw new Error("Orders can only be marked as picked up");
    }

    // Get the meal details to update quantity
    const mealDoc = await getDoc(doc(db, "meals", orderData.mealId));
    if (!mealDoc.exists()) {
      throw new Error("Meal not found");
    }

    const mealData = mealDoc.data();
    const currentQuantity = mealData.quantity || 0;
    const orderQuantity = orderData.quantity || 0;
    const newQuantity = Math.max(0, currentQuantity - orderQuantity);

    console.log(
      `Meal quantity update: ${currentQuantity} - ${orderQuantity} = ${newQuantity}`
    );

    // Update order status
    const orderRef = doc(db, "orders", orderId);
    batch.update(orderRef, {
      status: newStatus,
      pickedUpAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update meal quantity and status
    const mealRef = doc(db, "meals", orderData.mealId);
    const mealUpdates = {
      quantity: newQuantity,
      updatedAt: serverTimestamp(),
    };

    // If quantity reaches zero, mark as sold out
    if (newQuantity === 0) {
      mealUpdates.status = "sold_out";
      console.log("Meal quantity is 0, marking as sold out");
    }

    console.log("Meal updates:", mealUpdates);
    batch.update(mealRef, mealUpdates);

    await batch.commit();
    console.log("Batch committed successfully");
    return true;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// Batch operations for complex transactions
export const createOrderWithUpdates = async (orderData, mealId) => {
  const batch = writeBatch(db);

  try {
    // Create order
    const orderRef = doc(collection(db, "orders"));
    batch.set(orderRef, {
      ...orderData,
      id: orderRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update meal quantity
    const mealRef = doc(db, "meals", mealId);
    batch.update(mealRef, {
      quantity: orderData.quantity,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
    return orderRef.id;
  } catch (error) {
    console.error("Error creating order with updates:", error);
    return null;
  }
};

// Analytics and reporting
export const getVendorStats = async (vendorId) => {
  try {
    const ordersQuery = query(
      collection(db, "orders"),
      where("vendorId", "==", vendorId)
    );
    const snapshot = await getDocs(ordersQuery);
    const orders = snapshot.docs.map((doc) => doc.data());

    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.totalPrice, 0),
      completedOrders: orders.filter((order) => order.status === "picked_up")
        .length,
      cancelledOrders: orders.filter((order) => order.status === "cancelled")
        .length,
      pendingOrders: orders.filter((order) => order.status === "reserved")
        .length,
    };

    return stats;
  } catch (error) {
    console.error("Error fetching vendor stats:", error);
    return null;
  }
};

export const getCustomerStats = async (customerId) => {
  try {
    const ordersQuery = query(
      collection(db, "orders"),
      where("customerId", "==", customerId)
    );
    const snapshot = await getDocs(ordersQuery);
    const orders = snapshot.docs.map((doc) => doc.data());

    const stats = {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + order.totalPrice, 0),
      completedOrders: orders.filter((order) => order.status === "picked_up")
        .length,
      cancelledOrders: orders.filter((order) => order.status === "cancelled")
        .length,
      pendingOrders: orders.filter((order) => order.status === "reserved")
        .length,
    };

    return stats;
  } catch (error) {
    console.error("Error fetching customer stats:", error);
    return null;
  }
};

// System operations
export const getSystemSettings = async () => {
  try {
    const settingsDoc = await getDoc(doc(db, "settings", "general"));
    if (settingsDoc.exists()) {
      return settingsDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching system settings:", error);
    return null;
  }
};

// Cleanup operations
export const cleanupExpiredMeals = async () => {
  try {
    const expiredMealsQuery = query(
      collection(db, "meals"),
      where("expiresAt", "<", Timestamp.fromDate(new Date())),
      where("status", "==", "available")
    );
    const snapshot = await getDocs(expiredMealsQuery);

    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: "expired",
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
    return snapshot.docs.length;
  } catch (error) {
    console.error("Error cleaning up expired meals:", error);
    return 0;
  }
};

// Cleanup expired orders
export const cleanupExpiredOrders = async () => {
  try {
    // Find orders that are still reserved
    const ordersQuery = query(
      collection(db, "orders"),
      where("status", "==", "reserved")
    );
    const snapshot = await getDocs(ordersQuery);
    const batch = writeBatch(db);
    let expiredCount = 0;
    for (const docSnap of snapshot.docs) {
      const order = docSnap.data();
      // Fetch the meal to check its expiresAt
      if (order.mealId) {
        const mealDoc = await getDoc(doc(db, "meals", order.mealId));
        if (mealDoc.exists()) {
          const meal = mealDoc.data();
          if (
            meal.expiresAt &&
            meal.expiresAt.toDate &&
            meal.expiresAt.toDate() <= new Date()
          ) {
            batch.update(doc(db, "orders", docSnap.id), {
              status: "expired",
              updatedAt: serverTimestamp(),
            });
            expiredCount++;
          }
        }
      }
    }
    if (expiredCount > 0) {
      await batch.commit();
    }
    return expiredCount;
  } catch (error) {
    console.error("Error cleaning up expired orders:", error);
    return 0;
  }
};

const dbUtils = {
  // User operations
  getUserById,
  updateUserProfile,

  // Meal operations
  getAvailableMeals,
  getMealsByVendor,
  getMealById,
  updateMealStatus,

  // Order operations
  getOrdersByCustomer,
  getOrdersByVendor,
  getOrderById,
  createOrderWithUpdates,

  // Analytics
  getVendorStats,
  getCustomerStats,

  // System operations
  getSystemSettings,
  cleanupExpiredMeals,
  cleanupExpiredOrders,
};

export default dbUtils;

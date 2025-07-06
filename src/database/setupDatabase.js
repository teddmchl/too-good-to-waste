// Database setup script for Too Good To Waste
// Run this to initialize your Firebase Firestore database with proper structure

import { db } from "../firebase";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

// Sample data for database initialization
const sampleUsers = [
  {
    uid: "customer1",
    email: "customer1@example.com",
    username: "john_doe",
    role: "customer",
    phone: "+254712345678",
    preferences: "Vegetarian, No pork",
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
    impact: {
      mealsReserved: 0,
      mealsPickedUp: 0,
      totalSavings: 0,
    },
  },
  {
    uid: "customer2",
    email: "customer2@example.com",
    username: "jane_smith",
    role: "customer",
    phone: "+254723456789",
    preferences: "No restrictions",
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
    impact: {
      mealsReserved: 0,
      mealsPickedUp: 0,
      totalSavings: 0,
    },
  },
  {
    uid: "customer3",
    email: "customer3@example.com",
    username: "mike_wilson",
    role: "customer",
    phone: "+254756789012",
    preferences: "Vegetarian",
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
    impact: {
      mealsReserved: 0,
      mealsPickedUp: 0,
      totalSavings: 0,
    },
  },
  {
    uid: "vendor1",
    email: "vendor1@example.com",
    username: "scott_foods",
    role: "vendor",
    phone: "+254734567890",
    restaurantName: "Scott Foods",
    businessAddress: "Nairobi CBD, Kenya",
    businessType: "Restaurant",
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
    impact: {
      mealsPosted: 0,
      mealsReserved: 0,
      mealsPickedUp: 0,
      mealsWasted: 0,
      totalRevenue: 0,
    },
  },
  {
    uid: "vendor2",
    email: "vendor2@example.com",
    username: "mama_mboga",
    role: "vendor",
    phone: "+254745678901",
    restaurantName: "Mama Mboga",
    businessAddress: "Westlands, Nairobi",
    businessType: "Catering",
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
    impact: {
      mealsPosted: 0,
      mealsReserved: 0,
      mealsPickedUp: 0,
      mealsWasted: 0,
      totalRevenue: 0,
    },
  },
];

const sampleMeals = [
  {
    id: "meal1",
    vendorId: "vendor1",
    vendorName: "Scott Foods",
    title: "Chapati Pack",
    description: "Fresh homemade chapatis with vegetable curry",
    quantity: 5,
    originalPrice: 200,
    discountedPrice: 100,
    imageUrl: "/meal1.jpg",
    category: "Bread & Pastries",
    dietaryInfo: {
      vegetarian: true,
      vegan: false,
      glutenFree: false,
      spicy: false,
    },
    ingredients: ["Wheat flour", "Vegetables", "Spices"],
    allergens: ["Gluten"],
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    pickupLocation: "Nairobi CBD",
    pickupInstructions: "Pick up from main entrance",
    status: "available", // available, reserved, picked_up, expired
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: "meal2",
    vendorId: "vendor2",
    vendorName: "Mama Mboga",
    title: "Githeri Lunch Combo",
    description: "Traditional Kenyan githeri with fresh vegetables",
    quantity: 3,
    originalPrice: 150,
    discountedPrice: 75,
    imageUrl: "/meal2.jpg",
    category: "Traditional",
    dietaryInfo: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      spicy: false,
    },
    ingredients: ["Beans", "Maize", "Vegetables"],
    allergens: [],
    expiresAt: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
    pickupLocation: "Westlands",
    pickupInstructions: "Pick up from kitchen entrance",
    status: "available",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: "meal3",
    vendorId: "vendor1",
    vendorName: "Scott Foods",
    title: "Vegetarian Pilau",
    description: "Aromatic rice pilau with mixed vegetables",
    quantity: 2,
    originalPrice: 180,
    discountedPrice: 90,
    imageUrl: "/meal3.jpg",
    category: "Rice Dishes",
    dietaryInfo: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      spicy: true,
    },
    ingredients: ["Rice", "Vegetables", "Pilau spices"],
    allergens: [],
    expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
    pickupLocation: "Nairobi CBD",
    pickupInstructions: "Pick up from main entrance",
    status: "available",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
];

const sampleOrders = [
  // Customer 1 (customer1@email.com) - Has 5 orders with various statuses
  {
    id: "order1",
    customerId: "customer1",
    customerEmail: "customer1@email.com",
    username: "john_doe",
    mealId: "meal1",
    vendorId: "vendor1",
    vendorName: "Scott Foods",
    mealTitle: "Chapati Pack",
    mealImageUrl: "/meal1.jpg",
    quantity: 1,
    totalPrice: 100,
    status: "reserved",
    reservedAt: serverTimestamp(),
    pickupDeadline: new Date(Date.now() + 1 * 60 * 60 * 1000),
    paymentStatus: "pending",
    paymentMethod: "mpesa",
    mpesaTransactionId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: "order2",
    customerId: "customer1",
    customerEmail: "customer1@email.com",
    username: "john_doe",
    mealId: "meal2",
    vendorId: "vendor2",
    vendorName: "Mama Mboga",
    mealTitle: "Githeri Lunch Combo",
    mealImageUrl: "/meal2.jpg",
    quantity: 1,
    totalPrice: 75,
    status: "picked_up",
    reservedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    pickedUpAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 30 mins after reservation
    paymentStatus: "completed",
    paymentMethod: "mpesa",
    mpesaTransactionId: "MPESA123456",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
  },
  {
    id: "order3",
    customerId: "customer1",
    customerEmail: "customer1@email.com",
    username: "john_doe",
    mealId: "meal3",
    vendorId: "vendor1",
    vendorName: "Scott Foods",
    mealTitle: "Vegetarian Pilau",
    mealImageUrl: "/meal3.jpg",
    quantity: 1,
    totalPrice: 90,
    status: "cancelled",
    reservedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    cancelledAt: new Date(
      Date.now() - 5 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000
    ), // 15 mins after reservation
    paymentStatus: "refunded",
    paymentMethod: "mpesa",
    mpesaTransactionId: "MPESA789012",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
  },
  {
    id: "order4",
    customerId: "customer1",
    customerEmail: "customer1@email.com",
    username: "john_doe",
    mealId: "meal1",
    vendorId: "vendor1",
    vendorName: "Scott Foods",
    mealTitle: "Chapati Pack",
    mealImageUrl: "/meal1.jpg",
    quantity: 2,
    totalPrice: 200,
    status: "picked_up",
    reservedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    pickedUpAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // 45 mins after reservation
    paymentStatus: "completed",
    paymentMethod: "mpesa",
    mpesaTransactionId: "MPESA345678",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
  },
  {
    id: "order5",
    customerId: "customer1",
    customerEmail: "customer1@email.com",
    username: "john_doe",
    mealId: "meal2",
    vendorId: "vendor2",
    vendorName: "Mama Mboga",
    mealTitle: "Githeri Lunch Combo",
    mealImageUrl: "/meal2.jpg",
    quantity: 1,
    totalPrice: 75,
    status: "expired",
    reservedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    paymentStatus: "failed",
    paymentMethod: "mpesa",
    mpesaTransactionId: null,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(
      Date.now() - 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
    ), // 2 hours after reservation
  },

  // Customer 2 (customer2@email.com) - Has 3 orders
  {
    id: "order6",
    customerId: "customer2",
    customerEmail: "customer2@email.com",
    username: "jane_smith",
    mealId: "meal2",
    vendorId: "vendor2",
    vendorName: "Mama Mboga",
    mealTitle: "Githeri Lunch Combo",
    mealImageUrl: "/meal2.jpg",
    quantity: 1,
    totalPrice: 75,
    status: "picked_up",
    reservedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    pickedUpAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000), // 20 mins after reservation
    paymentStatus: "completed",
    paymentMethod: "mpesa",
    mpesaTransactionId: "MPESA901234",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
  },
  {
    id: "order7",
    customerId: "customer2",
    customerEmail: "customer2@email.com",
    username: "jane_smith",
    mealId: "meal3",
    vendorId: "vendor1",
    vendorName: "Scott Foods",
    mealTitle: "Vegetarian Pilau",
    mealImageUrl: "/meal3.jpg",
    quantity: 1,
    totalPrice: 90,
    status: "picked_up",
    reservedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    pickedUpAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000), // 35 mins after reservation
    paymentStatus: "completed",
    paymentMethod: "mpesa",
    mpesaTransactionId: "MPESA567890",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000),
  },
  {
    id: "order8",
    customerId: "customer2",
    customerEmail: "customer2@email.com",
    username: "jane_smith",
    mealId: "meal1",
    vendorId: "vendor1",
    vendorName: "Scott Foods",
    mealTitle: "Chapati Pack",
    mealImageUrl: "/meal1.jpg",
    quantity: 1,
    totalPrice: 100,
    status: "cancelled",
    reservedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    cancelledAt: new Date(
      Date.now() - 6 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000
    ), // 10 mins after reservation
    paymentStatus: "refunded",
    paymentMethod: "mpesa",
    mpesaTransactionId: "MPESA111222",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
  },

  // Customer 3 (customer3@email.com) - Has 2 orders
  {
    id: "order9",
    customerId: "customer3",
    customerEmail: "customer3@email.com",
    username: "mike_wilson",
    mealId: "meal1",
    vendorId: "vendor1",
    vendorName: "Scott Foods",
    mealTitle: "Chapati Pack",
    mealImageUrl: "/meal1.jpg",
    quantity: 1,
    totalPrice: 100,
    status: "picked_up",
    reservedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    pickedUpAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000), // 25 mins after reservation
    paymentStatus: "completed",
    paymentMethod: "mpesa",
    mpesaTransactionId: "MPESA333444",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
  },
  {
    id: "order10",
    customerId: "customer3",
    customerEmail: "customer3@email.com",
    mealId: "meal2",
    vendorId: "vendor2",
    vendorName: "Mama Mboga",
    mealTitle: "Githeri Lunch Combo",
    mealImageUrl: "/meal2.jpg",
    quantity: 1,
    totalPrice: 75,
    status: "reserved",
    reservedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    pickupDeadline: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    paymentStatus: "pending",
    paymentMethod: "mpesa",
    mpesaTransactionId: null,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
];

// Database setup functions
export const setupDatabase = async () => {
  try {
    console.log("Setting up database...");

    // 1. Create users collection
    console.log("Creating users...");
    for (const user of sampleUsers) {
      await setDoc(doc(db, "users", user.uid), user);
    }

    // 2. Create meals collection
    console.log("Creating meals...");
    for (const meal of sampleMeals) {
      await setDoc(doc(db, "meals", meal.id), meal);
    }

    // 3. Create orders collection
    console.log("Creating orders...");
    for (const order of sampleOrders) {
      await setDoc(doc(db, "orders", order.id), order);
    }

    // 4. Create system settings
    console.log("Creating system settings...");
    await setDoc(doc(db, "settings", "general"), {
      platformName: "Too Good To Waste",
      platformDescription: "Food redistribution platform for Nairobi",
      maxReservationTime: 60, // minutes
      pickupDeadline: 30, // minutes before expiry
      commissionRate: 0.15, // 15% commission
      minDiscount: 0.3, // 30% minimum discount
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("Database setup completed successfully!");
    return true;
  } catch (error) {
    console.error("Error setting up database:", error);
    return false;
  }
};

// Helper functions for common database operations
export const createUser = async (userData) => {
  try {
    const userRef = doc(db, "users", userData.uid);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      impact:
        userData.role === "vendor"
          ? {
              mealsPosted: 0,
              mealsReserved: 0,
              mealsPickedUp: 0,
              mealsWasted: 0,
              totalRevenue: 0,
            }
          : { mealsReserved: 0, mealsPickedUp: 0, totalSavings: 0 },
    });
    return true;
  } catch (error) {
    console.error("Error creating user:", error);
    return false;
  }
};

export const createMeal = async (mealData) => {
  try {
    const mealRef = doc(db, "meals", mealData.id);
    await setDoc(mealRef, {
      ...mealData,
      status: "available",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error creating meal:", error);
    return false;
  }
};

export const createOrder = async (orderData) => {
  try {
    const orderRef = doc(db, "orders", orderData.id);
    await setDoc(orderRef, {
      ...orderData,
      status: "reserved",
      paymentStatus: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error creating order:", error);
    return false;
  }
};

export const updateOrderStatus = async (
  orderId,
  status,
  additionalData = {}
) => {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp(),
      ...additionalData,
    });
    return true;
  } catch (error) {
    console.error("Error updating order status:", error);
    return false;
  }
};

const databaseUtils = {
  setupDatabase,
  createUser,
  createMeal,
  createOrder,
  updateOrderStatus,
};

export default databaseUtils;

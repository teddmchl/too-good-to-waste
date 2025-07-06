// Run this script to set up your Firebase database
// Usage: Import and call setupDatabase() from your app

import { setupDatabase } from "./setupDatabase";

// Function to run database setup
export const initializeDatabase = async () => {
  console.log("🚀 Starting database initialization...");

  try {
    const success = await setupDatabase();

    if (success) {
      console.log("✅ Database setup completed successfully!");
      console.log("📊 Your database now contains:");
      console.log("   - 4 sample users (2 customers, 2 vendors)");
      console.log("   - 3 sample meals");
      console.log("   - 2 sample orders");
      console.log("   - System settings");
      console.log("");
      console.log("🔗 You can now test your app with this sample data!");
    } else {
      console.log("❌ Database setup failed. Check the console for errors.");
    }

    return success;
  } catch (error) {
    console.error("❌ Error during database setup:", error);
    return false;
  }
};

// Auto-run setup if this file is executed directly
if (typeof window !== "undefined") {
  // Browser environment - expose function globally
  window.initializeDatabase = initializeDatabase;
  console.log(
    "💡 To initialize your database, run: window.initializeDatabase()"
  );
}

export default initializeDatabase;

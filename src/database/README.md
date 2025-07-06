# Firebase Database Setup

This directory contains the database setup and utility functions for the Too Good To Waste platform.

## Quick Start

### 1. Initialize Your Database

To set up your Firebase Firestore database with sample data:

1. **Open your browser console** (F12 → Console tab)
2. **Run the setup function:**
   ```javascript
   window.initializeDatabase();
   ```

### 2. What Gets Created

The setup script will create:

#### Users Collection

- **2 Customer accounts:**
  - `customer1@example.com` (Vegetarian preferences)
  - `customer2@example.com` (No restrictions)
- **2 Vendor accounts:**
  - `vendor1@example.com` (Scott Foods - Restaurant)
  - `vendor2@example.com` (Mama Mboga - Catering)

#### Meals Collection

- **3 Sample meals:**
  - Chapati Pack (Scott Foods)
  - Githeri Lunch Combo (Mama Mboga)
  - Vegetarian Pilau (Scott Foods)

#### Orders Collection

- **2 Sample orders:**
  - Reserved order (pending pickup)
  - Completed order (picked up)

#### Settings Collection

- **Platform configuration:**
  - Commission rates
  - Pickup deadlines
  - Minimum discounts

## Database Structure

### Collections Overview

1. **`users`** - User profiles (customers & vendors)
2. **`meals`** - Available meals from vendors
3. **`orders`** - Meal reservations and orders
4. **`settings`** - Platform configuration
5. **`payments`** - Payment transactions (future)
6. **`notifications`** - User notifications (future)

### Key Features

- **Real-time updates** with Firestore listeners
- **Offline support** for mobile apps
- **Security rules** to protect user data
- **Scalable structure** for future features

## Files in This Directory

- **`setupDatabase.js`** - Main setup script with sample data
- **`dbUtils.js`** - Utility functions for common operations
- **`runSetup.js`** - Simple runner for database initialization
- **`schema.md`** - Detailed database schema documentation
- **`README.md`** - This file

## Usage Examples

### Get Available Meals

```javascript
import { getAvailableMeals } from "./database/dbUtils";

const meals = await getAvailableMeals();
console.log("Available meals:", meals);
```

### Get User Profile

```javascript
import { getUserById } from "./database/dbUtils";

const user = await getUserById("customer1");
console.log("User profile:", user);
```

### Get Customer Orders

```javascript
import { getOrdersByCustomer } from "./database/dbUtils";

const orders = await getOrdersByCustomer("customer1");
console.log("Customer orders:", orders);
```

## Security Rules

Make sure to set up proper Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Anyone can read available meals
    match /meals/{mealId} {
      allow read: if true;
      allow write: if request.auth != null &&
        request.auth.uid == resource.data.vendorId;
    }

    // Users can read/write their own orders
    match /orders/{orderId} {
      allow read, write: if request.auth != null &&
        (request.auth.uid == resource.data.customerId ||
         request.auth.uid == resource.data.vendorId);
    }
  }
}
```

## Testing

After running the setup, you can test the database by:

1. **Signing in** with the sample accounts
2. **Browsing meals** on the Explore page
3. **Making reservations** as a customer
4. **Managing orders** as a vendor
5. **Checking profiles** for both user types

## Next Steps

1. **Customize sample data** in `setupDatabase.js`
2. **Add more collections** as needed
3. **Implement real-time listeners** in your components
4. **Set up proper security rules** in Firebase Console
5. **Add indexes** for better query performance

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify Firebase configuration in `firebase.js`
3. Ensure you have proper Firestore permissions
4. Check the Firebase Console for any setup issues

## Production Considerations

Before going live:

1. **Remove sample data** and use real user registration
2. **Implement proper error handling**
3. **Add data validation** rules
4. **Set up monitoring** and analytics
5. **Implement backup strategies**
6. **Add rate limiting** for API calls

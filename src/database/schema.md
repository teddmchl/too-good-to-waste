# Firebase Firestore Database Schema

## Collections Overview

### 1. `users` Collection

Stores user profiles for both customers and vendors.

**Document ID:** `{uid}` (Firebase Auth UID)

**Fields:**

```javascript
{
  uid: string,                    // Firebase Auth UID
  email: string,                  // User email
  role: 'customer' | 'vendor',    // User role
  phone: string,                  // Phone number
  preferences: string,            // Dietary preferences (customers only)
  businessName: string,           // Business name (vendors only)
  businessAddress: string,        // Business address (vendors only)
  businessType: string,           // Type of business (vendors only)
  createdAt: timestamp,           // Account creation time
  lastLogin: timestamp,           // Last login time
  impact: {                       // User impact statistics
    // For customers:
    mealsReserved: number,
    mealsPickedUp: number,
    totalSavings: number,

    // For vendors:
    mealsPosted: number,
    mealsReserved: number,
    mealsPickedUp: number,
    mealsWasted: number,
    totalRevenue: number
  }
}
```

### 2. `meals` Collection

Stores available meals posted by vendors.

**Document ID:** `{mealId}` (auto-generated or custom)

**Fields:**

```javascript
{
  id: string,                     // Meal ID
  vendorId: string,               // Vendor's UID
  vendorName: string,             // Vendor business name
  title: string,                  // Meal title
  description: string,            // Meal description
  quantity: number,               // Available quantity
  originalPrice: number,          // Original price in KES
  discountedPrice: number,        // Discounted price in KES
  imageUrl: string,               // Image URL
  category: string,               // Meal category
  dietaryInfo: {                  // Dietary information
    vegetarian: boolean,
    vegan: boolean,
    glutenFree: boolean,
    spicy: boolean
  },
  ingredients: string[],          // List of ingredients
  allergens: string[],            // List of allergens
  expiresAt: timestamp,           // Expiration time
  pickupLocation: string,         // Pickup location
  pickupInstructions: string,     // Pickup instructions
  status: 'available' | 'reserved' | 'picked_up' | 'expired',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 3. `orders` Collection

Stores meal reservations and orders.

**Document ID:** `{orderId}` (auto-generated or custom)

**Fields:**

```javascript
{
  id: string,                     // Order ID
  customerId: string,             // Customer's UID
  mealId: string,                 // Meal ID
  vendorId: string,               // Vendor's UID
  quantity: number,               // Quantity ordered
  totalPrice: number,             // Total price in KES
  status: 'reserved' | 'picked_up' | 'cancelled' | 'expired',
  reservedAt: timestamp,          // Reservation time
  pickedUpAt: timestamp,          // Pickup time (if picked up)
  pickupDeadline: timestamp,      // Pickup deadline
  paymentStatus: 'pending' | 'completed' | 'failed',
  paymentMethod: 'mpesa' | 'cash',
  mpesaTransactionId: string,     // M-PESA transaction ID
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 4. `settings` Collection

Stores platform-wide settings and configuration.

**Document ID:** `general`

**Fields:**

```javascript
{
  platformName: string,           // Platform name
  platformDescription: string,    // Platform description
  maxReservationTime: number,     // Max reservation time in minutes
  pickupDeadline: number,         // Pickup deadline in minutes before expiry
  commissionRate: number,         // Platform commission rate (0-1)
  minDiscount: number,            // Minimum discount rate (0-1)
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 5. `payments` Collection (Future)

Stores payment transaction records.

**Document ID:** `{paymentId}` (auto-generated)

**Fields:**

```javascript
{
  id: string,                     // Payment ID
  orderId: string,                // Associated order ID
  customerId: string,             // Customer UID
  vendorId: string,               // Vendor UID
  amount: number,                 // Payment amount
  method: 'mpesa' | 'cash',       // Payment method
  status: 'pending' | 'completed' | 'failed',
  mpesaTransactionId: string,     // M-PESA transaction ID
  mpesaPhoneNumber: string,       // M-PESA phone number
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 6. `notifications` Collection (Future)

Stores user notifications.

**Document ID:** `{notificationId}` (auto-generated)

**Fields:**

```javascript
{
  id: string,                     // Notification ID
  userId: string,                 // User UID
  type: 'order_update' | 'payment' | 'system',
  title: string,                  // Notification title
  message: string,                // Notification message
  read: boolean,                  // Read status
  data: object,                   // Additional data
  createdAt: timestamp
}
```

## Security Rules

### Basic Security Rules for Firestore:

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

    // Settings are read-only for authenticated users
    match /settings/{settingId} {
      allow read: if request.auth != null;
      allow write: if false; // Admin only
    }
  }
}
```

## Indexes

### Required Composite Indexes:

1. **Meals by vendor and status:**

   - Collection: `meals`
   - Fields: `vendorId` (Ascending), `status` (Ascending)

2. **Meals by expiry time:**

   - Collection: `meals`
   - Fields: `status` (Ascending), `expiresAt` (Ascending)

3. **Orders by customer:**

   - Collection: `orders`
   - Fields: `customerId` (Ascending), `createdAt` (Descending)

4. **Orders by vendor:**
   - Collection: `orders`
   - Fields: `vendorId` (Ascending), `createdAt` (Descending)

## Data Relationships

### One-to-Many Relationships:

- **User → Meals:** One vendor can have many meals
- **User → Orders:** One customer can have many orders
- **Meal → Orders:** One meal can have multiple orders (if quantity > 1)

### Foreign Key References:

- `meals.vendorId` → `users.uid`
- `orders.customerId` → `users.uid`
- `orders.vendorId` → `users.uid`
- `orders.mealId` → `meals.id`

## Best Practices

1. **Use Firebase Auth UIDs as document IDs** for user documents
2. **Implement proper indexing** for frequently queried fields
3. **Use server timestamps** for created/updated fields
4. **Implement proper security rules** to protect user data
5. **Use batch operations** for related document updates
6. **Implement offline support** with Firestore's offline persistence
7. **Use real-time listeners** for live updates
8. **Implement proper error handling** for all database operations

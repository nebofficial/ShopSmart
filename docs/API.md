# ShopSmart API Documentation

> **Base URL:** `http://localhost:5000/api`
> **Auth:** Endpoints marked 🔒 require `Authorization: Bearer <token>` header.
> Endpoints marked 👑 additionally require `role: "admin"`.

---

## Authentication

### POST `/auth/register`
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210"
}
```

**Response `201`:**
```json
{
  "_id": "64abc...",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**
- `400` — User already exists

---

### POST `/auth/login`
Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response `200`:**
```json
{
  "_id": "64abc...",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "role": "user",
  "addresses": [],
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**
- `401` — Invalid email or password
- `403` — Account has been blocked

---

### GET `/auth/profile` 🔒
Get authenticated user's full profile.

**Response `200`:** Full user object (without password)

---

### PUT `/auth/profile` 🔒
Update authenticated user's profile.

**Request Body:**
```json
{
  "name": "New Name",
  "phone": "1234567890",
  "email": "newemail@example.com"
}
```

**Response `200`:** Updated user object

---

### PUT `/auth/change-password` 🔒
Change the authenticated user's password.

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

**Response `200`:** `{ "message": "Password updated successfully" }`

**Errors:**
- `400` — Current password is incorrect

---

### POST `/auth/address` 🔒
Add a new delivery address.

**Request Body:**
```json
{
  "name": "Home",
  "phone": "9876543210",
  "street": "123 Main Street, Apt 4",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

**Response `200`:** Array of all addresses

---

### DELETE `/auth/address/:id` 🔒
Remove a delivery address by its subdocument ID.

**Response `200`:** Updated array of addresses

---

### GET `/auth/customers` 🔒👑
Get all customer users (admin only).

**Response `200`:** Array of user objects (password excluded)

---

### PUT `/auth/customers/:id/status` 🔒👑
Block or unblock a user.

**Request Body:**
```json
{ "status": "blocked" }
```

**Response `200`:** `{ "message": "User blocked" }`

---

### DELETE `/auth/customers/:id` 🔒👑
Permanently delete a user account.

**Response `200`:** `{ "message": "User deleted" }`

---

## Products

### GET `/products`
Get products with optional filtering, searching, sorting, and pagination.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | ObjectId | — | Filter by category ID |
| `minPrice` | Number | — | Minimum price filter |
| `maxPrice` | Number | — | Maximum price filter |
| `inStock` | `"true"` | — | Only products with stock > 0 |
| `featured` | `"true"` | — | Featured products only |
| `bestSeller` | `"true"` | — | Best selling products only |
| `search` | String | — | Text search in name and description |
| `sort` | String | `newest` | `price_asc`, `price_desc`, `popular`, `newest` |
| `page` | Number | `1` | Page number |
| `limit` | Number | `12` | Items per page |

**Example:** `GET /api/products?category=64abc...&minPrice=50&maxPrice=200&sort=price_asc&page=1&limit=12`

**Response `200`:**
```json
{
  "products": [
    {
      "_id": "64abc...",
      "name": "Fresh Apples",
      "description": "Crispy red apples from Himachal Pradesh",
      "price": 180,
      "discount": 10,
      "stock": 50,
      "weight": "1 kg",
      "image": "/uploads/apples.jpg",
      "category": { "_id": "64xyz...", "name": "Fruits" },
      "featured": true,
      "bestSeller": false,
      "status": "available",
      "nutrition": "52 calories per 100g, fiber, vitamin C"
    }
  ],
  "page": 1,
  "pages": 3,
  "total": 32
}
```

---

### GET `/products/:id`
Get a single product by ID with category populated.

**Response `200`:** Product object

**Errors:**
- `404` — Product not found

---

### POST `/products` 🔒👑
Create a new product. Accepts `multipart/form-data` for image upload.

**Form Fields:**
- `name` (string, required)
- `description` (string)
- `price` (number, required)
- `discount` (number, default: 0)
- `stock` (number, required)
- `weight` (string)
- `category` (ObjectId, required)
- `nutrition` (string)
- `featured` (boolean)
- `bestSeller` (boolean)
- `image` (file, jpeg/png/webp, max 5MB)

**Response `201`:** Created product object

---

### PUT `/products/:id` 🔒👑
Update an existing product. Same fields as create.

**Response `200`:** Updated product object

---

### DELETE `/products/:id` 🔒👑
Delete a product. Automatically updates category product count.

**Response `200`:** `{ "message": "Product removed" }`

---

## Categories

### GET `/categories`
List all categories sorted alphabetically.

**Response `200`:**
```json
[
  {
    "_id": "64xyz...",
    "name": "Fruits",
    "image": "🍎",
    "productCount": 6
  }
]
```

---

### GET `/categories/:id`
Get a single category.

---

### POST `/categories` 🔒👑
Create a new category.

**Request Body:**
```json
{
  "name": "Organic Foods",
  "image": "🌿"
}
```

**Errors:**
- `400` — Category already exists (duplicate name)

---

### PUT `/categories/:id` 🔒👑
Update a category.

---

### DELETE `/categories/:id` 🔒👑
Delete a category.

---

## Cart

### GET `/cart` 🔒
Get the authenticated user's cart with populated product details.

**Response `200`:**
```json
{
  "_id": "64cart...",
  "user": "64user...",
  "items": [
    {
      "product": {
        "_id": "64abc...",
        "name": "Fresh Apples",
        "price": 180,
        "discount": 10,
        "stock": 50,
        "image": "/uploads/apples.jpg"
      },
      "quantity": 2
    }
  ]
}
```

---

### POST `/cart/add` 🔒
Add a product to the cart. If the product already exists, its quantity is incremented.

**Request Body:**
```json
{
  "productId": "64abc...",
  "quantity": 1
}
```

---

### PUT `/cart/update` 🔒
Update the quantity of a cart item. Set quantity to 0 or below to remove the item.

**Request Body:**
```json
{
  "productId": "64abc...",
  "quantity": 3
}
```

---

### DELETE `/cart/remove/:productId` 🔒
Remove a specific product from the cart.

---

### DELETE `/cart/clear` 🔒
Remove all items from the cart.

---

## Orders

### POST `/orders` 🔒
Place a new order from the user's current cart. Automatically:
- Calculates pricing with discounts
- Applies delivery fee (₹40, or free if subtotal > ₹500)
- Reduces product stock
- Clears the cart

**Request Body:**
```json
{
  "address": {
    "name": "Ravi Kumar",
    "phone": "9876543210",
    "street": "123 Main St",
    "city": "Mumbai",
    "pincode": "400001"
  },
  "paymentMethod": "cod"
}
```

**Response `201`:**
```json
{
  "_id": "64order...",
  "user": "64user...",
  "items": [
    {
      "product": "64abc...",
      "name": "Fresh Apples",
      "price": 162,
      "quantity": 2,
      "image": "/uploads/apples.jpg"
    }
  ],
  "address": { ... },
  "paymentMethod": "cod",
  "subtotal": 324,
  "deliveryFee": 40,
  "total": 364,
  "status": "Pending",
  "createdAt": "2026-02-18T..."
}
```

**Errors:**
- `400` — Cart is empty

---

### GET `/orders/myorders` 🔒
Get all orders for the authenticated user, newest first.

---

### GET `/orders/:id` 🔒
Get a specific order. Accessible by the order owner or admin.

**Errors:**
- `403` — Not authorized (not owner or admin)
- `404` — Order not found

---

### GET `/orders` 🔒👑
Get all orders (admin). Supports filtering and pagination.

**Query Parameters:**
- `status` — Filter by status (e.g., `Pending`, `Shipped`)
- `page` — Page number (default: 1)
- `limit` — Items per page (default: 20)

**Response `200`:**
```json
{
  "orders": [...],
  "page": 1,
  "pages": 2,
  "total": 15
}
```

---

### PUT `/orders/:id/status` 🔒👑
Update order status. If status is `Delivered`, sets `deliveredAt` timestamp.
If status is `Cancelled`, restores product stock.

**Request Body:**
```json
{ "status": "Shipped" }
```

**Valid Statuses:** `Pending`, `Packed`, `Shipped`, `Out for Delivery`, `Delivered`, `Cancelled`

---

### GET `/orders/admin/reports` 🔒👑
Get admin analytics and reports.

**Response `200`:**
```json
{
  "totalOrders": 15,
  "deliveredOrders": 8,
  "cancelledOrders": 1,
  "pendingOrders": 3,
  "totalRevenue": 12540,
  "dailyRevenue": [
    { "_id": "2026-02-18", "revenue": 1800, "count": 3 },
    { "_id": "2026-02-17", "revenue": 2200, "count": 5 }
  ],
  "topProducts": [
    { "_id": "Fresh Apples", "totalSold": 25, "revenue": 4050 },
    { "_id": "Organic Milk", "totalSold": 18, "revenue": 1260 }
  ]
}
```

---

## Health Check

### GET `/health`
Check if the API is running.

**Response `200`:**
```json
{ "status": "OK", "message": "ShopSmart API is running" }
```

---

## Error Response Format

All errors follow a consistent format:
```json
{
  "message": "Description of what went wrong"
}
```

Common HTTP status codes:
- `400` — Bad request / validation error
- `401` — Not authenticated
- `403` — Not authorized (wrong role or blocked)
- `404` — Resource not found
- `500` — Server error

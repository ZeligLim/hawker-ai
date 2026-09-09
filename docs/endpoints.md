# Hawker API Endpoints Reference

Comprehensive documentation of all Next.js App Router API route handlers (`app/api/**/route.ts`) in the Hawker platform.

---

## Table of Contents

1. [Authentication & Authorization Model](#authentication--authorization-model)
2. [System & Health](#1-system--health)
3. [Customer Discovery & Menu Intelligence](#2-customer-discovery--menu-intelligence)
4. [Customer Ordering & Table Sessions](#3-customer-ordering--table-sessions)
5. [User Identity & Roles](#4-user-identity--roles)
6. [Stall Merchant & Kitchen Operations](#5-stall-merchant--kitchen-operations)
7. [Food Hall & Shop Owner Operations](#6-food-hall--shop-owner-operations)

---

## Authentication & Authorization Model

Hawker enforces multi-tier access control:

| Access Level | Description | Header / Context |
| :--- | :--- | :--- |
| **Public** | Accessible without authentication. | None |
| **Authenticated Customer** | Signed-in diner via Supabase Auth (or active table session). | Supabase Auth session / Bearer Token |
| **Stall Worker (`merchant`)** | User verified in `merchant_memberships` for the target stall (or owner of parent food hall). | Supabase Auth session |
| **Shop Owner (`owner`)** | User verified with `owner` or `manager` role in `restaurant_memberships`. | Supabase Auth session |

---

## 1. System & Health

### `GET /api/health`
Checks backend connectivity, runtime environment, and integration status for Supabase and OpenRouter.

- **Access Level**: Public
- **Query Parameters**: None
- **Response** `200 OK`:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-09-08T23:55:00.000Z",
    "environment": "production",
    "config": {
      "openrouter": {
        "configured": true,
        "keyPresent": true
      },
      "supabase": {
        "configured": true,
        "urlPresent": true,
        "anonKeyPresent": true
      }
    }
  }
  ```

---

## 2. Customer Discovery & Menu Intelligence

### `GET /api/search`
Searches dishes deterministically with optional keyword matching, price filters, dietary preferences, and spice level.

- **Access Level**: Public
- **Query Parameters**:
  - `query` *(string, optional)*: Keyword or natural-language query.
  - `minPrice` *(number, optional)*: Minimum price filter (e.g., `5`).
  - `maxPrice` *(number, optional)*: Maximum price filter (e.g., `15`).
  - `vegetarian` *(boolean, optional)*: `true` or `false`.
  - `halal` *(boolean, optional)*: `true` or `false`.
  - `spiceLevel` *(integer 0–5, optional)*: Target spice level.
  - `limit` *(integer 1–20, default: 10)*: Number of results.
- **Response** `200 OK`:
  ```json
  {
    "results": [
      {
        "id": "c138fd90-...",
        "stallId": "d290f1ee-...",
        "name": "Nasi Lemak Special",
        "restaurantName": "Setia Hawker Centre",
        "stallName": "Pak Mat Nasi Lemak",
        "price": 8.50,
        "isVegetarian": false,
        "isHalal": true,
        "spiceLevel": 2,
        "proteinGrams": 24,
        "imageUrl": "https://...",
        "matchScore": 48.5,
        "reasons": ["Keyword match", "Within budget", "Halal-friendly"]
      }
    ],
    "total": 1
  }
  ```

---

### `POST /api/search`
Structured JSON search endpoint matching `GET /api/search`.

- **Access Level**: Public
- **Request Body**:
  ```json
  {
    "query": "laksa",
    "maxPrice": 12.00,
    "halal": true,
    "limit": 5
  }
  ```
- **Response** `200 OK`: Same format as `GET /api/search`.

---

### `POST /api/search-intent`
Extracts structured search parameters from unstructured natural-language queries using OpenRouter and Zod validation. Direct database access is strictly forbidden from the AI boundary.

- **Access Level**: Public
- **Request Body**:
  ```json
  {
    "query": "halal noodles under RM12 not too spicy"
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "intent": {
      "query": "noodles",
      "maxPrice": 12,
      "halal": true,
      "spiceLevel": 1,
      "limit": 10
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{ "error": "A query string is required." }`
  - `500 Internal Server Error`: `{ "error": "Unable to parse search intent." }`

---

### `GET /api/outlets`
Retrieves hawker stalls (`food_outlets`) joined with their parent food hall (`restaurants`) and active menu dishes.

- **Access Level**: Public
- **Query Parameters**:
  - `slug` *(string, optional)*: Filter by food hall slug or outlet slug.
  - `id` *(UUID, optional)*: Filter by specific stall ID.
- **Response** `200 OK`:
  ```json
  {
    "outlets": [
      {
        "id": "e2a1b3...",
        "name": "Penang Char Kway Teow",
        "restaurant_id": "a1b2c3...",
        "restaurants": {
          "id": "a1b2c3...",
          "name": "Setia Hawker Centre",
          "slug": "setia-hawker-centre",
          "address": "123 Jalan Ampang, Kuala Lumpur"
        },
        "dishes": [
          {
            "id": "f4e5d6...",
            "name": "Signature Char Kway Teow",
            "price": 9.50,
            "description": "Wok-fried flat rice noodles with duck egg",
            "is_vegetarian": false,
            "is_halal": false,
            "spice_level": 2,
            "protein_grams": 22,
            "image_url": "https://...",
            "is_available": true,
            "tags": ["Noodles", "Wok Hei"],
            "customizations": []
          }
        ]
      }
    ]
  }
  ```

---

### `GET /api/hawker-centres`
Retrieves physical food halls and hawker centres (`restaurants`) with aggregated stall metrics, active dish counts, price ranges, and specialties.

- **Access Level**: Public
- **Query Parameters**:
  - `slug` *(string, optional)*: Filter by food hall slug (e.g. `lim-s-foodcourt`).
  - `search` *(string, optional)*: Filter by food hall name or city.
- **Response** `200 OK`:
  ```json
  {
    "centres": [
      {
        "id": "f4ddcb73-4e23-4156-b97e-9e5a5e54ed6f",
        "name": "Lim's Foodcourt",
        "slug": "lim-s-foodcourt",
        "address": "50 Jalan Sultan, City Centre, Kuala Lumpur",
        "rating": 4.9,
        "stallsCount": 10,
        "activeStallsCount": 1,
        "dishesCount": 1,
        "specialties": ["Spaghetti", "Western Cuisine"],
        "priceRange": {
          "min": 10.01,
          "max": 10.01,
          "currency": "MYR"
        }
      }
    ]
  }
  ```
- **Error Responses**:
  - `500 Internal Server Error`: `{ "error": "Failed to fetch hawker centres" }`

---

## 3. Customer Ordering & Table Sessions

### `POST /api/table-sessions`
Binds a customer to a physical hawker table session (typically triggered via QR scan or manual table entry).

- **Access Level**: Authenticated Customer
- **Request Body**:
  ```json
  {
    "tableId": "optional-uuid",
    "tableNumber": "12"
  }
  ```
- **Response** `201 Created`:
  ```json
  {
    "session": {
      "id": "session-uuid",
      "hawker_table_id": "table-uuid",
      "table_number": "12",
      "restaurant_id": "restaurant-uuid",
      "status": "active"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation failure.
  - `401 Unauthorized`: Authentication required.
  - `404 Not Found`: `{ "error": "Table not found." }`

---

### `POST /api/orders`
Submits a multi-stall unified order. Performs authoritative server-side pricing, calculates platform transaction cuts based on configured fee payer (Customer vs Merchant), and provisions atomic merchant order tickets.

- **Access Level**: Authenticated Customer
- **Request Body**:
  ```json
  {
    "tableSessionId": "session-uuid-optional",
    "items": [
      {
        "dishId": "dish-uuid",
        "stallId": "stall-uuid",
        "name": "Hainanese Chicken Rice",
        "price": 8.00,
        "quantity": 2,
        "customizations": ["Extra Rice"],
        "notes": "Less oil"
      }
    ],
    "paymentIntentId": "pi_optional",
    "paymentReference": "mock_pay_123"
  }
  ```
- **Response** `201 Created`:
  ```json
  {
    "orderId": "order-uuid",
    "subtotalAmount": 16.00,
    "platformFeeAmount": 0.50,
    "totalAmount": 16.50,
    "merchantPayoutAmount": 16.00,
    "feePayer": "CUSTOMER",
    "paymentIntentId": "pi_172583..."
  }
  ```

---

### `GET /api/orders`
Lists all historical and active orders placed by the authenticated customer.

- **Access Level**: Authenticated Customer
- **Query Parameters**: None
- **Response** `200 OK`:
  ```json
  {
    "orders": [
      {
        "id": "order-uuid",
        "status": "confirmed",
        "subtotal": 16.00,
        "service_fee": 0.50,
        "total": 16.50,
        "created_at": "2026-09-08T23:00:00Z",
        "merchant_orders": [
          {
            "id": "merchant-order-uuid",
            "food_outlet_id": "stall-uuid",
            "status": "preparing",
            "order_items": [...]
          }
        ]
      }
    ]
  }
  ```

---

## 4. User Identity & Roles

### `GET /api/user/roles`
Resolves permissions and role capabilities for the authenticated session across all client experiences.

- **Access Level**: Authenticated User (graceful fallback if unauthenticated)
- **Response** `200 OK`:
  ```json
  {
    "isCustomer": true,
    "hasShopOwner": true,
    "hasBooth": false,
    "shops": [
      {
        "id": "restaurant-uuid",
        "name": "Setia Hawker Centre",
        "role": "owner"
      }
    ],
    "booths": []
  }
  ```

---

## 5. Stall Merchant & Kitchen Operations

### `GET /api/owner/dishes`
Retrieves menu items for all stalls the user is authorized to manage (`merchant_memberships` or owned food halls).

- **Access Level**: Stall Merchant or Food Hall Owner
- **Response** `200 OK`:
  ```json
  {
    "dishes": [
      {
        "id": "dish-uuid",
        "food_outlet_id": "stall-uuid",
        "name": "Curry Laksa",
        "description": "Rich coconut curry with cockles and tofu puffs",
        "price": 10.00,
        "is_vegetarian": false,
        "is_halal": true,
        "spice_level": 3,
        "protein_grams": 28,
        "image_url": "https://...",
        "is_available": true,
        "tags": ["Spicy", "Noodles"],
        "customizations": []
      }
    ],
    "foodOutletIds": ["stall-uuid"]
  }
  ```

---

### `POST /api/owner/dishes`
Creates a new dish on the vendor's stall menu.

- **Access Level**: Stall Merchant
- **Request Body**:
  ```json
  {
    "foodOutletId": "stall-uuid",
    "name": "Claypot Chicken Rice",
    "description": "Cooked over charcoal flame with salted fish",
    "price": 12.00,
    "isVegetarian": false,
    "isHalal": false,
    "spiceLevel": 1,
    "proteinGrams": 30,
    "imageUrl": "https://...",
    "isAvailable": true,
    "tags": ["Claypot", "Rice"],
    "customizations": [
      { "name": "Extra Egg", "price": 1.50 }
    ]
  }
  ```
- **Response** `201 Created`: `{ "dish": { ... } }`

---

### `PATCH /api/owner/dishes/[id]`
Partially updates an existing dish (including 1-tap availability toggle, pricing, or ingredients).

- **Access Level**: Stall Merchant
- **Path Parameter**: `id` *(UUID of the dish)*
- **Request Body**: Any subset of dish fields.
- **Response** `200 OK`: `{ "dish": { ... } }`

---

### `POST /api/owner/dishes/[id]/image`
Uploads a photo for a dish using `multipart/form-data`. Uploads to Supabase Storage with an automatic base64 data URI fallback if storage policies are restrictive.

- **Access Level**: Stall Merchant
- **Path Parameter**: `id` *(UUID of the dish)*
- **Content-Type**: `multipart/form-data` (file key: `file`, max size: 5MB)
- **Response** `200 OK`:
  ```json
  {
    "imageUrl": "https://... or data:image/jpeg;base64,...",
    "dish": { ... }
  }
  ```

---

### `GET /api/owner/orders`
Retrieves live kitchen tickets (`merchant_orders`) for the vendor's stalls, including dining table session references.

- **Access Level**: Stall Merchant
- **Response** `200 OK`:
  ```json
  {
    "orders": [
      {
        "id": "merchant-order-uuid",
        "order_id": "parent-order-uuid",
        "food_outlet_id": "stall-uuid",
        "status": "pending",
        "subtotal": 24.00,
        "merchant_payout_amount": 24.00,
        "payment_status": "paid",
        "order_items": [...]
      }
    ]
  }
  ```

---

### `PATCH /api/owner/orders/[id]`
Updates the preparation lifecycle of a stall kitchen ticket.

- **Access Level**: Stall Merchant
- **Path Parameter**: `id` *(UUID of the merchant order)*
- **Request Body**:
  ```json
  {
    "status": "preparing"
  }
  ```
  *Allowed status values: `'pending'`, `'preparing'`, `'ready'`, `'completed'`, `'cancelled'*
- **Response** `200 OK`: `{ "order": { ... } }`

---

### `POST /api/owner/orders/[id]/refund`
Triggers an immediate 1-tap sold-out refund directly from the kitchen display ticket. Marks the affected dish unavailable and communicates with the payment gateway refund handler.

- **Access Level**: Stall Merchant
- **Path Parameter**: `id` *(UUID of the merchant order or parent order)*
- **Request Body**:
  ```json
  {
    "item_ids": ["order-item-uuid"],
    "reason": "Item Sold Out",
    "cancel_entire_order": false
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "success": true,
    "refundedAmount": 10.00,
    "gatewayRefundId": "re_172583...",
    "orderStatus": "partially_refunded",
    "unavailableDishes": ["dish-uuid"]
  }
  ```

---

### `GET /api/owner/booths/join`
Previews invitation metadata from a raw cryptographic token query parameter before the vendor registers or claims the booth.

- **Access Level**: Public (Token-Gated)
- **Query Parameters**:
  - `token` *(string, required)*: Plaintext invitation token.
- **Response** `200 OK`:
  ```json
  {
    "valid": true,
    "id": "invitation-uuid",
    "foodOutletId": "stall-uuid",
    "stallName": "Booth Slot #03",
    "venueName": "Setia Hawker Centre",
    "invitedEmail": "vendor@currymee.com",
    "expiresAt": "2026-09-15T23:59:59Z"
  }
  ```

---

### `POST /api/owner/booths/join`
Claims an invitation token, granting the signed-in user stall ownership in `merchant_memberships` and optionally renaming the stall.

- **Access Level**: Authenticated User
- **Request Body**:
  ```json
  {
    "token": "plaintext-token",
    "stallName": "Ah Huat Curry Mee"
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "status": "joined",
    "boothId": "stall-uuid"
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: Signed in with an email that does not match the invited email address.
  - `409 Conflict`: Invitation has already been claimed.
  - `410 Gone`: Invitation token has expired.

---

## 6. Food Hall & Shop Owner Operations

### `GET /api/owner/shops`
Lists food halls managed by the authenticated shop owner, complete with all booth slots, assigned member emails, and pending setup links.

- **Access Level**: Shop Owner (`owner` / `manager` in `restaurant_memberships`)
- **Response** `200 OK`:
  ```json
  {
    "shops": [
      {
        "id": "restaurant-uuid",
        "name": "Setia Hawker Centre",
        "slug": "setia-hawker-centre",
        "address": "123 Jalan Ampang",
        "role": "owner",
        "booths": [
          {
            "id": "stall-uuid",
            "name": "Booth Slot #01",
            "status": "active",
            "manager": "Pak Mat Nasi Lemak",
            "members": [
              {
                "userId": "user-uuid",
                "email": "pakmat@stall.com",
                "role": "owner",
                "createdAt": "2026-09-01T00:00:00Z"
              }
            ],
            "invitations": []
          }
        ]
      }
    ]
  }
  ```

---

### `POST /api/owner/shops`
Onboards a new physical hawker centre / food hall venue, provisions initial empty booth slots, and enrolls the creator in `restaurant_memberships`.

- **Access Level**: Authenticated User
- **Request Body**:
  ```json
  {
    "name": "Petaling Street Food Court",
    "slug": "petaling-street-food-court",
    "address": "Jalan Petaling, City Centre, 50000 Kuala Lumpur",
    "lat": 3.1439,
    "lng": 101.6983,
    "boothCount": 10
  }
  ```
- **Response** `201 Created` or `200 OK` (if existing venue owned):
  ```json
  {
    "shop": {
      "id": "new-restaurant-uuid",
      "name": "Petaling Street Food Court",
      "slug": "petaling-street-food-court",
      "address": "Jalan Petaling, City Centre, 50000 Kuala Lumpur",
      "role": "owner",
      "status": "approved"
    },
    "status": "created"
  }
  ```

---

### `GET /api/owner/shops/[id]`
Retrieves profile metadata for a specific food hall venue.

- **Access Level**: Shop Owner
- **Path Parameter**: `id` *(UUID of the restaurant)*
- **Response** `200 OK`:
  ```json
  {
    "shop": {
      "id": "restaurant-uuid",
      "name": "Setia Hawker Centre",
      "slug": "setia-hawker-centre",
      "address": "123 Jalan Ampang",
      "lat": 3.15,
      "lng": 101.71
    },
    "role": "owner"
  }
  ```

---

### `PATCH /api/owner/shops/[id]`
Updates venue profile attributes.

- **Access Level**: Shop Owner
- **Path Parameter**: `id` *(UUID of the restaurant)*
- **Request Body**:
  ```json
  {
    "name": "Setia Premier Hawker Centre",
    "address": "123 Jalan Ampang, Kuala Lumpur"
  }
  ```
- **Response** `200 OK`: `{ "shop": { ... }, "status": "updated" }`

---

### `POST /api/owner/booths`
Creates an empty booth slot in a managed food hall venue.

- **Access Level**: Shop Owner
- **Request Body**:
  ```json
  {
    "restaurantId": "restaurant-uuid",
    "name": "Booth Slot #11"
  }
  ```
- **Response** `201 Created`:
  ```json
  {
    "booth": {
      "id": "new-booth-uuid",
      "restaurant_id": "restaurant-uuid",
      "name": "Booth Slot #11",
      "created_at": "2026-09-08T23:55:00Z"
    },
    "status": "created"
  }
  ```

---

### `PATCH /api/owner/booths/[id]`
Renames a booth slot.

- **Access Level**: Shop Owner
- **Path Parameter**: `id` *(UUID of the booth)*
- **Request Body**:
  ```json
  {
    "name": "Booth Slot #11 (Corner Unit)"
  }
  ```
- **Response** `200 OK`: `{ "booth": { ... }, "status": "updated" }`

---

### `POST /api/owner/booths/[id]/invite`
Generates a cryptographic setup link and dispatches an invitation email to a vendor.

- **Access Level**: Shop Owner
- **Path Parameter**: `id` *(UUID of the booth slot)*
- **Request Body**:
  ```json
  {
    "email": "vendor@dimsum.com"
  }
  ```
- **Response** `201 Created`:
  ```json
  {
    "token": "raw-cryptographic-token",
    "link": "http://localhost:3000/booths/join?token=...",
    "emailSent": true,
    "provider": "resend",
    "email": "vendor@dimsum.com",
    "expiresAt": "2026-09-15T23:59:59Z",
    "status": "invited"
  }
  ```

---

### `GET /api/owner/booths/[id]/members`
Lists all active stall managers and pending invitations for a specific booth slot.

- **Access Level**: Shop Owner
- **Path Parameter**: `id` *(UUID of the booth slot)*
- **Response** `200 OK`:
  ```json
  {
    "members": [
      {
        "userId": "user-uuid",
        "email": "vendor@dimsum.com",
        "role": "owner",
        "status": "active",
        "createdAt": "2026-09-08T00:00:00Z"
      }
    ],
    "invitations": [
      {
        "id": "invite-uuid",
        "email": "pending@vendor.com",
        "status": "pending",
        "expiresAt": "2026-09-15T00:00:00Z",
        "createdAt": "2026-09-08T00:00:00Z"
      }
    ]
  }
  ```

---

### `DELETE /api/owner/booths/[id]/members`
Immediately revokes store management access for a vendor. Deletes membership from `merchant_memberships` and expires pending invitation tokens.

- **Access Level**: Shop Owner
- **Path Parameter**: `id` *(UUID of the booth slot)*
- **Request Body** (or query parameter `?email=...`):
  ```json
  {
    "email": "vendor@dimsum.com"
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "status": "removed",
    "message": "Access removed for vendor@dimsum.com"
  }
  ```

---

### `GET /api/owner/analytics`
Calculates aggregated food hall analytics, gross volume, platform fees, merchant disbursements, and stall performance metrics over configurable time horizons.

- **Access Level**: Shop Owner
- **Query Parameters**:
  - `period` *(string, optional)*:
    - `'d'`: Past 24 hours (Daily)
    - `'w'`: Past 7 days (Weekly, default)
    - `'m'`: Past 30 days (Monthly)
    - `'y'`: Past 365 days (Yearly)
- **Response** `200 OK`:
  ```json
  {
    "totalRevenue": 4820.50,
    "totalOrders": 312,
    "averageTicket": 15.45,
    "maxRevenue": 1420.00,
    "activeBoothCount": 8,
    "totalBooths": 10,
    "platformFee": 252.41,
    "merchantPayout": 4568.09,
    "booths": [
      {
        "id": "stall-uuid-1",
        "name": "Pak Mat Nasi Lemak",
        "periodOrders": 115,
        "periodRevenue": 1420.00
      },
      {
        "id": "stall-uuid-2",
        "name": "Ah Huat Curry Mee",
        "periodOrders": 98,
        "periodRevenue": 1176.00
      }
    ]
  }
  ```

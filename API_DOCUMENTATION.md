# API Documentation

## Base URL
```
Production: https://api.yourdomain.com
Development: http://localhost:5000
```

## Authentication

Most endpoints require authentication using JWT tokens.

### Headers
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "customer"
}
```

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer"
  }
}
```

### Bookings

#### Get All Bookings
```http
GET /api/bookings?page=1&limit=10
```

#### Create Booking
```http
POST /api/bookings
```

**Request Body:**
```json
{
  "serviceId": "service_id",
  "date": "2025-01-20",
  "time": "10:00",
  "notes": "Special requirements"
}
```

#### Update Booking
```http
PUT /api/bookings/:id
```

#### Delete Booking
```http
DELETE /api/bookings/:id
```

### Services

#### Get All Services
```http
GET /api/services?category=category_id&search=keyword
```

#### Get Service Details
```http
GET /api/services/:id
```

#### Create Service (Provider only)
```http
POST /api/services
```

**Request Body:**
```json
{
  "title": "Service Title",
  "description": "Service description",
  "price": 99.99,
  "category": "category_id",
  "duration": 60,
  "availability": {
    "monday": ["09:00-17:00"],
    "tuesday": ["09:00-17:00"]
  }
}
```

### Payments

#### Process Payment
```http
POST /api/payments
```

**Request Body:**
```json
{
  "bookingId": "booking_id",
  "amount": 99.99,
  "method": "card",
  "cardDetails": {
    "number": "4242424242424242",
    "expiry": "12/25",
    "cvv": "123"
  }
}
```

### Reviews

#### Get Service Reviews
```http
GET /api/reviews?serviceId=service_id
```

#### Create Review
```http
POST /api/reviews
```

**Request Body:**
```json
{
  "serviceId": "service_id",
  "bookingId": "booking_id",
  "rating": 5,
  "comment": "Excellent service!"
}
```

### Admin Endpoints

#### Get Analytics
```http
GET /api/admin/analytics
```

**Response:**
```json
{
  "totalUsers": 1234,
  "totalBookings": 5678,
  "totalRevenue": 123456.78,
  "activeServices": 89
}
```

#### Manage Users
```http
GET /api/admin/users
PUT /api/admin/users/:id
DELETE /api/admin/users/:id
```

## Error Responses

All endpoints return standard error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting

API is rate-limited to 100 requests per 15 minutes per IP address.

## Pagination

List endpoints support pagination:
```
?page=1&limit=10
```

Response includes:
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

# Backend API Requirements for GenZ Awara Travel App

## Table of Contents
1. [Overview](#overview)
2. [Authentication & User Management](#authentication--user-management)
3. [User Profile Management](#user-profile-management)

---

## Overview

This document outlines the complete backend API requirements for the GenZ Awara Travel App. The backend needs to support a comprehensive travel platform with user authentication, destination discovery, travel buddy matching, trip bookings, and social features.

**App Features:**
- User registration and authentication
- Profile management with social features
- Destination discovery and search
- Travel buddy matching system
- Trip booking and management
- Saved items and favorites
- Real-time notifications
- Social media integration

---

## Authentication & User Management

### 1.1 User Registration
**Route:** `POST /api/auth/register`

**Request Payload:**
```json
{
  "fullName": "Naman Jangir",
  "email": "hello.naman0@gmail.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "fullName": "Naman Jangir",
    "email": "hello.naman0@gmail.com",
    "username": "hey.nmn",
    "profileImage": "url",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "token": "jwt_token"
}
```

**Validation Rules:**
- Email must be unique
- Password minimum 8 characters
- Password must contain at least one uppercase, lowercase, number, and special character
- Full name is required

### 1.2 User Login
**Route:** `POST /api/auth/login`

**Request Payload:**
```json
{
  "email": "hello.naman0@gmail.com",
  "password": "securePassword123"
}
```

**Response:** Same as registration response

**Error Responses:**
- 401: Invalid credentials
- 400: Missing required fields

### 1.3 Forgot Password
**Route:** `POST /api/auth/forgot-password`

**Request Payload:**
```json
{
  "email": "hello.naman0@gmail.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### 1.4 Reset Password
**Route:** `POST /api/auth/reset-password`

**Request Payload:**
```json
{
  "token": "reset_token",
  "newPassword": "newPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### 1.5 Social Login (Google/Facebook) (Can Skip for Now)
**Route:** `POST /api/auth/social-login`

**Request Payload:**
```json
{
  "provider": "google",
  "token": "social_token",
  "userData": {
    "email": "hello.naman0@gmail.com",
    "name": "Naman Jangir",
    "picture": "profile_url"
  }
}
```

**Response:** Same as regular login response

---

## User Profile Management

### 2.1 Get User Profile
**Route:** `GET /api/profile`

**Headers:** `Authorization: Bearer token`

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "name": "Naman Jangir",
    "username": "naman_jangir",
    "email": "hello.naman0@gmail.com",
    "profileImage": "url",
    "coverImage": "url",
    "location": "Jhunjhunu, Rajasthan",
    "bio": "Travel enthusiast | Developer | Adventure seeker",
    "birthYear": "1995",
    "homeCity": "Jhunjhunu",
    "homeCountry": "India",
    "currentLocation": "Jaipur, Rajasthan",
    "languages": ["English", "Hindi"],
    "socialHandles": {
      "instagram": "@hey.nmn",
      "whatsapp": "+91 98765 43210"
    },
    "tripCount": 24,
    "photoCount": 142,
    "joinDate": "2023-05-01T00:00:00Z"
  }
}
```

### 2.2 Update User Profile
**Route:** `PUT /api/profile`

**Headers:** `Authorization: Bearer token`

**Request Payload:**
```json
{
  "name": "Updated Name",
  "username": "updated_username",
  "bio": "Updated bio",
  "birthYear": "1995",
  "homeCity": "Updated City",
  "homeCountry": "India",
  "currentLocation": "Updated Location",
  "languages": ["English", "Hindi", "Spanish"],
  "socialHandles": {
    "instagram": "@updated_handle",
    "whatsapp": "+91 7073197237"
  }
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    // Updated user object
  }
}
```

### 2.3 Upload Profile Image
**Route:** `POST /api/profile/upload-image`

**Headers:** 
- `Authorization: Bearer token`
- `Content-Type: multipart/form-data`

**Request Payload:** Form data with image file

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://storage.example.com/profile/image.jpg"
}
```

### 2.4 Upload Cover Image
**Route:** `POST /api/profile/upload-cover`

**Headers:** 
- `Authorization: Bearer token`
- `Content-Type: multipart/form-data`

**Request Payload:** Form data with image file

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://storage.example.com/cover/image.jpg"
}
```

---

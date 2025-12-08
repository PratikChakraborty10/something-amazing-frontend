# Backend API Documentation - Authentication & Profile

> API Base URL: `http://localhost:8000/api`

---

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

---

## Endpoints

### POST `/auth/signup`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | ✅ | Valid email format |
| password | string | ✅ | Min 8 characters |
| firstName | string | ❌ | - |
| lastName | string | ❌ | - |

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "session": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "refresh-token-here",
    "expiresIn": 3600,
    "expiresAt": 1702012345
  }
}
```

**Error Responses:**
- `400` - Validation errors (invalid email, password too short)
- `409` - User with this email already exists

---

### POST `/auth/signin`

Authenticate an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "session": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "refresh-token-here",
    "expiresIn": 3600,
    "expiresAt": 1702012345
  }
}
```

**Error Responses:**
- `400` - Validation errors
- `401` - Invalid credentials

---

### GET `/auth/me`

Get the current authenticated user's profile. **Requires authentication.**

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": null,
  "company": null,
  "avatarUrl": null,
  "notifyCampaignReports": false,
  "notifyWeeklyDigest": false,
  "notifyProductUpdates": false,
  "createdAt": "2024-12-07T00:00:00.000Z",
  "updatedAt": "2024-12-07T00:00:00.000Z"
}
```

**Error Responses:**
- `401` - Unauthorized (missing/invalid token)

---

### GET `/profile`

Get the current user's full profile. **Requires authentication.**

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):** Same as `/auth/me`

---

### PATCH `/profile`

Update the current user's profile. **Requires authentication.**

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phoneNumber": "+1 555 000-0000",
  "company": "Acme Inc",
  "avatarUrl": "https://example.com/avatar.jpg",
  "notifyCampaignReports": true,
  "notifyWeeklyDigest": true,
  "notifyProductUpdates": false
}
```

| Field | Type | Validation |
|-------|------|------------|
| firstName | string | - |
| lastName | string | - |
| phoneNumber | string | - |
| company | string | - |
| avatarUrl | string | Valid URL |
| notifyCampaignReports | boolean | - |
| notifyWeeklyDigest | boolean | - |
| notifyProductUpdates | boolean | - |

**Success Response (200):** Returns updated profile object

**Error Responses:**
- `400` - Validation errors
- `401` - Unauthorized
- `404` - Profile not found

---

## Error Response Format

All errors follow this structure:
```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Invalid credentials",
  "timestamp": "2024-12-07T00:00:00.000Z"
}
```

---

## Token Management

- **Access Token**: JWT issued by Supabase, expires in ~1 hour
- **Refresh Token**: Used to get new access tokens
- Store `accessToken` securely (memory or httpOnly cookie)
- Include token in `Authorization: Bearer <token>` header for protected routes


---

# Frontend Authentication Implementation Prompt

You are implementing authentication for a Next.js 16 email marketing SaaS application. The backend API is built with NestJS and uses Supabase Auth for authentication.

---

## Backend API Details

**Base URL:** `http://localhost:3001/api`

### Available Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/auth/signup` | ❌ | Register new user |
| POST | `/auth/signin` | ❌ | Login user |
| GET | `/auth/me` | ✅ | Get current user |
| GET | `/profile` | ✅ | Get user profile |
| PATCH | `/profile` | ✅ | Update profile |

### Authentication Header
For protected endpoints, include:
```
Authorization: Bearer <access_token>
```

---

## Implementation Requirements

### 1. Auth Context/Provider

Create an authentication context that:
- Stores the current user and access token
- Provides `signUp`, `signIn`, `signOut` functions
- Persists token to localStorage or secure cookie
- Auto-fetches user profile on app load if token exists
- Handles token expiration gracefully

### 2. Signup Flow

**Endpoint:** `POST /api/auth/signup`

**Request:**
```typescript
interface SignupRequest {
  email: string;
  password: string;      // min 8 characters
  firstName?: string;
  lastName?: string;
}
```

**Response:**
```typescript
interface SignupResponse {
  message: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  session: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    expiresAt: number;
  } | null;  // null if email confirmation required
}
```

**UI Requirements:**
- Email and password fields (password min 8 chars)
- Optional first name and last name fields
- Show validation errors from API (400 response)
- Handle "email already exists" error (409 response)
- On success, store token and redirect to dashboard

### 3. Signin Flow

**Endpoint:** `POST /api/auth/signin`

**Request:**
```typescript
interface SigninRequest {
  email: string;
  password: string;
}
```

**Response:**
```typescript
interface SigninResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  session: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    expiresAt: number;
  };
}
```

**UI Requirements:**
- Email and password fields
- "Forgot password" link (can be placeholder)
- Handle invalid credentials error (401 response)
- On success, store token and redirect to dashboard

### 4. Profile Page (`/settings/profile`)

**GET Profile:** `GET /api/profile`
**Update Profile:** `PATCH /api/profile`

**Profile Fields:**
```typescript
interface Profile {
  id: string;
  email: string;           // read-only
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  company: string | null;
  avatarUrl: string | null;
  
  // Notification Preferences (default false)
  notifyCampaignReports: boolean;
  notifyWeeklyDigest: boolean;
  notifyProductUpdates: boolean;
  
  createdAt: string;
  updatedAt: string;
}
```

**Update Request (all fields optional):**
```typescript
interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  company?: string;
  avatarUrl?: string;
  notifyCampaignReports?: boolean;
  notifyWeeklyDigest?: boolean;
  notifyProductUpdates?: boolean;
}
```

**UI Requirements per screenshot:**
- Personal Information section:
  - Avatar upload/change button
  - First Name, Last Name (text inputs)
  - Email Address (read-only)
  - Phone Number (text input)
  - Company (text input)
  - "Save Changes" button
- Notification Preferences section:
  - Campaign Reports toggle
  - Weekly Digest toggle
  - Product Updates toggle
- Danger Zone section:
  - Delete Account button (can be placeholder)

### 5. Protected Routes

Create a higher-order component or middleware that:
- Checks for valid token before rendering protected pages
- Redirects to `/login` if no token
- Fetches user via `GET /api/auth/me` to validate token
- Shows loading state while checking auth

### 6. API Utility

Create a fetch wrapper that:
- Adds `Content-Type: application/json` header
- Adds `Authorization: Bearer <token>` for authenticated requests
- Handles 401 responses by clearing token and redirecting to login
- Parses JSON responses and errors consistently

```typescript
// Example usage
const api = {
  async post<T>(url: string, data: object): Promise<T>,
  async get<T>(url: string): Promise<T>,
  async patch<T>(url: string, data: object): Promise<T>,
}
```

---

## Error Handling

API errors return:
```typescript
interface ApiError {
  statusCode: number;
  error: string;
  message: string | string[];  // array for validation errors
  timestamp: string;
}
```

Display errors using toast notifications (sonner).

---

## Tech Stack Reference

- **Framework:** Next.js 16 with App Router
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Toasts:** sonner
- **Icons:** lucide-react

---

## File Structure Suggestion

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── signup/
│       └── page.tsx
├── (settings)/
├── settings/
│   └── profile/
│       └── page.tsx
lib/
├── api.ts           # API utility functions
├── auth-context.tsx # Auth provider & hooks
hooks/
├── use-auth.ts      # Auth hook
├── use-profile.ts   # Profile fetching hook
```

---

## Testing Checklist

- [ ] Can register new user with valid data
- [ ] Shows error for duplicate email
- [ ] Shows validation errors for short password
- [ ] Can login with correct credentials
- [ ] Shows error for wrong password
- [ ] Token is stored after login
- [ ] Protected routes redirect if not authenticated
- [ ] Profile page loads user data
- [ ] Can update profile fields
- [ ] Notification toggles work
- [ ] Logout clears token and redirects

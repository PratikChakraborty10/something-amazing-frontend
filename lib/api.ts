// ============================================================================
// API Service Layer - Auth & Profile
// ============================================================================

// Types
export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface Profile extends User {
  phoneNumber: string | null;
  company: string | null;
  avatarUrl: string | null;
  notifyCampaignReports: boolean;
  notifyWeeklyDigest: boolean;
  notifyProductUpdates: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
}

export interface SignInResponse {
  user: User;
  session: Session;
}

export interface SignUpResponse {
  message: string;
  user: User;
  session: Session | null;
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  company?: string;
  avatarUrl?: string;
  notifyCampaignReports?: boolean;
  notifyWeeklyDigest?: boolean;
  notifyProductUpdates?: boolean;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<SignInResponse> {
  const response = await fetch("/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as ApiError;
    const message = Array.isArray(error.message)
      ? error.message.join(", ")
      : error.message || "Failed to sign in";
    throw new Error(message);
  }

  return data;
}

/**
 * Sign up a new user
 */
export async function signUp(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
): Promise<SignUpResponse> {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, firstName, lastName }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as ApiError;
    const message = Array.isArray(error.message)
      ? error.message.join(", ")
      : error.message || "Failed to sign up";
    throw new Error(message);
  }

  return data;
}

/**
 * Get current user profile
 */
export async function getProfile(accessToken: string): Promise<Profile> {
  const response = await fetch("/api/profile", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as ApiError;
    const message = Array.isArray(error.message)
      ? error.message.join(", ")
      : error.message || "Failed to get profile";
    throw new Error(message);
  }

  return data;
}

/**
 * Update user profile
 */
export async function updateProfile(
  accessToken: string,
  data: UpdateProfileRequest
): Promise<Profile> {
  const response = await fetch("/api/profile", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const error = responseData as ApiError;
    const message = Array.isArray(error.message)
      ? error.message.join(", ")
      : error.message || "Failed to update profile";
    throw new Error(message);
  }

  return responseData;
}

/**
 * Get current authenticated user (from /auth/me)
 */
export async function getCurrentUser(accessToken: string): Promise<User> {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as ApiError;
    const message = Array.isArray(error.message)
      ? error.message.join(", ")
      : error.message || "Failed to get user";
    throw new Error(message);
  }

  return data;
}

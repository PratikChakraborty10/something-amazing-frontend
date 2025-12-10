// ============================================================================
// API Service Layer - Auth & Profile
// ============================================================================

import { authenticatedFetch } from "./api-client";

// ============================================================================
// Types
// ============================================================================

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
// Error Handling (local to this module)
// ============================================================================

function parseApiError(data: unknown, fallback: string): string {
  const error = data as ApiError;
  const message = Array.isArray(error.message)
    ? error.message.join(", ")
    : error.message || fallback;
  return message;
}

// ============================================================================
// Public API Functions
// ============================================================================

/**
 * Sign in with email and password
 * Note: Does NOT use authenticated fetch (no token yet)
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
    throw new Error(parseApiError(data, "Failed to sign in"));
  }

  return data;
}

/**
 * Sign up a new user
 * Note: Does NOT use authenticated fetch (no token yet)
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
    throw new Error(parseApiError(data, "Failed to sign up"));
  }

  return data;
}

/**
 * Get current user profile
 * Uses authenticatedFetch for automatic 401 handling.
 */
export async function getProfile(accessToken: string): Promise<Profile> {
  const response = await authenticatedFetch("/api/profile", accessToken);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to get profile"));
  }

  return data;
}

/**
 * Update user profile
 * Uses authenticatedFetch for automatic 401 handling.
 */
export async function updateProfile(
  accessToken: string,
  updateData: UpdateProfileRequest
): Promise<Profile> {
  const response = await authenticatedFetch("/api/profile", accessToken, {
    method: "PATCH",
    body: JSON.stringify(updateData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to update profile"));
  }

  return data;
}

/**
 * Get current authenticated user (from /auth/me)
 * Uses authenticatedFetch for automatic 401 handling.
 */
export async function getCurrentUser(accessToken: string): Promise<User> {
  const response = await authenticatedFetch("/api/auth/me", accessToken);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to get user"));
  }

  return data;
}


// ============================================================================
// API Service Layer - Domains
// ============================================================================

import { authenticatedFetch } from "./api-client";

// ============================================================================
// Types
// ============================================================================

// Backend response includes additional fields
export interface BackendDomainResponse {
  id: string;
  userId: string;
  domain: string;
  verificationToken: string;
  dkimTokens: string[];
  verificationStatus: DomainStatus;
  dkimVerificationStatus: DomainStatus;
  isDefault: boolean;
  lastCheckedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DomainVerificationResponse {
  domain: string;
  verificationToken: string;
  dkimTokens: string[];
  verificationStatus: DomainStatus;
  dkimVerificationStatus: DomainStatus;
}

export type DomainStatus =
  | "Pending"
  | "Success"
  | "Failed"
  | "TemporaryFailure"
  | "NotStarted";

// ============================================================================
// Local Utilities
// ============================================================================

interface ApiError {
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp: string;
}

function parseApiError(data: unknown, fallback: string): string {
  const error = data as ApiError;
  const message = Array.isArray(error.message)
    ? error.message.join(", ")
    : error.message || fallback;
  return message;
}

// ============================================================================
// Domains API
// ============================================================================

/**
 * List all domains
 * Handles both string array and full domain object array responses from backend
 */
export async function listDomains(accessToken: string): Promise<BackendDomainResponse[]> {
  const response = await authenticatedFetch("/api/domains", accessToken);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to list domains"));
  }

  // Backend might return array of strings or array of objects
  // If it's an array of strings, we need to handle that case
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
    // Convert string array to basic domain objects
    return data.map((domainName: string) => ({
      id: domainName,
      userId: '',
      domain: domainName,
      verificationToken: '',
      dkimTokens: [],
      verificationStatus: 'Pending' as DomainStatus,
      dkimVerificationStatus: 'Pending' as DomainStatus,
      isDefault: false,
      lastCheckedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  // Return array of domain objects
  return data;
}

/**
 * Verify a new domain
 * Initiates the verification process and returns DNS records to configure.
 */
export async function verifyDomain(
  accessToken: string,
  domain: string
): Promise<BackendDomainResponse> {
  const response = await authenticatedFetch("/api/domains", accessToken, {
    method: "POST",
    body: JSON.stringify({ domain }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to verify domain"));
  }

  return data;
}

/**
 * Get domain verification status
 * Check the current verification status of a specific domain.
 * @param domainId - The UUID of the domain (not the domain name string)
 */
export async function getDomainStatus(
  accessToken: string,
  domainId: string
): Promise<BackendDomainResponse> {
  const response = await authenticatedFetch(
    `/api/domains/${encodeURIComponent(domainId)}`,
    accessToken
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to get domain status"));
  }

  return data;
}

/**
 * Delete a domain
 * Remove a domain from AWS SES.
 * @param domainId - The UUID of the domain (not the domain name string)
 */
export async function deleteDomain(
  accessToken: string,
  domainId: string
): Promise<{ message: string }> {
  const response = await authenticatedFetch(
    `/api/domains/${encodeURIComponent(domainId)}`,
    accessToken,
    {
      method: "DELETE",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to delete domain"));
  }

  return data;
}

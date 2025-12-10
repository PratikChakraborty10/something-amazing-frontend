// ============================================================================
// API Service Layer - Contacts & Contact Lists
// ============================================================================

import { authenticatedFetch } from "./api-client";

// ============================================================================
// Types
// ============================================================================

export type DedupeStrategy = "keepFirst" | "keepLast" | "merge";
export type ContactStatus = "valid" | "invalid" | "duplicate";
export type ContactStatusFilter = "all" | "valid" | "invalid" | "duplicate";
export type SortBy = "email" | "createdAt" | "updatedAt";
export type SortOrder = "asc" | "desc";

export interface Contact {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  role: string | null;
  tags: string[];
  customMeta: Record<string, string>;
  status: ContactStatus;
  validationErrors: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ContactList {
  id: string;
  name: string;
  description: string | null;
  tags: string[];
  contactCount: number;
  validCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ContactStats {
  total: number;
  valid: number;
  invalid: number;
  duplicate: number;
  topDomains: Array<{ domain: string; count: number }>;
}

// Request DTOs
export interface CreateContactRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  role?: string;
  tags?: string[];
  customMeta?: Record<string, string>;
}

export interface UpdateContactRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  role?: string;
  tags?: string[];
  customMeta?: Record<string, string>;
}

export interface BulkImportRequest {
  contacts: CreateContactRequest[];
  dedupeStrategy: DedupeStrategy;
}

export interface BulkImportResponse {
  imported: number;
  skipped: number;
  duplicates: number;
  contacts: Contact[];
  errors: Array<{ row: number; email: string; reason: string }>;
}

export interface ListContactsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContactStatusFilter;
  domain?: string;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}

export interface ListContactsResponse {
  contacts: Contact[];
  pagination: Pagination;
}

export interface CreateListRequest {
  name: string;
  description?: string;
  tags?: string[];
  contactIds?: string[];
}

export interface UpdateListRequest {
  name?: string;
  description?: string;
  tags?: string[];
}

export interface ContactListWithContacts extends ContactList {
  contacts?: {
    data: Contact[];
    pagination: Pagination;
  };
}

// ============================================================================
// Local Utilities (Single Responsibility - only used by this module)
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

function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

// ============================================================================
// Contacts API
// ============================================================================

/**
 * Create a single contact
 * Uses authenticatedFetch for automatic 401 handling.
 */
export async function createContact(
  accessToken: string,
  contactData: CreateContactRequest
): Promise<Contact> {
  const response = await authenticatedFetch("/api/contacts", accessToken, {
    method: "POST",
    body: JSON.stringify(contactData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to create contact"));
  }

  return data;
}

/**
 * Bulk import contacts
 * Uses authenticatedFetch for automatic 401 handling.
 */
export async function bulkImportContacts(
  accessToken: string,
  importData: BulkImportRequest
): Promise<BulkImportResponse> {
  const response = await authenticatedFetch("/api/contacts/bulk", accessToken, {
    method: "POST",
    body: JSON.stringify(importData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to import contacts"));
  }

  return data;
}

/**
 * Get paginated list of contacts with filters
 * Uses authenticatedFetch for automatic 401 handling.
 */
export async function getContacts(
  accessToken: string,
  query?: ListContactsQuery
): Promise<ListContactsResponse> {
  const queryString = buildQueryString((query || {}) as Record<string, unknown>);
  const response = await authenticatedFetch(`/api/contacts${queryString}`, accessToken);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to get contacts"));
  }

  return data;
}

/**
 * Get contact statistics
 * Uses authenticatedFetch for automatic 401 handling.
 */
export async function getContactStats(
  accessToken: string
): Promise<ContactStats> {
  const response = await authenticatedFetch("/api/contacts/stats", accessToken);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to get contact stats"));
  }

  return data;
}

/**
 * Get a single contact by ID
 * Uses authenticatedFetch for automatic 401 handling.
 */
export async function getContact(
  accessToken: string,
  id: string
): Promise<Contact> {
  const response = await authenticatedFetch(`/api/contacts/${id}`, accessToken);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to get contact"));
  }

  return data;
}

/**
 * Update a contact
 * Uses authenticatedFetch for automatic 401 handling.
 */
export async function updateContact(
  accessToken: string,
  id: string,
  updateData: UpdateContactRequest
): Promise<Contact> {
  const response = await authenticatedFetch(`/api/contacts/${id}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify(updateData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to update contact"));
  }

  return data;
}

/**
 * Delete a single contact
 * Uses authenticatedFetch for automatic 401 handling.
 */
export async function deleteContact(
  accessToken: string,
  id: string
): Promise<void> {
  const response = await authenticatedFetch(`/api/contacts/${id}`, accessToken, {
    method: "DELETE",
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(parseApiError(data, "Failed to delete contact"));
  }
}

/**
 * Delete multiple contacts
 * Uses authenticatedFetch for automatic 401 handling.
 */
export async function deleteContacts(
  accessToken: string,
  ids: string[]
): Promise<{ deleted: number; message: string }> {
  const response = await authenticatedFetch("/api/contacts/bulk-delete", accessToken, {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to delete contacts"));
  }

  return data;
}

// ============================================================================
// Contact Lists API
// ============================================================================

/**
 * Create a new contact list
 * Uses authenticatedFetch for automatic 401 handling.
 */
export async function createContactList(
  accessToken: string,
  listData: CreateListRequest
): Promise<ContactList> {
  const response = await authenticatedFetch("/api/contact-lists", accessToken, {
    method: "POST",
    body: JSON.stringify(listData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to create contact list"));
  }

  return data;
}

/**
 * Get all contact lists
 * Uses authenticatedFetch for automatic 401 handling.
 */
export async function getContactLists(
  accessToken: string,
  search?: string
): Promise<{ lists: ContactList[] }> {
  const queryString = search ? `?search=${encodeURIComponent(search)}` : "";
  const response = await authenticatedFetch(`/api/contact-lists${queryString}`, accessToken);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to get contact lists"));
  }

  return data;
}

/**
 * Get a single contact list by ID
 * Uses authenticatedFetch for automatic 401 handling.
 */
export async function getContactList(
  accessToken: string,
  id: string,
  options?: { includeContacts?: boolean; page?: number; limit?: number }
): Promise<ContactListWithContacts> {
  const queryString = buildQueryString((options || {}) as Record<string, unknown>);
  const response = await authenticatedFetch(`/api/contact-lists/${id}${queryString}`, accessToken);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to get contact list"));
  }

  return data;
}

/**
 * Update a contact list
 * Uses authenticatedFetch for automatic 401 handling.
 */
export async function updateContactList(
  accessToken: string,
  id: string,
  updateData: UpdateListRequest
): Promise<ContactList> {
  const response = await authenticatedFetch(`/api/contact-lists/${id}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify(updateData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to update contact list"));
  }

  return data;
}

/**
 * Delete a contact list
 * Uses authenticatedFetch for automatic 401 handling.
 */
export async function deleteContactList(
  accessToken: string,
  id: string
): Promise<void> {
  const response = await authenticatedFetch(`/api/contact-lists/${id}`, accessToken, {
    method: "DELETE",
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(parseApiError(data, "Failed to delete contact list"));
  }
}

/**
 * Add contacts to a list
 * Uses authenticatedFetch for automatic 401 handling.
 */
export async function addContactsToList(
  accessToken: string,
  listId: string,
  contactIds: string[]
): Promise<{ added: number; alreadyInList: number }> {
  const response = await authenticatedFetch(`/api/contact-lists/${listId}/contacts`, accessToken, {
    method: "POST",
    body: JSON.stringify({ contactIds }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to add contacts to list"));
  }

  return data;
}

/**
 * Remove contacts from a list
 * Uses authenticatedFetch for automatic 401 handling.
 */
export async function removeContactsFromList(
  accessToken: string,
  listId: string,
  contactIds: string[]
): Promise<{ removed: number }> {
  const response = await authenticatedFetch(`/api/contact-lists/${listId}/contacts`, accessToken, {
    method: "DELETE",
    body: JSON.stringify({ contactIds }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to remove contacts from list"));
  }

  return data;
}

/**
 * Export a contact list as CSV
 * Uses authenticatedFetch for automatic 401 handling.
 */
export async function exportContactList(
  accessToken: string,
  listId: string,
  listName: string
): Promise<void> {
  const response = await authenticatedFetch(`/api/contact-lists/${listId}/export`, accessToken);

  if (!response.ok) {
    const data = await response.json();
    throw new Error(parseApiError(data, "Failed to export contact list"));
  }

  // Download the CSV file
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${listName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}



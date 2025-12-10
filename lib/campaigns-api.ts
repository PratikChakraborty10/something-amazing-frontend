// ============================================================================
// API Service Layer - Campaigns & Email Templates
// ============================================================================

import { authenticatedFetch } from "./api-client";

// ============================================================================
// Types
// ============================================================================

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "paused"
  | "failed";

export type SendType = "now" | "scheduled";

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  preheader: string | null;
  senderName: string;
  senderEmail: string;
  replyTo: string | null;
  status: CampaignStatus;
  sendType: SendType;
  scheduledAt: string | null;
  sentAt: string | null;
  htmlContent: string | null;
  templateId: string | null;
  recipients: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  createdAt: string;
  updatedAt: string;
  listName: string;
  lists?: Array<{ id: string; name: string }>;
}

export interface CampaignStats {
  totalCampaigns: number;
  drafts: number;
  scheduled: number;
  sent: number;
  avgOpenRate: number;
  avgClickRate: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListCampaignsResponse {
  data: Campaign[];
  pagination: Pagination;
  stats: CampaignStats;
}

export interface CreateCampaignRequest {
  name: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  description?: string;
  preheader?: string;
  replyTo?: string;
  sendType?: SendType;
  scheduledAt?: string;
  selectedListIds?: string[];
}

export interface UpdateCampaignRequest {
  name?: string;
  subject?: string;
  senderName?: string;
  senderEmail?: string;
  description?: string;
  preheader?: string;
  replyTo?: string;
  sendType?: SendType;
  scheduledAt?: string;
  selectedListIds?: string[];
  htmlContent?: string;
  templateId?: string;
}

export interface ListCampaignsQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface CampaignAnalytics {
  campaignId: string;
  overview: {
    recipients: number;
    delivered: number;
    deliveryRate: number;
    opened: number;
    openRate: number;
    clicked: number;
    clickRate: number;
    bounced: number;
    bounceRate: number;
    complained: number;
    complaintRate: number;
  };
  timeline: Array<{
    timestamp: string;
    event: string;
    count: number;
  }>;
}

// Email Template Types
export interface EmailTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  thumbnail: string | null;
  content?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ListTemplatesResponse {
  data: EmailTemplate[];
}

// ============================================================================
// Local Utilities
// ============================================================================

interface ApiError {
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp?: string;
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
// Campaigns API
// ============================================================================

/**
 * Get paginated list of campaigns with filters and stats
 */
export async function getCampaigns(
  accessToken: string,
  query?: ListCampaignsQuery
): Promise<ListCampaignsResponse> {
  const queryString = buildQueryString((query || {}) as Record<string, unknown>);
  const response = await authenticatedFetch(`/api/campaigns${queryString}`, accessToken);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to get campaigns"));
  }

  return data;
}

/**
 * Get a single campaign by ID
 */
export async function getCampaign(
  accessToken: string,
  id: string
): Promise<Campaign> {
  const response = await authenticatedFetch(`/api/campaigns/${id}`, accessToken);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to get campaign"));
  }

  return data;
}

/**
 * Create a new campaign (always created as draft)
 */
export async function createCampaign(
  accessToken: string,
  campaignData: CreateCampaignRequest
): Promise<Campaign> {
  const response = await authenticatedFetch("/api/campaigns", accessToken, {
    method: "POST",
    body: JSON.stringify(campaignData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to create campaign"));
  }

  return data;
}

/**
 * Update an existing draft campaign
 */
export async function updateCampaign(
  accessToken: string,
  id: string,
  updateData: UpdateCampaignRequest
): Promise<Campaign> {
  const response = await authenticatedFetch(`/api/campaigns/${id}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify(updateData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to update campaign"));
  }

  return data;
}

/**
 * Delete a draft campaign
 */
export async function deleteCampaign(
  accessToken: string,
  id: string
): Promise<void> {
  const response = await authenticatedFetch(`/api/campaigns/${id}`, accessToken, {
    method: "DELETE",
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(parseApiError(data, "Failed to delete campaign"));
  }
}

/**
 * Duplicate an existing campaign
 */
export async function duplicateCampaign(
  accessToken: string,
  id: string
): Promise<Campaign> {
  const response = await authenticatedFetch(`/api/campaigns/${id}/duplicate`, accessToken, {
    method: "POST",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to duplicate campaign"));
  }

  return data;
}

/**
 * Send a campaign immediately
 */
export async function sendCampaign(
  accessToken: string,
  id: string
): Promise<Campaign> {
  const response = await authenticatedFetch(`/api/campaigns/${id}/send`, accessToken, {
    method: "POST",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to send campaign"));
  }

  return data;
}

/**
 * Schedule a campaign for later
 */
export async function scheduleCampaign(
  accessToken: string,
  id: string,
  scheduledAt: string
): Promise<Campaign> {
  const response = await authenticatedFetch(`/api/campaigns/${id}/schedule`, accessToken, {
    method: "POST",
    body: JSON.stringify({ scheduledAt }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to schedule campaign"));
  }

  return data;
}

/**
 * Pause a sending or scheduled campaign
 */
export async function pauseCampaign(
  accessToken: string,
  id: string
): Promise<Campaign> {
  const response = await authenticatedFetch(`/api/campaigns/${id}/pause`, accessToken, {
    method: "POST",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to pause campaign"));
  }

  return data;
}

/**
 * Resume a paused campaign
 */
export async function resumeCampaign(
  accessToken: string,
  id: string
): Promise<Campaign> {
  const response = await authenticatedFetch(`/api/campaigns/${id}/resume`, accessToken, {
    method: "POST",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to resume campaign"));
  }

  return data;
}

/**
 * Get campaign analytics
 */
export async function getCampaignAnalytics(
  accessToken: string,
  id: string
): Promise<CampaignAnalytics> {
  const response = await authenticatedFetch(`/api/campaigns/${id}/analytics`, accessToken);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to get campaign analytics"));
  }

  return data;
}

/**
 * Send a test email
 */
export async function sendTestEmail(
  accessToken: string,
  id: string,
  recipientEmail: string
): Promise<{ message: string; recipientEmail: string }> {
  const response = await authenticatedFetch(`/api/campaigns/${id}/test`, accessToken, {
    method: "POST",
    body: JSON.stringify({ recipientEmail }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to send test email"));
  }

  return data;
}

// ============================================================================
// Email Templates API
// ============================================================================

/**
 * Get list of email templates
 */
export async function getEmailTemplates(
  accessToken: string,
  options?: { category?: string; search?: string }
): Promise<ListTemplatesResponse> {
  const queryString = buildQueryString((options || {}) as Record<string, unknown>);
  const response = await authenticatedFetch(`/api/email-templates${queryString}`, accessToken);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to get email templates"));
  }

  return data;
}

/**
 * Get email template categories
 */
export async function getEmailTemplateCategories(
  accessToken: string
): Promise<string[]> {
  const response = await authenticatedFetch("/api/email-templates/categories", accessToken);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to get template categories"));
  }

  return data;
}

/**
 * Get a single email template with content
 */
export async function getEmailTemplate(
  accessToken: string,
  id: string
): Promise<EmailTemplate> {
  const response = await authenticatedFetch(`/api/email-templates/${id}`, accessToken);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(parseApiError(data, "Failed to get email template"));
  }

  return data;
}

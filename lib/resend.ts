import { Resend } from "resend";

// Initialize Resend with API key from environment
export const resend = new Resend(process.env.RESEND_API_KEY);

// Domain types matching Resend API
export interface ResendDomain {
  id: string;
  name: string;
  status: "not_started" | "pending" | "verified" | "failed" | "temporary_failure";
  created_at: string;
  region: string;
  records: ResendDnsRecord[];
}

export interface ResendDnsRecord {
  record: string;
  name: string;
  type: string;
  ttl: string;
  status: "not_started" | "pending" | "verified" | "failed" | "temporary_failure";
  value: string;
  priority?: number;
}

// Normalized domain type for frontend
export interface Domain {
  id: string;
  domain: string;
  status: "verified" | "pending" | "failed";
  createdAt: string;
  region: string;
  records: DnsRecord[];
}

export interface DnsRecord {
  type: string;
  name: string;
  value: string;
  ttl: string;
  status: "verified" | "pending" | "failed";
  priority?: number;
}

// Normalize Resend status to simple status
export function normalizeStatus(
  status: ResendDomain["status"]
): Domain["status"] {
  switch (status) {
    case "verified":
      return "verified";
    case "failed":
    case "temporary_failure":
      return "failed";
    default:
      return "pending";
  }
}

// Transform Resend domain to our frontend format
export function transformDomain(resendDomain: ResendDomain): Domain {
  return {
    id: resendDomain.id,
    domain: resendDomain.name,
    status: normalizeStatus(resendDomain.status),
    createdAt: resendDomain.created_at,
    region: resendDomain.region,
    // Records may not be present in list response, only in individual domain response
    records: (resendDomain.records || []).map((record) => ({
      type: record.type,
      name: record.name,
      value: record.value,
      ttl: record.ttl,
      status: normalizeStatus(record.status),
      priority: record.priority,
    })),
  };
}

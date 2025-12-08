"use client";

// Types
export interface Contact {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  role: string;
  tags: string[];
  customMeta: Record<string, string>;
  status: "valid" | "invalid" | "duplicate";
  validationErrors: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ParsedColumn {
  originalName: string;
  mappedTo: CanonicalField | null;
  sampleValues: string[];
}

export type CanonicalField =
  | "email"
  | "firstName"
  | "lastName"
  | "company"
  | "role"
  | "tags"
  | "ignore";

export type DedupeStrategy = "keepFirst" | "keepLast" | "merge";

// Email validation regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function extractDomain(email: string): string {
  const parts = email.split("@");
  return parts.length > 1 ? parts[1].toLowerCase() : "";
}

// Generate unique ID
export function generateId(): string {
  return `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Parse CSV text into rows
export function parseCSV(text: string): string[][] {
  const lines = text.trim().split(/\r?\n/);
  return lines.map((line) => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
}

// Extract emails and names from raw text
export function extractEmailsFromText(text: string): Partial<Contact>[] {
  const contacts: Partial<Contact>[] = [];
  const emailPattern = /([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const matches = text.match(emailPattern) || [];

  const uniqueEmails = [...new Set(matches.map((e) => e.toLowerCase()))];

  for (const email of uniqueEmails) {
    // Try to extract name from common patterns like "John Doe <john@example.com>"
    const namePattern = new RegExp(`([\\w\\s]+)\\s*<?${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    const nameMatch = text.match(namePattern);

    let firstName = "";
    let lastName = "";

    if (nameMatch && nameMatch[1]) {
      const nameParts = nameMatch[1].trim().split(/\s+/);
      firstName = nameParts[0] || "";
      lastName = nameParts.slice(1).join(" ") || "";
    }

    contacts.push({
      id: generateId(),
      email: email.toLowerCase(),
      firstName,
      lastName,
      company: "",
      role: "",
      tags: [],
      customMeta: {},
    });
  }

  return contacts;
}

// Auto-detect column mapping based on header names
export function suggestColumnMapping(header: string): CanonicalField | null {
  const normalized = header.toLowerCase().trim();

  const mappings: Record<string, CanonicalField> = {
    email: "email",
    "e-mail": "email",
    emailaddress: "email",
    "email address": "email",
    mail: "email",
    firstname: "firstName",
    "first name": "firstName",
    fname: "firstName",
    "first_name": "firstName",
    givenname: "firstName",
    lastname: "lastName",
    "last name": "lastName",
    lname: "lastName",
    "last_name": "lastName",
    surname: "lastName",
    familyname: "lastName",
    company: "company",
    organization: "company",
    org: "company",
    companyname: "company",
    "company name": "company",
    employer: "company",
    role: "role",
    title: "role",
    jobtitle: "role",
    "job title": "role",
    position: "role",
    tags: "tags",
    tag: "tags",
    labels: "tags",
  };

  return mappings[normalized.replace(/[_-]/g, "")] || null;
}

// Validate a contact and return validation errors
export function validateContact(contact: Partial<Contact>): string[] {
  const errors: string[] = [];

  if (!contact.email) {
    errors.push("Email is required");
  } else if (!isValidEmail(contact.email)) {
    errors.push("Invalid email format");
  }

  return errors;
}

// Create a full contact object from partial data
export function createContact(data: Partial<Contact>): Contact {
  const errors = validateContact(data);
  const now = new Date();

  return {
    id: data.id || generateId(),
    email: data.email?.toLowerCase().trim() || "",
    firstName: data.firstName?.trim() || "",
    lastName: data.lastName?.trim() || "",
    company: data.company?.trim() || "",
    role: data.role?.trim() || "",
    tags: data.tags || [],
    customMeta: data.customMeta || {},
    status: errors.length > 0 ? "invalid" : "valid",
    validationErrors: errors,
    createdAt: data.createdAt || now,
    updatedAt: now,
  };
}

// Find duplicates in contact list
export function findDuplicates(contacts: Contact[]): Map<string, Contact[]> {
  const emailMap = new Map<string, Contact[]>();

  for (const contact of contacts) {
    const email = contact.email.toLowerCase();
    if (!emailMap.has(email)) {
      emailMap.set(email, []);
    }
    emailMap.get(email)!.push(contact);
  }

  // Filter to only entries with duplicates
  const duplicates = new Map<string, Contact[]>();
  emailMap.forEach((contacts, email) => {
    if (contacts.length > 1) {
      duplicates.set(email, contacts);
    }
  });

  return duplicates;
}

// Deduplicate contacts based on strategy
export function deduplicateContacts(
  contacts: Contact[],
  strategy: DedupeStrategy
): Contact[] {
  const emailMap = new Map<string, Contact>();

  for (const contact of contacts) {
    const email = contact.email.toLowerCase();
    const existing = emailMap.get(email);

    if (!existing) {
      emailMap.set(email, contact);
    } else {
      switch (strategy) {
        case "keepFirst":
          // Keep the existing one (first)
          break;
        case "keepLast":
          emailMap.set(email, contact);
          break;
        case "merge":
          // Merge fields, preferring non-empty values from latest
          emailMap.set(email, {
            ...existing,
            firstName: contact.firstName || existing.firstName,
            lastName: contact.lastName || existing.lastName,
            company: contact.company || existing.company,
            role: contact.role || existing.role,
            tags: [...new Set([...existing.tags, ...contact.tags])],
            customMeta: { ...existing.customMeta, ...contact.customMeta },
            updatedAt: new Date(),
          });
          break;
      }
    }
  }

  return Array.from(emailMap.values());
}

// Mark duplicates in list (for display purposes)
export function markDuplicates(contacts: Contact[]): Contact[] {
  const emailCount = new Map<string, number>();

  // Count occurrences
  for (const contact of contacts) {
    const email = contact.email.toLowerCase();
    emailCount.set(email, (emailCount.get(email) || 0) + 1);
  }

  // Track which emails we've seen
  const seenEmails = new Set<string>();

  return contacts.map((contact) => {
    const email = contact.email.toLowerCase();
    const count = emailCount.get(email) || 0;

    if (count > 1 && seenEmails.has(email)) {
      return { ...contact, status: "duplicate" as const };
    }

    seenEmails.add(email);
    return contact;
  });
}

// Convert contacts to CSV for export
export function contactsToCSV(contacts: Contact[]): string {
  const headers = ["Email", "First Name", "Last Name", "Company", "Role", "Tags", "Status"];
  const rows = contacts.map((c) => [
    c.email,
    c.firstName,
    c.lastName,
    c.company,
    c.role,
    c.tags.join(";"),
    c.status,
  ]);

  const escapeCSV = (value: string) => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  return [
    headers.join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\n");
}

// Download file helper
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Get statistics from contact list
export function getContactStats(contacts: Contact[]) {
  const domains = new Map<string, number>();
  let valid = 0;
  let invalid = 0;
  let duplicate = 0;

  for (const contact of contacts) {
    switch (contact.status) {
      case "valid":
        valid++;
        break;
      case "invalid":
        invalid++;
        break;
      case "duplicate":
        duplicate++;
        break;
    }

    if (contact.email) {
      const domain = extractDomain(contact.email);
      domains.set(domain, (domains.get(domain) || 0) + 1);
    }
  }

  // Get top 3 domains
  const topDomains = Array.from(domains.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([domain, count]) => ({ domain, count }));

  return {
    total: contacts.length,
    valid,
    invalid,
    duplicate,
    topDomains,
  };
}

// Sample data for demo/testing
export function getSampleContacts(): Contact[] {
  const sampleData = [
    { email: "john.doe@acme.com", firstName: "John", lastName: "Doe", company: "Acme Inc", role: "CEO" },
    { email: "jane.smith@techcorp.io", firstName: "Jane", lastName: "Smith", company: "TechCorp", role: "CTO" },
    { email: "bob.wilson@startup.co", firstName: "Bob", lastName: "Wilson", company: "Startup Co", role: "Product Manager" },
    { email: "alice.johnson@enterprise.com", firstName: "Alice", lastName: "Johnson", company: "Enterprise Ltd", role: "VP Sales" },
    { email: "mike.brown@agency.net", firstName: "Mike", lastName: "Brown", company: "Agency Net", role: "Director" },
  ];

  return sampleData.map((data) => createContact({ ...data, tags: [] }));
}

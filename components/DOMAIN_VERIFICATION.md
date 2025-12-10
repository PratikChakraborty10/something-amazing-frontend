# Domain Verification API Documentation

This document details the API endpoints for managing domain verification with AWS SES. These endpoints allow you to list domains, verify new domains, check verification status, and retrieve the necessary DNS records (TXT and DKIM) for the user to configure.

## Base URL
All endpoints are prefixed with `/domains`.

---

## 1. List All Domains
Retrieve a list of all domains that have been added to AWS SES (verified or pending).

- **URL:** `GET /domains`
- **Auth Required:** Yes (JWT)

### Response
Returns an array of domain strings.

```json
[
  "example.com",
  "my-startup.com"
]
```

---

## 2. Verify New Domain
Initiate the verification process for a new domain. This will return the DNS records that the user needs to add to their DNS provider.

- **URL:** `POST /domains`
- **Auth Required:** Yes (JWT)
- **Body:**
  ```json
  {
    "domain": "example.com"
  }
  ```

### Response
Returns the verification token (TXT record) and DKIM tokens (CNAME records).

```json
{
  "domain": "example.com",
  "verificationToken": "R4e+...verification...token",
  "dkimTokens": [
    "7v7...dkim...token1",
    "8x8...dkim...token2",
    "9y9...dkim...token3"
  ],
  "verificationStatus": "Pending",
  "dkimVerificationStatus": "Pending"
}
```

### DNS Configuration Instructions for Frontend
Display these instructions to the user:

1.  **TXT Record (Identity Verification)**
    *   **Type:** `TXT`
    *   **Name:** `_amazonses.example.com` (Note: some DNS providers automatically append the domain, so just `_amazonses` might be enough)
    *   **Value:** `R4e+...verification...token`

2.  **CNAME Records (DKIM)**
    *   You will receive 3 DKIM tokens. Create 3 CNAME records.
    *   **Record 1:**
        *   **Name:** `7v7...dkim...token1._domainkey.example.com`
        *   **Value:** `7v7...dkim...token1.dkim.amazonses.com`
    *   **Record 2:**
        *   **Name:** `8x8...dkim...token2._domainkey.example.com`
        *   **Value:** `8x8...dkim...token2.dkim.amazonses.com`
    *   **Record 3:**
        *   **Name:** `9y9...dkim...token3._domainkey.example.com`
        *   **Value:** `9y9...dkim...token3.dkim.amazonses.com`

---

## 3. Get Domain Status
Check the current verification status of a specific domain. Use this to poll for completion or show the current state.

- **URL:** `GET /domains/:domain`
- **Auth Required:** Yes (JWT)

### Response
```json
{
  "domain": "example.com",
  "verificationToken": "R4e+...verification...token",
  "dkimTokens": [
    "7v7...dkim...token1",
    "8x8...dkim...token2",
    "9y9...dkim...token3"
  ],
  "verificationStatus": "Success",
  "dkimVerificationStatus": "Success"
}
```

### Status Values
*   `Pending`: Verification is in progress. DNS records might not have propagated yet.
*   `Success`: Domain is verified and ready to send.
*   `Failed`: Verification failed.
*   `TemporaryFailure`: Temporary issue, retry later.
*   `NotStarted`: Should not happen for added domains.

---

## 4. Delete Domain
Remove a domain from AWS SES.

- **URL:** `DELETE /domains/:domain`
- **Auth Required:** Yes (JWT)

### Response
```json
{
  "message": "Domain deleted successfully"
}
```


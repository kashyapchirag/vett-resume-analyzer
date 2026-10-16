# Vett — Privacy & Data Flow Policy (Draft)

> [!IMPORTANT]
> **Pre-Launch Notice for Legal Review**: This document is an engineering description of Vett's actual data flow, server processing, and third-party integrations. It must be reviewed by qualified legal counsel prior to public launch or commercial operation. Do not present this document as a binding legal warranty or guarantee.

---

## 1. Product Summary & Data Handling Architecture

Vett is an assistive web tool designed to compare a job seeker's resume with a target job description, generating an explainable Estimated ATS Match Score alongside grounded feedback.

### Key Data Architecture Principles:
1. **In-Memory Document Processing**: Uploaded documents (`.pdf`, `.docx`) are received by Vett's server API endpoint (`POST /api/analyze-resume`), converted into an in-memory byte buffer (`Uint8Array`), and parsed in-memory using PDF.js and Mammoth.
2. **Zero Permanent Document Storage by Vett**: Vett's application servers do not store uploaded resume files, extracted text, job descriptions, or AI analysis results in databases, disk storage, or cloud buckets. Once the HTTP request lifecycle completes, in-memory buffers are released for garbage collection.
3. **No Persistent User Tracking in MVP**: Vett does not use user accounts, logins, tracking cookies, or persistent browser identifiers in this release.

---

## 2. Third-Party AI Sub-Processor: Google Gemini

To analyze resume alignment and extract structured feedback, Vett transmits data to an external AI sub-processor:

- **Sub-Processor**: Google LLC (Google AI Studio / Gemini API).
- **Model Used**: `gemini-3.5-flash-lite`.
- **Data Transmitted**:
  - The extracted plain text of the user's resume.
  - The user-supplied job description text.
  - Application instructions and system prompts.
- **Provider Policies & Boundaries**:
  - Google's data handling, logging, and retention are governed by the [Google AI Studio Terms of Service](https://ai.google.dev/terms) and [Google Privacy Policy](https://policies.google.com/privacy).
  - **API Tier Distinction**: Under Google AI Studio's free tier, submitted prompts and responses may be logged or sampled for model improvement per Google's terms. Paid (Pay-As-You-Go) API tiers or Google Cloud Vertex AI deployments generally provide commercial terms ensuring prompts are not used for model training. Operators deploying Vett should select the tier matching their privacy requirements.
  - Vett's in-memory processing guarantees apply strictly to Vett's infrastructure. Vett cannot control, alter, or warrant the internal data retention or training practices of third-party AI providers.

---

## 3. Data Not Collected or Stored by Vett

Vett's infrastructure does not:
- Permanently store resumes, candidate contact details, or job descriptions.
- Maintain user profiles or document histories.
- Sell or monetize user data.
- Train custom machine learning models on submitted documents.
- Share uploaded documents with recruiters, employers, or third parties (other than the AI API necessary to fulfill the requested analysis).

---

## 4. Pre-Launch Checklist for Public Release

Before opening Vett to public users or marketing:
- [ ] Conduct formal legal review of this privacy notice against applicable data protection regulations (e.g., GDPR, CCPA).
- [ ] Review Google AI Studio API tier: Confirm whether the active API key is on a commercial Pay-As-You-Go tier with non-training terms if required for user privacy compliance.
- [ ] Configure deployment-level or hosting-level rate limiting, WAF, and abuse controls (e.g., Vercel Firewall, Cloudflare, or Edge Middleware) before opening to public traffic.
- [ ] Add a public privacy page route (e.g., `/privacy`) linking to this approved notice.
- [ ] Maintain an updated contact email for user privacy inquiries.

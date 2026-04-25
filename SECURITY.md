# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x (current) | ✅ Active support |
| < 1.0 (beta) | ❌ No longer supported |

---

## Reporting a Vulnerability

We take the security of CAMP seriously. If you discover a security vulnerability, please **do not** open a public GitHub issue.

### How to Report

**Email:** rj0809005@gmail.com

Please include the following in your report:
- A clear description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Any suggested fixes (optional but appreciated)

### What to Expect

| Timeline | Action |
|----------|--------|
| Within 48 hours | Acknowledgement of your report |
| Within 7 days | Initial assessment and severity classification |
| Within 30 days | Patch development and testing |
| Within 45 days | Public disclosure (coordinated with reporter) |

---

## Security Practices

CAMP follows these security standards:

- All API keys and credentials are stored as environment variables — never hardcoded
- User data (course inputs, faculty details) is never shared with third parties
- OpenAI API calls are made server-side only — API keys are never exposed to the client
- All database queries use parameterised statements to prevent SQL injection
- HTTPS enforced on all production endpoints via AWS certificate manager

---

## Scope

**In scope:**
- Authentication and authorisation vulnerabilities
- Data exposure or leakage
- Injection attacks (SQL, XSS, CSRF)
- OpenAI API key exposure
- Insecure direct object references

**Out of scope:**
- Rate limiting on public endpoints (known limitation, in roadmap)
- Issues on third-party services (AWS, OpenAI)
- Social engineering attacks

---

*Thank you for helping keep CAMP and its users safe.*

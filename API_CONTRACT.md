# API CONTRACT — backOOP (Fullstack Project)

## 1. Base URLs

Frontend:
- http://localhost:3000

Backend:
- http://localhost:5000

All API routes are prefixed with:
- /api

---

## 2. Authentication (JWT)

Authentication is based on JSON Web Tokens (JWT).

### Login
POST /api/auth/connexion

Response:
{
  "accessToken": "<jwt>"
}

### Usage

All protected routes require:

Authorization: Bearer <jwt>

Example:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

---

## 3. CSRF Protection

CSRF protection is required for all state-changing operations (POST, PUT, DELETE).

### Get CSRF token
GET /api/csrf

Response:
{
  "csrfToken": "<token>"
}

Server also sets cookie:
csrf_token=<token>

### Usage

Client must send:

Header:
X-CSRF-Token: <token>

Cookie:
csrf_token=<token>

Both values must match.

---

## 4. CORS Policy

By default, all API routes are restricted to:

http://localhost:3000

Allowed:
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Headers: Content-Type, Authorization, X-CSRF-Token

Preflight OPTIONS requests must be handled.

---

## 5. Public Exception

The following route is public and not restricted by CORS IP policy:

GET /stats/categories

Accessible from any origin.

---

## 6. Products (Backend B logic, Backend A protects)

Public:
- GET /api/produits
- GET /api/produits/:id

Protected (JWT + CSRF required):
- POST /api/produits
- PUT /api/produits/:id
- DELETE /api/produits/:id

---

## 7. CSP Reporting

### Report endpoint
POST /api/csp/report

Receives JSON violation reports.

### View reports (Protected)
GET /api/csp/reports

Requires:
- Authorization: Bearer <jwt>

---

## 8. Password Policy (NIST-based)

Registration must enforce:
- Minimum 12 characters
- No forced complexity rules
- Block common passwords
- Reject if password contains user email

---

## 9. security.txt

Served at:

/.well-known/security.txt

Contains:
- Contact
- Security policy
- Acknowledgements
# REST API Documentation

All endpoints are prefixed with `/api`. Authentication is required for all routes except `/auth/login`. Pass the JWT in the `Authorization: Bearer <token>` header.

## Authentication
- `POST /auth/login`
  - Body: `{ username, password }`
  - Returns: `{ success: true, token, user }`

## Cases
- `GET /cases` (Investigator, Reviewer, Admin)
  - Returns: List of active cases.
- `GET /cases/:id`
  - Returns: Case details.
- `POST /cases` (Investigator, Admin)
  - Body: `{ title, description }`
  - Returns: Created case.
- `PUT /cases/:id/status` (Investigator, Reviewer, Admin)
  - Body: `{ status }` (DRAFT, OPEN, INVESTIGATING, REVIEW, RESOLVED, ARCHIVED)

## Evidence
- `GET /cases/:caseId/evidence`
  - Returns: Evidence artifacts for a case.
- `POST /cases/:caseId/evidence` (Investigator)
  - Body: `{ title, description, type }`
- `PUT /evidence/:id/verify` (Investigator, Reviewer)
  - Body: `{ verificationState }` (VERIFIED, UNVERIFIED, DISPUTED, REJECTED)
  - *Note: Triggers scoring engine recalculation.*

## Hypotheses
- `GET /cases/:caseId/hypotheses`
  - Returns: Competing theories ranked by score.
- `POST /cases/:caseId/hypotheses` (Investigator)
  - Body: `{ title, description }`

## Relationships
- `GET /hypotheses/:hypothesisId/relationships`
  - Returns: Evidence links for a specific theory.
- `POST /hypotheses/:hypothesisId/relationships` (Investigator)
  - Body: `{ evidenceId, type, strength }` (`type` must be SUPPORT or CONTRADICT).
  - *Note: Triggers scoring engine recalculation.*

## Audit
- `GET /cases/:caseId/timeline`
  - Returns: Immutable audit trail tailored for narrative consumption.
- `GET /audit` (Admin)
  - Returns: Raw, system-wide operational ledger.

## Admin
- `POST /admin/reset-demo` (Admin)
  - Wipes database and seeds BK-2041 demonstration case.

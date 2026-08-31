# BlackBox REST API Documentation

All API endpoints are prefixed with `/api` and return standardized JSON responses.

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error description message"
}
```

---

## 1. Authentication (`/api/auth`)

### POST `/api/auth/login`
Authenticates a user and returns a JWT token.
- **Request Body**:
  ```json
  {
    "username": "investigator",
    "password": "demo"
  }
  ```
- **Response `data`**:
  ```json
  {
    "token": "<jwt-token-string>",
    "user": {
      "id": "60d0fe4f5311236168a109ca",
      "username": "investigator",
      "name": "Sarah Chen",
      "role": "Investigator"
    }
  }
  ```

---

## 2. Dashboard & Telemetry (`/api/dashboard`)

### GET `/api/dashboard/stats` (or `/api/dashboard/summary`)
Returns aggregated metrics for command center widgets.
- **Headers**: `Authorization: Bearer <token>`
- **Response `data`**:
  - `metrics`: Total cases, active investigations, cases in review, resolved cases, total evidence, verification breakdown counts, active hypotheses.
  - `statusDistribution`: Counts grouped by lifecycle status (`DRAFT`, `OPEN`, `INVESTIGATING`, `REVIEW`, `RESOLVED`, `ARCHIVED`).
  - `priorityCases`: Top priority active investigations with linked item counts.
  - `recentActivity`: Latest 10 system audit entries.

---

## 3. Case Management (`/api/cases`)

### GET `/api/cases`
Lists case records with search, status filtering, priority filtering, and pagination.
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 10)
  - `search` (case title or description query)
  - `status` (`DRAFT`, `OPEN`, `INVESTIGATING`, `REVIEW`, `RESOLVED`, `ARCHIVED`)
  - `priority` (`CRITICAL`, `HIGH`, `NORMAL`)

### POST `/api/cases`
Creates a new case record.
- **Access**: `Investigator`, `Admin`
- **Request Body**:
  ```json
  {
    "title": "Operation Red Storm",
    "description": "Exfiltration investigation from subnet 10.24.0.0/16"
  }
  ```

### GET `/api/cases/:id`
Fetches a single case by ID with author details and status metadata.

### PUT `/api/cases/:id/status`
Updates case lifecycle status and creates an audit record.
- **Access**: `Investigator`, `Reviewer`, `Admin`
- **Request Body**:
  ```json
  {
    "status": "INVESTIGATING"
  }
  ```

### GET `/api/cases/:caseId/relationships`
Returns all evidence-to-hypothesis relationship links belonging to the specified case.

---

## 4. Evidence Management (`/api/cases/:caseId/evidence` & `/api/evidence`)

### GET `/api/cases/:caseId/evidence`
Lists all evidence items attached to a case.

### POST `/api/cases/:caseId/evidence`
Registers a new evidence artifact to a case.
- **Access**: `Investigator`, `Admin`
- **Request Body**:
  ```json
  {
    "title": "Firewall Outbound Spike Log",
    "type": "Network Log",
    "source": "Palo Alto Edge 01",
    "description": "8.4 GB egress detected at 02:14 UTC to external IP",
    "confidenceScore": 85,
    "verificationState": "UNVERIFIED"
  }
  ```

### PUT `/api/evidence/:id/verify`
Updates the verification state of an evidence artifact and recalculates affected hypothesis scores.
- **Access**: `Investigator`, `Reviewer`, `Admin`
- **Request Body**:
  ```json
  {
    "state": "VERIFIED"
  }
  ```
  *(Allowed values: `UNVERIFIED`, `VERIFIED`, `DISPUTED`, `REJECTED`)*

---

## 5. Competing Hypotheses & Scoring (`/api/cases/:caseId/hypotheses` & `/api/hypotheses`)

### GET `/api/cases/:caseId/hypotheses`
Lists all competing theories for a case with current computed scores and explainability factors.

### POST `/api/cases/:caseId/hypotheses`
Formulates a new hypothesis.
- **Access**: `Investigator`, `Admin`
- **Request Body**:
  ```json
  {
    "title": "Compromised Credentials via Phishing",
    "description": "Attacker obtained domain credentials to access file servers"
  }
  ```

### GET `/api/hypotheses/:id/relationships`
Returns relationship links linked to a specific hypothesis.

### POST `/api/hypotheses/:id/relationships`
Links an evidence item to a hypothesis as supporting or contradicting. Automatically triggers the scoring engine to recompute the hypothesis score.
- **Access**: `Investigator`, `Admin`
- **Request Body**:
  ```json
  {
    "evidenceId": "60d0fe4f5311236168a109cc",
    "type": "SUPPORT",
    "strength": 8
  }
  ```

---

## 6. System Audit Trail (`/api/audit`)

### GET `/api/audit`
Retrieves immutable operational audit logs with search, actor details, action filtering, and pagination.
- **Access**: `Reviewer`, `Admin`
- **Query Parameters**: `page`, `limit`, `search`, `action`, `entityType`

---

## 7. Admin Console (`/api/admin`)

### GET `/api/admin/users`
Lists all system users with role filtering, case count metrics, and activity counts.
- **Access**: `Admin`

### GET `/api/admin/case-monitoring`
Provides system-wide case oversight metrics and high-priority case summaries.
- **Access**: `Admin`

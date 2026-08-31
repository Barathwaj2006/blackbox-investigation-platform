# BlackBox Database Schema & Data Models

BlackBox uses MongoDB via Mongoose as its primary persistence engine, with a zero-configuration in-memory fallback store for offline development and instant sandbox testing.

---

## Entity Relationship Diagram

```
       ┌────────────────────────┐
       │          User          │
       │  (Admin/Investigator/  │
       │        Reviewer)       │
       └───────────┬────────────┘
                   │ 1:N
                   ▼
       ┌────────────────────────┐
       │          Case          │
       │ (Status & Lifecycle)   │
       └─────┬────────────┬─────┘
             │ 1:N        │ 1:N
             ▼            ▼
 ┌────────────────┐ ┌────────────────┐
 │    Evidence    │ │   Hypothesis   │
 │ (Verification) │ │(Dynamic Scores)│
 └───────┬────────┘ └────────┬───────┘
         │                   │
         └─────────┬─────────┘
                   │ N:M (via EvidenceRelationship)
                   ▼
       ┌────────────────────────┐
       │  EvidenceRelationship  │
       │(SUPPORT / CONTRADICT)  │
       │    (Strength 1-10)     │
       └────────────────────────┘

       ┌────────────────────────┐
       │        AuditLog        │
       │ (Immutable Log Stream) │
       └────────────────────────┘
```

---

## Model Specifications

### 1. User (`User.js`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `username` | String | required, unique, trim | Unique login handle |
| `name` | String | required | Full investigator/user name |
| `password` | String | required | Bcrypt-hashed password |
| `role` | String | enum: `['Admin', 'Investigator', 'Reviewer']` | RBAC authorization level |
| `createdAt` | Date | default: `Date.now` | Registration timestamp |

### 2. Case (`Case.js`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `title` | String | required, trim | Investigation case title |
| `description` | String | default: `''` | Scope and synopsis of the case |
| `status` | String | enum: `['DRAFT', 'OPEN', 'INVESTIGATING', 'REVIEW', 'RESOLVED', 'ARCHIVED']` | Current operational state |
| `createdBy` | ObjectId | ref: `'User'`, required | Case author |
| `createdAt` | Date | default: `Date.now` | Creation timestamp |
| `updatedAt` | Date | default: `Date.now` | Last mutation timestamp |

### 3. Evidence (`Evidence.js`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `caseId` | ObjectId | ref: `'Case'`, required | Parent investigation case |
| `title` | String | required, trim | Evidence artifact headline |
| `type` | String | default: `'Digital'` | Category (e.g. Network Log, Endpoint Dump, USB Image) |
| `source` | String | default: `''` | Collection source or sensor identifier |
| `description` | String | default: `''` | Detailed discovery narrative |
| `confidenceScore` | Number | min: 0, max: 100, default: 50 | Base reliability confidence percentage |
| `verificationState` | String | enum: `['UNVERIFIED', 'VERIFIED', 'DISPUTED', 'REJECTED']` | Investigative review state |
| `createdBy` | ObjectId | ref: `'User'` | Investigator who logged the artifact |
| `createdAt` | Date | default: `Date.now` | Ingestion timestamp |

### 4. Hypothesis (`Hypothesis.js`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `caseId` | ObjectId | ref: `'Case'`, required | Parent investigation case |
| `title` | String | required, trim | Working investigative theory |
| `description` | String | default: `''` | Formulation details |
| `score` | Number | default: 0 | Dynamically computed net confidence score |
| `explainability` | [String] | default: `[]` | Itemized audit factors explaining the computed score |
| `createdBy` | ObjectId | ref: `'User'` | Author of the hypothesis |
| `createdAt` | Date | default: `Date.now` | Creation timestamp |

### 5. EvidenceRelationship (`EvidenceRelationship.js`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `caseId` | ObjectId | ref: `'Case'`, required | Case scope identifier |
| `hypothesisId` | ObjectId | ref: `'Hypothesis'`, required | Target competing hypothesis |
| `evidenceId` | ObjectId | ref: `'Evidence'`, required | Associated evidence item |
| `type` | String | enum: `['SUPPORT', 'CONTRADICT']` | Relationship direction |
| `strength` | Number | min: 1, max: 10, default: 5 | Link importance weighting (1-10) |
| `createdBy` | ObjectId | ref: `'User'` | Author of the link |
| `createdAt` | Date | default: `Date.now` | Link timestamp |

### 6. AuditLog (`AuditLog.js`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `user` | ObjectId | ref: `'User'`, required | Actor who initiated the mutation |
| `action` | String | required | Action token (`CREATE_CASE`, `VERIFY_EVIDENCE`, etc.) |
| `entityType` | String | enum: `['Case', 'Evidence', 'Hypothesis', 'EvidenceRelationship', 'User']` | Target entity |
| `entityId` | ObjectId / String | required | Target document ID |
| `details` | Object | default: `{}` | Detailed before/after state diffs |
| `createdAt` | Date | default: `Date.now` | Immutable event timestamp |

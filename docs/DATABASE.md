# Database Schema

BlackBox utilizes MongoDB (via Mongoose) with a heavily normalized schema to ensure score traceability and audit immutability.

## `User`
Manages authentication and RBAC.
- `username`: String (Unique)
- `password`: String (bcrypt hash)
- `role`: String (`Investigator`, `Reviewer`, `Admin`)
- `name`: String

## `Case`
The root operational container.
- `title`: String
- `description`: String
- `status`: String (`DRAFT`, `OPEN`, `INVESTIGATING`, `REVIEW`, `RESOLVED`, `ARCHIVED`)
- `createdBy`: ObjectId (Ref: User)
- `assignedTo`: Array of ObjectIds

## `Evidence`
Discrete artifacts entered into the dossier.
- `caseId`: ObjectId (Ref: Case)
- `title`: String
- `description`: String
- `type`: String (`Document`, `Testimony`, `Digital`, `Physical`)
- `verificationState`: String (`UNVERIFIED`, `VERIFIED`, `DISPUTED`, `REJECTED`)
- `confidenceScore`: Number (0-100)
- `uploadedBy`: ObjectId (Ref: User)

## `Hypothesis`
A proposed explanation for the case events.
- `caseId`: ObjectId (Ref: Case)
- `title`: String
- `description`: String
- `score`: Number (Dynamically calculated base 10)
- `explainability`: Array of Strings (Human-readable impact factors)
- `createdBy`: ObjectId (Ref: User)

## `EvidenceRelationship`
The linking tissue that connects Evidence to Hypotheses.
- `caseId`: ObjectId (Ref: Case)
- `evidenceId`: ObjectId (Ref: Evidence)
- `hypothesisId`: ObjectId (Ref: Hypothesis)
- `type`: String (`SUPPORT`, `CONTRADICT`)
- `strength`: Number (1-10)
- `createdBy`: ObjectId (Ref: User)

## `AuditLog`
Immutable operational record.
- `user`: ObjectId (Ref: User)
- `action`: String (e.g., `VERIFY_EVIDENCE`)
- `entityType`: String
- `entityId`: ObjectId
- `details`: Object (Flexible payload of the change)
- `createdAt`: Date (Auto-generated timestamp)

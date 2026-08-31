# BlackBox Investigation Platform

**BlackBox is an investigation workspace that helps investigators organize evidence, compare competing explanations, and understand how new evidence changes the investigation.**

![BUILD PASS](https://img.shields.io/badge/BUILD-PASS-success)
![TESTS](https://img.shields.io/badge/TESTS-59%2F59_PASS-success)
![MONGODB](https://img.shields.io/badge/MONGODB-INTEGRATED-blue)
![RBAC](https://img.shields.io/badge/RBAC-ENFORCED-blue)
![SCORING](https://img.shields.io/badge/SCORING-DETERMINISTIC-blue)

## The Problem

During an investigation, analysts must collect evidence, verify its authenticity, compare possible explanations, understand relationships, track changes over time, and produce a defensible conclusion. 

BlackBox provides one connected, professional workspace for this exact process.

## How It Works

1. **Evidence**: Investigators log digital, physical, or documentary artifacts into the system.
2. **Verification**: Artifacts are audited and marked as Verified, Disputed, or Rejected.
3. **Relationships**: Artifacts are explicitly linked to competing hypotheses as Supporting or Contradicting.
4. **Competing Hypotheses**: Possible explanations are proposed and ranked against each other.
5. **Deterministic Score**: A mathematical engine calculates the leading theory based on evidence strength, confidence, and verification state.
6. **Explainability**: The system explains *why* a theory is leading in plain English.
7. **Timeline / Audit**: Every action is recorded immutably to trace the investigation's evolution.
8. **Review**: The investigation is gated by completeness checks.
9. **Resolution**: The final assessment is locked and archived.

## Core Features

- Case Management
- Evidence Dossier
- Evidence Verification
- Competing Hypotheses
- Deterministic Scoring
- Score Explainability
- Evidence Relationship Map
- Score History
- Investigation Timeline
- Immutable Centralized Audit Logs
- Review and Resolution
- Server-side RBAC
- MongoDB Persistence
- Demo Case Reset

## Demo Investigation

**BK-2041 — Aerospace Data Exfiltration**

The investigator starts with several evidence artifacts ranging from physical badge swipes to digital egress logs. Some are verified, while others require review. These artifacts support or contradict competing hypotheses (e.g., "Insider Threat" vs "External Compromise").

When evidence is verified, the investigation score changes dynamically. BlackBox records exactly *why* the score changed. The investigator can then review the competing theories, inspect the interactive evidence network map, follow the investigation timeline, and eventually resolve the case cleanly.

## Screenshots

*(Screenshots to be added: Command Center, Case Overview, Evidence Dossier, Competing Hypotheses, Evidence Map, Timeline, Review / Resolution)*

## Architecture

```text
┌──────────────────────────┐
│       Vue 3 Client       │
│                          │
│ Cases / Evidence /       │
│ Hypotheses / Map / Audit │
└────────────┬─────────────┘
             │ REST API
             ▼
┌──────────────────────────┐
│      Express Server      │
│                          │
│ Auth • RBAC • Controllers│
│ Scoring • Audit • Routes │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│       MongoDB Atlas      │
│                          │
│ Cases • Evidence •       │
│ Hypotheses • History •   │
│ Audit Logs               │
└──────────────────────────┘
```

*(Note: The platform features a zero-config in-memory fallback for immediate demonstration without a local MongoDB instance).*

## Tech Stack

- **Frontend**: Vue 3, Pinia, Tailwind CSS v4, Vite
- **Backend**: Express.js, Node.js
- **Database**: MongoDB, Mongoose, mongodb-memory-server (for demo)
- **Security**: JWT, bcrypt

## Scoring Engine

BlackBox employs a deterministic scoring model—not an opaque machine-learning model—ensuring that all investigative conclusions are 100% mathematically defensible.

**Formula:**
`Evidence Contribution = Strength × Confidence × Verification Multiplier`

**Verification Multipliers:**
- `VERIFIED: 1.0x`
- `UNVERIFIED: 0.5x`
- `DISPUTED: 0.2x`
- `REJECTED: 0.0x`

Supporting evidence increases a hypothesis score. Contradicting evidence decreases it. For full details, see [SCORING_ENGINE.md](docs/SCORING_ENGINE.md).

## Security

- JWT-based authentication
- bcrypt password hashing (10 rounds)
- Server-side Role-Based Access Control (RBAC) authorization middleware
- Environment variable configuration
- Strict secret exclusion

## Testing

**59/59 TEST ASSERTIONS PASSING**

- 13 Smoke Tests
- 46 End-to-End Workflow Tests

Tests cover API contracts, RBAC enforcement, evidence lifecycle transitions, deterministic score mathematics, and immutable audit logging.

## Quick Start

### 1. Requirements
- Node.js (v18+)

### 2. Installation
```bash
git clone https://github.com/Barathwaj2006/blackbox-investigation-platform.git
cd blackbox-investigation-platform

# Install Backend
cd backend
npm install

# Install Frontend
cd ../frontend
npm install
```

### 3. Startup
```bash
# In the backend directory
npm run dev

# In a new terminal, in the frontend directory
npm run dev
```

### 4. Demo Seeding
If the database is empty, the backend will automatically seed the **BK-2041 Aerospace Data Exfiltration** demo case on startup. 
To manually reset the demo from the UI, log in as Admin and click `Load Demo Case` in the Command Center.

## Demo Login

- **Admin**: `admin` / `password`
- **Investigator**: `investigator` / `password`
- **Reviewer**: `reviewer` / `password`

*(These are seeded demo credentials only).*

## Documentation

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design and technical architecture |
| [API.md](docs/API.md) | REST API endpoints and contracts |
| [DATABASE.md](docs/DATABASE.md) | MongoDB schemas and persistence |
| [SCORING_ENGINE.md](docs/SCORING_ENGINE.md) | Deterministic scoring mathematics |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Production deployment instructions |

## Project Status

- **Production build**: PASS
- **59/59 tests**: PASS
- **Core workflow**: PASS
- **MongoDB**: PASS
- **RBAC**: PASS
- **Responsive**: PASS

**Validated Demonstration Build** — Ready for hackathon evaluation.

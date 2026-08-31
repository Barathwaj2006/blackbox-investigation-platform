# BlackBox — Digital Evidence Investigation Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Runtime](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org)
[![Framework](https://img.shields.io/badge/Vue.js-3.x-emerald.svg)](https://vuejs.org)
[![Database](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20In--Memory-forestgreen.svg)](https://www.mongodb.com/)

**BlackBox** is a digital evidence investigation platform engineered for cyber incident responders, forensic analysts, intelligence units, and oversight reviewers. It structures evidence tracking, competing hypothesis evaluation, and investigative decision-making through dynamic mathematical scoring and immutable audit trails.

---

## 🔍 Key Capabilities

- **Command Center & Operational Telemetry**: Real-time aggregate dashboards displaying case pipelines, verification rates, active hypotheses, and prioritized active investigations.
- **Case Registry & Lifecycle Workflows**: Multi-stage investigation workflows (`DRAFT` → `OPEN` → `INVESTIGATING` → `REVIEW` → `RESOLVED` → `ARCHIVED`) with search, status filters, and pagination.
- **Evidence Intelligence & Multi-State Verification**: Catalog digital artifacts with source telemetry, confidence metrics, and verification states (`UNVERIFIED`, `VERIFIED`, `DISPUTED`, `REJECTED`).
- **Dynamic Competing Hypothesis Scoring**: Mathematical scoring engine weighting evidence confidence, verification state multipliers, and link direction (`SUPPORT` vs. `CONTRADICT`) with transparent factor explainability.
- **Visual Evidence Relationship Map**: Interactive node-link canvas mapping evidence artifacts directly to competing hypotheses.
- **Forensic Timeline & Tamper-Evident Audit Logging**: Synchronous operational event stream capturing every mutation with actor, timestamp, and before/after diffs.
- **Role-Based Access Control (RBAC)**: Enforced authorization for `Admin`, `Investigator`, and `Reviewer` roles.
- **Administrative Oversight Console**: Platform surveillance for user activity, role management, and critical case monitoring.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vue 3 (Composition API / `<script setup>`), Vite, Tailwind CSS, Vue Router, Pinia |
| **Backend** | Node.js, Express.js REST API, JSON Web Tokens (JWT), Bcrypt |
| **Persistence** | MongoDB via Mongoose, with an In-Memory fallback store for zero-config setups |
| **Testing** | Node.js Automated Smoke Test Suite |

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-org/blackbox-investigation-platform.git
cd blackbox-investigation-platform
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Default settings automatically use the local in-memory store if `MONGODB_URI` is left unset).*

### 4. Run Development Server
```bash
npm run dev
```
The server will start on port `3000` (or the configured `$PORT`). Navigate to:
```
http://localhost:3000
```

---

## 🔐 Default Demo Accounts

For immediate evaluation, the platform includes pre-configured demo credentials:

| Role | Username | Password | Permissions |
|---|---|---|---|
| **Investigator** | `investigator` | `demo` | Create cases, log evidence, formulate hypotheses, link relationships |
| **Reviewer** | `reviewer` | `demo` | Audit trail review, evidence review, case status oversight |
| **Administrator** | `admin` | `demo` | Full access, user surveillance, case oversight console |

---

## 📁 Repository Structure

```
.
├── backend/
│   ├── controllers/      # Express API route controllers
│   ├── middleware/       # JWT Auth & RBAC authorization middleware
│   ├── models/           # Mongoose schemas (Case, Evidence, Hypothesis, AuditLog, User)
│   ├── routes/           # REST endpoints (/api/cases, /api/evidence, /api/auth, etc.)
│   ├── test/             # Smoke test suite
│   ├── utils/            # Scoring engine, in-memory store & token utilities
│   ├── seed.js           # Database seed script
│   └── server.js         # Express server & static asset entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # Modular UI components (Intelligence Cards, Drawers, Modals)
│   │   ├── layouts/      # Main navigation layout
│   │   ├── router/       # Vue Router navigation & route guards
│   │   ├── store/        # Pinia authentication & state store
│   │   ├── utils/        # HTTP API client utility
│   │   └── views/        # Pages (Dashboard, Cases, CaseDetail, Audit, Admin, Login)
│   ├── package.json
│   └── vite.config.js
├── docs/
│   ├── API.md            # Complete REST API specification
│   ├── ARCHITECTURE.md   # Architectural design and flow diagrams
│   ├── DATABASE.md       # Data models and ER diagrams
│   └── SCORING_ENGINE.md # Mathematical formulas & multiplier reference
├── DEPLOYMENT.md         # Production deployment guide
└── package.json          # Root orchestration package
```

---

## 🧪 Automated Testing & Verification

Run the automated smoke test suite:
```bash
npm test
```

Build the frontend for production:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

---

## 📖 Extended Documentation

- [System Architecture](docs/ARCHITECTURE.md)
- [REST API Reference](docs/API.md)
- [Database Schema & Models](docs/DATABASE.md)
- [Hypothesis Scoring Engine](docs/SCORING_ENGINE.md)
- [Production Deployment Guide](DEPLOYMENT.md)

---

## 📄 License
MIT © BlackBox Investigation Platform

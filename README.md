# BlackBox — Digital Evidence Investigation Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Runtime](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org)
[![Framework](https://img.shields.io/badge/Vue.js-3.x-emerald.svg)](https://vuejs.org)
[![Database](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20In--Memory-forestgreen.svg)](https://www.mongodb.com/)
[![Tests](https://img.shields.io/badge/Tests-59%2F59%20Passing-brightgreen.svg)](backend/test/)

**BlackBox** is an explainable digital evidence investigation platform engineered for cyber incident responders, forensic analysts, intelligence units, and oversight reviewers. It structures evidence tracking, competing hypothesis evaluation, and investigative decision-making through deterministic mathematical scoring and immutable audit trails.

> **Core Philosophy**: Every claim needs a source. Every source needs a chain. Every analytical shift must be mathematically explainable.

---

## 🔍 Key Capabilities & Investigation Chain

The platform implements an end-to-end causal reasoning pipeline:

```text
Evidence Artifact
  ↓ (Verification: VERIFIED [1.0x] / UNVERIFIED [0.5x] / DISPUTED [0.2x] / REJECTED [0.0x])
Verification State Multiplier
  ↓ (Direction: SUPPORT [+] vs CONTRADICT [-] with Link Strength [1-10])
Evidence Relationship
  ↓ (Weighted Net Confidence Score Calculation)
Hypothesis Score Impact
  ↓ (Calculated Delta & Trigger Attribution)
Causal Score History & Explainability
  ↓ (Immutable Activity Logging with Actor & Diffs)
Immutable Audit Trail
```

- **Command Center**: Real-time intelligence aggregation displaying active cases, verification state breakdowns, hypotheses, and priority queues.
- **Case Registry & Lifecycle Workflows**: Multi-stage investigation workflows (`DRAFT` → `OPEN` → `INVESTIGATING` → `REVIEW` → `RESOLVED` → `ARCHIVED`) with keyword search, status filtering, and pagination.
- **Evidence Pipeline & Multi-State Verification**: Catalog digital artifacts with source capture metadata, base confidence metrics, cryptographic hashes, and verification states.
- **Dynamic Competing Hypothesis Scoring**: Deterministic mathematical scoring engine with itemized factor explainability.
- **Score History & Delta Tracking**: Continuous record of every analytical shift with previous score, new score, delta, trigger entity, actor, and timestamp.
- **Visual Evidence Relationship Map**: Dynamic node-link visualization mapping evidence items to hypotheses.
- **Forensic Timeline & Immutable Audit Logging**: Comprehensive operational event stream recording every mutation with actor attribution.
- **Role-Based Access Control (RBAC)**: Server-enforced permissions for `Admin`, `Investigator`, and `Reviewer` roles.
- **Administrative Oversight Console**: Platform health, user surveillance, and high-priority case monitoring.

---

## 🛠️ Technology Stack & Architecture

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | Vue 3 (Composition API / `<script setup>`) | High-performance SPA with Tailwind CSS, Pinia, and Vue Router |
| **Backend** | Node.js + Express.js REST API | Modular controllers, JWT authentication, RBAC middleware, and scoring engine |
| **Persistence** | MongoDB via Mongoose | Production Atlas cluster support with automatic in-memory fallback store |
| **Testing** | Node.js Test Runner | 59 automated test assertions (13 smoke tests + 46 end-to-end integration tests) |

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18 or higher LTS)
- npm (v9 or higher)

### 2. Installation
```bash
git clone https://github.com/your-org/blackbox-investigation-platform.git
cd blackbox-investigation-platform
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env
```
*(Default settings automatically use the zero-config in-memory store if `MONGODB_URI` is unset).*

### 4. Run Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000`.

---

## 🧪 Automated Testing & Verification

Run the full automated test suite (59 assertions covering scoring math, RBAC, workflows, delta tracking, and audit logging):

```bash
npm test
```

Build production frontend bundle:
```bash
npm run build
```

Start production server:
```bash
npm start
```

---

## 📁 Repository Structure

```
.
├── backend/
│   ├── controllers/      # Express API route controllers (auth, case, evidence, hypothesis, audit)
│   ├── middleware/       # JWT Authentication & RBAC authorization middleware
│   ├── models/           # Mongoose schemas (Case, Evidence, Hypothesis, ScoreHistory, AuditLog, User)
│   ├── routes/           # REST endpoints (/api/cases, /api/evidence, /api/hypotheses, etc.)
│   ├── test/             # Automated test suite (smoke-test.js, e2e-workflow-qa.js)
│   ├── utils/            # Scoring engine, in-memory fallback store, token utilities
│   ├── seed.js           # Database seed script
│   └── server.js         # Express server & static SPA asset entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # UI components (Intelligence Cards, Drawers, Modals, Timeline, Map)
│   │   ├── layouts/      # Main application navigation layout
│   │   ├── router/       # Vue Router navigation & client route guards
│   │   ├── store/        # Pinia authentication & user state store
│   │   ├── utils/        # HTTP API client utility with JWT injection
│   │   └── views/        # Page views (Dashboard, Cases, CaseDetail, Audit, Admin, Login)
│   ├── package.json
│   └── vite.config.js
├── docs/
│   ├── API.md            # Complete REST API specification
│   ├── ARCHITECTURE.md   # Architectural design and system flow diagrams
│   ├── DATABASE.md       # Data models, schema attributes, and ER diagram
│   └── SCORING_ENGINE.md # Mathematical formulas, multipliers, and factor explainability
├── DEPLOYMENT.md         # Production deployment guide
├── .env.example          # Environment variable template
└── package.json          # Root build and orchestration manifest
```

---

## 📖 Technical Documentation

- [System Architecture (docs/ARCHITECTURE.md)](docs/ARCHITECTURE.md)
- [REST API Specification (docs/API.md)](docs/API.md)
- [Database Schema & Models (docs/DATABASE.md)](docs/DATABASE.md)
- [Hypothesis Scoring Engine (docs/SCORING_ENGINE.md)](docs/SCORING_ENGINE.md)
- [Production Deployment Guide (DEPLOYMENT.md)](DEPLOYMENT.md)

---

## 📄 License
MIT © BlackBox Investigation Platform


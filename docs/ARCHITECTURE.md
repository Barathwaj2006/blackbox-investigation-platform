# BlackBox Architecture

## System Overview

BlackBox is a consolidated, single-service digital evidence investigation platform. It provides forensic investigators, intelligence analysts, and reviewers with a structured console to track cases, log digital evidence, link evidence to competing hypotheses with dynamic mathematical scoring, and record every mutation in a tamper-evident audit trail.

```
┌────────────────────────────────────────────────────────┐
│                   Web Browser Client                   │
│          Vue 3 + Tailwind CSS Single Page App          │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON API
                            ▼
┌────────────────────────────────────────────────────────┐
│           Consolidated Express.js Service              │
│                     (Port 3000)                        │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Express Static Middleware                        │  │
│  │ - Serves /frontend/dist static bundle assets     │  │
│  │ - SPA fallback routes all web traffic to index   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ RESTful API Controllers (/api/*)                 │  │
│  │ - Authentication & Role Authorization (JWT)      │  │
│  │ - Case Management & State Lifecycles             │  │
│  │ - Evidence Catalog & Verification Workflows      │  │
│  │ - Competing Hypothesis Dynamic Scoring Engine    │  │
│  │ - Immutable Audit Trail & Telemetry Logger       │  │
│  │ - Admin Oversight & User Management              │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Persistence Layer                    │
│                                                        │
│  ┌─────────────────────────┐ ┌──────────────────────┐  │
│  │ MongoDB Atlas / Mongoose│ │ In-Memory Fallback   │  │
│  │ (Production Database)   │ │ (Dev & Zero-Config)  │  │
│  └─────────────────────────┘ └──────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## Architectural Principles

1. **Consolidated Single-Service Model**:
   The Vue 3 frontend compiles to static assets served by the Express backend on port `3000`. Both client and server run within a single container without requiring multi-port or cross-origin reverse proxying.

2. **Role-Based Access Control (RBAC)**:
   - **Admin**: Complete system oversight, user activity surveillance, global case monitoring, case creation, and review.
   - **Investigator**: Case authoring, evidence logging, hypothesis formulation, evidence-hypothesis linking, and verification proposals.
   - **Reviewer**: Read-only oversight across all cases, evidence review, and audit trail inspection.

3. **Tamper-Evident Audit Logging**:
   Every case creation, status transition, evidence verification update, and hypothesis relationship mutation is logged synchronously with actor identity, timestamp, action type, and before-and-after state changes.

4. **Dual Persistence Strategy**:
   The backend connects to MongoDB when `MONGODB_URI` is provided. If MongoDB is unavailable or unconfigured, the application gracefully initializes an in-memory datastore pre-seeded with sample operational cases and standard demo accounts (`investigator`, `reviewer`, `admin`).

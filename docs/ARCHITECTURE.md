# Architecture

BlackBox is built using a modern, decoupled client-server architecture.

## Frontend (Vue 3)
The presentation layer is a Vue 3 Single Page Application (SPA) structured around the composition API. 
- **Routing**: `vue-router` handles client-side transitions (e.g., Command Center -> Registry -> Case Workspace).
- **State**: `pinia` manages global state, specifically the authentication context.
- **Styling**: `Tailwind CSS v4` provides a rigorous design system ("Forensic Dossier" aesthetic).
- **Visualization**: The Evidence Map relies on a lightweight, dependency-free SVG calculation engine built natively into the components for maximum performance.

## Backend (Express.js)
The logic layer is an Express REST API operating statelessly, secured via JWT.
- **Controllers**: Thin wrappers that orchestrate business logic.
- **Middleware**: Intercepts requests for authentication and Role-Based Access Control (RBAC).
- **Scoring Engine**: A specialized utility module (`scoringEngine.js`) calculates the math asynchronously and deterministically based on evidence relationships.
- **Audit Logging**: A passive hook system ensures that every mutating action (`POST`, `PUT`, `DELETE`) creates an immutable `AuditLog` entry.

## Persistence (MongoDB)
Data is persisted in MongoDB via Mongoose ODM.
- Schemas strictly enforce data integrity (e.g., `enum` constraints on states like `VERIFIED` or `DISPUTED`).
- For demonstration purposes, if `MONGODB_URI` is omitted, the application transparently falls back to `mongodb-memory-server` to allow instant, zero-config evaluation.

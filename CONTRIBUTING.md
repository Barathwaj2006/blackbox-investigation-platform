# Contributing to BlackBox

Thank you for your interest in contributing to BlackBox – Digital Evidence Investigation Platform.

## Development Workflow

1. **Fork and Clone**: Fork the repository and clone your branch locally.
2. **Branching**: Create a focused branch for your changes (`git checkout -b feature/issue-name` or `git checkout -b fix/issue-name`).
3. **Environment Setup**:
   - Follow the [Getting Started](README.md#getting-started) instructions in the README.
   - Copy `.env.example` to `.env` if you are using a local MongoDB instance.
4. **Code Quality**:
   - Keep changes focused and well-documented.
   - Verify that the frontend builds cleanly (`npm run build`).
   - Adhere to the existing code style and architecture patterns.
5. **Submitting Changes**:
   - Commit with clear, conventional commit messages (e.g., `feat: ...`, `fix: ...`, `docs: ...`).
   - Open a Pull Request referencing any related issues.

## Guidelines

- **Security First**: Never commit real database credentials, API keys, JWT secrets, or production environment files.
- **Traceability**: Maintain audit logging integrity whenever modifying case, evidence, or hypothesis state transitions.
- **Deterministic Logic**: Ensure changes to the scoring engine remain mathematically transparent and deterministic.

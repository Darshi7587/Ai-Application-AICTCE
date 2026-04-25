# Contributing to CAMP

Thank you for your interest in contributing to **CAMP — Course Alignment & Mapping Portal**. We welcome contributions from developers, academic professionals, and anyone passionate about improving academic tooling for Indian engineering colleges.

---

## Table of Contents
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Branch Strategy](#branch-strategy)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Code Style](#code-style)

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
```bash
   git clone https://github.com/YOUR-USERNAME/camp.git
   cd camp
```
3. Add the upstream remote:
```bash
   git remote add upstream https://github.com/CAMP-PROJECT/camp.git
```

---

## Development Setup

### Prerequisites
- Java 17+ (Backend)
- Node.js 18+ (Frontend)
- MariaDB 10.6+
- OpenAI API key

### Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

### Running Locally
```bash
# Backend
cd backend
./mvnw spring-boot:run

# Frontend
cd frontend
npm install
npm run dev
```

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code only |
| `develop` | Active development branch |
| `feature/[name]` | New features |
| `fix/[name]` | Bug fixes |
| `docs/[name]` | Documentation updates |

Always branch off from `develop`, never directly from `main`.

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## Pull Request Process

1. Ensure your branch is up to date with `develop`
2. Write or update tests for any changed functionality
3. Run all tests and ensure they pass
4. Update documentation if your changes affect public APIs or user flows
5. Fill out the pull request template completely
6. Request a review from at least one core team member
7. PRs require **1 approval** to merge into `develop`, **2 approvals** to merge into `main`

---

## Reporting Issues

Before opening an issue, please:
- Search existing issues to avoid duplicates
- Use the appropriate issue template (Bug Report or Feature Request)
- Provide as much context as possible

---

## Code Style

- **Java (Backend):** Google Java Style Guide
- **JavaScript/HTML (Frontend):** ESLint with Airbnb config
- **SQL:** All table names lowercase with underscores
- **API routes:** RESTful, kebab-case (`/api/course-outcomes`)

---

*By contributing to CAMP, you agree that your contributions will be licensed under the project's MIT License.*

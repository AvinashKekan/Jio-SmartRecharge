# System architecture

```mermaid
flowchart LR
  U[Customer] --> SPA[React + TypeScript SPA]
  SPA -->|REST /api/v1| API[Express API]
  API --> AUTH[Auth middleware + Zod]
  AUTH --> SVC[Feature services]
  SVC --> ORM[Prisma ORM]
  ORM --> DB[(PostgreSQL)]
```

The browser uses TanStack Query for server state and a same-origin-configurable API client. Authentication uses an HttpOnly cookie. The server owns validation, recommendation scoring and financial-style arithmetic; client calculations are display-only helpers.

# Test plan

Run `npm test`. Unit tests cover arithmetic and recommendation ranking; API integration tests cover plan retrieval and validation where a test database is configured. Before production, add Playwright journeys for registration, catalogue filters, modal, comparison and simulated checkout; test migrations against a disposable PostgreSQL database; perform dependency, accessibility and security scans.

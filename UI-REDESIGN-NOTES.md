# UI redesign notes

- Replaced the React/TypeScript/Vite/Tailwind client with plain HTML, CSS and vanilla JavaScript.
- Preserved the Express API, PostgreSQL schema, Prisma models, seeded plan catalogue, authentication, compare, recommendation, simulated recharge and history modules.
- Reworked the UI into a Jio-inspired blue-and-white responsive catalogue with SmartRecharge branding and an explicit independent-demo notice.
- Kept all logo use and visual references clearly separate from official Jio branding claims.
- Added bounded numeric inputs and validation messages; server-side Zod validation remains authoritative.

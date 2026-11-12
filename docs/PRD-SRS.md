# Smart Recharge — PRD and SRS

## Product goal
Help customers understand illustrative prepaid plan value through transparent calculations and usage-based ranking.

## Personas
- Budget-conscious prepaid customer comparing recurring costs.
- Data-heavy user balancing daily allowance, price and validity.
- Portfolio reviewer evaluating requirements-to-implementation skills.

## Functional requirements
- Browse and search active plans; filter by category and price.
- View plan specifications, benefits, restrictions and source status.
- Compare up to three plans.
- Submit data, budget, validity and network preferences for ranked recommendations.
- Register, log in and log out.
- Simulate checkout and persist a demo transaction.
- View the authenticated user's demo recharge history.

## Non-functional requirements
- Typed frontend and backend; validated inputs.
- Password hashing, HttpOnly JWT cookie, rate-limited auth.
- Responsive and keyboard-usable UI.
- Relational constraints and indexed lookup fields.
- Clear disclosure of demo data and simulated payments.

## Assumptions / exclusions
No carrier API, real payment, real SIM ownership verification, live plan claims, telecom usage integration or production payment handling. Data in the seed file is fictional and labelled illustrative.

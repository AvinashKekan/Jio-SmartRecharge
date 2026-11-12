# Recommendation engine

Each candidate receives a 0–100 heuristic score from five dimensions: data fit (35%), budget fit (25%), validity fit (20%), 5G fit (10%), and voice/SMS fit (10%). The weighted score is explainable and returned with component scores and a plain-language reason. Hard exclusion is not used for budget or 5G: a customer can still see a near match with a lower score. The engine ranks only active plans. Scores are estimates, not guarantees.

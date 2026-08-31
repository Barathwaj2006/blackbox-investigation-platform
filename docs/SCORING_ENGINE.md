# Deterministic Scoring Engine

Unlike opaque machine learning models, BlackBox utilizes a **deterministic mathematical engine** to rank competing hypotheses. This ensures that every investigative conclusion can be audited, explained, and defended in a court or review setting.

## The Formula

The score for any Hypothesis ($H$) is calculated as:

$$ Score(H) = BaseScore + \sum (Contribution_{Support}) - \sum (Contribution_{Contradict}) $$

Where the BaseScore is always `10`.

### Evidence Contribution

Every time an Evidence Artifact ($E$) is linked to a Hypothesis, its contribution is calculated as:

$$ Contribution = Strength \times Confidence \times VerificationMultiplier $$

#### 1. Strength (1-10)
How strongly does this evidence support or contradict the theory? (Defined by the investigator upon linking).

#### 2. Confidence (0.0 - 1.0)
How intrinsically reliable is the source? (Defined by the investigator upon creation, normalized to a decimal).

#### 3. Verification Multiplier
The most critical factor. As evidence moves through the review pipeline, its weight dynamically shifts:

- **`VERIFIED`**: `1.0` (Full weight applied)
- **`UNVERIFIED`**: `0.5` (Half weight applied, pending peer review)
- **`DISPUTED`**: `0.2` (Severely discounted due to conflicting accounts)
- **`REJECTED`**: `0.0` (Mathematically zeroed out)

## Trigger Mechanics

The Scoring Engine recalculates a hypothesis score whenever:
1. A new relationship is linked to it.
2. An existing relationship is severed.
3. The verification state of an attached evidence artifact is changed (e.g. from `UNVERIFIED` to `VERIFIED`).

## Explainability 

Instead of expecting investigators to do the math, the engine translates the calculation into human-readable causal arrays:

```json
[
  "+ 5.7 points from VERIFIED digital artifact E-017",
  "(Artifact E-042 provides 0 points because it is UNVERIFIED)",
  "- 6.2 points from VERIFIED digital artifact E-051"
]
```
These arrays are saved directly onto the `Hypothesis` document in MongoDB and exposed to the frontend, resulting in total transparency.

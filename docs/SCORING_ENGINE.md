# BlackBox Dynamic Scoring Engine

The BlackBox Dynamic Scoring Engine computes analytical confidence scores for competing hypotheses based on the totality of linked evidence artifacts, their intrinsic confidence, and their investigative verification status.

---

## 1. Mathematical Scoring Formula

For any hypothesis $H$, the net confidence score is calculated as the sum of all supporting evidence links minus all contradicting evidence links:

$$\text{Score}(H) = \sum_{e \in \text{Support}} \text{Contribution}(e) - \sum_{e \in \text{Contradict}} \text{Contribution}(e)$$

Where the **Contribution** of a linked evidence item $e$ is:

$$\text{Contribution}(e) = \text{Strength} \times \left(\frac{\text{ConfidenceScore}}{100}\right) \times \text{VerificationMultiplier}$$

---

## 2. Verification State Multipliers

Evidence artifacts undergo forensic verification. The verification state scales the artifact's mathematical weight:

| State | Multiplier | Rationale |
|---|---|---|
| `VERIFIED` | **1.0x** | Fully corroborated and validated evidence. Full mathematical weight applied. |
| `UNVERIFIED` | **0.5x** | Preliminary or uncorroborated evidence. Subject to a 50% discount to prevent premature bias. |
| `DISPUTED` | **0.2x** | Evidence with conflicting reports or questionable chain of custody. Discounted to 20% impact. |
| `REJECTED` | **0.0x** | Disproven, contaminated, or fabricated evidence. Zero impact on hypothesis scores. |

---

## 3. Link Strength Scale

Investigators rate the directness and significance of each link on an integer scale from **1 to 10**:
- **1 – 3 (Weak)**: Circumstantial or peripheral connection.
- **4 – 7 (Moderate)**: Relevant corroborating or disproving indicator.
- **8 – 10 (Strong)**: Direct forensic artifact (e.g. verified cryptographically signed logs, direct endpoint traces).

---

## 4. Example Calculation

Consider a hypothesis $H_1$ with 3 linked evidence items:

1. **Firewall Log Spike** (`SUPPORT`):
   - Strength: `8`
   - Confidence: `90%`
   - State: `VERIFIED` (1.0x)
   - Contribution: $8 \times 0.90 \times 1.0 = \mathbf{+7.20}$

2. **Corrupted USB Dump** (`CONTRADICT`):
   - Strength: `4`
   - Confidence: `60%`
   - State: `UNVERIFIED` (0.5x)
   - Contribution: $4 \times 0.60 \times 0.5 = \mathbf{-1.20}$

3. **Disputed Alibi Record** (`CONTRADICT`):
   - Strength: `5`
   - Confidence: `80%`
   - State: `DISPUTED` (0.2x)
   - Contribution: $5 \times 0.80 \times 0.2 = \mathbf{-0.80}$

### Result:
$$\text{Score}(H_1) = 7.20 - 1.20 - 0.80 = \mathbf{+5.20}$$

---

## 5. Score Explainability Output

For total audit transparency, every calculation produces human-readable factor descriptions stored in `hypothesis.explainability` and rendered in the **Why this score?** analytical drawer:

- `+7.20: Evidence 'Firewall Log Spike' supports (strength 8, confidence 90%, state VERIFIED)`
- `-1.20: Evidence 'Corrupted USB Dump' contradicts (strength 4, confidence 60%, state UNVERIFIED)`
- `-0.80: Evidence 'Disputed Alibi Record' contradicts (strength 5, confidence 80%, state DISPUTED)`

Whenever an evidence item's verification status changes (e.g. an item is promoted from `UNVERIFIED` to `VERIFIED`), `updateScoresForEvidence(evidenceId)` automatically recalculates all connected hypotheses.

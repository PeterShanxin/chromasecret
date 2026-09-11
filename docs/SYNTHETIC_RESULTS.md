# Synthetic-user results

72 synthetic 2AFC trials; 6 seeds per phenotype; 96 search candidates; same-family model checks only. No human data. Indices are not recognition percentages.

The baseline is a weak, fixed camouflage candidate (signal 0.012, distractor 0.085). “True” means the synthetic generating simulator, not ground-truth human vision. The optimizer sees only fitted responses. The fitted and generating models still belong to the same family, so this is circular model validation.

| Synthetic observer | Fitted-family matches | Uncertain runs | Held-out model difference, before → after | Improved runs | Target index after | Filter attack |
|---|---:|---:|---:|---:|---:|---:|
| Normal | 4/6 | 6/6 | 0 → 0 | 0/6 | 0.13 | 0.13 |
| Mild deutan | 0/6 | 6/6 | 0.052 → 0.095 | 3/6 | 0.254 | 0.254 |
| Strong deutan | 3/6 | 5/6 | 0.072 → 0.501 | 6/6 | 0.752 | 0.752 |
| Mild protan | 3/6 | 6/6 | 0.056 → 0.086 | 3/6 | 0.228 | 0.228 |
| Strong protan | 5/6 | 4/6 | 0.085 → 0.446 | 6/6 | 0.703 | 0.703 |

A filter attack equals the target index by construction. No result here demonstrates invisible text, successful human recognition, or a diagnostic test. Protan/deutan identification failures and negative improvements are retained in the JSON. The search maximizes a saturating, leakage-penalized objective, not raw target-minus-typical separation; the two can move in different directions.

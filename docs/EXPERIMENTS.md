# Experiment log

## 00 - Scientific feasibility, 2026-09-10 (before implementation)
Hypothesis: chromatic distractor collapse may produce a bounded-attention advantage.
Implementation decision: compare equal-Y and near-nullspace palettes, include an informed adversary, and keep empirical trials separate from simulation scores.
Observation: published camouflage and hidden-digit research supports task-specific advantages but not universal exclusivity.
Result: implement an experimental tool, not a diagnostic or encryption product.
Next decision: verify color mathematics, compare synthetic observers, exercise every session in Chromium, then report human validation as unmeasured.

## 01 - Signal and geometry separation
Hypothesis: glyph-dependent dot sizes or density would produce an uncontrolled spatial cue.
Implementation: fix dot/site/noise geometry independently of glyph membership; change only the palette assignment. Compare nominal equal-Y distractors with relaxed near-nullspace distractors. Use paired nuisance samples in design-level scoring.
Observation: seeded geometry is reproducible. Equal-Y color design can eliminate a nominal luminance step before clipping/quantization; actual rasters still require independent checking.
Result: implemented dots, true nearest-site Voronoi cells, correlated multiscale noise and microdots. No copied plate artwork.
Next decision: evaluate the target model and stronger image-processing adversaries, not merely target visibility.

## 02 - Failed unbounded scoring rule
Hypothesis: maximizing raw target-minus-typical separation would produce useful camouflage.
Implementation: initial linear visibility reward with leakage penalties.
Observation: it could reward an already obvious glyph when both target and typical indices increased. Visual inspection of known-text renders exposed this failure; that inspection was not a blinded human participant experiment.
Result: rejected the unbounded reward. Current objective uses saturating target and typical utilities plus channel/saturation, luminance, gamut and display-uncertainty penalties.
Next decision: test the new objective across synthetic phenotypes and preserve failures rather than converting indices into recognition percentages.

## 03 - Synthetic assessment-to-search pipeline
Hypothesis: the complete adaptive/fitting/search pipeline should improve the chosen camouflage proxy most for stronger simulated deficiencies and should not invent an advantage for normal vision.
Implementation: 5 observer types × 6 deterministic seeds; 72 adaptive 2AFC trials per run; 96 candidate evaluations; fixed weak camouflage baseline. Hold the generated RGB samples fixed when evaluating the held-out generating observer, rather than regenerating the palette under that observer. This prevents a subtle stimulus/observer confound.
Observation: mean held-out model differences, before → after:

| Synthetic observer | Baseline difference | Optimized difference | Improved runs |
|---|---:|---:|---:|
| Normal | 0.000 | 0.000 | 0/6 |
| Mild deutan | 0.052 | 0.095 | 3/6 |
| Strong deutan | 0.072 | 0.501 | 6/6 |
| Mild protan | 0.056 | 0.086 | 3/6 |
| Strong protan | 0.085 | 0.446 | 6/6 |

Family identification was weak: mild deutan 0/6 and strong deutan 3/6 exact family matches; all mild runs and 5/6 strong-deutan runs were marked uncertain. This is a reason to retain uncertainty and use empirical recognition responses, not to claim diagnostic sensitivity.
Result: the software behaves plausibly within its own assumptions, but the fitting and generating simulators are related. This is circular model validation, not validation of human perception. Raw outputs are retained in `synthetic-results.json`.
Next decision: human testing is required before claiming any selective readability.

## 04 - Equal-Y versus relaxed confusion direction
Hypothesis: a relaxed confusion direction might increase distractor collapse but introduce extra luminance structure.
Implementation: paired comparison of the two direction constraints on the selected candidates from the 12 strong-deficiency synthetic runs; all other parameters unchanged. These are fitted-model scores, separate from the held-out table above.
Observation: average equal-Y difference 0.360, objective 0.244; relaxed difference 0.403, objective 0.275. Average analytical grayscale separation rounded to 0.009 for each. The signal remains orthogonal to nominal Y in both families; changing the distractor direction alone does not necessarily create a foreground/background mean-Y step.
Result: keep both families rather than selecting one dogmatically. Finite rasters, anti-aliasing, clipping and quantization can still produce leaks. Actual-raster grayscale, channel and edge diagnostics are displayed but not optimized inside the palette worker.
Next decision: compare these families using real responses rather than treating a modest proxy difference as conclusive.

## 05 - Informed normal-observer adversary
Hypothesis: a deterministic target simulation is itself an attack available to a normal observer.
Implementation: grayscale, separate RGB channels, saturation, contrast, mask-informed covariance decoder, target transform, actual-raster edge and coarse-scale diagnostics.
Observation: the CVD-filter attack equals the target-model index by construction. Strong-deutan mean target index 0.752 and filter index 0.752; strong-protan 0.703 and 0.703. Single-channel diagnostics also recover substantial signal.
Result: secrecy against informed/processed viewing fails. No percentage or security badge is shown for the model estimates. The product is framed as an experimental unaided-viewing advantage.
Next decision: even a successful target/control demonstration must disclose this attack.

## 06 - Browser workflow and export regression
Hypothesis: the full local pipeline should work without backend services or fabricated participant results.
Implementation: Chromium 144 desktop and 390 CSS-pixel mobile tests, all seven display substages, 36 scripted assessment responses, 12 blinded optimization responses, all four renderers, bilingual text, 20 paired verification responses, all seven perturbations, clean PNG downloads and research/adversary views. Correct/incorrect and target-absent response paths were exercised.
Observation: **64 browser assertions passed**, no application JavaScript errors, no HTTP/HTTPS requests during the tested workflow. The worker is created once and reused; the main-thread fallback also works. PNGs were parsed as 640×400 images and contained no tEXt/zTXt/iTXt chunks. Export from an attack view matched export from Original byte-for-byte. Mobile views had no page overflow; DPR dither raster sizing was checked.
Result: fixed ambiguous accessible labels; added modal Escape/focus behavior, display recalibration restart and complete data reset. Fixed a verification design error so nonblank strings cover every perturbation and blank trials do not replace the contrast/JPEG conditions.
Test-environment limit: managed Chromium policy blocks URL navigation. The actual self-contained HTML was executed via `page.set_content`. The main workflow used explicitly mocked localStorage; blocked-native-storage fallback was tested separately. Persistent origin-based browser storage was not verified here. Scripted answers and exposed test-only React state are automation fixtures, not participants or machine recognition. That instrumentation is absent from the delivered app.
Next decision: run the documented same-device target/control protocol with people. Do not import the automated fixtures as user evidence.

## 07 - Mathematical and serialization checks
Hypothesis: core transformations, reproducibility and scoring invariants should withstand independent unit checks.
Implementation: Node built-in test runner with reference values and round trips for sRGB, XYZ/D65, CIELAB/D65, OKLab and HPE LMS; Machado tables/interpolation; gamut checks; deterministic randomness and search; luminance constraints; staircase updates; uncertainty; Unicode matching; raw profile serialization; actual-response influence.
Observation: **35 tests passed, 0 failed**. Build uses strict TypeScript. Final standalone app includes required third-party notices and no external assets.
Result: numerical/software regressions checked. This does not validate the response link, spatial-vision assumptions, phenotype inference or human camouflage.

## Current conclusion
The software MVP is operational and locally reproducible. The strongest demonstrated result is a **model-level camouflage improvement for stronger synthetic deficiencies**, not a verified human “hey meow” demonstration. Mild phenotype estimation is weak, strong-deutan subtype separation is often uncertain, and informed filter attacks defeat secrecy. Actual human selective readability is **unmeasured**. The next valid experiment is a blinded same-display target/control comparison using unfamiliar text, not another polished screenshot or simulated success percentage.

# Chromasecret: feasibility before implementation

Research and design checkpoint: 2026-09-10. Status: experimental, not clinically validated.

## 1. What is and is not possible

The goal is a **task-dependent visibility advantage**, not information-theoretic secrecy. A typical observer receives the RGB image and can run the same deterministic CVD simulation used by our target model. Consequently, an unrestricted normal-vision/computational adversary can recover every cue available to that model. A favorable result requires limitations of attention, chromatic grouping, exposure time or spatial pooling. It cannot follow simply from the normal viewer having less information.

Morgan, Adam & Mollon (1992) found a dichromat advantage on particular texture tasks when irrelevant red/green coloring interfered with normal observers. That is evidence for camouflage interference, not a demonstration of arbitrary secret sentences. Miyahara (2009) measured hidden-digit plates: residual S-cone differences can support reading despite L/M distractors, including for some normal observers. Therefore this MVP tests chromatic distractor collapse with a retained chromatic signal. It never calls an image secure or invisible.

## 2. Calibration and assessment boundaries

- **Clinical diagnosis:** validated instruments, suitable viewing conditions and professional interpretation. Not supplied.
- **Web phenotype estimation:** procedural, repeated forced-choice discrimination responses fit to approximate model families; results are tentative, potentially unidentifiable and device-dependent.
- **Hardware calibration:** measurements of luminance, primary spectra, white point, transfer functions and an appropriate correction. Requires instrumentation. Not supplied.
- **Perceptual setup:** near-black/near-white visibility, spatial dither matches, channel consistency and viewing-condition self-reports. Supplied. These do not measure gamut, physical luminance or primary spectra.

The dither midpoint gives gamma = ln(0.5)/ln(code), conditional on a pure-power transfer curve, successful spatial fusion, no clipping and no spatial processing. Modern sRGB is not a pure gamma curve. Browser zoom, OS scaling, panel subpixels, HDR, adaptive brightness and color management can invalidate the match. The UI uses device-pixel patterns, asks for 100% browser zoom, reports disagreement, and does not silently apply a dubious LUT. Cross-channel matches by a CVD observer cannot identify physical RGB gains; these are deliberately not inferred. Display setup bounds the safe working range and controls uncertainty penalties. The same setup applies to both training and generated images.

## 3. Candidate mechanisms and rejected alternatives

Flat color pairs cannot establish exclusive CVD information. They are a baseline, not the proposed mechanism. The main family uses many randomly placed colors along a model-confusion direction, with a weaker independent glyph signal. Multi-cluster/spatial organization can reduce distractor salience after simulation. Candidate geometry must be independent of the glyph mask: the mask changes color, never dot count, size, position or outline.

Nominal equal-CIE-Y candidates and a less constrained near-null-direction family are compared. Equal-Y reduces grayscale leakage but restricts camouflage collapse. The relaxed family can improve the chosen model while leaking luminance; it must be penalized, not advertised as a breakthrough. Dots, jittered microdots, nearest-site (Voronoi) mosaic, and correlated colored noise share the same signal model. No copied Ishihara artwork is used. A separate assessment uses controlled chromatic excursions with independent multi-level luminance noise, inspired by pseudoisochromatic test methodology, not presented as a licensed or validated Cambridge Colour Test.

### Plate families and confusion lines

Vanishing plates use figure/background colors that a particular deficiency confuses. Transformation plates regroup several color clusters so different observers report different figures. Hidden-digit plates aim for the opposite visibility pattern from vanishing plates; empirical exceptions among typical observers prevent an exclusive-visibility claim. The NRC report describes four-cluster transformation designs and explains that confusion contours vary between individuals [3]. This MVP uses continuous multi-cluster distractors rather than copying those published figures.

Classical confusion lines are represented in chromaticity coordinates. The implemented assessment directions are **model-derived approximations in nominal linear sRGB**, with or without an equal-CIE-Y constraint; they are not a measured individual's actual confusion loci. Consumer RGB primaries and unknown spectra do not let us infer personalized cone fundamentals from three web sliders.

## 4. Color models

All rendering starts in nominal linear sRGB (D65). Conversion utilities cover encoded sRGB, XYZ, CIELAB with an explicit D65 reference white, and OKLab. CIELAB here is **not CSS Lab**, which uses D50. A separate Hunt-Pointer-Estevez XYZ/LMS transform is provided as an inspectable approximation; it is not confused with the fitted LMS-like coordinates used inside OKLab.

Machado, Oliveira & Fernandes (2009), with tabulated 0.0-1.0 matrices and interpolation between adjacent entries, supplies the baseline protan/deutan/anomalous-trichromat simulation. Matrices act on **linear**, not gamma-encoded, RGB. Simulation is an approximation to appearance, not a recognition model or a personal diagnosis. Brettel, Vienot & Mollon (1997) is a relevant piecewise-LMS dichromacy alternative; it is researched but not implemented in this MVP. Tritan transforms are included for visualization and an exploratory probe only; no reliable tritan subtype/severity conclusion is claimed.

## 5. Personalization

Three interleaved, log-step, two-down/one-up 2AFC staircases probe protan-like, deutan-like and blue-yellow directions; independent easy luminance catch trials test engagement. Raw stimulus parameters, side choices, response time and correctness are retained locally. A likelihood grid fits model family, severity and response-noise scale; it reports model-conditional uncertainty rather than clinical confidence. Short series can only weakly separate protan and deutan. Empirical threshold estimates remain primary.

Personalization then uses blinded random glyph identification, including target-absent trials. Candidate predictions initiate a broad search. Each response changes a distance-weighted empirical success estimate over continuous candidate parameters. The next candidate mixes exploration, model prior and empirical expected success; it does not choose a palette from a categorical label. Unknown/incorrect/blank responses are recorded, not discarded. Held-out verification uses fresh symbols, seeds and no displayed answer. User-authored messages are explicitly marked as unblinded and cannot supply a clean recognition estimate.

## 6. Metrics and adversaries

A **bounded-pooling proxy** is the distance between foreground/background means in simulated OKLab divided by pooled total within-group color variation plus a fitted noise floor. This is intentionally not an optimal observer. Its target-minus-typical difference is a heuristic, not a percentage correct and not a validated d-prime. Simulated appearance alone does not predict attention or grouping.

The optimizer uses saturating target and typical pooling utilities and penalizes nominal luminance separation, the stronger of single-channel/saturation separation, and gamut clipping. Saturation prevents an already obvious target from earning an unlimited reward. Geometry is independent of glyph membership. Actual raster geometry/edge diagnostics are computed and reported after rendering; they are not part of the palette-only worker search. The strongest inspected attacks are shown, rather than reporting only the convenient original-color view. A mask-informed linear discriminant (covariance-normalized separation) provides a stronger adversarial diagnostic. It is labeled **oracle/mask-informed**, not an actual blind human. A CVD-filter attack is shown explicitly. Because it can equal the target simulation, robust secrecy is never asserted.

Measured exact-match accuracy and Wilson intervals are shown only after real trials. Target and control observers receive the same plate seeds and conditions, with no answer disclosure. Differences are descriptive and not a population estimate. Synthetic users validate code and explore model behavior; a model tested against itself is circular and cannot validate the scientific effect.

## 7. Failure cases and stopping rule

Typical or mild CVD, weak residual chromatic discrimination, normal observers who suppress distractors, grayscale/RGB/filter attacks, expectation from known text, long text with thin strokes, unseen glyphs in installed fonts, color quantization, resizing, JPEG, different monitors, ambient changes and severity/model misspecification can all break the effect. Local browser storage is not encryption. Exported raster contains the signal by design.

Stop claiming improvement when held-out exact-match responses do not improve or the control observer also reads the stimuli. Report negative differences and failures. No fabricated participants, percentages or successful demonstration. This implementation can establish software behavior; actual target/control validation remains to be performed by people on the target display.

## Sources

1. Morgan MJ, Adam A, Mollon JD. 1992. Dichromats detect colour-camouflaged objects that are not detected by trichromats. https://pubmed.ncbi.nlm.nih.gov/1354367/ DOI 10.1098/rspb.1992.0074.
2. Miyahara E. 2009. Chromaticity co-ordinates of Ishihara plates reveal that hidden digit plates can be read by S-cones. https://doi.org/10.1111/j.1444-0938.2009.00396.x.
3. National Research Council. 1981. Procedures for Testing Color Vision, test-construction chapter. https://www.ncbi.nlm.nih.gov/books/NBK217816/.
4. Machado GM, Oliveira MM, Fernandes LAF. 2009. A physiologically-based model for simulation of color vision deficiency. https://pubmed.ncbi.nlm.nih.gov/19834201/ DOI 10.1109/TVCG.2009.113. Numerical tables distributed in the authors' supplement, mirrored by Colorspacious: https://raw.githubusercontent.com/njsmith/colorspacious/master/colorspacious/cvd.py.
5. Brettel H, Vienot F, Mollon JD. 1997. Computerized simulation of color appearance for dichromats. https://pubmed.ncbi.nlm.nih.gov/9316278/ DOI 10.1364/JOSAA.14.002647.
6. Souza et al. 2014. Low number of luminance levels in the luminance noise increases color discrimination thresholds estimated with pseudoisochromatic stimuli. https://pubmed.ncbi.nlm.nih.gov/25566106/.
7. Cormenzana Mendez et al. 2016. Color discrimination is affected by modulation of luminance noise in pseudoisochromatic stimuli. https://pubmed.ncbi.nlm.nih.gov/27458404/.
8. Aslam et al. 2014. Optimisation and assessment of three modern touch screen tablet computers for clinical vision testing. https://pubmed.ncbi.nlm.nih.gov/24759774/.
9. Psychtoolbox: https://psychtoolbox.org/docs/CalibrateMonitorPhotometer.
10. W3C CSS Color 4, conversion algorithms and color-space conventions: https://www.w3.org/TR/css-color-4/.
11. Levitt H. 1971. Transformed up-down methods in psychoacoustics. PMID 5541744. The staircase idea is used; the short browser protocol is not a validated test.

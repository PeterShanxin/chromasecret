# First honest human experiment

## Question

Can a particular target viewer identify previously unknown text more reliably than a different, self-reported typical-color-vision viewer on the **same display under the same conditions**? This is a question to test, not a demonstrated capability.

## Preparation

Keep one display, one browser at 100% zoom, a comfortable fixed viewing distance, moderate stable room light, fixed screen brightness and all display color filters off. Check screen setup. Record changes instead of combining results across conditions. Never override accessibility settings a participant needs without their agreement; this experiment is optional.

The target completes at least 72 assessment trials where comfortable, then at least 12 blind personalization trials. Stop for eye strain. An uncertain model fit is a valid outcome. The optimizer still learns from identification answers; a label is not a clinical conclusion.

## Held-out comparison

Freeze one encoding. Run the target battery with unfamiliar random strings and blank controls. Do not expose answer keys or research JSON. Ask a distinct typical-vision participant to run the control battery without revealing any text. The same seeds and conditions are used, with different order. The default run is self-paced and response time is recorded; there is no claim of standardized exposure timing.

A two-person comparison does not establish a population effect. The eight text trials provide only rough evidence, and perturbations have too few repeats to establish robustness. Run fresh batteries to replicate a result and retain failures. Do not optimize using the same held-out trials and then present them as an independent test. Do not disclose the known “hey meow” demo before measuring recognition of fresh strings.

## Report without overclaiming

Report exact matches as k/n for target and control, Wilson intervals, blank false-recognition counts, viewing conditions, response times, and matched descriptive differences. Report negative or zero differences. A positive score from the simulator is not a substitute for these observations.

If both viewers read the text, reduce the signal or increase distractors and create a **new** test battery. If neither can read it, increase signal or change pattern family based on the target's actual responses. Stop calling the approach selective if repeated held-out batteries fail to reproduce an advantage. A low target score is a failed candidate, not evidence of stronger security.

## Adversarial check

Inspect grayscale, RGB channels, increased saturation/contrast, and the target-model transform. The target transform is an explicit attack. If it recovers a signal, report that failure even when unaided normal viewers perform poorly. This software intentionally does not certify secrecy.

## Unimplemented research extensions

A texture-orientation signal with task-irrelevant chromatic overlays would more closely reproduce some published color-camouflage tasks and is a sensible next experimental family, rather than assuming color-only glyphs will work universally. Eye-position/exposure control, calibrated primary spectra, a validated spatial pooling model and multiple independent observers would be needed for stronger scientific claims. These are not implemented or silently simulated as facts.

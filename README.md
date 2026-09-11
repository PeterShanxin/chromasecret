# Chromasecret

**A local-only, experimental color-camouflage laboratory.**

Working software, not a clinically validated test or a demonstrated secret-message channel. It searches for a *viewing-task advantage*: chromatic distractors may interfere with a typical viewer while collapsing for a particular color-vision model. Every generated image remains vulnerable to image processing. No human selective-readability success has been established for this implementation.

## Open it

Open the included `index.html` in a desktop browser. It is self-contained: no installation, account, server, analytics, API key or network connection is needed. If your chat/file app displays the source or a preview rather than executing it, save the HTML and open it in a browser.

For predictable origin-based local storage and a localhost secure context for clipboard features, use the included static server:

```sh
cd chromasecret
npm start
# Open http://127.0.0.1:5173
```

Node 20+ is required only for the optional static server and development commands. `npm start` needs no package installation. Keep using the same URL/port and browser to reuse the profile. `file://` storage behavior varies by browser; blocked storage is explicitly reported and the session continues in memory. Exporting PNG does not require a backend. Clipboard, fullscreen and native file sharing depend on browser permissions/support.


## Languages

The interface supports English and Simplified Chinese. The initial locale follows the browser language when no preference has been saved; the header language switch persists the choice locally. Experimental stimuli and authored secret-message text are never translated. Scientific model names such as protan, deutan, tritan, CIELAB and Machado remain explicit where useful.

## Deploy

The repository includes `vercel.json`. Vercel can deploy it as a static site by running `npm run build` and publishing `dist/`. No server-side functions, analytics, accounts, or runtime network access are required. A GitHub Actions workflow also builds and runs the numerical test suite on pushes and pull requests.

## The six sessions

| Session | Implemented behavior |
|---|---|
| Welcome | Device/lighting caveats; real procedural demo; no prefilled human accuracy |
| Display | Viewing conditions, black/white visibility, three gray dither matches, RGB within-channel matches, merging sanity check, uncertainty and restart |
| Vision | 36/72-trial interleaved adaptive 2AFC test; protan/deutan and exploratory blue-yellow axes; catch trials; likelihood/severity/noise grid; raw responses and uncertain results |
| Personalize | Unknown random glyphs, blank controls, continuous candidate parameters, empirical response-weighted search, deliberate exploration |
| Create | Dots, nearest-site Voronoi mosaic, multiscale noise and microdots; multiline Unicode; strength/balance; inversion; research transforms; PNG/copy/share |
| Verify | Same ten unknown plates for target and second participant in different orders; eight strings and two blanks; free responses; Wilson intervals; matched descriptive difference; seven pixel perturbations |

The authored message is **not** used to calculate blinded recognition accuracy. It starts with “hey meow,” but real verification uses unfamiliar random text. Trial answers are held in local state/storage for scoring, not hidden against a technically informed user. The purpose is participant blinding, not cryptographic answer concealment.

## What the science supports, and what it does not

Read [`docs/FEASIBILITY.md`](docs/FEASIBILITY.md) for sources and assumptions. That note was written before the optimizer and updated with actual implementation boundaries.

- Display setup is perceptual, **not hardware colorimetry**. Nominal sRGB math is retained rather than silently applying a questionable gamma correction.
- The phenotype/severity result is an approximate model fit, **not diagnosis** or a percentage of vision lost. Short protan/deutan series often remain unresolved; the synthetic benchmark confirms this weakness.
- Machado transforms are appearance approximations. The pooling model is an additional, unvalidated recognition assumption.
- A normal viewer can apply the target transform. Its attack index equals the target index. The UI reports this failure prominently.
- Only actual recorded responses populate participant recognition statistics. The code cannot authenticate that a respondent is human or that the control is a distinct observer.

## Development and tests

```sh
npm install        # only needed to obtain TypeScript for a source rebuild
npm run build      # strict TS compile + offline single-file bundler
npm test           # Node built-in test runner, compiled modules
npm run experiment # deterministic synthetic observer benchmark
```

The prebuilt `build/` modules are included, so unit tests and simulations also run without installing dependencies. Rebuild before tests after editing source.

Optional browser regression suite:

```sh
python -m pip install playwright
python scripts/browser_test.py
```

The harness uses `/usr/bin/chromium` in this environment; set the executable path for your installation. It injects the actual self-contained app with `set_content` because managed sandbox policy blocks URL navigation. The main storage adapter is explicitly mocked for workflow checks, with blocked-native-storage and missing-worker fallbacks tested separately. Native persistent origin storage was not verified in this sandbox. Browser answers are scripted fixtures, not participant evidence.

Results are in `docs/browser-results.json`, `docs/SYNTHETIC_RESULTS.md`, `docs/synthetic-results.json`, and `docs/EXPERIMENTS.md`.

## Implementation choices

React + strict TypeScript + Canvas 2D, a reusable Blob Web Worker, localStorage, deterministic seeded random generation, and a tiny static development server. No backend, external fonts, CDN, package runtime fetches, copied Ishihara artwork or remote telemetry. A restrictive Content Security Policy blocks network connections.

**Offline build constraint:** the available vendored runtime is React 16.0.0 / ReactDOM 16.0.1, not a current React/Vite starter. The app uses class components and a small CommonJS bundle wrapper to remain fully runnable here. This is a transparent prototype compromise, not a recommendation to start a public production deployment on that old runtime. Upgrade the runtime/tooling and perform a dependency/accessibility/security audit before a public launch. The application modules are separate from the bundler and portable to Vite.

## Source layout

```text
src/color/          sRGB, XYZ/D65, Lab/D65, OKLab, HPE LMS, Machado tables
src/psychophysics/  adaptive trials, model fitting, intervals and response matching
src/stimulus/       deterministic palettes, glyph masks, geometry, rendering, raster audit
src/optimizer/      random/local search, leakage proxies, response personalization, worker
src/profile/        device-bound profiles and local persistence
src/export/         standalone PNG and clipboard/file export
src/components/    experimental canvases
src/App.tsx         six-session interface
```

## Privacy and portability

A profile contains screen settings, randomized test answers, responses, timing, candidate parameters and verification history. Your **authored message is kept in memory and omitted from the saved profile**. Research JSON includes random challenge answers; don't share it when preserving participant blinding. Local storage is not encrypted and is accessible to others using the same browser profile and potentially extensions. “Erase local data” requires a second click.

PNG export creates a fresh raster, no added text metadata or plaintext filename. Pixel values still encode the message. A screenshot, resizing, JPEG, a different panel or changed viewing conditions may destroy or reveal the effect. Revalidate the receiving display; never use this to protect sensitive information.

## Known scope limits

No clinical norms, colorimeter support, spectral calibration, validated tritan severity, independent observer model, actual spatial vision model, real participant data, hosted test URLs, or automatic control-group-driven optimization. The control battery measures the current encoding but does not silently feed control responses into the training objective. Raster edge diagnostics are reported after generation, not incorporated in the palette-only search. Arbitrary Unicode depends on installed fonts; long sentences are supported but often require unreadably fine strokes. Start with one character, then short words.

Original project code is MIT licensed. Third-party notices and numerical-model attribution are included.

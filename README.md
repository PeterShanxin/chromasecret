# Chromasecret

**A local-only, experimental color-camouflage laboratory.**

[Open the live experiment](https://chromasecret.vercel.app/) | [简体中文](README.zh-CN.md) | [Scientific feasibility](docs/FEASIBILITY.md)

Working software, not a clinically validated test or a proven secret-message channel. It searches for a viewing-task advantage: chromatic distractors may interfere with a typical viewer while collapsing for a particular color-vision model. Generated images remain vulnerable to image processing. No human selective-readability success has been established for this implementation.

## Use it

Open the live site or the self-contained `index.html`. No account or installation is required. The interface supports English and Simplified Chinese, follows the browser language initially, and remembers the header language switch locally. Experimental stimuli and authored messages are never translated.

For a stable local origin, run `npm start` with Node.js 20+ and open `http://127.0.0.1:5173`. Serving the committed HTML requires no package installation. Use the same browser, URL and display to reuse your profile. Changing devices, zoom, lighting or color filters invalidates the viewing assumptions.

## Six sessions

| Session | Purpose |
|---|---|
| Welcome | Device and lighting caveats, procedural demo, no invented accuracy |
| Display | Black/white visibility, repeated midtone and RGB matches, viewing conditions |
| Vision | Adaptive discrimination trials, approximate protan/deutan model fitting, uncertainty |
| Personalize | Blinded random glyphs, blank controls, response-weighted candidate search |
| Create | Dots, mosaic, noise and microdots; Unicode; inversion; PNG export; research views |
| Verify | Paired unfamiliar plates for target/control participants, free responses, perturbation tests |

Start with one character, then short words. Long sentences are supported but fine strokes may become unreadable. Arbitrary Unicode depends on installed fonts. Your authored message is not used to calculate blinded recognition accuracy; verification uses unfamiliar random text.

## Privacy and limitations

All perception calculations and message rendering happen in the browser. There is no application backend, analytics, external font, remote translation service or upload endpoint. A restrictive Content Security Policy blocks runtime network connections. The static hosting provider still serves the page and receives ordinary page requests.

Profiles and randomized trial responses are stored locally when available. Authored messages stay in memory and are omitted from saved profiles. Shared-device users and browser extensions may access local data; it is not encrypted. Research JSON contains challenge answers and response history, so preserve participant blinding when sharing it.

PNG export creates a fresh raster without added plaintext metadata or a plaintext filename. The pixels still encode the message: screenshots, resizing, JPEG and color filtering can destroy or reveal the effect. Never use this tool to protect sensitive information.

- Display setup is perceptual, not hardware colorimetry.
- Phenotype/severity is an approximate model fit, not a diagnosis or a percentage of vision lost.
- Machado transforms approximate appearance. The pooling/recognition objective is an additional, unvalidated hypothesis.
- A typical viewer can apply the target CVD transform. The interface reports that attack explicitly.
- The code cannot authenticate that the control is a distinct observer or that a respondent is human.

See [FEASIBILITY](docs/FEASIBILITY.md), [PROTOCOL](docs/PROTOCOL.md), [EXPERIMENTS](docs/EXPERIMENTS.md), and [synthetic results](docs/SYNTHETIC_RESULTS.md) for assumptions, failures and measured software behavior.

## Development

```sh
npm ci
npm run build
npm test
npm run experiment
npm start
```

The build uses pinned TypeScript and writes `index.html` and `dist/index.html`. Compiled `build/` modules and `node_modules/` are not committed; build before running numerical tests or simulations.

Optional real-origin browser regression:

```sh
python -m pip install playwright==1.57.0
python -m playwright install chromium
# With npm start running in another terminal:
python scripts/i18n_smoke.py
# To inspect the deployed site instead:
CHROMASECRET_URL=https://chromasecret.vercel.app/ python scripts/i18n_smoke.py
```

The new smoke suite tests native storage across reloads, language detection/switching, all session headings, 390px layouts, Unicode preservation, generation, PNG export and absence of application network requests. GitHub Actions runs it against localhost and, on main, the current live release. These are scripted software checks, not human perceptual evidence. The older `scripts/browser_test.py` uses a documented injected-document/mocked-storage harness; do not conflate its results with native-origin checks.

## Hosting

`vercel.json` builds the source and publishes `dist/` as a static site. The initial live release was deployed directly through Vercel from a checksum-pinned GitHub artifact. **A GitHub push currently runs CI but does not automatically redeploy Vercel.** This repository and the Vercel project have not yet been connected through Git Integration. See [deployment details](docs/DEPLOYMENT.md). The CI production smoke step checks the current release; it is not a deployment action.

## Architecture

React + strict TypeScript + Canvas 2D + reusable Blob Web Worker, deterministic seeded random generation and localStorage. Separate `src/color`, `psychophysics`, `stimulus`, `optimizer`, `profile`, `export`, and `components` modules. UI translations live in `src/i18n.ts`.

**Prototype runtime caveat:** vendored React 16.0.0 / ReactDOM 16.0.1 and a small CommonJS bundler were used for the offline prototype. This is an experimental public demo, not production-hardened medical software. Upgrade the runtime/tooling and perform dependency, accessibility and security audits before treating it as a production product.

Original project code is MIT licensed. Third-party notices and numerical-model attribution are included.

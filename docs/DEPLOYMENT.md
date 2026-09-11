# Public deployment

- Site: https://chromasecret.vercel.app/
- Repository: https://github.com/PeterShanxin/chromasecret
- Vercel project: `chromasecret` / `prj_6RNngJ8g9rH50ArEO5tKqhixN3Ix`
- Current deployment: `dpl_8wktApdHdoGrbT2Ehu1aWajXdCsa`
- Target: production; state confirmed READY
- Application source commit: `5e0ae6e65f35e8c1cca1c2f9803170a57026cef7`
- Deployed HTML: 484707 bytes
- SHA-256: `f0bd0480ec9055a7812d4ebeb7dbcf5348ec33a038dc46df1e1a711b24503451`
- Public release manifest: https://chromasecret.vercel.app/build-info.json

The release uses a minimal Vercel build that fetches `index.html` from the immutable GitHub commit, verifies its SHA-256, and writes it to `dist/`. This fetch happens at build time, not in users' browsers. The published application is self-contained. No account credentials, participant responses or authored private messages are deployed.

The first deployment was `dpl_FxSK8n5y5itzR5prnxWa3VoFCfYw` from commit `323ba4423a9789f32e21f9342c5f6048e7b8bc0a`. Browser inspection uncovered a translated `<option>` value bug. The current release explicitly assigns canonical option values and adds regression checks that language switching preserves the chosen camouflage strength. The numerical suite still passes all 35 tests.

## Subsequent releases

This Vercel project is **not linked to GitHub Git Integration**. Commits trigger GitHub Actions build/tests, not Vercel deployment. Connect this repository to the existing Vercel project through its Git settings for push-to-deploy, or redeploy explicitly after building. Root `vercel.json` contains the source build settings (`npm run build`, output `dist/`, framework Other).

The production smoke step verifies the currently deployed site independently of the checked-out source. It must not be interpreted as proof that the newest commit has been deployed. Use the manifest and deployment metadata for release provenance. Documentation/test-only commits can follow the published application commit without changing the generated HTML.

## Verification

The restored source archive passed SHA-256 and ZIP CRC checks on GitHub Actions. Rebuilt release HTML passed its own SHA-256 check before being committed and deployed. `scripts/i18n_smoke.py` supports a real-origin mode for localhost and public HTTPS. It tests browser-language detection, persistent locale after reload, all stage headings, mobile horizontal overflow, stable select values, authored Unicode preservation, generation, PNG output, and no additional HTTP(S) requests during the measured interactions.

CI stores run-specific JSON reports and screenshots as artifacts. Scripted tests are not evidence of human selective readability. Older browser-test documentation explicitly uses mocked storage; the new native-origin suite is separate. One-time transfer/repair workflows and archive fragments have been removed from the current tree.

# Initial public deployment

- Site: https://chromasecret.vercel.app/
- Repository: https://github.com/PeterShanxin/chromasecret
- Vercel project: `chromasecret` / `prj_6RNngJ8g9rH50ArEO5tKqhixN3Ix`
- Deployment: `dpl_FxSK8n5y5itzR5prnxWa3VoFCfYw`
- Target: production
- Application source commit: `323ba4423a9789f32e21f9342c5f6048e7b8bc0a`
- Deployed HTML: 484687 bytes
- SHA-256: `9ffe4cb953afcb1af0f63345279ba734f53a8b0879a509a434f8dcb7d34d4419`
- Public release manifest: https://chromasecret.vercel.app/build-info.json

The initial release used a minimal Vercel build that fetched `index.html` from the immutable GitHub commit, verified its SHA-256, and wrote it to `dist/`. This fetch happens at build time, not in users' browsers. The published application is self-contained. No account credentials, participant responses or authored private messages are deployed.

The Vercel connector's HTML-import action only accepted Claude-hosted bundles, so it was not used. The direct deployment action successfully published the checksum-verified artifact.

## Subsequent releases

This initial Vercel project is **not linked to GitHub Git Integration**. Commits trigger GitHub Actions build/tests, not Vercel deployment. Connect this repository to the existing Vercel project through its Git settings for push-to-deploy, or redeploy explicitly after building. `vercel.json` contains the source build settings (`npm run build`, output `dist/`, framework Other).

The production smoke step verifies the currently deployed site independently of the checked-out source. It must not be interpreted as proof that the newest commit has been deployed. Use the manifest and deployment metadata for release provenance.

## Verification

The restored archive passed SHA-256 and ZIP CRC checks on GitHub Actions. The numerical suite passed all 35 tests. `scripts/i18n_smoke.py` supports a real-origin mode for both localhost and public HTTPS. It tests browser-language detection, persistent locale after reload, all stage headings, mobile horizontal overflow, authored Unicode preservation, generation, PNG output, and no additional HTTP(S) requests during the measured interactions.

CI stores run-specific JSON reports and screenshots as artifacts. Scripted answers are not evidence of human selective readability. Older browser-test documentation explicitly uses mocked storage; the new native-origin suite is separate.

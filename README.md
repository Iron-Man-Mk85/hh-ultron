# HH Ultron

HH Ultron is an HH++ BDSM add-on for hiding ads, dismissing selected popups, and adding keyboard shortcuts for Kinkoid games. Install [HH++ BDSM](https://github.com/zoop0kemon/hh-plus-plus/) and the [stable userscript](https://raw.githubusercontent.com/Iron-Man-Mk85/hh-ultron/main/hh-ultron.user.js) in your userscript manager.

## Development

Edit the TypeScript modules in `src/modules/`. `src/index.ts` starts Ultron and registers the modules with HH++. `package.json` supplies the version for both the userscript header and the HH++ tab. Record changes in `CHANGELOG.md`.

Run `npm ci` with Node.js 20 or newer.

| Command | Result |
| --- | --- |
| `npm run build:testing` | Writes the minified `hh-ultron-dev.user.js` and a transition copy for the old Dev install URL on `testing`. |
| `npm run watch` | Rebuilds the testing userscript when source files change. |
| `npm run build` | Writes a minified stable userscript to `dist/hh-ultron.user.js`. |
| `npm run check` | Type-checks the source and verifies the committed testing userscript. |

Install the [Dev userscript](https://raw.githubusercontent.com/Iron-Man-Mk85/hh-ultron/testing/hh-ultron-dev.user.js) from the testing branch in Tampermonkey and enable one channel at a time. Existing Dev installs can update through the transition copy, which keeps the same namespace and points to the new update URL.

For an approved stable release, use a release branch. Run `npm run build:release` to write the stable build to the root and remove the Dev artifact, then run `npm run check -- stable` before opening the PR to `main`. Regenerate the testing build after syncing `main` into `testing`.

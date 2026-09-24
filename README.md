# ANS Vercel Demo

A standalone, interactive demonstration of the ANS SEBI workflow, packaged for GitHub and Vercel. The original PRAXEN workspace is unchanged.

## Included

- 53 saved SEBI records, their classified events, taxonomy and source-linked findings.
- All updates / For you / Saved views, search, topic, date and document-type filters.
- Three starting subscription profiles, subscription editing and new profiles.
- Event-level subscription matching, including taxonomy inheritance, exclusions and combined conditions.
- Read/saved state and profile changes retained in this browser's local storage.
- 53 preserved PDF sources with SHA-256 hashes and page-specific evidence links.
- Direct links to `/`, `/updates-view`, `/subscriptions` and `/documents-view`.

The snapshot capture timestamp and PDF hashes are in `public/snapshot-manifest.json`. This is historical saved evidence, not a live regulatory feed. Existing review labels are preserved; inclusion does not constitute new legal approval.

## Limits of this temporary deployment

This is a saved-record interactive demo. It does not run the local Python backend. Uploads, new classification, corpus building, human approval writes, live collection, PRAXEN client assessments and newsletters are not included. No API key or model billing is needed.

Changes remain in the current browser and are not shared with other visitors or synchronised to the local ANS database. The **Reset demo** button clears these changes. Clearing site data also resets them. The bundled source PDFs and snapshot are accessible to anyone who can access the deployed site.

## Run locally

Use Node.js 22.12 or later.

```sh
npm ci
npm run dev
```

For a production build:

```sh
npm run build
npm run preview
```

## GitHub → Vercel

1. Create an empty GitHub repository named `ans-vercel-demo`. Do not initialise it with another README.
2. From this folder, connect and push the existing local Git repository:

```sh
git remote add origin https://github.com/YOUR-USERNAME/ans-vercel-demo.git
git push -u origin main
```

3. In Vercel, choose **Add New → Project**, then import that GitHub repository.
4. Use the repository root (`./`), framework **Vite**, install command `npm ci`, build command `npm run build`, and output directory `dist`. These settings are also supplied by `vercel.json`.
5. Deploy. No environment variables, external database or running Mac server are required.

Other computers can then clone it using:

```sh
git clone https://github.com/YOUR-USERNAME/ans-vercel-demo.git
cd ans-vercel-demo
npm ci
npm run dev
```

A GitHub repository and Vercel deployment have not been created by preparing this folder. The placeholder URL above must be replaced with your repository URL.

## Verification

```sh
npx playwright install chromium
npm run dev -- --port 4178
# In a second terminal:
npm test
```

The test checks 15 saved reference cases against the original Python engine's output, browser-local persistence, direct routes, source hashes and reset. `tests/matching.json` records the original engine's expected results for this snapshot. Re-export these reference cases if the dataset changes. A GitHub Actions workflow checks the production build on pushes and pull requests.

## Origin and isolation

Adapted from the local ANS SEBI frontend and accepted saved records in PRAXEN. The browser-only data adapter replaces local backend requests for the supported demonstration actions. No `.env`, API secrets, SQLite database, raw model response archive, virtual environment or dependency directory is included in Git.

Vercel reference: https://vercel.com/docs/frameworks/frontend/vite

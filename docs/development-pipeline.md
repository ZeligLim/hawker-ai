# Development and deployment pipeline

The application uses GitHub Actions as its release gate and Vercel for hosting. `main` is the production branch.

## Change flow

1. Create a feature branch and open a pull request against `main`.
2. The `CI/CD / quality` check runs `npm ci`, lint, TypeScript, unit tests, and a production build.
3. Pull requests from this repository deploy a Vercel Preview after the quality job passes. Pull requests from forks still run the quality checks but do not receive secrets or deploy previews.
4. Merge to `main` runs the production workflow after the same quality checks pass. The workflow applies pending Supabase migrations first, then builds and deploys the application to Vercel Production.

The Vercel Git integration's builds are skipped by `vercel.json`; GitHub Actions owns preview and production deployments so production migrations finish before the application deploys.

## GitHub configuration

The repository variables below have been set:

- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `SUPABASE_PROJECT_ID`

Set these environment secrets in GitHub **Settings → Environments**:

| Environment | Secret | Purpose |
| --- | --- | --- |
| `Preview` | `VERCEL_TOKEN` | Deploy pull request previews |
| `Production` | `VERCEL_TOKEN` | Deploy the production app |
| `Production` | `SUPABASE_ACCESS_TOKEN` | Link the Supabase project from CI |
| `Production` | `SUPABASE_DB_PASSWORD` | Apply production migrations |

Create the Vercel token with access to this project. Use a Supabase access token scoped to the project where possible. Keep the database password in GitHub Secrets; do not add it to repository variables or files.

The `Production` GitHub Environment can require a reviewer before its deployment job starts. Keep it restricted to the `main` branch. The production workflow is also protected by the required `CI/CD / quality` status check on `main`.

## Preview database isolation

Configure the Vercel `Preview` environment to use a separate Supabase project or an isolated Supabase branch. Do not put production Supabase credentials in Preview: pull request deployments can execute application writes.

## Database change rules

- Commit every schema change as a new SQL file under `supabase/migrations/`.
- Keep migrations forward-only and safe for the currently deployed app. Prefer expand, deploy, and contract steps for changes that alter or remove data.
- The production job runs `supabase db push` only after the application quality checks pass. A failed migration stops the Vercel production deployment.
- Review migration order when adding a new file. The workflow intentionally does not use `--include-all`, so out-of-order history stops for manual repair instead of silently applying older files.

## Local workflow

Use Node.js 24 and npm, matching CI and Vercel. Install with `npm ci`, then run:

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Supabase CLI configuration is in `supabase/config.toml`; local seed SQL is in `supabase/seed/`.

# AGENTS.md

## Project overview

The Galasa Web UI is the browser front end for [Galasa](https://galasa.dev). It is a Next.js (App Router) + React + TypeScript application using the IBM Carbon Design System. It shows test runs and results, manages access tokens and users, and holds user settings (timezone, date format, theme).

- Main application: [`galasa-ui/`](galasa-ui/) (all `npm` commands run from here)
- Gradle ([`build.gradle`](build.gradle)) is used only to download the Galasa OpenAPI spec and generate the TypeScript API client. It is not used to build the app.

## Tech stack

- Next.js, React 19, TypeScript (strict mode)
- Carbon: `@carbon/react`, `@carbon/icons-react`, `@carbon/charts-react`
- TanStack React Query for data fetching
- `next-intl` for i18n (locales: `en`, `de`)
- SCSS / CSS Modules for styling (no Tailwind)
- Jest + React Testing Library for tests
- ESLint + Prettier for lint and format
- Node 24 (CI/Docker), Java 17 + Gradle (OpenAPI generation only)

Check [`galasa-ui/package.json`](galasa-ui/package.json) for exact versions.

## Repository layout

```
galasa-ui/
  src/
    actions/        Server actions ('use server')
    app/            Next.js App Router pages; app/internal-api/** holds route handlers
    components/     React components, grouped by feature (test-runs, tokens, users, mysettings, headers, common, ...)
    contexts/       React context providers (feature flags, date/time format, saved queries, ...)
    generated/      Generated OpenAPI client - gitignored, never edit by hand
    hooks/          Custom hooks
    i18n/           next-intl config (config.ts, request.ts)
    styles/         Global SCSS
    tests/          Jest tests, mirroring the src/ structure
    utils/          Helpers (encoding, functions, constants, types, ...)
    proxy.ts        Request proxy layer
  messages/         en.json and de.json translation files
  docs/             Design notes (date-time-handling.md, url-shortening.md)
dockerfiles/        dockerfile.webui
.github/workflows/  build.yaml (main), pr-build.yaml (PRs)
```

## Setup, build and run

The Dev Container (`.devcontainer/`) is the recommended environment. Otherwise see [`README.md`](README.md).

```bash
./setup-locally.sh              # one-off setup
./build-locally.sh --clean      # full build, incl. OpenAPI client generation
./build-locally.sh --delta      # incremental build
./build-locally.sh --clean --docker   # also build the Docker image
./run-locally.sh                # dev server (same as `npm run dev` in galasa-ui/)
```

The dev server needs `galasa-ui/.env.development.local`. The variables are documented in the README. They include `GALASA_API_SERVER_URL`, `GALASA_WEBUI_HOST_URL`, `GALASA_WEBUI_CLIENT_ID` and `GALASA_DEV_TOKEN`. Never commit this file or any secrets (`./detect-secrets.sh` runs in CI).

## Validation (required before finishing any task)

Run these from `galasa-ui/` and make sure all pass with no new warnings:

```bash
npm run lint
npm run format:check      # use `npm run format` to fix
npm test -- --watchAll=false
```

`npm test` already collects coverage. For a faster loop, run a single file: `npm test -- src/tests/path/to/file.test.tsx --watchAll=false`.

## Testing requirements

- Every behaviour change (new feature, bug fix, changed logic) must add or update tests.
- Tests live in `galasa-ui/src/tests/`, mirroring the `src/` tree, and are named `*.test.ts` / `*.test.tsx`.
- Use Jest and React Testing Library (`@testing-library/react`, `user-event`).
- Common setup (jest-dom, fetch, and Carbon polyfills for `matchMedia`, `ResizeObserver`, `scrollIntoView`) is in [`galasa-ui/setupTests.ts`](galasa-ui/setupTests.ts). Look at nearby tests for how `next/navigation` and `next-intl` are mocked and follow the same patterns.
- Generated code in `src/generated/` is excluded from coverage and must not be tested or edited.

## Code conventions

- **Licence header:** every source file starts with:
  ```
  /*
   * Copyright contributors to the Galasa project
   *
   * SPDX-License-Identifier: EPL-2.0
   */
  ```
- **Formatting (Prettier):** semicolons, single quotes, 2-space indent, 100-column width, `es5` trailing commas, always-parenthesised arrow params. Do not hand-format; run `npm run format`.
- **TypeScript:** strict mode. Use the `@/*` alias (maps to `src/*`) for imports. Type all props with interfaces/types.
- **Naming:** PascalCase for component files (`.tsx`), camelCase for utility files (`.ts`).
- **Components:** functional components only. Add `'use client'` only when client interactivity is needed. Put new components in the matching feature folder under `src/components/`.
- **Styling:** use Carbon components and tokens first, then SCSS Modules (`*.module.scss`) for custom styles. Do not add Tailwind or other CSS frameworks.
- **Server code:** server actions go in `src/actions/` with `'use server'`. API route handlers go in `src/app/internal-api/**/route.ts`.
- **Generated client:** import API types and clients from `src/generated/galasaapi`. Do not modify them. To get changes, regenerate with the Gradle step in `build-locally.sh`.

## Internationalisation (required)

- All user-facing strings must go through `next-intl` (`useTranslations()`); never hard-code display text in components.
- When adding or changing a string, **always add the key to both** [`galasa-ui/messages/en.json`](galasa-ui/messages/en.json) **and** [`galasa-ui/messages/de.json`](galasa-ui/messages/de.json). A best-effort German translation is acceptable.
- Locales are defined in `src/i18n/config.ts`.

## Domain-specific gotchas

- **Dates and times:** internal dates are UTC. Always render dates through `DateTimeFormatContext` (`formatDate()`) so the user's timezone and locale preferences are respected. See [`galasa-ui/docs/date-time-handling.md`](galasa-ui/docs/date-time-handling.md).
- **Test Runs URL state:** filter, sort and column state is compressed into the URL (`utils/encoding/urlEncoder.ts`) using hard-coded key/value mappings in `urlStateMappers.ts`. When adding or changing a filter or column, update the mappings and their tests, or existing shared URLs will break. See [`galasa-ui/docs/url-shortening.md`](galasa-ui/docs/url-shortening.md).
- **Feature flags:** see `src/contexts` and `src/utils/featureFlags.ts` before gating new functionality.
- **Auth:** OAuth2 with JWT tokens. Do not log or hard-code tokens.

## Commit and PR conventions (reference)

From [`CONTRIBUTING.md`](CONTRIBUTING.md):

- Commits must be signed off and signed (`git commit -s -S`) to satisfy the DCO.
- Use [Conventional Commits](https://www.conventionalcommits.org/): `type(scope)!: description` (scope and `!` are optional; `!` marks a breaking change).
- Pull requests target `main` and should follow [`.github/pull_request_template.md`](.github/pull_request_template.md).

## CI

- `pr-build.yaml`: secret detection, OpenAPI client generation, `npm install`, `npm test`, `npm run build`, Docker image build.
- `build.yaml` (main): the same, plus pushing the image to GHCR and triggering the Helm build in the `automation` repo.
- The image is a Next.js `standalone` output served on port 8080 by a non-root user.

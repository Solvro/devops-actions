# Solvro DevOps Actions

Shared GitHub Actions and reusable workflows for Solvro projects.

## Action or workflow?

- **Reusable workflow** runs as a separate job on its own runner. Use it when your project needs nothing beyond Node.js (frontend, libraries).
- **Composite actions** run as steps inside your own job, on the same runner. Use them when your project needs extra setup, e.g. database service or environment variables for tests (AdonisJS backend).

## Use workflow example

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
  merge_group:

jobs:
  lint-test:
    permissions:
      contents: read

    uses: Solvro/devops-actions/.github/workflows/node-checks-ci.yml@v1
    with:
      should-run-build: false
```

## Use actions example

Example for AdonisJS backend that needs PostgreSQL for tests:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
  merge_group:

jobs:
  lint-test:
    runs-on: ubuntu-latest

    permissions:
      contents: read

    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: app
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    env:
      DB_HOST: localhost
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: postgres
      DB_DATABASE: app

    steps:
      - name: Checkout
        uses: Solvro/devops-actions/.github/actions/github-checkout@v1
        with:
          fetch-depth: 0 # required for commitlint

      - name: Setup Node.js
        uses: Solvro/devops-actions/.github/actions/node-setup@v1

      - name: Run migrations
        run: node ace migration:run --force

      - name: Node checks
        uses: Solvro/devops-actions/.github/actions/node-checks@v1
        with:
          should-run-build: false
```

# Actions and workflows list

| Name                                                            | Type              | Description                                                |
| --------------------------------------------------------------- | ----------------- | ---------------------------------------------------------- |
| [`github-checkout`](.github/actions/github-checkout/action.yml) | composite action  | Checkout repo with correct SHA for different triggers      |
| [`node-setup`](.github/actions/node-setup/action.yml)           | composite action  | Setup Node.js and install dependencies (`npm ci`)          |
| [`node-checks`](.github/actions/node-checks/action.yml)         | composite action  | Run commitlint, prettier, lint, typecheck, tests and build |
| [`node-checks-ci`](.github/workflows/node-checks-ci.yml)        | reusable workflow | Ready-to-use job: checkout + `node-setup` + `node-checks`  |

# Releasing a new version

Base on [semantic versioning](https://semver.org).

We have two kinds of tags:

- **Exact tags** (`v1.0.0`, `v1.2.3`)
- **Major tags** (`v1`, `v2`) always point to the latest release of that major version. Projects use these (`@v1`).

**You don't create tags manually.** Releases are automated with [release-please](https://github.com/googleapis/release-please). The version is calculated from [Conventional Commits](https://www.conventionalcommits.org) messages (already enforced by commitlint):

| Commit message                              | Release          |
| ------------------------------------------- | ---------------- |
| `fix: ...`                                  | patch (`v1.0.1`) |
| `feat: ...`                                 | minor (`v1.1.0`) |
| `feat!: ...` or a `BREAKING CHANGE:` footer | major (`v2.0.0`) |
| `chore:`, `docs:`, `ci:`, `refactor:`, ...  | no release       |

How it works:

1. Merge PR to `main`.
2. The [`_release.yml`](.github/workflows/_release.yml) opens (or updates) a release PR with the next version and a generated `CHANGELOG.md`.
3. A maintainer merges the release PR when it's time to release.
4. The workflow then creates the `vX.Y.Z` tag and GitHub Release, and moves the major tag (`vX`) to it.

For a major release, also change the internal `@v1` references in [`node-checks-ci.yml`](.github/workflows/node-checks-ci.yml) and the examples above to `@v2` in the release PR.

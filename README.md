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

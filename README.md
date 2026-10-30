# Solvro Devops Actions

The repository's purpose is to provide reusable workflows and composite actions for Solvro projects' CI/CD.

Two types of components are defined in this project:

| Component         | Runner (machine)             | Purpose                         |
| ----------------- | ---------------------------- | ------------------------------- |
| Composite Action  | runs on caller's job runner  | a building block of another job |
| Reusable Workflow | has its own jobs and runners | entire pipeline                 |

# Examples

## Composite action example

This example CI is built using project's composite actions.

CI flow:

- checkout with entire commit history
- setting up NodeJS on the runner
- running checks (without commitlint and building the project)

```yaml
steps:
    - name: Checkout
       uses: Solvro/devops-actions/.github/actions/github-checkout@v1
       with:
         fetch-depth: 0

    - name: Setup Node.js
      uses: Solvro/devops-actions/.github/actions/node-setup@v1

    - name: Run migrations
      run: node ace migration:run --force

    - name: Node checks
      uses: Solvro/devops-actions/.github/actions/node-checks@v1
      with:
        should-run-commitlint: false
        should-run-build: false
```

## Use reusable workflow example

Rember that workflows creates its own runners, one for each job.

The example yaml code does the same thing as example for composite actions.

```yaml
uses: Solvro/devops-actions/.github/workflows/node-checks-ci.yml@v1
with:
    should-run-commitlint: false
        should-run-build: false
```

# Components

## Composite Acitons

| Name            | Path to use                                              | Purpose                       |
| --------------- | -------------------------------------------------------- | ----------------------------- |
| github-checkout | Solvro/devops-actions/.github/actions/github-checkout@v1 | Checkout with depth param     |
| node-setup      | Solvro/devops-actions/.github/actions/node-setup@v1      | Set up NodeJS project         |
| node-ckecks     | Solvro/devops-actions/.github/actions/node-checks@v1     | Run checks for NodeJS project |

## Reusable Workflows

| Name           | Path to use                                                   | Purpose               |
| -------------- | ------------------------------------------------------------- | --------------------- |
| node-checks-ci | Solvro/devops-actions/.github/workflows/node-checks-ci.yml@v1 | CI for NodeJS project |

# Versioning and smoke tests

For versioning [Google's release automation tool](https://github.com/googleapis/release-please-action) is used.

## How does it work?

Worfklow `_test_and_release.yml` contains 3 jobs

1. Release Please creates or updates the release PR with a bumped version
   - `fix:` → patch (`1.0.1`)
   - `feat:` → minor (`1.1.0`)
   - `feat!:` → major (`2.0.0`)
   - `chore:` / `docs:` → no new version

2. Smoke tests on mock projects
3. If a release PR is merged and smoke tests pass, the major tag (v1) is moved to the newest version

On pull request to main only smoke tests are ran, while on push to main all 3 jobs are ran.

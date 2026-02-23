# lgtm-testbed

Test repository for [LGTM](https://github.com/sewinter/lgtm) development. Contains automated workflows that create test PRs for integration testing.

## Usage

Create test PRs via GitHub Actions:

```bash
gh workflow run create-test-prs.yml
```

This creates PRs authored by `github-actions[bot]` with `sewinter` as a requested reviewer.

# Standalone repository setup

This folder is the **Freeman Intel** product plan repository. It lives under `-build-ai-agents-with-claude` for now until you create a dedicated GitHub repo.

## Create `freeman-intel` on GitHub

1. On GitHub, create a new repository: `samuelfreemanjobs-hash/freeman-intel` (empty, no README).
2. From your machine, push this folder as the new repo:

```bash
cd freeman-intel
git init -b main
git add -A
git commit -m "Initial Freeman Intel plan and landing outline"
git remote add origin https://github.com/samuelfreemanjobs-hash/freeman-intel.git
git push -u origin main
```

## Or: split from monorepo with subtree

If the folder stays in another repo temporarily:

```bash
git subtree split -P freeman-intel -b freeman-intel-only
git push https://github.com/samuelfreemanjobs-hash/freeman-intel.git freeman-intel-only:main
```

## Contents

| Path | Purpose |
|------|---------|
| `docs/plan.md` | Master plan |
| `docs/agent-menu.md` | Agent roster and bundles |
| `docs/icp-and-gtm.md` | ICP and GTM playbook |
| `marketing/landing-page.md` | Landing page outline |

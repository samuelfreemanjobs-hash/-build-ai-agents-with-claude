# Standalone repository setup

Same instructions as Freeman Intel — create empty GitHub repo and push.

```bash
cd ai-proposals-agent
git init -b main
git add -A
git commit -m "AI Proposals Agent v2.0 — system design, schemas, operator console"
git remote add origin https://github.com/samuelfreemanjobs-hash/ai-proposals-agent.git
git push -u origin main
```

## Operator console

```bash
cd ui/operator-console && python3 -m http.server 8080
```

Open http://localhost:8080

## Package

```bash
./package.sh
```

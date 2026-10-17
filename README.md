# Cellar POS – wines & spirits point of sale (Kenya)

Offline-first POS for a single-outlet Kenyan wines & spirits retail shop (1 till, owner + cashiers, cash + M-Pesa).

- `prototype/index.html` – clickable single-file prototype (open in a browser). Includes checkout, stock, shifts, reports, offline reconciliation, settings, and demo mode. Data is in memory only.
- `docs/requirements.md` – agreed scope (must / should / later).
- `docs/prototype-prompts.md` – prompt pack to finish the clickable prototype (start here).
- `docs/prompts.md` – later prompts to build the real product.
- `CLAUDE.md` – project context Claude Code reads automatically.

## Client demo handover

- [10-minute demo flow](docs/demo-script.md)
- [Prototype vs. production product](docs/prototype-vs-product.md)
- [Open questions for the client](docs/open-questions.md)

## Using Claude Code
1. `cd` into this folder and run `claude`.
2. Paste the prompts from `docs/prompts.md` one at a time, in order. Review and commit after each.

## Tests and Stock screenshots

Run the prototype smoke test and browser end-to-end checks with:

```sh
node tests/smoke.js
node tests/e2e.cjs
```

The browser checks need Playwright and a Chromium browser installed. `tests/capture.cjs` captures the Stock tabs; its defaults are all five tabs, widths 360/768/1366, light/dark themes, and `screenshots/stock` output:

```sh
node tests/capture.cjs
node tests/capture.cjs --screens overview,history --widths 360,1366 --themes dark --out /tmp/stock-captures
```

Use `--screens`, `--widths`, `--themes`, and `--out` to choose the capture set and destination. Screenshots are ignored by Git.

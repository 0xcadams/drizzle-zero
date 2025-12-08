# Repository Guidelines

## Project Structure & Module Organization

Core CLI logic lives in `src/`: `cli/` exposes the executable wrapper, `drizzle-to-zero.ts` coordinates schema translation, and helpers such as `tables.ts` or `relations.ts` centralize shared builders. Vitest unit suites reside in `tests/`, while end-to-end fixtures live under `integration/`, `no-config-integration/`, and `db/`. Generated bundles land in `dist/` and coverage reports in `coverage/`; treat them as expendable artifacts unless you are preparing a release.

## Build, Test, and Development Commands

- `pnpm install` keeps the workspace lockfile authoritative; avoid mixing package managers to preserve reproducible installs.
- `pnpm build` wipes `dist/`, runs `tsx build.ts`, and ensures `dist/cli/index.js` remains executable—run this before publishing.
- `pnpm test` executes `vitest run --typecheck --coverage`, so you catch type regressions and produce V8 coverage in one pass.
- `pnpm check-types` runs `tsc --noEmit` for faster feedback while iterating on signatures.
- `pnpm test:ui` opens the Vitest UI for debugging flaky specs.
- `pnpm clean` removes build output plus fixture `node_modules`; run it before cross-platform repros.

## Coding Style & Naming Conventions

TypeScript is strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), so prefer explicit return types for exported utilities. Source files follow kebab-case (e.g., `drizzle-to-zero.ts`), while symbols use `camelCase` for functions/variables and `PascalCase` for types. Prettier (default config) enforces formatting—run it via your editor or `pnpm dlx prettier --write .` before committing. Favor ES modules with `verbatimModuleSyntax`; let the generator decide when `.js` extensions are required.

## Testing Guidelines

Add regression coverage in `tests/*.test.ts` using Vitest’s `describe/it` patterns, mirroring existing suites. For CLI workflows or schema fixtures, extend the scenarios in `integration/` or `no-config-integration/`, keeping sample schemas in their dedicated folders. `pnpm test` must finish cleanly (no skipped suites) and maintain meaningful coverage for new code paths; provide snapshots or mock data when touching `src/cli/`. Name helper fixtures descriptively (e.g., `usersManyToMany.test.ts`) to surface intent.

## Commit & Pull Request Guidelines

Follow the conventional-commit style found in `git log` (`feat:`, `fix:`, `chore:`, `test:`). Each PR should describe the motivation, summarize user-facing changes, list follow-up work, and link an issue when applicable. Include CLI output or screenshots when the change affects generated files, and mention any new config flags so reviewers can exercise them locally. Keep commits focused; avoid mixing refactors with behavior changes unless both are inseparable.

## Configuration & Security Tips

Ensure both `drizzle.config.ts` and any `drizzle-zero.config.ts` files stay inside the `tsconfig` `include` glob so type extraction works. Never commit credentials inside fixture configs—use environment variables or `.env.local` ignored by git. When adding new CLI flags, document them in `README.md` and consider wiring sanity tests in `integration/` to prevent regressions around schema casing or output paths.

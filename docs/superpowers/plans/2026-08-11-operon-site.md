# OPERON Institutional Site Implementation Plan

> **Superseded:** este plano baseado em Next.js foi substituído pelo plano para hospedagem compartilhada em `2026-08-11-operon-shared-hosting-site.md`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir um site institucional completo da OPERON que transforme a gramática visual particulada da apresentação em uma experiência web contínua, responsiva, acessível e orientada ao Diagnóstico Operacional.

**Architecture:** Criar uma aplicação Next.js com conteúdo server-rendered e ilhas React client-side apenas para as cenas interativas. Extrair os algoritmos Canvas da apresentação para um pequeno motor tipado, com lifecycle explícito, qualidade adaptativa, fallback estático e suporte integral a movimento reduzido. A home segue uma narrativa única da dependência à capacidade; páginas secundárias aprofundam categoria, diagnóstico, aplicações e marca.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Testing Library, Playwright, axe-core, Canvas 2D, CSS Modules, Zod.

---

## Proposed file structure

```text
operon-site/
├── app/
│   ├── api/diagnostico/route.ts
│   ├── aplicacoes/page.tsx
│   ├── diagnostico/page.tsx
│   ├── harness-operacional/page.tsx
│   ├── insights/page.tsx
│   ├── privacidade/page.tsx
│   ├── sobre/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── canvas/ParticleField.tsx
│   ├── forms/DiagnosticForm.tsx
│   ├── home/CapacityDemo.tsx
│   ├── home/HarnessLayers.tsx
│   ├── home/Hero.tsx
│   ├── home/HumanDirection.tsx
│   ├── home/MethodSequence.tsx
│   ├── home/OperationalSymptoms.tsx
│   ├── layout/Footer.tsx
│   └── layout/Header.tsx
├── content/
│   ├── applications.ts
│   ├── brand.ts
│   └── navigation.ts
├── lib/
│   ├── analytics/events.ts
│   ├── canvas/adaptive-quality.ts
│   ├── canvas/create-particle-engine.ts
│   ├── canvas/field.ts
│   ├── canvas/morph.ts
│   ├── canvas/sample.ts
│   ├── canvas/types.ts
│   ├── canvas/vapor.ts
│   ├── env.ts
│   └── validation/diagnostic.ts
├── public/
│   ├── brand/operon-logo-dark.png
│   ├── brand/operon-logo-light.png
│   ├── images/founders/
│   └── images/particles/
├── tests/
│   ├── e2e/home.spec.ts
│   ├── e2e/reduced-motion.spec.ts
│   ├── integration/diagnostic-route.test.ts
│   └── unit/canvas/
└── package.json
```

### Task 1: Scaffold and quality gates

**Files:**
- Create: `operon-site/package.json`
- Create: `operon-site/tsconfig.json`
- Create: `operon-site/vitest.config.ts`
- Create: `operon-site/playwright.config.ts`
- Create: `operon-site/app/layout.tsx`
- Create: `operon-site/app/globals.css`
- Test: `operon-site/tests/e2e/home.spec.ts`

- [ ] **Step 1: Scaffold Next.js with TypeScript, App Router, ESLint and no source directory**

Run: `pnpm create next-app operon-site --ts --eslint --app --no-src-dir --no-tailwind --use-pnpm --import-alias '@/*'`

Expected: `operon-site/app/page.tsx` exists and `pnpm --dir operon-site build` exits 0.

- [ ] **Step 2: Install test and validation dependencies**

Run: `pnpm --dir operon-site add zod && pnpm --dir operon-site add -D vitest jsdom @testing-library/react @testing-library/jest-dom @playwright/test @axe-core/playwright`

Expected: dependencies appear in `operon-site/package.json`.

- [ ] **Step 3: Add scripts**

Set `package.json` scripts to include `test:unit`, `test:e2e`, `test:a11y`, `typecheck` and `verify` where `verify` runs lint, typecheck, unit tests and build.

- [ ] **Step 4: Write the initial smoke test**

```ts
import { expect, test } from '@playwright/test';

test('home exposes the positioning and primary conversion', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'A gente organiza o que hoje só funciona porque você está em cima.'
  );
  await expect(page.getByRole('link', { name: 'Descobrir onde sua empresa depende de você' })).toBeVisible();
});
```

- [ ] **Step 5: Run the smoke test and confirm it fails before implementing the home**

Run: `pnpm --dir operon-site test:e2e -- tests/e2e/home.spec.ts`

Expected: FAIL because the OPERON hero does not exist.

- [ ] **Step 6: Commit**

```bash
git add operon-site
git commit -m "chore: scaffold operon institutional site"
```

### Task 2: Brand tokens, fonts and approved assets

**Files:**
- Modify: `operon-site/app/globals.css`
- Modify: `operon-site/app/layout.tsx`
- Create: `operon-site/content/brand.ts`
- Create: `operon-site/public/brand/operon-logo-dark.png`
- Create: `operon-site/public/brand/operon-logo-light.png`
- Test: `operon-site/tests/unit/brand.test.ts`

- [ ] **Step 1: Write a token test that rejects accent colors and unapproved typography**

The test reads `content/brand.ts` and asserts that the palette contains only black, white and alpha-white roles, and that title/body families are Space Grotesk and Inter.

- [ ] **Step 2: Run the token test and verify it fails**

Run: `pnpm --dir operon-site test:unit -- tests/unit/brand.test.ts`

Expected: FAIL because `brand.ts` is missing.

- [ ] **Step 3: Implement the approved brand contract**

Export typed values for `#000000`, `#FFFFFF`, optional optical white `#F4F4EF`, Space Grotesk, Inter, institutional signature and editorial signature. Do not define any accent token.

- [ ] **Step 4: Copy only the two official raster logos**

Copy from `OPERON-NUCLEO/05-ASSETS/logos/operon-logo-principal-branco-sobre-preto.png` and `operon-logo-reversa-preto-sobre-branco.png`. Do not copy `logos/png`, `logos/favicon`, vector previews or reduced symbols until separately approved.

- [ ] **Step 5: Add local font loading and global focus/selection styles**

Use `next/font/google` for Space Grotesk and Inter. Preserve readable HTML before fonts finish loading.

- [ ] **Step 6: Run tests and visual smoke check**

Run: `pnpm --dir operon-site verify`

Expected: all unit checks, lint, typecheck and build pass.

- [ ] **Step 7: Commit**

```bash
git add operon-site
git commit -m "feat: establish approved Operon brand system"
```

### Task 3: Extract the particle engine

**Files:**
- Create: `operon-site/lib/canvas/types.ts`
- Create: `operon-site/lib/canvas/sample.ts`
- Create: `operon-site/lib/canvas/field.ts`
- Create: `operon-site/lib/canvas/morph.ts`
- Create: `operon-site/lib/canvas/vapor.ts`
- Create: `operon-site/lib/canvas/adaptive-quality.ts`
- Create: `operon-site/lib/canvas/create-particle-engine.ts`
- Test: `operon-site/tests/unit/canvas/adaptive-quality.test.ts`
- Test: `operon-site/tests/unit/canvas/lifecycle.test.ts`

- [ ] **Step 1: Write failing tests for quality selection and lifecycle**

Cover low/mid/high particle budgets, DPR cap, start idempotence, pause, resize and destroy cancelling the animation frame and listeners.

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm --dir operon-site test:unit -- tests/unit/canvas`

Expected: FAIL because the engine modules do not exist.

- [ ] **Step 3: Port sampling and particle algorithms from the presentation**

Preserve the useful behavior of `vapor`, `drift`, image sampling and abstract morphs. Remove presentation-only global state, IIFE boot, DOM-wide selectors and generic pictograms such as gear, vehicle, brain, flower and blocks.

- [ ] **Step 4: Implement explicit lifecycle**

Expose `start()`, `pause()`, `resize()`, `setProgress()`, `setPointer()`, `setQuality()` and `destroy()`. Inject `requestAnimationFrame` in tests so cleanup is deterministic.

- [ ] **Step 5: Implement adaptive quality**

Base quality on viewport area, DPR, reduced motion and a short frame-time sample. Cap DPR at 1.75 and provide a static mode with zero RAF loops.

- [ ] **Step 6: Run unit tests**

Run: `pnpm --dir operon-site test:unit -- tests/unit/canvas`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add operon-site/lib/canvas operon-site/tests/unit/canvas
git commit -m "feat: extract adaptive Operon particle engine"
```

### Task 4: React Canvas component and accessibility fallback

**Files:**
- Create: `operon-site/components/canvas/ParticleField.tsx`
- Create: `operon-site/components/canvas/ParticleField.module.css`
- Test: `operon-site/tests/unit/ParticleField.test.tsx`
- Test: `operon-site/tests/e2e/reduced-motion.spec.ts`

- [ ] **Step 1: Write tests for viewport pause and reduced motion**

Assert that the engine starts only after intersection, pauses after exit, destroys on unmount and renders the static poster when motion is reduced.

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm --dir operon-site test:unit -- tests/unit/ParticleField.test.tsx`

Expected: FAIL because the component is missing.

- [ ] **Step 3: Implement `ParticleField`**

Use `ResizeObserver`, `IntersectionObserver`, `visibilitychange` and pointer events. Mark Canvas decorative with `aria-hidden="true"`; keep all meaning in adjacent HTML.

- [ ] **Step 4: Implement static fallback**

Accept a responsive poster image and render it when reduced motion is active, JavaScript fails or Canvas initialization throws.

- [ ] **Step 5: Run unit and browser tests**

Run: `pnpm --dir operon-site test:unit && pnpm --dir operon-site test:e2e -- tests/e2e/reduced-motion.spec.ts`

Expected: PASS with no active RAF animation in reduced-motion mode.

- [ ] **Step 6: Commit**

```bash
git add operon-site/components/canvas operon-site/tests
git commit -m "feat: add accessible React particle field"
```

### Task 5: Build the home narrative

**Files:**
- Modify: `operon-site/app/page.tsx`
- Create: `operon-site/components/home/Hero.tsx`
- Create: `operon-site/components/home/OperationalSymptoms.tsx`
- Create: `operon-site/components/home/HarnessLayers.tsx`
- Create: `operon-site/components/home/CapacityDemo.tsx`
- Create: `operon-site/components/home/MethodSequence.tsx`
- Create: `operon-site/components/home/HumanDirection.tsx`
- Create: `operon-site/components/home/home.module.css`
- Test: `operon-site/tests/e2e/home.spec.ts`

- [ ] **Step 1: Expand the failing home test**

Assert the H1, two hero CTAs, five Harness layers, the proposal demonstration, four method stages, human-review language and the final diagnostic CTA.

- [ ] **Step 2: Run the test and verify the new assertions fail**

Run: `pnpm --dir operon-site test:e2e -- tests/e2e/home.spec.ts`

Expected: FAIL on the first unimplemented section.

- [ ] **Step 3: Implement the semantic page before motion**

Build the full narrative with headings, copy, links and progressive enhancement. Ensure the entire page remains understandable without Canvas.

- [ ] **Step 4: Integrate particle states**

Connect section intersection progress to named states: `dispersed`, `converging`, `layered`, `flowing`, `review`, `orbit`. The same visual language must persist across sections without one full-page RAF canvas becoming a performance bottleneck.

- [ ] **Step 5: Add the inspectable proposal demonstration**

Implement the stages `entrada`, `contexto`, `critérios`, `preparo`, `revisão humana`, `registro`. Label it “demonstração ilustrativa”; do not imply a real client or measured result.

- [ ] **Step 6: Run E2E at desktop and mobile breakpoints**

Run: `pnpm --dir operon-site test:e2e -- tests/e2e/home.spec.ts`

Expected: PASS at 1440×900 and 390×844 projects.

- [ ] **Step 7: Commit**

```bash
git add operon-site/app/page.tsx operon-site/components/home operon-site/tests/e2e/home.spec.ts
git commit -m "feat: build Operon home narrative"
```

### Task 6: Navigation, footer and secondary pages

**Files:**
- Create: `operon-site/components/layout/Header.tsx`
- Create: `operon-site/components/layout/Footer.tsx`
- Create: `operon-site/content/navigation.ts`
- Create: `operon-site/content/applications.ts`
- Create: `operon-site/app/harness-operacional/page.tsx`
- Create: `operon-site/app/aplicacoes/page.tsx`
- Create: `operon-site/app/sobre/page.tsx`
- Create: `operon-site/app/insights/page.tsx`
- Create: `operon-site/app/privacidade/page.tsx`
- Test: `operon-site/tests/e2e/navigation.spec.ts`

- [ ] **Step 1: Write route and navigation tests**

Assert keyboard access, visible focus, active page labeling, Escape closing the mobile menu and no public LBA references.

- [ ] **Step 2: Run and verify failure**

Run: `pnpm --dir operon-site test:e2e -- tests/e2e/navigation.spec.ts`

Expected: FAIL because secondary routes and navigation are absent.

- [ ] **Step 3: Implement header and footer**

Use the approved raster logo only above 240 px display width. At smaller widths, use a plain accessible text label “OPERON” until a small-use mark is approved.

- [ ] **Step 4: Implement category, applications and about pages**

Use approved claims from the source of truth. Mark all application scenarios as illustrative. Do not publish pricing, SLA, quantitative outcomes, cases or the OPERON–LBA relationship.

- [ ] **Step 5: Implement insights and privacy foundations**

Create an editorial index ready for real entries; do not populate fake articles. Document form and analytics data practices on the privacy page.

- [ ] **Step 6: Run navigation and accessibility tests**

Run: `pnpm --dir operon-site test:e2e -- tests/e2e/navigation.spec.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add operon-site/app operon-site/components/layout operon-site/content operon-site/tests/e2e/navigation.spec.ts
git commit -m "feat: add Operon institutional routes"
```

### Task 7: Diagnostic conversion flow

**Files:**
- Create: `operon-site/app/diagnostico/page.tsx`
- Create: `operon-site/components/forms/DiagnosticForm.tsx`
- Create: `operon-site/lib/validation/diagnostic.ts`
- Create: `operon-site/app/api/diagnostico/route.ts`
- Test: `operon-site/tests/integration/diagnostic-route.test.ts`
- Test: `operon-site/tests/e2e/diagnostic-form.spec.ts`

- [ ] **Step 1: Write failing validation and endpoint tests**

Cover required name, work email, company, operational bottleneck, consent, honeypot rejection, payload size and safe failure when the lead destination is unavailable.

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm --dir operon-site test:unit -- tests/integration/diagnostic-route.test.ts`

Expected: FAIL because schema and route do not exist.

- [ ] **Step 3: Implement the Zod schema and server route**

Keep the lead destination behind an adapter configured by environment variables. Log no sensitive form body. Return stable error codes for the UI.

- [ ] **Step 4: Implement the form**

Use progressive enhancement, inline errors, status announcements and a confirmation that does not promise agenda, deadline or outcome.

- [ ] **Step 5: Add anti-spam and rate protection**

Use honeypot, minimum interaction time and provider-side rate limiting compatible with the selected deployment platform.

- [ ] **Step 6: Run integration and E2E tests**

Run: `pnpm --dir operon-site test:unit -- tests/integration/diagnostic-route.test.ts && pnpm --dir operon-site test:e2e -- tests/e2e/diagnostic-form.spec.ts`

Expected: PASS for success, validation failure, spam and provider failure paths.

- [ ] **Step 7: Commit**

```bash
git add operon-site/app/diagnostico operon-site/app/api operon-site/components/forms operon-site/lib/validation operon-site/tests
git commit -m "feat: add diagnostic interest flow"
```

### Task 8: SEO, analytics and metadata

**Files:**
- Modify: `operon-site/app/layout.tsx`
- Modify: `operon-site/app/page.tsx`
- Create: `operon-site/app/robots.ts`
- Create: `operon-site/app/sitemap.ts`
- Create: `operon-site/lib/analytics/events.ts`
- Create: `operon-site/lib/env.ts`
- Test: `operon-site/tests/e2e/metadata.spec.ts`

- [ ] **Step 1: Write tests for title, description, canonical URL and structured data**

Assert Organization and ProfessionalService schema use only approved facts and no unvalidated claims.

- [ ] **Step 2: Implement metadata, sitemap and robots**

Use the institutional signature and plain-language description of Harness Operacional. Do not use unapproved favicon files.

- [ ] **Step 3: Implement named analytics events**

Track `hero_diagnostic_click`, `harness_explainer_open`, `demo_stage_view`, `diagnostic_form_start`, `diagnostic_form_error` and `diagnostic_form_submit`. Never send free-text bottleneck content to analytics.

- [ ] **Step 4: Run tests**

Run: `pnpm --dir operon-site test:e2e -- tests/e2e/metadata.spec.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add operon-site/app operon-site/lib/analytics operon-site/lib/env operon-site/tests/e2e/metadata.spec.ts
git commit -m "feat: add Operon discovery and measurement"
```

### Task 9: Performance, accessibility and visual QA

**Files:**
- Create: `operon-site/tests/e2e/accessibility.spec.ts`
- Create: `operon-site/tests/e2e/performance.spec.ts`
- Create: `operon-site/tests/e2e/visual.spec.ts`
- Modify: files identified by the audits

- [ ] **Step 1: Add axe audits for every public route**

Run axe after fonts and above-the-fold assets settle. Fail on serious or critical violations.

- [ ] **Step 2: Add performance assertions**

Assert no Canvas larger than its visual bounds, no animation while hidden, bounded particle counts on mobile and no layout shift from logo or hero media.

- [ ] **Step 3: Capture visual baselines**

Cover desktop, mobile, reduced motion and high contrast for the home, Harness page and diagnostic page.

- [ ] **Step 4: Run the full verification suite**

Run: `pnpm --dir operon-site verify && pnpm --dir operon-site test:e2e`

Expected: all checks pass with zero serious/critical axe violations.

- [ ] **Step 5: Run Lighthouse against the production build**

Run: `pnpm --dir operon-site build && pnpm --dir operon-site start`

In a separate terminal: `npx lighthouse http://localhost:3000 --only-categories=performance,accessibility,seo,best-practices --output=json --output-path=operon-site/output/lighthouse.json`

Expected: accessibility and SEO ≥ 95; performance target ≥ 90 on desktop and no Core Web Vitals regression on mobile.

- [ ] **Step 6: Inspect every route manually**

Verify copy, logo clearance, image crop, typography, motion causality, focus order, form failure states, mobile layouts and that no LBA or rejected small-use assets appear.

- [ ] **Step 7: Commit**

```bash
git add operon-site
git commit -m "test: complete Operon site quality gates"
```

### Task 10: Pre-launch brand and content gate

**Files:**
- Create: `operon-site/docs/launch-checklist.md`
- Modify: content or assets rejected during review

- [ ] **Step 1: Review every visible claim against the source of truth**

Confirm the site contains no price, SLA, case, quantitative promise, autonomy claim, public LBA relationship or approved-status mismatch.

- [ ] **Step 2: Run comprehension review with the priority audience**

Test whether participants can answer: what OPERON does, what a Harness is, why it differs from an automation and what the next step is. Record wording changes without silently changing approved positioning.

- [ ] **Step 3: Obtain explicit decisions for launch blockers**

Record the chosen optical white, typography contrast, demo scenario, lead destination and favicon policy in the source-of-truth decision log before shipping.

- [ ] **Step 4: Execute the final verification**

Run: `pnpm --dir operon-site verify && pnpm --dir operon-site test:e2e`

Expected: exit 0 with production environment variables validated.

- [ ] **Step 5: Commit**

```bash
git add operon-site /Users/yohann/Documents/OPERON-NUCLEO/01-FONTE-DA-VERDADE/DECISOES-E-PENDENCIAS.md
git commit -m "docs: approve Operon site launch contract"
```

## Self-review

- Spec coverage: brand immersion, presentation reuse, React extraction, narrative, conversion, accessibility, performance and governance are mapped to tasks.
- Placeholder scan: no implementation step depends on an undefined visual direction; remaining launch choices are explicit approval gates from the source of truth.
- Type consistency: Canvas lifecycle names are defined once and reused by the React component and tests.
- Scope boundary: the plan does not publish cases, pricing, SLA, quantitative outcomes, small-use identity assets or the LBA relationship.

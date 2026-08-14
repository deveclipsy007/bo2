# OPERON Kinetic Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the current landing page into a coherent multi-page kinetic brand experience where nanoparticles express dispersion, flow, memory and autonomy.

**Architecture:** Keep the shared-hosting PHP structure and progressive enhancement. PHP delivers complete accessible copy; CSS and the dependency-free canvas engine add motion only when supported. Generated raster styleframes are WebP backgrounds while the interactive particle typography remains code-native.

**Tech Stack:** PHP 8, HTML, CSS, Canvas 2D, vanilla JavaScript, WebP, SQLite locally, MySQL in production.

---

### Task 1: Horizontal brand lockup

**Files:**
- Create: `public_html/assets/images/brand/operon-logo-horizontal.webp`
- Modify: `public_html/app/Views/layout.php`
- Test: `tests/MotionSystemTest.php`

- [ ] Add a failing assertion for `operon-logo-horizontal.webp` and run `php tests/run.php`.
- [ ] Recompose the official symbol and lettering into one horizontal transparent raster without changing either geometry.
- [ ] Replace the split header mark with the single optimized lockup and run the tests again.

### Task 2: Particle art direction and performance

**Files:**
- Create: `public_html/assets/images/generated-v2/operational-flow.webp`
- Create: `public_html/assets/images/generated-v2/memory-layers.webp`
- Create: `public_html/assets/images/generated-v2/autonomy-core.webp`
- Modify: `public_html/assets/js/operon-fx.js`
- Modify: `public_html/assets/css/site.css`
- Test: `tests/MotionSystemTest.php`

- [ ] Add failing assertions for all three optimized styleframes and multi-instance particle typography.
- [ ] Generate one visual per semantic state and convert each to WebP under 200 KB.
- [ ] Extend the canvas engine with configurable density, word timing and viewport-aware lifecycle.
- [ ] Add reusable cinematic section, kinetic-word and reveal-mask styles.
- [ ] Run syntax checks and the complete PHP test suite.

### Task 3: Rebuild the home narrative

**Files:**
- Modify: `public_html/app/Views/pages/home.php`
- Test: `tests/MotionSystemTest.php`

- [ ] Add failing assertions for kinetic copy about Contexto, Critério and Memória.
- [ ] Introduce a sticky particle chapter, a three-act capability sequence and stronger proof copy.
- [ ] Place generated backgrounds only where each one proves the section's message.
- [ ] Preserve all primary CTA and semantic heading structure.
- [ ] Run tests and visually inspect desktop and mobile.

### Task 4: Add Capabilities and Method pages

**Files:**
- Create: `public_html/app/Views/pages/capacidades.php`
- Create: `public_html/app/Views/pages/metodo.php`
- Modify: `public_html/index.php`
- Modify: `public_html/app/Views/layout.php`
- Test: `tests/RouterTest.php`

- [ ] Add failing route and view assertions for `/capacidades` and `/metodo`.
- [ ] Add both routes and navigation entries.
- [ ] Write page-specific copy with one distinct particle behavior per page.
- [ ] Verify HTTP 200 responses through the local shared-hosting router.

### Task 5: Final visual and technical QA

**Files:**
- Modify: only files with verified visual defects

- [ ] Run `php tests/run.php`, PHP lint and `node --check`.
- [ ] Confirm CSS, JS and each new image return HTTP 200.
- [ ] Inspect the home, Capabilities and Method pages in the in-app browser.
- [ ] Check reduced motion, responsive layout and particle pause outside the viewport.

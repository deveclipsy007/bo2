# Case Study and Harness Simulator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an evidence-rich demonstrative case and an interactive Harness simulation that make Operon's offer tangible without presenting invented claims as client facts.

**Architecture:** Extend the home with one editorial case module backed by a new optimized raster asset and one progressive-enhancement simulator. The simulator uses semantic buttons and panels for accessibility, CSS for state transitions, and lightweight vanilla JavaScript for autoplay, manual navigation, pause, restart, and viewport-aware motion.

**Tech Stack:** PHP view markup, CSS, vanilla JavaScript, generated WebP asset, existing PHP test harness and shared-hosting build.

---

### Task 1: Establish regression requirements

**Files:**
- Modify: `tests/MotionSystemTest.php`

- [ ] Add assertions for `operational-case`, the transparent label `Cenário demonstrativo`, the generated image path, `harness-simulator`, six `data-sim-step` controls, live status, restart control, and JS state controller.
- [ ] Run `php tests/run.php` and confirm the new test fails before implementation.

### Task 2: Prepare the generated case asset

**Files:**
- Create: `public_html/assets/images/generated-v3/operational-case-system.webp`
- Modify: `public_html/assets/ASSETS.md`

- [ ] Copy the selected built-in image generation output into the project.
- [ ] Convert it to quality-82 WebP with a 1920px maximum width.
- [ ] Verify dimensions, format, and file size; document that it is a generated demonstrative operational visualization with no embedded claims.

### Task 3: Build the editorial demonstrative case

**Files:**
- Modify: `public_html/app/Views/pages/home.php`

- [ ] Replace the current three-column demonstration with a complete `operational-case` section.
- [ ] Label it visibly as `Cenário demonstrativo`, never as a named client result.
- [ ] Add context, recurring bottleneck, designed system, returned capability, and observable indicators without fabricated percentages or time savings.
- [ ] Use the generated image as the main operational artifact and HTML overlays for editable, crisp labels.

### Task 4: Build the interactive Harness simulator

**Files:**
- Modify: `public_html/app/Views/pages/home.php`
- Modify: `public_html/assets/js/site.js`
- Modify: `public_html/assets/css/site.css`

- [ ] Add six semantic step buttons: Solicitação, Contexto, Critérios, Exceção, Humano, Memória.
- [ ] Add an accessible live status panel with changing title, description, system event, and actor.
- [ ] Add a central node/particle track, exception branch, progress meter, pause/play, and restart.
- [ ] Implement click/keyboard-safe state selection, 3.8-second autoplay only while visible, pause on interaction, replay, and reduced-motion opt-out.
- [ ] Style transitions so information travels, the exception branches upward, human review pulses, and memory closes the orbit.
- [ ] Collapse the simulator into a clean vertical timeline on mobile with 44px touch targets and no horizontal overflow.

### Task 5: Verify, build, publish, and inspect live

**Files:**
- Verify all modified files and generated asset.

- [ ] Run `php tests/run.php`, PHP lint, JS syntax checks, and `npm run build`.
- [ ] Inspect case and simulator at 1440×900 and 390×844, including all six manual states and restart.
- [ ] Confirm no browser console errors, no horizontal overflow, acceptable asset weight, and reduced-motion fallback.
- [ ] Back up exact remote targets, publish from `dist/public_html`, compare SHA-256 hashes, and validate live HTTP 200 pages.


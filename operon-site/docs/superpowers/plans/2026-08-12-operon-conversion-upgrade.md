# Operon Conversion Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Operon website from a visually distinctive manifesto into a premium, evidence-led conversion journey without losing its monochrome particle identity.

**Architecture:** Keep the existing PHP view/router architecture and enhance the five public conversion pages. Introduce reusable editorial patterns through CSS classes rather than new dependencies, preserve the optimized canvas engine, and use semantic HTML for evidence, transformation, authority, objections, and CTA reassurance.

**Tech Stack:** PHP 8 views, semantic HTML, compressed CSS, vanilla JavaScript/canvas, existing PHP test harness, shared-hosting build pipeline.

---

### Task 1: Regression contract for the conversion narrative

**Files:**
- Modify: `tests/MotionSystemTest.php`

- [ ] **Step 1: Write failing tests** asserting that the home contains a concrete hero explanation, evidence strip, before/harness/after transformation, operational case, objection section, and lower-friction CTA; internal pages contain concrete symptoms/examples; About contains founder authority and thesis; Diagnostic contains a response expectation rather than the defensive disclaimer.
- [ ] **Step 2: Run `php tests/run.php`** and confirm the new assertions fail because the conversion sections are absent.
- [ ] **Step 3: Keep assertions semantic** by targeting stable class names and core copy fragments, not full rendered layout.

### Task 2: Upgrade the home from manifesto to proof-led journey

**Files:**
- Modify: `public_html/app/Views/pages/home.php`

- [ ] **Step 1: Rewrite the hero support copy** to explicitly say that Operon transforms dispersed knowledge, processes, and decisions into operational capability.
- [ ] **Step 2: Add an evidence strip** with three concise signals: context preserved, recurring work structured, and exceptions escalated to humans.
- [ ] **Step 3: Add a visual before → Harness → after section** mapping dispersed information and founder dependence to connected context and traceable decisions.
- [ ] **Step 4: Add an anonymized demonstration case** with “before / built / returned” framing and a clear note that it is an illustrative operational scenario.
- [ ] **Step 5: Pair manifesto statements with concrete operational examples** such as pricing in one person’s head, exceptions in chats, and decisions restarting from zero.
- [ ] **Step 6: Add an objection block** answering whether Operon replaces people, requires replacing current tools, or begins with automation.
- [ ] **Step 7: Replace the closing CTA** with “Conversar sobre minha operação” and add the truthful expectation: context review followed by a fit-based conversation.

### Task 3: Build visual progression and premium conversion components

**Files:**
- Modify: `public_html/assets/css/site.css`

- [ ] **Step 1: Add styles for `.hero__definition`, `.proof-ribbon`, `.state-shift`, `.evidence-case`, `.objection-grid`, and `.cta-assurance`** using the existing black/optical palette.
- [ ] **Step 2: Create three visual states:** dispersed/dark, structured/grid, and resolved/optical-light, so the page visually progresses from chaos to clarity.
- [ ] **Step 3: Give evidence and case-study content tighter typography and stronger contrast** than manifesto sections.
- [ ] **Step 4: Add responsive layouts at 900px and 700px** with single-column sequencing, readable type, touch targets, and no horizontal overflow.
- [ ] **Step 5: Preserve reduced-motion behavior and avoid adding new heavy assets or libraries.**

### Task 4: Turn Capacidades into a standalone conversion page

**Files:**
- Modify: `public_html/app/Views/pages/capacidades.php`

- [ ] **Step 1: Add a concrete subhead** explaining which recurring work each capacity helps continue.
- [ ] **Step 2: Expand each capability with a recognizable symptom and observable outcome**, keeping concise copy.
- [ ] **Step 3: Add a shared “what gets connected” section** covering context, criteria, workflow, tools, memory, and human review.
- [ ] **Step 4: Replace the generic CTA** with “Descobrir qual capacidade destrava minha operação” plus a low-friction assurance line.

### Task 5: Make Método reduce risk and uncertainty

**Files:**
- Modify: `public_html/app/Views/pages/metodo.php`

- [ ] **Step 1: Add an outcome to each method stage** so the visitor understands what exists after Reveal, Structure, Apply, and Evolve.
- [ ] **Step 2: Add a deliverables rail** for bottleneck map, decision criteria, connected workflow, and evolution signals.
- [ ] **Step 3: State explicitly that existing tools are evaluated before new technology is introduced.**
- [ ] **Step 4: Use a fit-oriented CTA** that describes the next step without promising an automatic result.

### Task 6: Add human authority to Sobre

**Files:**
- Modify: `public_html/app/Views/pages/sobre.php`

- [ ] **Step 1: Add the Operon thesis** explaining why companies become dependent on people when knowledge and decision logic remain implicit.
- [ ] **Step 2: Expand founder cards** with named responsibilities and concrete areas of contribution, avoiding unverifiable credentials.
- [ ] **Step 3: Add operating principles** for direction human, technology in context, legibility, and measurable evolution.
- [ ] **Step 4: Add a CTA to discuss the visitor’s operational dependency.**

### Task 7: Increase Diagnostic completion and trust

**Files:**
- Modify: `public_html/app/Views/pages/diagnostico.php`

- [ ] **Step 1: Rewrite the intro** around the tangible output of the context review.
- [ ] **Step 2: Add a three-step expectation rail:** submit context, Operon reviews fit, conversation is proposed when useful.
- [ ] **Step 3: Improve the bottleneck prompt** with a concrete placeholder while preserving validation and accessibility.
- [ ] **Step 4: Replace the defensive note** with a clear, truthful response expectation and privacy reassurance.
- [ ] **Step 5: Change the button to “Quero uma leitura inicial do gargalo”.**

### Task 8: Align navigation and site-wide CTA language

**Files:**
- Modify: `public_html/app/Views/layout.php`

- [ ] **Step 1: Change the navigation CTA** from “Mapear gargalo” to “Conversar sobre a operação”.
- [ ] **Step 2: Add a Capacidades link to the footer** and preserve the current accessible mobile navigation behavior.
- [ ] **Step 3: Keep metadata and cache-busting intact.**

### Task 9: Verify locally and visually

**Files:**
- Verify: all modified view, CSS, JS, and test files

- [ ] **Step 1: Run `php tests/run.php`** and require 0 failures.
- [ ] **Step 2: Run PHP lint on all modified views and `node --check` on both scripts.**
- [ ] **Step 3: Run `npm run build`** and confirm `dist/public_html` is produced.
- [ ] **Step 4: Inspect home, Capacidades, Método, Sobre, and Diagnóstico at 1440×900 and 390×844.**
- [ ] **Step 5: Verify no horizontal overflow, visible CTA hierarchy, readable mobile type, working menu, and no browser console errors.**

### Task 10: Publish safely and validate production

**Files:**
- Deploy only changed files from `dist/public_html`
- Create: `deployment-backups/conversion-upgrade-before-<timestamp>/...`

- [ ] **Step 1: Download exact remote targets into a timestamped backup before overwrite.**
- [ ] **Step 2: Upload the changed views and CSS through the existing pinned FTPS workflow.**
- [ ] **Step 3: Compare local and remote SHA-256 hashes.**
- [ ] **Step 4: Validate the live site at desktop and mobile breakpoints and verify HTTP 200 responses.**


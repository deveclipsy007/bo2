# OPERON Shared Hosting Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o site institucional premium da OPERON em uma arquitetura publicável diretamente em `public_html`, com PHP, SQLite local, MySQL em produção e frontend progressivamente aprimorado.

**Architecture:** O Apache entrega assets reais e encaminha rotas institucionais para um front controller PHP. A página nasce como HTML semântico e rápido; Canvas e JavaScript entram apenas nas cenas que explicam a transformação da operação. O acesso a dados usa PDO e um único contrato de repositório, enquanto schemas equivalentes preservam comportamento entre SQLite e MySQL.

**Tech Stack:** Apache, PHP 8.2+, PDO, SQLite, MySQL/MariaDB, HTML, CSS, JavaScript ES modules, Canvas 2D, Node apenas no build local, Playwright para QA.

---

## Estrutura de publicação

```text
operon-site/
├── public_html/
│   ├── .htaccess
│   ├── .env.example
│   ├── index.php
│   ├── app/
│   │   ├── Bootstrap.php
│   │   ├── Database/
│   │   ├── Http/
│   │   ├── Repositories/
│   │   ├── Routing/
│   │   ├── Security/
│   │   └── Views/
│   ├── assets/
│   │   ├── css/
│   │   ├── fonts/
│   │   ├── images/
│   │   └── js/
│   ├── database/
│   │   ├── schema.sqlite.sql
│   │   └── schema.mysql.sql
│   └── storage/
│       ├── database/
│       └── logs/
├── tests/
├── tools/
└── dist/public_html/
```

`app`, `database`, `storage`, `.env`, schemas e logs ficam bloqueados pelo Apache. O build remove masters PNG, banco SQLite, logs e arquivos de desenvolvimento antes de gerar o pacote de upload.

### Task 1: Fundação de shared hosting

**Files:**
- Create: `operon-site/public_html/.htaccess`
- Create: `operon-site/public_html/index.php`
- Create: `operon-site/public_html/.env.example`
- Create: `operon-site/tools/build-assets.mjs`
- Test: `operon-site/tests/ProjectStructureTest.php`

- [x] Escrever testes para raiz pública e bloqueio de diretórios sensíveis.
- [x] Executar os testes e observar falha por estrutura inexistente.
- [x] Criar `public_html`, front controller, regras Apache e pacote de build.
- [x] Executar os testes e confirmar aprovação.

### Task 2: Contrato SQLite local / MySQL produção

**Files:**
- Create: `operon-site/public_html/app/Database/DatabaseConfig.php`
- Create: `operon-site/public_html/database/schema.sqlite.sql`
- Create: `operon-site/public_html/database/schema.mysql.sql`
- Test: `operon-site/tests/DatabaseConfigTest.php`

- [x] Escrever testes para seleção explícita do driver por `APP_ENV`.
- [x] Confirmar falha antes da implementação.
- [x] Implementar configuração imutável e DSNs PDO.
- [x] Criar schemas equivalentes para leads de diagnóstico.
- [x] Confirmar cinco testes aprovados.

### Task 3: Conexão, migração e repositório de leads

**Files:**
- Create: `operon-site/public_html/app/Database/ConnectionFactory.php`
- Create: `operon-site/public_html/app/Database/Migrator.php`
- Create: `operon-site/public_html/app/Repositories/DiagnosticLeadRepository.php`
- Create: `operon-site/tools/migrate.php`
- Test: `operon-site/tests/ConnectionFactoryTest.php`
- Test: `operon-site/tests/DiagnosticLeadRepositoryTest.php`

- [ ] Escrever teste que cria um SQLite temporário e verifica `foreign_keys=ON`, exceptions e prepared statements.
- [ ] Executar e confirmar falha pela ausência da factory.
- [ ] Implementar a factory sem heurística de hostname: `APP_ENV` decide o driver.
- [ ] Escrever teste de migração idempotente e confirmar falha.
- [ ] Implementar migrador com schema específico por driver.
- [ ] Escrever teste de criação e leitura de lead usando SQLite real.
- [ ] Implementar o repositório com SQL compatível com os dois drivers.
- [ ] Executar todos os testes e confirmar aprovação.

### Task 4: Router e renderização PHP

**Files:**
- Create: `operon-site/public_html/app/Routing/Router.php`
- Create: `operon-site/public_html/app/Http/Request.php`
- Create: `operon-site/public_html/app/Http/Response.php`
- Create: `operon-site/public_html/app/Views/View.php`
- Create: `operon-site/public_html/app/Views/layout.php`
- Test: `operon-site/tests/RouterTest.php`

- [ ] Testar as rotas `/`, `/harness-operacional`, `/diagnostico`, `/aplicacoes`, `/sobre`, `/insights` e `/privacidade`.
- [ ] Confirmar 404 para rota inexistente e 405 para método incorreto.
- [ ] Implementar router exato, sem regex dinâmica desnecessária.
- [ ] Implementar layout com escape por padrão, landmarks e metadata por página.
- [ ] Confirmar que assets reais não passam pelo router.

### Task 5: Sistema visual leve

**Files:**
- Modify: `operon-site/public_html/assets/css/site.css`
- Create: `operon-site/public_html/assets/css/components.css`
- Create: `operon-site/public_html/assets/css/pages.css`
- Create: `operon-site/public_html/assets/js/motion/particle-field.js`
- Create: `operon-site/public_html/assets/js/motion/scene-controller.js`
- Test: `operon-site/tests/browser/reduced-motion.spec.js`
- Test: `operon-site/tests/browser/performance.spec.js`

- [ ] Implementar tokens monocromáticos, grid, tipografia e ritmo responsivo sem framework CSS em produção.
- [ ] Portar somente `drift`, `vapor` e morphs abstratos úteis do deck.
- [ ] Limitar DPR a 1,75, partículas por área e apenas uma cena ativa no mobile.
- [ ] Pausar por `IntersectionObserver`, `visibilitychange` e movimento reduzido.
- [ ] Garantir poster estático e conteúdo completo sem JavaScript.
- [ ] Orçamento inicial: CSS ≤ 45 KB gzip, JS inicial ≤ 70 KB gzip e nenhuma imagem hero acima de 220 KB.

### Task 6: Home — da dependência à capacidade

**Files:**
- Create: `operon-site/public_html/app/Views/pages/home.php`
- Create: `operon-site/public_html/app/Views/components/diagnostic-cta.php`
- Create: `operon-site/public_html/assets/js/home.js`
- Test: `operon-site/tests/browser/home.spec.js`

- [ ] Construir primeiro a narrativa sem motion: hero, sintomas, tese, camadas do Harness, demo, método, direção humana, resultado, fundadores e diagnóstico.
- [ ] Marcar a proposta comercial como demonstração ilustrativa.
- [ ] Integrar estados visuais `dispersed`, `converging`, `layered`, `flowing`, `review` e `orbit`.
- [ ] Validar desktop 1440×900, notebook 1280×720 e mobile 390×844.

### Task 7: Diagnóstico e segurança do formulário

**Files:**
- Create: `operon-site/public_html/app/Http/Controllers/DiagnosticController.php`
- Create: `operon-site/public_html/app/Security/Csrf.php`
- Create: `operon-site/public_html/app/Security/RateLimiter.php`
- Create: `operon-site/public_html/app/Views/pages/diagnostico.php`
- Test: `operon-site/tests/DiagnosticControllerTest.php`

- [ ] Testar validação, CSRF, honeypot, consentimento, limite de tamanho e rate limit.
- [ ] Implementar formulário com progressive enhancement e mensagens acessíveis.
- [ ] Persistir apenas por prepared statements.
- [ ] Nunca enviar texto livre do gargalo para analytics ou logs.
- [ ] Não prometer agenda, prazo, diagnóstico automático ou resultado.

### Task 8: Páginas institucionais e conteúdo

**Files:**
- Create: `operon-site/public_html/app/Views/pages/harness.php`
- Create: `operon-site/public_html/app/Views/pages/aplicacoes.php`
- Create: `operon-site/public_html/app/Views/pages/sobre.php`
- Create: `operon-site/public_html/app/Views/pages/insights.php`
- Create: `operon-site/public_html/app/Views/pages/privacidade.php`

- [ ] Usar somente claims aprovados na fonte da verdade.
- [ ] Não publicar cases, preços, SLA ou resultados quantitativos.
- [ ] Não mencionar a relação pública com a LBA.
- [ ] Não inventar artigos para preencher `/insights`.

### Task 9: Build, deploy e verificação

**Files:**
- Modify: `operon-site/tools/build-assets.mjs`
- Create: `operon-site/tools/check-deploy.mjs`
- Create: `operon-site/DEPLOY.md`

- [ ] Minificar CSS/JS localmente e gerar `dist/public_html`.
- [ ] Verificar ausência de `.env`, SQLite, logs, masters, testes, mapas e `node_modules` no deploy.
- [ ] Executar testes PHP, browser, acessibilidade e orçamento de assets.
- [ ] Testar o pacote final com PHP local antes do upload.
- [ ] Documentar criação do MySQL, importação de schema, variáveis, permissões e rollback na hosting.

## Gates antes de publicar

- PHP da hosting ≥ 8.2 com `pdo_mysql`, `mbstring`, `json` e `openssl`.
- Apache com `mod_rewrite`; `mod_headers`, `mod_deflate` e `mod_expires` são melhorias opcionais.
- MySQL/MariaDB com `utf8mb4` e usuário de privilégio mínimo.
- Pasta `storage` não publicamente acessível e gravável somente quando necessário.
- Favicon permanece ausente ou textual até existir solução aprovada.
- A home continua compreensível, navegável e convertível sem Canvas.

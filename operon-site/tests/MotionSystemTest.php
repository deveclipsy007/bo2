<?php

declare(strict_types=1);

require_once __DIR__ . '/TestCase.php';

final class MotionSystemTest extends TestCase
{
    public function testHomeUsesOrbitalHeroAndSemanticParticleMorphs(): void
    {
        $home = file_get_contents(dirname(__DIR__) . '/public_html/app/Views/pages/home.php');

        $this->assertTrue(str_contains($home, 'hero__orbital-film'));
        $this->assertTrue(str_contains($home, '/assets/media/orbital-mobile.webm'));
        $this->assertTrue(substr_count($home, 'data-fx="morph"') >= 3);
        $this->assertTrue(str_contains($home, 'data-shapes="ruido|seta|rede"'));
        $this->assertTrue(str_contains($home, 'data-shapes="balao|cerebro|camadas"'));
        $this->assertTrue(str_contains($home, 'data-shapes="blocos|engrenagem|orbita"'));
    }

    public function testHeroRendersMainPromiseAsInteractiveParticleType(): void
    {
        $home = file_get_contents(dirname(__DIR__) . '/public_html/app/Views/pages/home.php');
        $this->assertTrue(str_contains($home, 'hero__particle-promise'));
        $this->assertTrue(str_contains($home, 'data-fx="vapor" data-words="Mais capacidade"'));
        $this->assertTrue(str_contains($home, '<span class="sr-only">Mais capacidade.</span>'));
    }

    public function testLayoutLoadsTheOperonMotionEngine(): void
    {
        $layout = file_get_contents(dirname(__DIR__) . '/public_html/app/Views/layout.php');
        $engine = dirname(__DIR__) . '/public_html/assets/js/operon-fx.js';

        $this->assertTrue(str_contains($layout, '/assets/js/operon-fx.js'));
        $this->assertTrue(is_file($engine));
        $this->assertTrue(str_contains($layout, 'filemtime'));
    }

    public function testMotionEngineSupportsSemanticMorphs(): void
    {
        $engine = file_get_contents(dirname(__DIR__) . '/public_html/assets/js/operon-fx.js');
        $this->assertTrue(str_contains($engine, "'[data-fx=\"morph\"]'"));
        $this->assertTrue(str_contains($engine, 'buildShape'));
        $this->assertTrue(str_contains($engine, "window.addEventListener('pointermove'"));
        $this->assertTrue(str_contains($engine, "kind==='pasta'"));
        $this->assertTrue(str_contains($engine, "kind==='exclamacao'"));
    }

    public function testKnowledgeCardsUseSemanticParticleSymbols(): void
    {
        $home = file_get_contents(dirname(__DIR__) . '/public_html/app/Views/pages/home.php');
        $this->assertTrue(str_contains($home, 'data-shapes="pasta"'));
        $this->assertTrue(str_contains($home, 'data-shapes="exclamacao"'));
        $this->assertTrue(str_contains($home, 'data-shapes="cerebro"'));
    }

    public function testMobileExperienceUsesOptimizedMotionProfile(): void
    {
        $home = file_get_contents(dirname(__DIR__) . '/public_html/app/Views/pages/home.php');
        $engine = file_get_contents(dirname(__DIR__) . '/public_html/assets/js/operon-fx.js');
        $css = file_get_contents(dirname(__DIR__) . '/public_html/assets/css/site.css');

        $this->assertTrue(str_contains($home, 'orbital-mobile.webm'));
        $this->assertTrue(str_contains($home, 'orbital-mobile.mp4'));
        $this->assertTrue(str_contains($engine, 'mobile ? 1100 : 6200'));
        $this->assertTrue(str_contains($engine, 'mobileFrameInterval'));
        $this->assertTrue(str_contains($engine, 'if(!this.running)return'));
        $this->assertTrue(str_contains($engine, "word==='Mais capacidade'&&mobile"));
        $this->assertTrue(str_contains($engine, 'heroWord?3:mobile?5:4'));
        $this->assertTrue(str_contains($engine, 'heroWord?2800:mobile?1650:7000'));
        $this->assertTrue(str_contains($engine, "this.canvas.style.opacity='1'"));
        $this->assertTrue(str_contains($engine, 'this.heroWord?1.3:mobile?1.05'));
        $this->assertTrue(str_contains($engine, 'capacitySize=Math.min(this.w*.155,this.h*.34)'));
        $this->assertTrue(str_contains($css, '.particle-triad canvas{inset:3rem 0 auto;width:100%'));
    }

    public function testHeaderUsesTheApprovedRasterLogo(): void
    {
        $layout = file_get_contents(dirname(__DIR__) . '/public_html/app/Views/layout.php');
        $this->assertTrue(str_contains($layout, 'operon-logo-horizontal.webp'));
    }

    public function testMobileNavigationKeepsHeroPromiseParticleOnly(): void
    {
        $layout = file_get_contents(dirname(__DIR__) . '/public_html/app/Views/layout.php');
        $home = file_get_contents(dirname(__DIR__) . '/public_html/app/Views/pages/home.php');
        $siteJs = file_get_contents(dirname(__DIR__) . '/public_html/assets/js/site.js');

        $this->assertTrue(str_contains($layout, 'site-nav__eyebrow'));
        $this->assertTrue(str_contains($layout, 'site-nav__footer'));
        $this->assertTrue(!str_contains($home, 'hero__mobile-promise'));
        $this->assertTrue(str_contains($siteJs, "classList.toggle('menu-open'"));
        $this->assertTrue(str_contains($siteJs, "event.key === 'Escape'"));
    }

    public function testHomeExtendsParticleLanguageAcrossTheNarrative(): void
    {
        $home = file_get_contents(dirname(__DIR__) . '/public_html/app/Views/pages/home.php');
        $this->assertTrue(substr_count($home, 'data-fx="vapor"') >= 2);
        $this->assertTrue(str_contains($home, 'data-shapes="pasta"'));
        $this->assertTrue(str_contains($home, 'generated-v2/operational-flow.webp'));
        $this->assertTrue(str_contains($home, 'generated-v2/memory-layers.webp'));
        $this->assertTrue(str_contains($home, 'generated-v2/autonomy-core.webp'));
    }

    public function testConversionJourneyIsConcreteEvidenceLedAndLowFriction(): void
    {
        $base = dirname(__DIR__) . '/public_html/app/Views/';
        $home = file_get_contents($base . 'pages/home.php');
        $capabilities = file_get_contents($base . 'pages/capacidades.php');
        $method = file_get_contents($base . 'pages/metodo.php');
        $about = file_get_contents($base . 'pages/sobre.php');
        $diagnostic = file_get_contents($base . 'pages/diagnostico.php');
        $layout = file_get_contents($base . 'layout.php');

        $this->assertTrue(str_contains($home, 'hero__definition'));
        $this->assertTrue(str_contains($home, 'proof-ribbon'));
        $this->assertTrue(str_contains($home, 'state-shift'));
        $this->assertTrue(str_contains($home, 'operational-case'));
        $this->assertTrue(str_contains($home, 'objection-grid'));
        $this->assertTrue(str_contains($home, 'Conversar sobre minha operação'));
        $this->assertTrue(str_contains($capabilities, 'capability-proof'));
        $this->assertTrue(str_contains($method, 'method-deliverables'));
        $this->assertTrue(str_contains($about, 'operon-thesis'));
        $this->assertTrue(str_contains($diagnostic, 'diagnostic-steps'));
        $this->assertTrue(!str_contains($diagnostic, 'Sem promessa automática'));
        $this->assertTrue(str_contains($layout, 'Conversar sobre a operação'));
    }

    public function testHomeIncludesValidatedCaseAndInteractiveHarnessSimulator(): void
    {
        $home = file_get_contents(dirname(__DIR__) . '/public_html/app/Views/pages/home.php');
        $siteJs = file_get_contents(dirname(__DIR__) . '/public_html/assets/js/site.js');

        $this->assertTrue(str_contains($home, 'operational-case'));
        $this->assertTrue(str_contains($home, 'Case validado'));
        $this->assertTrue(str_contains($home, 'generated-v3/operational-case-system.webp'));
        $this->assertTrue(str_contains($home, 'harness-simulator'));
        $this->assertTrue(str_contains($home, "['Solicitação','A entrada ganha forma.']"));
        $this->assertTrue(str_contains($home, "['Memória','A decisão melhora o próximo ciclo.']"));
        $this->assertTrue(str_contains($home, 'aria-live="polite"'));
        $this->assertTrue(str_contains($home, 'data-sim-restart'));
        $this->assertTrue(str_contains($siteJs, "document.querySelector('[data-harness-simulator]')"));
        $this->assertTrue(str_contains($siteJs, "classList.toggle('is-current'"));
    }

    public function testLuizContabilidadeCaseAndSimulatorUseConcreteOperationalCards(): void
    {
        $home = file_get_contents(dirname(__DIR__) . '/public_html/app/Views/pages/home.php');
        $siteJs = file_get_contents(dirname(__DIR__) . '/public_html/assets/js/site.js');

        $this->assertTrue(str_contains($home, 'Case validado · Luiz Contabilidade'));
        $this->assertTrue(!str_contains($home, 'Cenário demonstrativo'));
        $this->assertTrue(str_contains($home, 'sim-flow-card'));
        $this->assertTrue(str_contains($home, 'Nova demanda contábil'));
        $this->assertTrue(str_contains($home, 'Exceção encontrada'));
        $this->assertTrue(str_contains($home, 'Decisão registrada'));
        $this->assertTrue(str_contains($siteJs, "classList.toggle('is-complete'"));
        $this->assertTrue(str_contains($siteJs, "classList.toggle('is-active'"));
    }

    public function testCapabilitiesPageUsesDistinctGeneratedVisualSystem(): void
    {
        $page = file_get_contents(dirname(__DIR__) . '/public_html/app/Views/pages/capacidades.php');
        $this->assertTrue(str_contains($page, 'class="capability-visual"'));
        $this->assertTrue(str_contains($page, 'generated-v4/capability-<?= $visual ?>.webp'));
        $this->assertTrue(str_contains($page, "'commercial'"));
        $this->assertTrue(str_contains($page, "'service'"));
        $this->assertTrue(str_contains($page, "'management'"));
        $this->assertTrue(str_contains($page, "'memory'"));
        $this->assertTrue(str_contains($page, 'capability-infrastructure.webp'));
    }

    public function testMethodMobileCopyOccupiesContentColumnAndUsesGeneratedScenes(): void
    {
        $page = file_get_contents(dirname(__DIR__) . '/public_html/app/Views/pages/metodo.php');
        $css = file_get_contents(dirname(__DIR__) . '/public_html/assets/css/method.css');
        $this->assertTrue(str_contains($css, '.method-story__step>div{grid-column:2}'));
        $this->assertTrue(str_contains($page, 'method-visual'));
        $this->assertTrue(str_contains($page, 'generated-v5/method-<?= $visual ?>.webp'));
        $this->assertTrue(str_contains($page, "'reveal'"));
        $this->assertTrue(str_contains($page, "'structure'"));
        $this->assertTrue(str_contains($page, "'apply'"));
        $this->assertTrue(str_contains($page, "'evolve'"));
    }

    public function testAboutMakesThePeopleBehindOperonVisibleWithPresentationPortraitsAndTeam(): void
    {
        $page = file_get_contents(dirname(__DIR__) . '/public_html/app/Views/pages/sobre.php');
        $css = file_get_contents(dirname(__DIR__) . '/public_html/assets/css/about.css');
        $layout = file_get_contents(dirname(__DIR__) . '/public_html/app/Views/layout.php');

        $this->assertTrue(str_contains($page, 'founders--portrait'));
        $this->assertTrue(str_contains($page, 'about-yohann-hq.webp'));
        $this->assertTrue(str_contains($page, 'about-matheus-hq.webp'));
        $this->assertTrue(str_contains($page, 'Matheus Marques'));
        $this->assertTrue(str_contains($page, 'Elisa'));
        $this->assertTrue(str_contains($page, 'Evandro'));
        $this->assertTrue(str_contains($page, 'Samuel'));
        $this->assertTrue(str_contains($page, 'Vitor'));
        $this->assertTrue(str_contains($page, 'data-fx="morph"'));
        $this->assertTrue(str_contains($page, 'team-constellation'));
        $this->assertTrue(str_contains($css, '.founder-portrait'));
        $this->assertTrue(str_contains($css, '.team-constellation'));
        $this->assertTrue(str_contains($layout, '/assets/css/about.css'));
    }

    public function testAboutPortraitsStayHighResolutionAndDoNotLeaveInheritedBlankSpace(): void
    {
        $root = dirname(__DIR__) . '/public_html/';
        $page = file_get_contents($root . 'app/Views/pages/sobre.php');
        $css = file_get_contents($root . 'assets/css/about.css');

        $this->assertTrue(str_contains($page, 'about-yohann-hq.webp'));
        $this->assertTrue(str_contains($page, 'about-matheus-hq.webp'));
        $this->assertTrue(is_file($root . 'assets/images/about/about-yohann-hq.webp'));
        $this->assertTrue(is_file($root . 'assets/images/about/about-matheus-hq.webp'));
        $this->assertTrue(filesize($root . 'assets/images/about/about-yohann-hq.webp') > 30_000);
        $this->assertTrue(filesize($root . 'assets/images/about/about-matheus-hq.webp') > 30_000);
        $this->assertTrue(str_contains($css, '.founders--portrait{padding-bottom:0}'));
    }

    public function testGeneratedParticleBackgroundsAreOptimized(): void
    {
        $root = dirname(__DIR__) . '/public_html/assets/images/generated-v2/';
        foreach (['operational-flow.webp', 'memory-layers.webp', 'autonomy-core.webp'] as $asset) {
            $this->assertTrue(is_file($root . $asset));
            $this->assertTrue(filesize($root . $asset) < 200_000);
        }
    }
}

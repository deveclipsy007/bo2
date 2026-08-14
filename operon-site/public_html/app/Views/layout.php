<?php
$meta = $meta ?? [];
$title = $meta['title'] ?? 'OPERON — Harness Operacional';
$description = $meta['description'] ?? 'Estrutura para empresas operarem com clareza, contexto e direção humana.';
$assetVersion = static fn (string $path): string => (string) (filemtime(__DIR__ . '/../../' . ltrim($path, '/')) ?: '1');
?>
<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#000000">
    <meta name="description" content="<?= htmlspecialchars($description, ENT_QUOTES, 'UTF-8') ?>">
    <title><?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/site.css?v=<?= $assetVersion('/assets/css/site.css') ?>">
    <link rel="stylesheet" href="/assets/css/simulator.css?v=<?= $assetVersion('/assets/css/simulator.css') ?>">
    <link rel="stylesheet" href="/assets/css/capabilities.css?v=<?= $assetVersion('/assets/css/capabilities.css') ?>">
    <link rel="stylesheet" href="/assets/css/method.css?v=<?= $assetVersion('/assets/css/method.css') ?>">
    <link rel="stylesheet" href="/assets/css/about.css?v=<?= $assetVersion('/assets/css/about.css') ?>">
</head>
<body>
    <a class="skip-link" href="#conteudo">Ir para o conteúdo</a>
    <header class="site-header" data-header>
        <a class="brand" href="/" aria-label="OPERON — início">
            <img class="brand__image" src="/assets/images/brand/operon-logo-horizontal.webp" alt="OPERON" width="581" height="162">
        </a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
        <nav id="site-nav" class="site-nav" aria-label="Principal">
            <span class="site-nav__eyebrow">Navegação</span>
            <a href="/harness-operacional">Harness</a>
            <a href="/capacidades">Capacidades</a>
            <a href="/metodo">Método</a>
            <a href="/sobre">Sobre</a>
            <a class="nav-cta" href="/diagnostico">Conversar sobre a operação</a>
            <span class="site-nav__footer">Direção humana.<br>Capacidade operacional.</span>
        </nav>
    </header>
    <main id="conteudo"><?= $content ?></main>
    <footer class="site-footer">
        <div>
            <span class="kicker">OPERON</span>
            <p>Capacidade para operar além de você.</p>
        </div>
        <div class="site-footer__links">
            <a href="/harness-operacional">Harness Operacional</a>
            <a href="/capacidades">Capacidades</a>
            <a href="/diagnostico">Diagnóstico</a>
            <a href="/privacidade">Privacidade</a>
        </div>
        <p class="site-footer__small">© <?= date('Y') ?> OPERON. Direção humana, capacidade operacional.</p>
    </footer>
    <script src="/assets/js/operon-fx.js?v=<?= $assetVersion('/assets/js/operon-fx.js') ?>" defer></script>
    <script src="/assets/js/site.js?v=<?= $assetVersion('/assets/js/site.js') ?>" defer></script>
</body>
</html>

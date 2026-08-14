<?php

declare(strict_types=1);

session_start();

require_once __DIR__ . '/app/Config/EnvironmentLoader.php';
require_once __DIR__ . '/app/Routing/Router.php';
require_once __DIR__ . '/app/Views/View.php';
require_once __DIR__ . '/app/Database/DatabaseConfig.php';
require_once __DIR__ . '/app/Database/ConnectionFactory.php';
require_once __DIR__ . '/app/Repositories/DiagnosticLeadRepository.php';

EnvironmentLoader::load(__DIR__ . '/.env');

if (!isset($_SESSION['csrf'])) {
    $_SESSION['csrf'] = bin2hex(random_bytes(24));
}

$router = new Router([
    '/' => 'home',
    '/harness-operacional' => 'harness',
    '/aplicacoes' => 'aplicacoes',
    '/capacidades' => 'capacidades',
    '/metodo' => 'metodo',
    '/sobre' => 'sobre',
    '/diagnostico' => 'diagnostico',
    '/privacidade' => 'privacidade',
]);

$page = $router->resolve($_SERVER['REQUEST_URI'] ?? '/');
if ($page === '404') {
    http_response_code(404);
}

$flash = $_SESSION['flash'] ?? null;
unset($_SESSION['flash']);

if ($page === 'diagnostico' && ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    $csrfValid = hash_equals($_SESSION['csrf'], (string) ($_POST['csrf'] ?? ''));
    $honeypotEmpty = trim((string) ($_POST['website'] ?? '')) === '';
    $name = trim((string) ($_POST['name'] ?? ''));
    $email = filter_var(trim((string) ($_POST['email'] ?? '')), FILTER_VALIDATE_EMAIL);
    $company = trim((string) ($_POST['company'] ?? ''));
    $bottleneck = trim((string) ($_POST['bottleneck'] ?? ''));
    $consent = ($_POST['consent'] ?? '') === '1';

    if (!$csrfValid || !$honeypotEmpty || $name === '' || !$email || $company === '' || mb_strlen($bottleneck) < 20 || !$consent) {
        $_SESSION['flash'] = ['type' => 'error', 'message' => 'Revise os campos e tente novamente.'];
        header('Location: /diagnostico');
        exit;
    }

    try {
        $appEnvironment = getenv('APP_ENV') ?: 'local';
        $environment = ['APP_ENV' => $appEnvironment];
        if ($appEnvironment === 'production') {
            foreach (['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASS'] as $key) {
                $environment[$key] = (string) getenv($key);
            }
        } else {
            $environment['DB_SQLITE_PATH'] = __DIR__ . '/storage/database/operon.sqlite';
        }

        $config = DatabaseConfig::fromEnvironment($environment);
        $connection = ConnectionFactory::create($config);
        if ($config->driver === 'sqlite') {
            $connection->exec((string) file_get_contents(__DIR__ . '/database/schema.sqlite.sql'));
        }
        $repository = new DiagnosticLeadRepository($connection);
        $repository->create([
            'name' => mb_substr($name, 0, 160),
            'email' => mb_substr((string) $email, 0, 254),
            'company' => mb_substr($company, 0, 180),
            'bottleneck' => mb_substr($bottleneck, 0, 3000),
            'consent' => true,
        ]);
        $_SESSION['csrf'] = bin2hex(random_bytes(24));
        $_SESSION['flash'] = ['type' => 'success', 'message' => 'Contexto recebido. A OPERON vai analisar antes de propor o próximo passo.'];
    } catch (Throwable $exception) {
        error_log('Diagnostic submission failed: ' . $exception->getMessage());
        $_SESSION['flash'] = ['type' => 'error', 'message' => 'Não foi possível enviar agora. Tente novamente em alguns minutos.'];
    }

    header('Location: /diagnostico');
    exit;
}

View::render($page, ['flash' => $flash, 'csrf' => $_SESSION['csrf']]);

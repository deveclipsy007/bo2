<?php

declare(strict_types=1);

require_once __DIR__ . '/TestCase.php';
$routerFile = dirname(__DIR__) . '/public_html/app/Routing/Router.php';
if (is_file($routerFile)) {
    require_once $routerFile;
}

final class RouterTest extends TestCase
{
    public function testKnownRoutesResolveToViewNames(): void
    {
        $router = new Router([
            '/' => 'home',
            '/harness-operacional' => 'harness',
            '/capacidades' => 'capacidades',
            '/metodo' => 'metodo',
            '/diagnostico' => 'diagnostico',
        ]);

        $this->assertSame('home', $router->resolve('/'));
        $this->assertSame('harness', $router->resolve('/harness-operacional/'));
        $this->assertSame('capacidades', $router->resolve('/capacidades'));
        $this->assertSame('metodo', $router->resolve('/metodo'));
        $this->assertSame('diagnostico', $router->resolve('/diagnostico?source=hero'));
    }

    public function testUnknownRouteReturnsNotFound(): void
    {
        $router = new Router(['/'=> 'home']);
        $this->assertSame('404', $router->resolve('/nao-existe'));
    }
}

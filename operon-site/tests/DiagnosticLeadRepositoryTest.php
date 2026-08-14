<?php

declare(strict_types=1);

require_once __DIR__ . '/TestCase.php';
$repositoryFile = dirname(__DIR__) . '/public_html/app/Repositories/DiagnosticLeadRepository.php';
if (is_file($repositoryFile)) {
    require_once $repositoryFile;
}

final class DiagnosticLeadRepositoryTest extends TestCase
{
    public function testStoresAValidatedDiagnosticLead(): void
    {
        $connection = new PDO('sqlite::memory:');
        $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $schema = file_get_contents(dirname(__DIR__) . '/public_html/database/schema.sqlite.sql');
        $connection->exec($schema);

        $repository = new DiagnosticLeadRepository($connection);
        $publicId = $repository->create([
            'name' => 'Yohann Escher',
            'email' => 'yohann@example.com',
            'company' => 'OPERON',
            'bottleneck' => 'Toda proposta comercial volta para o fundador.',
            'consent' => true,
        ]);

        $this->assertSame(26, strlen($publicId));
        $this->assertSame('1', (string) $connection->query('SELECT COUNT(*) FROM diagnostic_leads')->fetchColumn());
    }
}

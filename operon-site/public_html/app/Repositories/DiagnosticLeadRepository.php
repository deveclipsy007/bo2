<?php

declare(strict_types=1);

final class DiagnosticLeadRepository
{
    public function __construct(private readonly PDO $connection) {}

    /** @param array{name:string,email:string,company:string,bottleneck:string,consent:bool} $lead */
    public function create(array $lead): string
    {
        $publicId = $this->publicId();
        $statement = $this->connection->prepare(
            'INSERT INTO diagnostic_leads (public_id, name, email, company, operational_bottleneck, consent)
             VALUES (:public_id, :name, :email, :company, :bottleneck, :consent)'
        );
        $statement->execute([
            'public_id' => $publicId,
            'name' => $lead['name'],
            'email' => $lead['email'],
            'company' => $lead['company'],
            'bottleneck' => $lead['bottleneck'],
            'consent' => $lead['consent'] ? 1 : 0,
        ]);
        return $publicId;
    }

    private function publicId(): string
    {
        $alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
        $bytes = random_bytes(26);
        $id = '';
        for ($index = 0; $index < 26; $index++) {
            $id .= $alphabet[ord($bytes[$index]) % 32];
        }
        return $id;
    }
}

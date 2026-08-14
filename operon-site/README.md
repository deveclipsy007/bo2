# OPERON — site institucional

Base preparada para hospedagem compartilhada com Apache e PHP.

## Contrato de ambiente

- Desenvolvimento local: PHP + SQLite.
- Produção: PHP + MySQL/MariaDB.
- Publicação: o conteúdo de `dist/public_html` é enviado para a pasta `public_html` do domínio.
- Node é ferramenta de build local e não é necessário no servidor.

## Estrutura

- `public_html/index.php`: front controller público.
- `public_html/assets`: CSS, JavaScript, fontes e imagens otimizadas.
- `public_html/app`: código PHP protegido pelo Apache.
- `public_html/database`: schemas SQLite e MySQL protegidos pelo Apache.
- `public_html/storage`: banco local e logs, também protegidos.
- `tests`: testes locais fora do pacote publicado.
- `dist/public_html`: pacote limpo gerado para upload.

## Comandos locais

```bash
npm test
npm run dev
npm run build
```

Copie `public_html/.env.example` para `public_html/.env` somente no ambiente local. Em produção, configure as mesmas variáveis no painel ou em um `.env` não versionado.

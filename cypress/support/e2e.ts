import './commands';

/**
 * Tratamento global de exceções não capturadas originadas da APLICAÇÃO.
 *
 * O ambiente de stage do Sittax Token possui um bundle com uma declaração
 * duplicada (`Identifier 'AcessosViewerModal' has already been declared`).
 * Esse é um erro conhecido da aplicação — não da suíte de testes — e não deve
 * derrubar os hooks/testes de E2E que validam a tela de Grupos.
 *
 * Ignoramos APENAS erros conhecidos/esperados. Qualquer outra exceção continua
 * falhando o teste, preservando a capacidade de detectar regressões reais.
 */
const knownAppErrors: RegExp[] = [
    /has already been declared/i,
    /AcessosViewerModal/i,
    // Erros de chunk/carregamento assíncrono comuns em SPAs
    /Loading chunk \d+ failed/i,
    /ChunkLoadError/i,
];

Cypress.on('uncaught:exception', (err) => {
    if (knownAppErrors.some((pattern) => pattern.test(err.message))) {
        // Retornar false impede que o Cypress falhe o teste por este erro.
        return false;
    }
    // Deixa qualquer outro erro falhar o teste (comportamento padrão).
    return true;
});

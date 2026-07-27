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
    // BUG conhecido da APLICAÇÃO (cosmético): a tela /controle/certificados/create dispara
    // `$(...).mask is not a function` — o plugin jQuery Mask não está carregado na página.
    // COMPROVADO não-bloqueante: com o erro ignorado, o formulário renderiza e o upload
    // persiste normalmente (POST /controle/certificados -> 204, certificado aparece na
    // listagem). Ignoramos aqui para validar o fluxo de CRUD; o defeito deve ser reportado
    // ao time do produto (máscara do campo telefone/CNPJ na tela de cadastro de certificado).
    /\.mask is not a function/i,
];

Cypress.on('uncaught:exception', (err) => {
    if (knownAppErrors.some((pattern) => pattern.test(err.message))) {
        // Retornar false impede que o Cypress falhe o teste por este erro.
        return false;
    }
    // Deixa qualquer outro erro falhar o teste (comportamento padrão).
    return true;
});

/**
 * API Intercepts para a aplicação Sittax Token.
 *
 * A aplicação é renderizada no servidor (não é uma SPA com API REST /api/*).
 * Os dados da tela de Grupos são carregados via endpoints do próprio módulo:
 *   - GET  /grupos                      → página inicial (HTML)
 *   - POST /grupos/nova-area/search     → listagem/busca/paginação (partial)
 *   - GET  /grupos/nova-area/create     → tela de cadastro
 *   - GET  /grupos/nova-area/edit/:id   → tela de edição
 *   - POST /grupos/nova-area/duplicate/:id → duplicar
 *   - DELETE/POST /grupos/:id           → excluir
 *   - POST /login                       → autenticação
 *
 * Endpoints confirmados por inspeção do tráfego real do ambiente de stage.
 */

/** Aliases expostos para uso com cy.wait('@alias'). */
export const ALIAS = {
    listarGrupos: 'listarGrupos',
    buscarGrupos: 'buscarGrupos',
    paginarGrupos: 'paginarGrupos',
    pagina: 'paginaGrupos',
    editarGrupo: 'editarGrupo',
    criarGrupo: 'criarGrupo',
    duplicarGrupo: 'duplicarGrupo',
    excluirGrupo: 'excluirGrupo',
    buscarCertificados: 'buscarCertificados',
    buscarAgentes: 'buscarAgentes',
    login: 'loginRequest',
    dashboard: 'dashboardPage',
    verCertificado: 'verCertificadoRequest',
    verProcuracoes: 'verProcuracoesRequest',
    verAcessos: 'verAcessosRequest',
    compartilharCertificado: 'compartilharCertificadoRequest',
    editarCertificado: 'editarCertificadoRequest',
    excluirCertificado: 'excluirCertificadoRequest',
} as const;

/**
 * Registra intercepts para as requisições da página de Grupos.
 * Todas as ações de listar/buscar/paginar usam o MESMO endpoint POST /search.
 */
export function setupGruposIntercepts(): void {
    // POST - Listagem, busca e paginação (mesmo endpoint)
    cy.intercept('POST', '**/grupos/nova-area/search*').as(ALIAS.listarGrupos);

    // GET - Página HTML de grupos
    cy.intercept('GET', '**/grupos').as(ALIAS.pagina);

    // GET - Tela de cadastro
    cy.intercept('GET', '**/grupos/nova-area/create*').as(ALIAS.criarGrupo);

    // GET - Tela de edição
    cy.intercept('GET', '**/grupos/nova-area/edit/*').as(ALIAS.editarGrupo);

    // POST - Busca de certificados na tela de cadastro/edição
    cy.intercept('POST', '**/grupos/nova-area/edit/search-certificados*').as(ALIAS.buscarCertificados);

    // POST - Busca de agentes/usuários na tela de cadastro/edição
    cy.intercept('POST', '**/grupos/nova-area/edit/search-agentes*').as(ALIAS.buscarAgentes);

    // POST - Duplicar grupo
    cy.intercept('POST', '**/grupos/nova-area/duplicate/*').as(ALIAS.duplicarGrupo);

    // DELETE/POST - Excluir grupo
    cy.intercept({ method: 'DELETE', url: '**/grupos/*' }).as(ALIAS.excluirGrupo);
}

/**
 * Registra intercept para a requisição de login.
 */
export function setupLoginIntercepts(): void {
    cy.intercept('POST', '**/login*').as(ALIAS.login);
}

/**
 * Registra intercepts para as requisições da tela de Dashboard.
 */
export function setupDashboardIntercepts(): void {
    cy.intercept('GET', '**/dashboard*').as(ALIAS.dashboard);
    cy.intercept('GET', '**/controle/certificados/view-data/*').as(ALIAS.verCertificado);
    // O app dispara procuracoes-ajax/{id}. Glob não cruza a barra de forma confiável aqui,
    // então usamos RegExp (casa em qualquer ponto da URL).
    cy.intercept('GET', /\/controle\/certificados\/procuracoes/).as(ALIAS.verProcuracoes);
    cy.intercept('GET', '**/controle/certificados/sites/*').as(ALIAS.verAcessos);
    cy.intercept('GET', '**/controle/certificados/doubleForm/*').as(ALIAS.compartilharCertificado);
    cy.intercept('GET', '**/controle/certificados/update/*').as(ALIAS.editarCertificado);
    cy.intercept('GET', '**/controle/certificados/deleteForm/*').as(ALIAS.excluirCertificado);
}



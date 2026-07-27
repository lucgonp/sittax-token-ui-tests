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

    // Agentes
    paginaAgentes: 'paginaAgentes',
    listarAgentes: 'listarAgentesRequest',
    criarAgente: 'criarAgenteRequest',
    editarAgente: 'editarAgenteRequest',
    verGruposAgente: 'verGruposAgenteRequest',
    verCertificadosAgente: 'verCertificadosAgenteRequest',
    verProcuracoesAgente: 'verProcuracoesAgenteRequest',
    verSitesAgente: 'verSitesAgenteRequest',
    alterarSenhaAgente: 'alterarSenhaAgenteRequest',
    excluirAgenteForm: 'excluirAgenteFormRequest',
    salvarAgente: 'salvarAgenteRequest',
    atualizarAgente: 'atualizarAgenteRequest',
    excluirAgente: 'excluirAgenteRequest',
    exportarAgentes: 'exportarAgentesRequest',

    // Certificados (Controle)
    paginaCertificados: 'paginaCertificados',
    listarCertificados: 'listarCertificadosRequest',
    criarCertificado: 'criarCertificadoRequest',
    salvarCertificado: 'salvarCertificadoRequest',
    editarCertificadoForm: 'editarCertificadoFormRequest',
    atualizarCertificado: 'atualizarCertificadoRequest',
    verDadosCertificado: 'verDadosCertificadoRequest',
    verProcuracoesCert: 'verProcuracoesCertRequest',
    verSitesCert: 'verSitesCertRequest',
    compartilharCert: 'compartilharCertRequest',
    excluirCertificadoForm: 'excluirCertificadoFormRequest',
    excluirCertificadoPost: 'excluirCertificadoPostRequest',
    exportarCertificados: 'exportarCertificadosRequest',

    // Importações (Controle)
    paginaImportacoes: 'paginaImportacoes',
    listarImportacoes: 'listarImportacoesRequest',
    exportarImportacao: 'exportarImportacaoRequest',
    excluirImportacao: 'excluirImportacaoRequest',
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

/**
 * Registra intercepts para as requisições da tela de Agentes (/usuarios/agentes/nova-area).
 */
export function setupAgentesIntercepts(): void {
    cy.intercept('GET', '**/usuarios/agentes/nova-area*').as(ALIAS.paginaAgentes);
    cy.intercept('POST', '**/usuarios/agentes/nova-area/search*').as(ALIAS.listarAgentes);
    cy.intercept('GET', '**/usuarios/agentes/create*').as(ALIAS.criarAgente);
    cy.intercept('GET', '**/usuarios/agentes/edit/*').as(ALIAS.editarAgente);
    cy.intercept('GET', /\/usuarios\/agentes\/.*\/grupos/).as(ALIAS.verGruposAgente);
    cy.intercept('GET', /\/usuarios\/agentes\/.*\/certificados/).as(ALIAS.verCertificadosAgente);
    cy.intercept('GET', /\/usuarios\/agentes\/.*\/procuracoes/).as(ALIAS.verProcuracoesAgente);
    cy.intercept('GET', /\/usuarios\/agentes\/.*\/sites/).as(ALIAS.verSitesAgente);
    cy.intercept('GET', /\/usuarios\/agentes\/.*\/password/).as(ALIAS.alterarSenhaAgente);
    cy.intercept('GET', /\/usuarios\/agentes\/.*\/deleteForm/).as(ALIAS.excluirAgenteForm);
    cy.intercept('GET', '**/usuarios/agentes/export*').as(ALIAS.exportarAgentes);

    // POST - Submeter cadastro de agente
    cy.intercept('POST', '**/usuarios/agentes/create*').as(ALIAS.salvarAgente);
    // POST - Submeter edição de agente
    cy.intercept('POST', '**/usuarios/agentes/update*').as(ALIAS.atualizarAgente);
    // DELETE - Excluir agente
    cy.intercept('DELETE', /\/usuarios\/agentes\/\d+/).as(ALIAS.excluirAgente);
}

/**
 * Registra intercepts para as requisições da tela de Certificados (/controle/certificados).
 */
export function setupCertificadosIntercepts(): void {
    // GET - Página HTML de certificados
    cy.intercept('GET', '**/controle/certificados').as(ALIAS.paginaCertificados);
    // POST - Listagem, busca e paginação
    cy.intercept('POST', '**/controle/certificados/nova-area/search*').as(ALIAS.listarCertificados);
    // GET - Tela de cadastro/upload
    cy.intercept('GET', '**/controle/certificados/create*').as(ALIAS.criarCertificado);
    // POST - Submeter upload de certificado.
    // O submit real NÃO vai para /create: a tela posta em `/controle/certificados`
    // e responde 204 (confirmado inspecionando o tráfego). O `?` garante que só casa
    // a raiz exata, sem colidir com `/nova-area/search`.
    cy.intercept('POST', /\/controle\/certificados(\?.*)?$/).as(ALIAS.salvarCertificado);
    // GET - Tela de edição
    cy.intercept('GET', '**/controle/certificados/update/*').as(ALIAS.editarCertificadoForm);
    // POST - Submeter edição de certificado
    cy.intercept('POST', '**/controle/certificados/update/*').as(ALIAS.atualizarCertificado);
    // GET - Ver dados do certificado
    cy.intercept('GET', '**/controle/certificados/view-data/*').as(ALIAS.verDadosCertificado);
    // GET - Ver procurações do certificado
    cy.intercept('GET', /\/controle\/certificados\/.*\/procuracoes/).as(ALIAS.verProcuracoesCert);
    // GET - Ver sites/acessos do certificado
    cy.intercept('GET', '**/controle/certificados/sites/*').as(ALIAS.verSitesCert);
    // GET - Compartilhar certificado
    cy.intercept('GET', '**/controle/certificados/doubleForm/*').as(ALIAS.compartilharCert);
    // GET - Form de exclusão
    cy.intercept('GET', '**/controle/certificados/deleteForm/*').as(ALIAS.excluirCertificadoForm);
    // DELETE - Excluir certificado
    cy.intercept('DELETE', /\/controle\/certificados\/\d+/).as(ALIAS.excluirCertificadoPost);
    // GET - Exportar certificados
    cy.intercept('GET', '**/controle/certificados/export*').as(ALIAS.exportarCertificados);
}

/**
 * Registra intercepts para as requisições da tela de Importações (/controle/importacoes).
 */
export function setupImportacoesIntercepts(): void {
    // GET - Página HTML de importações
    cy.intercept('GET', '**/controle/importacoes').as(ALIAS.paginaImportacoes);
    // POST - Listagem, busca e paginação
    cy.intercept('POST', '**/controle/importacoes/nova-area/search*').as(ALIAS.listarImportacoes);
    // NOTA: o "Exportar" da tela de importações é gerado no CLIENTE (blob .xlsx),
    // sem request HTTP — não há endpoint para interceptar. A validação é feita pelo
    // arquivo baixado (ver spec importacoes.cy.ts). Por isso não há intercept de export aqui.
    // DELETE - Excluir importação
    cy.intercept({ method: 'DELETE', url: '**/controle/importacoes/*' }).as(ALIAS.excluirImportacao);
}

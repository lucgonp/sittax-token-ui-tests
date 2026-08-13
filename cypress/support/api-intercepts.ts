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
    paginaLogin: 'paginaLogin',
    login: 'loginRequest',
    recuperarSenha: 'recuperarSenhaRequest',
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

    // Convites (Controle)
    paginaConvites: 'paginaConvites',
    listarConvites: 'listarConvitesRequest',
    criarConvite: 'criarConviteRequest',
    salvarConvite: 'salvarConviteRequest',
    reenviarConvite: 'reenviarConviteRequest',
    excluirConvite: 'excluirConviteRequest',
    exportarConvites: 'exportarConvitesRequest',

    // Monitoramento (Controle)
    paginaMonitoramentos: 'paginaMonitoramentos',
    listarMonitoramentos: 'listarMonitoramentosRequest',
    exportarMonitoramentos: 'exportarMonitoramentosRequest',
    verVideoMonitoramento: 'verVideoMonitoramentoRequest',

    // Regras (Controle)
    paginaRegras: 'paginaRegras',
    listarRegras: 'listarRegrasRequest',
    criarRegra: 'criarRegraRequest',
    salvarRegra: 'salvarRegraRequest',
    editarRegra: 'editarRegraRequest',
    atualizarRegra: 'atualizarRegraRequest',
    excluirRegra: 'excluirRegraRequest',

    // Usuários (Cadastros)
    paginaUsuarios: 'paginaUsuarios',
    listarUsuarios: 'listarUsuariosRequest',
    criarUsuario: 'criarUsuarioRequest',
    salvarUsuario: 'salvarUsuarioRequest',
    editarUsuario: 'editarUsuarioRequest',
    atualizarUsuario: 'atualizarUsuarioRequest',
    excluirUsuario: 'excluirUsuarioRequest',

    // Relatórios
    relatorioCertificados: 'relatorioCertificadosRequest',
    relatorioCertificadosLista: 'relatorioCertificadosListaRequest',
    relatorioCertificadosDesconhecidos: 'relatorioCertificadosDesconhecidosRequest',
    relatorioCertificadosVencimento: 'relatorioCertificadosVencimentoRequest',
    relatorioCertificadosGrupos: 'relatorioCertificadosGruposRequest',
    relatorioCertificadosUsuarios: 'relatorioCertificadosUsuariosRequest',
    relatorioProcuracoes: 'relatorioProcuracoesRequest',
    relatorioAcoes: 'relatorioAcoesRequest',
    buscarAcoes: 'buscarAcoesRequest',

    // Atualizações / Novidades (Utilitários)
    paginaAtualizacoes: 'paginaAtualizacoesRequest',
    listarAtualizacoes: 'listarAtualizacoesRequest',
    visualizarAtualizacao: 'visualizarAtualizacaoRequest',

    // Logs (Utilitários)
    paginaLogs: 'paginaLogsRequest',
    listarLogs: 'listarLogsRequest',

    // Perfis de Acesso (Utilitários)
    paginaPerfisDeAcesso: 'paginaPerfisDeAcessoRequest',
    listarPerfisDeAcesso: 'listarPerfisDeAcessoRequest',
    criarPerfilDeAcesso: 'criarPerfilDeAcessoRequest',
    editarPerfilDeAcesso: 'editarPerfilDeAcessoRequest',
    permissoesPerfilDeAcesso: 'permissoesPerfilDeAcessoRequest',

    // Representantes (Cadastros)
    paginaRepresentantes: 'paginaRepresentantesRequest',
    listarRepresentantes: 'listarRepresentantesRequest',
    criarRepresentante: 'criarRepresentanteRequest',
    salvarRepresentante: 'salvarRepresentanteRequest',
    editarRepresentante: 'editarRepresentanteRequest',
    atualizarRepresentante: 'atualizarRepresentanteRequest',
    excluirRepresentante: 'excluirRepresentanteRequest',

    // Users & Impersonate & Rep Users (Cadastros)
    paginaUsers: 'paginaUsersRequest',
    buscarUsers: 'buscarUsersRequest',
    impersonateUser: 'impersonateUserRequest',
    paginaRepUsers: 'paginaRepUsersRequest',
    listarRepUsers: 'listarRepUsersRequest',
    criarRepUser: 'criarRepUserRequest',
    salvarRepUser: 'salvarRepUserRequest',
    editarRepUser: 'editarRepUserRequest',
    atualizarRepUser: 'atualizarRepUserRequest',
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
    cy.intercept('POST', '**/forgot-password*').as(ALIAS.recuperarSenha);
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

/**
 * Registra intercepts para as requisições da tela de Convites (/controle/convites).
 */
export function setupConvitesIntercepts(): void {
    // GET - Página HTML de convites
    cy.intercept('GET', '**/controle/convites').as(ALIAS.paginaConvites);
    // POST - Listagem, busca e paginação
    cy.intercept('POST', '**/controle/convites/nova-area/search*').as(ALIAS.listarConvites);
    // GET - Tela de cadastro de convite
    cy.intercept('GET', '**/controle/convites/create*').as(ALIAS.criarConvite);
    // POST - Submeter cadastro de convite
    cy.intercept('POST', '**/controle/convites/create*').as(ALIAS.salvarConvite);
    // POST/GET - Reenviar convite
    cy.intercept({ url: '**/controle/convites/*/resend*' }).as(ALIAS.reenviarConvite);
    // DELETE/POST - Excluir / Cancelar convite
    cy.intercept({ url: '**/controle/convites/*' }).as(ALIAS.excluirConvite);
    // GET - Exportar convites
    cy.intercept('GET', '**/controle/convites/export*').as(ALIAS.exportarConvites);
}

/**
 * Registra intercepts para as requisições da tela de Monitoramento (/controle/monitoramentos/nova-area).
 */
export function setupMonitoramentosIntercepts(): void {
    // GET - Página HTML de monitoramento
    cy.intercept('GET', '**/controle/monitoramentos/nova-area*').as(ALIAS.paginaMonitoramentos);
    // POST - Listagem, busca, paginação e atualização
    cy.intercept('POST', '**/controle/monitoramentos/nova-area/search*').as(ALIAS.listarMonitoramentos);
    // GET - Exportar monitoramentos
    cy.intercept('GET', '**/controle/monitoramentos/export*').as(ALIAS.exportarMonitoramentos);
    // GET - Ver vídeo/gravação de monitoramento
    cy.intercept('GET', '**/controle/monitoramentos/video/*').as(ALIAS.verVideoMonitoramento);
}

/**
 * Registra intercepts para as requisições da tela de Regras (/controle/regras).
 */
export function setupRegrasIntercepts(): void {
    // GET - Página HTML de regras
    cy.intercept('GET', '**/controle/regras*').as(ALIAS.paginaRegras);
    // POST - Listagem, busca, ordenação e paginação
    cy.intercept('POST', '**/controle/regras/nova-area/search*').as(ALIAS.listarRegras);
    // GET - Tela de cadastro de regra
    cy.intercept('GET', '**/controle/regras/create*').as(ALIAS.criarRegra);
    // POST - Salvar nova regra
    cy.intercept('POST', '**/controle/regras/create*').as(ALIAS.salvarRegra);
    cy.intercept('POST', '**/controle/regras').as(ALIAS.salvarRegra);
    // GET - Carregar regra para edição
    cy.intercept('GET', '**/controle/regras/*/edit*').as(ALIAS.editarRegra);
    // POST - Busca de agentes na edição/cadastro de regra (AJAX)
    cy.intercept('POST', '**/search-agentes*').as(ALIAS.buscarAgentes);
    // POST - Busca de certificados na edição/cadastro de regra (AJAX)
    cy.intercept('POST', '**/search-certificados*').as(ALIAS.buscarCertificados);
    // PUT/POST - Atualizar regra existente
    cy.intercept({ url: '**/controle/regras/*' }).as(ALIAS.atualizarRegra);
    // DELETE/POST - Excluir regra
    cy.intercept({ url: '**/controle/regras/*' }).as(ALIAS.excluirRegra);
}

/**
 * Registra intercepts para as requisições da tela de Usuários (/usuarios).
 */
export function setupUsuariosIntercepts(): void {
    // GET - Página HTML de usuários
    cy.intercept('GET', '**/usuarios*').as(ALIAS.paginaUsuarios);
    // POST - Listagem, busca e paginação
    cy.intercept('POST', '**/usuarios/search-sistema*').as(ALIAS.listarUsuarios);
    // GET - Tela de cadastro de usuário
    cy.intercept('GET', '**/usuarios/create*').as(ALIAS.criarUsuario);
    // POST - Salvar novo usuário
    cy.intercept('POST', '**/users*').as(ALIAS.salvarUsuario);
    cy.intercept('POST', '**/usuarios/create*').as(ALIAS.salvarUsuario);
    // GET - Carregar usuário para edição
    cy.intercept('GET', '**/usuarios/*/edit*').as(ALIAS.editarUsuario);
    // PUT/POST - Atualizar usuário existente
    cy.intercept({ url: '**/usuarios/*' }).as(ALIAS.atualizarUsuario);
    // DELETE/POST - Excluir usuário
    cy.intercept({ url: '**/usuarios/*' }).as(ALIAS.excluirUsuario);
}

/**
 * Registra intercepts para todas as requisições do módulo de Relatórios.
 */
export function setupRelatoriosIntercepts(): void {
    cy.intercept('GET', '**/relatorios/certificados').as(ALIAS.relatorioCertificados);
    cy.intercept('GET', '**/relatorios/certificados-lista*').as(ALIAS.relatorioCertificadosLista);
    cy.intercept('GET', '**/relatorios/certificados-desconhecidos*').as(ALIAS.relatorioCertificadosDesconhecidos);
    cy.intercept('GET', '**/relatorios/certificados-vencimentos*').as(ALIAS.relatorioCertificadosVencimento);
    cy.intercept('GET', '**/relatorios/certificados-grupos*').as(ALIAS.relatorioCertificadosGrupos);
    cy.intercept('GET', '**/relatorios/certificados-usuarios*').as(ALIAS.relatorioCertificadosUsuarios);
    cy.intercept('GET', '**/relatorios/procuracoes*').as(ALIAS.relatorioProcuracoes);
    cy.intercept('GET', '**/acoes/nova-area*').as(ALIAS.relatorioAcoes);
    cy.intercept('POST', '**/acoes/nova-area/search*').as(ALIAS.buscarAcoes);
}

/**
 * Registra intercepts para as requisições da tela de Atualizações / Novidades
 * (/cadastros/novidades/nova-area).
 *
 * Tela somente-leitura: listagem com busca e visualização de detalhes.
 */
export function setupAtualizacoesIntercepts(): void {
    // GET - Página HTML de atualizações
    cy.intercept('GET', '**/cadastros/novidades/nova-area').as(ALIAS.paginaAtualizacoes);
    // POST - Listagem, busca e paginação
    cy.intercept('POST', '**/cadastros/novidades/nova-area/search*').as(ALIAS.listarAtualizacoes);
    // GET - Visualizar detalhes de uma novidade
    cy.intercept('GET', '**/cadastros/novidades/nova-area/*').as(ALIAS.visualizarAtualizacao);
}

/**
 * Registra intercepts para as requisições da tela de Logs (/logs/nova-area).
 *
 * Tela somente-leitura: listagem com busca, ordenação e expansão inline.
 * Não possui tela de detalhe separada nem operações de escrita.
 */
export function setupLogsIntercepts(): void {
    // GET - Página HTML de logs
    cy.intercept('GET', '**/logs/nova-area').as(ALIAS.paginaLogs);
    // POST - Listagem, busca e ordenação
    cy.intercept('POST', '**/logs/nova-area/search*').as(ALIAS.listarLogs);
}

/**
 * Registra intercepts para as requisições da tela de Perfis de Acesso (/roles/nova-area).
 *
 * Tela CRUD completa: listagem, busca, criação, edição e gerenciamento de permissões.
 */
export function setupPerfisDeAcessoIntercepts(): void {
    // GET - Página HTML de perfis
    cy.intercept('GET', '**/roles/nova-area').as(ALIAS.paginaPerfisDeAcesso);
    // POST - Listagem, busca e paginação
    cy.intercept('POST', '**/roles/nova-area/search*').as(ALIAS.listarPerfisDeAcesso);
    // POST - Criar novo perfil
    cy.intercept('POST', '**/roles/nova-area/store*').as(ALIAS.criarPerfilDeAcesso);
    // PUT/POST - Editar perfil existente
    cy.intercept('PUT', '**/roles/nova-area/*/update*').as(ALIAS.editarPerfilDeAcesso);
    // GET - Página de permissões
    cy.intercept('GET', '**/roles/nova-area/*/permissions*').as(ALIAS.permissoesPerfilDeAcesso);
}

/**
 * Registra intercepts para as requisições da tela de Representantes (/cadastros/representantes).
 */
export function setupRepresentantesIntercepts(): void {
    // GET - Página HTML de representantes
    cy.intercept('GET', '**/cadastros/representantes*').as(ALIAS.paginaRepresentantes);
    // POST - Listagem, busca e paginação
    cy.intercept('POST', '**/cadastros/representantes*').as(ALIAS.listarRepresentantes);
    // POST - Criar novo representante
    cy.intercept('POST', '**/cadastros/representantes/store*').as(ALIAS.salvarRepresentante);
    cy.intercept('POST', '**/cadastros/representantes/create*').as(ALIAS.salvarRepresentante);
    cy.intercept('POST', '**/cadastros/representantes').as(ALIAS.salvarRepresentante);
    // GET - Carregar representante para edição
    cy.intercept('GET', '**/cadastros/representantes/*/edit*').as(ALIAS.editarRepresentante);
    // PUT/POST - Atualizar representante existente
    cy.intercept({ url: '**/cadastros/representantes/*' }).as(ALIAS.atualizarRepresentante);
    // DELETE - Excluir representante
    cy.intercept('DELETE', '**/cadastros/representantes/*').as(ALIAS.excluirRepresentante);
}

/**
 * Registra intercepts para as requisições de /users, Impersonate (/users/impersonate/*) e /rep/users.
 */
export function setupImpersonateERepUsersIntercepts(): void {
    // GET - Página de usuários (/users)
    cy.intercept('GET', '**/users').as(ALIAS.paginaUsers);
    cy.intercept('GET', '**/users?*').as(ALIAS.paginaUsers);

    // POST/GET - Busca em /users
    cy.intercept({ url: '**/users*search*' }).as(ALIAS.buscarUsers);
    cy.intercept('POST', '**/users/search-sistema*').as(ALIAS.buscarUsers);

    // GET - Impersonate (Assumir controle)
    cy.intercept('GET', '**/users/impersonate/*').as(ALIAS.impersonateUser);

    // GET - Página /rep/users (Usuário do sistema)
    cy.intercept('GET', '**/rep/users*').as(ALIAS.paginaRepUsers);

    // POST/GET - Listagem/busca em /rep/users
    cy.intercept('POST', '**/rep/users/search*').as(ALIAS.listarRepUsers);

    // GET - Tela de cadastro em /rep/users
    cy.intercept('GET', '**/rep/users/create*').as(ALIAS.criarRepUser);
    cy.intercept('GET', '**/users/create*').as(ALIAS.criarRepUser);

    // POST - Salvar gestor em /rep/users (submete POST em /users)
    cy.intercept('POST', /\/users(\?.*)?$/).as(ALIAS.salvarRepUser);
    cy.intercept('POST', '**/rep/users/create*').as(ALIAS.salvarRepUser);
    cy.intercept('POST', '**/rep/users/store*').as(ALIAS.salvarRepUser);
    cy.intercept('POST', '**/rep/users').as(ALIAS.salvarRepUser);

    // GET - Tela de edição em /rep/users
    cy.intercept('GET', '**/rep/users/*/edit*').as(ALIAS.editarRepUser);
    cy.intercept('GET', '**/users/*/edit*').as(ALIAS.editarRepUser);

    // PUT/POST - Atualizar gestor em /rep/users (submete POST/PUT em /users/:id)
    cy.intercept('POST', /\/users\/\d+(\?.*)?$/).as(ALIAS.atualizarRepUser);
    cy.intercept('PUT', /\/users\/\d+(\?.*)?$/).as(ALIAS.atualizarRepUser);
    cy.intercept({ url: '**/rep/users/*' }).as(ALIAS.atualizarRepUser);
    cy.intercept({ url: '**/rep/users/*/update*' }).as(ALIAS.atualizarRepUser);
}



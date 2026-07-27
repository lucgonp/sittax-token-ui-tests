/**
 * Page Object para a página de listagem de Grupos (/grupos).
 *
 * Seletores baseados no DOM real do design system "nd-*" da aplicação.
 */
export const GruposPage = {

    // ══════════════════════════════════════════════
    //  TÍTULO / AÇÕES PRINCIPAIS
    // ══════════════════════════════════════════════

    /** Título "Grupos" da barra de página (não o link oculto da navbar) */
    getTituloPagina: () => cy.get('.nd-title-bar__left [role="heading"]'),

    /** Botão/link "Cadastrar grupo" */
    getBotaoCadastrarGrupo: () => cy.get('a.nd-btn-primary[href*="/grupos/nova-area/create"]'),

    /** Campo de busca */
    getCampoBusca: () => cy.get('#nd-grupos-search'),

    // ══════════════════════════════════════════════
    //  TABELA
    // ══════════════════════════════════════════════

    /** Tabela de grupos */
    getTabela: () => cy.get('table').first(),

    /** Cabeçalhos da tabela */
    getHeaderColunas: () => cy.get('table thead th, table thead td'),

    /** Linhas da tabela (body) */
    getLinhasTabela: () => cy.get('table tbody tr'),

    /** Célula de nome do grupo em uma linha */
    getNomeGrupoNaLinha: (index: number) => cy.get('table tbody tr').eq(index).find('td').eq(0),

    /** Célula de usuários em uma linha */
    getUsuariosNaLinha: (index: number) => cy.get('table tbody tr').eq(index).find('td').eq(1),

    /** Célula de certificados em uma linha */
    getCertificadosNaLinha: (index: number) => cy.get('table tbody tr').eq(index).find('td').eq(2),

    // ══════════════════════════════════════════════
    //  MENU DE AÇÕES (dropdown por linha)
    //  Ao abrir, o painel é realocado para o body (floating UI), por isso é
    //  consultado globalmente pela classe de estado aberto.
    // ══════════════════════════════════════════════

    /** Botão "Ações" (gatilho do dropdown) de uma linha específica */
    getBotaoAcoesNaLinha: (index: number) =>
        cy.get('table tbody tr').eq(index).find('button[data-dt-action-trigger]'),

    /** Painel do menu de ações quando aberto (realocado no body) */
    getMenuAcoesAberto: () => cy.get('.nd-table-action-menu.nd-pop--open'),

    /** Opção "Editar" no menu aberto */
    getOpcaoEditar: () => GruposPage.getMenuAcoesAberto().find('[data-dt-action-key="edit"]'),

    /** Opção "Duplicar grupo" no menu aberto */
    getOpcaoDuplicar: () => GruposPage.getMenuAcoesAberto().find('[data-dt-action-key="duplicate"]'),

    /** Opção "Excluir" no menu aberto */
    getOpcaoExcluir: () => GruposPage.getMenuAcoesAberto().find('[data-dt-action-key="delete"]'),

    // ══════════════════════════════════════════════
    //  MODAL DE EXCLUSÃO (fly-dialog)
    // ══════════════════════════════════════════════

    /** Modal de confirmação de exclusão (quando ativo) */
    getModalExcluir: () => cy.get('.fly-dialog--active[role="dialog"]'),

    /** Título do modal de exclusão */
    getTituloModalExcluir: () => cy.get('.fly-alert__title'),

    /** Mensagem do modal de exclusão */
    getMensagemModalExcluir: () => cy.get('.fly-alert__message'),

    /** Botão "Não, Cancelar" no modal de exclusão */
    getBotaoCancelarExclusao: () => cy.get('.fly-alert__btn--cancel'),

    /** Botão "Sim, quero continuar" no modal de exclusão */
    getBotaoConfirmarExclusao: () => cy.get('.fly-alert__btn--confirm'),

    // ══════════════════════════════════════════════
    //  PAGINAÇÃO
    // ══════════════════════════════════════════════

    /** Texto de total de resultados (ex: "88 resultados") */
    getTotalResultados: () => cy.get('.nd-pagination__count'),

    /** Rótulo "Resultados por página:" */
    getResultadosPorPagina: () => cy.get('.nd-pagination__label'),

    /** Seletor de quantidade por página */
    getSelectPorPagina: () => cy.get('.nd-pagination__select'),

    /** Botão de próxima página */
    getBotaoProximaPagina: () => cy.get('.nd-pagination__btn[aria-label="Próxima página"]'),

    /** Botão de página anterior */
    getBotaoPaginaAnterior: () => cy.get('.nd-pagination__btn[aria-label="Página anterior"]'),

    // ══════════════════════════════════════════════
    //  NAVBAR
    // ══════════════════════════════════════════════

    /** Logo Sittax Token */
    getLogo: () => cy.get('.nd-navbar__logo img').first(),

    /** Menu "Dashboard" (link direto) */
    getMenuDashboard: () => cy.get('.nd-navbar a.nd-navbar__item[href*="/dashboard"]'),

    /** Item de navbar (dropdown) pelo texto — Controle, Cadastros, Relatórios, Utilitários */
    getItemNavbar: (texto: string) => cy.get('.nd-navbar').contains('.nd-navbar__item-interactive', texto),

    getMenuControle: () => GruposPage.getItemNavbar('Controle'),
    getMenuCadastros: () => GruposPage.getItemNavbar('Cadastros'),
    getMenuRelatorios: () => GruposPage.getItemNavbar('Relatórios'),
    getMenuUtilitarios: () => GruposPage.getItemNavbar('Utilitários'),

    /** Nome/e-mail do usuário logado */
    getUsuarioNome: () => cy.get('.nd-navbar__avatar-name'),

    /** Perfil do usuário (ex: MASTER) */
    getUsuarioPerfil: () => cy.get('.nd-navbar__avatar-role'),

    /** Empresa/escritório do usuário */
    getUsuarioEmpresa: () => cy.get('.nd-navbar__avatar-company'),

    /** Botão do avatar do usuário */
    getAvatarUsuario: () => cy.get('button[aria-label="Menu do usuário"]'),

    // ══════════════════════════════════════════════
    //  FOOTER
    // ══════════════════════════════════════════════

    getFooter: () => cy.get('footer.nd-footer'),

    // ══════════════════════════════════════════════
    //  AÇÕES
    // ══════════════════════════════════════════════

    /** Digita um termo no campo de busca */
    buscarGrupo: (nome: string) => {
        GruposPage.getCampoBusca().clear().type(nome);
    },

    /** Limpa o campo de busca */
    limparBusca: () => {
        GruposPage.getCampoBusca().clear();
    },

    /** Abre o menu de ações da linha indicada */
    abrirMenuAcoes: (index: number) => {
        GruposPage.getBotaoAcoesNaLinha(index).click();
        GruposPage.getMenuAcoesAberto().should('be.visible');
    },

    /** Fecha qualquer menu de ações aberto (clicando fora) */
    fecharMenuAcoes: () => {
        cy.get('body').click(0, 0);
    },

    /** Abre o menu e clica em "Editar" na linha indicada */
    clicarEditar: (index: number) => {
        GruposPage.abrirMenuAcoes(index);
        GruposPage.getOpcaoEditar().click();
    },

    /** Abre o menu e clica em "Duplicar grupo" na linha indicada */
    clicarDuplicar: (index: number) => {
        GruposPage.abrirMenuAcoes(index);
        GruposPage.getOpcaoDuplicar().click();
    },

    /** Abre o menu e clica em "Excluir" na linha indicada */
    clicarExcluir: (index: number) => {
        GruposPage.abrirMenuAcoes(index);
        GruposPage.getOpcaoExcluir().click();
    },

    /** Cancela a exclusão no modal de confirmação */
    cancelarExclusao: () => {
        GruposPage.getBotaoCancelarExclusao().click();
    },

    /** Confirma a exclusão no modal de confirmação */
    confirmarExclusao: () => {
        GruposPage.getBotaoConfirmarExclusao().click();
    },

    /** Clica no botão "Cadastrar grupo" */
    clicarCadastrarGrupo: () => {
        GruposPage.getBotaoCadastrarGrupo().click();
    },

    /** Navega para a próxima página */
    irParaProximaPagina: () => {
        GruposPage.getBotaoProximaPagina().click();
    },

    /** Navega para a página anterior */
    irParaPaginaAnterior: () => {
        GruposPage.getBotaoPaginaAnterior().click();
    },
};

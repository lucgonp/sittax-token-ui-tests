/**
 * Page Object para a tela de Utilitários -> Perfis de Acesso (/roles/nova-area).
 *
 * Tela CRUD completa com 3 páginas:
 *   1. LISTAGEM  (/roles/nova-area) — busca, paginação, menu de ações
 *   2. CADASTRAR (/roles/nova-area/create) — formulário com campo "Nome do Perfil"
 *   3. EDITAR    (/roles/nova-area/:id/edit) — formulário com campo "Nome do Perfil"
 *   4. PERMISSÕES (/roles/nova-area/:id/permissions) — checkbox tree por seção
 *
 * Seletores descobertos via inspeção do DOM no ambiente de stage:
 *   - Título da página: "Perfis de Acesso"
 *   - Campo de busca: #nd-roles-search (placeholder "Digite um nome para buscar")
 *   - Botão cadastrar: a.nd-btn-primary[href*="/create"] ("Cadastrar perfil")
 *   - Tabela: colunas Nome, Permissões, Ações
 *   - Ações por linha: button.nd-actions-btn → menu com Gerenciar Permissões, Editar, Excluir
 *   - Paginação: select.nd-pagination__select
 *   - Formulário: input#role_name ("Nome do Perfil")
 *   - Permissões: seções Cadastros, Controle, Relatorios, Utilitarios, Analise
 */
export const PerfisDeAcessoPage = {

    // ══════════════════════════════════════════════
    //  LISTAGEM (/roles/nova-area)
    // ══════════════════════════════════════════════

    /** Título principal da página */
    getTitulo: () => cy.get('.nd-title-bar .h1, .nd-title-bar__title, .nd-title-bar__left [role="heading"], h1', { timeout: 15000 }),

    /** Campo de busca */
    getCampoBusca: () => cy.get('#nd-roles-search', { timeout: 15000 }),

    /** Botão "Cadastrar perfil" */
    getBotaoCadastrar: () => cy.get('a.nd-btn-primary[href*="/roles/nova-area/create"], a.nd-btn-primary:contains("Cadastrar perfil")', { timeout: 15000 }),

    /** Tabela principal */
    getTabela: () => cy.get('table.nd-table', { timeout: 15000 }).first(),

    /** Cabeçalhos da tabela */
    getCabecalhosTabela: () => cy.get('table.nd-table thead tr th', { timeout: 15000 }),

    /** Linhas da tabela */
    getLinhasTabela: () => cy.get('table.nd-table tbody tr', { timeout: 15000 }),

    /** Container de estado vazio */
    getTabelaVaziaContainer: () => cy.get('.nd-table-empty, .nd-table-container', { timeout: 15000 }),

    /** Seletor de resultados por página */
    getResultadosPorPagina: () => cy.get('select.nd-pagination__select, .nd-table-pagination select', { timeout: 15000 }),

    /** Texto do total de resultados */
    getTotalResultados: () => cy.get('.nd-pagination__total, .nd-table-pagination', { timeout: 15000 }),

    /** Botão próxima página */
    getBotaoProximaPagina: () => cy.get('button.nd-pagination__btn[aria-label="Próxima página"]', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  AÇÕES NA TABELA (MENU AÇÕES)
    // ══════════════════════════════════════════════

    /** Abre o menu "Ações" de uma linha específica */
    abrirMenuAcoesNaLinha: (rowIndex = 0) => {
        PerfisDeAcessoPage.getTabela().should('be.visible');
        PerfisDeAcessoPage.getLinhasTabela().eq(rowIndex).within(() => {
            cy.get('button.nd-actions-btn, button[data-dt-action-trigger]').should('be.visible').click({ force: true });
        });
    },

    /** Clica na opção "Editar" do menu Ações */
    clicarEditarNaLinha: (rowIndex = 0) => {
        PerfisDeAcessoPage.abrirMenuAcoesNaLinha(rowIndex);
        cy.get('body').then(($body) => {
            if ($body.find('a.nd-table-action-menu__item:contains("Editar"), a:contains("Editar")').length > 0) {
                cy.get('a.nd-table-action-menu__item:contains("Editar"), a:contains("Editar")').first().click({ force: true });
            }
        });
    },

    /** Clica na opção "Gerenciar Permissões" do menu Ações */
    clicarGerenciarPermissoesNaLinha: (rowIndex = 0) => {
        PerfisDeAcessoPage.abrirMenuAcoesNaLinha(rowIndex);
        cy.get('body').then(($body) => {
            if ($body.find('a.nd-table-action-menu__item:contains("Gerenciar Permissões"), a:contains("Gerenciar Permissões")').length > 0) {
                cy.get('a.nd-table-action-menu__item:contains("Gerenciar Permissões"), a:contains("Gerenciar Permissões")').first().click({ force: true });
            }
        });
    },

    /** Clica na opção "Excluir" do menu Ações */
    clicarExcluirNaLinha: (rowIndex = 0) => {
        PerfisDeAcessoPage.abrirMenuAcoesNaLinha(rowIndex);
        cy.get('body').then(($body) => {
            if ($body.find('button:contains("Excluir"), a:contains("Excluir")').length > 0) {
                cy.get('button:contains("Excluir"), a:contains("Excluir")').first().click({ force: true });
            }
        });
    },

    // ══════════════════════════════════════════════
    //  FORMULÁRIO (CADASTRAR / EDITAR)
    // ══════════════════════════════════════════════

    /** Campo "Nome do Perfil" */
    getCampoNomePerfil: () => cy.get('input#role_name', { timeout: 15000 }),

    /** Botão de voltar (seta) na barra de título */
    getBotaoVoltar: () => cy.get('a.nd-title-bar__back[aria-label="Voltar"], a.nd-title-bar__back', { timeout: 15000 }),

    /** Botão "Cancelar" na barra de ações (href é URL absoluta) */
    getBotaoCancelar: () => cy.get('a.nd-action-bar__cancel', { timeout: 15000 }),

    /** Botão de submit (Confirmar / Atualizar / Atualizar Permissões) */
    getBotaoSubmit: () => cy.get('button.nd-btn-primary.nd-action-bar__submit, button.nd-action-bar__submit', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  PÁGINA DE PERMISSÕES (/roles/nova-area/:id/permissions)
    // ══════════════════════════════════════════════

    /** Seções de permissões (Cadastros, Controle, Relatorios, Utilitarios, Analise) */
    getSecoesPermissoes: () => cy.get('.nd-permission-section, .nd-permissions-group, [x-data]', { timeout: 15000 }),

    /** Checkbox master de uma seção de permissão — abre a seção e marca a primeira permissão funcional */
    clicarCheckboxSecao: (nomeSecao: string) => {
        // Clica no nome da seção para expandir o accordion
        cy.contains('.nd-perm-section__name', nomeSecao).click({ force: true });
        cy.wait(500);
        // Encontra o container x-data correspondente e marca a primeira permissão dentro do body da seção
        cy.contains('.nd-perm-section__name', nomeSecao)
            .closest('[x-data]')
            .find('.nd-perm-section__body input[type="checkbox"]')
            .first()
            .check({ force: true });
    },

    // ══════════════════════════════════════════════
    //  MODAL DE CONFIRMAÇÃO DE EXCLUSÃO
    // ══════════════════════════════════════════════

    /** Modal de confirmação "Excluir perfil de acesso" */
    getModalExclusao: () => cy.get('.fly-alert, .fly-dialog', { timeout: 15000 }),

    /** Título do modal de exclusão */
    getTituloModalExclusao: () => cy.get('.fly-alert__title, .fly-alert h2', { timeout: 15000 }),

    /** Botão "Sim, excluir" no modal de confirmação */
    getBotaoConfirmarExclusao: () => cy.get('button.fly-alert__btn--confirm, button:contains("Sim, excluir")', { timeout: 15000 }),

    /** Botão "Cancelar" no modal de confirmação */
    getBotaoCancelarExclusao: () => cy.get('button.fly-alert__btn--cancel', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  MÉTODOS AUXILIARES
    // ══════════════════════════════════════════════

    /** Realiza busca por termo na listagem */
    buscarPorTermo: (termo: string) => {
        PerfisDeAcessoPage.getCampoBusca()
            .should('be.visible')
            .focus()
            .type(`{selectall}${termo}{enter}`, { force: true });
    },

    /** Limpa o campo de busca */
    limparBusca: () => {
        PerfisDeAcessoPage.getCampoBusca()
            .should('be.visible')
            .focus()
            .type('{selectall}{backspace}{enter}', { force: true });
    },
};

/**
 * Page Object para a tela de Controle de Monitoramento (/controle/monitoramentos/nova-area).
 * Encapsula os seletores e ações baseados no DOM real da aplicação Sittax Token.
 */
export const MonitoramentoPage = {

    // ══════════════════════════════════════════════
    //  SELETORES DA LISTAGEM E BARRA DE AÇÕES
    // ══════════════════════════════════════════════

    /** Título principal da página de Monitoramento */
    getTitulo: () => cy.get('.nd-title-bar .h1, .nd-title-bar__title, h1', { timeout: 15000 }),

    /** Campo de busca por usuário/termo */
    getCampoBusca: () => cy.get('#nd-monitoramentos-search', { timeout: 15000 }),

    /** Botão "Atualizar" dados da listagem */
    getBotaoAtualizar: () => cy.get('#nd-monitoramentos-refresh-btn', { timeout: 15000 }),

    /** Botão "Relatório" (Exportar Excel) */
    getBotaoExportar: () => cy.get('#nd-monitoramentos-export-btn', { timeout: 15000 }),

    /** Botão de alternar o painel de filtros */
    getBotaoFiltro: () => cy.get('#filter-toggle-nd-monitoramentos-filter, button.filter-toggle', { timeout: 15000 }),

    /** Painel deslizante de filtros */
    getPainelFiltro: () => cy.get('.filter-panel-slide, .nd-filter-panel', { timeout: 15000 }),

    /** Campo de seleção de Usuário no filtro */
    getSelectUsuarioFiltro: () => cy.get('#filter-usuario', { timeout: 15000 }),

    /** Campo de seleção de Certificado no filtro */
    getSelectCertificadoFiltro: () => cy.get('#filter-certificado', { timeout: 15000 }),

    /** Campo Data Início no filtro */
    getInputDataInicioFiltro: () => cy.get('#filter-data-inicio', { timeout: 15000 }),

    /** Campo Data Fim no filtro */
    getInputDataFimFiltro: () => cy.get('#filter-data-fim', { timeout: 15000 }),

    /** Botão "Aplicar filtros" */
    getBotaoAplicarFiltro: () => cy.get('button.nd-filter-panel-apply', { timeout: 15000 }),

    /** Botão "Limpar filtros" */
    getBotaoLimparFiltro: () => cy.get('button.nd-filter-panel-clear', { timeout: 15000 }),

    /** Botão de fechar o painel de filtro */
    getBotaoFecharFiltro: () => cy.get('button.filter-panel-close', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  SELETORES DA TABELA
    // ══════════════════════════════════════════════

    /** Tabela principal de monitoramentos */
    getTabela: () => cy.get('table.nd-table', { timeout: 15000 }).first(),

    /** Linhas da tabela de monitoramentos */
    getLinhasTabela: () => cy.get('table.nd-table tbody tr', { timeout: 15000 }),

    /** Botão de gravação ("Ver gravações") de uma linha da tabela */
    getBotaoVerGravacao: (rowIndex = 0) => cy.get('table.nd-table tbody tr', { timeout: 15000 }).eq(rowIndex).find('button.nd-btn-gravacao'),

    /** Container de tabela vazia / sem resultados */
    getTabelaVaziaContainer: () => cy.get('.nd-table-empty, .nd-table-container', { timeout: 15000 }),

    /** Paginação - contagem de resultados */
    getContadorResultados: () => cy.get('.nd-pagination__count', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  AÇÕES E MÉTODOS AUXILIARES
    // ══════════════════════════════════════════════

    /** Realiza uma pesquisa por termo no campo de busca da listagem */
    buscarPorTermo: (termo: string) => {
        MonitoramentoPage.getCampoBusca()
            .should('be.visible')
            .focus()
            .type(`{selectall}${termo}{enter}`, { force: true });
    },

    /** Clica no botão de gravação da linha indicada se existir */
    clicarVerGravacao: (rowIndex = 0) => {
        MonitoramentoPage.getTabela().should('be.visible');
        MonitoramentoPage.getBotaoVerGravacao(rowIndex).should('be.visible').click({ force: true });
    },

    /** Fecha qualquer modal/dialog/drawer aberto se existir */
    fecharModalAbertoSeExistir: () => {
        cy.get('body').then(($body) => {
            if ($body.find('.fly-alert, .fly-dialog, [role="dialog"], .modal, .nd-drawer').length > 0) {
                cy.get('body').then(($b) => {
                    if ($b.find('button.filter-panel-close').length > 0) {
                        cy.get('button.filter-panel-close').first().click({ force: true });
                    } else if ($b.find('button:contains("✕")').length > 0) {
                        cy.get('button:contains("✕")').first().click({ force: true });
                    } else if ($b.find('button:contains("Fechar")').length > 0) {
                        cy.get('button:contains("Fechar")').first().click({ force: true });
                    } else {
                        cy.get('body').type('{esc}');
                    }
                });
            }
        });
    }
};

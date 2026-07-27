/**
 * Page Object para o módulo de Relatórios.
 * Encapsula os seletores e ações de relatórios sem cy.visit().
 */
export const RelatoriosPage = {

    // ══════════════════════════════════════════════
    //  ELEMENTOS COMUNS DE RELATÓRIOS DEDICADOS
    // ══════════════════════════════════════════════

    /** Título principal do relatório (.breadcrumb-title ou .h1) */
    getTituloRelatorio: () =>
        cy.get('.breadcrumb-title, .nd-title-bar .h1, .nd-title-bar__title, h1, h4.breadcrumb-wrapper', { timeout: 15000 }),

    /** Botão Imprimir (window.print) */
    getBotaoImprimir: () =>
        cy.get('button:contains("Imprimir"), button[onclick*="print"]', { timeout: 10000 }),

    /** Botão Fechar */
    getBotaoFechar: () =>
        cy.get('button:contains("Fechar"), button[onclick*="close"]', { timeout: 10000 }),

    /** Tabelas do relatório */
    getTabelaRelatorio: () =>
        cy.get('table.table, table.nd-table', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  ELEMENTOS ESPECÍFICOS DO RELATÓRIO DE AÇÕES (/acoes/nova-area)
    // ══════════════════════════════════════════════

    /** Campo de busca no relatório de Ações */
    getCampoBuscaAcoes: () =>
        cy.get('#nd-acoes-search', { timeout: 15000 }),

    /** Filter select Ação */
    getBotaoFiltroAcao: () =>
        cy.get('.nd-table-filter button.nd-btn-select', { timeout: 15000 }),

    /** Botão de abrir painel de filtro */
    getBotaoFiltroPainel: () =>
        cy.get('#filter-toggle-nd-acoes-filter, button.filter-toggle', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  AÇÕES
    // ══════════════════════════════════════════════

    /** Realiza busca por termo na listagem de Ações */
    buscarAcoes: (termo: string) => {
        RelatoriosPage.getCampoBuscaAcoes()
            .should('be.visible')
            .focus()
            .type(`{selectall}${termo}{enter}`, { force: true });
    }
};

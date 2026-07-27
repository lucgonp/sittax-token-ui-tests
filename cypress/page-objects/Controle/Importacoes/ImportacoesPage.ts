/**
 * Page Object para a tela de Controle de Importações (/controle/importacoes).
 * Encapsula os seletores e ações baseados no DOM real da aplicação Sittax Token.
 */
export const ImportacoesPage = {

    // ══════════════════════════════════════════════
    //  SELETORES DA LISTAGEM
    // ══════════════════════════════════════════════

    /** Título principal da página de Importações */
    getTitulo: () => cy.get('.nd-title-bar .h1, .nd-title-bar__title', { timeout: 15000 }),

    /** Campo de busca da listagem de importações */
    getCampoBusca: () => cy.get('#nd-importacoes-search', { timeout: 15000 }),

    /** Botão de alternar o painel de filtros */
    getBotaoFiltro: () => cy.get('#filter-toggle-nd-importacoes-filter, button.filter-toggle', { timeout: 15000 }),

    /** Painel de filtros */
    getPainelFiltro: () => cy.get('.filter-panel-slide, .nd-filter-panel', { timeout: 15000 }),

    /** Campo Data Início no painel de filtro */
    getCampoDataInicioFiltro: () => cy.get('#filter-data-inicio, input[name*="data_inicio"]', { timeout: 15000 }),

    /** Campo Data Fim no painel de filtro */
    getCampoDataFimFiltro: () => cy.get('#filter-data-fim, input[name*="data_fim"]', { timeout: 15000 }),

    /** Botão aplicar filtros */
    getBotaoAplicarFiltro: () => cy.get('button.nd-filter-panel-apply, button:contains("Aplicar")', { timeout: 15000 }),

    /** Botão limpar filtros */
    getBotaoLimparFiltro: () => cy.get('button.nd-filter-panel-clear, button:contains("Limpar")', { timeout: 15000 }),

    /** Botão fechar painel de filtros */
    getBotaoFecharFiltro: () => cy.get('button.filter-panel-close', { timeout: 15000 }),

    /**
     * Tabela principal de importações. A tela renderiza VÁRIAS `table.nd-table`
     * (a listagem + mini-tabelas de contadores por linha), então `table.nd-table`
     * casa 11 elementos e quebra `.within()`. A listagem principal é a que tem a
     * classe modificadora `--importacoes`.
     */
    getTabelaImportacoes: () => cy.get('table.nd-table--importacoes', { timeout: 15000 }).first(),

    /** Botão Ações de uma linha da tabela */
    getBotaoAcoes: (index = 0) => cy.get('table.nd-table [data-dt-action-trigger], table.nd-table button.nd-actions-btn', { timeout: 15000 }).eq(index),

    /** Paginação - contagem de resultados */
    getContadorResultados: () => cy.get('.nd-pagination__count', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  SELETORES DE MODAL
    // ══════════════════════════════════════════════

    /**
     * Container do modal de confirmação de exclusão. O seletor genérico
     * `.fly-alert, .fly-dialog` casa 2 elementos (o dialog externo + o alert interno)
     * e quebra `.within()`. O container único é o dialog ATIVO (`.fly-dialog--active`).
     */
    getModalExclusao: () => cy.get('.fly-dialog--active', { timeout: 15000 }),

    /** Botão "Sim, excluir" / Confirmar exclusão */
    getBotaoConfirmarExclusao: () => cy.get('button.fly-alert__btn--confirm, button:contains("Sim, excluir"), button:contains("Excluir")', { timeout: 15000 }),

    /** Botão "Cancelar" no modal de exclusão */
    getBotaoCancelarExclusao: () => cy.get('button.fly-alert__btn--cancel, button:contains("Cancelar")', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  AÇÕES E MÉTODOS AUXILIARES
    // ══════════════════════════════════════════════

    /** Abre o menu Ações da linha indicada */
    abrirMenuAcoes: (rowIndex = 0) => {
        cy.get('table.nd-table', { timeout: 15000 }).should('be.visible');
        ImportacoesPage.fecharModalAbertoSeExistir();
        ImportacoesPage.getBotaoAcoes(rowIndex).should('be.visible').click({ force: true });
    },

    /** Clica em um item do menu Ações visível pelo texto no menu aberto */
    clicarAcaoPorTexto: (texto: string) => {
        cy.get('.nd-table-action-menu:visible, [data-dt-action-panel]:visible, [role="menu"]:visible', { timeout: 15000 })
            .find('button, a')
            .filter(':visible')
            .contains(texto)
            .click({ force: true });
    },

    /** Pesquisa uma importação por um termo no campo de busca da listagem */
    buscarImportacaoPorTermo: (termo: string) => {
        ImportacoesPage.getCampoBusca()
            .should('be.visible')
            .focus()
            .type(`{selectall}${termo}{enter}`, { force: true });
    },

    /** Fecha qualquer modal/dialog/drawer aberto na tela se existir */
    fecharModalAbertoSeExistir: () => {
        cy.get('body').then(($body) => {
            if ($body.find('.fly-alert, .fly-dialog, [role="dialog"], .modal, .nd-drawer').length > 0) {
                cy.get('body').then(($b) => {
                    if ($b.find('button.fly-alert__btn--cancel').length > 0) {
                        cy.get('button.fly-alert__btn--cancel').first().click({ force: true });
                    } else if ($b.find('button:contains("✕")').length > 0) {
                        cy.get('button:contains("✕")').first().click({ force: true });
                    } else if ($b.find('button:contains("Fechar")').length > 0) {
                        cy.get('button:contains("Fechar")').first().click({ force: true });
                    } else if ($b.find('button:contains("Cancelar")').length > 0) {
                        cy.get('button:contains("Cancelar")').first().click({ force: true });
                    } else {
                        cy.get('body').type('{esc}');
                    }
                });
            }
        });
    }
};

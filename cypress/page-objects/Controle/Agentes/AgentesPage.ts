/**
 * Page Object para a tela de Controle de Agentes (/usuarios/agentes/nova-area).
 * Encapsula os seletores e ações baseados no DOM real da aplicação Sittax Token.
 */
export const AgentesPage = {

    // ══════════════════════════════════════════════
    //  SELETORES
    // ══════════════════════════════════════════════

    /** Título principal da página de Agentes */
    getTitulo: () => cy.get('.nd-title-bar .h1', { timeout: 15000 }),

    /** Botão "Cadastrar agente" na barra de ações superior */
    getBotaoCadastrarAgente: () => cy.get('a[href*="/usuarios/agentes/create"], a.nd-action-bar__create', { timeout: 15000 }),

    /** Campo de busca por nome ou e-mail do agente */
    getCampoBusca: () => cy.get('#nd-agentes-search', { timeout: 15000 }),

    /** Botão de alternar o painel de filtros */
    getBotaoFiltro: () => cy.get('#filter-toggle-nd-agentes-filter, button.nd-action-bar__filter', { timeout: 15000 }),

    /** Painel de filtros */
    getPainelFiltro: () => cy.get('.nd-filter-panel, #nd-agentes-filter, [data-dt-filter-panel]', { timeout: 15000 }),

    /** Select de status no painel de filtros */
    getSelectStatusFiltro: () => cy.get('#filter-status, select[name*="status"]', { timeout: 15000 }),

    /** Botão aplicar filtros */
    getBotaoAplicarFiltro: () => cy.get('button.nd-filter-panel-apply, button:contains("Aplicar")', { timeout: 15000 }),

    /** Botão limpar filtros */
    getBotaoLimparFiltro: () => cy.get('button.nd-filter-panel-clear, button:contains("Limpar")', { timeout: 15000 }),

    /** Botão fechar painel de filtros */
    getBotaoFecharFiltro: () => cy.get('button.filter-panel-close', { timeout: 15000 }),

    /** Botão de exportação "Relatório" */
    getBotaoExportar: () => cy.get('#nd-agentes-export-btn', { timeout: 15000 }),

    /** Tabela principal de agentes */
    getTabelaAgentes: () => cy.get('table.nd-table', { timeout: 15000 }),

    /** Botão Ações de uma linha da tabela */
    getBotaoAcoes: (index = 0) => cy.get('table.nd-table [data-dt-action-trigger]', { timeout: 15000 }).eq(index),

    // ══════════════════════════════════════════════
    //  AÇÕES E MÉTODOS AUXILIARES
    // ══════════════════════════════════════════════

    /** Abre o menu Ações da linha indicada */
    abrirMenuAcoes: (rowIndex = 0) => {
        cy.get('table.nd-table', { timeout: 15000 }).should('be.visible');
        AgentesPage.fecharModalAbertoSeExistir();
        AgentesPage.getBotaoAcoes(rowIndex).should('be.visible').click({ force: true });
    },

    /** Clica em um item do menu Ações visível pelo texto no menu aberto */
    clicarAcaoPorTexto: (texto: string) => {
        cy.get('.nd-table-action-menu:visible, [data-dt-action-panel]:visible, [role="menu"]:visible', { timeout: 15000 })
            .find('button, a')
            .filter(':visible')
            .contains(texto)
            .click({ force: true });
    },

    /** Fecha modal ou drawer aberto na tela se existir */
    fecharModalAbertoSeExistir: () => {
        cy.get('body').then(($body) => {
            if ($body.find('.fly-dialog, [role="dialog"], .modal, .nd-drawer').length > 0) {
                cy.get('body').then(($b) => {
                    if ($b.find('button.nd-group-view__close').length > 0) {
                        cy.get('button.nd-group-view__close').first().click({ force: true });
                    } else if ($b.find('button.nd-cert-view__close').length > 0) {
                        cy.get('button.nd-cert-view__close').first().click({ force: true });
                    } else if ($b.find('button.nd-proc-view__close').length > 0) {
                        cy.get('button.nd-proc-view__close').first().click({ force: true });
                    } else if ($b.find('button.nd-agent-password__close').length > 0) {
                        cy.get('button.nd-agent-password__close').first().click({ force: true });
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

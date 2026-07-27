/**
 * Page Object para a tela de Dashboard do Sittax Token.
 * Encapsula os seletores e ações baseados na estrutura HTML real do Dashboard.
 */
export const DashboardPage = {

    // ══════════════════════════════════════════════
    //  SELETORES COM CLASSES E IDS ESPECÍFICOS DO DOM
    // ══════════════════════════════════════════════

    /** Título principal do Dashboard */
    getTitulo: () => cy.get('.nd-title-bar .h1', { timeout: 15000 }),

    /** Grid de estatísticas (.nd-stats-grid) */
    getStatsGrid: () => cy.get('.nd-stats-grid', { timeout: 15000 }),

    /** Campo de busca da tabela de certificados */
    getCampoBuscaCertificados: () => cy.get('#nd-cert-search', { timeout: 15000 }),

    /** Tabela de certificados */
    getTabelaCertificados: () => cy.get('table.nd-table', { timeout: 15000 }),

    /** Botão do filtro de vencimento (abre o painel Todos/30/60/Vencidos) */
    getBotaoFiltroVencimento: () => cy.get('.nd-table-filter .nd-btn-select', { timeout: 15000 }),

    /** Rótulo atual do filtro de vencimento */
    getLabelFiltroVencimento: () => cy.get('#nd-cert-venc-label', { timeout: 15000 }),

    /** Botão de Ações de uma linha da tabela de certificados */
    getBotaoAcoes: (index = 0) => cy.get('table.nd-table [data-dt-action-trigger]', { timeout: 15000 }).eq(index),

    /** Painel/Menu de ações aberto */
    getMenuAcoes: () => cy.get('.nd-table-action-menu, [data-dt-action-panel]', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  AÇÕES E VALIDAÇÕES
    // ══════════════════════════════════════════════

    /** Fecha o modal de novidades caso ele apareça após o login */
    fecharModalNovidadesSeExistir: () => {
        cy.get('body', { timeout: 10000 }).then(($body) => {
            if ($body.text().includes('Novidade!')) {
                cy.get('body').contains('button', '✕').click({ force: true });
            }
        });
    },

    /** Fecha qualquer modal/dialog/drawer aberto na tela */
    fecharModalAbertoSeExistir: () => {
        cy.get('body').then(($body) => {
            if ($body.find('.fly-dialog, [role="dialog"], .modal, .nd-drawer').length > 0) {
                cy.get('body').then(($b) => {
                    if ($b.find('button:contains("✕")').length > 0) {
                        cy.get('button:contains("✕")').each(($el) => {
                            cy.wrap($el).click({ force: true });
                        });
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
    },

    /** Clica no botão Ações da linha indicada */
    abrirMenuAcoes: (rowIndex = 0) => {
        cy.get('table.nd-table', { timeout: 15000 }).should('be.visible');
        DashboardPage.getBotaoAcoes(rowIndex).should('be.visible').click({ force: true });
    },

    /** Clica em uma das opções do menu Ações (show, procuracoes, acessos, share, sharePartner, edit, delete) */
    clicarAcaoPorKey: (actionKey: string) => {
        // O menu é clonado para o body ao abrir; escopa no menu aberto (.nd-pop--open)
        // e usa .last() caso clones antigos tenham ficado no DOM entre tentativas.
        cy.get('.nd-table-action-menu.nd-pop--open', { timeout: 15000 })
            .last()
            .find(`[data-dt-action-key="${actionKey}"]`)
            .click({ force: true });
    },

    /** Valida os 3 cards estatísticos principais dentro do container .nd-stats-grid */
    validarCardsPrincipais: () => {
        cy.get('.nd-stats-grid').within(() => {
            cy.contains('.nd-stats-card__label', 'Certificados').should('be.visible');
            cy.contains('.nd-stats-card__label', 'Procurações').should('be.visible');
            cy.contains('.nd-stats-card__label', 'Agentes').should('be.visible');
        });
    }
};

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

    /** Botão de Ações da primeira linha de certificados */
    getBotaoAcoes: () => cy.get('[data-dt-action-trigger]', { timeout: 15000 }).first(),

    /** Menu de ações aberto (renderizado no body via position:fixed) */
    getMenuAcoes: () => cy.get('.nd-table-action-menu.nd-pop--open', { timeout: 15000 }),

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

    /** Valida os 3 cards estatísticos principais dentro do container .nd-stats-grid */
    validarCardsPrincipais: () => {
        cy.get('.nd-stats-grid').within(() => {
            cy.contains('.nd-stats-card__label', 'Certificados').should('be.visible');
            cy.contains('.nd-stats-card__label', 'Procurações').should('be.visible');
            cy.contains('.nd-stats-card__label', 'Agentes').should('be.visible');
        });
    }
};

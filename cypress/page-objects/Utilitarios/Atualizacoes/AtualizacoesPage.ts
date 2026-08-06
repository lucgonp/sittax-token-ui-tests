/**
 * Page Object para a tela de Utilitários -> Atualizações (/cadastros/novidades/nova-area).
 *
 * Tela somente-leitura: lista novidades do sistema com busca e visualização de detalhes.
 * Não possui operações de criação, edição ou exclusão via interface.
 *
 * Estrutura descoberta via inspeção do tráfego e DOM do ambiente de stage:
 *   - Título da página: "Atualizações"
 *   - Campo de busca: #nd-novidades-search (placeholder "Buscar por título")
 *   - Tabela: colunas Título, Descrição, Tipo, Versão, Ambiente, Ações
 *   - Ação disponível na tabela: "Visualizar" → /cadastros/novidades/nova-area/:id
 *   - Tela de detalhe: título "Visualizar novidade", campos informativos (read-only)
 */
export const AtualizacoesPage = {

    // ══════════════════════════════════════════════
    //  LISTAGEM DE ATUALIZAÇÕES (/cadastros/novidades/nova-area)
    // ══════════════════════════════════════════════

    /** Título principal da página de Atualizações */
    getTitulo: () => cy.get('.nd-title-bar .h1, .nd-title-bar__title, .nd-title-bar__left [role="heading"], h1', { timeout: 15000 }),

    /** Campo de busca por título */
    getCampoBusca: () => cy.get('#nd-novidades-search', { timeout: 15000 }),

    /** Tabela principal de novidades */
    getTabela: () => cy.get('table.nd-table', { timeout: 15000 }).first(),

    /** Linhas da tabela de novidades */
    getLinhasTabela: () => cy.get('table.nd-table tbody tr', { timeout: 15000 }),

    /** Container de tabela vazia / sem resultados */
    getTabelaVaziaContainer: () => cy.get('.nd-table-empty, .nd-table-container', { timeout: 15000 }),

    /** Seletor de resultados por página */
    getResultadosPorPagina: () => cy.get('select.nd-pagination__select, .nd-table-pagination select', { timeout: 15000 }),

    /** Texto do total de resultados */
    getTotalResultados: () => cy.get('.nd-pagination__total, .nd-table-pagination', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  AÇÕES NA TABELA (MENU AÇÕES)
    // ══════════════════════════════════════════════

    /** Abre o menu "Ações" de uma linha específica */
    abrirMenuAcoesNaLinha: (rowIndex = 0) => {
        AtualizacoesPage.getTabela().should('be.visible');
        AtualizacoesPage.getLinhasTabela().eq(rowIndex).within(() => {
            cy.get('button.nd-actions-btn, button[data-dt-action-trigger]').should('be.visible').click({ force: true });
        });
    },

    /** Clica na opção "Visualizar" do menu Ações */
    clicarVisualizarNaLinha: (rowIndex = 0) => {
        AtualizacoesPage.abrirMenuAcoesNaLinha(rowIndex);
        cy.get('body').then(($body) => {
            if ($body.find('a.nd-table-action-menu__item, a[data-dt-action-key="view"], a:contains("Visualizar")').length > 0) {
                cy.get('a.nd-table-action-menu__item, a[data-dt-action-key="view"], a:contains("Visualizar")').first().click({ force: true });
            }
        });
    },

    // ══════════════════════════════════════════════
    //  TELA DE DETALHE (/cadastros/novidades/nova-area/:id)
    // ══════════════════════════════════════════════

    /** Título da página de detalhe */
    getTituloDetalhe: () => cy.get('.nd-title-bar .h1, .nd-title-bar__title, .nd-title-bar__left [role="heading"], h1', { timeout: 15000 }),

    /** Botão de voltar (seta) na barra de título do detalhe */
    getBotaoVoltar: () => cy.get('a.nd-title-bar__back[aria-label="Voltar"], a.nd-title-bar__back', { timeout: 15000 }),

    /** Container das informações gerais do detalhe */
    getSecaoInformacoesGerais: () => cy.get('.nd-form-section, .nd-detail-section, form, .nd-page', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  MÉTODOS AUXILIARES
    // ══════════════════════════════════════════════

    /** Realiza busca por termo na listagem */
    buscarPorTermo: (termo: string) => {
        AtualizacoesPage.getCampoBusca()
            .should('be.visible')
            .focus()
            .type(`{selectall}${termo}{enter}`, { force: true });
    },

    /** Limpa o campo de busca */
    limparBusca: () => {
        AtualizacoesPage.getCampoBusca()
            .should('be.visible')
            .focus()
            .type('{selectall}{backspace}', { force: true });
    },
};

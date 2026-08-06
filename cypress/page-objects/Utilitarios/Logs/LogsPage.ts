/**
 * Page Object para a tela de Utilitários -> Logs (/logs/nova-area).
 *
 * Tela somente-leitura de auditoria: lista eventos do sistema com busca,
 * ordenação e expansão inline para ver detalhes (diff Original vs Atualizado).
 *
 * Não possui operações de criação, edição ou exclusão.
 * Não possui tela de detalhe separada — os detalhes expandem na própria linha.
 * Não possui paginação tradicional — carrega via scroll/ajax.
 *
 * Estrutura descoberta via inspeção do DOM no ambiente de stage:
 *   - Título da página: "Logs"
 *   - Campo de busca: #nd-logs-search (placeholder "Digite um termo para buscar")
 *   - Botão de ordenação: button.nd-btn-select ("Ordenado por: Data de criação")
 *   - Tabela: colunas Data, Usuário, Tipo de Log
 *   - Expand inline: botão nd-log-expand-btn (chevron ∨) em cada linha
 *   - Expand mostra diff: tabela com colunas "Original" e "Atualizado"
 *
 * BUG CONHECIDO (stage, 06/08/2026): a busca e a ordenação falham com
 * "Não foi possível carregar os dados. Tente novamente." — possivelmente
 * o POST /logs/nova-area/search retorna erro 500 ao filtrar/ordenar.
 * Os testes documentam esse comportamento como "bug da aplicação".
 */
export const LogsPage = {

    // ══════════════════════════════════════════════
    //  LISTAGEM DE LOGS (/logs/nova-area)
    // ══════════════════════════════════════════════

    /** Título principal da página de Logs */
    getTitulo: () => cy.get('.nd-title-bar .h1, .nd-title-bar__title, .nd-title-bar__left [role="heading"], h1', { timeout: 15000 }),

    /** Campo de busca */
    getCampoBusca: () => cy.get('#nd-logs-search', { timeout: 15000 }),

    /** Botão de ordenação ("Ordenado por: ...") */
    getBotaoOrdenacao: () => cy.get('.nd-table-filter button.nd-btn-select, button.nd-btn-select', { timeout: 15000 }),

    /** Painel de opções de ordenação (abre ao clicar no botão) */
    getPainelOrdenacao: () => cy.get('.nd-table-filter__panel', { timeout: 15000 }),

    /** Itens individuais do painel de ordenação */
    getItemOrdenacao: (texto: string) => cy.get('.nd-table-filter__item').contains(texto),

    /** Tabela principal de logs */
    getTabela: () => cy.get('table.nd-table', { timeout: 15000 }).first(),

    /** Cabeçalhos da tabela */
    getCabecalhosTabela: () => cy.get('table.nd-table thead tr th', { timeout: 15000 }),

    /** Linhas da tabela de logs */
    getLinhasTabela: () => cy.get('table.nd-table tbody tr', { timeout: 15000 }),

    /** Container de estado vazio / erro */
    getEstadoVazioOuErro: () => cy.get('.nd-table-empty, .nd-table-container', { timeout: 15000 }),

    /** Mensagem de erro de carregamento */
    getMensagemErro: () => cy.get('.nd-table-empty, .nd-table-error, .nd-table-container', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  EXPAND INLINE (DETALHES DO LOG)
    // ══════════════════════════════════════════════

    /** Botão de expandir detalhes de uma linha (chevron ∨) */
    getBotaoExpandirNaLinha: (rowIndex = 0) => {
        return LogsPage.getLinhasTabela().eq(rowIndex).find('button.nd-log-expand-btn, td:last-child button, td:last-child svg');
    },

    /** Clica no botão de expandir para ver detalhes inline */
    expandirLinha: (rowIndex = 0) => {
        LogsPage.getTabela().should('be.visible');
        LogsPage.getLinhasTabela().eq(rowIndex).within(() => {
            cy.get('button.nd-log-expand-btn, td:last-child button').first().click({ force: true });
        });
    },

    /** Verifica se os detalhes inline (diff) estão visíveis após expandir */
    getDetalhesExpandidos: () => cy.get('.nd-log-detail, .nd-log-expand, tr.nd-table-expand-row, [x-show]', { timeout: 10000 }),

    // ══════════════════════════════════════════════
    //  MÉTODOS AUXILIARES
    // ══════════════════════════════════════════════

    /** Realiza busca por termo na listagem */
    buscarPorTermo: (termo: string) => {
        LogsPage.getCampoBusca()
            .should('be.visible')
            .focus()
            .type(`{selectall}${termo}{enter}`, { force: true });
    },

    /** Limpa o campo de busca */
    limparBusca: () => {
        LogsPage.getCampoBusca()
            .should('be.visible')
            .focus()
            .type('{selectall}{backspace}', { force: true });
    },

    /** Altera a ordenação clicando no botão e selecionando uma opção */
    ordenarPor: (opcao: string) => {
        LogsPage.getBotaoOrdenacao().click({ force: true });
        LogsPage.getPainelOrdenacao().should('be.visible');
        LogsPage.getItemOrdenacao(opcao).click({ force: true });
    },
};

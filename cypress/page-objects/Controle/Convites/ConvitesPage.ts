/**
 * Page Object para a tela de Controle de Convites (/controle/convites).
 * Encapsula os seletores e ações baseados no DOM real da aplicação Sittax Token.
 */
export const ConvitesPage = {

    // ══════════════════════════════════════════════
    //  SELETORES DA LISTAGEM
    // ══════════════════════════════════════════════

    /** Título principal da página de Convites */
    getTitulo: () => cy.get('.nd-title-bar .h1, .nd-title-bar__title, h1', { timeout: 15000 }),

    /** Botão "Cadastrar convite" / "Novo convite" na barra de ações superior */
    getBotaoCadastrarConvite: () => cy.get('a[href*="/controle/convites/create"], a[href*="/convites/create"], a.nd-btn-primary, button:contains("Convidar")', { timeout: 15000 }),

    /** Campo de busca por nome, CPF/CNPJ ou e-mail */
    getCampoBusca: () => cy.get('#nd-convites-search, #search-input, input[placeholder*="Buscar"], input[type="search"]', { timeout: 15000 }),

    /** Botão de alternar o painel de filtros */
    getBotaoFiltro: () => cy.get('#filter-toggle-nd-convites-filter, button.nd-action-bar__filter, button.filter-toggle', { timeout: 15000 }),

    /** Painel de filtros de convites */
    getPainelFiltro: () => cy.get('.filter-panel-slide, .nd-filter-panel', { timeout: 15000 }),

    /** Botão de exportação "Relatório" / "Exportar" */
    getBotaoExportar: () => cy.get('#nd-convites-export-btn, button:contains("Relatório"), a:contains("Exportar"), button:contains("Exportar")', { timeout: 15000 }),

    /** Tabela principal de convites */
    getTabelaConvites: () => cy.get('table.nd-table, table.nd-table--convites', { timeout: 15000 }).first(),

    /** Botão Ações de uma linha da tabela */
    getBotaoAcoes: (index = 0) => cy.get('table.nd-table [data-dt-action-trigger], table.nd-table button.nd-actions-btn', { timeout: 15000 }).eq(index),

    /** Paginação - contagem de resultados */
    getContadorResultados: () => cy.get('.nd-pagination__count', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  SELETORES DO FORMULÁRIO DE CADASTRO / EDIÇÃO
    // ══════════════════════════════════════════════

    /** Campo CPF / CNPJ */
    getCampoCpfCnpj: () => cy.get('#cpf_cnpj, #cpf, #cnpj, input[name="cpf_cnpj"], input[name="cnpj"], input[placeholder*="CPF"], input[placeholder*="CNPJ"]', { timeout: 15000 }),

    /** Botão/ícone de busca de documento (lupa dentro do campo de CPF/CNPJ) */
    getBotaoBuscarDocumento: () => cy.get('button.nd-search-doc-btn, .input-group-append button, button[title*="Buscar"]', { timeout: 15000 }),

    /** Campo Nome / Razão Social */
    getCampoNome: () => cy.get('#nome, #razao_social, input[name="nome"], input[name="razao_social"]', { timeout: 15000 }),

    /** Campo E-mail */
    getCampoEmail: () => cy.get('#email, input[name="email"]', { timeout: 15000 }),

    /** Botão "Confirmar" / Submit do formulário */
    getBotaoConfirmar: () => cy.get('button.nd-action-bar__submit, button[type="submit"], button:contains("Confirmar"), button:contains("Salvar")', { timeout: 15000 }),

    /** Link / Botão "Cancelar" no formulário */
    getBotaoCancelar: () => cy.get('a.nd-action-bar__cancel, button:contains("Cancelar"), a:contains("Cancelar")', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  SELETORES DO MODAL DE EXCLUSÃO / CANCELAMENTO
    // ══════════════════════════════════════════════

    /** Container do modal de confirmação de exclusão / cancelamento */
    getModalExclusao: () => cy.get('.fly-dialog--active, .fly-alert, .fly-cnpj-confirm', { timeout: 15000 }),

    /** Botão "Confirmar Exclusão / Cancelar Convite" */
    getBotaoConfirmarExclusao: () => cy.get('button.fly-alert__btn--confirm, button:contains("Sim, excluir"), button:contains("Excluir"), button:contains("Cancelar convite")', { timeout: 15000 }),

    /** Botão "Cancelar" no modal */
    getBotaoCancelarExclusao: () => cy.get('button.fly-alert__btn--cancel, button:contains("Cancelar")', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  AÇÕES E MÉTODOS AUXILIARES
    // ══════════════════════════════════════════════

    /** Abre o menu Ações da linha indicada */
    abrirMenuAcoes: (rowIndex = 0) => {
        cy.get('table.nd-table', { timeout: 15000 }).should('be.visible');
        ConvitesPage.fecharModalAbertoSeExistir();
        ConvitesPage.getBotaoAcoes(rowIndex).should('be.visible').click({ force: true });
    },

    /** Clica em um item do menu Ações visível pelo texto */
    clicarAcaoPorTexto: (texto: string) => {
        cy.get('.nd-table-action-menu:visible, [data-dt-action-panel]:visible, [role="menu"]:visible', { timeout: 15000 })
            .find('button, a')
            .filter(':visible')
            .contains(texto)
            .click({ force: true });
    },

    /** Pesquisa um convite por um termo no campo de busca da listagem */
    buscarConvitePorTermo: (termo: string) => {
        ConvitesPage.getCampoBusca()
            .should('be.visible')
            .focus()
            .type(`{selectall}${termo}{enter}`, { force: true });
    },

    /** Preenche o formulário de cadastro de convite */
    preencherFormularioConvite: (dados: { cpfCnpj: string; nome: string; email: string }) => {
        if (dados.cpfCnpj) {
            ConvitesPage.getCampoCpfCnpj().should('be.visible').clear().type(dados.cpfCnpj);
        }
        if (dados.nome) {
            ConvitesPage.getCampoNome().should('be.visible').clear().type(dados.nome);
        }
        if (dados.email) {
            ConvitesPage.getCampoEmail().should('be.visible').clear().type(dados.email);
        }
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

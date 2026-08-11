/**
 * Page Object para a tela de Cadastros -> Representantes (/cadastros/representantes).
 *
 * Estrutura real do DOM (confirmada por screenshot):
 *   - Título: texto "Representantes" (sem tag h1/h2, sem classe nd-title-bar)
 *   - Breadcrumb: "Cadastros / Representantes"
 *   - Tabela: <table> SEM classe "table" nem "nd-table"
 *   - Colunas: checkbox, CNPJ, Razão Social, Fantasia, Contato, E-mail, Telefone, [ícones]
 *   - Ações inline: ícones lápis (editar) e lixeira (excluir) por linha
 *   - Busca: input com placeholder "Pesquisar"
 *   - Botão "+ Representantes" (verde, canto superior direito)
 */
export const RepresentantesPage = {

    // ══════════════════════════════════════════════
    //  LISTAGEM
    // ══════════════════════════════════════════════

    /** Título "Representantes" da página — busca por texto contendo "Representantes" */
    getTitulo: () => cy.contains('Representantes', { timeout: 15000 }),

    /** Campo de busca ("Pesquisar") */
    getCampoBusca: () => cy.get('input[placeholder*="Pesquisar"], input[type="search"], input[id*="filter"]', { timeout: 15000 }).first(),

    /** Botão "+ Representantes" */
    getBotaoCadastrar: () => cy.contains('button, a', '+ Representantes', { timeout: 15000 }),

    /** Tabela principal de representantes (qualquer table na página) */
    getTabela: () => cy.get('table', { timeout: 15000 }).first(),

    /** Linhas da tabela com dados */
    getLinhasTabela: () => cy.get('table tbody tr', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  AÇÕES NA TABELA (ícones inline por linha)
    // ══════════════════════════════════════════════

    /**
     * Clica no ícone de "Editar" (lápis) de uma linha.
     * Os ícones são links <a> na última célula da linha.
     * O primeiro ícone/link é normalmente "editar".
     */
    clicarEditarNaLinha: (rowIndex = 0) => {
        RepresentantesPage.getTabela().should('be.visible');
        RepresentantesPage.getLinhasTabela().eq(rowIndex).within(() => {
            // Clica no primeiro ícone/link de ação (editar = lápis azul)
            cy.get('a[href*="edit"], a.btn-table, a i.fa-edit, a i.fa-pencil, a i.bi-pencil, a svg, a[title*="Editar"], a[title*="editar"]', { timeout: 10000 })
                .first()
                .click({ force: true });
        });
    },

    /**
     * Clica no ícone de "Excluir" (lixeira) de uma linha.
     */
    clicarExcluirNaLinha: (rowIndex = 0) => {
        RepresentantesPage.getTabela().should('be.visible');
        RepresentantesPage.getLinhasTabela().eq(rowIndex).within(() => {
            cy.get('a[href*="delete"], a.btn-table-danger, a i.fa-trash, a i.bi-trash, a[title*="Excluir"], a[title*="excluir"]', { timeout: 10000 })
                .first()
                .click({ force: true });
        });
    },

    // ══════════════════════════════════════════════
    //  FORMULÁRIO DE EDIÇÃO (modal ou página)
    //  Seletores genéricos — o modal pode ser #modalEditar ou qualquer .modal
    // ══════════════════════════════════════════════

    /** Aguarda o formulário de edição ficar visível (modal ou página) */
    aguardarFormularioAberto: () => {
        cy.get('.modal.show, .modal.fade.show, form', { timeout: 15000 }).first().should('be.visible');
    },

    /** Campo Razão Social */
    getCampoRazaoSocial: () => cy.get('input[name="razao_social"], #razao_social', { timeout: 15000 }).first(),

    /** Campo Nome Fantasia */
    getCampoFantasia: () => cy.get('input[name="fantasia"], #fantasia', { timeout: 15000 }).first(),

    /** Campo Nome do Contato */
    getCampoContato: () => cy.get('input[name="contato"], #contato', { timeout: 15000 }).first(),

    /** Campo Telefone */
    getCampoTelefone: () => cy.get('input[name="telefone"], #telefone', { timeout: 15000 }).first(),

    /** Campo E-mail */
    getCampoEmail: () => cy.get('input[name="email"], #email', { timeout: 15000 }).first(),

    /** Campo CNPJ */
    getCampoCNPJ: () => cy.get('input[name="cnpj"], #cnpj', { timeout: 15000 }).first(),

    /** Campo Senha (presente apenas no cadastro) */
    getCampoSenha: () => cy.get('input[name="senha"], #senha, input[type="password"]', { timeout: 5000 }),

    /** Botão Salvar / Atualizar no formulário */
    getBotaoSalvar: () => cy.get('.modal.show button[type="submit"], .modal.show button.button-send, .modal.show button:contains("Salvar"), .modal.show button:contains("Atualizar"), form button[type="submit"]', { timeout: 15000 }).first(),

    /** Botão Fechar / Cancelar modal */
    getBotaoFechar: () => cy.get('.modal.show .btn-close, .modal.show [data-bs-dismiss="modal"], .modal.show .close, .modal.show button:contains("Cancelar")', { timeout: 15000 }).first(),

    // ══════════════════════════════════════════════
    //  MÉTODOS AUXILIARES E ASSERÇÕES
    // ══════════════════════════════════════════════

    /** Valida que o campo senha NÃO existe no formulário de edição */
    validarCampoSenhaAusenteNaEdicao: () => {
        cy.get('.modal.show, form').first().within(() => {
            cy.get('input[name="senha"], #senha, input[type="password"]').should('not.exist');
        });
    },

    /** Preenche campos do formulário de edição */
    preencherFormularioEdicao: (dados: {
        razaoSocial?: string;
        fantasia?: string;
        contato?: string;
        telefone?: string;
        email?: string;
    }) => {
        if (dados.razaoSocial !== undefined) {
            RepresentantesPage.getCampoRazaoSocial().should('be.visible').clear().type(dados.razaoSocial);
        }
        if (dados.fantasia !== undefined) {
            RepresentantesPage.getCampoFantasia().should('be.visible').clear().type(dados.fantasia);
        }
        if (dados.contato !== undefined) {
            RepresentantesPage.getCampoContato().should('be.visible').clear().type(dados.contato);
        }
        if (dados.telefone !== undefined) {
            RepresentantesPage.getCampoTelefone().should('be.visible').clear().type(dados.telefone);
        }
        if (dados.email !== undefined) {
            RepresentantesPage.getCampoEmail().should('be.visible').clear().type(dados.email);
        }
    },

    /** Submete o formulário clicando em Salvar/Atualizar */
    submeterFormulario: () => {
        RepresentantesPage.getBotaoSalvar().should('be.visible').click({ force: true });
    },

    /** Fecha o modal aberto */
    fecharModal: () => {
        RepresentantesPage.getBotaoFechar().click({ force: true });
        cy.get('.modal.show').should('not.exist');
    },
};

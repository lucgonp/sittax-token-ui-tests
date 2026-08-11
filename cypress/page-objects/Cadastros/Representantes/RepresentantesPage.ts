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

    /** Título "Representantes" da página */
    getTitulo: () => cy.get('p.titlePage, .titlePage', { timeout: 15000 }),

    /** Campo de busca ("Pesquisar") */
    getCampoBusca: () => cy.get('#filter_razao_social', { timeout: 15000 }),

    /** Botão "+ Representantes" */
    getBotaoCadastrar: () => cy.get('.button a[onclick*="create"]', { timeout: 15000 }),

    /** Tabela principal de representantes */
    getTabela: () => cy.get('table', { timeout: 15000 }).first(),

    /** Linhas da tabela com dados */
    getLinhasTabela: () => cy.get('table tbody tr', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  AÇÕES NA TABELA (ícones inline por linha)
    // ══════════════════════════════════════════════

    /**
     * Clica no ícone de "Editar" (lápis) de uma linha.
     */
    clicarEditarNaLinha: (rowIndex = 0) => {
        RepresentantesPage.getTabela().should('be.visible');
        RepresentantesPage.getLinhasTabela().eq(rowIndex).within(() => {
            cy.get('.actions-buttons a', { timeout: 10000 }).eq(0).click({ force: true });
        });
    },

    /**
     * Clica no ícone de "Excluir" (lixeira) de uma linha.
     */
    clicarExcluirNaLinha: (rowIndex = 0) => {
        RepresentantesPage.getTabela().should('be.visible');
        RepresentantesPage.getLinhasTabela().eq(rowIndex).within(() => {
            cy.get('.actions-buttons a', { timeout: 10000 }).eq(1).click({ force: true });
        });
    },

    // ══════════════════════════════════════════════
    //  FORMULÁRIO DE EDIÇÃO (modal ou página)
    //  Seletores genéricos — o modal pode ser #modalEditar ou qualquer .modal
    // ══════════════════════════════════════════════

    /** Aguarda o formulário de edição ficar visível (modal) */
    aguardarFormularioAberto: () => {
        cy.get('#modalBasic', { timeout: 15000 }).should('be.visible');
    },

    /** Campo Razão Social */
    getCampoRazaoSocial: () => cy.get('#modalBasic #razao_social', { timeout: 15000 }),

    /** Campo Nome Fantasia */
    getCampoFantasia: () => cy.get('#modalBasic #fantasia', { timeout: 15000 }),

    /** Campo Nome do Contato */
    getCampoContato: () => cy.get('#modalBasic #contato', { timeout: 15000 }),

    /** Campo Telefone */
    getCampoTelefone: () => cy.get('#modalBasic #telefone', { timeout: 15000 }),

    /** Campo E-mail */
    getCampoEmail: () => cy.get('#modalBasic #email', { timeout: 15000 }),

    /** Campo CNPJ */
    getCampoCNPJ: () => cy.get('#modalBasic input[name="cnpj"]', { timeout: 15000 }),

    /** Campo Senha (presente apenas no cadastro) */
    getCampoSenha: () => cy.get('#modalBasic input[name="senha"], #modalBasic #senha', { timeout: 5000 }),

    /** Botão Salvar / Atualizar no formulário */
    getBotaoSalvar: () => cy.get('#modalBasic button.button-send, #modalBasic button[type="submit"]', { timeout: 15000 }).first(),

    /** Botão Fechar / Cancelar modal */
    getBotaoFechar: () => cy.get('#modalBasic .btn-close, #modalBasic [data-bs-dismiss="modal"]', { timeout: 15000 }).first(),

    // ══════════════════════════════════════════════
    //  MÉTODOS AUXILIARES E ASSERÇÕES
    // ══════════════════════════════════════════════

    /** Valida que o campo senha NÃO existe no formulário de edição */
    validarCampoSenhaAusenteNaEdicao: () => {
        cy.get('#modalBasic').within(() => {
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
        cy.wait(500);
        cy.get('body').then(($body) => {
            if ($body.find('#modalBasic.show').length > 0) {
                RepresentantesPage.getBotaoFechar().click({ force: true });
            }
        });
        cy.get('#modalBasic').should('not.be.visible');
    },
};

/// <reference types="cypress" />

import { ImportacoesPage } from '../../../page-objects/Controle/Importacoes/ImportacoesPage';
import { Navbar } from '../../../page-objects/Navbar';
import { setupLoginIntercepts, setupImportacoesIntercepts, ALIAS } from '../../../support/api-intercepts';

describe('Controle - Tela de Importações (/controle/importacoes)', () => {

    let loginData: any;

    before(() => {
        cy.fixture('Login/login.json').then((data) => {
            loginData = data;
        });
    });

    beforeEach(() => {
        setupLoginIntercepts();
        setupImportacoesIntercepts();
        cy.logar(loginData.validUser.email, loginData.validUser.password);
    });

    // ══════════════════════════════════════════════
    //  CARREGAMENTO E ELEMENTOS DA TELA
    // ══════════════════════════════════════════════

    describe('Exibição da Página e Elementos Iniciais', () => {

        it('Deve carregar a rota /controle/importacoes com status HTTP 200', () => {
            Navbar.controle('Importações');
            cy.wait(`@${ALIAS.paginaImportacoes}`).its('response.statusCode').should('be.oneOf', [200, 304]);
            ImportacoesPage.getTitulo().should('be.visible').and('contain.text', 'Importações');
        });

        it('Deve renderizar os elementos da barra de ações (Busca e Filtro)', () => {
            Navbar.controle('Importações');
            ImportacoesPage.getCampoBusca().should('be.visible');
            ImportacoesPage.getBotaoFiltro().should('be.visible');
        });

        it('Deve exibir a tabela de importações com as colunas esperadas', () => {
            Navbar.controle('Importações');
            ImportacoesPage.getTabelaImportacoes().within(() => {
                cy.contains('th, td, div', 'Importados').should('be.visible');
                cy.contains('th, td, div', 'Pendentes').should('be.visible');
                cy.contains('th, td, div', 'Duplicados').should('be.visible');
                cy.contains('th, td, div', 'Inválidas').should('be.visible');
                cy.contains('th, td, div', 'Quantidade').should('be.visible');
                cy.contains('th, td, div', 'Data').should('be.visible');
                cy.contains('th, td, div', 'Status').should('be.visible');
                cy.contains('th, td, div', 'Usuário').should('be.visible');
                cy.contains('th, td, div', 'Ações').should('be.visible');
            });
        });
    });

    // ══════════════════════════════════════════════
    //  BUSCA E FILTROS DE IMPORTAÇÕES
    // ══════════════════════════════════════════════

    describe('Busca e Filtros com Interceptação de API', () => {

        beforeEach(() => {
            Navbar.controle('Importações');
            ImportacoesPage.fecharModalAbertoSeExistir();
        });

        it('Deve pesquisar por termo na busca, interceptar POST /search e atualizar a tabela', () => {
            ImportacoesPage.buscarImportacaoPorTermo('Admin');

            cy.wait(`@${ALIAS.listarImportacoes}`).its('response.statusCode').should('be.oneOf', [200, 304]);
        });

        it('Deve abrir o painel de filtro, exibir campos de Data Início e Data Fim', () => {
            ImportacoesPage.getBotaoFiltro().click({ force: true });

            ImportacoesPage.getPainelFiltro().should('be.visible');
            ImportacoesPage.getCampoDataInicioFiltro().should('be.visible');
            ImportacoesPage.getCampoDataFimFiltro().should('be.visible');
            ImportacoesPage.getBotaoAplicarFiltro().should('be.visible');
            ImportacoesPage.getBotaoLimparFiltro().should('be.visible');
        });
    });

    // ══════════════════════════════════════════════
    //  AÇÕES DA TABELA DE IMPORTAÇÕES
    // ══════════════════════════════════════════════

    describe('Validação das Ações do Menu da Tabela de Importações', () => {

        beforeEach(() => {
            Navbar.controle('Importações');
            ImportacoesPage.fecharModalAbertoSeExistir();
        });

        afterEach(() => {
            ImportacoesPage.fecharModalAbertoSeExistir();
        });

        it('Deve clicar em "Exportar" e baixar o relatório importacao.xlsx', () => {
            // O export é gerado no CLIENTE (blob) — não há request HTTP a interceptar
            // (comprovado: um intercept amplo em **/controle/importacoes/** não captura nada,
            // mas o arquivo é baixado). Portanto validamos o ARQUIVO baixado.
            const arquivo = `${Cypress.config('downloadsFolder')}/importacao.xlsx`;
            cy.task('deleteDownloads');

            ImportacoesPage.abrirMenuAcoes(0);
            ImportacoesPage.clicarAcaoPorTexto('Exportar');

            cy.readFile(arquivo, 'binary', { timeout: 20000 }).should((conteudo) => {
                expect(conteudo.length, 'tamanho do .xlsx').to.be.greaterThan(0);
                // Assinatura ZIP ("PK") — garante um .xlsx real, não um arquivo vazio/HTML de erro
                expect(conteudo.slice(0, 2), 'assinatura ZIP do xlsx').to.eq('PK');
            });
        });

        it('Deve clicar em "Excluir" e abrir o modal de confirmação de exclusão', () => {
            ImportacoesPage.abrirMenuAcoes(0);
            ImportacoesPage.clicarAcaoPorTexto('Excluir');

            // Valida exibição do modal de confirmação de exclusão
            ImportacoesPage.getModalExclusao().should('be.visible').within(() => {
                cy.contains('Excluir importação').should('be.visible');
                ImportacoesPage.getBotaoCancelarExclusao().should('be.visible');
                ImportacoesPage.getBotaoConfirmarExclusao().should('be.visible');
            });
        });

        it('Deve fechar o modal de exclusão ao clicar em Cancelar', () => {
            ImportacoesPage.abrirMenuAcoes(0);
            ImportacoesPage.clicarAcaoPorTexto('Excluir');

            ImportacoesPage.getModalExclusao().should('be.visible');
            ImportacoesPage.getBotaoCancelarExclusao().click({ force: true });

            ImportacoesPage.getModalExclusao().should('not.exist');
        });
    });
});

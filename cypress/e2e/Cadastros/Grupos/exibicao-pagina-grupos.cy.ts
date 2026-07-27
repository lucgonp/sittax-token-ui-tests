/// <reference types="cypress" />

import { GruposPage } from '../../../page-objects/Cadastros/Grupos/GruposPage';
import { setupGruposIntercepts, ALIAS } from '../../../support/api-intercepts';

/**
 * Testes de exibição e estrutura da página de Grupos (/grupos).
 *
 * Cobertura:
 * - Renderização da página (título, busca, botão cadastrar)
 * - Navbar (menus, logo, info do usuário)
 * - Estrutura da tabela (colunas, dados)
 * - Paginação
 */
describe('Grupos - Exibição da Página', () => {

    beforeEach(() => {
        cy.loginPadrao();
        setupGruposIntercepts();
        cy.navegarParaGrupos();
        cy.wait(`@${ALIAS.listarGrupos}`);
    });


    // ══════════════════════════════════════════════
    //  RENDERIZAÇÃO GERAL
    // ══════════════════════════════════════════════

    describe('Renderização geral', () => {

        it('Deve exibir o título "Grupos"', () => {
            GruposPage.getTituloPagina().should('be.visible').and('contain', 'Grupos');
        });

        it('Deve exibir o botão "Cadastrar grupo"', () => {
            GruposPage.getBotaoCadastrarGrupo().should('be.visible').and('contain', 'Cadastrar grupo');
        });

        it('Deve exibir o campo de busca com placeholder correto', () => {
            GruposPage.getCampoBusca()
                .should('be.visible')
                .and('have.attr', 'placeholder', 'Digite um termo para buscar');
        });

        it('Deve exibir a URL correta (/grupos)', () => {
            cy.url().should('include', '/grupos');
        });
    });

    // ══════════════════════════════════════════════
    //  NAVBAR
    // ══════════════════════════════════════════════

    describe('Navbar', () => {

        it('Deve exibir o logo Sittax Token', () => {
            GruposPage.getLogo().should('be.visible');
        });

        it('Deve exibir o menu "Dashboard"', () => {
            GruposPage.getMenuDashboard().should('be.visible');
        });

        it('Deve exibir o menu "Controle"', () => {
            GruposPage.getMenuControle().should('be.visible');
        });

        it('Deve exibir o menu "Cadastros"', () => {
            GruposPage.getMenuCadastros().should('be.visible');
        });

        it('Deve exibir o menu "Relatórios"', () => {
            GruposPage.getMenuRelatorios().should('be.visible');
        });

        it('Deve exibir o menu "Utilitários"', () => {
            GruposPage.getMenuUtilitarios().should('be.visible');
        });

        it('Deve exibir o e-mail do usuário logado', () => {
            GruposPage.getUsuarioNome().should('contain', login.validUser.nomeExibicao);
        });
    });

    // ══════════════════════════════════════════════
    //  TABELA
    // ══════════════════════════════════════════════

    describe('Tabela de Grupos', () => {

        it('Deve exibir a tabela de grupos', () => {
            GruposPage.getTabela().should('be.visible');
        });

        it('Deve exibir a coluna "Nome do grupo"', () => {
            GruposPage.getHeaderColunas().should('contain', 'Nome do grupo');
        });

        it('Deve exibir a coluna "Usuários"', () => {
            GruposPage.getHeaderColunas().should('contain', 'Usuários');
        });

        it('Deve exibir a coluna "Certificados"', () => {
            GruposPage.getHeaderColunas().should('contain', 'Certificados');
        });

        it('Deve exibir a coluna "Ações"', () => {
            GruposPage.getHeaderColunas().should('contain', 'Ações');
        });

        it('Deve exibir 10 linhas por página (padrão)', () => {
            GruposPage.getLinhasTabela().should('have.length', 10);
        });

        it('Cada linha deve exibir o botão "Ações"', () => {
            GruposPage.getLinhasTabela().each(($row) => {
                cy.wrap($row).find('button[data-dt-action-trigger]').should('contain', 'Ações');
            });
        });

        it('A primeira linha deve conter nome, usuários e certificados', () => {
            GruposPage.getNomeGrupoNaLinha(0).invoke('text').should('not.be.empty');
            GruposPage.getUsuariosNaLinha(0).invoke('text').should('match', /\d+/);
            GruposPage.getCertificadosNaLinha(0).invoke('text').should('match', /\d+/);
        });
    });

    // ══════════════════════════════════════════════
    //  PAGINAÇÃO
    // ══════════════════════════════════════════════

    describe('Paginação', () => {

        it('Deve exibir o rótulo "Resultados por página"', () => {
            GruposPage.getResultadosPorPagina().should('be.visible').and('contain', 'Resultados por página');
        });

        it('Deve exibir o total de resultados com um número', () => {
            GruposPage.getTotalResultados()
                .should('be.visible')
                .invoke('text')
                .should('match', /\d+\s*resultados/);
        });

        it('Deve exibir os botões de navegação de página', () => {
            GruposPage.getBotaoProximaPagina().should('exist');
            GruposPage.getBotaoPaginaAnterior().should('exist');
        });
    });
});

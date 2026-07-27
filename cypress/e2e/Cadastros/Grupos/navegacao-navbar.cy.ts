/// <reference types="cypress" />

import { GruposPage } from '../../../page-objects/Cadastros/Grupos/GruposPage';
import { setupGruposIntercepts, ALIAS } from '../../../support/api-intercepts';

/**
 * Testes de navegação da navbar (nd-navbar) na aplicação Sittax Token.
 *
 * Cobertura:
 * - Itens da navbar (Dashboard, Controle, Cadastros, Relatórios, Utilitários)
 * - Navegação via Dashboard e logo
 * - Informações do usuário logado
 * - Footer
 */
describe('Grupos - Navegação (Navbar)', () => {

    let login: any;

    before(() => {
        cy.fixture('Login/login.json').then((data) => {
            login = data;
            cy.logar(login.validUser.email, login.validUser.password);
            setupGruposIntercepts();
            cy.navegarParaGrupos();
            cy.wait(`@${ALIAS.listarGrupos}`);
        });
    });

    // ══════════════════════════════════════════════
    //  ITENS DA NAVBAR
    // ══════════════════════════════════════════════

    describe('Itens da navbar', () => {

        it('Deve exibir todos os itens de menu', () => {
            GruposPage.getMenuDashboard().should('be.visible');
            GruposPage.getMenuControle().should('be.visible');
            GruposPage.getMenuCadastros().should('be.visible');
            GruposPage.getMenuRelatorios().should('be.visible');
            GruposPage.getMenuUtilitarios().should('be.visible');
        });

        it('Deve exibir "Cadastros" como menu ativo', () => {
            GruposPage.getMenuCadastros()
                .parents('.nd-navbar__item')
                .should('have.class', 'nd-navbar__item--active');
        });
    });

    // ══════════════════════════════════════════════
    //  NAVEGAÇÃO
    // ══════════════════════════════════════════════

    describe('Navegação por links', () => {

        afterEach(() => {
            // Garante retorno à página de Grupos após navegar
            cy.navegarParaGrupos();
        });

        it('Deve navegar para o Dashboard ao clicar no menu', () => {
            GruposPage.getMenuDashboard().click();
            cy.url({ timeout: 10000 }).should('include', '/dashboard');
        });

        it('Deve navegar ao clicar no logo', () => {
            GruposPage.getLogo().click();
            cy.url({ timeout: 10000 }).should('not.include', '/grupos');
        });
    });

    // ══════════════════════════════════════════════
    //  USUÁRIO LOGADO
    // ══════════════════════════════════════════════

    describe('Informações do Usuário', () => {

        it('Deve exibir o e-mail do usuário logado', () => {
            GruposPage.getUsuarioNome().should('contain', login.validUser.nomeExibicao);
        });

        it('Deve exibir o perfil do usuário', () => {
            GruposPage.getUsuarioPerfil().should('contain', login.validUser.perfil);
        });

        it('Deve exibir o nome do escritório', () => {
            GruposPage.getUsuarioEmpresa().should('contain', login.validUser.empresa);
        });
    });

    // ══════════════════════════════════════════════
    //  FOOTER
    // ══════════════════════════════════════════════

    describe('Footer', () => {

        it('Deve exibir o copyright da Sittax', () => {
            GruposPage.getFooter().should('contain', 'SITTAX 2026');
        });

        it('Deve exibir a versão da aplicação', () => {
            GruposPage.getFooter().should('contain', 'Versão');
        });
    });
});

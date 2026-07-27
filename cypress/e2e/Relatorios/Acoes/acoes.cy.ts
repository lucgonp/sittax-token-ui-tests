/// <reference types="cypress" />

import { RelatoriosPage } from '../../../page-objects/Relatorios/RelatoriosPage';
import { setupLoginIntercepts, setupRelatoriosIntercepts, ALIAS } from '../../../support/api-intercepts';

describe('Relatório - Ações (/acoes/nova-area)', () => {

    let relatoriosFixture: any;

    before(() => {
        cy.fixture('Relatorios/relatorios.json').then((data) => {
            relatoriosFixture = data;
        });
    });

    beforeEach(() => {
        setupLoginIntercepts();
        setupRelatoriosIntercepts();
        cy.loginPadrao();
        cy.navegarParaRelatorio('Ações');
    });

    it('Deve interceptar GET /acoes/nova-area com HTTP 200', () => {
        cy.wait(`@${ALIAS.relatorioAcoes}`, { timeout: 15000 }).then((interception) => {
            expect(interception.response?.statusCode).to.be.oneOf([200, 304]);
        });
        cy.url().should('include', '/acoes/nova-area');
    });

    it('Deve renderizar o título "Ações" na barra de título da página', () => {
        RelatoriosPage.getTituloRelatorio().should('be.visible').and('contain.text', 'Ações');
    });

    it('Deve renderizar o campo de busca "Digite CNPJ, Razão Social ou Usuário"', () => {
        RelatoriosPage.getCampoBuscaAcoes().should('be.visible')
            .and('have.attr', 'placeholder', 'Digite CNPJ, Razão Social ou Usuário');
    });

    it('Deve renderizar os filtros de seleção (Ação, Status, Ordenação)', () => {
        cy.get('.nd-table-filter button.nd-btn-select').should('have.length.gte', 1);
        cy.contains('span', /Ação: Todos/i).should('be.visible');
    });

    it('Deve pesquisar por termo existente e interceptar POST /acoes/nova-area/search com HTTP 200', () => {
        RelatoriosPage.buscarAcoes(relatoriosFixture.buscaAcoes.termoExistente);
        cy.wait(`@${ALIAS.buscarAcoes}`, { timeout: 15000 }).then((interception) => {
            expect(interception.response?.statusCode).to.be.oneOf([200, 304]);
        });
    });

    it('Deve abrir o dropdown de filtro "Ação" e exibir as opções de tipo (Instalar, etc.)', () => {
        cy.get('.nd-table-filter button.nd-btn-select').first().click({ force: true });
        cy.get('.nd-table-filter__panel').should('be.visible');
        cy.contains('.nd-table-filter__item', 'Instalar').should('be.visible');
    });

});

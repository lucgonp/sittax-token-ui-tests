/// <reference types="cypress" />

import { RelatoriosPage } from '../../../page-objects/Relatorios/RelatoriosPage';
import { setupLoginIntercepts, setupRelatoriosIntercepts, ALIAS } from '../../../support/api-intercepts';

describe('Relatório - Certificados por Grupos (/relatorios/certificados-grupos)', () => {

    beforeEach(() => {
        setupLoginIntercepts();
        setupRelatoriosIntercepts();
        cy.loginPadrao();
        cy.navegarParaRelatorio('Cert. por Grupos');
    });

    it('Deve interceptar GET /relatorios/certificados-grupos com HTTP 200', () => {
        cy.wait(`@${ALIAS.relatorioCertificadosGrupos}`, { timeout: 15000 }).then((interception) => {
            expect(interception.response?.statusCode).to.be.oneOf([200, 304]);
        });
        cy.url().should('include', '/relatorios/certificados-grupos');
    });

    it('Deve renderizar o título "Relação de Certificados por Grupos" e os botões Imprimir/Fechar', () => {
        RelatoriosPage.getTituloRelatorio().should('be.visible').and('contain.text', 'Relação de Certificados por Grupos');
        RelatoriosPage.getBotaoImprimir().should('be.visible');
        RelatoriosPage.getBotaoFechar().should('be.visible');
    });

    it('Deve exibir o contador "Total de grupos" com valor numérico válido (> 0)', () => {
        cy.contains('b', 'Total de grupos:').should('be.visible')
            .parent('td').invoke('text').then((text) => {
                const numero = parseInt(text.replace(/\D/g, ''), 10);
                expect(numero).to.be.a('number').and.to.be.gt(0);
            });
    });

    it('Deve exibir o contador "Total de Usuários" com valor numérico válido (>= 0)', () => {
        cy.contains('b', 'Total de Usuários:').should('be.visible')
            .parent('td').invoke('text').then((text) => {
                const numero = parseInt(text.replace(/\D/g, ''), 10);
                expect(numero).to.be.a('number').and.to.be.gte(0);
            });
    });

    it('Deve exibir o contador "Total de Certificados" com valor numérico válido (>= 0)', () => {
        cy.contains('b', 'Total de Certificados:').should('be.visible')
            .parent('td').invoke('text').then((text) => {
                const numero = parseInt(text.replace(/\D/g, ''), 10);
                expect(numero).to.be.a('number').and.to.be.gte(0);
            });
    });

    it('Deve renderizar a tabela principal com as colunas (Item, Grupo)', () => {
        cy.get('table thead tr').first().within(() => {
            cy.contains('th', 'Item').should('be.visible');
            cy.contains('th', 'Grupo').should('be.visible');
        });
    });

    it('Deve exibir pelo menos um grupo com seus sub-detalhes de Usuário(s) e Certificado(s)', () => {
        cy.get('table tbody tr').should('have.length.greaterThan', 0);
        cy.contains(/\d+ Usuário\(s\)/).should('exist');
        cy.contains(/\d+ Certificado\(s\)/).should('exist');
    });
});

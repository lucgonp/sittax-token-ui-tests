/// <reference types="cypress" />

import { RelatoriosPage } from '../../../page-objects/Relatorios/RelatoriosPage';
import { setupLoginIntercepts, setupRelatoriosIntercepts, ALIAS } from '../../../support/api-intercepts';

describe('Relatório - Certificados (/relatorios/certificados)', () => {

    beforeEach(() => {
        setupLoginIntercepts();
        setupRelatoriosIntercepts();
        cy.loginPadrao();
        cy.navegarParaRelatorio('Certificados');
    });

    it('Deve interceptar GET /relatorios/certificados com HTTP 200', () => {
        cy.wait(`@${ALIAS.relatorioCertificados}`, { timeout: 15000 }).then((interception) => {
            expect(interception.response?.statusCode).to.be.oneOf([200, 304]);
        });
        cy.url().should('include', '/relatorios/certificados');
    });

    it('Deve renderizar o título "Relação de Certificados" e os botões Imprimir/Fechar', () => {
        RelatoriosPage.getTituloRelatorio().should('be.visible').and('contain.text', 'Relação de Certificados');
        RelatoriosPage.getBotaoImprimir().should('be.visible');
        RelatoriosPage.getBotaoFechar().should('be.visible');
    });

    it('Deve exibir o contador "Total de certificados" com valor numérico válido (>= 0)', () => {
        cy.contains('b', 'Total de certificados:').should('be.visible')
            .parent('td').invoke('text').then((text) => {
                const numero = parseInt(text.replace(/\D/g, ''), 10);
                expect(numero).to.be.a('number').and.to.be.gte(0);
            });
    });

    it('Deve exibir o contador "Total de Usuários" com valor numérico válido (>= 0)', () => {
        cy.contains('b', 'Total de Usuários:').should('be.visible')
            .parent('td').invoke('text').then((text) => {
                const numero = parseInt(text.replace(/\D/g, ''), 10);
                expect(numero).to.be.a('number').and.to.be.gte(0);
            });
    });

    it('Deve renderizar a tabela de dados com as colunas esperadas (Item, CNPJ, Razão Social, Apelido, Validade)', () => {
        RelatoriosPage.getTabelaRelatorio().should('be.visible');
        cy.get('table thead tr').first().within(() => {
            cy.contains('th', 'Item').should('be.visible');
            cy.contains('th', 'CNPJ').should('be.visible');
            cy.contains('th', 'Razão Social').should('be.visible');
            cy.contains('th', 'Apelido').should('be.visible');
            cy.contains('th', 'Validade').should('be.visible');
        });
    });

    it('Deve exibir pelo menos uma linha de dados na tabela de certificados', () => {
        cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });
});

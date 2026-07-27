/// <reference types="cypress" />

import { RelatoriosPage } from '../../../page-objects/Relatorios/RelatoriosPage';
import { setupLoginIntercepts, setupRelatoriosIntercepts, ALIAS } from '../../../support/api-intercepts';

describe('Relatório - Procurações (/relatorios/procuracoes)', () => {

    beforeEach(() => {
        setupLoginIntercepts();
        setupRelatoriosIntercepts();
        cy.loginPadrao();
        cy.navegarParaRelatorio('Procurações');
    });

    it('Deve interceptar GET /relatorios/procuracoes com HTTP 200', () => {
        cy.wait(`@${ALIAS.relatorioProcuracoes}`, { timeout: 15000 }).then((interception) => {
            expect(interception.response?.statusCode).to.be.oneOf([200, 304]);
        });
        cy.url().should('include', '/relatorios/procuracoes');
    });

    it('Deve renderizar o título "Relação de Procurações" e os botões Imprimir/Fechar', () => {
        RelatoriosPage.getTituloRelatorio().should('be.visible').and('contain.text', 'Relação de Procurações');
        RelatoriosPage.getBotaoImprimir().should('be.visible');
        RelatoriosPage.getBotaoFechar().should('be.visible');
    });

    it('Deve exibir o contador "Total de Certificados" com valor numérico válido (>= 0)', () => {
        cy.contains('b', 'Total de Certificados:').should('be.visible')
            .parent('td').invoke('text').then((text) => {
                const numero = parseInt(text.replace(/\D/g, ''), 10);
                expect(numero).to.be.a('number').and.to.be.gte(0);
            });
    });

    it('Deve exibir o contador "Total de Procurações" com valor numérico válido (>= 0)', () => {
        cy.contains('b', 'Total de Procurações:').should('be.visible')
            .parent('td').invoke('text').then((text) => {
                const numero = parseInt(text.replace(/\D/g, ''), 10);
                expect(numero).to.be.a('number').and.to.be.gte(0);
            });
    });

    it('Deve renderizar a tabela principal com as colunas (Item, CNPJ, Razão Social, Validade)', () => {
        cy.get('table thead tr').first().within(() => {
            cy.contains('th', 'Item').should('be.visible');
            cy.contains('th', 'CNPJ').should('be.visible');
            cy.contains('th', 'Razão Social').should('be.visible');
            cy.contains('th', 'Validade').should('be.visible');
        });
    });

    it('Deve exibir pelo menos uma linha de dados na tabela de procurações', () => {
        cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });

    it('Deve exibir a data e hora de emissão do relatório no rodapé', () => {
        cy.contains('Emissão:').should('be.visible');
    });
});

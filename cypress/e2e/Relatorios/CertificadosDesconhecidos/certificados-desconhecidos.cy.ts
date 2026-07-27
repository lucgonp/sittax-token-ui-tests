/// <reference types="cypress" />

import { RelatoriosPage } from '../../../page-objects/Relatorios/RelatoriosPage';
import { setupLoginIntercepts, setupRelatoriosIntercepts, ALIAS } from '../../../support/api-intercepts';

describe('Relatório - Certificados Desconhecidos (/relatorios/certificados-desconhecidos)', () => {

    beforeEach(() => {
        setupLoginIntercepts();
        setupRelatoriosIntercepts();
        cy.loginPadrao();
        cy.navegarParaRelatorio('Cert. Desconhecidos');
    });

    it('Deve interceptar GET /relatorios/certificados-desconhecidos com HTTP 200', () => {
        cy.wait(`@${ALIAS.relatorioCertificadosDesconhecidos}`, { timeout: 15000 }).then((interception) => {
            expect(interception.response?.statusCode).to.be.oneOf([200, 304]);
        });
        cy.url().should('include', '/relatorios/certificados-desconhecidos');
    });

    it('Deve renderizar o título "Relação de Certificados Desconhecidos" e os botões Imprimir/Fechar', () => {
        RelatoriosPage.getTituloRelatorio().should('be.visible').and('contain.text', 'Relação de Certificados Desconhecidos');
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

    it('Deve renderizar a tabela com as colunas (Item, CNPJ, Razão Social, Validade)', () => {
        cy.get('table thead tr').first().within(() => {
            cy.contains('th', 'Item').should('be.visible');
            cy.contains('th', 'CNPJ').should('be.visible');
            cy.contains('th', 'Razão Social').should('be.visible');
            cy.contains('th', 'Validade').should('be.visible');
        });
    });

    it('Deve exibir a data e hora de emissão do relatório no rodapé', () => {
        cy.contains('Emissão:').should('be.visible');
    });
});

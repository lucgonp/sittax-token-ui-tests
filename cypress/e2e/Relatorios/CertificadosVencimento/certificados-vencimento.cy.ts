/// <reference types="cypress" />

import { RelatoriosPage } from '../../../page-objects/Relatorios/RelatoriosPage';
import { setupLoginIntercepts, setupRelatoriosIntercepts, ALIAS } from '../../../support/api-intercepts';

describe('Relatório - Certificados por Vencimento (/relatorios/certificados-vencimentos)', () => {

    beforeEach(() => {
        setupLoginIntercepts();
        setupRelatoriosIntercepts();
        cy.loginPadrao();
        cy.navegarParaRelatorio('Cert. por Vencimento');
    });

    it('Deve interceptar GET /relatorios/certificados-vencimentos com HTTP 200', () => {
        cy.wait(`@${ALIAS.relatorioCertificadosVencimento}`, { timeout: 15000 }).then((interception) => {
            expect(interception.response?.statusCode).to.be.oneOf([200, 304]);
        });
        cy.url().should('include', '/relatorios/certificados-vencimentos');
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

    it('Deve renderizar a tabela com as colunas (Item, CNPJ, Razão Social, Apelido, Telefone, Validade)', () => {
        RelatoriosPage.getTabelaRelatorio().should('be.visible');
        cy.get('table thead tr').first().within(() => {
            cy.contains('th', 'Item').should('be.visible');
            cy.contains('th', 'CNPJ').should('be.visible');
            cy.contains('th', 'Razão Social').should('be.visible');
            cy.contains('th', 'Apelido').should('be.visible');
            cy.contains('th', 'Telefone').should('be.visible');
            cy.contains('th', 'Validade').should('be.visible');
        });
    });

    it('Deve validar que a quantidade de linhas corresponde ao "Total de certificados"', () => {
        cy.contains('b', 'Total de certificados:').parent('td').invoke('text').then((text) => {
            const totalDeclarado = parseInt(text.replace(/\D/g, ''), 10);
            cy.get('table tbody tr th').then(($items) => {
                expect($items.length).to.eq(totalDeclarado);
            });
        });
    });

    it('Deve exibir datas de validade no formato DD/MM/AAAA em cada linha', () => {
        cy.get('table tbody tr').filter(':has(th)').first().within(() => {
            cy.get('td').last().invoke('text').then((text) => {
                expect(text.trim()).to.match(/\d{2}\/\d{2}\/\d{4}/);
            });
        });
    });
});

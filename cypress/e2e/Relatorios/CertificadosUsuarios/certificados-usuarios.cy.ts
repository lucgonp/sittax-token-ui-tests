/// <reference types="cypress" />

import { RelatoriosPage } from '../../../page-objects/Relatorios/RelatoriosPage';
import { setupLoginIntercepts, setupRelatoriosIntercepts, ALIAS } from '../../../support/api-intercepts';

describe('Relatório - Certificados por Usuários (/relatorios/certificados-usuarios)', () => {

    beforeEach(() => {
        setupLoginIntercepts();
        setupRelatoriosIntercepts();
        cy.loginPadrao();
        cy.navegarParaRelatorio('Cert. por Usuários');
    });

    it('Deve interceptar GET /relatorios/certificados-usuarios com HTTP 200', () => {
        cy.wait(`@${ALIAS.relatorioCertificadosUsuarios}`, { timeout: 15000 }).then((interception) => {
            expect(interception.response?.statusCode).to.be.oneOf([200, 304]);
        });
        cy.url().should('include', '/relatorios/certificados-usuarios');
    });

    it('Deve renderizar o título "Relação de Certificados por Usuários" e os botões Imprimir/Fechar', () => {
        RelatoriosPage.getTituloRelatorio().should('be.visible').and('contain.text', 'Relação de Certificados por Usuários');
        RelatoriosPage.getBotaoImprimir().should('be.visible');
        RelatoriosPage.getBotaoFechar().should('be.visible');
    });

    it('Deve exibir o contador "Total de usuários" com valor numérico válido (> 0)', () => {
        cy.contains('b', 'Total de usuários:').should('be.visible')
            .parent('td').invoke('text').then((text) => {
                const numero = parseInt(text.replace(/\D/g, ''), 10);
                expect(numero).to.be.a('number').and.to.be.gt(0);
            });
    });

    it('Deve exibir o contador "Total de Grupos" com valor numérico válido (>= 0)', () => {
        cy.contains('b', 'Total de Grupos:').should('be.visible')
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

    it('Deve renderizar a tabela principal com as colunas (Item, Usuário, Apelido)', () => {
        cy.get('table thead tr').first().within(() => {
            cy.contains('th', 'Item').should('be.visible');
            cy.contains('th', 'Usuário').should('be.visible');
            cy.contains('th', 'Apelido').should('be.visible');
        });
    });

    it('Deve exibir pelo menos um usuário com seus sub-detalhes de Grupo(s) e Certificado(s)', () => {
        cy.get('table tbody tr').should('have.length.greaterThan', 0);
        cy.contains(/\d+ Grupo\(s\)/).should('exist');
        cy.contains(/\d+ Certificado\(s\)/).should('exist');
    });
});

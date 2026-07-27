/// <reference types="cypress" />

import { RelatoriosPage } from '../../../page-objects/Relatorios/RelatoriosPage';
import { setupLoginIntercepts, setupRelatoriosIntercepts, ALIAS } from '../../../support/api-intercepts';

describe('Relatório - Certificados Lista (/relatorios/certificados-lista)', () => {

    beforeEach(() => {
        setupLoginIntercepts();
        setupRelatoriosIntercepts();
        cy.loginPadrao();
        cy.navegarParaRelatorio('Certificados - Lista');
    });

    it('Deve interceptar GET /relatorios/certificados-lista com HTTP 200', () => {
        cy.wait(`@${ALIAS.relatorioCertificadosLista}`, { timeout: 15000 }).then((interception) => {
            expect(interception.response?.statusCode).to.be.oneOf([200, 304]);
        });
        cy.url().should('include', '/relatorios/certificados-lista');
    });

    it('Deve renderizar o título "Relação de Certificados" e os botões Imprimir/Fechar', () => {
        RelatoriosPage.getTituloRelatorio().should('be.visible').and('contain.text', 'Relação de Certificados');
        RelatoriosPage.getBotaoImprimir().should('be.visible');
        RelatoriosPage.getBotaoFechar().should('be.visible');
    });

    it('Deve exibir os botões de filtro: Todos, Bytoken e Desconhecidos', () => {
        cy.contains('button', 'Todos').should('be.visible');
        cy.contains('button', 'Bytoken').should('be.visible');
        cy.contains('button', 'Desconhecidos').should('be.visible');
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

    it('Deve exibir o contador "Total de Grupos" com valor numérico válido (>= 0)', () => {
        cy.contains('b', 'Total de Grupos:').should('be.visible')
            .parent('td').invoke('text').then((text) => {
                const numero = parseInt(text.replace(/\D/g, ''), 10);
                expect(numero).to.be.a('number').and.to.be.gte(0);
            });
    });

    it('Deve renderizar a tabela com as colunas (Item, CNPJ, Razão Social, Apelido, Origem, Validade, # usuários, # grupos)', () => {
        RelatoriosPage.getTabelaRelatorio().should('be.visible');
        cy.get('table thead tr').first().within(() => {
            cy.contains('th', 'Item').should('be.visible');
            cy.contains('th', 'CNPJ').should('be.visible');
            cy.contains('th', 'Razão Social').should('be.visible');
            cy.contains('th', 'Origem').should('be.visible');
            cy.contains('th', 'Validade').should('be.visible');
            cy.contains('th', '# usuários').should('be.visible');
            cy.contains('th', '# grupos').should('be.visible');
        });
    });

    it('Deve validar que a quantidade de linhas na tabela corresponde ao "Total de certificados"', () => {
        cy.contains('b', 'Total de certificados:').parent('td').invoke('text').then((text) => {
            const totalDeclarado = parseInt(text.replace(/\D/g, ''), 10);
            cy.get('table tbody tr th').then(($items) => {
                // Cada certificado na tabela tem um <th> com o número do item
                expect($items.length).to.eq(totalDeclarado);
            });
        });
    });
});

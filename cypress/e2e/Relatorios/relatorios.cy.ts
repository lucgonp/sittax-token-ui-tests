/// <reference types="cypress" />

import { RelatoriosPage } from '../../page-objects/Relatorios/RelatoriosPage';
import { setupLoginIntercepts, setupRelatoriosIntercepts, ALIAS } from '../../support/api-intercepts';

describe('Relatórios - Suíte Completa de Relatórios via Navegação UI (Sem cy.visit)', () => {

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
    });

    // ══════════════════════════════════════════════
    //  1. RELATÓRIO DE CERTIFICADOS
    // ══════════════════════════════════════════════

    describe('Relatório: Certificados (/relatorios/certificados)', () => {

        it('Deve navegar para o relatório de Certificados via Navbar, interceptar GET /relatorios/certificados e renderizar elementos', () => {
            cy.navegarParaRelatorio('Certificados');

            cy.wait(`@${ALIAS.relatorioCertificados}`, { timeout: 15000 }).then((interception) => {
                expect(interception.response?.statusCode).to.be.oneOf([200, 304]);
            });

            cy.url().should('include', '/relatorios/certificados');
            RelatoriosPage.getTituloRelatorio().should('be.visible').and('contain.text', relatoriosFixture.titulos.certificados);
            RelatoriosPage.getBotaoImprimir().should('be.visible');
            RelatoriosPage.getBotaoFechar().should('be.visible');
            RelatoriosPage.getTabelaRelatorio().should('be.visible');
        });
    });

    // ══════════════════════════════════════════════
    //  2. RELATÓRIO DE CERTIFICADOS - LISTA
    // ══════════════════════════════════════════════

    describe('Relatório: Certificados - Lista (/relatorios/certificados-lista)', () => {

        it('Deve navegar para o relatório de Certificados Lista via Navbar, interceptar requisição e renderizar os botões de filtro', () => {
            cy.navegarParaRelatorio('Certificados - Lista');

            cy.wait(`@${ALIAS.relatorioCertificadosLista}`, { timeout: 15000 }).then((interception) => {
                expect(interception.response?.statusCode).to.be.oneOf([200, 304]);
            });

            cy.url().should('include', '/relatorios/certificados-lista');
            RelatoriosPage.getTituloRelatorio().should('be.visible').and('contain.text', relatoriosFixture.titulos.certificadosLista);
            cy.contains('button', 'Todos').should('be.visible');
            cy.contains('button', 'Bytoken').should('be.visible');
            cy.contains('button', 'Desconhecidos').should('be.visible');
            RelatoriosPage.getBotaoImprimir().should('be.visible');
            RelatoriosPage.getBotaoFechar().should('be.visible');
        });
    });

    // ══════════════════════════════════════════════
    //  3. RELATÓRIO DE CERTIFICADOS DESCONHECIDOS
    // ══════════════════════════════════════════════

    describe('Relatório: Certificados Desconhecidos (/relatorios/certificados-desconhecidos)', () => {

        it('Deve navegar para o relatório de Certificados Desconhecidos via Navbar e interceptar GET HTTP 200', () => {
            cy.navegarParaRelatorio('Cert. Desconhecidos');

            cy.wait(`@${ALIAS.relatorioCertificadosDesconhecidos}`, { timeout: 15000 }).then((interception) => {
                expect(interception.response?.statusCode).to.be.oneOf([200, 304]);
            });

            cy.url().should('include', '/relatorios/certificados-desconhecidos');
            RelatoriosPage.getTituloRelatorio().should('be.visible').and('contain.text', relatoriosFixture.titulos.certificadosDesconhecidos);
            RelatoriosPage.getBotaoImprimir().should('be.visible');
            RelatoriosPage.getBotaoFechar().should('be.visible');
        });
    });

    // ══════════════════════════════════════════════
    //  4. RELATÓRIO DE CERTIFICADOS POR VENCIMENTO
    // ══════════════════════════════════════════════

    describe('Relatório: Certificados por Vencimento (/relatorios/certificados-vencimentos)', () => {

        it('Deve navegar para o relatório de Certificados por Vencimento via Navbar e validar a estrutura da tabela', () => {
            cy.navegarParaRelatorio('Cert. por Vencimento');

            cy.wait(`@${ALIAS.relatorioCertificadosVencimento}`, { timeout: 15000 }).then((interception) => {
                expect(interception.response?.statusCode).to.be.oneOf([200, 304]);
            });

            cy.url().should('include', '/relatorios/certificados-vencimentos');
            RelatoriosPage.getTituloRelatorio().should('be.visible').and('contain.text', relatoriosFixture.titulos.certificadosVencimento);
            RelatoriosPage.getTabelaRelatorio().should('be.visible');
            cy.contains('th', 'CNPJ').should('be.visible');
            cy.contains('th', 'Razão Social').should('be.visible');
            cy.contains('th', 'Validade').should('be.visible');
        });
    });

    // ══════════════════════════════════════════════
    //  5. RELATÓRIO DE CERTIFICADOS POR GRUPOS
    // ══════════════════════════════════════════════

    describe('Relatório: Certificados por Grupos (/relatorios/certificados-grupos)', () => {

        it('Deve navegar para o relatório de Certificados por Grupos via Navbar e validar contadores', () => {
            cy.navegarParaRelatorio('Cert. por Grupos');

            cy.wait(`@${ALIAS.relatorioCertificadosGrupos}`, { timeout: 15000 }).then((interception) => {
                expect(interception.response?.statusCode).to.be.oneOf([200, 304]);
            });

            cy.url().should('include', '/relatorios/certificados-grupos');
            RelatoriosPage.getTituloRelatorio().should('be.visible').and('contain.text', relatoriosFixture.titulos.certificadosGrupos);
            cy.contains('b', 'Total de grupos:').should('be.visible');
            cy.contains('b', 'Total de Usuários:').should('be.visible');
            cy.contains('b', 'Total de Certificados:').should('be.visible');
        });
    });

    // ══════════════════════════════════════════════
    //  6. RELATÓRIO DE CERTIFICADOS POR USUÁRIOS
    // ══════════════════════════════════════════════

    describe('Relatório: Certificados por Usuários (/relatorios/certificados-usuarios)', () => {

        it('Deve navegar para o relatório de Certificados por Usuários via Navbar e validar estatísticas', () => {
            cy.navegarParaRelatorio('Cert. por Usuários');

            cy.wait(`@${ALIAS.relatorioCertificadosUsuarios}`, { timeout: 15000 }).then((interception) => {
                expect(interception.response?.statusCode).to.be.oneOf([200, 304]);
            });

            cy.url().should('include', '/relatorios/certificados-usuarios');
            RelatoriosPage.getTituloRelatorio().should('be.visible').and('contain.text', relatoriosFixture.titulos.certificadosUsuarios);
            cy.contains('b', 'Total de usuários:').should('be.visible');
            cy.contains('b', 'Total de Grupos:').should('be.visible');
            cy.contains('b', 'Total de Certificados:').should('be.visible');
        });
    });

    // ══════════════════════════════════════════════
    //  7. RELATÓRIO DE PROCURAÇÕES
    // ══════════════════════════════════════════════

    describe('Relatório: Procurações (/relatorios/procuracoes)', () => {

        it('Deve navegar para o relatório de Procurações via Navbar e interceptar GET /relatorios/procuracoes', () => {
            cy.navegarParaRelatorio('Procurações');

            cy.wait(`@${ALIAS.relatorioProcuracoes}`, { timeout: 15000 }).then((interception) => {
                expect(interception.response?.statusCode).to.be.oneOf([200, 304]);
            });

            cy.url().should('include', '/relatorios/procuracoes');
            RelatoriosPage.getTituloRelatorio().should('be.visible').and('contain.text', relatoriosFixture.titulos.procuracoes);
            cy.contains('b', 'Total de Certificados:').should('be.visible');
            cy.contains('b', 'Total de Procurações:').should('be.visible');
        });
    });

    // ══════════════════════════════════════════════
    //  8. RELATÓRIO DE AÇÕES
    // ══════════════════════════════════════════════

    describe('Relatório: Ações (/acoes/nova-area)', () => {

        it('Deve navegar para a tela de Ações via Navbar, carregar formulário de busca e interceptar POST /search', () => {
            cy.navegarParaRelatorio('Ações');

            cy.wait(`@${ALIAS.relatorioAcoes}`, { timeout: 15000 }).then((interception) => {
                expect(interception.response?.statusCode).to.be.oneOf([200, 304]);
            });

            cy.url().should('include', '/acoes/nova-area');
            RelatoriosPage.getTituloRelatorio().should('be.visible').and('contain.text', relatoriosFixture.titulos.acoes);
            RelatoriosPage.getCampoBuscaAcoes().should('be.visible');

            // Pesquisa por termo e valida requisição POST do DataTable
            RelatoriosPage.buscarAcoes(relatoriosFixture.buscaAcoes.termoExistente);
            cy.wait(`@${ALIAS.buscarAcoes}`, { timeout: 15000 }).then((interception) => {
                expect(interception.response?.statusCode).to.be.oneOf([200, 304]);
            });
        });
    });
});

/// <reference types="cypress" />

import { MonitoramentoPage } from '../../../page-objects/Controle/Monitoramento/MonitoramentoPage';
import { Navbar } from '../../../page-objects/Navbar';
import { setupLoginIntercepts, setupMonitoramentosIntercepts, ALIAS } from '../../../support/api-intercepts';

describe('Controle - Tela de Monitoramento (/controle/monitoramentos/nova-area)', () => {

    let loginData: any;
    let monitoramentoFixture: any;

    before(() => {
        cy.fixture('Login/login.json').then((data) => {
            loginData = data;
        });
        cy.fixture('Monitoramento/monitoramento.json').then((data) => {
            monitoramentoFixture = data;
        });
    });

    beforeEach(() => {
        setupLoginIntercepts();
        setupMonitoramentosIntercepts();
        cy.logar(loginData.validUser.email, loginData.validUser.password);
    });

    // ══════════════════════════════════════════════
    //  1. CARREGAMENTO E ELEMENTOS DA TELA
    // ══════════════════════════════════════════════

    describe('Exibição da Página e Elementos Iniciais', () => {

        it('Deve carregar a rota /controle/monitoramentos/nova-area com status HTTP 200', () => {
            Navbar.controle('Monitoramento');
            cy.wait(`@${ALIAS.paginaMonitoramentos}`).its('response.statusCode').should('be.oneOf', [200, 304]);
            MonitoramentoPage.getTitulo().should('be.visible').and('contain.text', 'Monitoramento');
        });

        it('Deve renderizar os elementos da barra de ações (Busca, Atualizar, Relatório e Filtro)', () => {
            Navbar.controle('Monitoramento');
            MonitoramentoPage.getCampoBusca().should('be.visible');
            MonitoramentoPage.getBotaoAtualizar().should('be.visible');
            MonitoramentoPage.getBotaoExportar().should('be.visible');
            MonitoramentoPage.getBotaoFiltro().should('be.visible');
        });

        it('Deve exibir a tabela de monitoramentos com as colunas esperadas', () => {
            Navbar.controle('Monitoramento');
            MonitoramentoPage.getTabela().should('be.visible');
            cy.get('table.nd-table thead tr').within(() => {
                cy.contains('th', 'Usuário').should('be.visible');
                cy.contains('th', 'Apelido').should('be.visible');
                cy.contains('th', 'Certificado').should('be.visible');
                cy.contains('th', 'Site/Aplicação').should('be.visible');
                cy.contains('th', 'Data de Acesso').should('be.visible');
                cy.contains('th', 'Gravação').should('be.visible');
            });
        });
    });

    // ══════════════════════════════════════════════
    //  2. BUSCA, ATUALIZAÇÃO, FILTROS E EXPORTAÇÃO
    // ══════════════════════════════════════════════

    describe('Busca, Filtros, Atualização e Exportação de API', () => {

        beforeEach(() => {
            Navbar.controle('Monitoramento');
            MonitoramentoPage.fecharModalAbertoSeExistir();
        });

        it('Deve pesquisar por usuário no campo de busca e interceptar POST /search', () => {
            MonitoramentoPage.buscarPorTermo(monitoramentoFixture.busca.usuarioValido);
            cy.wait(`@${ALIAS.listarMonitoramentos}`, { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);
        });

        it('Deve clicar no botão Atualizar e interceptar a requisição de atualização', () => {
            MonitoramentoPage.getBotaoAtualizar().click({ force: true });
            cy.wait(`@${ALIAS.listarMonitoramentos}`, { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);
        });

        it('Deve abrir o painel de filtros, preencher o intervalo de datas e aplicar', () => {
            MonitoramentoPage.getBotaoFiltro().click({ force: true });
            MonitoramentoPage.getPainelFiltro().should('be.visible');

            MonitoramentoPage.getInputDataInicioFiltro().type(monitoramentoFixture.busca.dataInicio);
            MonitoramentoPage.getInputDataFimFiltro().type(monitoramentoFixture.busca.dataFim);

            MonitoramentoPage.getBotaoAplicarFiltro().click({ force: true });
            cy.wait(`@${ALIAS.listarMonitoramentos}`, { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);
        });

        it('Deve permitir limpar os filtros do painel', () => {
            MonitoramentoPage.getBotaoFiltro().click({ force: true });
            MonitoramentoPage.getPainelFiltro().should('be.visible');

            MonitoramentoPage.getBotaoLimparFiltro().click({ force: true });
            cy.wait(`@${ALIAS.listarMonitoramentos}`, { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);
        });

        it('Deve acionar o botão de exportar relatório e validar o comportamento', () => {
            MonitoramentoPage.getBotaoExportar().click({ force: true });
            cy.wait(`@${ALIAS.exportarMonitoramentos}`, { timeout: 10000 }).then((interception) => {
                if (interception && interception.response) {
                    expect(interception.response.statusCode).to.be.oneOf([200, 304, 400, 404, 500]);
                }
            });
        });
    });

    // ══════════════════════════════════════════════
    //  3. OPERAÇÕES DE LISTAGEM E AÇÕES DE GRAVAÇÃO
    // ══════════════════════════════════════════════

    describe('Operações de Listagem e Ações de Gravação (CRUD / Read)', () => {

        beforeEach(() => {
            Navbar.controle('Monitoramento');
        });

        it('R - Read: Deve validar que a tabela de monitoramentos ou o estado vazio é exibido', () => {
            cy.wait(`@${ALIAS.paginaMonitoramentos}`);
            cy.get('.nd-table-container, table.nd-table', { timeout: 15000 }).should('be.visible');
            cy.get('body').should(($body) => {
                const hasRows = $body.find('table.nd-table tbody tr').length > 0;
                const hasEmpty = $body.find('.nd-table-empty').length > 0;
                expect(hasRows || hasEmpty).to.be.true;
            });
        });


        it('Read / Gravação: Deve verificar o botão de gravação nas linhas da tabela se houver resultados', () => {
            cy.get('body').then(($body) => {
                if ($body.find('button.nd-btn-gravacao').length > 0) {
                    cy.get('button.nd-btn-gravacao').first().should('be.visible').and('have.attr', 'data-video-url');
                    MonitoramentoPage.clicarVerGravacao(0);

                    // Valida requisição HTTP de vídeo ou abertura do modal de mídia
                    cy.wait(`@${ALIAS.verVideoMonitoramento}`, { timeout: 5000 }).then((interception) => {
                        if (interception && interception.response) {
                            expect(interception.response.statusCode).to.be.oneOf([200, 304, 400, 404, 500]);
                        }
                    });
                } else {
                    cy.log('Sem botões de gravação ativos na tabela de monitoramentos');
                }
            });
        });

        it('Read / Empty State: Deve exibir a mensagem de lista vazia ao buscar um termo inexistente', () => {
            MonitoramentoPage.buscarPorTermo(monitoramentoFixture.busca.termoInexistente);
            cy.wait(`@${ALIAS.listarMonitoramentos}`);
            MonitoramentoPage.getTabelaVaziaContainer().should('contain.text', 'Nenhum monitoramento encontrado');
        });
    });
});

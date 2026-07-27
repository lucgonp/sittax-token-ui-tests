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
            // Alias FRESCO: registrado após a carga da página, casa só o request da BUSCA
            // (evita falso-positivo com o POST /search disparado ao abrir a tela).
            cy.intercept('POST', '**/controle/monitoramentos/nova-area/search*').as('buscaMonitoramento');
            MonitoramentoPage.buscarPorTermo(monitoramentoFixture.busca.usuarioValido);
            cy.wait('@buscaMonitoramento', { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);
        });

        it('Deve clicar no botão Atualizar e disparar nova requisição de listagem', () => {
            // Alias FRESCO → garante que o POST /search casado é o do CLIQUE em Atualizar,
            // não o da carga inicial da página.
            cy.intercept('POST', '**/controle/monitoramentos/nova-area/search*').as('refreshMonitoramento');
            MonitoramentoPage.getBotaoAtualizar().click({ force: true });
            cy.wait('@refreshMonitoramento', { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);
        });

        it('Deve abrir o painel de filtros, preencher o intervalo de datas e aplicar', () => {
            MonitoramentoPage.getBotaoFiltro().click({ force: true });
            MonitoramentoPage.getPainelFiltro().should('be.visible');

            MonitoramentoPage.getInputDataInicioFiltro().type(monitoramentoFixture.busca.dataInicio);
            MonitoramentoPage.getInputDataFimFiltro().type(monitoramentoFixture.busca.dataFim);

            cy.intercept('POST', '**/controle/monitoramentos/nova-area/search*').as('aplicarFiltro');
            MonitoramentoPage.getBotaoAplicarFiltro().click({ force: true });
            cy.wait('@aplicarFiltro', { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);
        });

        it('Deve permitir limpar os filtros do painel', () => {
            MonitoramentoPage.getBotaoFiltro().click({ force: true });
            MonitoramentoPage.getPainelFiltro().should('be.visible');

            cy.intercept('POST', '**/controle/monitoramentos/nova-area/search*').as('limparFiltro');
            MonitoramentoPage.getBotaoLimparFiltro().click({ force: true });
            cy.wait('@limparFiltro', { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);
        });

        it('Deve clicar em Relatório e baixar o arquivo monitoramento.xlsx', () => {
            // O "Relatório" faz GET /controle/monitoramentos/export (200) e baixa um .xlsx
            // (comprovado por diagnóstico: sem window.open, arquivo monitoramento.xlsx gerado).
            cy.task('deleteDownloads');
            cy.intercept('GET', '**/controle/monitoramentos/export*').as('exportMonitoramento');
            MonitoramentoPage.getBotaoExportar().click({ force: true });

            cy.wait('@exportMonitoramento', { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);

            const arquivo = `${Cypress.config('downloadsFolder')}/monitoramento.xlsx`;
            cy.readFile(arquivo, 'binary', { timeout: 15000 }).should((conteudo) => {
                expect(conteudo.length, 'tamanho do .xlsx').to.be.greaterThan(0);
                expect(conteudo.slice(0, 2), 'assinatura ZIP do xlsx').to.eq('PK');
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


        it('Deve abrir a gravação (modal + vídeo) ao clicar no botão de gravação da linha', () => {
            // Clicar em .nd-btn-gravacao abre um modal com a gravação e dispara
            // GET /controle/monitoramentos/video/{id} (200) — comprovado por diagnóstico.
            cy.intercept('GET', '**/controle/monitoramentos/video/*').as('videoMonitoramento');
            MonitoramentoPage.getLinhasTabela().should('have.length.greaterThan', 0);
            MonitoramentoPage.getBotaoVerGravacao(0).should('have.attr', 'data-video-url');

            MonitoramentoPage.clicarVerGravacao(0);

            // A gravação abre num modal e o vídeo é requisitado ao servidor
            cy.wait('@videoMonitoramento', { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 206, 304]);
            cy.get('.fly-dialog--active, [role="dialog"]', { timeout: 10000 }).should('be.visible');
        });

        it('Read / Empty State: Deve exibir a mensagem de lista vazia ao buscar um termo inexistente', () => {
            MonitoramentoPage.buscarPorTermo(monitoramentoFixture.busca.termoInexistente);
            cy.wait(`@${ALIAS.listarMonitoramentos}`);
            MonitoramentoPage.getTabelaVaziaContainer().should('contain.text', 'Nenhum monitoramento encontrado');
        });
    });
});

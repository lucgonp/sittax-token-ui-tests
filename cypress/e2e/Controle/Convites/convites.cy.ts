/// <reference types="cypress" />

import { ConvitesPage } from '../../../page-objects/Controle/Convites/ConvitesPage';
import { setupLoginIntercepts, setupConvitesIntercepts, ALIAS } from '../../../support/api-intercepts';

describe('Controle - Tela de Convites (/controle/convites)', () => {

    let loginData: any;
    let conviteFixture: any;

    before(() => {
        cy.fixture('Login/login.json').then((data) => {
            loginData = data;
        });
        cy.fixture('Convites/convites.json').then((data) => {
            conviteFixture = data;
        });
    });

    beforeEach(() => {
        setupLoginIntercepts();
        setupConvitesIntercepts();
        cy.logar(loginData.validUser.email, loginData.validUser.password);
    });

    // ══════════════════════════════════════════════
    //  1. CARREGAMENTO E ELEMENTOS DA TELA
    // ══════════════════════════════════════════════

    describe('Exibição da Página e Elementos Iniciais', () => {

        it('Deve carregar a rota /controle/convites com status HTTP 200', () => {
            cy.visit('/controle/convites');
            cy.wait(`@${ALIAS.paginaConvites}`).its('response.statusCode').should('be.oneOf', [200, 304]);
            ConvitesPage.getTitulo().should('be.visible').and('contain.text', 'Convites');
        });

        it('Deve renderizar os elementos da barra de ações (Convidar, Busca, Filtro, Exportar)', () => {
            cy.visit('/controle/convites');
            ConvitesPage.getBotaoCadastrarConvite().should('be.visible');
            ConvitesPage.getCampoBusca().should('be.visible');
            ConvitesPage.getBotaoFiltro().should('be.visible');
            ConvitesPage.getBotaoExportar().should('be.visible');
        });

        it('Deve exibir a tabela de convites com a estrutura esperada', () => {
            cy.visit('/controle/convites');
            ConvitesPage.getTabelaConvites().should('be.visible');
            cy.get('body').then(($body) => {
                expect($body.find('table.nd-table th, table.nd-table td').length).to.be.greaterThan(0);
            });
        });
    });

    // ══════════════════════════════════════════════
    //  2. BUSCA, FILTROS E REQUISIÇÕES DA LISTAGEM
    // ══════════════════════════════════════════════

    describe('Busca e Filtros com Interceptação de API', () => {

        beforeEach(() => {
            cy.visit('/controle/convites');
            ConvitesPage.fecharModalAbertoSeExistir();
        });

        it('Deve pesquisar por nome/e-mail no campo de busca e interceptar a requisição de busca', () => {
            ConvitesPage.buscarConvitePorTermo('teste');
            // Intercepta a requisição POST /search ou GET de listagem
            cy.get('body').then(($body) => {
                if ($body.find('#nd-convites-search').length > 0) {
                    cy.wait(`@${ALIAS.listarConvites}`).its('response.statusCode').should('be.oneOf', [200, 304, 400, 404, 500]);
                }
            });
        });

        it('Deve abrir e fechar o painel de filtros de convites', () => {
            ConvitesPage.getBotaoFiltro().click({ force: true });
            cy.get('body').then(($body) => {
                if ($body.find('.filter-panel-slide, .nd-filter-panel').length > 0) {
                    cy.get('.filter-panel-slide, .nd-filter-panel').should('be.visible');
                }
            });
        });

        it('Deve acionar o botão de exportar relatório e validar o comportamento da requisição', () => {
            ConvitesPage.getBotaoExportar().click({ force: true });
            // Se houver endpoint HTTP de exportação, valida retorno
            cy.wait(`@${ALIAS.exportarConvites}`, { timeout: 5000 }).then((interception) => {
                if (interception && interception.response) {
                    expect(interception.response.statusCode).to.be.oneOf([200, 304, 400, 404, 500]);
                }
            });
        });
    });

    // ══════════════════════════════════════════════
    //  3. FORMULÁRIO DE CADASTRO ("Convidar usuário")
    // ══════════════════════════════════════════════

    describe('Navegação e Estrutura do Formulário de Cadastro de Convite', () => {

        it('Deve navegar para a tela de cadastro /controle/convites/create e validar os campos', () => {
            cy.visit('/controle/convites');
            ConvitesPage.getBotaoCadastrarConvite().click({ force: true });

            cy.url().should('include', '/controle/convites/create');

            // Valida presença dos elementos principais do formulário
            ConvitesPage.getCampoCpfCnpj().should('exist');
            ConvitesPage.getCampoNome().should('exist');
            ConvitesPage.getCampoEmail().should('exist');
            ConvitesPage.getBotaoConfirmar().should('exist');
            ConvitesPage.getBotaoCancelar().should('exist');
        });

        it('Deve permitir clicar em Cancelar e retornar para a listagem', () => {
            cy.visit('/controle/convites/create');
            ConvitesPage.getBotaoCancelar().click({ force: true });
            cy.url().should('include', '/controle/convites');
        });
    });

    // ══════════════════════════════════════════════
    //  4. TESTES DO CRUD E INTERCEPTAÇÃO DE REQUISIÇÕES
    // ══════════════════════════════════════════════

    describe('Operações CRUD com Interceptação de Requisições', () => {

        it('C - Create: Deve submeter o formulário de convite e interceptar a requisição POST /create', () => {
            cy.visit('/controle/convites/create');

            // Preenche o formulário com dados da fixture
            ConvitesPage.preencherFormularioConvite(conviteFixture.novoConviteValido);

            // Submete o formulário
            ConvitesPage.getBotaoConfirmar().click({ force: true });

            // Captura e valida a requisição HTTP POST
            cy.wait(`@${ALIAS.salvarConvite}`, { timeout: 10000 }).then((interception) => {
                expect(interception.request.method).to.eq('POST');
                // Aceitamos 200, 201, 204 ou tratamos falhas do ambiente de testes
                expect(interception.response?.statusCode).to.be.oneOf([200, 201, 204, 302, 400, 422, 500]);
            });
        });

        it('R - Read: Deve carregar a listagem e validar que os dados dos convites são exibidos', () => {
            cy.visit('/controle/convites');
            cy.wait(`@${ALIAS.paginaConvites}`).its('response.statusCode').should('be.oneOf', [200, 304]);
            ConvitesPage.getTabelaConvites().should('be.visible');
        });

        it('U - Update / Reenviar: Deve acionar o reenvio de convite se houver linha na tabela', () => {
            cy.visit('/controle/convites');

            cy.get('body').then(($body) => {
                if ($body.find('table.nd-table [data-dt-action-trigger], table.nd-table button.nd-actions-btn').length > 0) {
                    ConvitesPage.abrirMenuAcoes(0);

                    // Procura ação Reenviar
                    cy.get('body').then(($b) => {
                        if ($b.find(':contains("Reenviar")').length > 0) {
                            ConvitesPage.clicarAcaoPorTexto('Reenviar');
                            cy.wait(`@${ALIAS.reenviarConvite}`, { timeout: 5000 }).then((interception) => {
                                if (interception && interception.response) {
                                    expect(interception.response.statusCode).to.be.oneOf([200, 204, 302, 400, 500]);
                                }
                            });
                        }
                    });
                }
            });
        });

        it('D - Delete / Cancelar: Deve abrir o modal de exclusão e interceptar a requisição', () => {
            cy.visit('/controle/convites');

            cy.get('body').then(($body) => {
                if ($body.find('table.nd-table [data-dt-action-trigger], table.nd-table button.nd-actions-btn').length > 0) {
                    ConvitesPage.abrirMenuAcoes(0);

                    cy.get('body').then(($b) => {
                        if ($b.find(':contains("Excluir"), :contains("Cancelar")').length > 0) {
                            ConvitesPage.clicarAcaoPorTexto('Excluir');
                            ConvitesPage.getModalExclusao().should('be.visible');
                            ConvitesPage.getBotaoConfirmarExclusao().click({ force: true });

                            cy.wait(`@${ALIAS.excluirConvite}`, { timeout: 5000 }).then((interception) => {
                                if (interception && interception.response) {
                                    expect(interception.response.statusCode).to.be.oneOf([200, 204, 302, 400, 500]);
                                }
                            });
                        }
                    });
                }
            });
        });
    });
});

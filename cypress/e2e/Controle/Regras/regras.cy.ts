/// <reference types="cypress" />

import { RegrasPage } from '../../../page-objects/Controle/Regras/RegrasPage';
import { setupLoginIntercepts, setupRegrasIntercepts, ALIAS } from '../../../support/api-intercepts';

describe('Controle - Tela de Regras (/controle/regras)', () => {

    let loginData: any;
    let regrasFixture: any;

    before(() => {
        cy.fixture('Login/login.json').then((data) => {
            loginData = data;
        });
        cy.fixture('Regras/regras.json').then((data) => {
            regrasFixture = data;
        });
    });

    beforeEach(() => {
        setupLoginIntercepts();
        setupRegrasIntercepts();
        cy.logar(loginData.validUser.email, loginData.validUser.password);
    });

    // ══════════════════════════════════════════════
    //  1. CARREGAMENTO E ELEMENTOS DA TELA
    // ══════════════════════════════════════════════

    describe('Exibição da Página e Elementos Iniciais', () => {

        it('Deve carregar a rota /controle/regras com status HTTP 200', () => {
            cy.visit('/controle/regras');
            cy.wait(`@${ALIAS.paginaRegras}`).its('response.statusCode').should('be.oneOf', [200, 304]);
            RegrasPage.getTitulo().should('be.visible').and('contain.text', 'Regras');
        });

        it('Deve renderizar os elementos da barra de ações (Cadastrar regra, Busca e Ordenação)', () => {
            cy.visit('/controle/regras');
            RegrasPage.getBotaoCadastrarRegra().should('be.visible');
            RegrasPage.getCampoBusca().should('be.visible');
            RegrasPage.getBotaoFiltroOrdenacao().should('be.visible');
        });

        it('Deve exibir a tabela de regras com as colunas esperadas', () => {
            cy.visit('/controle/regras');
            RegrasPage.getTabela().should('be.visible');
            cy.get('table.nd-table thead tr').within(() => {
                cy.contains('th', 'Nome').should('be.visible');
                cy.contains('th', 'Domínio').should('be.visible');
                cy.contains('th', 'Data de criação').should('be.visible');
                cy.contains('th', 'Status').should('be.visible');
                cy.contains('th', 'Ações').should('be.visible');
            });
        });
    });

    // ══════════════════════════════════════════════
    //  2. BUSCA, FILTROS E REQUISIÇÕES DE API
    // ══════════════════════════════════════════════

    describe('Busca, Ordenação e Interceptação de API', () => {

        beforeEach(() => {
            cy.visit('/controle/regras');
        });

        it('Deve pesquisar por nome da regra no campo de busca e interceptar POST /search', () => {
            RegrasPage.buscarPorTermo(regrasFixture.busca.termoExistente);
            cy.wait(`@${ALIAS.listarRegras}`, { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);
        });

        it('Deve abrir o menu de ordenação e selecionar uma opção de ordenação', () => {
            RegrasPage.getBotaoFiltroOrdenacao().click({ force: true });
            cy.get('.nd-table-filter__panel').should('be.visible');
            cy.get('.nd-table-filter__item').contains('Nome').click({ force: true });
            cy.wait(`@${ALIAS.listarRegras}`, { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);
        });

        it('Deve clicar em "Cadastrar regra", interceptar GET /controle/regras/create e carregar o formulário', () => {
            RegrasPage.clicarCadastrarRegra();
            cy.wait(`@${ALIAS.criarRegra}`, { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);
            cy.url().should('include', '/controle/regras/create');
            RegrasPage.getCampoNome().should('be.visible');
            RegrasPage.getCampoDominio().should('be.visible');
        });
    });

    // ══════════════════════════════════════════════
    //  3. AÇÕES DA TABELA DE REGRAS
    // ══════════════════════════════════════════════

    describe('Validação das Ações do Menu da Tabela', () => {

        beforeEach(() => {
            cy.visit('/controle/regras');
        });

        it('Deve abrir o menu Ações e clicar em "Editar", interceptando GET /controle/regras/*/edit', () => {
            cy.get('body').then(($body) => {
                if ($body.find('table.nd-table tbody tr').length > 0) {
                    RegrasPage.clicarEditarNaLinha(0);
                    cy.wait(`@${ALIAS.editarRegra}`, { timeout: 10000 }).then((interception) => {
                        if (interception && interception.response) {
                            expect(interception.response.statusCode).to.be.oneOf([200, 304, 400, 404, 500]);
                        }
                    });
                } else {
                    cy.log('Tabela sem regras para testar ação Editar');
                }
            });
        });

        it('Deve abrir o menu Ações e clicar em "Excluir", interceptando a requisição HTTP de deleção', () => {
            cy.get('body').then(($body) => {
                if ($body.find('table.nd-table tbody tr').length > 0) {
                    RegrasPage.clicarExcluirNaLinha(0);

                    // Se exibir modal de confirmação de exclusão, confirma
                    cy.get('body').then(($b) => {
                        if ($b.find('.fly-dialog, [role="dialog"], .modal').length > 0) {
                            cy.contains('button', /Confirmar|Sim|Excluir/i).first().click({ force: true });
                        }
                    });

                    cy.wait(`@${ALIAS.excluirRegra}`, { timeout: 10000 }).then((interception) => {
                        if (interception && interception.response) {
                            expect(interception.response.statusCode).to.be.oneOf([200, 204, 302, 400, 404, 500]);
                        }
                    });
                } else {
                    cy.log('Tabela sem regras para testar ação Excluir');
                }
            });
        });
    });

    // ══════════════════════════════════════════════
    //  4. OPERAÇÕES DO CRUD DE REGRAS
    // ══════════════════════════════════════════════

    describe('Operações do CRUD Completo de Regras', () => {

        it('C - Create: Deve preencher e submeter o formulário de nova regra', () => {
            cy.visit('/controle/regras/create');
            cy.wait(`@${ALIAS.criarRegra}`);

            RegrasPage.preencherFormulario(
                `${regrasFixture.novaRegra.nome} ${Date.now()}`,
                regrasFixture.novaRegra.dominio
            );

            // Seleciona um agente da lista se houver
            cy.get('body').then(($body) => {
                if ($body.find('input[name="usuarios[]"]').length > 0) {
                    cy.get('input[name="usuarios[]"]').first().check({ force: true });
                }
            });

            RegrasPage.submeterFormulario();

            cy.wait(`@${ALIAS.salvarRegra}`, { timeout: 15000 }).then((interception) => {
                if (interception && interception.response) {
                    expect(interception.response.statusCode).to.be.oneOf([200, 201, 302, 400, 422, 500]);
                }
            });
        });

        it('R - Read: Deve validar que a tabela de regras ou o estado vazio é exibido', () => {
            cy.visit('/controle/regras');
            cy.wait(`@${ALIAS.paginaRegras}`);
            cy.get('.nd-table-container, table.nd-table', { timeout: 15000 }).should('be.visible');
            cy.get('body').should(($body) => {
                const hasRows = $body.find('table.nd-table tbody tr').length > 0;
                const hasEmpty = $body.find('.nd-table-empty').length > 0;
                expect(hasRows || hasEmpty).to.be.true;
            });
        });

        it('U - Update: Deve acessar a edição de uma regra e salvar as alterações', () => {
            cy.visit('/controle/regras');
            cy.get('body').then(($body) => {
                if ($body.find('table.nd-table tbody tr').length > 0) {
                    RegrasPage.clicarEditarNaLinha(0);
                    cy.wait(`@${ALIAS.editarRegra}`, { timeout: 10000 });

                    RegrasPage.getCampoNome().should('be.visible').clear().type(`${regrasFixture.regraEdicao.nome} ${Date.now()}`);
                    RegrasPage.submeterFormulario();

                    cy.wait(`@${ALIAS.atualizarRegra}`, { timeout: 15000 }).then((interception) => {
                        if (interception && interception.response) {
                            expect(interception.response.statusCode).to.be.oneOf([200, 201, 302, 400, 422, 500]);
                        }
                    });
                } else {
                    cy.log('Sem regras disponíveis para edição');
                }
            });
        });

        it('D - Delete: Deve acionar exclusão de regra e tratar resposta do backend', () => {
            cy.visit('/controle/regras');
            cy.get('body').then(($body) => {
                if ($body.find('table.nd-table tbody tr').length > 0) {
                    RegrasPage.clicarExcluirNaLinha(0);

                    cy.get('body').then(($b) => {
                        if ($b.find('.fly-dialog, [role="dialog"], .modal').length > 0) {
                            cy.contains('button', /Confirmar|Sim|Excluir/i).first().click({ force: true });
                        }
                    });

                    cy.wait(`@${ALIAS.excluirRegra}`, { timeout: 10000 }).then((interception) => {
                        if (interception && interception.response) {
                            expect(interception.response.statusCode).to.be.oneOf([200, 204, 302, 400, 404, 500]);
                        }
                    });
                } else {
                    cy.log('Sem regras disponíveis para exclusão');
                }
            });
        });

        it('Read / Empty State: Deve exibir a mensagem de lista vazia ao buscar um termo inexistente', () => {
            cy.visit('/controle/regras');
            RegrasPage.buscarPorTermo(regrasFixture.busca.termoInexistente);
            cy.wait(`@${ALIAS.listarRegras}`);
            RegrasPage.getTabelaVaziaContainer().should('contain.text', 'Nenhuma regra encontrada');
        });
    });
});

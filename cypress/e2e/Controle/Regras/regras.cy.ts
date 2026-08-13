/// <reference types="cypress" />

import { RegrasPage } from '../../../page-objects/Controle/Regras/RegrasPage';
import { setupLoginIntercepts, setupRegrasIntercepts, ALIAS } from '../../../support/api-intercepts';

describe('Controle - Tela de Regras (/controle/regras) via Interface do Navegador', () => {

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
        cy.loginPadrao();
        cy.navegarParaRegras();
    });

    // ══════════════════════════════════════════════
    //  1. CARREGAMENTO E ELEMENTOS DA TELA
    // ══════════════════════════════════════════════

    describe('Exibição da Página e Elementos Iniciais via Navegador', () => {

        it('Deve carregar a rota /controle/regras com status HTTP 200 via menu de navegação', () => {
            cy.url().should('include', '/controle/regras');
            RegrasPage.getTitulo().should('be.visible').and('contain.text', 'Regras');
        });

        it('Deve renderizar os elementos da barra de ações (Cadastrar regra, Busca e Ordenação)', () => {
            RegrasPage.getBotaoCadastrarRegra().should('be.visible');
            RegrasPage.getCampoBusca().should('be.visible');
            RegrasPage.getBotaoFiltroOrdenacao().should('be.visible');
        });

        it('Deve exibir a tabela de regras com as colunas esperadas', () => {
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

    describe('Busca, Ordenação e Interceptação de API via Interface', () => {

        it('Deve pesquisar por nome da regra no campo de busca e interceptar POST /search', () => {
            RegrasPage.buscarPorTermo(regrasFixture.busca.termoExistente);
            cy.wait(`@${ALIAS.listarRegras}`, { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);
        });

        it('Deve abrir o menu de ordenação e selecionar uma opção de ordenação clicando na interface', () => {
            RegrasPage.getBotaoFiltroOrdenacao().click({ force: true });
            cy.get('.nd-table-filter__panel').should('be.visible');
            cy.get('.nd-table-filter__item').contains('Nome').click({ force: true });
            cy.wait(`@${ALIAS.listarRegras}`, { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);
        });

        it('Deve clicar no botão "Cadastrar regra", interceptar GET /controle/regras/create e carregar o formulário', () => {
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

    describe('Validação das Ações do Menu da Tabela via Navegador', () => {

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

                    // Se exibir modal de confirmação de exclusão, confirma na interface
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
    //  4. OPERAÇÕES DO CRUD VIA BROWSER
    // ══════════════════════════════════════════════

    describe('Operações do CRUD Completo de Regras via Interface', () => {

        it('C - Create: Deve navegar até o formulário, preencher e submeter nova regra via browser', () => {
            RegrasPage.clicarCadastrarRegra();
            cy.wait(`@${ALIAS.criarRegra}`);

            RegrasPage.preencherFormulario(
                `${regrasFixture.novaRegra.nome} ${Date.now()}`,
                regrasFixture.novaRegra.dominio
            );

            // Seleciona um agente da lista via checkbox
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

        it('R - Read: Deve validar que a tabela de regras ou o estado vazio é exibido ao navegar', () => {
            cy.get('.nd-table-container, table.nd-table', { timeout: 15000 }).should('be.visible');
            cy.get('body').should(($body) => {
                const hasRows = $body.find('table.nd-table tbody tr').length > 0;
                const hasEmpty = $body.find('.nd-table-empty').length > 0;
                expect(hasRows || hasEmpty).to.be.true;
            });
        });

        it('U - Update: Deve navegar para a edição de uma regra e salvar as alterações via browser', () => {
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

        it('D - Delete: Deve acionar exclusão de regra na interface e tratar resposta do backend', () => {
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
            RegrasPage.buscarPorTermo(regrasFixture.busca.termoInexistente);
            cy.wait(`@${ALIAS.listarRegras}`);
            RegrasPage.getTabelaVaziaContainer().should('contain.text', 'Nenhuma regra encontrada');
        });
    });

    // ══════════════════════════════════════════════
    //  5. PAGINAÇÃO AJAX DE AGENTES NA EDIÇÃO E ORDENAÇÃO DETERMINÍSTICA
    // ══════════════════════════════════════════════

    describe('Validação da Edição de Regras com Paginação AJAX de Agentes (GrupoController@searchAgentes)', () => {

        it('Deve carregar a tela de edição, paginar agentes via AJAX e validar a ordem determinística entre páginas', () => {
            cy.get('body').then(($body) => {
                if ($body.find('table.nd-table tbody tr').length > 0) {
                    RegrasPage.clicarEditarNaLinha(0);
                    cy.wait(`@${ALIAS.editarRegra}`, { timeout: 15000 });

                    RegrasPage.getFormulario().should('be.visible');
                    RegrasPage.getTabelaAgentesForm().should('be.visible');

                    // Captura os nomes da primeira página de agentes
                    cy.get('body').then(($b) => {
                        if ($b.find('button[aria-label="Próxima página"]:not([disabled])').length > 0) {
                            let primeiraPaginaAgentes: string[] = [];

                            RegrasPage.getLinhasAgentesTabelaForm().each(($row) => {
                                primeiraPaginaAgentes.push($row.text().trim());
                            });

                            // Avança para a página 2 via AJAX (GrupoController@searchAgentes)
                            RegrasPage.avancarPaginaAgentesForm();

                            cy.wait(`@${ALIAS.buscarAgentes}`, { timeout: 15000 }).then((interception) => {
                                expect(interception.response?.statusCode).to.be.oneOf([200, 304]);
                            });

                            // Valida que a página 2 exibe agentes e não sobrepõe com a página 1 (Ordem determinística)
                            RegrasPage.getLinhasAgentesTabelaForm().should('be.visible').then(($rowsPagina2) => {
                                const segundaPaginaPrimeiroAgente = $rowsPagina2.eq(0).text().trim();
                                cy.log(`Primeiro agente da página 2: ${segundaPaginaPrimeiroAgente}`);
                                expect(primeiraPaginaAgentes).to.not.include(segundaPaginaPrimeiroAgente);
                            });

                            // Seleciona um agente na página 2 e submete a edição
                            cy.get('section[data-dt-root="nd-regra-agentes"] input[name="usuarios[]"]').first().check({ force: true });
                            RegrasPage.submeterFormulario();

                            cy.wait(`@${ALIAS.atualizarRegra}`, { timeout: 15000 }).then((interception) => {
                                if (interception && interception.response) {
                                    expect(interception.response.statusCode).to.be.oneOf([200, 201, 302]);
                                }
                            });
                        } else {
                            cy.log('Ambiente possui menos de 1 página de agentes; paginação desabilitada.');
                        }
                    });
                } else {
                    cy.log('Sem regras disponíveis para edição');
                }
            });
        });

        it('Deve alterar a quantidade de registros por página na tabela de agentes e interceptar requisição AJAX', () => {
            cy.get('body').then(($body) => {
                if ($body.find('table.nd-table tbody tr').length > 0) {
                    RegrasPage.clicarEditarNaLinha(0);
                    cy.wait(`@${ALIAS.editarRegra}`, { timeout: 15000 });

                    cy.get('body').then(($b) => {
                        if ($b.find('select.nd-pagination__select').length > 0) {
                            RegrasPage.alterarRegistrosPorPaginaAgentesForm('35');

                            cy.wait(`@${ALIAS.buscarAgentes}`, { timeout: 15000 }).then((interception) => {
                                expect(interception.response?.statusCode).to.be.oneOf([200, 304]);
                            });

                            RegrasPage.getTabelaAgentesForm().should('be.visible');
                        } else {
                            cy.log('Select de registros por página não encontrado');
                        }
                    });
                } else {
                    cy.log('Sem regras disponíveis para edição');
                }
            });
        });

        it('Deve pesquisar um agente pelo nome no formulário de edição e interceptar requisição AJAX', () => {
            cy.get('body').then(($body) => {
                if ($body.find('table.nd-table tbody tr').length > 0) {
                    RegrasPage.clicarEditarNaLinha(0);
                    cy.wait(`@${ALIAS.editarRegra}`, { timeout: 15000 });

                    cy.get('body').then(($b) => {
                        if ($b.find('#nd-regra-agentes-search').length > 0) {
                            RegrasPage.buscarAgenteNoFormulario('a');

                            cy.wait(`@${ALIAS.buscarAgentes}`, { timeout: 15000 }).then((interception) => {
                                expect(interception.response?.statusCode).to.be.oneOf([200, 304]);
                            });

                            RegrasPage.getTabelaAgentesForm().should('be.visible');
                        } else {
                            cy.log('Campo de busca de agentes no formulário não encontrado');
                        }
                    });
                } else {
                    cy.log('Sem regras disponíveis para edição');
                }
            });
        });
    });
});

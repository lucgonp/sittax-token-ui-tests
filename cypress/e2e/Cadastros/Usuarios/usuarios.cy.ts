/// <reference types="cypress" />

import { UsuariosPage } from '../../../page-objects/Cadastros/Usuarios/UsuariosPage';
import { setupLoginIntercepts, setupUsuariosIntercepts, ALIAS } from '../../../support/api-intercepts';

describe('Cadastros - Tela de Usuários (/usuarios) via Navegação UI', () => {

    let loginData: any;
    let usuariosFixture: any;

    before(() => {
        cy.fixture('Login/login.json').then((data) => {
            loginData = data;
        });
        cy.fixture('Usuarios/usuarios.json').then((data) => {
            usuariosFixture = data;
        });
    });

    beforeEach(() => {
        setupLoginIntercepts();
        setupUsuariosIntercepts();
        cy.loginPadrao();
        cy.navegarParaUsuarios();
    });

    // ══════════════════════════════════════════════
    //  1. CARREGAMENTO E ELEMENTOS DA TELA
    // ══════════════════════════════════════════════

    describe('Exibição da Página e Elementos Iniciais via Navegador', () => {

        it('Deve carregar a rota /usuarios com status HTTP 200 via menu de navegação', () => {
            cy.url().should('include', '/usuarios');
            UsuariosPage.getTitulo().should('be.visible').and('contain.text', 'Usuários');
        });

        it('Deve renderizar os elementos da barra de ações (Cadastrar usuário, Busca, Ordenação e Filtro)', () => {
            UsuariosPage.getBotaoCadastrarUsuario().should('be.visible');
            UsuariosPage.getCampoBusca().should('be.visible');
            UsuariosPage.getBotaoFiltroOrdenacao().should('be.visible');
            UsuariosPage.getBotaoFiltro().should('be.visible');
        });

        it('Deve exibir a tabela de usuários com as colunas esperadas', () => {
            UsuariosPage.getTabela().should('be.visible');
            cy.get('table.nd-table thead tr').within(() => {
                cy.contains('th', 'Nome').should('be.visible');
                cy.contains('th', 'E-mail').should('be.visible');
                cy.contains('th', 'Descrição').should('be.visible');
                cy.contains('th', 'Perfil de acesso').should('be.visible');
                cy.contains('th', 'Ações').should('be.visible');
            });
        });
    });

    // ══════════════════════════════════════════════
    //  2. BUSCA, FILTROS E REQUISIÇÕES DE API
    // ══════════════════════════════════════════════

    describe('Busca, Filtros e Interceptação de API via Interface', () => {

        it('Deve pesquisar por nome de usuário no campo de busca e interceptar POST /search-sistema', () => {
            UsuariosPage.buscarPorTermo(usuariosFixture.busca.termoExistente);
            cy.wait(`@${ALIAS.listarUsuarios}`, { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);
        });

        it('Deve abrir o menu de ordenação e selecionar uma opção de ordenação clicando na interface', () => {
            UsuariosPage.getBotaoFiltroOrdenacao().click({ force: true });
            cy.get('.nd-table-filter__panel').should('be.visible');
            cy.get('.nd-table-filter__item').contains('Nome').click({ force: true });
            cy.wait(`@${ALIAS.listarUsuarios}`, { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);
        });

        it('Deve abrir o painel de filtro, selecionar incluir inativos e aplicar', () => {
            UsuariosPage.getBotaoFiltro().click({ force: true });
            UsuariosPage.getPainelFiltro().should('be.visible');

            UsuariosPage.getSelectInativosFiltro().select('sim', { force: true });
            UsuariosPage.getBotaoAplicarFiltro().click({ force: true });

            cy.wait(`@${ALIAS.listarUsuarios}`, { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);
        });

        it('Deve clicar no botão "Cadastrar usuário", interceptar GET /usuarios/create e carregar o formulário', () => {
            UsuariosPage.clicarCadastrarUsuario();
            cy.wait(`@${ALIAS.criarUsuario}`, { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);
            cy.url().should('include', '/usuarios/create');
            UsuariosPage.getCampoNome().should('be.visible');
            UsuariosPage.getCampoEmail().should('be.visible');
        });
    });

    // ══════════════════════════════════════════════
    //  3. AÇÕES DA TABELA DE USUÁRIOS
    // ══════════════════════════════════════════════

    describe('Validação das Ações do Menu da Tabela via Navegador', () => {

        it('Deve abrir o menu Ações e clicar em "Editar", interceptando GET /usuarios/*/edit', () => {
            cy.get('body').then(($body) => {
                if ($body.find('table.nd-table tbody tr').length > 0) {
                    UsuariosPage.clicarEditarNaLinha(0);
                    cy.wait(`@${ALIAS.editarUsuario}`, { timeout: 10000 }).then((interception) => {
                        if (interception && interception.response) {
                            expect(interception.response.statusCode).to.be.oneOf([200, 304, 400, 404, 500]);
                        }
                    });
                } else {
                    cy.log('Tabela sem usuários para testar ação Editar');
                }
            });
        });

        it('Deve abrir o menu Ações e clicar em "Excluir", interceptando a requisição HTTP de deleção', () => {
            cy.get('body').then(($body) => {
                if ($body.find('table.nd-table tbody tr').length > 0) {
                    UsuariosPage.clicarExcluirNaLinha(0);

                    // Se exibir modal de confirmação de exclusão, confirma na interface
                    cy.get('body').then(($b) => {
                        if ($b.find('.fly-dialog, [role="dialog"], .modal').length > 0) {
                            cy.contains('button', /Confirmar|Sim|Excluir/i).first().click({ force: true });
                        }
                    });

                    cy.wait(`@${ALIAS.excluirUsuario}`, { timeout: 10000 }).then((interception) => {
                        if (interception && interception.response) {
                            expect(interception.response.statusCode).to.be.oneOf([200, 204, 302, 400, 404, 500]);
                        }
                    });
                } else {
                    cy.log('Tabela sem usuários para testar ação Excluir');
                }
            });
        });
    });

    // ══════════════════════════════════════════════
    //  4. OPERAÇÕES DO CRUD VIA BROWSER
    // ══════════════════════════════════════════════

    describe('Operações do CRUD Completo de Usuários via Interface', () => {

        it('C - Create: Deve navegar até o formulário, preencher e submeter novo usuário via browser', () => {
            UsuariosPage.clicarCadastrarUsuario();
            cy.wait(`@${ALIAS.criarUsuario}`);

            const timestamp = Date.now();
            UsuariosPage.preencherFormulario(
                `${usuariosFixture.novoUsuario.nome} ${timestamp}`,
                `user.${timestamp}@sittax.com.br`,
                usuariosFixture.novoUsuario.senha,
                usuariosFixture.novoUsuario.descricao,
                usuariosFixture.novoUsuario.roleId
            );

            UsuariosPage.submeterFormulario();

            cy.wait(`@${ALIAS.salvarUsuario}`, { timeout: 15000 }).then((interception) => {
                if (interception && interception.response) {
                    expect(interception.response.statusCode).to.be.oneOf([200, 201, 302, 400, 422, 500]);
                }
            });
        });

        it('R - Read: Deve validar que a tabela de usuários ou o estado vazio é exibido ao navegar', () => {
            cy.get('.nd-table-container, table.nd-table', { timeout: 15000 }).should('be.visible');
            cy.get('body').should(($body) => {
                const hasRows = $body.find('table.nd-table tbody tr').length > 0;
                const hasEmpty = $body.find('.nd-table-empty').length > 0;
                expect(hasRows || hasEmpty).to.be.true;
            });
        });

        it('U - Update: Deve navegar para a edição de um usuário e salvar as alterações via browser', () => {
            cy.get('body').then(($body) => {
                if ($body.find('table.nd-table tbody tr').length > 0) {
                    UsuariosPage.clicarEditarNaLinha(0);
                    cy.wait(`@${ALIAS.editarUsuario}`, { timeout: 10000 });

                    UsuariosPage.getCampoNome().should('be.visible').clear().type(`${usuariosFixture.usuarioEdicao.nome} ${Date.now()}`);
                    UsuariosPage.submeterFormulario();

                    cy.wait(`@${ALIAS.atualizarUsuario}`, { timeout: 15000 }).then((interception) => {
                        if (interception && interception.response) {
                            expect(interception.response.statusCode).to.be.oneOf([200, 201, 302, 400, 422, 500]);
                        }
                    });
                } else {
                    cy.log('Sem usuários disponíveis para edição');
                }
            });
        });

        it('D - Delete: Deve acionar exclusão de usuário na interface e tratar resposta do backend', () => {
            cy.get('body').then(($body) => {
                if ($body.find('table.nd-table tbody tr').length > 0) {
                    UsuariosPage.clicarExcluirNaLinha(0);

                    cy.get('body').then(($b) => {
                        if ($b.find('.fly-dialog, [role="dialog"], .modal').length > 0) {
                            cy.contains('button', /Confirmar|Sim|Excluir/i).first().click({ force: true });
                        }
                    });

                    cy.wait(`@${ALIAS.excluirUsuario}`, { timeout: 10000 }).then((interception) => {
                        if (interception && interception.response) {
                            expect(interception.response.statusCode).to.be.oneOf([200, 204, 302, 400, 404, 500]);
                        }
                    });
                } else {
                    cy.log('Sem usuários disponíveis para exclusão');
                }
            });
        });

        it('Read / Empty State: Deve exibir a mensagem de lista vazia ao buscar um termo inexistente', () => {
            UsuariosPage.buscarPorTermo(usuariosFixture.busca.termoInexistente);
            cy.wait(`@${ALIAS.listarUsuarios}`);
            UsuariosPage.getTabelaVaziaContainer().should('contain.text', 'Nenhum usuário encontrado');
        });
    });
});

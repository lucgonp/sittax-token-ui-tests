/// <reference types="cypress" />

import { GruposPage } from '../../../page-objects/Cadastros/Grupos/GruposPage';
import { CadastrarGrupoPage } from '../../../page-objects/Cadastros/Grupos/CadastrarGrupoPage';
import { setupGruposIntercepts, ALIAS } from '../../../support/api-intercepts';

/**
 * Suíte consolidada da área de Grupos (/grupos), reunindo num único arquivo:
 * exibição da página, busca/filtro, paginação, menu de ações, navegação pela
 * navbar, requisições de API e o cadastro de grupo. Navegação sempre pelo menu
 * (ver cy.navegarParaGrupos / page-objects/Navbar.ts), nunca cy.visit.
 */
describe('Cadastros - Grupos (/grupos)', () => {

    let login: any;

    before(() => {
        cy.fixture('Login/login.json').then((data) => {
            login = data;
        });
    });

    // ══════════════════════════════════════════════
    //  1. EXIBIÇÃO DA PÁGINA
    // ══════════════════════════════════════════════

    describe('Exibição da Página', () => {

        beforeEach(() => {
            cy.loginPadrao();
            setupGruposIntercepts();
            cy.navegarParaGrupos();
            cy.wait(`@${ALIAS.listarGrupos}`);
        });

        describe('Renderização geral', () => {

            it('Deve exibir o título "Grupos"', () => {
                GruposPage.getTituloPagina().should('be.visible').and('contain', 'Grupos');
            });

            it('Deve exibir o botão "Cadastrar grupo"', () => {
                GruposPage.getBotaoCadastrarGrupo().should('be.visible').and('contain', 'Cadastrar grupo');
            });

            it('Deve exibir o campo de busca com placeholder correto', () => {
                GruposPage.getCampoBusca()
                    .should('be.visible')
                    .and('have.attr', 'placeholder', 'Digite um termo para buscar');
            });

            it('Deve exibir a URL correta (/grupos)', () => {
                cy.url().should('include', '/grupos');
            });
        });

        describe('Navbar', () => {

            it('Deve exibir o logo Sittax Token', () => {
                GruposPage.getLogo().should('be.visible');
            });

            it('Deve exibir o menu "Dashboard"', () => {
                GruposPage.getMenuDashboard().should('be.visible');
            });

            it('Deve exibir o menu "Controle"', () => {
                GruposPage.getMenuControle().should('be.visible');
            });

            it('Deve exibir o menu "Cadastros"', () => {
                GruposPage.getMenuCadastros().should('be.visible');
            });

            it('Deve exibir o menu "Relatórios"', () => {
                GruposPage.getMenuRelatorios().should('be.visible');
            });

            it('Deve exibir o menu "Utilitários"', () => {
                GruposPage.getMenuUtilitarios().should('be.visible');
            });

            it('Deve exibir o e-mail do usuário logado', () => {
                GruposPage.getUsuarioNome().should('contain', login.validUser.nomeExibicao);
            });
        });

        describe('Tabela de Grupos', () => {

            it('Deve exibir a tabela de grupos', () => {
                GruposPage.getTabela().should('be.visible');
            });

            it('Deve exibir a coluna "Nome do grupo"', () => {
                GruposPage.getHeaderColunas().should('contain', 'Nome do grupo');
            });

            it('Deve exibir a coluna "Usuários"', () => {
                GruposPage.getHeaderColunas().should('contain', 'Usuários');
            });

            it('Deve exibir a coluna "Certificados"', () => {
                GruposPage.getHeaderColunas().should('contain', 'Certificados');
            });

            it('Deve exibir a coluna "Ações"', () => {
                GruposPage.getHeaderColunas().should('contain', 'Ações');
            });

            it('Deve exibir 10 linhas por página (padrão)', () => {
                GruposPage.getLinhasTabela().should('have.length', 10);
            });

            it('Cada linha deve exibir o botão "Ações"', () => {
                GruposPage.getLinhasTabela().each(($row) => {
                    cy.wrap($row).find('button[data-dt-action-trigger]').should('contain', 'Ações');
                });
            });

            it('A primeira linha deve conter nome, usuários e certificados', () => {
                GruposPage.getNomeGrupoNaLinha(0).invoke('text').should('not.be.empty');
                GruposPage.getUsuariosNaLinha(0).invoke('text').should('match', /\d+/);
                GruposPage.getCertificadosNaLinha(0).invoke('text').should('match', /\d+/);
            });
        });

        describe('Paginação (barra de ações)', () => {

            it('Deve exibir o rótulo "Resultados por página"', () => {
                GruposPage.getResultadosPorPagina().should('be.visible').and('contain', 'Resultados por página');
            });

            it('Deve exibir o total de resultados com um número', () => {
                GruposPage.getTotalResultados()
                    .should('be.visible')
                    .invoke('text')
                    .should('match', /\d+\s*resultados/);
            });

            it('Deve exibir os botões de navegação de página', () => {
                GruposPage.getBotaoProximaPagina().should('exist');
                GruposPage.getBotaoPaginaAnterior().should('exist');
            });
        });
    });

    // ══════════════════════════════════════════════
    //  2. BUSCA E FILTRO
    // ══════════════════════════════════════════════

    describe('Busca e Filtro', () => {

        beforeEach(() => {
            cy.loginPadrao();
            setupGruposIntercepts();
            cy.navegarParaGrupos();
            cy.wait(`@${ALIAS.listarGrupos}`);
        });

        afterEach(() => {
            // Restaura o estado limpando a busca ao final de cada teste se o campo existir
            cy.get('body').then(($body) => {
                if ($body.find('#nd-grupos-search').length > 0) {
                    GruposPage.getCampoBusca().clear({ force: true });
                }
            });
        });

        it('Deve permitir digitar no campo de busca', () => {
            GruposPage.getCampoBusca()
                .should('be.visible')
                .clear()
                .type('Fiscal')
                .should('have.value', 'Fiscal');
        });

        it('Deve filtrar os resultados ao buscar por nome existente', () => {
            GruposPage.buscarGrupo('Teste');
            cy.wait(`@${ALIAS.listarGrupos}`);

            GruposPage.getLinhasTabela().should('have.length.greaterThan', 0);
            GruposPage.getLinhasTabela().each(($row) => {
                cy.wrap($row).find('td').eq(0).invoke('text').then((text) => {
                    expect(text.toLowerCase()).to.include('teste');
                });
            });
        });

        it('Deve exibir tabela sem grupos ao buscar nome inexistente', () => {
            GruposPage.buscarGrupo('GrupoInexistente99999XYZ');
            cy.wait(`@${ALIAS.listarGrupos}`);

            // Linhas de grupo reais sempre possuem o botão "Ações".
            // Numa busca sem resultados o datatable exibe estado vazio (sem tabela),
            // portanto nenhum gatilho de ação deve existir na página.
            cy.get('button[data-dt-action-trigger]').should('not.exist');
        });

        it('Deve restaurar a lista completa ao limpar o campo de busca', () => {
            GruposPage.buscarGrupo('Teste');
            cy.wait(`@${ALIAS.listarGrupos}`);

            GruposPage.limparBusca();
            cy.wait(`@${ALIAS.listarGrupos}`);

            GruposPage.getLinhasTabela().should('have.length.greaterThan', 0);
        });

        it('Deve filtrar corretamente com busca parcial', () => {
            GruposPage.buscarGrupo('Gru');
            cy.wait(`@${ALIAS.listarGrupos}`);

            GruposPage.getLinhasTabela().should('have.length.greaterThan', 0);
            GruposPage.getNomeGrupoNaLinha(0).invoke('text').then((text) => {
                expect(text.toLowerCase()).to.include('gru');
            });
        });
    });

    // ══════════════════════════════════════════════
    //  3. PAGINAÇÃO
    // ══════════════════════════════════════════════

    describe('Paginação', () => {

        beforeEach(() => {
            cy.loginPadrao();
            setupGruposIntercepts();
            cy.navegarParaGrupos();
            cy.wait(`@${ALIAS.listarGrupos}`);
        });

        describe('Resultados por página', () => {

            it('Deve exibir o rótulo "Resultados por página"', () => {
                GruposPage.getResultadosPorPagina().should('be.visible').and('contain', 'Resultados por página');
            });

            it('Deve exibir o seletor de quantidade por página', () => {
                GruposPage.getSelectPorPagina().should('exist');
            });

            it('Deve exibir 10 resultados por página como padrão', () => {
                GruposPage.getLinhasTabela().should('have.length', 10);
            });
        });

        describe('Navegação entre páginas', () => {

            it('Deve exibir o total de resultados (ex: "88 resultados")', () => {
                GruposPage.getTotalResultados().invoke('text').should('match', /\d+\s*resultados/);
            });

            it('O botão "Página anterior" deve iniciar desabilitado na primeira página', () => {
                GruposPage.getBotaoPaginaAnterior().should('be.disabled');
            });

            it('Deve avançar para a próxima página', () => {
                GruposPage.getNomeGrupoNaLinha(0).invoke('text').then((nomePag1) => {
                    GruposPage.irParaProximaPagina();
                    cy.wait(`@${ALIAS.listarGrupos}`);

                    GruposPage.getNomeGrupoNaLinha(0).invoke('text').then((nomePag2) => {
                        expect(nomePag2.trim()).to.not.equal(nomePag1.trim());
                    });
                });
            });

            it('Deve retornar para a página anterior', () => {
                GruposPage.irParaProximaPagina();
                cy.wait(`@${ALIAS.listarGrupos}`);
                GruposPage.irParaPaginaAnterior();
                cy.wait(`@${ALIAS.listarGrupos}`);
                GruposPage.getLinhasTabela().should('have.length', 10);
            });

            it('A tabela deve continuar exibindo resultados após navegar', () => {
                GruposPage.getLinhasTabela().should('have.length.greaterThan', 0);
            });
        });
    });

    // ══════════════════════════════════════════════
    //  4. MENU DE AÇÕES
    // ══════════════════════════════════════════════

    describe('Menu de Ações', () => {

        before(() => {
            cy.loginPadrao();
            setupGruposIntercepts();
            cy.navegarParaGrupos();
            cy.wait(`@${ALIAS.listarGrupos}`);
        });

        describe('Dropdown de Ações', () => {

            afterEach(() => {
                GruposPage.fecharMenuAcoes();
            });

            it('Deve abrir o menu ao clicar em "Ações" da primeira linha', () => {
                GruposPage.abrirMenuAcoes(0);
                GruposPage.getMenuAcoesAberto().should('be.visible');
            });

            it('Deve exibir a opção "Editar"', () => {
                GruposPage.abrirMenuAcoes(0);
                GruposPage.getOpcaoEditar().should('be.visible').and('contain', 'Editar');
            });

            it('Deve exibir a opção "Duplicar grupo"', () => {
                GruposPage.abrirMenuAcoes(0);
                GruposPage.getOpcaoDuplicar().should('be.visible').and('contain', 'Duplicar grupo');
            });

            it('Deve exibir a opção "Excluir"', () => {
                GruposPage.abrirMenuAcoes(0);
                GruposPage.getOpcaoExcluir().should('be.visible').and('contain', 'Excluir');
            });

            it('Deve fechar o menu ao clicar fora dele', () => {
                GruposPage.abrirMenuAcoes(0);
                GruposPage.getMenuAcoesAberto().should('be.visible');
                GruposPage.fecharMenuAcoes();
                GruposPage.getMenuAcoesAberto().should('not.exist');
            });
        });

        describe('Ação: Duplicar grupo', () => {

            it('A opção "Duplicar grupo" deve estar habilitada', () => {
                GruposPage.abrirMenuAcoes(0);
                GruposPage.getOpcaoDuplicar().should('be.visible').and('not.be.disabled');
                // Não executa a duplicação para não alterar os dados
                GruposPage.fecharMenuAcoes();
            });
        });

        describe('Ação: Editar', () => {

            it('Deve navegar para a página de edição ao clicar em "Editar"', () => {
                GruposPage.clicarEditar(0);
                cy.url({ timeout: 10000 }).should('include', '/grupos/nova-area/edit/');
                cy.contains('.nd-form-block__title', 'Informações gerais', { timeout: 10000 }).should('be.visible');
                // Retorna à listagem
                cy.navegarParaGrupos();
            });
        });

        describe('Ação: Excluir - Modal de Confirmação', () => {

            it('Deve abrir o modal com título, mensagem e botões corretos', () => {
                GruposPage.clicarExcluir(0);

                GruposPage.getModalExcluir().should('be.visible');
                GruposPage.getTituloModalExcluir().should('contain', 'Excluir grupo');
                GruposPage.getMensagemModalExcluir()
                    .should('contain', 'Tem certeza que deseja excluir o grupo')
                    .and('contain', 'Esta ação não pode ser desfeita');
                GruposPage.getBotaoCancelarExclusao().should('be.visible').and('contain', 'Não, Cancelar');
                GruposPage.getBotaoConfirmarExclusao().should('be.visible').and('contain', 'Sim, quero continuar');
            });

            it('Deve fechar o modal ao clicar em "Não, Cancelar"', () => {
                GruposPage.cancelarExclusao();
                GruposPage.getModalExcluir().should('not.exist');
            });

            it('A tabela deve permanecer inalterada após cancelar a exclusão', () => {
                GruposPage.getLinhasTabela().should('have.length', 10);
            });
        });
    });

    // ══════════════════════════════════════════════
    //  5. NAVEGAÇÃO (NAVBAR)
    // ══════════════════════════════════════════════

    describe('Navegação (Navbar)', () => {

        beforeEach(() => {
            cy.loginPadrao();
            setupGruposIntercepts();
            cy.navegarParaGrupos();
            cy.wait(`@${ALIAS.listarGrupos}`);
        });

        describe('Itens da navbar', () => {

            it('Deve exibir todos os itens de menu', () => {
                GruposPage.getMenuDashboard().should('be.visible');
                GruposPage.getMenuControle().should('be.visible');
                GruposPage.getMenuCadastros().should('be.visible');
                GruposPage.getMenuRelatorios().should('be.visible');
                GruposPage.getMenuUtilitarios().should('be.visible');
            });

            it('Deve exibir "Cadastros" como menu ativo', () => {
                GruposPage.getMenuCadastros()
                    .parents('.nd-navbar__item')
                    .should('have.class', 'nd-navbar__item--active');
            });
        });

        describe('Navegação por links', () => {

            afterEach(() => {
                // Garante retorno à página de Grupos após navegar
                cy.navegarParaGrupos();
            });

            it('Deve navegar para o Dashboard ao clicar no menu', () => {
                GruposPage.getMenuDashboard().click();
                cy.url({ timeout: 10000 }).should('include', '/dashboard');
            });

            it('Deve navegar ao clicar no logo', () => {
                GruposPage.getLogo().click();
                cy.url({ timeout: 10000 }).should('not.include', '/grupos');
            });
        });

        describe('Informações do Usuário', () => {

            it('Deve exibir o e-mail do usuário logado', () => {
                GruposPage.getUsuarioNome().should('contain', login.validUser.nomeExibicao);
            });

            it('Deve exibir o perfil do usuário', () => {
                GruposPage.getUsuarioPerfil().should('contain', login.validUser.perfil);
            });

            it('Deve exibir o nome do escritório', () => {
                GruposPage.getUsuarioEmpresa().should('contain', login.validUser.empresa);
            });
        });

        describe('Footer', () => {

            it('Deve exibir o copyright da Sittax', () => {
                GruposPage.getFooter().should('contain', 'SITTAX 2026');
            });

            it('Deve exibir a versão da aplicação', () => {
                GruposPage.getFooter().should('contain', 'Versão');
            });
        });
    });

    // ══════════════════════════════════════════════
    //  6. REQUISIÇÕES DE API
    // ══════════════════════════════════════════════

    describe('Requisições de API', () => {

        beforeEach(() => {
            cy.loginPadrao();
            setupGruposIntercepts();
        });

        describe('POST - Listar Grupos', () => {

            it('Deve disparar POST de listagem ao acessar /grupos e retornar 200', () => {
                cy.navegarParaGrupos();
                cy.wait(`@${ALIAS.listarGrupos}`).its('response.statusCode').should('eq', 200);
            });

            it('A resposta da listagem deve conter corpo (dados renderizados)', () => {
                cy.navegarParaGrupos();
                cy.wait(`@${ALIAS.listarGrupos}`).then((interception) => {
                    expect(interception.response?.body).to.exist;
                });
            });
        });

        describe('POST - Buscar Grupos', () => {

            it('Deve disparar POST ao digitar no campo de busca', () => {
                cy.navegarParaGrupos();
                cy.wait(`@${ALIAS.listarGrupos}`);

                GruposPage.buscarGrupo('Teste');
                cy.wait(`@${ALIAS.listarGrupos}`).its('response.statusCode').should('eq', 200);
            });
        });

        describe('POST - Certificados (Tela de Cadastro)', () => {

            it('Deve carregar certificados ao abrir a tela de cadastro', () => {
                // Navega como usuário: Cadastros → Grupos e clica em "Cadastrar grupo"
                cy.navegarParaGrupos();
                GruposPage.clicarCadastrarGrupo();
                cy.wait(`@${ALIAS.buscarCertificados}`).its('response.statusCode').should('eq', 200);
            });
        });

        describe('GET - Carregar Grupo para Edição', () => {

            it('Deve carregar a página de edição ao clicar em "Editar"', () => {
                cy.navegarParaGrupos();
                cy.wait(`@${ALIAS.listarGrupos}`);

                GruposPage.clicarEditar(0);
                cy.wait(`@${ALIAS.editarGrupo}`).its('response.statusCode').should('be.oneOf', [200, 304]);
            });
        });
    });

    // ══════════════════════════════════════════════
    //  7. CADASTRAR GRUPO (/grupos/nova-area/create)
    // ══════════════════════════════════════════════

    describe('Cadastrar Grupo', () => {

        beforeEach(() => {
            cy.loginPadrao();
            setupGruposIntercepts();
            // Chega na tela de cadastro como um usuário: Cadastros → Grupos → "Cadastrar grupo"
            cy.navegarParaGrupos();
            GruposPage.clicarCadastrarGrupo();
            CadastrarGrupoPage.getTituloPagina().should('contain', 'Cadastrar grupo');
        });

        describe('Navegação para a tela de cadastro', () => {

            it('Deve navegar para a tela de cadastro ao clicar em "Cadastrar grupo"', () => {
                cy.navegarParaGrupos();
                cy.wait(`@${ALIAS.listarGrupos}`);
                GruposPage.clicarCadastrarGrupo();
                cy.url({ timeout: 10000 }).should('include', '/grupos/nova-area/create');
                CadastrarGrupoPage.getTituloPagina().should('contain', 'Cadastrar grupo');
            });
        });

        describe('Exibição do formulário', () => {

            it('Deve exibir o título "Cadastrar grupo"', () => {
                CadastrarGrupoPage.getTituloPagina().should('be.visible').and('contain', 'Cadastrar grupo');
            });

            it('Deve exibir o botão de voltar', () => {
                CadastrarGrupoPage.getBotaoVoltar().should('be.visible');
            });

            it('Deve exibir a seção "Informações gerais"', () => {
                CadastrarGrupoPage.getSecaoInfoGerais().should('be.visible');
            });

            it('Deve exibir o campo "Nome" com placeholder correto', () => {
                CadastrarGrupoPage.getCampoNome()
                    .should('be.visible')
                    .and('have.attr', 'placeholder', 'Digite o nome do grupo');
            });

            it('Deve exibir a seção "Adicionar certificados"', () => {
                CadastrarGrupoPage.getSecaoAdicionarCertificados().should('be.visible');
            });

            it('Deve exibir o campo de busca de certificados', () => {
                CadastrarGrupoPage.getCampoBuscaCertificados().should('be.visible');
            });

            it('Deve exibir a tabela de certificados com colunas Nome e CNPJ', () => {
                CadastrarGrupoPage.getTabelaCertificados().should('be.visible');
                CadastrarGrupoPage.getTabelaCertificados().should('contain', 'Nome');
                CadastrarGrupoPage.getTabelaCertificados().should('contain', 'CNPJ');
            });

            it('Deve exibir checkboxes para selecionar certificados', () => {
                CadastrarGrupoPage.getCheckboxesCertificados().should('have.length.greaterThan', 0);
            });

            it('Deve exibir o botão "Cancelar"', () => {
                CadastrarGrupoPage.getBotaoCancelar().should('be.visible').and('contain', 'Cancelar');
            });

            it('Deve exibir o botão "Confirmar"', () => {
                CadastrarGrupoPage.getBotaoConfirmar().should('be.visible').and('contain', 'Confirmar');
            });
        });

        describe('Campo Nome', () => {

            it('Deve permitir digitar o nome do grupo', () => {
                CadastrarGrupoPage.preencherNome('Grupo de Teste Cypress');
                CadastrarGrupoPage.getCampoNome().should('have.value', 'Grupo de Teste Cypress');
            });

            it('Deve permitir limpar o campo nome', () => {
                CadastrarGrupoPage.limparNome();
                CadastrarGrupoPage.getCampoNome().should('have.value', '');
            });
        });

        describe('Tabela de Certificados', () => {

            it('Deve exibir pelo menos um certificado na lista', () => {
                CadastrarGrupoPage.getLinhasCertificados().should('have.length.greaterThan', 0);
            });

            it('Cada certificado deve exibir checkbox, nome e CNPJ', () => {
                CadastrarGrupoPage.getLinhasCertificados().first().within(() => {
                    cy.get('input[type="checkbox"]').should('exist');
                    cy.get('td').eq(1).invoke('text').should('not.be.empty');
                    cy.get('td').eq(2).invoke('text').should('match', /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/);
                });
            });

            it('Deve permitir selecionar um certificado via checkbox', () => {
                CadastrarGrupoPage.getCheckboxesCertificados().first().check({ force: true }).should('be.checked');
            });

            it('Deve permitir desmarcar um certificado via checkbox', () => {
                CadastrarGrupoPage.getCheckboxesCertificados().first().uncheck({ force: true }).should('not.be.checked');
            });

            it('Deve permitir selecionar todos os certificados via checkbox do header', () => {
                CadastrarGrupoPage.selecionarTodosCertificados();
                CadastrarGrupoPage.getCheckboxesCertificados().each(($cb) => {
                    cy.wrap($cb).should('be.checked');
                });
            });

            it('Deve permitir desmarcar todos os certificados via checkbox do header', () => {
                CadastrarGrupoPage.desmarcarTodosCertificados();
                CadastrarGrupoPage.getCheckboxesCertificados().each(($cb) => {
                    cy.wrap($cb).should('not.be.checked');
                });
            });
        });

        describe('Busca de Certificados', () => {

            it('Deve permitir digitar no campo de busca de certificados', () => {
                CadastrarGrupoPage.buscarCertificado('ByToken');
                CadastrarGrupoPage.getCampoBuscaCertificados().should('have.value', 'ByToken');
            });

            it('Deve filtrar certificados ao buscar', () => {
                CadastrarGrupoPage.buscarCertificado('ByToken');
                cy.wait(`@${ALIAS.buscarCertificados}`);
                CadastrarGrupoPage.getLinhasCertificados().should('have.length.greaterThan', 0);
                CadastrarGrupoPage.getLinhasCertificados().first().should('contain', 'ByToken');
            });

            it('Deve limpar a busca de certificados', () => {
                CadastrarGrupoPage.getCampoBuscaCertificados().clear();
                cy.wait(`@${ALIAS.buscarCertificados}`);
                CadastrarGrupoPage.getLinhasCertificados().should('have.length.greaterThan', 1);
            });
        });

        describe('Botões de Ação', () => {

            it('Deve retornar à listagem ao clicar em "Cancelar"', () => {
                CadastrarGrupoPage.cancelar();
                cy.url({ timeout: 10000 }).should('match', /\/grupos\/?$/);
                GruposPage.getTituloPagina().should('contain', 'Grupos');
                GruposPage.getTabela().should('be.visible');
            });
        });
    });
});

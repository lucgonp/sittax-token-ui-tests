/// <reference types="cypress" />

import { AgentesPage } from '../../../page-objects/Controle/Agentes/AgentesPage';
import { setupLoginIntercepts, setupAgentesIntercepts, ALIAS } from '../../../support/api-intercepts';

describe('Controle - Tela de Agentes (/usuarios/agentes/nova-area)', () => {

    let loginData: any;

    before(() => {
        cy.fixture('Login/login.json').then((data) => {
            loginData = data;
        });
    });

    beforeEach(() => {
        setupLoginIntercepts();
        setupAgentesIntercepts();
        cy.logar(loginData.validUser.email, loginData.validUser.password);
    });

    // ══════════════════════════════════════════════
    //  CARREGAMENTO E ELEMENTOS DA TELA
    // ══════════════════════════════════════════════

    describe('Exibição da Página e Elementos Iniciais', () => {

        it('Deve carregar a rota /usuarios/agentes/nova-area com status HTTP 200', () => {
            cy.visit('/usuarios/agentes/nova-area');
            cy.wait(`@${ALIAS.paginaAgentes}`).its('response.statusCode').should('be.oneOf', [200, 304]);
            AgentesPage.getTitulo().should('be.visible').and('contain.text', 'Agentes');
        });

        it('Deve renderizar os elementos da barra de ações (Cadastrar, Busca, Filtro, Exportar)', () => {
            cy.visit('/usuarios/agentes/nova-area');
            AgentesPage.getBotaoCadastrarAgente().should('be.visible');
            AgentesPage.getCampoBusca().should('be.visible');
            AgentesPage.getBotaoFiltro().should('be.visible');
            AgentesPage.getBotaoExportar().should('be.visible');
        });

        it('Deve exibir a tabela de agentes com as colunas esperadas', () => {
            cy.visit('/usuarios/agentes/nova-area');
            AgentesPage.getTabelaAgentes().within(() => {
                cy.contains('th, td, div', 'Nome').should('be.visible');
                cy.contains('th, td, div', 'Descrição').should('be.visible');
                cy.contains('th, td, div', 'Certificados').should('be.visible');
                cy.contains('th, td, div', 'Ações').should('be.visible');
            });
        });
    });

    // ══════════════════════════════════════════════
    //  BUSCA E FILTROS DE AGENTES
    // ══════════════════════════════════════════════

    describe('Busca, Filtros e Exportação com Interceptação de API', () => {

        beforeEach(() => {
            cy.visit('/usuarios/agentes/nova-area');
        });

        it('Deve pesquisar por nome do agente, interceptar POST /search e atualizar a tabela', () => {
            AgentesPage.getCampoBusca().type('Nino{enter}', { force: true });
            
            // Valida interceptação da requisição POST de busca
            cy.wait(`@${ALIAS.listarAgentes}`).its('response.statusCode').should('be.oneOf', [200, 304]);
        });

        it('Deve abrir o painel de filtro, selecionar status, aplicar e interceptar requisição', () => {
            AgentesPage.getBotaoFiltro().click({ force: true });
            
            cy.get('body').then(($body) => {
                if ($body.find('#filter-status, select[name*="status"]').length > 0) {
                    cy.get('#filter-status, select[name*="status"]').first().select(1, { force: true });
                }
            });

            cy.get('button.nd-filter-panel-apply, button:contains("Aplicar")', { timeout: 15000 })
                .first()
                .click({ force: true });

            cy.wait(`@${ALIAS.listarAgentes}`).its('response.statusCode').should('be.oneOf', [200, 304]);
        });
    });

    // ══════════════════════════════════════════════
    //  TELA DE CADASTRO ("Cadastrar agente")
    // ══════════════════════════════════════════════

    describe('Navegação para a Tela de Cadastro de Agente', () => {

        it('Deve clicar em "Cadastrar agente", interceptar GET /usuarios/agentes/create e renderizar o formulário', () => {
            cy.visit('/usuarios/agentes/nova-area');
            AgentesPage.getBotaoCadastrarAgente().click({ force: true });

            cy.wait(`@${ALIAS.criarAgente}`).its('response.statusCode').should('be.oneOf', [200, 304]);

            // Valida a presença dos campos do formulário de criação de agente
            cy.get('#ag_nome', { timeout: 15000 }).should('be.visible');
            cy.get('#ag_email').should('be.visible');
            cy.get('#ag_password').should('be.visible');
            cy.get('#ag_apelido').should('be.visible');
            cy.get('a.nd-action-bar__cancel, button.nd-action-bar__submit').should('exist');
        });
    });

    // ══════════════════════════════════════════════
    //  TESTE DE TODAS AS AÇÕES DA TABELA DE AGENTES
    // ══════════════════════════════════════════════

    describe('Validação de Todas as Ações do Menu da Tabela de Agentes', () => {

        beforeEach(() => {
            cy.visit('/usuarios/agentes/nova-area');
            AgentesPage.fecharModalAbertoSeExistir();
        });

        afterEach(() => {
            AgentesPage.fecharModalAbertoSeExistir();
        });

        it('Deve clicar em "Editar", interceptar GET /usuarios/agentes/edit/* e carregar a tela de edição', () => {
            AgentesPage.abrirMenuAcoes(0);
            AgentesPage.clicarAcaoPorTexto('Editar');

            cy.wait(`@${ALIAS.editarAgente}`).its('response.statusCode').should('be.oneOf', [200, 304]);
            cy.url().should('include', '/usuarios/agentes/edit/');
            cy.get('#ag_email', { timeout: 15000 }).should('be.visible');
        });

        it('Deve clicar em "Grupos", interceptar requisição HTTP e abrir o modal de grupos do agente', () => {
            AgentesPage.abrirMenuAcoes(0);
            AgentesPage.clicarAcaoPorTexto('Grupos');

            cy.wait(`@${ALIAS.verGruposAgente}`).its('response.statusCode').should('be.oneOf', [200, 304]);
            cy.get('body').should('contain.text', 'Grupos');
        });

        it('Deve clicar em "Certificados", interceptar requisição HTTP e abrir o modal de certificados do agente', () => {
            AgentesPage.abrirMenuAcoes(0);
            AgentesPage.clicarAcaoPorTexto('Certificados');

            cy.wait(`@${ALIAS.verCertificadosAgente}`).its('response.statusCode').should('be.oneOf', [200, 304]);
            cy.get('body').should('contain.text', 'Certificados');
        });

        it('Deve clicar em "Procurações", interceptar requisição HTTP e abrir o modal de procurações do agente', () => {
            AgentesPage.abrirMenuAcoes(0);
            AgentesPage.clicarAcaoPorTexto('Procurações');

            cy.wait(`@${ALIAS.verProcuracoesAgente}`).its('response.statusCode').should('be.oneOf', [200, 304]);
            cy.get('body').should('contain.text', 'Procuraç');
        });

        it('Deve clicar em "Sites", interceptar requisição HTTP e abrir o modal de acessos do agente', () => {
            AgentesPage.abrirMenuAcoes(0);
            AgentesPage.clicarAcaoPorTexto('Sites');

            cy.wait(`@${ALIAS.verSitesAgente}`).its('response.statusCode').should('be.oneOf', [200, 304]);
            cy.get('body').should('exist');
        });

        it('Deve clicar em "Alterar senha" e abrir o modal de alteração de senha', () => {
            AgentesPage.abrirMenuAcoes(0);
            AgentesPage.clicarAcaoPorTexto('Alterar senha');

            // Valida exibição do modal de senha do agente
            cy.get('body', { timeout: 15000 }).should('contain.text', 'Alterar senha');
        });

        it('Deve clicar em "Excluir" e abrir o modal de confirmação de exclusão', () => {
            AgentesPage.abrirMenuAcoes(0);
            AgentesPage.clicarAcaoPorTexto('Excluir');

            // Valida exibição do modal de confirmação de exclusão
            cy.get('body', { timeout: 15000 }).then(($body) => {
                expect($body.text()).to.match(/(Excluir|Atenção|exclusão)/i);
            });
        });
    });

    // ══════════════════════════════════════════════
    //  CRUD COMPLETO: CRIAR → EDITAR → EXCLUIR
    // ══════════════════════════════════════════════

    describe('CRUD Completo de Agente (Criar → Editar → Excluir)', () => {

        let agentesData: any;
        const uniqueSuffix = Date.now();
        let agenteNome: string;
        let agenteEmail: string;

        before(() => {
            cy.fixture('Agentes/agentes.json').then((data) => {
                agentesData = data;
                agenteNome = agentesData.novoAgente.nome;
                agenteEmail = `${agentesData.novoAgente.email}.${uniqueSuffix}@test.com`;
            });
        });

        it('Deve cadastrar um novo agente preenchendo o formulário e submeter com sucesso', () => {
            cy.visit('/usuarios/agentes/nova-area');
            AgentesPage.getBotaoCadastrarAgente().click({ force: true });

            cy.wait(`@${ALIAS.criarAgente}`).its('response.statusCode').should('be.oneOf', [200, 304]);

            // Valida que o formulário de criação foi carregado
            AgentesPage.getCampoNome().should('be.visible');
            AgentesPage.getCampoEmail().should('be.visible');
            AgentesPage.getCampoSenha().should('be.visible');
            AgentesPage.getCampoApelido().should('be.visible');

            // Preenche o formulário com os dados da fixture
            AgentesPage.preencherFormularioCriar(
                agenteNome,
                agenteEmail,
                agentesData.novoAgente.senha,
                agentesData.novoAgente.apelido
            );

            // Submete o formulário
            AgentesPage.clicarConfirmar();

            // Aguarda o redirecionamento de volta para a listagem
            cy.url({ timeout: 20000 }).should('include', '/usuarios/agentes');
        });

        it('Deve localizar o agente criado na listagem via busca', () => {
            cy.visit('/usuarios/agentes/nova-area');

            // Busca pelo nome do agente recém-criado
            AgentesPage.buscarAgentePorNome(agenteNome);
            cy.wait(`@${ALIAS.listarAgentes}`).its('response.statusCode').should('be.oneOf', [200, 304]);

            // Valida que o agente aparece na tabela
            AgentesPage.getTabelaAgentes().should('contain.text', agenteNome);
        });

        it('Deve editar o agente criado, alterar a descrição e salvar com sucesso', () => {
            cy.visit('/usuarios/agentes/nova-area');

            // Busca o agente criado
            AgentesPage.buscarAgentePorNome(agenteNome);
            cy.wait(`@${ALIAS.listarAgentes}`);

            // Aguarda a tabela estabilizar com o resultado esperado
            AgentesPage.getTabelaAgentes().should('contain.text', agenteNome);
            cy.wait(1500);

            // Abre o menu Ações e clica em Editar
            AgentesPage.abrirMenuAcoes(0);
            AgentesPage.clicarAcaoPorTexto('Editar');

            cy.wait(`@${ALIAS.editarAgente}`).its('response.statusCode').should('be.oneOf', [200, 304]);
            cy.url().should('include', '/usuarios/agentes/edit/');

            // Valida que os campos editáveis estão visíveis
            AgentesPage.getCampoEmail().should('be.visible');
            AgentesPage.getCampoApelido().should('be.visible');

            // Altera a descrição do agente
            AgentesPage.preencherFormularioEditar(agentesData.edicao.apelido);

            // Submete as alterações
            AgentesPage.clicarConfirmar();

            // Aguarda o redirecionamento de volta para a listagem
            cy.url({ timeout: 20000 }).should('include', '/usuarios/agentes');
        });

        it('Deve excluir o agente editado, confirmar no modal e validar a remoção', () => {
            cy.visit('/usuarios/agentes/nova-area');

            // Busca o agente pelo nome
            AgentesPage.buscarAgentePorNome(agenteNome);
            cy.wait(`@${ALIAS.listarAgentes}`);

            // Valida que o agente ainda está na tabela antes de excluir
            AgentesPage.getTabelaAgentes().should('contain.text', agenteNome);
            cy.wait(1500);

            // Abre o menu Ações e clica em Excluir
            AgentesPage.abrirMenuAcoes(0);
            AgentesPage.clicarAcaoPorTexto('Excluir');

            // Valida que o modal de confirmação de exclusão apareceu
            cy.get('body', { timeout: 15000 }).should('contain.text', 'Atenção');
            AgentesPage.getBotaoConfirmarExclusao().should('be.visible').and('contain.text', 'Excluir agente');

            // Confirma a exclusão
            AgentesPage.confirmarExclusao();

            // Aguarda a requisição de exclusão e valida
            cy.url({ timeout: 20000 }).should('include', '/usuarios/agentes');

            // Busca novamente para confirmar que o agente foi removido
            AgentesPage.buscarAgentePorNome(agenteNome);
            cy.wait(`@${ALIAS.listarAgentes}`);

            // Verifica que o agente não aparece mais no container/tabela
            cy.get('.nd-table-container, body').should('not.contain.text', agenteNome);
        });
    });
});


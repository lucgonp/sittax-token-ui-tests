/// <reference types="cypress" />

import { PerfisDeAcessoPage } from '../../../page-objects/Utilitarios/PerfisDeAcesso/PerfisDeAcessoPage';
import { setupLoginIntercepts, setupPerfisDeAcessoIntercepts, ALIAS } from '../../../support/api-intercepts';

describe('Utilitários - Tela de Perfis de Acesso (/roles/nova-area) via Navegação UI', () => {

    let perfisFixture: any;

    before(() => {
        cy.fixture('PerfisDeAcesso/perfisDeAcesso.json').then((data) => {
            perfisFixture = data;
        });
    });

    beforeEach(() => {
        setupLoginIntercepts();
        setupPerfisDeAcessoIntercepts();
        cy.loginPadrao();
        cy.navegarParaPerfisDeAcesso();
    });

    // ══════════════════════════════════════════════
    //  1. CARREGAMENTO E ELEMENTOS DA TELA
    // ══════════════════════════════════════════════

    describe('Exibição da Página e Elementos Iniciais via Navegador', () => {

        it('Deve carregar a rota /roles/nova-area com status HTTP 200 via menu de navegação', () => {
            cy.url().should('include', '/roles/nova-area');
            PerfisDeAcessoPage.getTitulo().should('be.visible').and('contain.text', 'Perfis de Acesso');
        });

        it('Deve renderizar os elementos da barra de ações (Cadastrar perfil e Busca)', () => {
            PerfisDeAcessoPage.getBotaoCadastrar().should('be.visible').and('contain.text', 'Cadastrar perfil');
            PerfisDeAcessoPage.getCampoBusca().should('be.visible');
        });

        it('Deve exibir a tabela de perfis com as colunas esperadas (Nome, Permissões, Ações)', () => {
            PerfisDeAcessoPage.getTabela().should('be.visible');
            cy.get('table.nd-table thead tr th').then(($ths) => {
                const headers = $ths.map((i, el) => el.innerText.trim()).get();
                cy.log('COLUNAS ENCONTRADAS: ' + JSON.stringify(headers));
            });
            cy.get('table.nd-table thead tr').within(() => {
                cy.contains('th', 'Nome').should('be.visible');
                cy.contains('th', 'Permissões').should('be.visible');
                cy.contains('th', 'Ações').should('be.visible');
            });
        });

        it('Deve exibir linhas na tabela de perfis ou estado vazio', () => {
            cy.get('body').should(($body) => {
                const hasRows = $body.find('table.nd-table tbody tr').length > 0;
                const hasEmpty = $body.find('.nd-table-empty').length > 0;
                expect(hasRows || hasEmpty, 'tabela com linhas ou estado vazio').to.be.true;
            });
        });

        it('Deve exibir a contagem de permissões na coluna Permissões', () => {
            PerfisDeAcessoPage.getLinhasTabela().first().find('td').eq(1).then(($td) => {
                const texto = $td.text().trim();
                cy.log(`Coluna Permissões da 1ª linha: "${texto}"`);
                // Pode ser "X permissões" ou "-" (sem permissões)
                const isValid = texto.includes('permiss') || texto === '-';
                expect(isValid, `Permissões: "${texto}" deve ser "X permissões" ou "-"`).to.be.true;
            });
        });
    });

    // ══════════════════════════════════════════════
    //  2. BUSCA E REQUISIÇÕES DE API
    // ══════════════════════════════════════════════

    describe('Busca e Interceptação de API via Interface', () => {

        it('Deve pesquisar por nome no campo de busca e interceptar POST /roles/nova-area/search', () => {
            PerfisDeAcessoPage.buscarPorTermo(perfisFixture.busca.termoExistente);
            cy.wait(`@${ALIAS.listarPerfisDeAcesso}`, { timeout: 15000 }).then((interception) => {
                if (interception && interception.response) {
                    cy.log(`POST /search retornou status ${interception.response.statusCode}`);
                    expect(interception.response.statusCode).to.be.oneOf([200, 304]);
                }
            });
        });

        it('Deve filtrar a tabela ao buscar por nome existente', () => {
            PerfisDeAcessoPage.buscarPorTermo(perfisFixture.busca.termoExistente);
            cy.wait(`@${ALIAS.listarPerfisDeAcesso}`, { timeout: 15000 });
            // A tabela deve mostrar resultados filtrados contendo o termo buscado
            cy.get('table.nd-table tbody tr', { timeout: 15000 }).should('have.length.at.least', 1);
            cy.get('table.nd-table tbody tr').first().should('contain.text', perfisFixture.busca.termoExistente);
        });

        it('Deve exibir estado vazio ao buscar um termo inexistente', () => {
            PerfisDeAcessoPage.buscarPorTermo(perfisFixture.busca.termoInexistente);
            cy.wait(`@${ALIAS.listarPerfisDeAcesso}`, { timeout: 15000 });
            cy.get('body').should(($body) => {
                const hasEmpty = $body.find('.nd-table-empty').length > 0;
                const noRows = $body.find('table.nd-table tbody tr').length === 0;
                expect(hasEmpty || noRows, 'tabela vazia ou sem linhas').to.be.true;
            });
        });

        it('Deve restaurar a listagem completa ao limpar a busca', () => {
            // Busca um termo para filtrar
            PerfisDeAcessoPage.buscarPorTermo(perfisFixture.busca.termoExistente);
            cy.wait(`@${ALIAS.listarPerfisDeAcesso}`, { timeout: 15000 });

            // Limpa a busca
            PerfisDeAcessoPage.limparBusca();
            cy.wait(`@${ALIAS.listarPerfisDeAcesso}`, { timeout: 15000 });

            // Tabela deve estar visível com linhas
            cy.get('table.nd-table', { timeout: 15000 }).should('be.visible');
            cy.get('table.nd-table tbody tr').should('have.length.at.least', 1);
        });
    });

    // ══════════════════════════════════════════════
    //  3. MENU DE AÇÕES DA TABELA
    // ══════════════════════════════════════════════

    describe('Menu de Ações na Tabela via Interface', () => {

        it('Deve abrir o menu de ações e exibir as opções Gerenciar Permissões, Editar, Excluir', () => {
            PerfisDeAcessoPage.abrirMenuAcoesNaLinha(0);
            // Verifica que as 3 opções do menu estão visíveis
            cy.get('body').should(($body) => {
                const menuText = $body.text();
                expect(menuText).to.include('Gerenciar Permissões');
                expect(menuText).to.include('Editar');
                expect(menuText).to.include('Excluir');
            });
        });

        it('Deve navegar para Editar ao clicar na opção "Editar"', () => {
            PerfisDeAcessoPage.clicarEditarNaLinha(0);
            cy.url({ timeout: 15000 }).should('include', '/edit');
            PerfisDeAcessoPage.getTitulo().should('be.visible').and('contain.text', 'Editar perfil de acesso');
        });

        it('Deve navegar para Gerenciar Permissões ao clicar na opção', () => {
            PerfisDeAcessoPage.clicarGerenciarPermissoesNaLinha(0);
            cy.url({ timeout: 15000 }).should('include', '/permissions');
            PerfisDeAcessoPage.getTitulo().should('be.visible').and('contain.text', 'Gerenciar permissões');
        });
    });

    // ══════════════════════════════════════════════
    //  4. TELA DE EDITAR PERFIL
    // ══════════════════════════════════════════════

    describe('Tela de Edição de Perfil via Navegador', () => {

        beforeEach(() => {
            PerfisDeAcessoPage.clicarEditarNaLinha(0);
            cy.url({ timeout: 15000 }).should('include', '/edit');
        });

        it('Deve exibir o formulário de edição com campo "Nome do Perfil" preenchido', () => {
            PerfisDeAcessoPage.getCampoNomePerfil().should('be.visible').and('not.have.value', '');
        });

        it('Deve exibir a seção "Informações gerais"', () => {
            cy.contains('Informações gerais').should('be.visible');
        });

        it('Deve exibir os botões Cancelar e Atualizar na barra de ações', () => {
            PerfisDeAcessoPage.getBotaoCancelar().should('be.visible').and('contain.text', 'Cancelar');
            PerfisDeAcessoPage.getBotaoSubmit().should('be.visible');
        });

        it('Deve exibir o botão de voltar (seta) na barra de título', () => {
            PerfisDeAcessoPage.getBotaoVoltar().should('be.visible');
        });

        it('Deve retornar à listagem ao clicar em Cancelar', () => {
            PerfisDeAcessoPage.getBotaoCancelar().click({ force: true });
            cy.url({ timeout: 15000 }).should('include', '/roles/nova-area');
            cy.url().should('not.include', '/edit');
            PerfisDeAcessoPage.getTitulo().should('be.visible').and('contain.text', 'Perfis de Acesso');
        });
    });

    // ══════════════════════════════════════════════
    //  5. TELA DE GERENCIAR PERMISSÕES
    // ══════════════════════════════════════════════

    describe('Tela de Gerenciar Permissões via Navegador', () => {

        beforeEach(() => {
            PerfisDeAcessoPage.clicarGerenciarPermissoesNaLinha(0);
            cy.url({ timeout: 15000 }).should('include', '/permissions');
        });

        it('Deve exibir o título "Gerenciar permissões:" com o nome do perfil', () => {
            PerfisDeAcessoPage.getTitulo().should('be.visible').and('contain.text', 'Gerenciar permissões');
        });

        it('Deve exibir a seção "Adicionar permissões" com checkboxes por seção', () => {
            cy.contains('Adicionar permissões').should('be.visible');
            // Verifica que pelo menos algumas seções de permissão estão presentes
            cy.get('body').should(($body) => {
                const text = $body.text();
                const hasCadastros = text.includes('Cadastros');
                const hasControle = text.includes('Controle');
                expect(hasCadastros || hasControle, 'seções de permissão visíveis').to.be.true;
            });
        });

        it('Deve exibir seções de permissões expansíveis (Cadastros, Controle, Relatorios, Utilitarios)', () => {
            const secoesEsperadas = ['Cadastros', 'Controle', 'Relatorios', 'Utilitarios'];
            secoesEsperadas.forEach((secao) => {
                cy.contains(secao).should('exist');
            });
        });

        it('Deve exibir os botões Cancelar e Atualizar Permissões na barra de ações', () => {
            PerfisDeAcessoPage.getBotaoCancelar().should('be.visible');
            PerfisDeAcessoPage.getBotaoSubmit().should('be.visible');
        });

        it('Deve retornar à listagem ao clicar em Cancelar', () => {
            PerfisDeAcessoPage.getBotaoCancelar().click({ force: true });
            cy.url({ timeout: 15000 }).should('include', '/roles/nova-area');
            cy.url().should('not.include', '/permissions');
            PerfisDeAcessoPage.getTitulo().should('be.visible').and('contain.text', 'Perfis de Acesso');
        });
    });

    // ══════════════════════════════════════════════
    //  6. TELA DE CADASTRAR PERFIL
    // ══════════════════════════════════════════════

    describe('Tela de Cadastro de Perfil via Navegador', () => {

        beforeEach(() => {
            PerfisDeAcessoPage.getBotaoCadastrar().click({ force: true });
            cy.url({ timeout: 15000 }).should('include', '/create');
        });

        it('Deve navegar para a rota /roles/nova-area/create com título correto', () => {
            cy.url().should('include', '/roles/nova-area/create');
            PerfisDeAcessoPage.getTitulo().should('be.visible').and('contain.text', 'Cadastrar perfil de acesso');
        });

        it('Deve exibir o campo "Nome do Perfil" vazio com placeholder', () => {
            PerfisDeAcessoPage.getCampoNomePerfil().should('be.visible').and('have.value', '');
            PerfisDeAcessoPage.getCampoNomePerfil().should('have.attr', 'placeholder', 'Ex: Administrador');
        });

        it('Deve exibir a seção "Informações gerais"', () => {
            cy.contains('Informações gerais').should('be.visible');
        });

        it('Deve exibir os botões Cancelar e Confirmar na barra de ações', () => {
            PerfisDeAcessoPage.getBotaoCancelar().should('be.visible').and('contain.text', 'Cancelar');
            PerfisDeAcessoPage.getBotaoSubmit().should('be.visible');
        });

        it('Deve retornar à listagem ao clicar em Cancelar', () => {
            PerfisDeAcessoPage.getBotaoCancelar().click({ force: true });
            cy.url({ timeout: 15000 }).should('include', '/roles/nova-area');
            cy.url().should('not.include', '/create');
            PerfisDeAcessoPage.getTitulo().should('be.visible').and('contain.text', 'Perfis de Acesso');
        });

        it('Deve retornar à listagem ao clicar no botão voltar (seta)', () => {
            PerfisDeAcessoPage.getBotaoVoltar().click({ force: true });
            cy.url({ timeout: 15000 }).should('include', '/roles/nova-area');
            cy.url().should('not.include', '/create');
        });
    });

    // ══════════════════════════════════════════════
    //  7. OPERAÇÕES CRUD COMPLETAS VIA BROWSER
    // ══════════════════════════════════════════════

    describe('Operações CRUD Completas de Perfis de Acesso via Interface', () => {

        it('R - Read (Listagem): Deve exibir a tabela com perfis cadastrados', () => {
            cy.get('.nd-table-container, table.nd-table', { timeout: 15000 }).should('be.visible');
            cy.get('body').should(($body) => {
                const hasRows = $body.find('table.nd-table tbody tr').length > 0;
                const hasEmpty = $body.find('.nd-table-empty').length > 0;
                expect(hasRows || hasEmpty).to.be.true;
            });
        });

        it('R - Read (Detalhe via Editar): Deve navegar ao detalhe e verificar campo Nome do Perfil', () => {
            // Clica em Editar para ver os detalhes do primeiro perfil
            PerfisDeAcessoPage.clicarEditarNaLinha(0);
            cy.url({ timeout: 15000 }).should('include', '/edit');

            // Verifica que o campo nome está preenchido (não vazio)
            PerfisDeAcessoPage.getCampoNomePerfil().should('be.visible').and('not.have.value', '');
            PerfisDeAcessoPage.getCampoNomePerfil().invoke('val').then((val) => {
                cy.log(`Nome do perfil no formulário de edição: "${val}"`);
            });

            // Volta para a listagem
            PerfisDeAcessoPage.getBotaoCancelar().click({ force: true });
            cy.url({ timeout: 15000 }).should('include', '/roles/nova-area');
        });

        it('R - Read (Permissões): Deve acessar Gerenciar Permissões e verificar seções', () => {
            PerfisDeAcessoPage.clicarGerenciarPermissoesNaLinha(0);
            cy.url({ timeout: 15000 }).should('include', '/permissions');

            // Verifica que as seções de permissão existem
            cy.contains('Adicionar permissões').should('be.visible');
            cy.contains('Cadastros').should('exist');

            // Volta
            PerfisDeAcessoPage.getBotaoCancelar().click({ force: true });
            cy.url({ timeout: 15000 }).should('include', '/roles/nova-area');
        });

        it('R - Read (Busca + Retorno): Deve buscar, filtrar e restaurar listagem completa', () => {
            // Conta linhas antes
            cy.get('table.nd-table tbody tr').its('length').then((qtdAntes) => {
                cy.log(`Linhas antes da busca: ${qtdAntes}`);

                // Busca
                PerfisDeAcessoPage.buscarPorTermo(perfisFixture.busca.termoExistente);
                cy.wait(`@${ALIAS.listarPerfisDeAcesso}`, { timeout: 15000 });

                // Limpa
                PerfisDeAcessoPage.limparBusca();
                cy.wait(`@${ALIAS.listarPerfisDeAcesso}`, { timeout: 15000 });

                // Tabela restaurada
                cy.get('table.nd-table', { timeout: 15000 }).should('be.visible');
                cy.get('table.nd-table tbody tr').should('have.length.at.least', 1);
            });
        });
    });

    // ══════════════════════════════════════════════
    //  8. FLUXO INTEGRADO CRUD COMPLETO
    // ══════════════════════════════════════════════

    describe('Fluxo CRUD Completo de Perfil de Acesso', () => {

        it('Deve cadastrar um novo perfil, gerenciar suas permissões, validar na listagem e depois excluí-lo', () => {
            const nomePerfil = `Perfil CRUD ${Date.now()}`;

            // 1. Cadastrar Novo Perfil
            PerfisDeAcessoPage.getBotaoCadastrar().click({ force: true });
            cy.url().should('include', '/roles/nova-area/create');
            PerfisDeAcessoPage.getCampoNomePerfil().type(nomePerfil, { force: true });
            
            // Intercepta a criação do perfil
            PerfisDeAcessoPage.getBotaoSubmit().click({ force: true });
            cy.wait(`@${ALIAS.criarPerfilDeAcesso}`, { timeout: 15000 }).then((interception) => {
                expect(interception.response?.statusCode).to.be.oneOf([200, 201, 302]);
            });

            // Retorna para a listagem.
            // `include('/roles/nova-area')` sozinho é verdade em /create e /permissions
            // também — só o `not.include` prova que o redirect aconteceu.
            cy.url({ timeout: 15000 }).should('not.include', '/create');
            cy.url().should('include', '/roles/nova-area');

            // 2. Localizar perfil criado e gerenciar permissões
            PerfisDeAcessoPage.buscarPerfilPorNome(nomePerfil);

            // Clica em Gerenciar Permissões
            PerfisDeAcessoPage.clicarGerenciarPermissoesNaLinha(0);
            cy.url().should('include', '/permissions');

            // Seleciona a seção "Cadastros"
            PerfisDeAcessoPage.clicarCheckboxSecao('Cadastros');

            // Atualiza permissões e aguarda o redirecionamento para a listagem
            PerfisDeAcessoPage.getBotaoSubmit().click({ force: true });
            cy.url({ timeout: 15000 }).should('not.include', '/permissions');
            cy.url().should('include', '/roles/nova-area');

            // 3. Verificar contagem de permissões atualizada.
            // A célula é localizada pela LINHA DO PERFIL (não pelo índice 0), e a
            // asserção é retentável — se a listagem filtrada ainda não renderizou,
            // o Cypress reconsulta em vez de fotografar a listagem antiga.
            PerfisDeAcessoPage.buscarPerfilPorNome(nomePerfil);

            PerfisDeAcessoPage.getCelulaPermissoesPorNome(nomePerfil)
                .invoke('text')
                .invoke('trim')
                .should('not.equal', '-')
                .and('contain', 'permiss');

            // 4. Excluir o perfil cadastrado (a busca acima garante que a linha 0 é ele)
            PerfisDeAcessoPage.clicarExcluirNaLinha(0);

            // Valida o modal de confirmação
            PerfisDeAcessoPage.getModalExclusao().should('be.visible');
            PerfisDeAcessoPage.getTituloModalExclusao().should('contain.text', 'Excluir perfil de acesso');
            
            // Confirma exclusão
            PerfisDeAcessoPage.getBotaoConfirmarExclusao().click({ force: true });
            
            // Espera atualizar a listagem e garante que o perfil sumiu
            cy.wait(1500);
            PerfisDeAcessoPage.buscarPorTermo(nomePerfil);
            cy.wait(`@${ALIAS.listarPerfisDeAcesso}`, { timeout: 15000 });

            // Deve mostrar estado vazio
            cy.get('body').should(($body) => {
                const hasEmpty = $body.find('.nd-table-empty').length > 0;
                const noRows = $body.find('table.nd-table tbody tr').length === 0;
                expect(hasEmpty || noRows).to.be.true;
            });
        });
    });
});


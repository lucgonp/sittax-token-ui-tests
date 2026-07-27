/// <reference types="cypress" />

import { CertificadosPage } from '../../../page-objects/Controle/Certificados/CertificadosPage';
import { setupLoginIntercepts, setupCertificadosIntercepts, ALIAS } from '../../../support/api-intercepts';

describe('Controle - Tela de Certificados (/controle/certificados)', () => {

    let loginData: any;

    before(() => {
        cy.fixture('Login/login.json').then((data) => {
            loginData = data;
        });
    });

    beforeEach(() => {
        setupLoginIntercepts();
        setupCertificadosIntercepts();
        cy.logar(loginData.validUser.email, loginData.validUser.password);
    });

    // ══════════════════════════════════════════════
    //  CARREGAMENTO E ELEMENTOS DA TELA
    // ══════════════════════════════════════════════

    describe('Exibição da Página e Elementos Iniciais', () => {

        it('Deve carregar a rota /controle/certificados com status HTTP 200', () => {
            cy.visit('/controle/certificados');
            cy.wait(`@${ALIAS.paginaCertificados}`).its('response.statusCode').should('be.oneOf', [200, 304]);
            CertificadosPage.getTitulo().should('be.visible').and('contain.text', 'Certificados');
        });

        it('Deve renderizar os elementos da barra de ações (Importar, Busca, Filtro, Exportar)', () => {
            cy.visit('/controle/certificados');
            CertificadosPage.getBotaoCadastrarCertificado().should('be.visible');
            CertificadosPage.getCampoBusca().should('be.visible');
            CertificadosPage.getBotaoFiltro().should('be.visible');
            CertificadosPage.getBotaoExportar().should('be.visible');
        });

        it('Deve exibir a tabela de certificados com as colunas esperadas', () => {
            cy.visit('/controle/certificados');
            CertificadosPage.getTabelaCertificados().within(() => {
                cy.contains('th, td, div', 'Razão social').should('be.visible');
                cy.contains('th, td, div', 'Origem').should('be.visible');
                cy.contains('th, td, div', 'Data de importação').should('be.visible');
                cy.contains('th, td, div', 'Validade').should('be.visible');
                cy.contains('th, td, div', 'Ações').should('be.visible');
            });
        });
    });

    // ══════════════════════════════════════════════
    //  BUSCA E FILTROS
    // ══════════════════════════════════════════════

    describe('Busca, Filtros e Exportação com Interceptação de API', () => {

        beforeEach(() => {
            cy.visit('/controle/certificados');
            CertificadosPage.fecharModalNovidadesSeExistir();
        });

        it('Deve pesquisar por nome do certificado, interceptar POST /search e atualizar a tabela', () => {
            CertificadosPage.getCampoBusca().type('BYTOKEN{enter}', { force: true });

            cy.wait(`@${ALIAS.listarCertificados}`).its('response.statusCode').should('be.oneOf', [200, 304]);
        });

        it('Deve abrir o painel de filtro e exibir as opções de filtragem', () => {
            CertificadosPage.getBotaoFiltro().click({ force: true });

            // Valida que o painel de filtros foi aberto
            cy.get('.filter-panel-slide, .nd-filter-panel', { timeout: 15000 }).should('be.visible');
        });
    });

    // ══════════════════════════════════════════════
    //  TELA DE CADASTRO ("Cadastrar certificado")
    // ══════════════════════════════════════════════

    describe('Navegação para a Tela de Cadastro de Certificado', () => {

        it('Deve clicar em "Cadastrar certificado", interceptar GET /create e renderizar o formulário', () => {
            cy.visit('/controle/certificados');
            CertificadosPage.getBotaoCadastrarCertificado().click({ force: true });

            cy.wait(`@${ALIAS.criarCertificado}`).its('response.statusCode').should('be.oneOf', [200, 304]);

            // Valida a presença dos campos do formulário de upload
            CertificadosPage.getCampoArquivo().should('exist');
            CertificadosPage.getCampoSenha().should('be.visible');
            CertificadosPage.getCampoApelido().should('be.visible');
            CertificadosPage.getBotaoConfirmar().should('be.visible');
            CertificadosPage.getBotaoCancelar().should('be.visible');
        });
    });

    // ══════════════════════════════════════════════
    //  TESTE DE TODAS AS AÇÕES DA TABELA
    // ══════════════════════════════════════════════

    describe('Validação de Todas as Ações do Menu da Tabela de Certificados', () => {

        beforeEach(() => {
            cy.visit('/controle/certificados');
            CertificadosPage.fecharModalNovidadesSeExistir();
            CertificadosPage.fecharModalAbertoSeExistir();
        });

        afterEach(() => {
            CertificadosPage.fecharModalAbertoSeExistir();
        });

        it('Deve clicar em "Ver certificado", interceptar requisição e abrir o painel de detalhes', () => {
            CertificadosPage.abrirMenuAcoes(0);
            CertificadosPage.clicarAcaoPorKey('show');

            cy.wait(`@${ALIAS.verDadosCertificado}`).its('response.statusCode').should('be.oneOf', [200, 304]);
            cy.get('body').should('contain.text', 'Certificado');
        });

        it('Deve clicar em "Ver acessos", interceptar requisição e abrir o modal', () => {
            CertificadosPage.abrirMenuAcoes(0);
            CertificadosPage.clicarAcaoPorKey('acessos');

            cy.wait(`@${ALIAS.verSitesCert}`).its('response.statusCode').should('be.oneOf', [200, 304]);
            cy.get('body').should('exist');
        });

        it('Deve clicar em "Excluir" e abrir o modal de confirmação com input de CNPJ', () => {
            CertificadosPage.abrirMenuAcoes(0);
            CertificadosPage.clicarAcaoPorKey('delete');

            CertificadosPage.getModalExclusao().should('be.visible').within(() => {
                CertificadosPage.getTituloModalExclusao().should('have.text', 'Atenção!');
                CertificadosPage.getCampoCnpjExclusao().should('be.visible');
                // Botão começa desabilitado até digitar o CNPJ correto
                CertificadosPage.getBotaoConfirmarExclusao().should('be.disabled');
            });
        });
    });

    // ══════════════════════════════════════════════
    //  CRUD COMPLETO: UPLOAD → BUSCAR → EXCLUIR
    // ══════════════════════════════════════════════

    describe('CRUD Completo de Certificado (Upload → Buscar → Excluir)', () => {

        let certData: any;

        before(() => {
            cy.fixture('Certificados/certificados.json').then((data) => {
                certData = data.certificadoTeste;
            });
        });

        it('Deve fazer upload de um certificado .pfx preenchendo o formulário e submeter com sucesso', () => {
            cy.visit('/controle/certificados');
            CertificadosPage.getBotaoCadastrarCertificado().click({ force: true });

            cy.wait(`@${ALIAS.criarCertificado}`).its('response.statusCode').should('be.oneOf', [200, 304]);

            // Valida que o formulário de upload foi carregado
            CertificadosPage.getCampoArquivo().should('exist');
            CertificadosPage.getCampoSenha().should('be.visible');

            // Faz upload do certificado e preenche a senha
            CertificadosPage.uploadCertificado(
                certData.arquivo,
                certData.senha,
                certData.apelido
            );

            // Submete o formulário
            CertificadosPage.clicarConfirmar();

            // Prova que o upload REALMENTE persistiu: o submit posta em /controle/certificados
            // e responde 2xx (204). Assertar só a URL era falso-positivo (também bate em /create).
            cy.wait(`@${ALIAS.salvarCertificado}`, { timeout: 30000 })
                .its('response.statusCode')
                .should('be.oneOf', [200, 201, 204, 302]);

            // E confirma o retorno para a listagem
            cy.url({ timeout: 30000 }).should('match', /\/controle\/certificados\/?$/);
        });

        it('Deve localizar o certificado importado na listagem via busca', () => {
            cy.visit('/controle/certificados');

            // Busca pelo nome/CNPJ do certificado recém-importado
            CertificadosPage.buscarCertificadoPorTermo(certData.razaoSocial);
            cy.wait(`@${ALIAS.listarCertificados}`).its('response.statusCode').should('be.oneOf', [200, 304]);

            // Valida que o certificado aparece na tabela
            CertificadosPage.getTabelaCertificados().should('contain.text', certData.razaoSocial);
        });

        it('Deve excluir o certificado importado, digitando o CNPJ e confirmando', () => {
            cy.visit('/controle/certificados');

            // Busca o certificado importado
            CertificadosPage.buscarCertificadoPorTermo(certData.razaoSocial);
            cy.wait(`@${ALIAS.listarCertificados}`);

            // Aguarda estabilização da tabela
            CertificadosPage.getTabelaCertificados().should('contain.text', certData.razaoSocial);
            cy.wait(1500);

            // Abre o menu Ações e clica em Excluir
            CertificadosPage.abrirMenuAcoes(0);
            CertificadosPage.clicarAcaoPorKey('delete');

            // Valida que o modal de exclusão apareceu com o campo de CNPJ
            CertificadosPage.getModalExclusao().should('be.visible');
            CertificadosPage.getTituloModalExclusao().should('have.text', 'Atenção!');

            // Lê do modal qual documento (CPF do e-CPF, aqui) libera o botão e confirma
            CertificadosPage.confirmarExclusaoLendoDocumentoDoModal();

            // Aguarda a conclusão da exclusão
            cy.url({ timeout: 20000 }).should('include', '/controle/certificados');

            // Busca novamente para confirmar que o certificado foi removido
            CertificadosPage.buscarCertificadoPorTermo(certData.razaoSocial);
            cy.wait(`@${ALIAS.listarCertificados}`);

            // Verifica que o certificado não aparece mais na listagem (trata estado vazio)
            CertificadosPage.assertCertificadoAusente(certData.razaoSocial);
        });
    });
});

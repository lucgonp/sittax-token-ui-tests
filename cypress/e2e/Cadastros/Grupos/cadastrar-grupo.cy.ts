/// <reference types="cypress" />

import { GruposPage } from '../../../page-objects/Cadastros/Grupos/GruposPage';
import { CadastrarGrupoPage } from '../../../page-objects/Cadastros/Grupos/CadastrarGrupoPage';
import { setupGruposIntercepts, ALIAS } from '../../../support/api-intercepts';

/**
 * Testes da tela de Cadastrar Grupo (/grupos/nova-area/create).
 *
 * Cobertura:
 * - Navegação para a tela de cadastro
 * - Exibição dos campos do formulário
 * - Interação com o campo Nome
 * - Interação com a tabela de certificados
 * - Busca de certificados
 * - Botões Cancelar/Confirmar
 */
describe('Grupos - Cadastrar Grupo', () => {

    beforeEach(() => {
        cy.loginPadrao();
        setupGruposIntercepts();
        cy.visit('/grupos/nova-area/create');
    });

    // ══════════════════════════════════════════════
    //  NAVEGAÇÃO
    // ══════════════════════════════════════════════

    describe('Navegação para a tela de cadastro', () => {

        it('Deve navegar para a tela de cadastro ao clicar em "Cadastrar grupo"', () => {
            cy.navegarParaGrupos();
            cy.wait(`@${ALIAS.listarGrupos}`);
            GruposPage.clicarCadastrarGrupo();
            cy.url({ timeout: 10000 }).should('include', '/grupos/nova-area/create');
            CadastrarGrupoPage.getTituloPagina().should('contain', 'Cadastrar grupo');
        });
    });


    // ══════════════════════════════════════════════
    //  EXIBIÇÃO DO FORMULÁRIO
    // ══════════════════════════════════════════════

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

    // ══════════════════════════════════════════════
    //  CAMPO NOME
    // ══════════════════════════════════════════════

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

    // ══════════════════════════════════════════════
    //  TABELA DE CERTIFICADOS
    // ══════════════════════════════════════════════

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

    // ══════════════════════════════════════════════
    //  BUSCA DE CERTIFICADOS
    // ══════════════════════════════════════════════

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

    // ══════════════════════════════════════════════
    //  BOTÕES DE AÇÃO
    // ══════════════════════════════════════════════

    describe('Botões de Ação', () => {

        it('Deve retornar à listagem ao clicar em "Cancelar"', () => {
            CadastrarGrupoPage.cancelar();
            cy.url({ timeout: 10000 }).should('match', /\/grupos\/?$/);
            GruposPage.getTituloPagina().should('contain', 'Grupos');
            GruposPage.getTabela().should('be.visible');
        });
    });
});

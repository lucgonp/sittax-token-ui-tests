/// <reference types="cypress" />

import { GruposPage } from '../../../page-objects/Cadastros/Grupos/GruposPage';
import { setupGruposIntercepts, ALIAS } from '../../../support/api-intercepts';

/**
 * Testes de interceptação das requisições reais da tela de Grupos.
 *
 * A aplicação é renderizada no servidor; os dados são carregados via:
 *   - POST /grupos/nova-area/search               → listar / buscar / paginar
 *   - POST /grupos/nova-area/edit/search-certificados → certificados (cadastro)
 *   - GET  /grupos/nova-area/edit/:id             → carregar grupo para edição
 */
describe('Grupos - Requisições de API', () => {

    before(() => {
        cy.loginPadrao();
    });

    beforeEach(() => {
        setupGruposIntercepts();
    });

    // ══════════════════════════════════════════════
    //  LISTAR GRUPOS
    // ══════════════════════════════════════════════

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

    // ══════════════════════════════════════════════
    //  BUSCAR GRUPOS
    // ══════════════════════════════════════════════

    describe('POST - Buscar Grupos', () => {

        it('Deve disparar POST ao digitar no campo de busca', () => {
            cy.navegarParaGrupos();
            cy.wait(`@${ALIAS.listarGrupos}`);

            GruposPage.buscarGrupo('Teste');
            cy.wait(`@${ALIAS.listarGrupos}`).its('response.statusCode').should('eq', 200);
        });
    });

    // ══════════════════════════════════════════════
    //  CERTIFICADOS (Tela de Cadastro)
    // ══════════════════════════════════════════════

    describe('POST - Certificados (Tela de Cadastro)', () => {

        it('Deve carregar certificados ao abrir a tela de cadastro', () => {
            cy.visit('/grupos/nova-area/create');
            cy.wait(`@${ALIAS.buscarCertificados}`).its('response.statusCode').should('eq', 200);
        });
    });

    // ══════════════════════════════════════════════
    //  EDITAR GRUPO
    // ══════════════════════════════════════════════

    describe('GET - Carregar Grupo para Edição', () => {

        it('Deve carregar a página de edição ao clicar em "Editar"', () => {
            cy.navegarParaGrupos();
            cy.wait(`@${ALIAS.listarGrupos}`);

            GruposPage.clicarEditar(0);
            cy.wait(`@${ALIAS.editarGrupo}`).its('response.statusCode').should('be.oneOf', [200, 304]);
        });
    });
});

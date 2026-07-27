/// <reference types="cypress" />

import { GruposPage } from '../../../page-objects/Cadastros/Grupos/GruposPage';
import { setupGruposIntercepts, ALIAS } from '../../../support/api-intercepts';

/**
 * Testes de busca/filtro na página de Grupos.
 *
 * A busca dispara POST /grupos/nova-area/search — aguardamos a resposta da rede
 * (cy.wait no alias) em vez de esperas fixas.
 */
describe('Grupos - Busca e Filtro', () => {

    before(() => {
        cy.loginPadrao();
        setupGruposIntercepts();
        cy.navegarParaGrupos();
        cy.wait(`@${ALIAS.listarGrupos}`);
    });

    beforeEach(() => {
        // Intercepts são resetados entre testes; re-registra para os cy.wait por teste
        setupGruposIntercepts();
    });

    afterEach(() => {
        // Restaura o estado limpando a busca ao final de cada teste
        GruposPage.getCampoBusca().clear();
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

        GruposPage.getLinhasTabela().should('have.length', 10);
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

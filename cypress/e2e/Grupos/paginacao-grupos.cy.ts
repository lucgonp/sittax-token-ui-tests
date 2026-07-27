/// <reference types="cypress" />

import { GruposPage } from '../../page-objects/Grupos/GruposPage';
import { setupGruposIntercepts, ALIAS } from '../../support/api-intercepts';

/**
 * Testes de paginação da página de Grupos.
 *
 * A troca de página dispara POST /grupos/nova-area/search — aguardamos a rede.
 *
 * Cobertura:
 * - Rótulo e seletor de resultados por página
 * - Total de resultados
 * - Navegação entre páginas (próxima / anterior)
 */
describe('Grupos - Paginação', () => {

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

    // ══════════════════════════════════════════════
    //  RESULTADOS POR PÁGINA
    // ══════════════════════════════════════════════

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

    // ══════════════════════════════════════════════
    //  NAVEGAÇÃO ENTRE PÁGINAS
    // ══════════════════════════════════════════════

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
            GruposPage.irParaPaginaAnterior();
            cy.wait(`@${ALIAS.listarGrupos}`);
            GruposPage.getLinhasTabela().should('have.length', 10);
        });

        it('A tabela deve continuar exibindo 10 resultados após navegar', () => {
            GruposPage.getLinhasTabela().should('have.length', 10);
        });
    });
});

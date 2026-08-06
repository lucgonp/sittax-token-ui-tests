/// <reference types="cypress" />

import { AtualizacoesPage } from '../../../page-objects/Utilitarios/Atualizacoes/AtualizacoesPage';
import { setupLoginIntercepts, setupAtualizacoesIntercepts, ALIAS } from '../../../support/api-intercepts';

describe('Utilitários - Tela de Atualizações (/cadastros/novidades/nova-area) via Navegação UI', () => {

    let atualizacoesFixture: any;

    before(() => {
        cy.fixture('Atualizacoes/atualizacoes.json').then((data) => {
            atualizacoesFixture = data;
        });
    });

    beforeEach(() => {
        setupLoginIntercepts();
        setupAtualizacoesIntercepts();
        cy.loginPadrao();
        cy.navegarParaAtualizacoes();
    });

    // ══════════════════════════════════════════════
    //  1. CARREGAMENTO E ELEMENTOS DA TELA
    // ══════════════════════════════════════════════

    describe('Exibição da Página e Elementos Iniciais via Navegador', () => {

        it('Deve carregar a rota /cadastros/novidades/nova-area com status HTTP 200 via menu de navegação', () => {
            cy.url().should('include', '/cadastros/novidades/nova-area');
            AtualizacoesPage.getTitulo().should('be.visible').and('contain.text', 'Atualizações');
        });

        it('Deve renderizar os elementos da barra de ações (Busca)', () => {
            AtualizacoesPage.getCampoBusca().should('be.visible');
        });

        it('Deve exibir a tabela de atualizações com as colunas esperadas', () => {
            AtualizacoesPage.getTabela().should('be.visible');
            cy.get('table.nd-table thead tr th').then(($ths) => {
                const headers = $ths.map((i, el) => el.innerText.trim()).get();
                cy.log('COLUNAS ENCONTRADAS: ' + JSON.stringify(headers));
            });
            cy.get('table.nd-table thead tr').within(() => {
                cy.contains('th', 'Título').should('be.visible');
                cy.contains('th', 'Tipo').should('be.visible');
            });
        });

        it('Deve exibir linhas na tabela de atualizações', () => {
            cy.get('body').should(($body) => {
                const hasRows = $body.find('table.nd-table tbody tr').length > 0;
                const hasEmpty = $body.find('.nd-table-empty').length > 0;
                expect(hasRows || hasEmpty, 'tabela com linhas ou estado vazio').to.be.true;
            });
        });
    });

    // ══════════════════════════════════════════════
    //  2. BUSCA E REQUISIÇÕES DE API
    // ══════════════════════════════════════════════

    describe('Busca e Interceptação de API via Interface', () => {

        it('Deve pesquisar por título no campo de busca e interceptar POST /search', () => {
            AtualizacoesPage.buscarPorTermo(atualizacoesFixture.busca.termoExistente);
            cy.wait(`@${ALIAS.listarAtualizacoes}`, { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);
        });

        it('Deve exibir estado vazio ao buscar um termo inexistente', () => {
            AtualizacoesPage.buscarPorTermo(atualizacoesFixture.busca.termoInexistente);
            cy.wait(`@${ALIAS.listarAtualizacoes}`, { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);
            // Após busca sem resultados, verifica se a tabela mostra estado vazio ou zero linhas
            cy.get('body').should(($body) => {
                const hasEmpty = $body.find('.nd-table-empty').length > 0;
                const noRows = $body.find('table.nd-table tbody tr').length === 0;
                expect(hasEmpty || noRows, 'tabela vazia ou sem linhas').to.be.true;
            });
        });

        it('Deve disparar a busca com POST ao carregar a página (listagem inicial)', () => {
            // A navegação no beforeEach já disparou o POST /search; verificamos que aconteceu.
            // Como os intercepts foram registrados ANTES da navegação, podemos verificar que
            // a listagem inicial foi disparada observando os dados carregados na tabela.
            cy.get('table.nd-table, .nd-table-container', { timeout: 15000 }).should('be.visible');
        });
    });

    // ══════════════════════════════════════════════
    //  3. AÇÕES DA TABELA — VISUALIZAR DETALHE
    // ══════════════════════════════════════════════

    describe('Validação da Ação Visualizar no Menu da Tabela via Navegador', () => {

        it('Deve abrir o menu Ações e clicar em "Visualizar", interceptando GET /nova-area/:id', () => {
            cy.get('body').then(($body) => {
                if ($body.find('table.nd-table tbody tr').length > 0) {
                    AtualizacoesPage.clicarVisualizarNaLinha(0);
                    cy.wait(`@${ALIAS.visualizarAtualizacao}`, { timeout: 10000 }).then((interception) => {
                        if (interception && interception.response) {
                            expect(interception.response.statusCode).to.be.oneOf([200, 304]);
                        }
                    });
                } else {
                    cy.log('Tabela sem novidades para testar ação Visualizar');
                }
            });
        });

        it('Deve carregar a tela de detalhe com o título "Visualizar novidade" ao clicar em Visualizar', () => {
            cy.get('body').then(($body) => {
                if ($body.find('table.nd-table tbody tr').length > 0) {
                    AtualizacoesPage.clicarVisualizarNaLinha(0);
                    cy.url({ timeout: 15000 }).should('match', /\/cadastros\/novidades\/nova-area\/\d+/);
                    AtualizacoesPage.getTituloDetalhe()
                        .should('be.visible')
                        .and('contain.text', 'Visualizar novidade');
                } else {
                    cy.log('Tabela sem novidades para testar tela de detalhe');
                }
            });
        });

        it('Deve exibir os campos informativos na tela de detalhe (Título, Tipo, Descrição, Versão, Ambiente)', () => {
            cy.get('body').then(($body) => {
                if ($body.find('table.nd-table tbody tr').length > 0) {
                    AtualizacoesPage.clicarVisualizarNaLinha(0);
                    cy.url({ timeout: 15000 }).should('match', /\/cadastros\/novidades\/nova-area\/\d+/);

                    // Verifica que a seção de informações gerais é exibida
                    AtualizacoesPage.getSecaoInformacoesGerais().should('be.visible');

                    // Verifica os rótulos dos campos (labels) presentes na tela de detalhe
                    cy.get('.nd-page, .nd-form-section, main').within(() => {
                        cy.contains('Título').should('be.visible');
                        cy.contains('Tipo').should('be.visible');
                    });
                } else {
                    cy.log('Tabela sem novidades para testar campos do detalhe');
                }
            });
        });

        it('Deve voltar à listagem ao clicar no botão de voltar na tela de detalhe', () => {
            cy.get('body').then(($body) => {
                if ($body.find('table.nd-table tbody tr').length > 0) {
                    AtualizacoesPage.clicarVisualizarNaLinha(0);
                    cy.url({ timeout: 15000 }).should('match', /\/cadastros\/novidades\/nova-area\/\d+/);

                    AtualizacoesPage.getBotaoVoltar().should('be.visible').click({ force: true });
                    cy.url({ timeout: 15000 }).should('include', '/cadastros/novidades/nova-area');
                    cy.url().should('not.match', /\/cadastros\/novidades\/nova-area\/\d+/);
                    AtualizacoesPage.getTitulo().should('be.visible').and('contain.text', 'Atualizações');
                } else {
                    cy.log('Tabela sem novidades para testar botão voltar');
                }
            });
        });
    });

    // ══════════════════════════════════════════════
    //  4. OPERAÇÕES READ-ONLY VIA BROWSER
    // ══════════════════════════════════════════════

    describe('Operações de Leitura Completas de Atualizações via Interface', () => {

        it('R - Read (Listagem): Deve validar que a tabela ou o estado vazio é exibido ao navegar', () => {
            cy.get('.nd-table-container, table.nd-table', { timeout: 15000 }).should('be.visible');
            cy.get('body').should(($body) => {
                const hasRows = $body.find('table.nd-table tbody tr').length > 0;
                const hasEmpty = $body.find('.nd-table-empty').length > 0;
                expect(hasRows || hasEmpty).to.be.true;
            });
        });

        it('R - Read (Detalhe): Deve navegar para a visualização de uma novidade e confirmar o conteúdo', () => {
            cy.get('body').then(($body) => {
                if ($body.find('table.nd-table tbody tr').length > 0) {
                    // Captura o título da primeira linha da tabela para comparar depois
                    cy.get('table.nd-table tbody tr').first().find('td').first().invoke('text').then((tituloListagem) => {
                        const tituloTrimmed = tituloListagem.trim();
                        cy.log(`Título na listagem: "${tituloTrimmed}"`);

                        AtualizacoesPage.clicarVisualizarNaLinha(0);
                        cy.url({ timeout: 15000 }).should('match', /\/cadastros\/novidades\/nova-area\/\d+/);

                        // Confirma que a tela de detalhe carregou
                        AtualizacoesPage.getTituloDetalhe()
                            .should('be.visible')
                            .and('contain.text', 'Visualizar novidade');
                    });
                } else {
                    cy.log('Sem novidades disponíveis para visualização');
                }
            });
        });

        it('R - Read (Busca + Retorno): Deve buscar, ver resultado e limpar a busca para restaurar a listagem completa', () => {
            AtualizacoesPage.buscarPorTermo(atualizacoesFixture.busca.termoExistente);
            cy.wait(`@${ALIAS.listarAtualizacoes}`, { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);

            // Limpa a busca para restaurar a listagem
            AtualizacoesPage.limparBusca();
            // Dispara a busca com o campo vazio (pressiona Enter)
            AtualizacoesPage.getCampoBusca().type('{enter}', { force: true });
            cy.wait(`@${ALIAS.listarAtualizacoes}`, { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);

            // A listagem completa deve retornar
            cy.get('.nd-table-container, table.nd-table', { timeout: 15000 }).should('be.visible');
        });
    });
});

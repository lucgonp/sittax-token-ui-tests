/// <reference types="cypress" />

import { MonitoramentoPage } from '../../../page-objects/Controle/Monitoramento/MonitoramentoPage';
import { Navbar } from '../../../page-objects/Navbar';
import { setupLoginIntercepts, setupMonitoramentosIntercepts, ALIAS } from '../../../support/api-intercepts';

describe('Controle - Tela de Monitoramento (/controle/monitoramentos/nova-area)', () => {

    let loginData: any;
    let monitoramentoFixture: any;

    before(() => {
        cy.fixture('Login/login.json').then((data) => {
            loginData = data;
        });
        cy.fixture('Monitoramento/monitoramento.json').then((data) => {
            monitoramentoFixture = data;
        });
    });

    beforeEach(() => {
        setupLoginIntercepts();
        setupMonitoramentosIntercepts();
        cy.logar(loginData.validUser.email, loginData.validUser.password);
    });

    afterEach(() => {
        // Garante que a pasta de downloads seja sempre limpa após cada teste para não gerar lixo
        cy.task('deleteDownloads');
    });

    // ══════════════════════════════════════════════
    //  1. CARREGAMENTO E ELEMENTOS DA TELA
    // ══════════════════════════════════════════════

    describe('Exibição da Página e Elementos Iniciais', () => {

        it('Deve carregar a rota /controle/monitoramentos/nova-area com status HTTP 200', () => {
            Navbar.controle('Monitoramento');
            cy.wait(`@${ALIAS.paginaMonitoramentos}`).its('response.statusCode').should('be.oneOf', [200, 304]);
            MonitoramentoPage.getTitulo().should('be.visible').and('contain.text', 'Monitoramento');
        });

        it('Deve renderizar os elementos da barra de ações (Busca, Atualizar, Relatório e Filtro)', () => {
            Navbar.controle('Monitoramento');
            MonitoramentoPage.getCampoBusca().should('be.visible');
            MonitoramentoPage.getBotaoAtualizar().should('be.visible');
            MonitoramentoPage.getBotaoExportar().should('be.visible');
            MonitoramentoPage.getBotaoFiltro().should('be.visible');
        });

        it('Deve exibir a tabela de monitoramentos com as colunas esperadas', () => {
            Navbar.controle('Monitoramento');
            MonitoramentoPage.getTabela().should('be.visible');
            cy.get('table.nd-table thead tr').within(() => {
                cy.contains('th', 'Usuário').should('be.visible');
                cy.contains('th', 'Apelido').should('be.visible');
                cy.contains('th', 'Certificado').should('be.visible');
                cy.contains('th', 'Site/Aplicação').should('be.visible');
                cy.contains('th', 'Data de Acesso').should('be.visible');
                cy.contains('th', 'Gravação').should('be.visible');
            });
        });
    });

    // ══════════════════════════════════════════════
    //  2. BUSCA, ATUALIZAÇÃO, FILTROS E EXPORTAÇÃO
    // ══════════════════════════════════════════════

    describe('Busca, Filtros, Atualização e Exportação de API', () => {

        beforeEach(() => {
            Navbar.controle('Monitoramento');
            MonitoramentoPage.fecharModalAbertoSeExistir();
        });

        it('Deve pesquisar por usuário no campo de busca e interceptar POST /search', () => {
            // Alias FRESCO: registrado após a carga da página, casa só o request da BUSCA
            // (evita falso-positivo com o POST /search disparado ao abrir a tela).
            cy.intercept('POST', '**/controle/monitoramentos/nova-area/search*').as('buscaMonitoramento');
            MonitoramentoPage.buscarPorTermo(monitoramentoFixture.busca.usuarioValido);
            cy.wait('@buscaMonitoramento', { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);
        });

        it('Deve clicar no botão Atualizar e disparar nova requisição de listagem', () => {
            // Alias FRESCO → garante que o POST /search casado é o do CLIQUE em Atualizar,
            // não o da carga inicial da página.
            cy.intercept('POST', '**/controle/monitoramentos/nova-area/search*').as('refreshMonitoramento');
            MonitoramentoPage.getBotaoAtualizar().click({ force: true });
            cy.wait('@refreshMonitoramento', { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);
        });

        it('Deve abrir o painel de filtros, preencher o intervalo de datas e aplicar', () => {
            MonitoramentoPage.getBotaoFiltro().click({ force: true });
            MonitoramentoPage.getPainelFiltro().should('be.visible');

            MonitoramentoPage.getInputDataInicioFiltro().type(monitoramentoFixture.busca.dataInicio);
            MonitoramentoPage.getInputDataFimFiltro().type(monitoramentoFixture.busca.dataFim);

            cy.intercept('POST', '**/controle/monitoramentos/nova-area/search*').as('aplicarFiltro');
            MonitoramentoPage.getBotaoAplicarFiltro().click({ force: true });
            cy.wait('@aplicarFiltro', { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);
        });

        it('Deve permitir limpar os filtros do painel', () => {
            MonitoramentoPage.getBotaoFiltro().click({ force: true });
            MonitoramentoPage.getPainelFiltro().should('be.visible');

            cy.intercept('POST', '**/controle/monitoramentos/nova-area/search*').as('limparFiltro');
            MonitoramentoPage.getBotaoLimparFiltro().click({ force: true });
            cy.wait('@limparFiltro', { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);
        });

        it('Deve clicar em Relatório e baixar o arquivo monitoramento.xlsx', () => {
            // O "Relatório" faz GET /controle/monitoramentos/export (200) e baixa um .xlsx
            // (comprovado por diagnóstico: sem window.open, arquivo monitoramento.xlsx gerado).
            cy.task('deleteDownloads');
            cy.intercept('GET', '**/controle/monitoramentos/export*').as('exportMonitoramento');
            MonitoramentoPage.getBotaoExportar().click({ force: true });

            cy.wait('@exportMonitoramento', { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);

            const arquivo = `${Cypress.config('downloadsFolder')}/monitoramento.xlsx`;
            cy.readFile(arquivo, 'binary', { timeout: 15000 }).should((conteudo) => {
                expect(conteudo.length, 'tamanho do .xlsx').to.be.greaterThan(0);
                expect(conteudo.slice(0, 2), 'assinatura ZIP do xlsx').to.eq('PK');
            });
            cy.task('deleteDownloads');
        });
    });

    // ══════════════════════════════════════════════
    //  3. OPERAÇÕES DE LISTAGEM E AÇÕES DE GRAVAÇÃO
    // ══════════════════════════════════════════════

    describe('Operações de Listagem e Ações de Gravação (CRUD / Read)', () => {

        beforeEach(() => {
            Navbar.controle('Monitoramento');
        });

        it('R - Read: Deve validar que a tabela de monitoramentos ou o estado vazio é exibido', () => {
            cy.wait(`@${ALIAS.paginaMonitoramentos}`);
            cy.get('.nd-table-container, table.nd-table', { timeout: 15000 }).should('be.visible');
            cy.get('body').should(($body) => {
                const hasRows = $body.find('table.nd-table tbody tr').length > 0;
                const hasEmpty = $body.find('.nd-table-empty').length > 0;
                expect(hasRows || hasEmpty).to.be.true;
            });
        });


        it('Deve abrir a gravação (modal + vídeo) ao clicar no botão de gravação da linha se disponível', () => {
            cy.intercept('GET', '**/controle/monitoramentos/video/*').as('videoMonitoramento');
            cy.get('body').then(($body) => {
                const btnVideo = $body.find('button.nd-btn-gravacao[data-video-url]');
                if (btnVideo.length > 0) {
                    cy.wrap(btnVideo.first()).click({ force: true });
                    cy.wait('@videoMonitoramento', { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 206, 304]);
                    cy.get('.fly-dialog--active, [role="dialog"]', { timeout: 10000 }).should('be.visible');
                } else {
                    cy.log('Nenhuma gravação de vídeo disponível na primeira linha da tabela');
                }
            });
        });

        it('Read / Empty State: Deve exibir a mensagem de lista vazia ao buscar um termo inexistente', () => {
            MonitoramentoPage.buscarPorTermo(monitoramentoFixture.busca.termoInexistente);
            cy.wait(`@${ALIAS.listarMonitoramentos}`);
            MonitoramentoPage.getTabelaVaziaContainer().should('contain.text', 'Nenhum monitoramento encontrado');
        });
    });

    // ══════════════════════════════════════════════
    //  4. VALIDAÇÃO DE CONFRONTO TELA X RELATÓRIO EXCEL (01/05/2026 a 13/05/2026)
    // ══════════════════════════════════════════════

    describe('Validação de Divergência de Horários (Tela vs Relatório Exportado)', () => {

        beforeEach(() => {
            Navbar.controle('Monitoramento');
            MonitoramentoPage.fecharModalAbertoSeExistir();
        });

        it('Deve filtrar pelo período de 01/05/2026 a 13/05/2026, exportar o Excel e comparar os horários da tela com o relatório', () => {
            cy.task('deleteDownloads');

            // 1. Abrir filtro e aplicar intervalo 01/05/2026 a 13/05/2026
            MonitoramentoPage.getBotaoFiltro().click({ force: true });
            MonitoramentoPage.getPainelFiltro().should('be.visible');

            MonitoramentoPage.getInputDataInicioFiltro().clear({ force: true }).type(monitoramentoFixture.busca.dataInicio);
            MonitoramentoPage.getInputDataFimFiltro().clear({ force: true }).type(monitoramentoFixture.busca.dataFim);

            cy.intercept('POST', '**/controle/monitoramentos/nova-area/search*').as('aplicarFiltroData');
            MonitoramentoPage.getBotaoAplicarFiltro().click({ force: true });
            cy.wait('@aplicarFiltroData', { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);

            // 2. Extrair dados da tela (tabela UI)
            MonitoramentoPage.extrairDadosTabelaTela().then((registrosTela) => {
                cy.log(`Registros encontrados na tela: ${registrosTela.length}`);

                // 3. Exportar relatório em Excel
                cy.intercept('GET', '**/controle/monitoramentos/export*').as('exportMonitoramentoComFiltro');
                MonitoramentoPage.getBotaoExportar().click({ force: true });
                cy.wait('@exportMonitoramentoComFiltro', { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 304]);

                const arquivoExcel = `${Cypress.config('downloadsFolder')}/monitoramento.xlsx`;

                // 4. Ler o conteúdo do Excel exportado via task 'parseXlsx'
                cy.task('parseXlsx', arquivoExcel).then((resultadoExcel: any) => {
                    expect(resultadoExcel, 'resultado do parse de Excel').to.exist;
                    const { rowsObj, rowsArray } = resultadoExcel;

                    cy.task('log', `Linhas no Excel (objetos): ${rowsObj.length}`);
                    cy.task('log', `Linhas no Excel (matriz): ${rowsArray.length}`);

                    if (rowsArray && rowsArray.length > 0) {
                        const headers: string[] = rowsArray[0].map((h: any) => String(h).trim());
                        cy.task('log', `Cabeçalhos identificados no Excel: ${JSON.stringify(headers)}`);

                        // Encontrar índices no Excel (Cabeçalhos: SITE/APLICAÇÃO, DATA ACESSO, USUÁRIO, APELIDO, CERTIFICADO, CNPJ)
                        let colIndexData = headers.findIndex((h) =>
                            /data.*acesso/i.test(h) || /^data$/i.test(h) || /acesso/i.test(h)
                        );
                        if (colIndexData === -1) {
                            colIndexData = 1; // 2ª coluna (DATA ACESSO no Excel)
                        }

                        let colIndexUsuario = headers.findIndex((h) => /usu[áa]rio/i.test(h));
                        if (colIndexUsuario === -1) {
                            colIndexUsuario = 2; // 3ª coluna (USUÁRIO no Excel)
                        }

                        let colIndexSite = headers.findIndex((h) => /site|aplica[çc][ãa]o/i.test(h));
                        if (colIndexSite === -1) {
                            colIndexSite = 0; // 1ª coluna (SITE/APLICAÇÃO no Excel)
                        }

                        if (registrosTela.length > 0) {
                            const divergencias: string[] = [];

                            registrosTela.forEach((regTela, idx) => {
                                const rowDataArray = rowsArray[idx + 1] || [];
                                const dataAcessoExcel = rowDataArray[colIndexData] !== undefined ? String(rowDataArray[colIndexData]).trim() : '';
                                const usuarioExcel = rowDataArray[colIndexUsuario] !== undefined ? String(rowDataArray[colIndexUsuario]).trim() : '';
                                const siteExcel = rowDataArray[colIndexSite] !== undefined ? String(rowDataArray[colIndexSite]).trim() : '';

                                cy.task('log', `[Linha ${idx + 1}] Usuário: ${regTela.usuario} | Tela Data: "${regTela.dataAcesso}" | Excel Data: "${dataAcessoExcel}"`);

                                if (dataAcessoExcel && regTela.dataAcesso) {
                                    if (regTela.dataAcesso !== dataAcessoExcel) {
                                        divergencias.push(
                                            `Linha ${idx + 1} (${regTela.usuario} - ${siteExcel || regTela.siteAplicacao}): Horário na Tela [${regTela.dataAcesso}] diverge do Relatório Excel [${dataAcessoExcel}]`
                                        );
                                    }
                                }
                            });

                            if (divergencias.length > 0) {
                                cy.task('log', '=== DIVERGÊNCIAS DE HORÁRIO ENCONTRADAS (UTC EXCEL VS UTC-3 TELA) ===');
                                divergencias.forEach((d) => cy.task('log', d));
                            }

                            // Garante a remoção do arquivo baixado imediatamente após a análise
                            cy.task('deleteDownloads');

                            // Valida se houve divergência entre a tela e o relatório exportado
                            expect(divergencias, `Divergências encontradas nos horários do relatório:\n${divergencias.join('\n')}`).to.deep.equal([]);
                        } else {
                            cy.log('Nenhum registro encontrado no período de 01/05/2026 a 13/05/2026');
                            cy.task('deleteDownloads');
                        }
                    }
                });
            });
        });
    });

    // ══════════════════════════════════════════════
    //  5. PAGINAÇÃO E FILTRO DE PERÍODO (#27259)
    // ══════════════════════════════════════════════

    /**
     * Regressão do bug #27259 (AGROCONTAR CONSULTORIA CONTÁBIL LTDA):
     *
     *   (1) "Resultados por página" não era aplicado na consulta — a tela trazia
     *       sempre 10 registros e o seletor voltava para "10" a cada atualização.
     *   (2) O filtro de período não era aplicado: informar só uma das datas
     *       invalidava a consulta, e com as duas preenchidas os registros do
     *       ÚLTIMO DIA do intervalo ficavam de fora.
     *
     * Por que a suíte antiga não pegou: não havia nenhum teste do seletor de
     * paginação, e o teste de filtro de data só conferia `statusCode 200` — nunca
     * as linhas devolvidas. Os testes abaixo afirmam o conteúdo da tabela.
     */
    describe('Paginação e Filtro de Período (#27259)', () => {

        beforeEach(() => {
            MonitoramentoPage.interceptarBuscas();
            Navbar.controle('Monitoramento');
            MonitoramentoPage.getTabela().should('be.visible');
            MonitoramentoPage.aguardarListagemAssentar();
        });

        // ---------- (1) Resultados por página ----------

        it('Deve exibir a quantidade de registros escolhida em "Resultados por página"', () => {
            MonitoramentoPage.lerTotalResultados().then((total) => {
                expect(total, 'a conta de teste precisa de mais de 10 registros para este cenário').to.be.greaterThan(10);

                MonitoramentoPage.selecionarResultadosPorPagina(25);

                const esperado = Math.min(25, total);
                MonitoramentoPage.getLinhasTabela()
                    .should('have.length', esperado);
            });
        });

        it('Deve manter o valor escolhido no seletor após a listagem atualizar', () => {
            // O relato do cliente é explícito: o seletor voltava sozinho para "10".
            MonitoramentoPage.selecionarResultadosPorPagina(25);
            MonitoramentoPage.getSelectResultadosPorPagina().should('have.value', '25');
            MonitoramentoPage.getLinhasTabela().should('have.length', 25);

            MonitoramentoPage.getBotaoAtualizar().click({ force: true });

            // Asserções retentáveis como barreira — sem depender da espera de rede.
            MonitoramentoPage.getSelectResultadosPorPagina().should('have.value', '25');
            MonitoramentoPage.getLinhasTabela().should('have.length', 25);
        });

        it('Deve refletir cada valor do seletor (10, 25, 50) na quantidade de linhas', () => {
            MonitoramentoPage.lerTotalResultados().then((total) => {
                ([10, 25, 50] as const).forEach((qtd) => {
                    MonitoramentoPage.selecionarResultadosPorPagina(qtd);
                    MonitoramentoPage.getLinhasTabela()
                        .should('have.length', Math.min(qtd, total));
                });
            });
        });

        it('Deve manter a quantidade por página ao navegar para a segunda página, sem repetir registros', () => {
            MonitoramentoPage.lerTotalResultados().then((total) => {
                if (total <= 25) {
                    // Sem massa suficiente o cenário não existe — falhar seria ruído,
                    // mas passar calado esconderia a lacuna. Registra e encerra.
                    cy.task('log', `[#27259] Apenas ${total} registros: sem 2ª página com 25/página. Cenário não exercitado.`);
                    return;
                }

                const esperadoPag2 = Math.min(25, total - 25);

                MonitoramentoPage.selecionarResultadosPorPagina(25);
                // Barreira retentável ANTES de extrair: `extrairAssinaturaLinhas()`
                // usa `.then()` e fotografaria a listagem de 10 ainda na tela.
                MonitoramentoPage.getLinhasTabela().should('have.length', 25);

                MonitoramentoPage.extrairAssinaturaLinhas().then((pagina1) => {
                    expect(pagina1, 'primeira página deve ter 25 registros').to.have.length(25);

                    MonitoramentoPage.getBotaoProximaPagina().click({ force: true });

                    // A 2ª página também tem 25 linhas, então `have.length` não serve
                    // de barreira — não distingue uma página da outra. Espera até a
                    // primeira linha efetivamente mudar.
                    cy.get('table.nd-table tbody tr').first().should(($tr) => {
                        const assinatura = Cypress.$($tr).find('td').slice(0, 5).toArray()
                            .map((td) => Cypress.$(td).text().trim()).join('|');
                        expect(assinatura, 'a 2ª página deve começar com um registro diferente').to.not.equal(pagina1[0]);
                    });

                    MonitoramentoPage.getSelectResultadosPorPagina().should('have.value', '25');
                    MonitoramentoPage.getLinhasTabela().should('have.length', esperadoPag2);

                    MonitoramentoPage.extrairAssinaturaLinhas().then((pagina2) => {
                        expect(pagina2, `2ª página deve ter ${esperadoPag2} registros`).to.have.length(esperadoPag2);

                        const repetidos = pagina2.filter((linha) => pagina1.includes(linha));
                        expect(repetidos, `registros repetidos entre a 1ª e a 2ª página:\n${repetidos.join('\n')}`)
                            .to.deep.equal([]);
                    });
                });
            });
        });

        // ---------- (2) Filtro de período ----------

        it('Deve exibir somente registros dentro do intervalo, incluindo os do último dia', () => {
            // O último dia ficar de fora foi o sintoma exato relatado. Em vez de
            // datas fixas, usamos a data mais recente que a própria listagem exibe
            // e filtramos [D, D]: se o último dia for excluído, o resultado vem vazio.
            MonitoramentoPage.extrairDatasTabela().then((datas) => {
                expect(datas, 'a listagem precisa de registros para este cenário').to.have.length.greaterThan(0);

                const maisRecente = datas.reduce((a, b) => (a.data > b.data ? a : b)).data;
                const iso = `${maisRecente.getFullYear()}-${String(maisRecente.getMonth() + 1).padStart(2, '0')}-${String(maisRecente.getDate()).padStart(2, '0')}`;
                const diaBr = iso.split('-').reverse().join('/');

                cy.task('log', `[#27259] Filtrando o intervalo fechado ${diaBr} a ${diaBr}`);
                MonitoramentoPage.aplicarFiltroPeriodo(iso, iso);

                // As duas condições PRECISAM valer ao mesmo tempo, numa única asserção
                // retentável. Separadas, "tem linhas" passaria na tabela pré-filtro
                // ainda em tela e "nenhuma fora do dia" passaria numa tabela vazia —
                // ou seja, o sintoma relatado (último dia excluído → lista vazia)
                // escaparia por entre as duas.
                MonitoramentoPage.assertarPeriodoNaTabela(
                    ($rows) => {
                        expect($rows.length, `registros encontrados em ${diaBr}`).to.be.greaterThan(0);
                    },
                    (textos) => textos.filter((t) => t.slice(0, 10) !== diaBr),
                    `registros fora do intervalo ${diaBr}–${diaBr}`,
                );
            });
        });

        it('Deve aceitar apenas a data inicial e retornar registros daquela data em diante', () => {
            MonitoramentoPage.extrairDatasTabela().then((datas) => {
                expect(datas).to.have.length.greaterThan(0);

                const maisRecente = datas.reduce((a, b) => (a.data > b.data ? a : b)).data;
                const iso = `${maisRecente.getFullYear()}-${String(maisRecente.getMonth() + 1).padStart(2, '0')}-${String(maisRecente.getDate()).padStart(2, '0')}`;
                const inicio = new Date(maisRecente.getFullYear(), maisRecente.getMonth(), maisRecente.getDate());

                MonitoramentoPage.aplicarFiltroPeriodo(iso, '');

                // Só a data inicial preenchida invalidava a consulta antes do fix —
                // por isso "tem registros" é parte da asserção, não um passo à parte.
                MonitoramentoPage.assertarPeriodoNaTabela(
                    ($rows) => {
                        expect($rows.length, 'registros a partir da data inicial').to.be.greaterThan(0);
                    },
                    (textos) => textos.filter((t) => {
                        const d = MonitoramentoPage.parsearDataBr(t);
                        return d !== null && d < inicio;
                    }),
                    'registros anteriores à data inicial',
                );
            });
        });

        it('Deve aceitar apenas a data final e retornar registros até aquela data', () => {
            MonitoramentoPage.extrairDatasTabela().then((datas) => {
                expect(datas).to.have.length.greaterThan(0);

                const maisAntiga = datas.reduce((a, b) => (a.data < b.data ? a : b)).data;
                const iso = `${maisAntiga.getFullYear()}-${String(maisAntiga.getMonth() + 1).padStart(2, '0')}-${String(maisAntiga.getDate()).padStart(2, '0')}`;
                // Fim do dia: registros do próprio dia contam como "até" a data.
                const limite = new Date(maisAntiga.getFullYear(), maisAntiga.getMonth(), maisAntiga.getDate(), 23, 59, 59);

                MonitoramentoPage.aplicarFiltroPeriodo('', iso);

                MonitoramentoPage.assertarPeriodoNaTabela(
                    ($rows) => {
                        expect($rows.length, 'registros até a data final').to.be.greaterThan(0);
                    },
                    (textos) => textos.filter((t) => {
                        const d = MonitoramentoPage.parsearDataBr(t);
                        return d !== null && d > limite;
                    }),
                    'registros posteriores à data final',
                );
            });
        });

        it('Deve exibir a listagem vazia ao filtrar um período sem registros', () => {
            // Período deliberadamente distante da massa existente.
            MonitoramentoPage.aplicarFiltroPeriodo('2019-01-01', '2019-01-07');

            cy.get('body').should(($body) => {
                const linhas = $body.find('table.nd-table tbody tr').length;
                const vazio = $body.find('.nd-table-empty').length > 0;
                expect(vazio || linhas === 0, `esperado nenhum registro, encontrado ${linhas} linha(s)`).to.be.true;
            });
        });

        it('Deve aplicar o filtro de período e a quantidade por página simultaneamente', () => {
            MonitoramentoPage.extrairDatasTabela().then((datas) => {
                const maisRecente = datas.reduce((a, b) => (a.data > b.data ? a : b)).data;
                const ano = maisRecente.getFullYear();
                const mes = String(maisRecente.getMonth() + 1).padStart(2, '0');
                const ultimoDia = new Date(ano, maisRecente.getMonth() + 1, 0).getDate();

                // Mês inteiro do registro mais recente, para ter volume.
                MonitoramentoPage.aplicarFiltroPeriodo(`${ano}-${mes}-01`, `${ano}-${mes}-${ultimoDia}`);
                MonitoramentoPage.selecionarResultadosPorPagina(10);

                MonitoramentoPage.lerTotalResultados().then((totalFiltrado) => {
                    const esperado = Math.min(10, totalFiltrado);

                    // Os dois parâmetros verificados juntos: a quantidade da página E
                    // o período. Em comandos separados, cada um poderia passar num
                    // estado diferente da tabela.
                    MonitoramentoPage.assertarPeriodoNaTabela(
                        ($rows) => {
                            expect($rows.length, `linhas na página com o período aplicado`).to.equal(esperado);
                        },
                        (textos) => textos.filter((t) => {
                            const d = MonitoramentoPage.parsearDataBr(t);
                            return d !== null && (d.getFullYear() !== ano || d.getMonth() !== maisRecente.getMonth());
                        }),
                        `registros fora de ${mes}/${ano}`,
                    );
                });
            });
        });

        it('Deve restaurar a listagem completa ao limpar os filtros', () => {
            MonitoramentoPage.lerTotalResultados().then((totalInicial) => {
                MonitoramentoPage.aplicarFiltroPeriodo('2019-01-01', '2019-01-07');
                MonitoramentoPage.limparFiltros();

                MonitoramentoPage.lerTotalResultados().should('equal', totalInicial);
                MonitoramentoPage.getLinhasTabela().should('have.length.greaterThan', 0);
            });
        });
    });
});

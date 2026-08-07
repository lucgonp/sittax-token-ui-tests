/**
 * Page Object para a tela de Controle de Monitoramento (/controle/monitoramentos/nova-area).
 * Encapsula os seletores e ações baseados no DOM real da aplicação Sittax Token.
 */
export const MonitoramentoPage = {

    // ══════════════════════════════════════════════
    //  SELETORES DA LISTAGEM E BARRA DE AÇÕES
    // ══════════════════════════════════════════════

    /** Título principal da página de Monitoramento */
    getTitulo: () => cy.get('.nd-title-bar .h1, .nd-title-bar__title, h1', { timeout: 15000 }),

    /** Campo de busca por usuário/termo */
    getCampoBusca: () => cy.get('#nd-monitoramentos-search', { timeout: 15000 }),

    /** Botão "Atualizar" dados da listagem */
    getBotaoAtualizar: () => cy.get('#nd-monitoramentos-refresh-btn', { timeout: 15000 }),

    /** Botão "Relatório" (Exportar Excel) */
    getBotaoExportar: () => cy.get('#nd-monitoramentos-export-btn', { timeout: 15000 }),

    /** Botão de alternar o painel de filtros */
    getBotaoFiltro: () => cy.get('#filter-toggle-nd-monitoramentos-filter, button.filter-toggle', { timeout: 15000 }),

    /** Painel deslizante de filtros */
    getPainelFiltro: () => cy.get('.filter-panel-slide, .nd-filter-panel', { timeout: 15000 }),

    /** Campo de seleção de Usuário no filtro */
    getSelectUsuarioFiltro: () => cy.get('#filter-usuario', { timeout: 15000 }),

    /** Campo de seleção de Certificado no filtro */
    getSelectCertificadoFiltro: () => cy.get('#filter-certificado', { timeout: 15000 }),

    /** Campo Data Início no filtro */
    getInputDataInicioFiltro: () => cy.get('#filter-data-inicio', { timeout: 15000 }),

    /** Campo Data Fim no filtro */
    getInputDataFimFiltro: () => cy.get('#filter-data-fim', { timeout: 15000 }),

    /** Botão "Aplicar filtros" */
    getBotaoAplicarFiltro: () => cy.get('button.nd-filter-panel-apply', { timeout: 15000 }),

    /** Botão "Limpar filtros" */
    getBotaoLimparFiltro: () => cy.get('button.nd-filter-panel-clear', { timeout: 15000 }),

    /** Botão de fechar o painel de filtro */
    getBotaoFecharFiltro: () => cy.get('button.filter-panel-close', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  SELETORES DA TABELA
    // ══════════════════════════════════════════════

    /** Tabela principal de monitoramentos */
    getTabela: () => cy.get('table.nd-table', { timeout: 15000 }).first(),

    /** Linhas da tabela de monitoramentos */
    getLinhasTabela: () => cy.get('table.nd-table tbody tr', { timeout: 15000 }),

    /** Botão de gravação ("Ver gravações") de uma linha da tabela */
    getBotaoVerGravacao: (rowIndex = 0) => cy.get('table.nd-table tbody tr', { timeout: 15000 }).eq(rowIndex).find('button.nd-btn-gravacao'),

    /** Container de tabela vazia / sem resultados */
    getTabelaVaziaContainer: () => cy.get('.nd-table-empty, .nd-table-container', { timeout: 15000 }),

    /** Paginação - contagem de resultados (ex.: "86 resultados") */
    getContadorResultados: () => cy.get('.nd-pagination__count', { timeout: 15000 }),

    /** Seletor "Resultados por página" (opções 10 / 25 / 50 / 100) */
    getSelectResultadosPorPagina: () => cy.get('select.nd-pagination__select', { timeout: 15000 }),

    /** Botões de navegação entre páginas (anterior / próxima) */
    getBotoesPaginacao: () => cy.get('nav.nd-pagination__nav button.nd-pagination__btn', { timeout: 15000 }),

    /** Botão "próxima página" (o último da nav) */
    getBotaoProximaPagina: () => MonitoramentoPage.getBotoesPaginacao().last(),

    // ══════════════════════════════════════════════
    //  AÇÕES E MÉTODOS AUXILIARES
    // ══════════════════════════════════════════════

    /** Realiza uma pesquisa por termo no campo de busca da listagem */
    buscarPorTermo: (termo: string) => {
        MonitoramentoPage.getCampoBusca()
            .should('be.visible')
            .focus()
            .type(`{selectall}${termo}{enter}`, { force: true });
    },

    /** Clica no botão de gravação da linha indicada se existir */
    clicarVerGravacao: (rowIndex = 0) => {
        MonitoramentoPage.getTabela().should('be.visible');
        MonitoramentoPage.getBotaoVerGravacao(rowIndex).should('be.visible').click({ force: true });
    },

    /** Extrai os registros visíveis na tabela da tela */
    extrairDadosTabelaTela: () => {
        const registros: Array<{
            usuario: string;
            apelido: string;
            certificado: string;
            siteAplicacao: string;
            dataAcesso: string;
        }> = [];

        return cy.get('table.nd-table tbody tr').then(($rows) => {
            $rows.each((_, row) => {
                const $tds = Cypress.$(row).find('td');
                if ($tds.length >= 5) {
                    registros.push({
                        usuario: Cypress.$($tds[0]).text().trim(),
                        apelido: Cypress.$($tds[1]).text().trim(),
                        certificado: Cypress.$($tds[2]).text().trim(),
                        siteAplicacao: Cypress.$($tds[3]).text().trim(),
                        dataAcesso: Cypress.$($tds[4]).text().trim(),
                    });
                }
            });
            return registros;
        });
    },

    // ══════════════════════════════════════════════
    //  PAGINAÇÃO E FILTRO DE PERÍODO (#27259)
    // ══════════════════════════════════════════════

    /**
     * Espera a listagem assentar antes de ler a tabela.
     *
     * A tela dispara buscas assíncronas e pode emitir uma request atrasada depois
     * que a primeira já respondeu; ler o `<tbody>` nesse intervalo devolve a
     * listagem anterior. Exige fila vazia E uma janela de silêncio desde a última
     * resposta. Requer que `interceptarBuscas()` tenha rodado no início do teste.
     */
    aguardarListagemAssentar: () => {
        const SILENCIO_MS = 900;
        // Uma request abortada nunca chama o callback de resposta e deixaria o
        // contador preso em >0 para sempre. Depois deste tempo sem NENHUM evento de
        // rede, considera-se assentado mesmo com o contador positivo.
        const ABANDONO_MS = 5000;

        cy.wrap(null, { log: false, timeout: 20000 }).should(() => {
            const rede = Cypress.env('monitoramentoRede') || { emVoo: 0, ultimoEvento: 0 };
            const quieto = Date.now() - rede.ultimoEvento;
            const assentou = quieto > SILENCIO_MS && (rede.emVoo === 0 || quieto > ABANDONO_MS);
            expect(
                assentou,
                `listagem estável (em voo=${rede.emVoo}, ${quieto}ms sem eventos de rede)`,
            ).to.be.true;
        });
    },

    /**
     * Instala o contador de requests usado por `aguardarListagemAssentar()`.
     *
     * Marca o tempo tanto na SAÍDA quanto na VOLTA da request: a tela às vezes
     * dispara a busca bem depois do clique, e medir só pelas respostas faria a
     * espera declarar "assentado" no intervalo entre uma resposta e a próxima saída.
     *
     * Ainda assim, esta espera é auxiliar — a barreira que vale é a asserção
     * retentável sobre a tabela (`should('have.length', ...)`), porque só ela
     * reconsulta o DOM. Extrair dados com `.then()` sem essa barreira fotografa a
     * listagem anterior.
     */
    interceptarBuscas: () => {
        const rede = { emVoo: 0, ultimoEvento: 0 };
        Cypress.env('monitoramentoRede', rede);
        cy.intercept('POST', '**/controle/monitoramentos/nova-area/search*', (req) => {
            rede.emVoo++;
            rede.ultimoEvento = Date.now();
            req.continue(() => {
                rede.emVoo--;
                rede.ultimoEvento = Date.now();
            });
        }).as('buscaMonitoramentoContada');
    },

    /** Seleciona uma quantidade em "Resultados por página" e espera a listagem assentar */
    selecionarResultadosPorPagina: (quantidade: 10 | 25 | 50 | 100) => {
        MonitoramentoPage.getSelectResultadosPorPagina()
            .should('be.visible')
            .select(String(quantidade), { force: true });
        MonitoramentoPage.aguardarListagemAssentar();
    },

    /** Lê o total de registros do contador ("86 resultados" → 86) */
    lerTotalResultados: () =>
        MonitoramentoPage.getContadorResultados().invoke('text').then((texto) => {
            const m = String(texto).match(/(\d+)/);
            return m ? Number(m[1]) : 0;
        }),

    /**
     * Extrai as datas da coluna "Data de Acesso" (índice 4) como objetos Date.
     * Formato na tela: `dd/MM/yyyy HH:mm`.
     */
    extrairDatasTabela: () =>
        cy.get('table.nd-table tbody tr', { timeout: 15000 }).then(($rows) => {
            const datas: Array<{ texto: string; data: Date }> = [];
            $rows.each((_, row) => {
                const texto = Cypress.$(row).find('td').eq(4).text().trim();
                const m = texto.match(/(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
                if (m) {
                    datas.push({
                        texto,
                        data: new Date(
                            Number(m[3]), Number(m[2]) - 1, Number(m[1]),
                            Number(m[4] ?? 0), Number(m[5] ?? 0),
                        ),
                    });
                }
            });
            return datas;
        }),

    /** Assinatura das linhas visíveis, para detectar repetição entre páginas */
    extrairAssinaturaLinhas: () =>
        cy.get('table.nd-table tbody tr', { timeout: 15000 }).then(($rows) =>
            Array.from($rows).map((row) =>
                Cypress.$(row).find('td').slice(0, 5).toArray()
                    .map((td) => Cypress.$(td).text().trim()).join('|'),
            ),
        ),

    /**
     * Asserção RETENTÁVEL sobre a tabela filtrada: quantidade e conteúdo das datas
     * verificados na mesma passada.
     *
     * Existe para fechar um furo: separar "a lista tem registros" de "nenhum registro
     * fora do período" em dois comandos deixa cada um passar num estado diferente —
     * o primeiro na tabela pré-filtro ainda em tela, o segundo numa tabela vazia.
     * Um filtro que devolvesse vazio (o sintoma de #27259) passaria nos dois.
     *
     * @param verificarQuantidade  recebe as linhas; deve afirmar o volume esperado
     * @param acharForaDoPeriodo   recebe os textos da coluna de data; devolve os fora do intervalo
     */
    assertarPeriodoNaTabela: (
        verificarQuantidade: ($rows: JQuery<HTMLElement>) => void,
        acharForaDoPeriodo: (textos: string[]) => string[],
        mensagem: string,
    ) => {
        cy.get('table.nd-table tbody tr', { timeout: 15000 }).should(($rows) => {
            verificarQuantidade($rows);
            const textos = Array.from($rows).map((row) =>
                Cypress.$(row).find('td').eq(4).text().trim(),
            );
            expect(acharForaDoPeriodo(textos), mensagem).to.deep.equal([]);
        });
    },

    /** Converte `dd/MM/yyyy HH:mm` em Date (devolve null se não casar) */
    parsearDataBr: (texto: string): Date | null => {
        const m = texto.match(/(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
        return m
            ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), Number(m[4] ?? 0), Number(m[5] ?? 0))
            : null;
    },

    /** Abre o painel de filtros (idempotente) */
    abrirPainelFiltro: () => {
        cy.get('body').then(($b) => {
            if ($b.find('.filter-panel-slide.is-open, .nd-filter-panel.is-open').length === 0) {
                MonitoramentoPage.getBotaoFiltro().first().click({ force: true });
            }
        });
        MonitoramentoPage.getBotaoAplicarFiltro().should('be.visible');
    },

    /**
     * Aplica o filtro de período. Passar `''` deixa o campo vazio — é assim que se
     * exercita o cenário de apenas uma das datas preenchida (#27259).
     */
    aplicarFiltroPeriodo: (dataInicio: string, dataFim: string) => {
        MonitoramentoPage.abrirPainelFiltro();

        MonitoramentoPage.getInputDataInicioFiltro().clear({ force: true });
        if (dataInicio) {
            MonitoramentoPage.getInputDataInicioFiltro().type(dataInicio, { force: true });
        }

        MonitoramentoPage.getInputDataFimFiltro().clear({ force: true });
        if (dataFim) {
            MonitoramentoPage.getInputDataFimFiltro().type(dataFim, { force: true });
        }

        MonitoramentoPage.getBotaoAplicarFiltro().click({ force: true });
        MonitoramentoPage.aguardarListagemAssentar();
    },

    /** Limpa os filtros do painel */
    limparFiltros: () => {
        MonitoramentoPage.abrirPainelFiltro();
        MonitoramentoPage.getBotaoLimparFiltro().click({ force: true });
        MonitoramentoPage.aguardarListagemAssentar();
    },

    /** Fecha qualquer modal/dialog/drawer aberto se existir */
    fecharModalAbertoSeExistir: () => {
        cy.get('body').then(($body) => {
            if ($body.find('.fly-alert, .fly-dialog, [role="dialog"], .modal, .nd-drawer').length > 0) {
                cy.get('body').then(($b) => {
                    if ($b.find('button.filter-panel-close').length > 0) {
                        cy.get('button.filter-panel-close').first().click({ force: true });
                    } else if ($b.find('button:contains("✕")').length > 0) {
                        cy.get('button:contains("✕")').first().click({ force: true });
                    } else if ($b.find('button:contains("Fechar")').length > 0) {
                        cy.get('button:contains("Fechar")').first().click({ force: true });
                    } else {
                        cy.get('body').type('{esc}');
                    }
                });
            }
        });
    }
};

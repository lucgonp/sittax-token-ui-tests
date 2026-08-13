/**
 * Page Object para a tela de Controle de Regras (/controle/regras e /controle/regras/create).
 * Encapsula os seletores e ações baseados no DOM real da aplicação Sittax Token.
 */
export const RegrasPage = {

    // ══════════════════════════════════════════════
    //  LISTAGEM DE REGRAS (/controle/regras)
    // ══════════════════════════════════════════════

    /** Título principal da página de Regras */
    getTitulo: () => cy.get('.nd-title-bar .h1, .nd-title-bar__title, h1', { timeout: 15000 }),

    /** Botão "Cadastrar regra" */
    getBotaoCadastrarRegra: () => cy.get('a.nd-btn-primary[href*="/controle/regras/create"], button:contains("Cadastrar regra"), a:contains("Cadastrar regra")', { timeout: 15000 }),

    /** Campo de busca por nome da regra */
    getCampoBusca: () => cy.get('#nd-regras-search', { timeout: 15000 }),

    /** Botão de ordenação / filtro da tabela */
    getBotaoFiltroOrdenacao: () => cy.get('.nd-table-filter button.nd-btn-select', { timeout: 15000 }),

    /** Tabela principal de regras */
    getTabela: () => cy.get('table.nd-table', { timeout: 15000 }).first(),

    /** Linhas da tabela de regras */
    getLinhasTabela: () => cy.get('table.nd-table tbody tr', { timeout: 15000 }),

    /** Container de tabela vazia / sem resultados */
    getTabelaVaziaContainer: () => cy.get('.nd-table-empty, .nd-table-container', { timeout: 15000 }),

    /** Paginação - contagem de resultados */
    getContadorResultados: () => cy.get('.nd-pagination__count', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  AÇÕES NA TABELA (MENU AÇÕES DE CADA LINHA)
    // ══════════════════════════════════════════════

    /** Abre o menu "Ações" de uma linha específica da tabela */
    abrirMenuAcoesNaLinha: (rowIndex = 0) => {
        RegrasPage.getTabela().should('be.visible');
        RegrasPage.getLinhasTabela().eq(rowIndex).within(() => {
            cy.get('button[data-dt-action-trigger]').should('be.visible').click({ force: true });
        });
    },

    /** Clica na opção "Editar" do menu Ações */
    clicarEditarNaLinha: (rowIndex = 0) => {
        RegrasPage.abrirMenuAcoesNaLinha(rowIndex);
        cy.get('body').then(($body) => {
            if ($body.find('a[data-dt-action-key="edit"], a:contains("Editar")').length > 0) {
                cy.get('a[data-dt-action-key="edit"], a:contains("Editar")').first().click({ force: true });
            }
        });
    },

    /** Clica na opção "Excluir" do menu Ações */
    clicarExcluirNaLinha: (rowIndex = 0) => {
        RegrasPage.abrirMenuAcoesNaLinha(rowIndex);
        cy.get('body').then(($body) => {
            if ($body.find('button[data-dt-action-key="delete"], button:contains("Excluir")').length > 0) {
                cy.get('button[data-dt-action-key="delete"], button:contains("Excluir")').first().click({ force: true });
            }
        });
    },

    // ══════════════════════════════════════════════
    //  FORMULÁRIO DE CADASTRO E EDIÇÃO DE REGRA
    // ══════════════════════════════════════════════

    /** Form de Regra */
    getFormulario: () => cy.get('form#nd-regra-form', { timeout: 15000 }),

    /** Campo Nome */
    getCampoNome: () => cy.get('#nome, input[name="nome"]', { timeout: 15000 }),

    /** Campo Domínio */
    getCampoDominio: () => cy.get('#dominio, input[name="dominio"]', { timeout: 15000 }),

    /** Toggle / Checkbox Ativo */
    getToggleAtivo: () => cy.get('#ativo, input[name="ativo"]', { timeout: 15000 }),

    /** Tabela de Agentes do formulário */
    getTabelaAgentesForm: () => cy.get('section[data-dt-root="nd-regra-agentes"] table.nd-table, section[data-dt-root="nd-regra-agentes"] .nd-table', { timeout: 15000 }),

    /** Campo de busca de agentes no formulário */
    getCampoBuscaAgentesForm: () => cy.get('#nd-regra-agentes-search', { timeout: 15000 }),

    /** Botão de próxima página da tabela de agentes no formulário */
    getBotaoProximaPaginaAgentes: () => cy.get('button[aria-label="Próxima página"]', { timeout: 15000 }),

    /** Botão de página anterior da tabela de agentes no formulário */
    getBotaoPaginaAnteriorAgentes: () => cy.get('button[aria-label="Página anterior"]', { timeout: 15000 }),

    /** Select de quantidade de resultados por página na tabela de agentes */
    getSelectResultadosPorPaginaAgentes: () => cy.get('select.nd-pagination__select', { timeout: 15000 }),

    /** Linhas da tabela de agentes do formulário */
    getLinhasAgentesTabelaForm: () => cy.get('section[data-dt-root="nd-regra-agentes"] table.nd-table tbody tr', { timeout: 15000 }),

    /** Botão "Cancelar" */
    getBotaoCancelar: () => cy.get('a.nd-action-bar__cancel, button:contains("Cancelar")', { timeout: 15000 }),

    /** Botão "Confirmar" / Salvar */
    getBotaoConfirmar: () => cy.get('button.nd-action-bar__submit, button[type="submit"][form="nd-regra-form"]', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  MÉTODOS AUXILIARES
    // ══════════════════════════════════════════════

    /** Realiza busca por termo na listagem */
    buscarPorTermo: (termo: string) => {
        RegrasPage.getCampoBusca()
            .should('be.visible')
            .focus()
            .type(`{selectall}${termo}{enter}`, { force: true });
    },

    /** Preenche o formulário de Regra */
    preencherFormulario: (nome: string, dominio: string) => {
        RegrasPage.getCampoNome().should('be.visible').clear().type(nome);
        RegrasPage.getCampoDominio().should('be.visible').clear().type(dominio);
    },

    /** Submete o formulário clicando em Confirmar */
    submeterFormulario: () => {
        RegrasPage.getBotaoConfirmar().should('be.visible').click({ force: true });
    },

    /** Clica em "Cadastrar regra" na tela inicial */
    clicarCadastrarRegra: () => {
        RegrasPage.getBotaoCadastrarRegra().should('be.visible').click({ force: true });
    },

    /** Avança a página na tabela de agentes dentro do formulário */
    avancarPaginaAgentesForm: () => {
        RegrasPage.getBotaoProximaPaginaAgentes().should('be.visible').click({ force: true });
    },

    /** Volta a página na tabela de agentes dentro do formulário */
    voltarPaginaAgentesForm: () => {
        RegrasPage.getBotaoPaginaAnteriorAgentes().should('be.visible').click({ force: true });
    },

    /** Altera a quantidade de registros por página na tabela de agentes */
    alterarRegistrosPorPaginaAgentesForm: (qtd: string) => {
        RegrasPage.getSelectResultadosPorPaginaAgentes().should('be.visible').select(qtd, { force: true });
    },

    /** Busca agente pelo nome/apelido dentro do formulário de regra */
    buscarAgenteNoFormulario: (termo: string) => {
        RegrasPage.getCampoBuscaAgentesForm()
            .should('be.visible')
            .focus()
            .clear()
            .type(`${termo}{enter}`, { force: true });
    },

    // ══════════════════════════════════════════════
    //  PAGINAÇÃO AJAX DA TABELA DE AGENTES (#27945)
    //  A tabela é carregada por AJAX depois do load da página
    //  (GrupoController@searchAgentes), então todo acesso ao DOM
    //  precisa esperar o container sair do estado is-loading.
    // ══════════════════════════════════════════════

    /** Seção da aplicação (tabela de agentes) dentro do formulário de regra */
    SECAO_AGENTES: 'section[data-dt-root="nd-regra-agentes"]',

    /** Abre a edição de uma regra específica pela URL */
    abrirEdicaoDaRegra: (regraId: number | string) => cy.visit(`/controle/regras/${regraId}/edit`),

    /** Espera a tabela de agentes terminar de carregar (overlay is-loading sai) */
    aguardarTabelaAgentesCarregada: () => {
        cy.get(`${RegrasPage.SECAO_AGENTES} .nd-table-container`, { timeout: 30000 })
            .should('not.have.class', 'is-loading');
        RegrasPage.getLinhasAgentesTabelaForm().should('have.length.greaterThan', 0);
    },

    /**
     * Espera a troca de página realmente acontecer no DOM.
     *
     * Só esperar o AJAX e o `is-loading` sair não basta: entre a resposta chegar e o
     * fragmento ser trocado existe uma janela em que a tabela ainda mostra as linhas
     * ANTERIORES. Ler o DOM nessa janela faz o teste acusar "agentes repetidos entre as
     * páginas" sem que o defeito exista — é falso positivo, o pior tipo de teste.
     * A asserção abaixo é retentável e amarra na troca de verdade.
     */
    aguardarTrocaDePagina: (primeiroIdDaPaginaAnterior: string) => {
        cy.get(`${RegrasPage.SECAO_AGENTES} input[name="usuarios[]"]`, { timeout: 30000 })
            .first()
            .should('not.have.value', primeiroIdDaPaginaAnterior);
    },

    /** Total de agentes informado pela paginação ("35 resultados") */
    getTotalAgentes: () =>
        cy.get(`${RegrasPage.SECAO_AGENTES} .nd-pagination__count`, { timeout: 15000 })
            .invoke('text')
            .then((t) => Number((t.match(/\d+/) || ['0'])[0])),

    /**
     * Ids dos agentes da página atual — vem do value do checkbox, que é o
     * identificador estável. Não usar o texto da linha: em produção os agentes
     * compartilham o mesmo nome (é a causa raiz do #27945) e o texto repete.
     */
    getIdsAgentesDaPagina: () =>
        cy.get(`${RegrasPage.SECAO_AGENTES} input[name="usuarios[]"]`, { timeout: 15000 })
            .then(($inputs) => $inputs.map((_, el) => (el as HTMLInputElement).value).get()),

    /** Nomes exibidos na página atual, na ordem em que aparecem */
    getNomesAgentesDaPagina: () =>
        cy.get(`${RegrasPage.SECAO_AGENTES} table tbody tr td:last-child`, { timeout: 15000 })
            .then(($tds) => $tds.map((_, el) => (el.textContent || '').trim()).get()),

    /** Valor atual do select de resultados por página */
    getResultadosPorPagina: () =>
        cy.get(`${RegrasPage.SECAO_AGENTES} select.nd-pagination__select`)
            .invoke('val')
            .then((v) => Number(v)),

    /** Opções disponíveis no select de resultados por página */
    getOpcoesResultadosPorPagina: () =>
        cy.get(`${RegrasPage.SECAO_AGENTES} select.nd-pagination__select option`)
            .then(($o) => $o.map((_, el) => (el as HTMLOptionElement).value).get()),

    /** Botão "Próxima página" da tabela de agentes */
    getProximaPaginaAgentes: () =>
        cy.get(`${RegrasPage.SECAO_AGENTES} button[aria-label="Próxima página"]`, { timeout: 15000 }),

    /** Botão "Página anterior" da tabela de agentes */
    getPaginaAnteriorAgentes: () =>
        cy.get(`${RegrasPage.SECAO_AGENTES} button[aria-label="Página anterior"]`, { timeout: 15000 }),

    /** Marca o checkbox de um agente pelo id */
    marcarAgentePorId: (id: string) =>
        cy.get(`${RegrasPage.SECAO_AGENTES} input[name="usuarios[]"][value="${id}"]`).check({ force: true }),

    /** Desmarca o checkbox de um agente pelo id */
    desmarcarAgentePorId: (id: string) =>
        cy.get(`${RegrasPage.SECAO_AGENTES} input[name="usuarios[]"][value="${id}"]`).uncheck({ force: true }),

    /** Fecha qualquer modal/dialog se estiver aberto */
    fecharModalAbertoSeExistir: () => {
        cy.get('body').then(($body) => {
            if ($body.find('.fly-alert, .fly-dialog, [role="dialog"], .modal').length > 0) {
                cy.get('body').then(($b) => {
                    if ($b.find('button:contains("✕")').length > 0) {
                        cy.get('button:contains("✕")').first().click({ force: true });
                    } else if ($b.find('button:contains("Cancelar")').length > 0) {
                        cy.get('button:contains("Cancelar")').first().click({ force: true });
                    } else {
                        cy.get('body').type('{esc}');
                    }
                });
            }
        });
    }
};

/**
 * Page Object para a tela de Utilitários -> Perfis de Acesso (/roles/nova-area).
 *
 * Tela CRUD completa com 3 páginas:
 *   1. LISTAGEM  (/roles/nova-area) — busca, paginação, menu de ações
 *   2. CADASTRAR (/roles/nova-area/create) — formulário com campo "Nome do Perfil"
 *   3. EDITAR    (/roles/nova-area/:id/edit) — formulário com campo "Nome do Perfil"
 *   4. PERMISSÕES (/roles/nova-area/:id/permissions) — checkbox tree por seção
 *
 * Seletores descobertos via inspeção do DOM no ambiente de stage:
 *   - Título da página: "Perfis de Acesso"
 *   - Campo de busca: #nd-roles-search (placeholder "Digite um nome para buscar")
 *   - Botão cadastrar: a.nd-btn-primary[href*="/create"] ("Cadastrar perfil")
 *   - Tabela: colunas Nome, Permissões, Ações
 *   - Ações por linha: button.nd-actions-btn → menu com Gerenciar Permissões, Editar, Excluir
 *   - Paginação: select.nd-pagination__select
 *   - Formulário: input#role_name ("Nome do Perfil")
 *   - Permissões: seções Cadastros, Controle, Relatorios, Utilitarios, Analise
 */
import { ALIAS } from '../../../support/api-intercepts';

export const PerfisDeAcessoPage = {

    // ══════════════════════════════════════════════
    //  LISTAGEM (/roles/nova-area)
    // ══════════════════════════════════════════════

    /** Título principal da página */
    getTitulo: () => cy.get('.nd-title-bar .h1, .nd-title-bar__title, .nd-title-bar__left [role="heading"], h1', { timeout: 15000 }),

    /** Campo de busca */
    getCampoBusca: () => cy.get('#nd-roles-search', { timeout: 15000 }),

    /** Botão "Cadastrar perfil" */
    getBotaoCadastrar: () => cy.get('a.nd-btn-primary[href*="/roles/nova-area/create"], a.nd-btn-primary:contains("Cadastrar perfil")', { timeout: 15000 }),

    /** Tabela principal */
    getTabela: () => cy.get('table.nd-table', { timeout: 15000 }).first(),

    /** Cabeçalhos da tabela */
    getCabecalhosTabela: () => cy.get('table.nd-table thead tr th', { timeout: 15000 }),

    /** Linhas da tabela */
    getLinhasTabela: () => cy.get('table.nd-table tbody tr', { timeout: 15000 }),

    /**
     * Linha da tabela que contém o nome informado.
     * Diferente de `getLinhasTabela().eq(0)`, este seletor é retentável e só resolve
     * quando a listagem filtrada já renderizou — evita ler a listagem anterior
     * enquanto o POST /search ainda está em voo.
     */
    getLinhaPorNome: (nome: string) => cy.contains('table.nd-table tbody tr', nome, { timeout: 15000 }),

    /** Célula "Permissões" (2ª coluna) da linha do perfil informado */
    getCelulaPermissoesPorNome: (nome: string) =>
        PerfisDeAcessoPage.getLinhaPorNome(nome).find('td').eq(1),

    /** Container de estado vazio */
    getTabelaVaziaContainer: () => cy.get('.nd-table-empty, .nd-table-container', { timeout: 15000 }),

    /** Seletor de resultados por página */
    getResultadosPorPagina: () => cy.get('select.nd-pagination__select, .nd-table-pagination select', { timeout: 15000 }),

    /** Texto do total de resultados */
    getTotalResultados: () => cy.get('.nd-pagination__total, .nd-table-pagination', { timeout: 15000 }),

    /** Botão próxima página */
    getBotaoProximaPagina: () => cy.get('button.nd-pagination__btn[aria-label="Próxima página"]', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  AÇÕES NA TABELA (MENU AÇÕES)
    // ══════════════════════════════════════════════

    /**
     * Menu de ações aberto.
     *
     * CADA linha renderiza o seu próprio menu, oculto (`hidden`, `aria-hidden="true"`).
     * Numa listagem de 10 linhas há 10 menus e 30 itens no DOM simultaneamente.
     * O menu aberto é o único com a classe `nd-pop--open` (ganha `position: fixed`).
     */
    getMenuAcoesAberto: () => cy.get('.nd-table-action-menu.nd-pop--open', { timeout: 15000 }),

    /** Abre o menu "Ações" de uma linha específica */
    abrirMenuAcoesNaLinha: (rowIndex = 0) => {
        PerfisDeAcessoPage.getTabela().should('be.visible');
        PerfisDeAcessoPage.getLinhasTabela().eq(rowIndex)
            .find('button.nd-actions-btn, button[data-dt-action-trigger]')
            .should('be.visible')
            .click({ force: true });
        // Só segue adiante quando o popover realmente abriu. Sem isto, um clique
        // perdido (ex.: re-render da tabela) só apareceria passos depois.
        PerfisDeAcessoPage.getMenuAcoesAberto().should('be.visible');
    },

    /**
     * Clica numa ação do menu ABERTO, pela `data-dt-action-key`.
     *
     * Não busca o item pelo texto no body: como todas as linhas têm seu menu no DOM,
     * `cy.get('a:contains("Editar")').first()` pegaria o item da PRIMEIRA linha,
     * não o da linha aberta — e o `{ force: true }` clicaria mesmo estando oculto,
     * navegando para o perfil errado sem que o teste percebesse.
     */
    clicarAcaoPorKey: (key: 'permissions' | 'edit' | 'delete') => {
        PerfisDeAcessoPage.getMenuAcoesAberto()
            .find(`[data-dt-action-key="${key}"]`)
            .click({ force: true });
    },

    /** Clica na opção "Editar" do menu Ações */
    clicarEditarNaLinha: (rowIndex = 0) => {
        PerfisDeAcessoPage.abrirMenuAcoesNaLinha(rowIndex);
        PerfisDeAcessoPage.clicarAcaoPorKey('edit');
    },

    /** Clica na opção "Gerenciar Permissões" do menu Ações */
    clicarGerenciarPermissoesNaLinha: (rowIndex = 0) => {
        PerfisDeAcessoPage.abrirMenuAcoesNaLinha(rowIndex);
        PerfisDeAcessoPage.clicarAcaoPorKey('permissions');
    },

    /** Clica na opção "Excluir" do menu Ações */
    clicarExcluirNaLinha: (rowIndex = 0) => {
        PerfisDeAcessoPage.abrirMenuAcoesNaLinha(rowIndex);
        PerfisDeAcessoPage.clicarAcaoPorKey('delete');
    },

    // ══════════════════════════════════════════════
    //  FORMULÁRIO (CADASTRAR / EDITAR)
    // ══════════════════════════════════════════════

    /** Campo "Nome do Perfil" */
    getCampoNomePerfil: () => cy.get('input#role_name', { timeout: 15000 }),

    /** Botão de voltar (seta) na barra de título */
    getBotaoVoltar: () => cy.get('a.nd-title-bar__back[aria-label="Voltar"], a.nd-title-bar__back', { timeout: 15000 }),

    /** Botão "Cancelar" na barra de ações (href é URL absoluta) */
    getBotaoCancelar: () => cy.get('a.nd-action-bar__cancel', { timeout: 15000 }),

    /** Botão de submit (Confirmar / Atualizar / Atualizar Permissões) */
    getBotaoSubmit: () => cy.get('button.nd-btn-primary.nd-action-bar__submit, button.nd-action-bar__submit', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  PÁGINA DE PERMISSÕES (/roles/nova-area/:id/permissions)
    // ══════════════════════════════════════════════

    /** Seções de permissões (Cadastros, Controle, Relatorios, Utilitarios, Analise) */
    getSecoesPermissoes: () => cy.get('.nd-permission-section, .nd-permissions-group, [x-data]', { timeout: 15000 }),

    /** Checkbox master de uma seção de permissão — abre a seção e marca a primeira permissão funcional */
    clicarCheckboxSecao: (nomeSecao: string) => {
        // Clica no nome da seção para expandir o accordion
        cy.contains('.nd-perm-section__name', nomeSecao).click({ force: true });
        cy.wait(500);
        // Encontra o container x-data correspondente e marca a primeira permissão dentro do body da seção
        cy.contains('.nd-perm-section__name', nomeSecao)
            .closest('[x-data]')
            .find('.nd-perm-section__body input[type="checkbox"]')
            .first()
            .check({ force: true });
    },

    // ══════════════════════════════════════════════
    //  MODAL DE CONFIRMAÇÃO DE EXCLUSÃO
    // ══════════════════════════════════════════════

    /** Modal de confirmação "Excluir perfil de acesso" */
    getModalExclusao: () => cy.get('.fly-alert, .fly-dialog', { timeout: 15000 }),

    /** Título do modal de exclusão */
    getTituloModalExclusao: () => cy.get('.fly-alert__title, .fly-alert h2', { timeout: 15000 }),

    /** Botão "Sim, excluir" no modal de confirmação */
    getBotaoConfirmarExclusao: () => cy.get('button.fly-alert__btn--confirm, button:contains("Sim, excluir")', { timeout: 15000 }),

    /** Botão "Cancelar" no modal de confirmação */
    getBotaoCancelarExclusao: () => cy.get('button.fly-alert__btn--cancel', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  MÉTODOS AUXILIARES
    // ══════════════════════════════════════════════

    /** Realiza busca por termo na listagem */
    buscarPorTermo: (termo: string) => {
        PerfisDeAcessoPage.getCampoBusca()
            .should('be.visible')
            .focus()
            .type(`{selectall}${termo}{enter}`, { force: true });
    },

    /**
     * Busca um perfil pelo nome e só devolve o controle quando a listagem filtrada
     * está na tela (1 linha, contendo o nome) E não há mais busca em voo.
     *
     * Duas armadilhas desta tela:
     *
     * 1. Não usa `cy.wait('@listarPerfisDeAcesso')`: o alias é global ao teste e o
     *    `cy.wait` consome as interceptações em ordem, então uma busca tardia casaria
     *    com uma request antiga e a asserção leria a listagem não filtrada.
     *
     * 2. Digitar dispara DUAS buscas: a do `{enter}` e uma atrasada, do debounce do
     *    input. A resposta da segunda re-renderiza o `<tbody>` e derruba o menu de
     *    ações aberto logo depois — era isso que fazia o clique em "Gerenciar
     *    Permissões" cair no vazio no fluxo CRUD.
     *
     *    Esperar "nada em voo" NÃO resolve. Medição no stage digitando um nome longo:
     *
     *        +102ms RES  (1ª busca)
     *        +356ms REQ
     *        +472ms RES  ← nada em voo aqui, mas ainda falta um re-render
     *        +751ms REQ  ← debounce dispara só agora
     *        +861ms RES  ← este é o que derruba o menu
     *
     *    Por isso exigimos uma JANELA DE SILÊNCIO desde a última resposta, e não
     *    apenas a fila vazia.
     */
    buscarPerfilPorNome: (nome: string) => {
        const SILENCIO_MS = 1000;
        const rede = { emVoo: 0, ultimaResposta: 0 };

        // Mesmo nome de alias do setup: quem registra por último atende a request,
        // então manter o nome preserva os `cy.wait('@listarPerfisDeAcesso')` do spec.
        cy.intercept('POST', '**/roles/nova-area/search*', (req) => {
            rede.emVoo++;
            req.continue(() => {
                rede.emVoo--;
                rede.ultimaResposta = Date.now();
            });
        }).as(ALIAS.listarPerfisDeAcesso);

        PerfisDeAcessoPage.buscarPorTermo(nome);
        PerfisDeAcessoPage.getLinhasTabela().should('have.length', 1);
        PerfisDeAcessoPage.getLinhasTabela().first().should('contain.text', nome);

        cy.wrap(null, { log: false }).should(() => {
            expect(rede.emVoo, 'buscas de perfis ainda em voo').to.equal(0);
            expect(Date.now() - rede.ultimaResposta, 'ms desde a última resposta de busca')
                .to.be.greaterThan(SILENCIO_MS);
        });
    },

    /** Limpa o campo de busca */
    limparBusca: () => {
        PerfisDeAcessoPage.getCampoBusca()
            .should('be.visible')
            .focus()
            .type('{selectall}{backspace}{enter}', { force: true });
    },
};

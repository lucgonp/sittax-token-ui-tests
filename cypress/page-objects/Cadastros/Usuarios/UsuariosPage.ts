/**
 * Page Object para a tela de Cadastros -> Usuários (/usuarios e /usuarios/create).
 * Encapsula os seletores e ações baseados na interface do usuário (sem cy.visit()).
 */
export const UsuariosPage = {

    // ══════════════════════════════════════════════
    //  LISTAGEM DE USUÁRIOS (/usuarios)
    // ══════════════════════════════════════════════

    /** Título principal da página de Usuários */
    getTitulo: () => cy.get('.nd-title-bar .h1, .nd-title-bar__title, h1', { timeout: 15000 }),

    /** Botão "Cadastrar usuário" */
    getBotaoCadastrarUsuario: () => cy.get('a.nd-btn-primary[href*="/usuarios/create"], button:contains("Cadastrar usuário"), a:contains("Cadastrar usuário")', { timeout: 15000 }),

    /** Campo de busca por nome ou e-mail */
    getCampoBusca: () => cy.get('#nd-usuarios-search', { timeout: 15000 }),

    /** Botão de ordenação */
    getBotaoFiltroOrdenacao: () => cy.get('.nd-table-filter button.nd-btn-select', { timeout: 15000 }),

    /** Botão de alternar o painel de filtros */
    getBotaoFiltro: () => cy.get('#filter-toggle-nd-usuarios-filter, button.filter-toggle', { timeout: 15000 }),

    /** Painel deslizante de filtros */
    getPainelFiltro: () => cy.get('.filter-panel-slide, .nd-filter-panel', { timeout: 15000 }),

    /** Select Perfil de Acesso no filtro */
    getSelectGrupoFiltro: () => cy.get('#filter-grupo', { timeout: 15000 }),

    /** Select Incluir Inativos no filtro */
    getSelectInativosFiltro: () => cy.get('#filter-mostrar-inativos', { timeout: 15000 }),

    /** Botão "Aplicar filtros" */
    getBotaoAplicarFiltro: () => cy.get('button.nd-filter-panel-apply', { timeout: 15000 }),

    /** Botão "Limpar filtros" */
    getBotaoLimparFiltro: () => cy.get('button.nd-filter-panel-clear', { timeout: 15000 }),

    /** Tabela principal de usuários */
    getTabela: () => cy.get('table.nd-table', { timeout: 15000 }).first(),

    /** Linhas da tabela de usuários */
    getLinhasTabela: () => cy.get('table.nd-table tbody tr', { timeout: 15000 }),

    /** Container de tabela vazia / sem resultados */
    getTabelaVaziaContainer: () => cy.get('.nd-table-empty, .nd-table-container', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  AÇÕES NA TABELA (MENU AÇÕES)
    // ══════════════════════════════════════════════

    /** Abre o menu "Ações" de uma linha específica */
    abrirMenuAcoesNaLinha: (rowIndex = 0) => {
        UsuariosPage.getTabela().should('be.visible');
        UsuariosPage.getLinhasTabela().eq(rowIndex).within(() => {
            cy.get('button[data-dt-action-trigger]').should('be.visible').click({ force: true });
        });
    },

    /** Clica na opção "Editar" do menu Ações */
    clicarEditarNaLinha: (rowIndex = 0) => {
        UsuariosPage.abrirMenuAcoesNaLinha(rowIndex);
        cy.get('body').then(($body) => {
            if ($body.find('a[data-dt-action-key="edit"], a:contains("Editar")').length > 0) {
                cy.get('a[data-dt-action-key="edit"], a:contains("Editar")').first().click({ force: true });
            }
        });
    },

    /** Clica na opção "Excluir" do menu Ações */
    clicarExcluirNaLinha: (rowIndex = 0) => {
        UsuariosPage.abrirMenuAcoesNaLinha(rowIndex);
        cy.get('body').then(($body) => {
            if ($body.find('button[data-dt-action-key="delete"], button:contains("Excluir")').length > 0) {
                cy.get('button[data-dt-action-key="delete"], button:contains("Excluir")').first().click({ force: true });
            }
        });
    },

    // ══════════════════════════════════════════════
    //  FORMULÁRIO DE CADASTRO E EDIÇÃO (/usuarios/create)
    // ══════════════════════════════════════════════

    /** Form de Usuário */
    getFormulario: () => cy.get('form#nd-usuario-form', { timeout: 15000 }),

    /** Campo Nome */
    getCampoNome: () => cy.get('#name, input[name="name"]', { timeout: 15000 }),

    /** Campo E-mail */
    getCampoEmail: () => cy.get('#email, input[name="email"]', { timeout: 15000 }),

    /** Campo Senha */
    getCampoSenha: () => cy.get('#password, input[name="password"]', { timeout: 15000 }),

    /** Campo Descrição (Apelido) */
    getCampoDescricao: () => cy.get('#description, input[name="description"]', { timeout: 15000 }),

    /** Select Grupo / Perfil de permissão */
    getSelectGrupoPermissao: () => cy.get('#role_id, select[name="role_id"]', { timeout: 15000 }),

    /** Botão "Cancelar" */
    getBotaoCancelar: () => cy.get('a.nd-action-bar__cancel, button:contains("Cancelar")', { timeout: 15000 }),

    /** Botão "Confirmar" / Salvar */
    getBotaoConfirmar: () => cy.get('button.nd-action-bar__submit, button[type="submit"][form="nd-usuario-form"]', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  MÉTODOS AUXILIARES
    // ══════════════════════════════════════════════

    /** Realiza busca por termo na listagem */
    buscarPorTermo: (termo: string) => {
        UsuariosPage.getCampoBusca()
            .should('be.visible')
            .focus()
            .type(`{selectall}${termo}{enter}`, { force: true });
    },

    /** Preenche o formulário de Usuário */
    preencherFormulario: (nome: string, email: string, senha?: string, descricao?: string, roleId = '1') => {
        UsuariosPage.getCampoNome().should('be.visible').clear().type(nome);
        UsuariosPage.getCampoEmail().should('be.visible').clear().type(email);

        if (senha) {
            UsuariosPage.getCampoSenha().should('be.visible').clear().type(senha);
        }

        if (descricao) {
            UsuariosPage.getCampoDescricao().should('be.visible').clear().type(descricao);
        }

        UsuariosPage.getSelectGrupoPermissao().select(roleId, { force: true });
    },

    /** Submete o formulário de usuário */
    submeterFormulario: () => {
        UsuariosPage.getBotaoConfirmar().should('be.visible').click({ force: true });
    },

    /** Clica em "Cadastrar usuário" na interface */
    clicarCadastrarUsuario: () => {
        UsuariosPage.getBotaoCadastrarUsuario().should('be.visible').click({ force: true });
    }
};

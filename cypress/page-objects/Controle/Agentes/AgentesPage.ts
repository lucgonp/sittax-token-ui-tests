/**
 * Page Object para a tela de Controle de Agentes (/usuarios/agentes/nova-area).
 * Encapsula os seletores e ações baseados no DOM real da aplicação Sittax Token.
 */
export const AgentesPage = {

    // ══════════════════════════════════════════════
    //  SELETORES
    // ══════════════════════════════════════════════

    /** Título principal da página de Agentes */
    getTitulo: () => cy.get('.nd-title-bar .h1', { timeout: 15000 }),

    /** Botão "Cadastrar agente" na barra de ações superior */
    getBotaoCadastrarAgente: () => cy.get('a[href*="/usuarios/agentes/create"], a.nd-action-bar__create', { timeout: 15000 }),

    /** Campo de busca por nome ou e-mail do agente */
    getCampoBusca: () => cy.get('#nd-agentes-search', { timeout: 15000 }),

    /** Botão de alternar o painel de filtros */
    getBotaoFiltro: () => cy.get('#filter-toggle-nd-agentes-filter, button.nd-action-bar__filter', { timeout: 15000 }),

    /** Painel de filtros */
    getPainelFiltro: () => cy.get('.nd-filter-panel, #nd-agentes-filter, [data-dt-filter-panel]', { timeout: 15000 }),

    /** Select de status no painel de filtros */
    getSelectStatusFiltro: () => cy.get('#filter-status, select[name*="status"]', { timeout: 15000 }),

    /** Botão aplicar filtros */
    getBotaoAplicarFiltro: () => cy.get('button.nd-filter-panel-apply, button:contains("Aplicar")', { timeout: 15000 }),

    /** Botão limpar filtros */
    getBotaoLimparFiltro: () => cy.get('button.nd-filter-panel-clear, button:contains("Limpar")', { timeout: 15000 }),

    /** Botão fechar painel de filtros */
    getBotaoFecharFiltro: () => cy.get('button.filter-panel-close', { timeout: 15000 }),

    /** Botão de exportação "Relatório" */
    getBotaoExportar: () => cy.get('#nd-agentes-export-btn', { timeout: 15000 }),

    /** Tabela principal de agentes */
    getTabelaAgentes: () => cy.get('table.nd-table', { timeout: 15000 }),

    /** Botão Ações de uma linha da tabela */
    getBotaoAcoes: (index = 0) => cy.get('table.nd-table [data-dt-action-trigger]', { timeout: 15000 }).eq(index),

    // ══════════════════════════════════════════════
    //  CAMPOS DO FORMULÁRIO DE AGENTE
    // ══════════════════════════════════════════════

    /** Campo Nome do agente (somente na tela de criação) */
    getCampoNome: () => cy.get('#ag_nome', { timeout: 15000 }),

    /** Campo E-mail do agente */
    getCampoEmail: () => cy.get('#ag_email', { timeout: 15000 }),

    /** Campo Senha do agente (somente na tela de criação) */
    getCampoSenha: () => cy.get('#ag_password', { timeout: 15000 }),

    /** Campo Descrição/Apelido do agente */
    getCampoApelido: () => cy.get('#ag_apelido', { timeout: 15000 }),

    /** Botão "Confirmar" (submit) nos formulários de criação e edição */
    getBotaoConfirmar: () => cy.get('button.nd-action-bar__submit', { timeout: 15000 }),

    /** Link "Cancelar" nos formulários de criação e edição */
    getBotaoCancelar: () => cy.get('a.nd-action-bar__cancel', { timeout: 15000 }),

    /** Botão "Excluir agente" no modal de confirmação de exclusão */
    getBotaoConfirmarExclusao: () => cy.get('button.fly-cnpj-confirm__confirm', { timeout: 15000 }),

    /** Botão "Cancelar" no modal de confirmação de exclusão */
    getBotaoCancelarExclusao: () => cy.get('button.fly-cnpj-confirm__cancel', { timeout: 15000 }),

    /** Checkbox "Forçar exclusão" no modal de exclusão */
    getCheckboxForcarExclusao: () => cy.get('input.fly-cnpj-confirm__checkbox-input', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  AÇÕES E MÉTODOS AUXILIARES
    // ══════════════════════════════════════════════

    /** Abre o menu Ações da linha indicada */
    abrirMenuAcoes: (rowIndex = 0) => {
        cy.get('table.nd-table', { timeout: 15000 }).should('be.visible');
        AgentesPage.fecharModalAbertoSeExistir();
        AgentesPage.getBotaoAcoes(rowIndex).should('be.visible').click({ force: true });
    },

    /** Clica em um item do menu Ações visível pelo texto no menu aberto */
    clicarAcaoPorTexto: (texto: string) => {
        cy.get('.nd-table-action-menu:visible, [data-dt-action-panel]:visible, [role="menu"]:visible', { timeout: 15000 })
            .find('button, a')
            .filter(':visible')
            .contains(texto)
            .click({ force: true });
    },

    // ══════════════════════════════════════════════
    //  MÉTODOS DE CRUD
    // ══════════════════════════════════════════════

    /**
     * Preenche o formulário de criação de agente.
     * Todos os campos são obrigatórios na tela de cadastro.
     */
    preencherFormularioCriar: (nome: string, email: string, senha: string, apelido: string) => {
        AgentesPage.getCampoNome().clear().type(nome);
        AgentesPage.getCampoEmail().clear().type(email);
        AgentesPage.getCampoSenha().clear().type(senha);
        AgentesPage.getCampoApelido().clear().type(apelido);
    },

    /**
     * Preenche os campos editáveis do formulário de edição.
     * Na edição, o campo Nome é somente leitura.
     */
    preencherFormularioEditar: (apelido: string, email?: string) => {
        AgentesPage.getCampoApelido().clear().type(apelido);
        if (email) {
            AgentesPage.getCampoEmail().clear().type(email);
        }
    },

    /** Clica no botão "Confirmar" para submeter o formulário */
    clicarConfirmar: () => {
        AgentesPage.getBotaoConfirmar().should('be.visible').click({ force: true });
    },

    /** Clica no link "Cancelar" para voltar à listagem */
    clicarCancelar: () => {
        AgentesPage.getBotaoCancelar().click({ force: true });
    },

    /** Confirma a exclusão do agente no modal de confirmação */
    confirmarExclusao: () => {
        AgentesPage.getBotaoConfirmarExclusao().should('be.visible').click({ force: true });
    },

    /** Pesquisa um agente pelo nome no campo de busca da listagem */
    buscarAgentePorNome: (nome: string) => {
        // Usa {selectall} em vez de clear() para evitar disparar
        // uma requisição POST /search intermediária que re-renderiza a tabela
        AgentesPage.getCampoBusca()
            .should('be.visible')
            .focus()
            .type(`{selectall}${nome}{enter}`, { force: true });
    },

    /** Fecha modal ou drawer aberto na tela se existir */
    fecharModalAbertoSeExistir: () => {
        cy.get('body').then(($body) => {
            if ($body.find('.fly-dialog, .fly-cnpj-confirm, [role="dialog"], .modal, .nd-drawer').length > 0) {
                cy.get('body').then(($b) => {
                    if ($b.find('button.nd-group-view__close').length > 0) {
                        cy.get('button.nd-group-view__close').first().click({ force: true });
                    } else if ($b.find('button.nd-cert-view__close').length > 0) {
                        cy.get('button.nd-cert-view__close').first().click({ force: true });
                    } else if ($b.find('button.nd-proc-view__close').length > 0) {
                        cy.get('button.nd-proc-view__close').first().click({ force: true });
                    } else if ($b.find('button.nd-agent-password__close').length > 0) {
                        cy.get('button.nd-agent-password__close').first().click({ force: true });
                    } else if ($b.find('button.fly-cnpj-confirm__cancel').length > 0) {
                        cy.get('button.fly-cnpj-confirm__cancel').first().click({ force: true });
                    } else if ($b.find('button:contains("✕")').length > 0) {
                        cy.get('button:contains("✕")').first().click({ force: true });
                    } else if ($b.find('button:contains("Fechar")').length > 0) {
                        cy.get('button:contains("Fechar")').first().click({ force: true });
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

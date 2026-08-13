/**
 * Page Object para os fluxos de Impersonate (/users) e Usuário do Sistema (/rep/users).
 *
 * Estrutura confirmada no ambiente de stage:
 *   - /users:
 *       - Campo busca: input#filter_razao_social (placeholder "Pesquisar")
 *       - Ícone Impersonate: a[href*="/users/impersonate/"] (img user-monitor.ico)
 *   - /rep/users:
 *       - Botão Novo Usuário: a.button (texto "+ Usuário")
 *       - Campos do Modal (#modalBasic):
 *           - Nome: input#name
 *           - E-mail: input#email
 *           - Senha: input#password
 *           - Perfil (Select): select#role_id (val=1 Administrador, val=2 Gestor, val=3 Operador)
 *           - Botão Salvar: button.button-send[type="submit"]
 *       - Ícone Editar na tabela: a[onclick*="edit"] (img edit.ico)
 */
export const RepUsuariosPage = {

    // ══════════════════════════════════════════════
    //  1. TELA /users (Listagem e Impersonate)
    // ══════════════════════════════════════════════

    /** Campo de busca na tela de Usuários (/users) — Suporta layouts legado (#filter_razao_social) e novo (#nd-usuarios-search) */
    // O campo de busca de /users e de /rep/users é `filter_name` — não `filter_razao_social`.
    // Sem ele na lista, o `.first()` caía em outro input e a busca nunca era aplicada.
    getCampoBuscaUsers: () => cy.get('#filter_name, input[name="filter_name"], #filter_razao_social, #nd-usuarios-search, input[placeholder*="Pesquisar"], input[type="search"], input[name="search"]', { timeout: 15000 }).first(),

    /** Tabela de usuários em /users */
    getTabelaUsers: () => cy.get('table', { timeout: 15000 }).first(),

    /** Realiza busca por termo em /users */
    buscarEmUsers: (termo: string) => {
        RepUsuariosPage.getCampoBuscaUsers()
            .should('be.visible')
            .clear({ force: true })
            .type(`${termo}{enter}`, { force: true });
        cy.wait(1000);
        RepUsuariosPage.getTabelaUsers().should('be.visible');
    },

    /** Clica ou navega até a URL do ícone "Assumir Controle" (user-monitor.ico / /users/impersonate/*) na linha de qa@si */
    clicarAssumirControle: () => {
        RepUsuariosPage.getTabelaUsers().should('be.visible');
        cy.get('body').then(($body) => {
            let $link = $body.find('table tbody tr:contains("qa@si") a[href*="impersonate"]').first();
            if ($link.length === 0) {
                $link = $body.find('a[href*="/users/impersonate/"], img[src*="user-monitor.ico"]').first().closest('a');
            }
            if ($link.length > 0 && $link.attr('href')) {
                const urlImpersonate = $link.attr('href') as string;
                cy.log(`Navegando diretamente para Impersonate URL: ${urlImpersonate}`);
                cy.visit(urlImpersonate);
            } else {
                cy.get('a[href*="/users/impersonate/"]').first().click({ force: true });
            }
        });
    },

    // ══════════════════════════════════════════════
    //  2. TELA /rep/users (Usuários do Sistema)
    // ══════════════════════════════════════════════

    /** Tabela de usuários do sistema (/rep/users) */
    getTabelaRepUsers: () => cy.get('table, .nd-table, .table, .table-responsive, [role="grid"]', { timeout: 25000 }).first(),

    /** Botão de cadastrar gestor em /rep/users */
    getBotaoCadastrarRepUser: () => cy.get('a.nd-btn-primary[href*="/rep/users/create"], a[href*="/rep/users/create"], a:contains("Cadastrar gestor"), a.button, .button a', { timeout: 15000 }).first(),

    /** Campo de busca em /rep/users */
    getCampoBuscaRepUsers: () => cy.get('#filter_razao_social, #nd-usuarios-search, input[placeholder*="Pesquisar"]', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  3. FORMULÁRIO DE GESTOR (Modal / Form / Página)
    // ══════════════════════════════════════════════

    /** Clica ou navegando até /rep/users/create para cadastrar gestor */
    clicarCadastrarRepUser: () => {
        cy.get('body').then(($body) => {
            const $btn = $body.find('a[href*="/rep/users/create"], a:contains("Cadastrar gestor")').first();
            if ($btn.length > 0 && $btn.attr('href')) {
                cy.visit($btn.attr('href') as string);
            } else {
                cy.visit('/rep/users/create');
            }
        });
        RepUsuariosPage.aguardarFormularioCarregado();
    },

    /** Aguarda carregamento do formulário (campo #name ou input de nome visível) */
    aguardarFormularioCarregado: () => {
        cy.get('#name, input[name="name"], #nome, input[name="nome"]', { timeout: 20000 }).should('be.visible');
    },

    /** Alias para aguardarFormularioCarregado (compatibilidade) */
    aguardarModalAberto: () => {
        cy.get('#name, input[name="name"], #nome, input[name="nome"]', { timeout: 20000 }).should('be.visible');
    },

    /** Campo Nome (#name) */
    getCampoNome: () => cy.get('#name, input[name="name"], #nome', { timeout: 15000 }).first(),

    /** Campo E-mail (#email) */
    getCampoEmail: () => cy.get('#email, input[name="email"]', { timeout: 15000 }).first(),

    /** Campo Senha (#password) */
    getCampoSenha: () => cy.get('#password, input[name="password"], #senha', { timeout: 5000 }),

    /** Select Perfil (#role_id) */
    getSelectPerfil: () => cy.get('#role_id, select[name*="role"], select[name*="perfil"], select', { timeout: 15000 }).first(),

    /** Botão Salvar (button.button-send, button[type="submit"]) */
    getBotaoSalvar: () => cy.get('button.button-send, button.nd-action-bar__submit, button[type="submit"], input[type="submit"]', { timeout: 15000 }).first(),

    /** Preenche o formulário de cadastro de um Gestor (role_id = 2) */
    preencherFormularioGestor: (nome: string, email: string, senha = 'sittax123') => {
        RepUsuariosPage.aguardarFormularioCarregado();

        RepUsuariosPage.getCampoNome().should('be.visible').clear({ force: true }).type(nome, { force: true });
        RepUsuariosPage.getCampoEmail().should('be.visible').clear({ force: true }).type(email, { force: true });

        cy.get('body').then(($m) => {
            if ($m.find('#password, input[name="password"]').length > 0) {
                RepUsuariosPage.getCampoSenha().clear({ force: true }).type(senha, { force: true });
            }
            if ($m.find('#role_id, select[name*="role"], select[name*="perfil"]').length > 0) {
                cy.get('#role_id, select[name*="role"], select[name*="perfil"]').first().select('2', { force: true });
            } else if ($m.find('select').length > 0) {
                cy.get('select').first().select('2', { force: true });
            }
        });
    },

    /** Preenche alteração de dados do Gestor (edição) */
    preencherEdicaoGestor: (novoNome: string) => {
        RepUsuariosPage.aguardarFormularioCarregado();
        RepUsuariosPage.getCampoNome().should('be.visible').clear({ force: true }).type(novoNome, { force: true });
    },

    /** Submete o formulário chamando submit() na form para garantir validação e envio */
    submeterFormulario: () => {
        cy.esconderWidgetDeChat();
        cy.get('body').then(($body) => {
            const $form = $body.find('form').first();
            if ($form.length > 0) {
                const $btnSubmit = $form.find('button[type="submit"], input[type="submit"], button.button-send, .button-send').first();
                if ($btnSubmit.length > 0) {
                    cy.wrap($btnSubmit).click({ force: true });
                }
                cy.wrap($form).submit();
            } else {
                RepUsuariosPage.getBotaoSalvar().should('be.visible').click({ force: true });
            }
        });
    },

    /** Clica ou navega para a edição da linha do Gestor */
    clicarEditarNaLinha: (identificador?: string) => {
        RepUsuariosPage.getTabelaRepUsers().should('be.visible');

        cy.get('body').then(($body) => {
            let $row = identificador ? $body.find(`table tbody tr:contains("${identificador}")`) : $body.find('table tbody tr').first();
            if ($row.length === 0) {
                $row = $body.find('table tbody tr').first();
            }
            const $editLink = $row.find('a[href*="edit"], a[onclick*="edit"], img[src*="edit.ico"]').first().closest('a');
            if ($editLink.length > 0 && $editLink.attr('href') && !$editLink.attr('href')?.includes('javascript')) {
                cy.visit($editLink.attr('href') as string);
            } else if ($editLink.length > 0) {
                cy.wrap($editLink).click({ force: true });
            } else {
                cy.get('a[href*="edit"]').first().click({ force: true });
            }
        });
        RepUsuariosPage.aguardarFormularioCarregado();
    },

    /** Valida que um Gestor (por nome ou e-mail) é exibido na tabela de /rep/users */
    validarGestorNaTabela: (textoEsperado: string) => {
        cy.get('body').then(($body) => {
            const $search = $body.find('#filter_razao_social, #nd-usuarios-search, input[placeholder*="Pesquisar"], input[type="search"]').first();
            if ($search.length > 0) {
                cy.wrap($search).clear({ force: true }).type(`${textoEsperado}{enter}`, { force: true });
                cy.wait(1000);
            }
        });
        RepUsuariosPage.getTabelaRepUsers().should('be.visible').and('contain.text', textoEsperado);
    }
};

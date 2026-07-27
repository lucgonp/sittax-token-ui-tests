/**
 * Page Object da barra de navegação principal (nav.nd-navbar).
 *
 * Encapsula a navegação entre telas do jeito que um USUÁRIO faria: clicando nos
 * itens do menu (e passando o mouse para abrir os dropdowns), em vez de usar
 * cy.visit() com a URL da rota.
 *
 * Estrutura do menu (stage):
 *   - Dashboard              (link direto)
 *   - Controle   ▾ → Agentes, Certificados, Importações, Convites,
 *                    Compartilhamentos, Monitoramento, Regras
 *   - Cadastros  ▾ → Usuários, Grupos
 *   - Relatórios ▾ → (abrem em nova aba — target=_blank)
 *   - Utilitários▾ → Atualizações, Logs, Perfis de Acesso, Template de E-mail,
 *                    Assinar Documento
 */
export const Navbar = {

    /** Container da navbar (existe em toda página autenticada) */
    get: () => cy.get('nav.nd-navbar', { timeout: 20000 }),

    /** Garante que o app está carregado (navbar visível) */
    deveEstarCarregada: () => Navbar.get().should('be.visible'),

    /** Clica num item direto do menu (ex.: "Dashboard") */
    irParaItem: (texto: string) => {
        Navbar.get().find('a.nd-navbar__item').contains(texto.trim()).click();
    },

    /**
     * Navega abrindo um dropdown do menu principal e clicando no item — como um
     * usuário: passa o mouse para abrir o painel (Alpine `@mouseenter`) e clica.
     * @param menu  texto do botão do dropdown (ex.: "Controle", "Cadastros")
     * @param item  texto do link dentro do painel (ex.: "Certificados")
     */
    navegar: (menu: string, item: string) => {
        Navbar.get()
            .contains('.nd-nav-dropdown button.nd-navbar__item', menu.trim())
            .closest('.nd-nav-dropdown')
            .as('ndDropdown');

        // Hover abre o painel (open = true); depois clicamos no link.
        cy.get('@ndDropdown').trigger('mouseenter');
        cy.get('@ndDropdown')
            .find('.nd-nav-dropdown__panel')
            .contains('a.nd-nav-dropdown__link', item.trim())
            .click({ force: true });
    },

    // ── Conveniências por seção ──────────────────────────────
    dashboard: () => Navbar.irParaItem('Dashboard'),
    controle: (item: string) => Navbar.navegar('Controle', item),
    cadastros: (item: string) => Navbar.navegar('Cadastros', item),
    utilitarios: (item: string) => Navbar.navegar('Utilitários', item),
};

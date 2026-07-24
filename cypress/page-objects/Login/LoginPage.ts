/**
 * Page Object para a tela de Login do Sittax Token.
 *
 * Encapsula os seletores e ações da autenticação (POST /login).
 */
export const LoginPage = {

    // ══════════════════════════════════════════════
    //  SELETORES
    // ══════════════════════════════════════════════

    /** Campo de e-mail */
    getCampoEmail: () =>
        cy.get('input[type="email"], input[name="email"], input[placeholder*="mail" i]', { timeout: 15000 }),

    /** Campo de senha */
    getCampoSenha: () =>
        cy.get('input[type="password"], input[name="password"]', { timeout: 10000 }),

    /** Botão de submit do formulário de login */
    getBotaoEntrar: () =>
        cy.get('button[type="submit"], button:contains("Entrar"), button:contains("Login")', { timeout: 10000 }),

    /** Indicador de sessão ativa (botão do avatar na navbar) */
    getAvatarUsuario: () => cy.get('button[aria-label="Menu do usuário"]'),

    // ══════════════════════════════════════════════
    //  AÇÕES
    // ══════════════════════════════════════════════

    /** Preenche o formulário e submete. */
    preencherESubmeter: (email: string, senha: string) => {
        LoginPage.getCampoEmail().should('be.visible').clear().type(email);
        LoginPage.getCampoSenha().should('be.visible').clear().type(senha, { log: false });
        LoginPage.getBotaoEntrar().should('be.visible').click();
    },
};

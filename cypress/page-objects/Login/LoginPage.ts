/**
 * Page Object para a tela de Login do Sittax Token.
 *
 * Encapsula os seletores e ações da autenticação (POST /login) e recuperação de senha.
 */
export const LoginPage = {

    // ══════════════════════════════════════════════
    //  SELETORES DA TELA DE LOGIN
    // ══════════════════════════════════════════════

    /** Campo de e-mail/usuário no login */
    getCampoEmail: () =>
        cy.get('input[type="email"], input[name="email"], input[placeholder*="mail" i]', { timeout: 15000 }),

    /** Campo de senha no login */
    getCampoSenha: () =>
        cy.get('input[type="password"], input[name="password"]', { timeout: 10000 }),

    /** Botão de submit do formulário de login */
    getBotaoEntrar: () =>
        cy.get('button[type="submit"], button:contains("Entrar"), button:contains("Login")', { timeout: 10000 }),

    /** Indicador de sessão ativa (botão do avatar na navbar) */
    getAvatarUsuario: () => cy.get('button[aria-label="Menu do usuário"]'),

    /** Link "Esqueci minha senha" */
    getLinkEsqueciMinhaSenha: () =>
        cy.get('a.nl-login__forgot, a[href*="/forgot-password"], a:contains("Esqueci minha senha")', { timeout: 10000 }),

    // ══════════════════════════════════════════════
    //  SELETORES DA TELA DE RECUPERAÇÃO DE SENHA
    // ══════════════════════════════════════════════

    /** Campo de e-mail na tela de recuperação de senha */
    getCampoEmailRecuperacao: () =>
        cy.get('form[action*="/forgot-password"] input[name="email"], #email', { timeout: 10000 }),

    /** Botão de submeter solicitação de recuperação de senha */
    getBotaoEnviarRecuperacao: () =>
        cy.get('form[action*="/forgot-password"] button[type="submit"], button.nl-login__submit', { timeout: 10000 }),

    /** Link para retornar para a tela de login */
    getLinkRetornarLogin: () =>
        cy.get('a.nl-login__back, a[href*="/login"]', { timeout: 10000 }),

    // ══════════════════════════════════════════════
    //  AÇÕES
    // ══════════════════════════════════════════════

    /** Clica no link "Esqueci minha senha" */
    clicarEsqueciMinhaSenha: () => {
        LoginPage.getLinkEsqueciMinhaSenha().should('be.visible').click();
    },

    /** Preenche o formulário de login e submete. */
    preencherESubmeter: (email: string, senha: string) => {
        LoginPage.getCampoEmail().should('be.visible').clear().type(email);
        LoginPage.getCampoSenha().should('be.visible').clear().type(senha, { log: false });
        LoginPage.getBotaoEntrar().should('be.visible').click();
    },

    /** Preenche o e-mail de recuperação de senha e submete o formulário */
    solicitarRecuperacaoSenha: (email: string) => {
        LoginPage.getCampoEmailRecuperacao().should('be.visible').clear().type(email);
        LoginPage.getBotaoEnviarRecuperacao().should('be.visible').click();
    }
};

/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Realiza login na aplicação Sittax Token.
     * @param email - E-mail do usuário
     * @param password - Senha do usuário
     */
    logar(email: string, password: string): Chainable<void>;

    /**
     * Login com o usuário padrão (fixture Login/login.json).
     */
    loginPadrao(): Chainable<void>;

    /**
     * Navega até a página de Grupos.
     */
    navegarParaGrupos(): Chainable<void>;
  }
}

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

    /**
     * Navega até a página de Regras (Controle → Regras) via navbar.
     */
    navegarParaRegras(): Chainable<void>;

    /**
     * Navega até a página de Usuários (Cadastros → Usuários) via navbar.
     */
    navegarParaUsuarios(): Chainable<void>;

    /**
     * Navega até um relatório específico (Relatórios → item) via navbar.
     * @param nomeRelatorio - Nome do relatório conforme aparece no menu.
     */
    navegarParaRelatorio(nomeRelatorio: string): Chainable<void>;

    /**
     * Esconde o widget de chat da Movidesk (chrome de terceiro) que é `position: fixed`
     * no canto inferior direito e cobre o botão primário da barra de ações.
     */
    esconderWidgetDeChat(): Chainable<void>;
  }
}

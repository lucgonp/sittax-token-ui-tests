/// <reference types="cypress" />

import { LoginPage } from '../page-objects/Login/LoginPage';
import { setupLoginIntercepts } from './api-intercepts';

/**
 * Realiza login na aplicação Sittax Token.
 *
 * Usa cy.session() para cachear a sessão autenticada — o login por UI acontece
 * uma única vez e é reutilizado entre testes e specs, reduzindo drasticamente o
 * tempo de execução da suíte.
 */
Cypress.Commands.add('logar', (email: string, password: string) => {
    if (!email || !password) {
        throw new Error('Parâmetros inválidos para cy.logar: email e password são obrigatórios');
    }

    cy.session(
        email,
        () => {
            setupLoginIntercepts();
            cy.visit('/');
            LoginPage.preencherESubmeter(email, password);
            // Aguarda o redirecionamento pós-login (sai da tela de login)
            cy.url({ timeout: 20000 }).should('not.include', '/login');
            // Confirma que a sessão autenticada acessa uma página protegida.
            // Usa o título da página de Grupos (elemento estável) como âncora.
            cy.visit('/grupos');
            cy.get('.nd-title-bar__left [role="heading"]', { timeout: 20000 })
                .should('contain', 'Grupos');
        },
        {
            // Revalida a sessão restaurada do cache: se o cookie de auth expirou,
            // /dashboard redireciona para /login e o cy.session refaz o setup.
            validate() {
                cy.visit('/dashboard');
                cy.url().should('not.include', '/login');
            },
            cacheAcrossSpecs: true,
        },
    );
});

/**
 * Navega até a página de listagem de Grupos e aguarda o título renderizar.
 * Usa o título da barra de página (não o link oculto da navbar).
 */
Cypress.Commands.add('navegarParaGrupos', () => {
    cy.visit('/grupos');
    cy.get('.nd-title-bar__left [role="heading"]', { timeout: 15000 })
        .should('be.visible')
        .and('contain', 'Grupos');
});

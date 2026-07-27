/// <reference types="cypress" />

import { LoginPage } from '../page-objects/Login/LoginPage';
import { Navbar } from '../page-objects/Navbar';
import { setupLoginIntercepts } from './api-intercepts';

/**
 * Fecha o modal "Novidade!" (`.fly-aviso`) que SEMPRE aparece na dashboard após o
 * login e cobre a navbar (position:fixed, z-index:1000), bloqueando a navegação
 * pelo menu. Precisa ser fechado ANTES de qualquer interação/assert na navbar.
 *
 * Ele renderiza de forma assíncrona; fazemos um poll curto: assim que aparecer,
 * clicamos no ✕ (`.fly-dialog__close`) e confirmamos o fechamento. Se não aparecer
 * dentro da janela, seguimos (defensivo, caso deixe de ser exibido).
 */
function fecharModalNovidades(tentativas = 8): void {
    cy.get('body').then(($b) => {
        const $aviso = $b.find('.fly-aviso').filter(':visible');
        if ($aviso.length > 0) {
            cy.get('.fly-aviso .fly-dialog__close, .fly-aviso [data-dialog-close="true"]', { timeout: 8000 })
                .first()
                .click({ force: true });
            // Confirma o fechamento (removido do DOM ou oculto) antes de prosseguir.
            cy.get('body').should(($b2) => {
                const $a = $b2.find('.fly-aviso');
                expect($a.length === 0 || $a.filter(':visible').length === 0, 'modal Novidade! fechado').to.eq(true);
            });
        } else if (tentativas > 0) {
            cy.wait(250);
            fecharModalNovidades(tentativas - 1);
        }
    });
}

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

    // Entra no app após autenticar: carrega o dashboard (home pós-login) para que a
    // navbar fique disponível. A partir daqui os testes navegam clicando no menu
    // (ver page-objects/Navbar.ts) em vez de usar cy.visit() com a rota.
    cy.visit('/dashboard');
    // Fecha o modal "Novidade!" ANTES de tocar na navbar — ele cobre a navbar e
    // faria o `should('be.visible')` (e a navegação pelo menu) falhar.
    fecharModalNovidades();
    cy.get('nav.nd-navbar', { timeout: 20000 }).should('be.visible');
});

/**
 * Login com o usuário padrão da fixture (Login/login.json).
 * Encapsula o carregamento da fixture para specs que só precisam autenticar,
 * sem repetir o `cy.fixture(...).then(...)` em cada arquivo.
 */
Cypress.Commands.add('loginPadrao', () => {
    cy.fixture('Login/login.json').then((login) => {
        cy.logar(login.validUser.email, login.validUser.password);
    });
});

/**
 * Navega até a página de listagem de Grupos e aguarda o título renderizar.
 * Usa o título da barra de página (não o link oculto da navbar).
 */
Cypress.Commands.add('navegarParaGrupos', () => {
    Navbar.cadastros('Grupos');
    cy.get('.nd-title-bar .h1, .nd-title-bar__title, .nd-title-bar__left [role="heading"], h1', { timeout: 15000 })
        .should('be.visible')
        .and('contain', 'Grupos');
});

/**
 * Navega até a página de listagem de Regras via menu da Navbar (Controle -> Regras).
 */
Cypress.Commands.add('navegarParaRegras', () => {
    Navbar.controle('Regras');
    cy.get('.nd-title-bar .h1, .nd-title-bar__title, .nd-title-bar__left [role="heading"], h1', { timeout: 15000 })
        .should('be.visible')
        .and('contain', 'Regras');
});



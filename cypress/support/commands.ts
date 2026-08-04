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

    // Login por UI. Reutilizado no setup do cy.session E na auto-cura de sessão
    // expirada (abaixo), para não duplicar a lógica de autenticação.
    const loginViaUI = () => {
        setupLoginIntercepts();
        cy.visit('/');
        LoginPage.preencherESubmeter(email, password);
        // Aguarda o redirecionamento pós-login (sai da tela de login)
        cy.url({ timeout: 20000 }).should('not.include', '/login');
        // Confirma que a sessão autenticada acessa uma página protegida.
        // Usa o título da página de Grupos (elemento estável) como âncora.
        cy.visit('/grupos');
        cy.get('.nd-title-bar__left [role="heading"]', { timeout: 20000 }).should('contain', 'Grupos');
    };

    cy.session(
        email,
        loginViaUI,
        {
            // Revalida a sessão restaurada do cache. IMPORTANTE: o /dashboard devolve
            // HTML 200 mesmo deslogado (só a chamada de DADOS responde 401 e as páginas
            // protegidas redirecionam para /login depois). Por isso checar apenas a URL
            // não detecta a sessão expirada. Validamos pelo status do POST de dados do
            // dashboard: se não for 200, o cy.session refaz o login por UI.
            validate() {
                cy.intercept('POST', '**/dashboard/nova-area/search*').as('validaSessao');
                cy.visit('/dashboard');
                cy.url().should('not.include', '/login');
                cy.wait('@validaSessao', { timeout: 15000 }).then((xhr) => {
                    if (!xhr.response || xhr.response.statusCode === 401) {
                        throw new Error('Sessão expirada no cache de cy.session');
                    }
                    expect(xhr.response.statusCode).to.be.oneOf([200, 304]);
                });
            },
            cacheAcrossSpecs: true,
        },
    );

    // Entra no app + AUTO-CURA de sessão expirada. A sessão pode morrer na janela
    // entre o validate() e agora: o /dashboard ainda devolve HTML 200 (navbar aparece)
    // mas o POST de dados responde 401 e as páginas protegidas passam a redirecionar
    // p/ /login — quebrando a navegação pelo menu no meio da suíte. Detectamos pelo
    // status do POST do dashboard; se não for 200, limpamos a sessão e relogamos.
    cy.intercept('POST', '**/dashboard/nova-area/search*').as('entrarSessao');
    cy.visit('/dashboard');
    cy.wait('@entrarSessao', { timeout: 15000 }).then((interception) => {
        if (!interception.response || interception.response.statusCode !== 200) {
            cy.log('Sessão expirada detectada na entrada — refazendo login por UI');
            Cypress.session.clearAllSavedSessions();
            loginViaUI();
            cy.visit('/dashboard');
        }
    });
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

/**
 * Navega até a página de listagem de Usuários via menu da Navbar (Cadastros -> Usuários).
 */
Cypress.Commands.add('navegarParaUsuarios', () => {
    Navbar.cadastros('Usuários');
    cy.get('.nd-title-bar .h1, .nd-title-bar__title, .nd-title-bar__left [role="heading"], h1', { timeout: 15000 })
        .should('be.visible')
        .and('contain', 'Usuários');
});

/**
 * Esconde o widget de chat da Movidesk.
 *
 * Ele é injetado por script de TERCEIRO, é `position: fixed` no canto inferior direito
 * e fica sobre o botão primário da barra de ações (`.nd-action-bar__submit`), fazendo o
 * Cypress reprovar o `should('be.visible')` com "being covered by
 * `<div class="md-chat-widget-btn-title">`". Não é parte da tela sob teste.
 *
 * Injetamos CSS em vez de remover o nó: o widget se recria, e `display:none` no
 * container sobrevive a isso. Precisa ser chamado DEPOIS de cada carregamento de
 * página (o <style> morre na navegação).
 */
Cypress.Commands.add('esconderWidgetDeChat', () => {
    cy.document().then((doc) => {
        if (doc.querySelector('style[data-cypress="esconde-chat"]')) return;
        const style = doc.createElement('style');
        style.setAttribute('data-cypress', 'esconde-chat');
        style.innerHTML = `
            [class^="md-chat-widget"], [class*=" md-chat-widget"],
            #md-app-widget, .md-chat-widget-container { display: none !important; }
        `;
        doc.head.appendChild(style);
    });
});

/**
 * Navega até um relatório específico via menu da Navbar (Relatórios -> item).
 * Remove o atributo target="_blank" para manter a navegação no mesmo contexto do Cypress.
 */
Cypress.Commands.add('navegarParaRelatorio', (nomeRelatorio: string) => {
    Navbar.get()
        .contains('.nd-nav-dropdown button.nd-navbar__item', 'Relatórios')
        .closest('.nd-nav-dropdown')
        .as('relatorioDropdown');

    cy.get('@relatorioDropdown').trigger('mouseenter');
    cy.get('@relatorioDropdown')
        .find('.nd-nav-dropdown__panel')
        .contains('a.nd-nav-dropdown__link', nomeRelatorio.trim())
        .invoke('removeAttr', 'target')
        .click({ force: true });
});





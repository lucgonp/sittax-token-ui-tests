/// <reference types="cypress" />
// RECON 2 do #28033: estrutura de /users, impersonate e /rep/users.
import {
    setupLoginIntercepts, setupRepresentantesIntercepts,
    setupImpersonateERepUsersIntercepts, ALIAS,
} from '../support/api-intercepts';

describe('RECON 28033', () => {
    it('dump de /users, do impersonate e de /rep/users', () => {
        cy.fixture('Representantes/representantes.json').then((fx) => {
            Cypress.session.clearAllSavedSessions();
            setupLoginIntercepts();
            setupRepresentantesIntercepts();
            setupImpersonateERepUsersIntercepts();
            cy.logar(fx.usuarioQA.email, fx.usuarioQA.password);

            cy.visit('/users');
            cy.get('table.nd-table tbody tr', { timeout: 30000 }).should('have.length.greaterThan', 0);

            cy.get('body').then(($b) => {
                cy.task('log', JSON.stringify({
                    url: window.location.pathname,
                    linhas: $b.find('table.nd-table tbody tr').length,
                    total: $b.find('.nd-pagination__count').text().replace(/\s+/g, ' ').trim(),
                    camposBusca: $b.find('input[type="text"],input[type="search"]').map((_, el) => el.id || el.getAttribute('name')).get(),
                    cabecalhos: $b.find('table.nd-table thead th').map((_, el) => el.textContent?.trim()).get(),
                }, null, 1));
                cy.task('log', '1a linha: ' + $b.find('table.nd-table tbody tr').first().prop('outerHTML').replace(/\s+/g, ' ').slice(0, 1400));
            });

            // procura o link de impersonate de qualquer linha
            cy.get('body').then(($b) => {
                const links = $b.find('a[href*="impersonate"]').map((_, el) => el.getAttribute('href')).get();
                cy.task('log', 'links de impersonate na pagina: ' + JSON.stringify(links.slice(0, 5)));
                if (links.length) {
                    cy.visit(links[0]);
                    cy.task('log', 'assumiu controle via ' + links[0]);
                    cy.visit('/rep/users');
                    cy.get('body', { timeout: 30000 }).then(($r) => {
                        cy.task('log', '=== /rep/users depois do impersonate');
                        cy.task('log', JSON.stringify({
                            url: window.location.pathname,
                            linhas: $r.find('table.nd-table tbody tr').length,
                            badgeOuContador: $r.find('.nd-pagination__count, .nd-badge, .nd-widget__title, h2, .h1').map((_, el) => el.textContent?.trim().slice(0, 60)).get().slice(0, 8),
                            cabecalhos: $r.find('table.nd-table thead th').map((_, el) => el.textContent?.trim()).get(),
                            temGestorDaRevenda: /gestor da revenda/i.test($r.text()),
                        }, null, 1));
                        cy.task('log', 'linhas: ' + $r.find('table.nd-table tbody tr').map((_, tr) => Cypress.$(tr).text().replace(/\s+/g, ' ').trim().slice(0, 110)).get().slice(0, 12).join(' || '));
                    });
                    // empresas da revenda
                    cy.request({ url: '/rep/empresas', failOnStatusCode: false }).then((r) => {
                        cy.task('log', `GET /rep/empresas -> ${r.status}`);
                    });
                }
            });
        });
    });
});

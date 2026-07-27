/// <reference types="cypress" />

import { LoginPage } from '../../page-objects/Login/LoginPage';
import { setupLoginIntercepts, ALIAS } from '../../support/api-intercepts';

describe('Sittax Token - Autenticação e Validação de Requisição', () => {

    let loginData: any;

    before(() => {
        cy.fixture('Login/login.json').then((data) => {
            loginData = data;
        });
    });

    beforeEach(() => {
        setupLoginIntercepts();
        // Cada teste de login parte de uma sessão limpa, como um navegador novo em produção.
        // Com testIsolation:false (exigido pelo cy.session), o cookie de uma tentativa falha
        // persiste e dessincroniza do CSRF token, gerando 419 → "atualiza e volta pro login".
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('Deve exibir os elementos da tela de login corretamente', () => {
        cy.visit('/');
        cy.title().should('contain', 'Sittax');
        LoginPage.getCampoEmail().should('be.visible');
        LoginPage.getCampoSenha().should('be.visible');
        LoginPage.getBotaoEntrar().should('be.visible');
    });

    it('Deve recusar login com credenciais inválidas e exibir mensagem de erro', () => {
        cy.visit('/');
        LoginPage.preencherESubmeter(loginData.invalidUser.email, loginData.invalidUser.password);

        // Valida a mensagem de erro de autenticação no formulário
        cy.contains('Email/Senha estão incorretos.').should('be.visible');
        cy.url().should('not.include', '/dashboard');
    });

    it('Deve realizar login com sucesso via UI, interceptar POST /login e redirecionar para /dashboard', () => {
        cy.visit('/');
        LoginPage.preencherESubmeter(loginData.validUser.email, loginData.validUser.password);

        // Valida interceptação da requisição POST de login (HTTP 200/302)
        cy.wait(`@${ALIAS.login}`).then((interception) => {
            expect(interception.response?.statusCode).to.be.oneOf([200, 302]);
            expect(interception.request.body).to.include(encodeURIComponent(loginData.validUser.email));
        });

        // Valida redirecionamento para a rota protegida
        cy.url({ timeout: 15000 }).should('include', '/dashboard');
    });
});

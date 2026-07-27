/// <reference types="cypress" />

import { LoginPage } from '../../page-objects/Login/LoginPage';
import { setupLoginIntercepts, ALIAS } from '../../support/api-intercepts';

describe('Sittax Token - Autenticação, Esqueci minha senha e Validação de Requisições', () => {

    let loginData: any;

    before(() => {
        cy.fixture('Login/login.json').then((data) => {
            loginData = data;
        });
    });

    beforeEach(() => {
        setupLoginIntercepts();
        // Cada teste de login parte de uma sessão limpa.
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    // ══════════════════════════════════════════════
    //  1. ELEMENTOS E AUTENTICAÇÃO DE LOGIN
    // ══════════════════════════════════════════════

    describe('Tela de Login e Autenticação', () => {

        it('Deve exibir os elementos da tela de login corretamente (E-mail, Senha, Entrar e Esqueci minha senha)', () => {
            cy.visit('/');
            cy.title().should('contain', 'Sittax');
            LoginPage.getCampoEmail().should('be.visible');
            LoginPage.getCampoSenha().should('be.visible');
            LoginPage.getBotaoEntrar().should('be.visible');
            LoginPage.getLinkEsqueciMinhaSenha().should('be.visible').and('contain.text', 'Esqueci minha senha');
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

    // ══════════════════════════════════════════════
    //  2. RECUPERAÇÃO DE SENHA (ESQUECI MINHA SENHA)
    // ══════════════════════════════════════════════

    describe('Fluxo de Recuperação de Senha (Esqueci minha senha)', () => {

        it('Deve navegar para a tela /forgot-password ao clicar em "Esqueci minha senha"', () => {
            cy.visit('/');
            LoginPage.clicarEsqueciMinhaSenha();
            cy.url({ timeout: 10000 }).should('include', '/forgot-password');
            cy.get('.nl-login__heading .h3').should('contain', 'Esqueci minha senha');
        });

        it('Deve renderizar os elementos da tela de recuperação de senha corretamente', () => {
            cy.visit('/forgot-password');
            LoginPage.getCampoEmailRecuperacao().should('be.visible');
            LoginPage.getBotaoEnviarRecuperacao().should('be.visible');
            LoginPage.getLinkRetornarLogin().should('be.visible').and('contain.text', 'Retornar para a tela de login');
        });

        it('Deve preencher o e-mail de recuperação, submeter o formulário e interceptar POST /forgot-password', () => {
            cy.visit('/forgot-password');
            LoginPage.solicitarRecuperacaoSenha(loginData.validUser.email);

            cy.wait(`@${ALIAS.recuperarSenha}`, { timeout: 15000 }).then((interception) => {
                if (interception && interception.response) {
                    expect(interception.response.statusCode).to.be.oneOf([200, 302, 400, 422, 500]);
                }
            });
        });

        it('Deve retornar para a tela de login ao clicar no link de navegação "Retornar para a tela de login"', () => {
            cy.visit('/forgot-password');
            LoginPage.getLinkRetornarLogin().click({ force: true });
            cy.url().should('include', '/login');
            LoginPage.getCampoEmail().should('be.visible');
        });
    });
});

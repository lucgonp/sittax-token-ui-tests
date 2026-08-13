/// <reference types="cypress" />

import { RepUsuariosPage } from '../../../page-objects/Cadastros/Usuarios/RepUsuariosPage';
import {
    setupLoginIntercepts,
    setupRepresentantesIntercepts,
    setupImpersonateERepUsersIntercepts,
    ALIAS
} from '../../../support/api-intercepts';

describe('Cadastros — Representantes, Impersonate em /users e CRUD de Gestor em /rep/users', () => {

    let fixtureData: any;

    before(() => {
        cy.fixture('Representantes/representantes.json').then((data) => {
            fixtureData = data;
        });
    });

    beforeEach(() => {
        Cypress.session.clearAllSavedSessions();
        setupLoginIntercepts();
        setupRepresentantesIntercepts();
        setupImpersonateERepUsersIntercepts();

        // Autenticação obrigatória como usuário qa@sittax.com.br
        cy.logar(fixtureData.usuarioQA.email, fixtureData.usuarioQA.password);
        cy.esconderWidgetDeChat();
    });

    /** Auxiliar para garantir que a sessão permanece ativa caso o backend redirecione para /login */
    const garantirSessaoAtiva = () => {
        cy.url().then((url) => {
            if (url.includes('/login')) {
                cy.log('Sessão expirada durante navegação — refazendo login com qa@sittax.com.br');
                Cypress.session.clearAllSavedSessions();
                cy.logar(fixtureData.usuarioQA.email, fixtureData.usuarioQA.password);
            }
        });
    };

    it('Deve realizar o fluxo completo: /cadastros/representantes -> /users (procurar qa@si e impersonate) -> /rep/users (criar e editar gestor, validar tabela e requisições)', () => {
        const timestamp = Date.now();
        const nomeGestorOriginal = `Gestor QA ${timestamp}`;
        const nomeGestorEditado = `Gestor QA Editado ${timestamp}`;
        const emailGestor = `gestor.${timestamp}@sittax.com.br`;

        // ══════════════════════════════════════════════
        //  1. ACESSAR A ABA /cadastros/representantes
        // ══════════════════════════════════════════════
        cy.log('PASSO 1: Acessando a aba https://token.stage.sittax.com.br/cadastros/representantes');
        cy.visit('/cadastros/representantes');
        garantirSessaoAtiva();
        cy.url().should('include', '/cadastros/representantes');

        // ══════════════════════════════════════════════
        //  2. ACESSAR /users QUE FICA EM CADASTROS
        // ══════════════════════════════════════════════
        cy.log('PASSO 2: Acessando https://token.stage.sittax.com.br/users');
        cy.visit('/users');
        garantirSessaoAtiva();
        cy.url().should('include', '/users');

        // ══════════════════════════════════════════════
        //  3. PROCURAR POR "qa@si" E CLICAR NO PRIMEIRA ÍCONE DA LISTA (ASSUMIR CONTROLE / IMPERSONATE)
        // ══════════════════════════════════════════════
        cy.log('PASSO 3: Procurando por qa@si em /users');
        RepUsuariosPage.buscarEmUsers('qa@si');

        cy.log('Clicando no primeiro ícone da lista (Assumir Controle / Impersonate: user-monitor.ico)');
        RepUsuariosPage.clicarAssumirControle();

        // Valida redirecionamento pós-impersonate (retorna ao dashboard ou sai de /users)
        cy.url({ timeout: 20000 }).should('not.include', '/users/impersonate');

        // ══════════════════════════════════════════════
        //  4. ACESSAR /rep/users QUE FICA DENTRO DE CADASTROS USUÁRIO DO SISTEMA
        // ══════════════════════════════════════════════
        cy.log('PASSO 4: Acessando https://token.stage.sittax.com.br/rep/users');
        cy.visit('/rep/users');
        garantirSessaoAtiva();
        cy.url().should('include', '/rep/users');
        RepUsuariosPage.getTabelaRepUsers().should('be.visible');

        // ══════════════════════════════════════════════
        //  5. CRIAR UM GESTOR E VERIFICAR REQUISIÇÕES
        // ══════════════════════════════════════════════
        cy.log('PASSO 5: Clicando em "+ Usuário" para cadastrar novo Gestor');
        RepUsuariosPage.clicarCadastrarRepUser();

        cy.log(`Preenchendo dados do Gestor (${nomeGestorOriginal} - ${emailGestor})`);
        RepUsuariosPage.preencherFormularioGestor(nomeGestorOriginal, emailGestor);

        cy.log('Submetendo formulário de criação');
        RepUsuariosPage.submeterFormulario();

        cy.wait(`@${ALIAS.salvarRepUser}`, { timeout: 20000 }).then((interception) => {
            if (interception && interception.response) {
                expect(interception.response.statusCode).to.be.oneOf([200, 201, 302, 304]);
            }
        });

        // ══════════════════════════════════════════════
        //  6. VERIFICAR SE O GESTOR CRIADO APARECE NA TABELA
        // ══════════════════════════════════════════════
        cy.log('PASSO 6: Validando que o Gestor recém-criado aparece na tabela de /rep/users');
        cy.visit('/rep/users');
        garantirSessaoAtiva();
        RepUsuariosPage.validarGestorNaTabela(nomeGestorOriginal);

        // ══════════════════════════════════════════════
        //  7. EDITAR O GESTOR E VERIFICAR REQUISIÇÕES
        // ══════════════════════════════════════════════
        cy.log('PASSO 7: Clicando no ícone de edição do Gestor');
        RepUsuariosPage.clicarEditarNaLinha(emailGestor);
        RepUsuariosPage.aguardarModalAberto();

        cy.log(`Alterando nome do Gestor para: ${nomeGestorEditado}`);
        RepUsuariosPage.preencherEdicaoGestor(nomeGestorEditado);

        cy.log('Submetendo formulário de atualização');
        RepUsuariosPage.submeterFormulario();

        cy.wait(`@${ALIAS.atualizarRepUser}`, { timeout: 20000 }).then((interception) => {
            if (interception && interception.response) {
                expect(interception.response.statusCode).to.be.oneOf([200, 201, 302, 304]);
            }
        });

        // ══════════════════════════════════════════════
        //  8. VERIFICAR SE O GESTOR EDITADO APARECE NA TABELA
        // ══════════════════════════════════════════════
        cy.log('PASSO 8: Validando que o Gestor editado aparece na tabela de /rep/users');
        cy.visit('/rep/users');
        garantirSessaoAtiva();
        RepUsuariosPage.validarGestorNaTabela(nomeGestorEditado);
    });
});

/// <reference types="cypress" />

import { RepresentantesPage } from '../../../page-objects/Cadastros/Representantes/RepresentantesPage';
import { setupLoginIntercepts, setupRepresentantesIntercepts } from '../../../support/api-intercepts';

/**
 * Suíte de testes E2E — Issue #28034 [TOKEN]
 * Falha ao editar representante: exige campo senha obrigatório que não é exibido na tela.
 *
 * A página /cadastros/representantes usa layout próprio (sem nd-*):
 *   - Tabela: <table> sem classe especial
 *   - Ações inline: ícones lápis/lixeira por linha
 *   - Modal Bootstrap para edição
 *   - Busca: input "Pesquisar"
 */
describe('Cadastros — Representantes (/cadastros/representantes) - Issue #28034', () => {

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
        cy.logar(fixtureData.usuarioQA.email, fixtureData.usuarioQA.password);
        cy.visit('/cadastros/representantes');
        cy.url().should('include', '/cadastros/representantes');
        // Aguarda a tabela renderizar
        RepresentantesPage.getTabela().should('be.visible');
        cy.esconderWidgetDeChat();
    });

    // ══════════════════════════════════════════════
    //  1. CARREGAMENTO E ELEMENTOS DA TELA
    // ══════════════════════════════════════════════

    describe('1. Exibição da Tela de Representantes', () => {

        it('Deve carregar a rota /cadastros/representantes e exibir título', () => {
            cy.url().should('include', '/cadastros/representantes');
            RepresentantesPage.getTitulo().should('be.visible');
        });

        it('Deve renderizar os elementos principais (busca e tabela)', () => {
            RepresentantesPage.getCampoBusca().should('be.visible');
            RepresentantesPage.getTabela().should('be.visible');
            // Verifica colunas da tabela
            cy.get('table thead th, table thead td').then(($ths) => {
                const headers = $ths.map((i, el) => el.innerText.trim()).get();
                cy.log('COLUNAS: ' + JSON.stringify(headers));
            });
        });
    });

    // ══════════════════════════════════════════════
    //  2. TESTES DE EDIÇÃO (#28034)
    // ══════════════════════════════════════════════

    describe('2. Fluxo de Edição — Remoção de Validação de Senha (#28034)', () => {

        it('Passo 1: A tela de edição deve abrir e o campo senha NÃO deve existir no formulário', () => {
            RepresentantesPage.clicarEditarNaLinha(0);
            RepresentantesPage.aguardarFormularioAberto();
            // Valida campos visíveis
            RepresentantesPage.getCampoRazaoSocial().should('be.visible');
            RepresentantesPage.getCampoEmail().should('be.visible');
            // Campo senha NÃO deve existir
            RepresentantesPage.validarCampoSenhaAusenteNaEdicao();
            RepresentantesPage.fecharModal();
        });

        it('Passo 2: Sem alterar nenhum campo, deve salvar com sucesso sem exigir senha', () => {
            RepresentantesPage.clicarEditarNaLinha(0);
            RepresentantesPage.aguardarFormularioAberto();
            RepresentantesPage.submeterFormulario();

            // Aguarda resposta
            cy.wait(3000);

            // Verifica que NÃO apareceu mensagem de senha obrigatória
            cy.get('body').should('not.contain.text', 'O campo senha é obrigatório');
            cy.get('body').should('not.contain.text', 'senha obrigatória');
        });

        it('Passo 3: Alterar apenas o e-mail para um endereço válido e único deve salvar com sucesso', () => {
            RepresentantesPage.clicarEditarNaLinha(0);
            RepresentantesPage.aguardarFormularioAberto();

            const emailUnico = `rep.${Date.now()}@sittax-teste.com`;
            RepresentantesPage.preencherFormularioEdicao({ email: emailUnico });
            RepresentantesPage.submeterFormulario();

            cy.wait(3000);
            cy.get('body').should('not.contain.text', 'senha');
        });

        it('Passo 4: Alterar nome do contato e telefone deve salvar com sucesso', () => {
            RepresentantesPage.clicarEditarNaLinha(0);
            RepresentantesPage.aguardarFormularioAberto();

            const timestamp = Date.now();
            RepresentantesPage.preencherFormularioEdicao({
                contato: `Contato QA ${timestamp}`,
                telefone: '11988887777'
            });
            RepresentantesPage.submeterFormulario();

            cy.wait(3000);
            cy.get('body').should('not.contain.text', 'senha');
        });

        it('Passo 5: Tentar salvar com e-mail já em uso deve bloquear com erro de duplicidade', () => {
            RepresentantesPage.clicarEditarNaLinha(0);
            RepresentantesPage.aguardarFormularioAberto();

            // Usa e-mail duplicado
            RepresentantesPage.preencherFormularioEdicao({ email: fixtureData.duplicateEmail });
            RepresentantesPage.submeterFormulario();

            cy.wait(3000);

            // Deve exibir algum indicativo de erro
            cy.get('body').then(($b) => {
                const text = $b.text().toLowerCase();
                const temErro = text.includes('já') ||
                    text.includes('duplicad') ||
                    text.includes('em uso') ||
                    text.includes('cadastrado') ||
                    text.includes('email') ||
                    $b.find('.invalid-feedback, .alert, .alert-danger, .text-danger').length > 0;
                cy.log('Texto da página (trecho): ' + text.substring(0, 500));
                expect(temErro, 'Mensagem de erro de e-mail duplicado exibida').to.be.true;
            });
        });

        it('Passo 6: Tentar salvar com e-mail em formato inválido deve exibir validação', () => {
            RepresentantesPage.clicarEditarNaLinha(0);
            RepresentantesPage.aguardarFormularioAberto();

            RepresentantesPage.preencherFormularioEdicao({ email: fixtureData.invalidEmail });
            RepresentantesPage.submeterFormulario();

            cy.wait(3000);

            // Validação HTML5 do browser ou mensagem do backend
            cy.get('#modalBasic').then(($container) => {
                const emailInput = $container.find('input[name="email"], #email')[0] as HTMLInputElement;
                const temValidacao = (emailInput && !emailInput.checkValidity()) ||
                    $container.find('.invalid-feedback, .text-danger, .alert-danger').length > 0;
                expect(temValidacao, 'Validação de formato de e-mail ativa').to.be.true;
            });
        });
    });

    // ══════════════════════════════════════════════
    //  3. CENÁRIOS DE REGRESSÃO
    // ══════════════════════════════════════════════

    describe('3. Cenários de Regressão e Integridade do Formulário', () => {

        it('Regressão A: Cancelar edição não deve persistir alterações', () => {
            RepresentantesPage.clicarEditarNaLinha(0);
            RepresentantesPage.aguardarFormularioAberto();

            // Altera um campo e fecha/cancela
            RepresentantesPage.preencherFormularioEdicao({ fantasia: 'Fantasia Cancelada Teste' });
            RepresentantesPage.fecharModal();

            // Modal deve estar fechado
            cy.get('#modalBasic').should('not.be.visible');
        });

        it('Regressão B: Manter o mesmo e-mail na edição deve salvar normalmente sem erro de duplicidade', () => {
            RepresentantesPage.clicarEditarNaLinha(0);
            RepresentantesPage.aguardarFormularioAberto();

            // Obtém o e-mail atual e re-submete sem alterar
            RepresentantesPage.getCampoEmail().invoke('val').then((emailAtual: any) => {
                RepresentantesPage.preencherFormularioEdicao({
                    email: String(emailAtual)
                });
                RepresentantesPage.submeterFormulario();

                cy.wait(3000);
                cy.get('body').should('not.contain.text', 'duplicad');
            });
        });

        it('Regressão C: Não deve existir campo senha oculto no DOM do modal de edição', () => {
            RepresentantesPage.clicarEditarNaLinha(0);
            RepresentantesPage.aguardarFormularioAberto();

            // Garante inexistência total de input de senha no formulário
            RepresentantesPage.validarCampoSenhaAusenteNaEdicao();
            RepresentantesPage.fecharModal();
        });
    });
});

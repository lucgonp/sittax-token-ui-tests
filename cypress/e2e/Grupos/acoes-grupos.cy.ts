/// <reference types="cypress" />

import { GruposPage } from '../../page-objects/Grupos/GruposPage';
import { setupGruposIntercepts, ALIAS } from '../../support/api-intercepts';

/**
 * Testes do menu de Ações (dropdown) de cada linha da tabela de Grupos.
 *
 * Observação técnica: ao abrir, o painel do menu é realocado para o body
 * (floating UI) — por isso é consultado globalmente via `.nd-pop--open`.
 *
 * Cobertura:
 * - Abertura/fechamento do menu de ações
 * - Opções (Editar, Duplicar grupo, Excluir)
 * - Navegação ao clicar em Editar
 * - Modal de confirmação de exclusão (fly-dialog) e cancelamento
 */
describe('Grupos - Menu de Ações', () => {

    before(() => {
        cy.loginPadrao();
        setupGruposIntercepts();
        cy.navegarParaGrupos();
        cy.wait(`@${ALIAS.listarGrupos}`);
    });

    // ══════════════════════════════════════════════
    //  DROPDOWN DE AÇÕES
    // ══════════════════════════════════════════════

    describe('Dropdown de Ações', () => {

        afterEach(() => {
            GruposPage.fecharMenuAcoes();
        });

        it('Deve abrir o menu ao clicar em "Ações" da primeira linha', () => {
            GruposPage.abrirMenuAcoes(0);
            GruposPage.getMenuAcoesAberto().should('be.visible');
        });

        it('Deve exibir a opção "Editar"', () => {
            GruposPage.abrirMenuAcoes(0);
            GruposPage.getOpcaoEditar().should('be.visible').and('contain', 'Editar');
        });

        it('Deve exibir a opção "Duplicar grupo"', () => {
            GruposPage.abrirMenuAcoes(0);
            GruposPage.getOpcaoDuplicar().should('be.visible').and('contain', 'Duplicar grupo');
        });

        it('Deve exibir a opção "Excluir"', () => {
            GruposPage.abrirMenuAcoes(0);
            GruposPage.getOpcaoExcluir().should('be.visible').and('contain', 'Excluir');
        });

        it('Deve fechar o menu ao clicar fora dele', () => {
            GruposPage.abrirMenuAcoes(0);
            GruposPage.getMenuAcoesAberto().should('be.visible');
            GruposPage.fecharMenuAcoes();
            GruposPage.getMenuAcoesAberto().should('not.exist');
        });
    });

    // ══════════════════════════════════════════════
    //  AÇÃO: DUPLICAR
    // ══════════════════════════════════════════════

    describe('Ação: Duplicar grupo', () => {

        it('A opção "Duplicar grupo" deve estar habilitada', () => {
            GruposPage.abrirMenuAcoes(0);
            GruposPage.getOpcaoDuplicar().should('be.visible').and('not.be.disabled');
            // Não executa a duplicação para não alterar os dados
            GruposPage.fecharMenuAcoes();
        });
    });

    // ══════════════════════════════════════════════
    //  AÇÃO: EDITAR
    // ══════════════════════════════════════════════

    describe('Ação: Editar', () => {

        it('Deve navegar para a página de edição ao clicar em "Editar"', () => {
            GruposPage.clicarEditar(0);
            cy.url({ timeout: 10000 }).should('include', '/grupos/nova-area/edit/');
            cy.contains('.nd-form-block__title', 'Informações gerais', { timeout: 10000 }).should('be.visible');
            // Retorna à listagem
            cy.navegarParaGrupos();
        });
    });

    // ══════════════════════════════════════════════
    //  AÇÃO: EXCLUIR (Modal de Confirmação)
    // ══════════════════════════════════════════════

    describe('Ação: Excluir - Modal de Confirmação', () => {

        it('Deve abrir o modal com título, mensagem e botões corretos', () => {
            GruposPage.clicarExcluir(0);

            GruposPage.getModalExcluir().should('be.visible');
            GruposPage.getTituloModalExcluir().should('contain', 'Excluir grupo');
            GruposPage.getMensagemModalExcluir()
                .should('contain', 'Tem certeza que deseja excluir o grupo')
                .and('contain', 'Esta ação não pode ser desfeita');
            GruposPage.getBotaoCancelarExclusao().should('be.visible').and('contain', 'Não, Cancelar');
            GruposPage.getBotaoConfirmarExclusao().should('be.visible').and('contain', 'Sim, quero continuar');
        });

        it('Deve fechar o modal ao clicar em "Não, Cancelar"', () => {
            GruposPage.cancelarExclusao();
            GruposPage.getModalExcluir().should('not.exist');
        });

        it('A tabela deve permanecer inalterada após cancelar a exclusão', () => {
            GruposPage.getLinhasTabela().should('have.length', 10);
        });
    });
});

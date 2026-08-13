/**
 * Page Object para a tela de Controle de Certificados (/controle/certificados).
 * Encapsula os seletores e ações baseados no DOM real da aplicação Sittax Token.
 */
export const CertificadosPage = {

    // ══════════════════════════════════════════════
    //  SELETORES DA LISTAGEM
    // ══════════════════════════════════════════════

    /** Título principal da página de Certificados */
    getTitulo: () => cy.get('.nd-title-bar .h1, .nd-title-bar__title', { timeout: 15000 }),

    /** Botão "Cadastrar certificado" na barra de ações superior */
    getBotaoCadastrarCertificado: () => cy.get('a[href*="/controle/certificados/create"], a.nd-btn-primary', { timeout: 15000 }),

    /** Campo de busca por nome ou CNPJ do certificado */
    getCampoBusca: () => cy.get('#nd-cert-search', { timeout: 15000 }),

    /** Botão de alternar o painel de filtros */
    getBotaoFiltro: () => cy.get('#filter-toggle-nd-cert-filter, button.nd-action-bar__filter', { timeout: 15000 }),

    /** Botão de exportação "Relatório" */
    getBotaoExportar: () => cy.get('#nd-cert-export-btn', { timeout: 15000 }),

    /** Tabela principal de certificados */
    getTabelaCertificados: () => cy.get('table.nd-table', { timeout: 15000 }),

    /** Botão Ações de uma linha da tabela */
    getBotaoAcoes: (index = 0) => cy.get('table.nd-table [data-dt-action-trigger]', { timeout: 15000 }).eq(index),

    /** Paginação - contagem de resultados */
    getContadorResultados: () => cy.get('.nd-pagination__count', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  SELETORES DO FORMULÁRIO DE UPLOAD
    // ══════════════════════════════════════════════

    /** Input de arquivo do certificado (.pfx/.p12) */
    getCampoArquivo: () => cy.get('#certificado', { timeout: 15000 }),

    /** Input de senha do certificado */
    getCampoSenha: () => cy.get('#senha', { timeout: 15000 }),

    /** Input de arquivo de senhas (opcional) */
    getCampoArquivoSenhas: () => cy.get('#senhas', { timeout: 15000 }),

    /** Input de apelido (opcional) */
    getCampoApelido: () => cy.get('#apelido', { timeout: 15000 }),

    /** Input de contato/telefone (opcional) */
    getCampoContato: () => cy.get('#telefone', { timeout: 15000 }),

    /** Input de e-mail (opcional) */
    getCampoEmail: () => cy.get('#email', { timeout: 15000 }),

    /** Botão "Confirmar" (submit) nos formulários */
    getBotaoConfirmar: () => cy.get('button.nd-action-bar__submit', { timeout: 15000 }),

    /** Link "Cancelar" nos formulários */
    getBotaoCancelar: () => cy.get('a.nd-action-bar__cancel', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  SELETORES DO MODAL DE EXCLUSÃO
    // ══════════════════════════════════════════════

    /** Container do modal de confirmação de exclusão */
    getModalExclusao: () => cy.get('.fly-cnpj-confirm', { timeout: 15000 }),

    /** Título do modal de exclusão */
    getTituloModalExclusao: () => cy.get('.fly-cnpj-confirm__title', { timeout: 15000 }),

    /** Input de CNPJ no modal de exclusão */
    getCampoCnpjExclusao: () => cy.get('.fly-cnpj-confirm__input', { timeout: 15000 }),

    /** Botão "Continuar com a exclusão" no modal */
    getBotaoConfirmarExclusao: () => cy.get('.fly-cnpj-confirm__confirm', { timeout: 15000 }),

    /** Botão "Cancelar" no modal de exclusão */
    getBotaoCancelarExclusao: () => cy.get('.fly-cnpj-confirm__cancel', { timeout: 15000 }),

    /** Checkbox "Forçar exclusão" no modal */
    getCheckboxForcarExclusao: () => cy.get('input.fly-cnpj-confirm__checkbox-input', { timeout: 15000 }),

    // ══════════════════════════════════════════════
    //  AÇÕES E MÉTODOS AUXILIARES
    // ══════════════════════════════════════════════

    /** Abre o menu Ações da linha indicada */
    abrirMenuAcoes: (rowIndex = 0) => {
        cy.get('table.nd-table', { timeout: 15000 }).should('be.visible');
        CertificadosPage.fecharModalAbertoSeExistir();
        CertificadosPage.getBotaoAcoes(rowIndex).should('be.visible').click({ force: true });
    },

    /** Clica em um item do menu Ações visível pelo texto */
    clicarAcaoPorTexto: (texto: string) => {
        cy.get('.nd-table-action-menu:visible, [data-dt-action-panel]:visible, [role="menu"]:visible', { timeout: 15000 })
            .find('button, a')
            .filter(':visible')
            .contains(texto)
            .click({ force: true });
    },

    /** Clica em uma ação pelo data-dt-action-key (ex: 'show', 'edit', 'delete') */
    clicarAcaoPorKey: (actionKey: string) => {
        cy.get('.nd-table-action-menu.nd-pop--open', { timeout: 15000 })
            .last()
            .find(`[data-dt-action-key="${actionKey}"]`)
            .click({ force: true });
    },

    // ══════════════════════════════════════════════
    //  MÉTODOS DE CRUD
    // ══════════════════════════════════════════════

    /**
     * Faz upload de um certificado .pfx/.p12.
     * Usa cy.selectFile() para anexar o arquivo ao input file.
     */
    uploadCertificado: (caminhoFixture: string, senha: string, apelido?: string) => {
        CertificadosPage.getCampoArquivo().selectFile(`cypress/fixtures/${caminhoFixture}`, { force: true });
        CertificadosPage.getCampoSenha().clear().type(senha);
        if (apelido) {
            CertificadosPage.getCampoApelido().clear().type(apelido);
        }
    },

    /**
     * Clica no botão "Confirmar" para submeter o formulário.
     *
     * O widget de chat da Movidesk (`.md-chat-widget-btn-title`, "Posso ajudar?") é
     * `position: fixed` no canto inferior direito e fica EM CIMA do Confirmar da barra
     * de ações (comprovado: o Cypress reprova o `be.visible` com "being covered by
     * `<div class="md-chat-widget-btn-title">`"). É chrome de terceiro, não faz parte da
     * tela em teste — escondemos antes de submeter. A sobreposição em si foi reportada
     * ao time do produto (o usuário real também tem o botão coberto em 1920x1080).
     */
    clicarConfirmar: () => {
        cy.esconderWidgetDeChat();
        CertificadosPage.getBotaoConfirmar().should('be.visible').click({ force: true });
    },

    /**
     * Confirma a exclusão de um certificado digitando o CNPJ e clicando "Continuar com a exclusão".
     * O botão de exclusão fica desabilitado até o CNPJ correto ser digitado.
     */
    confirmarExclusaoPorCnpj: (cnpj: string) => {
        CertificadosPage.getModalExclusao().should('be.visible');
        CertificadosPage.getCampoCnpjExclusao().should('be.visible').clear().type(cnpj);
        CertificadosPage.getBotaoConfirmarExclusao().should('not.be.disabled').click({ force: true });
    },

    /**
     * Confirma a exclusão lendo do PRÓPRIO modal qual documento deve ser digitado.
     * O modal exibe o documento esperado entre colchetes ("...informe o CNPJ [XXXX]...").
     * Para e-CPF esse número é o CPF; para e-CNPJ, o CNPJ. Ler do modal torna o teste
     * robusto ao tipo de certificado, sem depender de valor fixo na fixture.
     */
    confirmarExclusaoLendoDocumentoDoModal: () => {
        CertificadosPage.getModalExclusao().should('be.visible');
        CertificadosPage.getModalExclusao().invoke('text').then((texto: string) => {
            const doc = (texto.match(/\d{11,14}/) || [''])[0];
            expect(doc, 'documento esperado extraído do texto do modal').to.match(/^\d{11,14}$/);
            CertificadosPage.getCampoCnpjExclusao().should('be.visible').clear().type(doc);
            CertificadosPage.getBotaoConfirmarExclusao().should('not.be.disabled').click({ force: true });
        });
    },

    /**
     * Verifica que um certificado NÃO está presente na listagem após uma busca.
     * Trata os dois estados possíveis: (a) a tabela existe mas sem o termo, ou
     * (b) zero resultados — a tabela não é renderizada e a tela mostra
     * "Nenhum certificado encontrado". Assertar `table.nd-table` direto falha no caso (b).
     */
    assertCertificadoAusente: (termo: string) => {
        // Assertiva RETRIÁVEL: procura uma tabela que contenha o termo. Se não houver
        // tabela (estado vazio) OU a tabela não contiver o termo, `not.exist` passa e o
        // Cypress reavalia até estabilizar. Evita a corrida do snapshot cy.get('body').then().
        cy.contains('table.nd-table', termo, { timeout: 15000 }).should('not.exist');
    },

    /** Pesquisa um certificado pelo termo no campo de busca */
    buscarCertificadoPorTermo: (termo: string) => {
        CertificadosPage.getCampoBusca()
            .should('be.visible')
            .focus()
            .type(`{selectall}${termo}{enter}`, { force: true });
    },

    /**
     * Abre a tela de cadastro de certificado do jeito que o usuário faz:
     * menu Controle > Certificados e clique em "Cadastrar certificado".
     */
    abrirCadastro: () => {
        CertificadosPage.fecharModalNovidadesSeExistir();
        CertificadosPage.getBotaoCadastrarCertificado().first().click({ force: true });
        cy.url({ timeout: 20000 }).should('include', '/controle/certificados/create');
        CertificadosPage.getCampoArquivo().should('exist');
    },

    /** Fecha o modal de novidades caso ele apareça */
    fecharModalNovidadesSeExistir: () => {
        cy.get('body', { timeout: 10000 }).then(($body) => {
            if ($body.text().includes('Novidade!')) {
                cy.get('body').contains('button', '✕').click({ force: true });
            }
        });
    },

    /** Fecha modal ou drawer aberto na tela se existir */
    // ══════════════════════════════════════════════
    //  PAGINAÇÃO AJAX DA LISTAGEM (#27945)
    //  A correção do #27945 aplicou o mesmo desempate por id na listagem de
    //  certificados, que ordena por updated_at desc — campo que empata com
    //  facilidade (importação em lote grava vários no mesmo instante) e, sem
    //  desempate, faz as páginas se sobreporem igual ao caso dos agentes.
    // ══════════════════════════════════════════════

    /** Container AJAX da tabela de certificados */
    CONTAINER: '[data-dt-container="nd-cert"]',

    /** Espera a tabela terminar de carregar */
    aguardarTabelaCarregada: () => {
        cy.get(CertificadosPage.CONTAINER, { timeout: 30000 }).should('not.have.class', 'is-loading');
        cy.get('table.nd-table tbody tr', { timeout: 30000 }).should('have.length.greaterThan', 0);
    },

    /**
     * Espera a troca de página acontecer de fato no DOM.
     * Só esperar o AJAX deixa uma janela em que a tabela ainda mostra as linhas
     * anteriores — ler ali acusaria sobreposição sem defeito existir.
     */
    aguardarTrocaDePagina: (primeiroIdDaPaginaAnterior: string) => {
        cy.get('table.nd-table tbody input[name="certificados[]"]', { timeout: 30000 })
            .first()
            .should('not.have.value', primeiroIdDaPaginaAnterior);
    },

    /** Total informado pela paginação ("30 resultados") */
    getTotalCertificados: () =>
        cy.get('.nd-pagination__count', { timeout: 15000 })
            .invoke('text')
            .then((t) => Number((t.match(/\d+/) || ['0'])[0])),

    /** Ids dos certificados da página atual (value do checkbox = id da linha) */
    getIdsDaPagina: () =>
        cy.get('table.nd-table tbody input[name="certificados[]"]', { timeout: 15000 })
            .then(($i) => $i.map((_, el) => (el as HTMLInputElement).value).get()),

    /** Valor atual do select de resultados por página */
    getResultadosPorPagina: () =>
        cy.get('select.nd-pagination__select').invoke('val').then((v) => Number(v)),

    /** Botão "Próxima página" da listagem */
    getProximaPagina: () => cy.get('button[aria-label="Próxima página"]', { timeout: 15000 }),

    /** Botão "Página anterior" da listagem */
    getPaginaAnterior: () => cy.get('button[aria-label="Página anterior"]', { timeout: 15000 }),

    fecharModalAbertoSeExistir: () => {
        cy.get('body').then(($body) => {
            if ($body.find('.fly-dialog, .fly-cnpj-confirm, [role="dialog"], .modal, .nd-drawer').length > 0) {
                cy.get('body').then(($b) => {
                    if ($b.find('button.fly-cnpj-confirm__cancel').length > 0) {
                        cy.get('button.fly-cnpj-confirm__cancel').first().click({ force: true });
                    } else if ($b.find('button:contains("✕")').length > 0) {
                        cy.get('button:contains("✕")').first().click({ force: true });
                    } else if ($b.find('button:contains("Fechar")').length > 0) {
                        cy.get('button:contains("Fechar")').first().click({ force: true });
                    } else if ($b.find('button:contains("Cancelar")').length > 0) {
                        cy.get('button:contains("Cancelar")').first().click({ force: true });
                    } else {
                        cy.get('body').type('{esc}');
                    }
                });
            }
        });
    }
};

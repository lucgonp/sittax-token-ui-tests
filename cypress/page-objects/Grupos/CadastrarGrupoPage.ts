/**
 * Page Object para a página de Cadastrar/Editar Grupo
 * (/grupos/nova-area/create e /grupos/nova-area/edit/:id).
 *
 * Seletores baseados no DOM real do design system "nd-*".
 */
export const CadastrarGrupoPage = {

    // ══════════════════════════════════════════════
    //  CABEÇALHO
    // ══════════════════════════════════════════════

    /** Título da página ("Cadastrar grupo" / "Editar grupo") */
    getTituloPagina: () => cy.get('.nd-title-bar__left [role="heading"]'),

    /** Botão de voltar (seta ← no header) */
    getBotaoVoltar: () => cy.get('a.nd-title-bar__back[aria-label="Voltar"]'),

    // ══════════════════════════════════════════════
    //  INFORMAÇÕES GERAIS
    // ══════════════════════════════════════════════

    /** Seção "Informações gerais" */
    getSecaoInfoGerais: () => cy.contains('.nd-form-block__title', 'Informações gerais'),

    /** Campo de input "Nome" do grupo */
    getCampoNome: () => cy.get('#grupo_nome'),

    // ══════════════════════════════════════════════
    //  CERTIFICADOS
    // ══════════════════════════════════════════════

    /** Raiz da seção de certificados */
    getSecaoCertificados: () => cy.get('[data-dt-root="nd-grupo-certificados"]'),

    /** Título "Adicionar certificados" */
    getSecaoAdicionarCertificados: () => cy.contains('.nd-form-block__title', 'Adicionar certificados'),

    /** Campo de busca de certificados */
    getCampoBuscaCertificados: () => cy.get('#nd-grupo-certificados-search'),

    /** Tabela de certificados */
    getTabelaCertificados: () => CadastrarGrupoPage.getSecaoCertificados().find('table'),

    /** Checkbox "selecionar todos" de certificados */
    getCheckboxSelecionarTodos: () => cy.get('#nd-cert-select-all'),

    /** Checkboxes individuais de certificados */
    getCheckboxesCertificados: () =>
        CadastrarGrupoPage.getSecaoCertificados().find('tbody input[type="checkbox"]'),

    /** Checkbox de um certificado específico pelo nome (via aria-label) */
    getCheckboxCertificadoPorNome: (nome: string) =>
        cy.get(`input[type="checkbox"][aria-label="Selecionar ${nome}"]`),

    /** Linhas da tabela de certificados */
    getLinhasCertificados: () => CadastrarGrupoPage.getSecaoCertificados().find('tbody tr'),

    // ══════════════════════════════════════════════
    //  AÇÕES DO FORMULÁRIO
    // ══════════════════════════════════════════════

    /** Botão "Cancelar" */
    getBotaoCancelar: () => cy.get('a.nd-action-bar__cancel'),

    /** Botão "Confirmar" (submit) */
    getBotaoConfirmar: () => cy.get('button.nd-action-bar__submit'),

    // ══════════════════════════════════════════════
    //  AÇÕES
    // ══════════════════════════════════════════════

    preencherNome: (nome: string) => {
        CadastrarGrupoPage.getCampoNome().clear().type(nome);
    },

    limparNome: () => {
        CadastrarGrupoPage.getCampoNome().clear();
    },

    buscarCertificado: (nome: string) => {
        CadastrarGrupoPage.getCampoBuscaCertificados().clear().type(nome);
    },

    selecionarCertificado: (nome: string) => {
        CadastrarGrupoPage.getCheckboxCertificadoPorNome(nome).check({ force: true });
    },

    desmarcarCertificado: (nome: string) => {
        CadastrarGrupoPage.getCheckboxCertificadoPorNome(nome).uncheck({ force: true });
    },

    selecionarTodosCertificados: () => {
        CadastrarGrupoPage.getCheckboxSelecionarTodos().check({ force: true });
    },

    desmarcarTodosCertificados: () => {
        CadastrarGrupoPage.getCheckboxSelecionarTodos().uncheck({ force: true });
    },

    cancelar: () => {
        CadastrarGrupoPage.getBotaoCancelar().click();
    },

    confirmar: () => {
        CadastrarGrupoPage.getBotaoConfirmar().click();
    },

    voltar: () => {
        CadastrarGrupoPage.getBotaoVoltar().click();
    },
};

/// <reference types="cypress" />

/**
 * Fluxo do #28033 pelo usuário qa@sittax.com.br:
 * /cadastros/representantes → /users (buscar "qa@si" e Assumir Controle) → /rep/users
 * (criar e editar gestor, conferir a tabela e as requisições).
 *
 * Erros de lógica da versão anterior, todos medidos em token.stage em 13/08/2026:
 *
 * 1. A tabela de /users NÃO existe no load — vem de um `POST /users/search` que a própria
 *    página dispara. O spec mexia no DOM antes disso e achava zero linhas.
 * 2. O campo de busca é `filter_name`. O page object procurava `#filter_razao_social` e
 *    outros, e o `.first()` caía num input qualquer: a busca nunca era aplicada, então
 *    "qa@si" não filtrava nada.
 * 3. Depois de Assumir Controle, o spec ia direto a `/rep/users` sem afirmar que o
 *    impersonate valeu. Como usuário sem revenda recebe 403 (guard do PR !6178), o teste
 *    estourava em timeout dentro de getTabelaRepUsers() com erro que não explicava a causa.
 * 4. Era um único `it` de 8 passos: falhando o passo 3, os passos 4 a 8 não diziam nada.
 * 5. `garantirSessaoAtiva()` refazia login no meio do teste — se a sessão caísse por defeito,
 *    o teste escondia.
 * 6. A tabela de /rep/users também vem por AJAX (`POST /rep/users/search`).
 *
 * O alvo do impersonate é o usuário 1389 (login `qa@si`, "Teste Fantasia"), que pertence a
 * uma revenda — é o único caminho para o painel: como `qa@sittax.com.br` direto,
 * `/rep/users` responde 403.
 */

import { RepUsuariosPage } from '../../../page-objects/Cadastros/Usuarios/RepUsuariosPage';
import {
    setupLoginIntercepts, setupRepresentantesIntercepts,
    setupImpersonateERepUsersIntercepts, ALIAS,
} from '../../../support/api-intercepts';

const LOGIN_ALVO = 'qa@si';           // aparece na coluna E-mail de /users
const ID_ALVO = '1389';               // /users/impersonate/1389

describe('Cadastros — Representantes, Assumir Controle em /users e gestor em /rep/users (#28033)', () => {

    let fx: any;

    before(() => {
        cy.fixture('Representantes/representantes.json').then((d) => { fx = d; });
    });

    beforeEach(() => {
        Cypress.session.clearAllSavedSessions();
        setupLoginIntercepts();
        setupRepresentantesIntercepts();
        setupImpersonateERepUsersIntercepts();
        cy.logar(fx.usuarioQA.email, fx.usuarioQA.password);
        cy.esconderWidgetDeChat();
    });

    /** /cadastros/representantes → /users → busca "qa@si" → Assumir Controle → /rep/users */
    const irAtePainelDaRevenda = () => {
        cy.visit('/cadastros/representantes');
        cy.url().should('include', '/cadastros/representantes').and('not.include', '/login');

        // A tabela de /users vem renderizada no HTML (div#divList) — não há AJAX no load.
        // A busca é que dispara o POST /users/search, no evento `input` do #filter_name.
        cy.visit('/users');
        cy.url().should('include', '/users').and('not.include', '/login');
        cy.get('#users-table tbody tr', { timeout: 30000 }).should('have.length.greaterThan', 0);

        RepUsuariosPage.buscarEmUsers(LOGIN_ALVO);
        cy.wait(`@${ALIAS.buscarUsers}`, { timeout: 30000 })
            .its('response.statusCode').should('be.oneOf', [200, 304]);

        // Ancorar na linha do alvo pelo id, não por texto: "qa@si" também está contido em
        // "qa@sittax.com.br" (row_1357, que não tem Assumir Controle) — filtrar por texto
        // pegava a linha errada e o ícone nunca era encontrado.
        cy.get(`#row_${ID_ALVO}`, { timeout: 30000 }).should('exist');
        cy.get(`#row_${ID_ALVO} a[href*="/users/impersonate/${ID_ALVO}"]`)
            .should('have.length', 1)
            .find('img[src*="user-monitor"]').should('exist');

        // primeiro ícone da linha = Assumir Controle (user-monitor.ico)
        cy.get(`#row_${ID_ALVO} a[href*="/users/impersonate/${ID_ALVO}"]`).first().click({ force: true });
        cy.url({ timeout: 20000 }).should('not.include', '/users/impersonate');

        cy.visit('/rep/users');
        cy.url().should('include', '/rep/users');
        // o impersonate valeu? se não, aqui viria 403 e a tabela nunca carregaria
        cy.wait(`@${ALIAS.listarRepUsers}`, { timeout: 30000 })
            .its('response.statusCode').should('be.oneOf', [200, 304]);
        cy.get('table tbody tr', { timeout: 30000 }).should('have.length.greaterThan', 0);
    };

    it('Como qa@sittax.com.br, sem Assumir Controle, o painel da revenda responde 403', () => {
        cy.request({ url: '/rep/users', failOnStatusCode: false }).then((r) => {
            expect(r.status, 'usuário sem revenda não acessa o painel').to.equal(403);
        });
    });

    it('Deve buscar "qa@si" em /users, Assumir Controle e chegar ao painel da revenda', () => {
        irAtePainelDaRevenda();
        cy.get('table thead th').then(($th) => {
            const cols = $th.map((_, el) => (el.textContent || '').trim()).get();
            expect(cols, 'colunas de /rep/users').to.include.members(['Nome', 'E-mail', 'Empresa', 'Ações']);
        });
    });

    it('O contador do painel é o total do escopo e a tabela mostra a primeira página dele', () => {
        irAtePainelDaRevenda();
        // O contador é o total do recorte da revenda (o que o #28033 unificou entre
        // index() e search()); a tabela mostra `filter_take` linhas por página. Comparar os
        // dois direto só valeria se o total caísse numa página — daí o min().
        cy.get('input[name="filter_take"]').invoke('val').then((take) => {
            const porPagina = Number(take) || 10;
            cy.get('body').invoke('text').then((txt) => {
                const m = txt.match(/(\d+)\s*resultados?/i);
                expect(m, 'contador de resultados na tela').to.not.be.null;
                const total = Number(m![1]);
                expect(total, 'total do escopo da revenda').to.be.greaterThan(0);
                cy.get('table tbody tr').should('have.length', Math.min(total, porPagina));
            });
        });
    });

    /**
     * Cria um gestor pelo formulário de /rep/users/create.
     * O submit é feito no próprio form (`#nd-rep-user-form`, POST /rep/users) em vez de
     * caçar o botão por classe: a tela é do layout novo e o clique num seletor genérico
     * acertava outro botão, então o POST nunca saía e o cy.wait estourava.
     */
    const criarGestor = (nome: string, email: string) => {
        cy.visit('/rep/users/create');
        cy.get('#nd-rep-user-form', { timeout: 30000 }).should('exist');
        cy.get('#name').clear().type(nome);
        cy.get('#email').clear().type(email);
        cy.get('body').then(($b) => {
            if ($b.find('#senha').length) cy.get('#senha').clear().type('sittax123');
        });
        cy.get('#nd-rep-user-form').submit();

        cy.wait(`@${ALIAS.salvarRepUser}`, { timeout: 30000 })
            .its('response.statusCode').should('be.oneOf', [200, 201, 302]);
    };

    /** Abre a listagem já com a busca aplicada pelo e-mail do gestor. */
    const abrirListagemFiltrada = (email: string) => {
        cy.visit('/rep/users');
        cy.wait(`@${ALIAS.listarRepUsers}`, { timeout: 30000 })
            .its('response.statusCode').should('be.oneOf', [200, 304]);
        RepUsuariosPage.getCampoBuscaUsers().clear({ force: true }).type(email, { force: true });
        cy.wait(`@${ALIAS.listarRepUsers}`, { timeout: 30000 })
            .its('response.statusCode').should('be.oneOf', [200, 304]);
    };

    it('Deve criar um gestor, ver a requisição de gravação e encontrá-lo na tabela', () => {
        const marca = Date.now();
        const nome = `Gestor QA ${marca}`;
        const email = `gestor.${marca}@sittax.com.br`;

        irAtePainelDaRevenda();
        criarGestor(nome, email);

        abrirListagemFiltrada(email);
        cy.get('table tbody', { timeout: 30000 }).should('contain.text', nome).and('contain.text', email);
    });

    /**
     * O painel da revenda NÃO oferece edição de gestor. O menu de ações da linha publica
     * exatamente três rotas no `data-row`: `detail`, `updateAgentPassword` e `impersonate`
     * ("Ver detalhes", "Alterar senha", "Acessar cliente"). Este teste trava esse contrato —
     * se um dia entrar edição, ele falha e a suíte passa a cobrir o novo fluxo.
     */
    it('A linha do gestor oferece Ver detalhes, Alterar senha e Acessar cliente — e detalhe abre os dados dele', () => {
        const marca = Date.now();
        const nome = `Gestor QA ${marca}`;
        const email = `gestor.${marca}@sittax.com.br`;

        irAtePainelDaRevenda();
        criarGestor(nome, email);
        abrirListagemFiltrada(email);
        cy.get('table tbody').should('contain.text', nome);

        cy.get('table tbody tr').filter(`:contains("${email}")`).first().then(($tr) => {
            const bruto = $tr.find('[data-row]').attr('data-row') || $tr.attr('data-row') || '';
            expect(bruto, 'data-row da linha do gestor').to.not.be.empty;

            const linha = JSON.parse(bruto);
            const rotas: Record<string, string> = linha?.routes || {};
            cy.log(`rotas da linha: ${Object.keys(rotas).join(', ')}`);

            expect(linha.email, 'e-mail no data-row').to.equal(email);
            expect(linha.canImpersonate, 'gestor pode ser acessado pela revenda').to.be.true;
            expect(Object.keys(rotas).sort(), 'ações publicadas na linha do gestor')
                .to.deep.equal(['detail', 'impersonate', 'updateAgentPassword']);

            // O menu não traz edição — se passar a trazer, o assert acima quebra de propósito.
            // Ancorar no painel DA LINHA: `[data-dt-action-panel]` sozinho casa um por linha
            // (10 na página) e o cy.within() estoura com "can only be called on a single
            // element". Não precisa abrir o menu: os itens já estão no DOM.
            cy.get(`[data-row*="${email}"]`).should('have.length', 1);
            cy.get(`[data-row*="${email}"] button[data-dt-action-trigger]`).should('be.visible');
            cy.get(`[data-row*="${email}"] [data-dt-action-panel]`).should('have.length', 1).within(() => {
                cy.get('[data-dt-action-key="detail"]').should('exist');
                cy.get('[data-dt-action-key="novaSenha"]').should('exist');
                cy.get('[data-dt-action-key="impersonate"]').should('exist');
                cy.get('[data-dt-action-key="edit"]').should('not.exist');
            });

            // Ver detalhes tem de trazer os dados do gestor recém-criado
            cy.request(rotas.detail).then((d) => {
                expect(d.status, 'GET detalhe do gestor').to.equal(200);
                // o detalhe responde JSON, não HTML
                const corpo = typeof d.body === 'string' ? d.body : JSON.stringify(d.body);
                expect(corpo, 'detalhe traz o e-mail do gestor').to.contain(email);
            });
        });
    });
});

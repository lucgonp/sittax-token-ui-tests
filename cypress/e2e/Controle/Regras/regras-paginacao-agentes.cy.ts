/// <reference types="cypress" />

/**
 * Oráculo do #27945 — "Falha na edição de regras de bloqueio de sites em ambientes
 * com grande volume de agentes".
 *
 * O defeito: GrupoController@searchAgentes ordenava só por `nome`, e todo agente é
 * registrado com nome igual ao login usado na instalação — ou seja, todos os agentes de
 * uma empresa compartilham o mesmo nome. O ORDER BY virava empate total, o PostgreSQL
 * devolvia ordem arbitrária a cada requisição e, com LIMIT/OFFSET, as páginas se
 * sobrepunham: a tela parecia não avançar. A correção passou a ordenar pelo valor exibido
 * (apelido ?: nome) com desempate por id.
 *
 * A invariante que estes testes afirmam — e que quebra se a ordenação voltar a ser
 * instável — é: percorrendo todas as páginas, cada agente aparece EXATAMENTE UMA VEZ, e
 * repetir a mesma página devolve a mesma ordem. Isso vale mesmo sem nomes repetidos.
 *
 * Pré-condição declarada e AFIRMADA (não ignorada com if/cy.log): a regra tem de ter mais
 * agentes do que caibam numa página, senão os botões ficam desabilitados e o defeito é
 * invisível — foi justamente assim que a versão anterior deste teste ficava verde sem
 * testar nada.
 *
 * Toda navegação passa por RegrasPage.aguardarTrocaDePagina: esperar só o AJAX deixa uma
 * janela em que a tabela ainda mostra as linhas anteriores, e ler o DOM ali acusaria
 * "agentes repetidos" sem defeito nenhum.
 */

import { RegrasPage } from '../../../page-objects/Controle/Regras/RegrasPage';
import { setupLoginIntercepts, setupRegrasIntercepts, ALIAS } from '../../../support/api-intercepts';

const REGRA_COM_MUITOS_AGENTES = 403;   // base de teste: 35 agentes (máximo disponível)

/** Clica em "Próxima página" e só devolve o controle quando o DOM realmente trocou. */
function avancarPagina(primeiroIdAtual: string) {
    RegrasPage.getProximaPaginaAgentes().should('not.be.disabled').click({ force: true });
    cy.wait(`@${ALIAS.buscarAgentes}`, { timeout: 30000 })
        .its('response.statusCode').should('be.oneOf', [200, 304]);
    RegrasPage.aguardarTrocaDePagina(primeiroIdAtual);
}

/** Clica em "Página anterior" e espera a troca efetiva no DOM. */
function voltarPagina(primeiroIdAtual: string) {
    RegrasPage.getPaginaAnteriorAgentes().should('not.be.disabled').click({ force: true });
    cy.wait(`@${ALIAS.buscarAgentes}`, { timeout: 30000 })
        .its('response.statusCode').should('be.oneOf', [200, 304]);
    RegrasPage.aguardarTrocaDePagina(primeiroIdAtual);
}

describe('Controle - Regras: paginação de agentes na edição (#27945)', () => {

    beforeEach(() => {
        setupLoginIntercepts();
        setupRegrasIntercepts();
        cy.loginPadrao();
        RegrasPage.abrirEdicaoDaRegra(REGRA_COM_MUITOS_AGENTES);
        cy.wait(`@${ALIAS.buscarAgentes}`, { timeout: 30000 })
            .its('response.statusCode').should('be.oneOf', [200, 304]);
        RegrasPage.aguardarTabelaAgentesCarregada();
    });

    it('Pré-condição: a regra tem agentes suficientes para paginar (senão o teste não vale)', () => {
        RegrasPage.getTotalAgentes().then((total) => {
            RegrasPage.getResultadosPorPagina().then((porPagina) => {
                expect(total, 'total de agentes vinculáveis na regra').to.be.greaterThan(porPagina);
                cy.log(`${total} agentes, ${porPagina} por página → ${Math.ceil(total / porPagina)} páginas`);
            });
        });
        RegrasPage.getProximaPaginaAgentes().should('not.be.disabled');
        RegrasPage.getPaginaAnteriorAgentes().should('be.disabled');
    });

    it('Avançar carrega a próxima página e ela não repete nenhum agente da anterior', () => {
        RegrasPage.getIdsAgentesDaPagina().then((pagina1) => {
            expect(pagina1, 'página 1 traz agentes').to.have.length.greaterThan(0);

            avancarPagina(pagina1[0]);

            RegrasPage.getIdsAgentesDaPagina().then((pagina2) => {
                expect(pagina2, 'página 2 traz agentes').to.have.length.greaterThan(0);
                const repetidos = pagina2.filter((id) => pagina1.includes(id));
                expect(repetidos, `agentes repetidos entre as páginas 1 e 2: ${repetidos.join(', ')}`).to.be.empty;
                RegrasPage.getPaginaAnteriorAgentes().should('not.be.disabled');
            });
        });
    });

    it('Percorrendo todas as páginas, cada agente aparece exatamente uma vez', () => {
        RegrasPage.getTotalAgentes().then((total) => {
            RegrasPage.getResultadosPorPagina().then((porPagina) => {
                const paginas = Math.ceil(total / porPagina);
                const vistos: string[] = [];
                const porPaginaColetada: string[][] = [];

                const coletar = (pagina: number) => {
                    RegrasPage.getIdsAgentesDaPagina().then((ids) => {
                        porPaginaColetada.push(ids);
                        vistos.push(...ids);
                        if (pagina < paginas) {
                            avancarPagina(ids[0]);
                            coletar(pagina + 1);
                        }
                    });
                };
                coletar(1);

                cy.then(() => {
                    const unicos = new Set(vistos);
                    const duplicados = vistos.filter((id, i) => vistos.indexOf(id) !== i);

                    expect(porPaginaColetada, 'páginas percorridas').to.have.length(paginas);
                    expect(duplicados, `agentes que apareceram em mais de uma página: ${[...new Set(duplicados)].join(', ')}`).to.be.empty;
                    expect(unicos.size, 'agentes distintos vistos somando todas as páginas').to.equal(total);
                    RegrasPage.getProximaPaginaAgentes().should('be.disabled');
                });
            });
        });
    });

    it('Repetir a mesma página devolve a mesma ordem (a ordenação é determinística)', () => {
        RegrasPage.getIdsAgentesDaPagina().then((primeiraLeitura) => {
            avancarPagina(primeiraLeitura[0]);

            RegrasPage.getIdsAgentesDaPagina().then((pagina2) => {
                voltarPagina(pagina2[0]);

                RegrasPage.getIdsAgentesDaPagina().then((segundaLeitura) => {
                    expect(segundaLeitura, 'a página 1 tem de vir na mesma ordem da primeira leitura')
                        .to.deep.equal(primeiraLeitura);
                });
            });
        });
    });

    it('Trocar a quantidade por página mantém a invariante e usa uma opção que existe no select', () => {
        RegrasPage.getOpcoesResultadosPorPagina().then((opcoes) => {
            expect(opcoes, 'opções do select de resultados por página').to.include('25');

            RegrasPage.getTotalAgentes().then((total) => {
                cy.get(`${RegrasPage.SECAO_AGENTES} select.nd-pagination__select`).select('25');
                cy.wait(`@${ALIAS.buscarAgentes}`, { timeout: 30000 });
                RegrasPage.getLinhasAgentesTabelaForm()
                    .should('have.length', Math.min(25, total));

                RegrasPage.getIdsAgentesDaPagina().then((pagina1) => {
                    expect(new Set(pagina1).size, 'sem id repetido dentro da própria página')
                        .to.equal(pagina1.length);
                });
            });
        });
    });

    it('Selecionar um agente de uma página posterior e salvar conclui a edição', () => {
        RegrasPage.getIdsAgentesDaPagina().then((pagina1) => {
            avancarPagina(pagina1[0]);

            RegrasPage.getIdsAgentesDaPagina().then((ids) => {
                const alvo = ids[0];
                RegrasPage.marcarAgentePorId(alvo);
                cy.get(`${RegrasPage.SECAO_AGENTES} input[name="usuarios[]"][value="${alvo}"]`).should('be.checked');

                RegrasPage.submeterFormulario();

                // salvar redireciona para a listagem; status de erro NÃO conta como sucesso
                cy.wait(`@${ALIAS.atualizarRegra}`, { timeout: 30000 })
                    .its('response.statusCode').should('be.oneOf', [200, 201, 302]);
                cy.url({ timeout: 30000 }).should('include', '/controle/regras');
            });
        });
    });
});

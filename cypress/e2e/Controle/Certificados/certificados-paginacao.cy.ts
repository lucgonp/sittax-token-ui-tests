/// <reference types="cypress" />

/**
 * Oráculo do #27945 na listagem de certificados — e oráculo do #28702, que este spec
 * encontrou.
 *
 * ⚠️ DOIS TESTES DAQUI ESTÃO VERMELHOS DE PROPÓSITO: o defeito existe hoje em
 * token.stage. Em 13/08/2026 a listagem informava 30 resultados e exibia 30 linhas para
 * apenas 27 certificados distintos — 6080924, 6080923 e 6080922 apareciam nas páginas 1 e
 * 2, e três certificados não apareciam em nenhuma página. Ver #28702 (board Monitoramento
 * e Segurança) para a evidência completa. NÃO afrouxar as asserções para ficar verde: elas
 * ficam verdes quando a ordenação ganhar o desempate por id.
 *
 * A correção do bug (ordenação determinística no GrupoController) aplicou o mesmo
 * desempate por id à listagem de certificados, "que tinha o mesmo risco quando havia
 * razões sociais repetidas". Aqui o risco é ainda mais fácil de acontecer que no caso dos
 * agentes: a tabela ordena por `updated_at desc` e uma importação em lote grava vários
 * certificados no mesmo instante — sem desempate, o ORDER BY empata, o PostgreSQL devolve
 * ordem arbitrária a cada requisição e as páginas se sobrepõem com LIMIT/OFFSET.
 *
 * A invariante afirmada é a mesma: percorrendo todas as páginas cada certificado aparece
 * EXATAMENTE UMA VEZ, e repetir a mesma página devolve a mesma ordem. A comparação usa o
 * id da linha (value do checkbox `certificados[]`), não o texto — razão social repetida é
 * justamente o cenário do defeito.
 *
 * Pré-condição AFIRMADA: se não houver mais de uma página, o teste falha em vez de passar
 * em silêncio.
 */

import { CertificadosPage } from '../../../page-objects/Controle/Certificados/CertificadosPage';
import { setupLoginIntercepts, setupCertificadosIntercepts, ALIAS } from '../../../support/api-intercepts';

/** Clica em "Próxima página" e só devolve o controle quando o DOM realmente trocou. */
function avancarPagina(primeiroIdAtual: string) {
    CertificadosPage.getProximaPagina().should('not.be.disabled').click({ force: true });
    cy.wait(`@${ALIAS.listarCertificados}`, { timeout: 30000 })
        .its('response.statusCode').should('be.oneOf', [200, 304]);
    CertificadosPage.aguardarTrocaDePagina(primeiroIdAtual);
}

/** Clica em "Página anterior" e espera a troca efetiva no DOM. */
function voltarPagina(primeiroIdAtual: string) {
    CertificadosPage.getPaginaAnterior().should('not.be.disabled').click({ force: true });
    cy.wait(`@${ALIAS.listarCertificados}`, { timeout: 30000 })
        .its('response.statusCode').should('be.oneOf', [200, 304]);
    CertificadosPage.aguardarTrocaDePagina(primeiroIdAtual);
}

describe('Controle - Certificados: paginação determinística da listagem (#27945)', () => {

    beforeEach(() => {
        setupLoginIntercepts();
        setupCertificadosIntercepts();
        cy.loginPadrao();
        cy.visit('/controle/certificados');
        cy.wait(`@${ALIAS.listarCertificados}`, { timeout: 30000 })
            .its('response.statusCode').should('be.oneOf', [200, 304]);
        CertificadosPage.aguardarTabelaCarregada();
    });

    it('Pré-condição: existem certificados suficientes para paginar (senão o teste não vale)', () => {
        CertificadosPage.getTotalCertificados().then((total) => {
            CertificadosPage.getResultadosPorPagina().then((porPagina) => {
                expect(total, 'total de certificados na listagem').to.be.greaterThan(porPagina);
                cy.log(`${total} certificados, ${porPagina} por página → ${Math.ceil(total / porPagina)} páginas`);
            });
        });
        CertificadosPage.getProximaPagina().should('not.be.disabled');
        CertificadosPage.getPaginaAnterior().should('be.disabled');
    });

    it('Cada linha tem id estável e sem repetição dentro da própria página', () => {
        CertificadosPage.getIdsDaPagina().then((ids) => {
            cy.get('table.nd-table tbody tr').should('have.length', ids.length);
            expect(ids, 'toda linha tem checkbox com id').to.not.include('');
            expect(new Set(ids).size, 'sem id repetido na mesma página').to.equal(ids.length);
        });
    });

    it('Avançar carrega a próxima página e ela não repete nenhum certificado da anterior', () => {
        CertificadosPage.getIdsDaPagina().then((pagina1) => {
            avancarPagina(pagina1[0]);

            CertificadosPage.getIdsDaPagina().then((pagina2) => {
                expect(pagina2, 'página 2 traz certificados').to.have.length.greaterThan(0);
                const repetidos = pagina2.filter((id) => pagina1.includes(id));
                expect(repetidos, `certificados repetidos entre as páginas 1 e 2: ${repetidos.join(', ')}`).to.be.empty;
            });
        });
    });

    it('Percorrendo todas as páginas, cada certificado aparece exatamente uma vez', () => {
        CertificadosPage.getTotalCertificados().then((total) => {
            CertificadosPage.getResultadosPorPagina().then((porPagina) => {
                const paginas = Math.ceil(total / porPagina);
                const vistos: string[] = [];

                const coletar = (pagina: number) => {
                    CertificadosPage.getIdsDaPagina().then((ids) => {
                        vistos.push(...ids);
                        if (pagina < paginas) {
                            avancarPagina(ids[0]);
                            coletar(pagina + 1);
                        }
                    });
                };
                coletar(1);

                cy.then(() => {
                    const duplicados = vistos.filter((id, i) => vistos.indexOf(id) !== i);
                    expect(duplicados, `certificados em mais de uma página: ${[...new Set(duplicados)].join(', ')}`).to.be.empty;
                    expect(new Set(vistos).size, 'certificados distintos somando todas as páginas').to.equal(total);
                    CertificadosPage.getProximaPagina().should('be.disabled');
                });
            });
        });
    });

    it('Repetir a mesma página devolve a mesma ordem (a ordenação é determinística)', () => {
        CertificadosPage.getIdsDaPagina().then((primeiraLeitura) => {
            avancarPagina(primeiraLeitura[0]);

            CertificadosPage.getIdsDaPagina().then((pagina2) => {
                voltarPagina(pagina2[0]);

                CertificadosPage.getIdsDaPagina().then((segundaLeitura) => {
                    expect(segundaLeitura, 'a página 1 tem de vir na mesma ordem da primeira leitura')
                        .to.deep.equal(primeiraLeitura);
                });
            });
        });
    });
});

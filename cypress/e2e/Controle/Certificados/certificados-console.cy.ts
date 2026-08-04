/// <reference types="cypress" />

import { CertificadosPage } from '../../../page-objects/Controle/Certificados/CertificadosPage';
import { Navbar } from '../../../page-objects/Navbar';
import { setupLoginIntercepts, setupCertificadosIntercepts } from '../../../support/api-intercepts';

/**
 * Verificação do bug #27228: `Uncaught TypeError: $(...).mask is not a function`
 * na tela de cadastro de certificado (plugin jQuery Mask ausente no layout da
 * nova área — `resources/views/nova-area/ui/layouts/app.blade.php`).
 *
 * Cobre os casos de teste 1 e 2 propostos no PR !6132:
 *   1. abrir a tela e confirmar console sem erro de JavaScript;
 *   2. telefone fixo (10 dígitos) e celular (11 dígitos) formatados pela máscara.
 *
 * O handler global em `support/e2e.ts` pode IGNORAR erros conhecidos da aplicação;
 * por isso registramos um listener próprio que apenas GRAVA a ocorrência (sem
 * interferir na decisão do handler global) — é o que permite afirmar se o defeito
 * ainda acontece em vez de confiar no vermelho/verde do Cypress.
 */
const achatar = (m: string) => String(m).replace(/\s+/g, ' ').trim().slice(0, 300);

describe('Controle - Console e máscaras da tela de cadastro de certificado (#27228)', () => {

    let errosCapturados: string[] = [];

    before(() => {
        Cypress.on('uncaught:exception', (err) => {
            errosCapturados.push(err.message);
            // Não retorna nada: quem decide ignorar continua sendo o handler global.
        });
    });

    beforeEach(() => {
        errosCapturados = [];
        setupLoginIntercepts();
        setupCertificadosIntercepts();
        cy.loginPadrao();
    });

    it('Caso 1 - Não deve lançar erro de JavaScript ao abrir /controle/certificados/create', () => {
        // Atribuição POR TELA: zera a captura antes de cada navegação, senão erros
        // da listagem/dashboard seriam creditados à tela de cadastro.
        const porTela: Record<string, string[]> = {};

        cy.then(() => { errosCapturados = []; });
        Navbar.controle('Certificados');
        cy.get('table.nd-table, .nd-title-bar', { timeout: 20000 }).should('exist');
        cy.wait(1500);
        cy.then(() => { porTela['listagem /controle/certificados'] = [...errosCapturados]; errosCapturados = []; });

        CertificadosPage.abrirCadastro();
        CertificadosPage.getCampoContato().should('exist');

        // Diagnóstico: os plugins de máscara estão de fato carregados na página?
        cy.window().then((win: any) => {
            const jq = win.jQuery || win.$;
            const temJquery = typeof jq === 'function';
            const scripts = Array.from(win.document.querySelectorAll('script[src]'))
                .map((s: any) => s.src)
                .filter((src: string) => /mask/i.test(src));

            cy.task('log', `[diag] jQuery: ${temJquery} | $.fn.mask: ${temJquery ? typeof jq.fn?.mask : '-'} | $.fn.maskMoney: ${temJquery ? typeof jq.fn?.maskMoney : '-'}`);
            cy.task('log', `[diag] scripts de máscara: ${scripts.length ? scripts.join(', ') : 'NENHUM'}`);
        });

        // Dá tempo para o afterViewInit disparar antes de fechar a captura.
        cy.wait(2000);

        // O log precisa sair em um passo PRÓPRIO: comandos enfileirados dentro de um
        // .then() só rodam depois do callback, então um expect que falha no mesmo
        // callback aborta antes do cy.task e o diagnóstico se perde.
        cy.then(() => {
            porTela['cadastro /controle/certificados/create'] = [...errosCapturados];
            for (const [tela, erros] of Object.entries(porTela)) {
                const resumo = erros.map((e) => (achatar(e).match(/Identifier '(\w+)' has already been declared/) || [achatar(e)])[0]);
                cy.task('log', `[diag] ${tela}: ${erros.length} erro(s) -> ${resumo.join(' | ') || 'nenhum'}`);
            }
        });

        cy.window().then((win: any) => {
            const jq = win.jQuery || win.$;
            const naTelaDeCadastro = porTela['cadastro /controle/certificados/create'] || [];

            // O defeito do card: máscara. Deve estar resolvido.
            expect(naTelaDeCadastro.filter((m) => /\.mask is not a function/i.test(m)), 'TypeError de .mask').to.have.length(0);
            expect(typeof jq.fn?.mask, '$.fn.mask (jquery.maskedinput carregado)').to.eq('function');
            expect(typeof jq.fn?.maskMoney, '$.fn.maskMoney (jquery.maskMoney carregado)').to.eq('function');

            // Caso de teste 1 do PR na íntegra: NENHUM erro de JS na tela de cadastro.
            // Se falhar por 'has already been declared', é o bug PRÉ-EXISTENTE de bundle
            // duplicado (não regressão do #27228) — o log acima mostra a atribuição por tela.
            expect(naTelaDeCadastro.map(achatar), 'console da tela de cadastro sem erro de JavaScript').to.have.length(0);
        });
    });

    it('Caso 2 - Deve aplicar a máscara do Telefone para fixo (10 dígitos) e celular (11 dígitos)', () => {
        Navbar.controle('Certificados');
        CertificadosPage.abrirCadastro();

        CertificadosPage.getCampoContato().clear({ force: true }).type('3133334444', { force: true }).blur({ force: true });
        CertificadosPage.getCampoContato().invoke('val').then((v) => cy.task('log', `[diag] fixo 3133334444 -> "${v}"`));
        CertificadosPage.getCampoContato().invoke('val').should('eq', '(31) 3333-4444');

        CertificadosPage.getCampoContato().clear({ force: true }).type('31988887777', { force: true }).blur({ force: true });
        CertificadosPage.getCampoContato().invoke('val').then((v) => cy.task('log', `[diag] celular 31988887777 -> "${v}"`));
        CertificadosPage.getCampoContato().invoke('val').should('eq', '(31) 98888-7777');
    });
});

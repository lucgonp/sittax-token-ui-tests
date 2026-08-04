/// <reference types="cypress" />

import { CertificadosPage } from '../../../page-objects/Controle/Certificados/CertificadosPage';
import { Navbar } from '../../../page-objects/Navbar';
import { setupLoginIntercepts, setupCertificadosIntercepts } from '../../../support/api-intercepts';

/**
 * Verificação do bug de console reportado na tela de cadastro de certificado:
 * `Uncaught TypeError: $(...).mask is not a function` (plugin jQuery Mask ausente).
 *
 * O handler global em `support/e2e.ts` IGNORA esse erro para não derrubar o CRUD;
 * aqui registramos um listener próprio que apenas GRAVA a ocorrência (sem impedir
 * o ignore global), para conseguir afirmar se o defeito ainda acontece.
 */
describe('Controle - Console da tela de cadastro de certificado', () => {

    const errosCapturados: string[] = [];

    before(() => {
        Cypress.on('uncaught:exception', (err) => {
            errosCapturados.push(err.message);
            // Não retorna nada: quem decide ignorar continua sendo o handler global.
        });
    });

    beforeEach(() => {
        setupLoginIntercepts();
        setupCertificadosIntercepts();
        cy.loginPadrao();
    });

    it('Não deve lançar TypeError de máscara ao abrir /controle/certificados/create', () => {
        Navbar.controle('Certificados');
        CertificadosPage.fecharModalNovidadesSeExistir();
        CertificadosPage.getBotaoCadastrarCertificado().first().click({ force: true });

        cy.url({ timeout: 20000 }).should('include', '/controle/certificados/create');
        // O formulário renderiza (o erro, se houver, é posterior ao render)
        CertificadosPage.getCampoArquivo().should('exist');
        CertificadosPage.getCampoContato().should('exist');

        // Diagnóstico: o plugin jQuery Mask está de fato carregado na página?
        cy.window().then((win: any) => {
            const jq = win.jQuery || win.$;
            const temJquery = typeof jq === 'function';
            const tipoMask = temJquery ? typeof jq.fn?.mask : 'sem jQuery';
            const scripts = Array.from(win.document.querySelectorAll('script[src]'))
                .map((s: any) => s.src)
                .filter((src: string) => /mask/i.test(src));

            cy.task('log', `[diag] jQuery presente: ${temJquery} | typeof $.fn.mask: ${tipoMask} | typeof $.fn.maskMoney: ${temJquery ? typeof jq.fn?.maskMoney : '-'}`);
            cy.task('log', `[diag] scripts com "mask" no src: ${scripts.length ? scripts.join(', ') : 'NENHUM'}`);
        });

        // Dá tempo para o afterViewInit disparar antes de concluir a captura.
        cy.wait(2000);

        // Máscara aplicada de fato? Telefone de 10 dígitos deve virar (00) 0000-0000.
        CertificadosPage.getCampoContato().clear({ force: true }).type('3133334444', { force: true }).blur({ force: true });
        CertificadosPage.getCampoContato().invoke('val').then((valor) => {
            cy.task('log', `[diag] valor do campo telefone após digitar 3133334444: "${valor}"`);
        });

        cy.window().then((win: any) => {
            const jq = win.jQuery || win.$;
            const tipoMask = typeof jq === 'function' ? typeof jq.fn?.mask : 'sem jQuery';
            const maskErrors = errosCapturados.filter((m) => /\.mask is not a function/i.test(m));
            cy.task('log', `[diag] erros capturados: ${errosCapturados.length ? errosCapturados.join(' || ') : 'nenhum'}`);

            expect(maskErrors, 'nenhum TypeError de .mask no console').to.have.length(0);
            expect(tipoMask, '$.fn.mask deve ser uma function (plugin jQuery Mask carregado)').to.eq('function');
        });

        CertificadosPage.getCampoContato().invoke('val').should('eq', '(31) 3333-4444');
    });
});

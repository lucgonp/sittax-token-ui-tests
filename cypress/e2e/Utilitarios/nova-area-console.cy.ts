/// <reference types="cypress" />

import { Navbar } from '../../page-objects/Navbar';

/**
 * Caso de teste 5 do PR !6132 (#27228): a correção mexeu no layout BASE da nova
 * área (`resources/views/nova-area/ui/layouts/app.blade.php`), então vale para
 * TODAS as telas dela — não só o cadastro de certificado. Esta spec varre as
 * telas acessíveis pelo menu e confirma que:
 *   - a tela renderiza (título//conteúdo presente);
 *   - o console segue limpo (nenhum erro de JavaScript).
 *
 * Navega clicando no menu (Navbar), como um usuário faria.
 * Relatórios ficam fora: abrem em nova aba (target=_blank), que o Cypress não segue.
 */
const achatar = (m: string) => String(m).replace(/\s+/g, ' ').trim().slice(0, 300);

interface Tela { menu: 'Controle' | 'Cadastros' | 'Utilitários' | 'Dashboard'; item: string; }

const TELAS: Tela[] = [
    { menu: 'Dashboard', item: 'Dashboard' },
    { menu: 'Controle', item: 'Certificados' },
    { menu: 'Controle', item: 'Importações' },
    { menu: 'Controle', item: 'Convites' },
    { menu: 'Controle', item: 'Compartilhamentos' },
    { menu: 'Controle', item: 'Monitoramento' },
    { menu: 'Controle', item: 'Regras' },
    { menu: 'Cadastros', item: 'Usuários' },
    { menu: 'Cadastros', item: 'Grupos' },
    { menu: 'Utilitários', item: 'Atualizações' },
    { menu: 'Utilitários', item: 'Logs' },
    { menu: 'Utilitários', item: 'Perfis de Acesso' },
    { menu: 'Utilitários', item: 'Template de E-mail' },
];

describe('Nova área - console limpo nas telas do layout corrigido (#27228)', () => {

    let errosCapturados: string[] = [];

    before(() => {
        Cypress.on('uncaught:exception', (err) => {
            errosCapturados.push(err.message);
        });
    });

    beforeEach(() => {
        cy.loginPadrao();
    });

    TELAS.forEach(({ menu, item }) => {
        it(`${menu} > ${item} deve carregar sem erro de JavaScript e com os plugins de máscara`, () => {
            errosCapturados = [];
            if (menu === 'Dashboard') {
                // Já aterrissamos na dashboard no login; recarrega pelo menu para
                // capturar os erros do carregamento DESTA tela.
                Navbar.dashboard();
            } else {
                Navbar.navegar(menu, item);
            }

            // A tela carregou: saiu da dashboard e tem a barra de título da nova área.
            cy.get('.nd-title-bar, .nd-page, main', { timeout: 20000 }).should('exist');
            cy.wait(1500); // deixa os scripts da página rodarem (afterViewInit etc.)

            // Log em passo PRÓPRIO: comandos enfileirados dentro de um .then() só rodam
            // após o callback, então um expect que falha no mesmo callback engoliria o log.
            cy.window().then((win: any) => {
                const jq = win.jQuery || win.$;
                const temMask = typeof jq === 'function' ? typeof jq.fn?.mask : 'sem jQuery';
                cy.task('log', `[${menu} > ${item}] url=${win.location.pathname} | $.fn.mask=${temMask} | erros=${errosCapturados.length ? errosCapturados.map(achatar).join(' ### ') : 'nenhum'}`);
            });

            cy.window().then((win: any) => {
                const jq = win.jQuery || win.$;
                const temMask = typeof jq === 'function' ? typeof jq.fn?.mask : 'sem jQuery';

                expect(errosCapturados.map(achatar), `console limpo em ${menu} > ${item}`).to.have.length(0);
                expect(temMask, `$.fn.mask disponível em ${menu} > ${item}`).to.eq('function');
            });
        });
    });
});

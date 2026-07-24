# sittax-token-ui-tests

Testes E2E (Cypress + TypeScript) da tela de **Grupos** do Sittax Token, escritos com metodologia **Page Object Model (POM)**.

## Requisitos
- Node.js
- Acesso ao ambiente de stage (`https://token.stage.sittax.com.br`)

## Instalação
```bash
npm install
```

## Execução
```bash
npm run test          # abre o Cypress (modo interativo)
npm run test:run      # roda todos os specs em modo headless
npm run test:grupos   # roda apenas a suíte de Grupos
```

## Estrutura
```
cypress/
├── e2e/Grupos/            # specs de teste (exibição, busca, cadastro, ações, paginação, navbar, API)
├── page-objects/          # Page Objects (Login, Grupos, CadastrarGrupo)
├── fixtures/              # dados de teste (login, grupos)
└── support/              # comandos customizados, intercepts, tratamento de exceções
```

## Convenções
- **POM**: seletores e ações encapsulados em `page-objects/`; specs contêm apenas o fluxo e as asserções.
- **Esperas por rede**: os testes aguardam os aliases de `cy.intercept` (`cy.wait('@alias')`) em vez de esperas fixas.
- **Sessão**: o login é cacheado com `cy.session` para acelerar a execução entre specs.

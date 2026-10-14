# Odyssey

Plataforma de descoberta de jogos fictícios desenvolvida para apresentação técnica de front-end. Interface em português, tema escuro, ilustrações SVG originais e locais, 25 jogos distribuídos em cinco categorias. Não há jogos executáveis, apostas, autenticação ou backend real.

## Executar

Requer Node.js 22.12+ e npm. O arquivo `package-lock.json` fixa as versões resolvidas.

```bash
npm install
npm run dev
```

Abra a URL exibida pelo Vite. Para validar a versão de produção:

```bash
npm run build
npm run preview
```

| Comando              | Função                                            |
| -------------------- | ------------------------------------------------- |
| `npm run dev`        | Servidor de desenvolvimento                       |
| `npm run build`      | TypeScript estrito e build de produção            |
| `npm run preview`    | Servir o build localmente                         |
| `npm run typecheck`  | Verificação de tipos                              |
| `npm run lint`       | ESLint, regras de hooks e proibição de `any`      |
| `npm test`           | Vitest e React Testing Library                    |
| `npm run test:e2e`   | Playwright no build de produção, desktop e mobile |
| `npm run test:watch` | Testes em modo interativo                         |
| `npm run format`     | Formatar código e documentos                      |

## Recursos

- Home com destaque, categorias, jogos populares e recentes.
- Catálogo com busca por nome, categoria e ordenação por popularidade, nome e lançamento.
- Filtros persistidos na URL; links compartilháveis e histórico de navegação.
- Rotas individuais de detalhes, metadados, favoritos e jogos relacionados.
- Favoritos persistidos no navegador, sincronizados entre abas. Dados corrompidos são tratados; bloqueio do armazenamento gera feedback.
- Skeletons, tratamento de erro com refetch, estados vazios e página não encontrada.
- Sidebar em desktop, menu móvel, grid responsivo, foco visível, link para pular ao conteúdo, feedback acessível e respeito à redução de movimento.

## Arquitetura

```text
src/
  components/ui/        Button composicional no padrão shadcn/ui
  components/layout/    Sidebar, header, estrutura e navegação
  components/games/     Card e grid com estados de carregamento/erro
  pages/                Home, catálogo, detalhes e favoritos
  routes/               TanStack Router e validação de search params
  hooks/                Consultas reutilizáveis
  services/             Axios e contratos de requisição
  mocks/                Dados, handlers REST e worker do navegador
  types/                Game, Category, Sort e GameFilters
  contexts/             Estado e ações de favoritos
  utils/                Encapsulamento de localStorage
  test/                 Integração e configuração de testes
public/art/             Ilustrações SVG locais
```

React e TypeScript estrito compõem a interface. Tailwind CSS v4 é integrado pelo plugin oficial do Vite; CSS dedicado expressa a identidade visual. Lucide fornece ícones. O Button segue o padrão composicional do shadcn/ui com Radix Slot, CVA e tailwind-merge e é mantido no projeto, sem dependência de um pacote de componentes opaco.

TanStack Router usa rotas declaradas em código, suficientes para este tamanho de aplicação. A URL é a fonte dos filtros do catálogo. Axios fica restrito à camada de serviços. TanStack Query controla estado remoto; o contexto cuida apenas dos favoritos locais. Cards não fazem requisições.

## API simulada

O MSW intercepta requisições reais do Axios, sem um servidor próprio:

- `GET /api/games?search=neon&category=Arcade&sort=popularity`
- `GET /api/games/:id` (404 para ID inexistente)

`search` é insensível a maiúsculas e diacríticos. `sort` aceita `name`, `popularity` e `release`. A latência artificial permite observar skeletons. Todos os dados são locais e fictícios.

O worker inicia **antes** do React tanto em desenvolvimento quanto em produção, sem condicionamento a `import.meta.env.DEV`. `public/mockServiceWorker.js` entra no build. MSW v3 usa a opção `onUnhandledFrame: 'bypass'` para requisições fora da API. É necessário HTTPS ou localhost e suporte a Service Worker. Falhas de inicialização mostram uma mensagem e opção de recarregar.

As consultas têm `staleTime` de 60 segundos. A chave inclui os filtros, impedindo mistura de resultados. Uma falha é repetida uma vez; o botão de erro executa refetch. AbortSignal permite cancelamento de requisições. A chave foi mantida para preservar favoritos de versões anteriores. Favoritos usam a chave versionada `gamehub:favorites:v1`; localStorage não é banco de dados nem sincroniza dispositivos.

## Testes

Os testes usam os mesmos handlers REST no MSW Node. Cobrem renderização de cards, busca e estado vazio, favoritos após remontagem, remoção, falha HTTP e recuperação, filtros/ordenação da API, 404 e armazenamento inválido. Cada teste usa cache isolado, limpa o DOM e restaura os handlers.

Para os testes de navegador, execute `npx playwright install chromium`, depois `npm run build` e `npm run test:e2e`. O Playwright inicia e encerra o servidor de preview. Os fluxos verificam o MSW de produção, navegação, busca, filtros, favoritos após reload e ausência de overflow horizontal em 1440px e 390px.

## Publicar na Vercel

1. Envie este projeto para um repositório Git e importe-o na Vercel.
2. Selecione o preset Vite, Node.js 22 ou superior, comando `npm run build` e saída `dist`.
3. Use `npm ci` para instalar as versões do lockfile. Nenhuma variável de ambiente é necessária.
4. Publique. O `vercel.json` redireciona rotas de navegação ao `index.html`, preservando os arquivos de assets e o worker.
5. Confira a home, abra diretamente `/games/1`, recarregue `/favorites` e teste um filtro. Verifique que `/mockServiceWorker.js` retorna JavaScript e que as consultas aparecem como interceptadas pelo Service Worker.

Não é necessário criar funções serverless para `/api`: o MSW responde no navegador. Este projeto foi preparado para publicação; nenhuma conta externa foi usada para publicar automaticamente.

## Decisões e evolução

A aplicação prioriza funções verificáveis e separação simples de responsabilidades. As ilustrações locais garantem funcionamento sem APIs ou CDNs externos. O dark mode concentra a identidade em roxo e ciano com tipografia legível e animações discretas.

Melhorias futuras: debounce para catálogos maiores, paginação, virtualização, auditoria automatizada com axe, testes E2E em navegadores distintos, internacionalização e integração com API real. Trocar a API exige substituir a base Axios e desativar o worker; as páginas podem manter seus contratos.

O projeto inclui práticas de acessibilidade, mas não declara certificação WCAG: uma auditoria completa com tecnologias assistivas ainda é recomendável.

## Referências oficiais

- [Vite](https://vite.dev/guide/)
- [Tailwind CSS com Vite](https://tailwindcss.com/docs/installation/using-vite)
- [TanStack Router: rotas em código](https://tanstack.com/router/latest/docs/routing/code-based-routing)
- [TanStack Query: useQuery](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery)
- [MSW: integração com navegador](https://mswjs.io/guides/integrations/browser)

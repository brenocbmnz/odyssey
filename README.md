# Odyssey

Catálogo de jogos com React, TypeScript estrito, Vite e Tailwind CSS. Possui dois modos: **demo**, com 25 jogos locais e MSW, e **RAWG**, com jogos reais, capas, gêneros, descrições e avaliações. Inclui home, busca, filtros, ordenação, paginação, detalhes e favoritos persistidos. A interface está disponível em português e inglês, com seletor no header e preferência salva no navegador.

## Executar

Requer Node.js 22.12+ e npm.

```bash
npm install
npm run dev
```

Sem configuração, o modo demo funciona sem chave e sem API externa.

## Ativar a RAWG localmente

Copie `.env.example` para `.env.local` e preencha:

```dotenv
VITE_GAME_SOURCE=rawg
RAWG_API_KEY=sua_chave_aqui
```

Reinicie `npm run dev`. O middleware do Vite responde aos endpoints `/api/games` e consulta a RAWG no servidor. A chave **não** entra no bundle do front-end. `.env.local` e os demais arquivos de segredo estão ignorados pelo Git.

Nunca use `VITE_RAWG_API_KEY`: variáveis com prefixo `VITE_` são públicas. `VITE_GAME_SOURCE` é apenas uma seleção de modo e pode ser pública.

## Ativar a RAWG na Vercel

1. Importe o repositório GitHub. Use preset **Vite**, Node.js **22.x**, instalação `npm ci`, build `npm run build` e saída `dist`.
2. Em **Settings → Environment Variables**, adicione:

| Nome               | Valor          | Uso                        |
| ------------------ | -------------- | -------------------------- |
| `RAWG_API_KEY`     | Sua chave RAWG | Apenas funções no servidor |
| `VITE_GAME_SOURCE` | `rawg`         | Seleção pública do modo    |

3. Selecione **Production** e, se quiser usar a API nos previews, **Preview**. Não publique a chave no GitHub.
4. Faça **Redeploy** depois de salvar. A seleção do modo é aplicada durante o build.
5. Confira a home e busque um jogo. Abra os detalhes, favorite, recarregue e veja `/favorites`.

As funções em `api/games.ts` e `api/games/[id].ts` são detectadas pela Vercel. O `vercel.json` preserva `/api` e os assets e redireciona as rotas da SPA. Para voltar ao demo, defina `VITE_GAME_SOURCE=demo` e faça novo deploy.

`npm run preview` serve apenas o build estático, sem executar funções. Para testar a RAWG localmente, use `npm run dev`; para conferir o hosting com funções, use a Vercel. Nenhuma chave real é necessária nos testes automatizados.

## Funcionalidades e dados

- Home com carrossel de até cinco destaques, setas, indicadores e anúncios acessíveis; populares, novidades e categorias.
- Pesquisa no header com sugestões, capas, limpeza e seleção por teclado/toque. Enter abre a sugestão selecionada ou consulta o catálogo; Escape fecha a lista.
- Busca por nome com debounce de 350ms, filtros e ordenação na URL.
- Catálogo real paginado com 24 jogos por página; demo com 25 jogos.
- Detalhes, avaliação RAWG de 0 a 5 e tratamento de datas/imagens ausentes.
- Favoritos carregados individualmente, inclusive de outras páginas do catálogo.
- Favoritos separados por fonte para evitar colisão entre IDs fictícios e reais. A chave do demo foi preservada para manter coleções existentes.
- Skeletons, erros com tentativa novamente, estados vazios e 404.
- Layout responsivo, labels, foco visível, navegação por teclado, feedback acessível e redução de movimento.
- Atribuição e link à RAWG em todas as páginas no modo real.

No modo RAWG, os filtros usam Ação, Puzzle, Estratégia, Aventura e Casual. Os jogos podem exibir outros gêneros recebidos da API. Um jogo com vários gêneros pode aparecer no filtro de Puzzle e exibir seu primeiro gênero no card. Popularidade significa quantidade de adições na RAWG (`added`), não número de jogadores da Steam. Novidades são ordenadas por lançamento, limitadas a datas até hoje. A avaliação é a nota RAWG; descrições podem estar em inglês. O site não executa jogos.

## Arquitetura

```text
api/                    Funções Vercel: jogos e proxy de capas
server/rawg.ts          Proxy, filtros, normalização e erros upstream
src/config/             Seleção demo/RAWG
src/i18n/               Contexto de idioma, interpolação e dicionário inglês
src/components/ui/      Button no padrão shadcn/ui com Radix e CVA
src/components/layout/  Sidebar, header, navegação e atribuição
src/components/games/   Cards e grid
src/pages/              Home, catálogo, detalhes e favoritos
src/routes/             TanStack Router e validação de URL
src/hooks/              Consultas e favoritos remotos
src/services/           Axios e contrato da API
src/mocks/              Dados, REST handlers e worker MSW
src/types/              Tipos e interfaces
src/contexts/           Estado de favoritos
src/utils/              Persistência local
src/test/               Testes de integração React
server/rawg.test.ts     Testes do proxy com respostas controladas
e2e/                    Testes de navegador nos dois modos
public/art/             Ilustrações locais do demo e fallback
```

Axios envia requisições à API do próprio site. TanStack Query gerencia cache, loading, erro, retry e cancelamento. As chaves incluem filtros e página. O staleTime é 60 segundos. Um contexto cuida dos favoritos locais, sincronizados entre abas. O catálogo usa TanStack Router e o Button segue o padrão composicional do shadcn/ui.

## API e segurança da chave

```text
React → /api/games → servidor Vercel → RAWG
```

- `GET /api/games?search=portal&category=Puzzle&sort=popularity&page=1`
- `GET /api/games/:id`

A listagem retorna `{ games, total, hasMore }`. O servidor usa origem fixa, valida parâmetros, limita o tamanho da busca e aplica timeout. Ele normaliza os dados e não repassa `next`/`previous` da RAWG, porque essas URLs podem conter a chave. Respostas bem-sucedidas possuem cache de CDN de 5 minutos; falhas não são armazenadas por essa política.

Os endpoints são públicos para permitir navegação sem login. O cache e o debounce reduzem chamadas, mas não substituem um limite de uso contra abuso; configure proteção adicional de tráfego na Vercel se necessário e acompanhe a cota RAWG.

O modo demo usa MSW antes da renderização em desenvolvimento e produção. No modo real, ele não inicia. Os dados fictícios não substituem silenciosamente uma falha da API real. Um worker de demo anterior é desregistrado durante a inicialização no modo real.

## Comandos e validação

| Comando              | Função                                      |
| -------------------- | ------------------------------------------- |
| `npm run dev`        | Desenvolvimento, incluindo proxy local RAWG |
| `npm run build`      | TypeScript estrito e build de produção      |
| `npm run preview`    | Servir o build estático                     |
| `npm run lint`       | ESLint                                      |
| `npm run typecheck`  | TypeScript, incluindo funções do servidor   |
| `npm test`           | Integração React e proxy RAWG               |
| `npm run test:watch` | Testes em modo interativo                   |
| `npm run test:e2e`   | Fluxos do demo, desktop e mobile            |
| `npm run format`     | Formatar fontes e documentos                |

Para os testes de navegador, instale `npx playwright install chromium`. Para testar demo, faça build com `VITE_GAME_SOURCE=demo` e rode `npm run test:e2e`. Para testar o modo real sem consumir a chave, execute:

```bash
VITE_GAME_SOURCE=rawg npm run build
E2E_SOURCE=rawg npm run test:e2e
```

Os testes RAWG de navegador interceptam `/api/games` com fixtures: validam interface e fluxo sem consumir cota. Os testes do proxy verificam filtros, detalhes, paginação, falta de chave, falhas, timeout e ausência de segredo nas respostas. A validação com a chave pessoal ocorre após configurar o ambiente.

## Limitações e evolução

A integração RAWG acrescenta duas funções serverless ao escopo originalmente apenas front-end. A API externa precisa de internet, chave válida e cota disponível. Dados e imagens são de terceiros; filtros disponíveis são uma seleção de gêneros. Favoritos são locais ao navegador, sem conta ou sincronização entre dispositivos. O projeto aplica práticas de acessibilidade, sem declarar certificação WCAG.

Evoluções possíveis: busca por plataforma/loja, validação de payloads por schema, limite de tráfego, sincronização de favoritos, internacionalização e auditoria com leitores de tela.

## Referências oficiais

- [RAWG: chave, dados e atribuição](https://rawg.io/apidocs)
- [Vercel: funções Node.js](https://vercel.com/docs/functions/runtimes/node-js)
- [Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite)
- [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery)

## Idiomas e acessibilidade

A escolha entre português e inglês atualiza `html.lang`, título da página, labels, feedback, categorias e formatação de números/datas. Os valores usados nos filtros da API permanecem estáveis, independentemente do idioma. Nomes de jogos e descrições da RAWG preservam o conteúdo original; não há tradução automática da API.

A navegação móvel segue o padrão disclosure: `aria-expanded`, `aria-controls`, foco inicial, Escape e retorno ao botão. Favoritos usam labels estáveis com `aria-pressed`; filtros são um grupo nomeado que controla a região do catálogo. Loading usa `aria-busy`, mensagens usam status e erros usam alert. As regiões de resultados, os cards e a paginação possuem nomes acessíveis. O foco é recuperado após remover um favorito ou tentar novamente.

Os testes de navegador incluem axe-core com regras WCAG A/AA, nos dois idiomas e nas resoluções desktop/mobile, cobrindo home, catálogo, detalhes, favoritos, estado vazio e 404. Testes também verificam persistência do idioma e interação por teclado. Uma auditoria automatizada não substitui avaliação manual com leitores de tela. Veja [ACCESSIBILITY.md](ACCESSIBILITY.md) para os pontos analisados e a cobertura.

## Descoberta e pesquisa

O componente `FeaturedCarousel` reutiliza os jogos populares já consultados e mostra um destaque por vez. Setas e indicadores são botões nativos; o slide é nomeado por posição e jogo. A troca é manual, sem avanço automático. As capas são pré-carregadas e usam fade cruzado; o texto entra com fade in. O painel recebe uma tonalidade escura derivada dos pixels da capa, com contraste preservado. As transições respeitam redução de movimento.

O `SearchBar` implementa uma combobox com listbox de até seis sugestões. As consultas só iniciam com pelo menos dois caracteres e após debounce de 350ms. Setas movem a opção ativa, Enter abre o jogo escolhido e Escape fecha a lista mantendo o foco. Sem opção ativa, Enter pesquisa no catálogo. A URL do catálogo sincroniza o texto da pesquisa. Erros e ausência de resultados são explícitos; o catálogo continua disponível para realizar a busca completa.

### Cores das capas

`GET /api/artwork?url=...` serve somente imagens HTTPS de `media.rawg.io/media/`. Essa rota permite ler os pixels em canvas sem depender de CORS do CDN. Ela bloqueia outras origens, portas, credenciais, redirecionamentos, conteúdo que não seja imagem e arquivos acima de 4 MiB. Respostas bem-sucedidas têm cache compartilhado de um dia.

O navegador reduz a imagem a 32×32 pixels, agrupa cores e mistura a predominante com uma base grafite. Se não puder extrair a cor, conserva um painel grafite. A função não usa a chave RAWG. Não são necessárias novas variáveis de ambiente.

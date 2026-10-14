# Como apresentar o GameHub na entrevista

## Roteiro de demonstração

Comece pela home e explique a descoberta de jogos. Abra uma categoria, combine busca e ordenação, entre nos detalhes e favorite um jogo. Mostre a coleção, recarregue para demonstrar persistência e remova o favorito. Reduza a janela e navegue pelo teclado. Por fim, execute os testes e mostre a separação entre serviço, hook e apresentação.

## Por que React?

A interface possui elementos que se repetem e dependem de estado, como cards e botões de favoritos. React permite compor esses elementos e atualizar a tela declarativamente. Cada componente descreve o resultado esperado para seu estado atual; não manipulamos o DOM manualmente para cada mudança.

## O que o TypeScript acrescenta?

`Game` documenta o contrato recebido da API. `Category` e `Sort` limitam valores válidos, enquanto o Router verifica caminhos e parâmetros. O modo estrito detecta valores potencialmente indefinidos e contratos incompatíveis antes do build. Tipos não validam JSON em tempo de execução: numa API externa, eu acrescentaria validação de respostas com um schema. Hoje, os dados e os handlers estão sob controle local.

## Axios e TanStack Query fazem a mesma coisa?

Axios transporta a requisição HTTP e entrega a resposta; também suporta timeout, cancelamento e erros HTTP. TanStack Query organiza o ciclo de vida do dado: cache, loading, erro, repetição e refetch. A função `fetchGames` usa Axios; o hook `useGames` decide como o resultado é armazenado e consumido.

## Como funciona o cache?

Cada consulta tem uma chave. `['games', { category: 'Puzzle', sort: 'name' }]` representa uma consulta diferente da busca por Arcade. A resposta fica fresca por 60 segundos; retornar à mesma combinação reutiliza o cache. Após esse período, uma nova montagem pode revalidar em segundo plano. `staleTime` não apaga dados; `gcTime` controla por quanto tempo consultas inativas permanecem armazenadas (o padrão do Query). O cache não é persistido após recarregar a página.

## Por que separar componentes?

`GameCard` mostra um jogo, `GameGrid` decide como representar uma coleção e seus estados, e as páginas montam o fluxo. A camada de serviços conhece HTTP; os hooks conhecem cache. Essa divisão reduz repetição e permite alterar uma camada sem espalhar mudanças. Para este tamanho de produto, contexto para favoritos é suficiente; uma biblioteca global adicional aumentaria o custo sem necessidade.

## Como os favoritos são salvos?

O contexto mantém uma lista de IDs. O módulo de armazenamento lê e grava JSON em uma chave versionada. Na inicialização, ele valida que há uma lista de strings e tolera JSON corrompido. Ao alternar um favorito, o estado da interface e o localStorage são atualizados. O evento `storage` sincroniza outras abas. Se o armazenamento estiver bloqueado, a sessão continua funcionando e o usuário recebe feedback. Esse mecanismo é local ao navegador, sem conta ou sincronização entre dispositivos.

## Como a API funciona sem backend?

MSW usa um Service Worker para interceptar `/api/games`. Axios continua emitindo HTTP e Query continua controlando requisições; os handlers devolvem dados fictícios com pequena latência. Nos testes, o mesmo contrato é executado pelo MSW Node. O worker é iniciado antes da renderização também no build de produção. Na publicação, HTTPS e o arquivo do worker precisam estar disponíveis; iniciar apenas em desenvolvimento seria um erro.

## Acessibilidade aplicada

Há `header`, `nav`, `main`, `section`, `article` e `footer`. Links navegam; botões executam ações. A busca tem nome acessível, os ícones de favorito têm labels específicas e `aria-pressed` indica seu estado. Os filtros também expõem seleção. Feedback usa regiões de status; erros usam alertas. O foco tem contorno visível e há link para pular a navegação. Mudanças de rota levam o foco ao conteúdo. A interface respeita `prefers-reduced-motion`. Evitei botões dentro de links: coração e link do card são elementos irmãos. Essas práticas precisam ser complementadas por testes reais com leitores de tela para afirmar conformidade completa.

## Decisões de UI/UX

A home organiza descoberta: destaque, estilos, populares e novidades. O catálogo concentra ferramentas de pesquisa. Roxo identifica ações principais, ciano aparece em detalhes e o fundo escuro dá protagonismo às ilustrações. Textos informam que os jogos são fictícios. Os cards expõem categoria e popularidade sem sobrecarregar. O mobile reorganiza o grid e disponibiliza a navegação em menu. Estados vazios orientam o próximo passo; erros oferecem recuperação.

## Dificuldades e soluções

| Situação                                 | Como abordar                                                                     |
| ---------------------------------------- | -------------------------------------------------------------------------------- |
| API responde fora de ordem durante busca | Chaves por filtros e AbortSignal separam e cancelam consultas                    |
| Digitação gera muitas requisições        | Para dados maiores, incluir debounce e paginação; aqui o catálogo é pequeno      |
| Link direto retorna 404 no hosting       | Rewrite da SPA no `vercel.json`                                                  |
| MSW não inicia em produção               | Manter bootstrap incondicional, servir o worker e usar HTTPS                     |
| localStorage corrompido ou bloqueado     | Validar entrada, tratar exceções e informar falha de persistência                |
| IDs favoritos desaparecem da API         | Mostrar apenas jogos ainda existentes; uma API real exigiria política de limpeza |
| Regressões de interação                  | Testes de comportamento, handlers compartilhados e E2E futuro                    |
| Cache mostra informação antiga           | Definir staleTime de acordo com negócio e invalidar após mutações remotas        |
| Versões atuais alteram APIs              | Conferir documentação e tipos instalados, fixar resolução no lockfile            |

## Limites para explicar com transparência

É um catálogo funcional de demonstração, sem execução de jogos, login, pagamentos ou backend. Imagens, métricas e datas são locais e fictícias. Não há paginação porque existem apenas 25 itens. A persistência é local. A arquitetura já permite trocar os serviços por uma API real; autenticação e autorização exigiriam projeto adicional.

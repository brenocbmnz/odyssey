# Como apresentar o Odyssey na entrevista

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

O contexto mantém uma lista de IDs. O módulo de armazenamento lê e grava JSON em uma chave versionada. Na inicialização, ele valida que há uma lista de strings e tolera JSON corrompido. Ao alternar um favorito, o estado da interface e o localStorage são atualizados. O evento `storage` sincroniza outras abas. Se o armazenamento estiver bloqueado, a sessão continua funcionando e o usuário recebe feedback. Esse mecanismo é local ao navegador, sem conta ou sincronização entre dispositivos. As coleções demo e RAWG usam chaves distintas para evitar que um ID fictício se torne outro jogo real. Na página de favoritos, cada ID é consultado individualmente; por isso jogos de outras páginas do catálogo continuam visíveis.

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
| Digitação gera muitas requisições        | Busca com debounce de 350ms e catálogo RAWG paginado, 24 jogos por página        |
| Link direto retorna 404 no hosting       | Rewrite da SPA no `vercel.json`                                                  |
| MSW não inicia em produção               | Manter bootstrap incondicional, servir o worker e usar HTTPS                     |
| localStorage corrompido ou bloqueado     | Validar entrada, tratar exceções e informar falha de persistência                |
| IDs favoritos desaparecem da API         | Mostrar apenas jogos ainda existentes; uma API real exigiria política de limpeza |
| Regressões de interação                  | Testes de comportamento, handlers compartilhados e E2E futuro                    |
| Cache mostra informação antiga           | Definir staleTime de acordo com negócio e invalidar após mutações remotas        |
| Versões atuais alteram APIs              | Conferir documentação e tipos instalados, fixar resolução no lockfile            |

## Limites para explicar com transparência

É um catálogo funcional de demonstração, sem execução de jogos, login, pagamentos ou backend. No demo, imagens, métricas e datas são locais e fictícias. No modo RAWG, os dados são reais, externos e paginados; descrições podem estar em inglês. A persistência é local. A arquitetura já permite trocar os serviços por uma API real; autenticação e autorização exigiriam projeto adicional.

## Integração real com RAWG

O modo real mantém o contrato do front-end e substitui MSW por duas funções serverless. Elas consultam a RAWG com uma chave privada. O Vite também oferece esse proxy no desenvolvimento. `RAWG_API_KEY` é lida no servidor; `VITE_GAME_SOURCE` seleciona o modo no build. Variáveis `VITE_*` são públicas, portanto nunca devem conter o segredo.

O proxy traduz gêneros e ordenação, normaliza cards e detalhes e converte links de paginação em `hasMore`. Isso impede vazar a chave que poderia estar embutida em `next`. Só respostas bem-sucedidas recebem cache compartilhado. O catálogo real é ordenado por adições na RAWG, não por jogadores simultâneos; a nota exibida é de 0 a 5. Há atribuição à RAWG em todas as páginas.

Os testes do proxy substituem a resposta upstream por fixtures e verificam erro, paginação, parâmetros e não exposição da chave. Os testes de navegador do modo real verificam favoritos além da primeira página e ausência de MSW, sem consumir a cota pessoal. Validar uma chave real exige configurá-la no ambiente e fazer a verificação na aplicação.

## Idiomas e ARIA

O contexto de idioma mantém apenas a preferência local. Um dicionário traduz a interface e interpola nomes, contagens e categorias. `Intl` formata números e datas. A UI muda sem alterar IDs, filtros da API ou cache remoto. O documento muda seu `lang` para que leitores de tela usem a pronúncia adequada. Os textos externos da RAWG permanecem no idioma original.

Usei primeiro HTML nativo: links para navegar, botões para ações, select para idioma e landmarks para organizar a página. ARIA complementa esse HTML: `aria-current` indica a rota, `aria-pressed` indica favoritos/filtros, `aria-expanded` e `aria-controls` descrevem o menu móvel, `aria-busy` marca consultas e status/alert comunicam feedback. A navegação do site não usa `role=menu`, porque essa função exigiria o modelo de teclado de um menu de aplicação.

Labels dos botões de favorito permanecem estáveis: o estado pressionado muda, evitando alternar simultaneamente nome e estado de um toggle. Os botões de ação nos detalhes mudam seu texto e não usam `aria-pressed`. Foco e leitura são cuidados distintos: ARIA explica estado, mas o código precisa mover ou recuperar foco nos casos adequados. Escape devolve foco ao botão do menu; remover um card de favoritos devolve foco ao título da coleção.

Axe-core ajuda a identificar violações automatizáveis. Playwright verifica teclado, persistência e comportamento; a auditoria manual com NVDA/VoiceOver continua necessária para confirmar uma experiência completa.

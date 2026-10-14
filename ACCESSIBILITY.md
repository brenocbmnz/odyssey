# Revisão de acessibilidade do Odyssey

A revisão cobre a interface em português e inglês nos modos demo e RAWG. O objetivo é aplicar HTML semântico e ARIA de acordo com a função real de cada elemento. Não é uma declaração de certificação WCAG.

| Ponto analisado                                  | Ajuste aplicado                                                                                                        |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Menu móvel sem relação explícita com a navegação | `aria-controls` aponta ao painel e `aria-expanded` reflete sua abertura                                                |
| Ordem de foco no painel                          | Abertura leva foco ao botão de fechar; Escape e fechar devolvem ao acionador; sair do painel por Tab fecha a navegação |
| Navegação confundida com menu de aplicação       | Preservados links e `nav`; não foi introduzido `role=menu`                                                             |
| Avatar decorativo com label sem função           | Ícone visual removido da árvore de acessibilidade                                                                      |
| Rótulos e feedback apenas em português           | Tradução de conteúdo visível, labels, mensagens e `html.lang`                                                          |
| Nome do toggle de favorito mudava com o estado   | Label estável e `aria-pressed`; botões de ação dos detalhes usam texto de adicionar/remover sem estado de toggle       |
| Filtros com label em container genérico          | Grupo nomeado com `role=group`, estado de seleção e relação com a região de resultados                                 |
| Skeletons sem anúncio confiável                  | Status fora da região ocupada, `aria-busy` na região e elementos decorativos ocultos                                   |
| Região de resultados e cards sem nome            | Região nomeada, artigos associados aos títulos via `aria-labelledby`                                                   |
| Perda de foco quando um card era removido        | Foco retorna ao título de favoritos se o elemento focado foi removido                                                  |
| Perda de foco após tentar novamente              | Foco retorna à região de resultados ao finalizar a consulta                                                            |
| Paginação sem landmark                           | `nav` nomeada, página atual e botões nativos com estado disabled                                                       |
| Títulos dos estados vazios/erros                 | Hierarquia com `h2` após o título principal                                                                            |
| Formatação de datas e avaliações                 | `Intl` usa o idioma selecionado                                                                                        |

## Verificação

- Vitest e React Testing Library: idioma, persistência, documento, interpolação, armazenamento inválido, favoritos, pesquisa e erros.
- Playwright: navegação com Enter/Escape, foco, troca de idioma e persistência após reload, filtros e favoritos.
- Axe-core: regras com tags `wcag2a`, `wcag2aa`, `wcag21aa` e `wcag22aa` nas páginas home, catálogo, detalhes, favoritos, vazio e 404.
- Resoluções: desktop 1440×1000 e mobile 390×844.
- Modos: demo com MSW e RAWG com fixtures, sem consumir a chave pessoal.

O projeto também preserva link para pular ao conteúdo, foco visível, HTML semântico, ícones decorativos ocultos e respeito a `prefers-reduced-motion`. As imagens possuem alternativas textuais e os controles usam elementos nativos.

## Limites e próximos passos

Os dados externos não são traduzidos automaticamente. As descrições RAWG são apresentadas como conteúdo predominantemente em inglês; a API não fornece um contrato de idioma por descrição. A auditoria automática não verifica qualidade de pronúncia, todas as combinações de leitores de tela nem todos os cenários de zoom. A avaliação manual com NVDA/VoiceOver, zoom e dispositivos reais permanece indicada.

## Referências

- [WAI: padrão Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)
- [WAI: navegação com disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)
- [WAI: mensagens de status](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA22)

## Carrossel e pesquisa com sugestões

O destaque segue o padrão de carrossel com `aria-roledescription` localizado, slide nomeado e status de posição. Apenas o slide ativo é renderizado. Os controles permanecem no DOM para preservar foco e a navegação é manual.

A pesquisa mantém foco no input com `role=combobox`, `aria-autocomplete=list`, `aria-expanded`, `aria-controls` e `aria-activedescendant`. Opções usam `role=option` e `aria-selected`. O teclado permite escolher, abrir e fechar sugestões; mouse e toque selecionam jogos. A listbox contém somente opções; loading, erros e ação para ver todos os resultados ficam fora dela.

Os testes de descoberta cobrem controles do carrossel, seleção por teclado, Escape, limpar, busca completa, estado vazio, clique/toque, idioma e auditoria axe com a lista aberta.

Referências: [padrão de carrossel](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) e [padrão de combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).

### Transições e painel adaptativo

As cores são derivadas de pixels e combinadas com grafite antes de compor o painel. O texto claro mantém a legibilidade; o fallback também é escuro. Os testes verificam contraste de pelo menos 4,5:1 para o texto secundário em capas de cores extremas. As imagens ocultas do carrossel são decorativas e ficam fora da árvore de acessibilidade. A troca aguarda o carregamento da próxima capa, e o painel indica ocupação durante essa espera.

`prefers-reduced-motion` desativa o fade do texto, o fade entre imagens e a transição de cor. Playwright verifica a troca efetiva da cor, estabilidade da altura e ausência de animação quando essa preferência está ativa.

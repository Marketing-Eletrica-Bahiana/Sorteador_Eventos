# Sorteador de Eventos | Elétrica Bahiana (EB)

Sorteador dos eventos internos da EB. Cada evento tem participantes, brindes e sorteados. O palco
é feito para telão, e quem só acompanha vê o sorteio e a dashboard ao vivo, de qualquer lugar.

- Repositório (público): https://github.com/Marketing-Eletrica-Bahiana/Sorteador_Eventos
- Endereço publicado: https://marketing-eletrica-bahiana.github.io/Sorteador_Eventos/
- Projeto modelo: Controle de Atividades
  (https://github.com/Marketing-Eletrica-Bahiana/Controle_Atividades). Seguir o mesmo padrão em
  tudo que se aplicar.

## Como trabalhar neste projeto

- Trabalhar em fases. Ao fim de cada fase: testar, fazer o commit, enviar para o GitHub e explicar
  em português simples como conferir. Esperar a aprovação antes de começar a fase seguinte.
- Manter este arquivo atualizado a cada fase.
- Toda a interface em português do Brasil.
- Nunca usar travessão nos textos da interface.
- Datas sempre exibidas como DD/MM/AAAA. Horas sempre exibidas como HH:MM. Fuso `America/Bahia`.
- Nenhum e-mail da equipe em arquivo que vai para o repositório (código, documentação, testes,
  dados de exemplo). O repositório é público. Os cadastros ficam só no Firestore.
- Não copiar código do sorteador antigo (Sorteador_do_CAE). Este é um projeto novo.

## Fases

1. (Feita) Base: projeto Vite + React, marca e fontes em `public/`, estilos da identidade, login
   com Google (domínio e leitura do cadastro), menu por papel, telas provisórias de Eventos e
   Equipe, regras em `firestore.rules` e publicação automática no GitHub Pages.
2. (Feita) Equipe (`#/equipe`, só admin): cadastrar, editar nome, cargo e papel, ativar e
   desativar (ver "Equipe").
3. (Feita) Eventos e visão geral (`#/eventos`): indicadores, filtro, busca, cartões; criar,
   editar, duplicar e excluir (só admin). Telas do evento (`#/evento/:id` e
   `#/evento/:id/painel`) ainda provisórias, só com o resumo (ver "Eventos").
4. (Feita) Participantes e brindes (tela do sorteio, painel lateral com abas Participantes,
   Brindes, Sorteados e Evento): colar, importar, buscar, remover, apagar a lista; brindes com
   quantidade, ordem e edição (ver "Participantes e brindes").
5. (Feita) Palco e sorteio: sorteio justo, animação, confete, som, modo Apresentar, desfazer,
   recomeçar, encerrar e reabrir; quem acompanha vê ao vivo (ver "Palco e sorteio").
6. (Feita) Dashboard do evento (`#/evento/:id/painel`) em tempo real, com modo apresentação
   (ver "Dashboard").
7. (Feita) Planilha (.xlsx) e encerramento (ver "Planilha").
8. (Feita) Revisão geral: paleta, fontes, datas e horas, permissões x regras, celular, telas
   que redesenham sem parar (ver "Revisão").

9. (Feita) Roleta para tablet: aba ao lado do Sorteio, integrada à lista de participantes, com giro
   pelo toque na roda (ver "Roleta").

Em 31/10/2026, depois de aprovar as Fases 1 a 3, a pessoa autorizou fazer as Fases 4 a 8 em
sequência, sem pedir aprovação entre elas, mantendo teste, commit e publicação ao fim de cada uma.

## Tecnologia

- React + Vite (JavaScript, arquivos `.jsx`).
- Firebase pelo pacote npm: Authentication com Google e Firestore.
- Testes com Vitest (`npm test`), para as funções puras de `src/lib/`.
- Organização: `src/lib/` (funções puras e testes), `src/dados/` (leitura e gravação no
  Firestore), `src/hooks/`, `src/componentes/`, `src/telas/`.
- Ícones Lucide (`lucide-react`).
- Rotas com HashRouter (endereços com `#/`), para não dar erro 404 ao recarregar.
  `public/404.html` leva endereços sem `#` para a rota certa.
- Base do Vite: `"/Sorteador_Eventos/"`, com maiúsculas e minúsculas exatamente assim. Imagens e
  arquivos de `public/` são referenciados no código com `import.meta.env.BASE_URL` (ver
  `src/lib/marca.js`).
- Hospedagem no GitHub Pages, com publicação automática por GitHub Actions a cada envio na
  branch `main` (`.github/workflows/publicar.yml`). Em Settings > Pages, a origem precisa estar
  em "GitHub Actions".
- Login com `signInWithPopup`; se falhar no celular, usar `signInWithRedirect`.
- Planilhas: ExcelJS para gerar o .xlsx (Fase 7) e também para ler os .xlsx importados (Fase 4),
  carregado só quando a tela precisa. .txt e .csv são lidos direto, sem biblioteca.
- Sons gerados pelo próprio navegador (Web Audio), sem arquivos de áudio.
- Node 24.

## Firebase

Projeto `sorteador-eventos-eb`, já configurado no console:

- Login com Google ativado.
- Domínio `marketing-eletrica-bahiana.github.io` autorizado.
- Firestore em `southamerica-east1`.
- Regras publicadas.
- Membros iniciais já cadastrados.

Configuração usada em `src/firebase.js`:

```js
const firebaseConfig = {
  apiKey: "AIzaSyAu0ECPPA0HlaRpbGh09vNok-pTwRKr_cU",
  authDomain: "sorteador-eventos-eb.firebaseapp.com",
  projectId: "sorteador-eventos-eb",
  storageBucket: "sorteador-eventos-eb.firebasestorage.app",
  messagingSenderId: "1023888130075",
  appId: "1:1023888130075:web:984079eadfa13e5c97f8be"
};
```

A configuração web do Firebase não é segredo e pode ficar no repositório; quem protege os dados
são as regras do Firestore. Chave de conta de serviço e senha nunca vão para o repositório.

## Identidade visual (Endomarketing EB #EnergiaBahiana 2026)

### Paleta

Só estas 7 cores, e nenhuma outra, em fundos, textos, bordas, ícones, confete ou gráficos:

| Cor | Nome | Uso |
|---|---|---|
| `#001780` | Azul Marinho EB | cabeçalho, fundos institucionais, títulos, cabeçalhos de tabela |
| `#0037ff` | Azul Brilhante EB | botões principais, destaques, botão Sortear |
| `#4069ff` | Azul Médio EB | elementos secundários, texto sobre fundo escuro |
| `#d4121a` | Vermelho EB | alertas, erros, avisos de campo faltando, excluir |
| `#a92a2e` | Vermelho Escuro EB | hover e variação do vermelho |
| `#ffffff` | Branco | fundos de conteúdo, texto sobre escuro |
| `#000000` | Preto | texto sobre fundo claro |

- Tons claros só como transparência dessas cores (ex.: `#4069ff` a 10% para linhas alternadas de
  tabela).
- Proibido amarelo, laranja, cinza, verde, roxo ou outros azuis. Por isso o botão de login usa
  ícone Lucide, e não o "G" colorido do Google.

### Gradientes

- Principal: `linear-gradient(135deg, #001780 0%, #0037ff 60%, #4069ff 100%)`
- Vermelho: `linear-gradient(135deg, #a92a2e 0%, #d4121a 100%)`
- Premium: `linear-gradient(135deg, #000000 0%, #001780 100%)`

### Fontes

Todas em `public/fontes/`, carregadas por `@font-face` em `public/fontes/fontes.css`:

- Lato em toda a interface, pelos arquivos locais `Lato-Light.ttf` (300), `Lato-Regular.ttf`
  (400), `Lato-Bold.ttf` (700) e `Lato-Black.ttf` (900), mais os itálicos. Licença em `OFL.txt`.
  Nome da família no CSS: `EB Lato`.
- Google Fonts (Lato 300, 400, 700 e 900) só como reserva, carregado sem bloquear a página. O site
  não depende de serviço externo para a fonte.
- Klavika para títulos de destaque e números grandes: `klavika-bold.otf`, `klavika-medium.otf` e
  `klavika-light.otf`. Os arquivos ainda não chegaram. Enquanto isso, cada `@font-face` da
  Klavika tem `Lato-Black.ttf` como segunda origem, então a alternativa Lato Black entra sozinha
  e a Klavika passa a valer assim que os arquivos forem colocados na pasta.

### Logos

Em `public/marca/logos/`. Cada arquivo é um quadrado de cerca de 1043 x 1043 px com o logo no
meio e muita área transparente; o componente `Logo` recorta essa sobra por CSS, sem alterar o
logo.

Atenção: no par azul os nomes estão trocados em relação ao formato. O código escolhe pelo formato
real:

| Formato real | Sobre fundo escuro | Sobre fundo claro |
|---|---|---|
| Uma linha (símbolo, nome e assinatura lado a lado) | `Logotipo_Horizontal_Branco.png` | `Logotipo_Vertical_Azul.png` |
| Compacto (símbolo ao lado do nome em duas linhas) | `Logotipo_Vertical_Branco.png` | `Logotipo_Horizontal_Azul.png` |
| Ícone, para espaços pequenos (180 x 180 px) | `Icone_Branco.png` | `Icone_Azul.png` |

- `Icone_Azul.png` é o favicon.
- Logos do CAE (Centro de Apoio ao Eletricista): `Logo_CAE_Colorida_Vertical.png` no centro da
  roleta (`logoDoCae` em `src/lib/marca.js`), sobre disco branco. As outras três
  (`Logo_CAE_Colorida_Horizontal.png` e as duas `Logo_CAE_Branca_*.png`) estão guardadas para
  quando precisar. É a marca do CAE, usada como está: as cores dela ficam fora da regra da paleta.
- Nunca recriar o logo em texto. Nunca aplicar sombra, rotação ou mudança de cor no logo.
- Título da aba do navegador: `Sorteador de Eventos | Elétrica Bahiana`.

### Patterns

Em `public/marca/patterns/`, PNG com fundo transparente:

- `Pattern_EB_1080x1080.png` e `Pattern_EB_1080x1920.png` (circuito): fundos de impacto. As linhas
  ficam só na faixa da direita da imagem.
- `Pattern_Endomarketing_1080x1080.png` e `Pattern_Endomarketing_1080x1920.png` (ondas): fundos
  discretos.
- Sobre o gradiente principal, com opacidade de 10 a 20%.

### Mascotes

Em `public/marca/mascotes/`: `Mascote_Ebinho.png` e `Mascote_Ebinha.png` (1080 x 1920 px, fundo
transparente).

- Só na tela de login, em telas vazias e em mensagens de boas-vindas.
- Nunca no palco do sorteio nem na dashboard.
- Usar como estão.

### Conceito e detalhes

- Conceito visual: circuito elétrico; linhas finas em `#0037ff` com brilho sutil.
- Hashtag `#EnergiaBahiana` em Lato Black, sempre com essa grafia, no rodapé.
- Grade de 8px.
- Raios: 4px etiquetas, 8px cartões e botões, 16px janelas, 100px pílulas.
- Sombra de cartão: `0 2px 8px rgba(0,23,128,0.10)`.
- Sombra de janela: `0 8px 24px rgba(0,23,128,0.16)`.
- Transições de 200ms ease-out.
- Hover de botão: `brightness(0.92)` e `translateY(-1px)`.
- Hover de cartão: `translateY(-4px)`.
- Os valores acima estão como variáveis no topo de `src/styles.css`.
- Animações respeitam `prefers-reduced-motion`. Exceção: a Roleta (ver "Roleta").

### Tabelas

- Cabeçalho `#001780` com texto branco em Lato Bold.
- Linhas alternadas em `#4069ff` a 10%.
- No celular, tabelas viram listas de cartões.

### Cores de situação

| Situação | Cor |
|---|---|
| evento aberto | `#0037ff` |
| evento encerrado | `#001780` |
| alerta | `#d4121a` |

### Tom

Empolgante, humano, direto, orgulho baiano. Assinatura: "Mais forte por você!".

## Papéis

- `admin`: tudo, inclusive cadastrar a equipe e excluir eventos.
- `organizador`: cria e edita eventos, cadastra participantes e brindes, sorteia e encerra.
- Acompanhamento: qualquer pessoa `@eletricabahiana.com.br` que fizer login, mesmo sem cadastro
  em `membros` (ou com cadastro desativado ou papel inválido), acompanha os eventos, o palco e as
  dashboards ao vivo, sem botões de edição. No código esse papel se chama `acompanhante` e nunca
  é gravado no Firestore.

Só entram e-mails `@eletricabahiana.com.br`. A interface respeita as mesmas permissões das regras
do Firestore e esconde o que a pessoa não pode usar. Papéis, menu e permissões ficam em
`src/lib/papeis.js`; o `ProvedorAcesso` entrega `pessoa` (`email`, `nome`, `cargo`, `papel`).

## Dados no Firestore

As regras publicadas dependem destes nomes. Texto das regras em `firestore.rules`.

- `membros/{email em minúsculas}`: `nome`, `cargo`, `papel` (`"admin"` | `"organizador"`),
  `ativo` (boolean).
- `eventos/{id}`:
  - `titulo`, `descricao`, `data` (`"AAAA-MM-DD"`), `status` (`"aberto"` | `"encerrado"`)
  - `brindes`: lista de `{nome, qtd}` (`qtd` null = sem limite)
  - `brindeAtual`, `porVez`
  - `participantes`: lista de `{id, nome}`
  - `sorteados`: lista de `{id, em, brinde, rodada, porEmail}`
  - `giros`: lista de `{id, casa, resultado, em, porEmail}`, com `resultado` `"ganhou"` |
    `"gire_de_novo"` | `"nao_ganhou"` (só existe depois do primeiro giro)
  - `roletaVez`: id de quem está marcado para girar agora, ou null
  - `criadoPorEmail`, `criadoPorNome`, `criadoEm`, `atualizadoEm`, `encerradoEm`
- Toda alteração de evento em transação, para dois organizadores ao mesmo tempo nunca
  sobrescreverem um ao outro nem sortearem a mesma pessoa duas vezes.
- Regras: `membros`, logado lê e admin grava; `eventos`, logado lê, organizador (ou admin) cria e
  atualiza, só admin exclui.

## Equipe (definido na Fase 2)

Código em `src/telas/equipe/`, `src/dados/membros.js` (leitura e gravação) e `src/lib/equipe.js`
(validação, com testes).

- O ID do documento é o e-mail em minúsculas e sem espaços; o e-mail não muda depois do cadastro.
  Só entram e-mails `@eletricabahiana.com.br` (domínio em `src/lib/empresa.js`).
- Grava só `nome`, `cargo`, `papel` e `ativo`. Cadastro novo em transação, para não sobrescrever
  quem já existe; a tela também avisa "Essa pessoa já está cadastrada." antes de gravar.
- Papéis que o admin escolhe: Organização (`organizador`) e Administração (`admin`).
  Acompanhamento não se cadastra: é quem não tem cadastro ativo.
- Desativar pede confirmação e não apaga nada: a pessoa continua entrando, mas só acompanha.
  Ninguém é excluído da equipe.
- O admin não muda o próprio papel nem desativa o próprio acesso (sempre sobra pelo menos um
  admin ativo).
- Cadastro com papel fora da lista aparece como "Papel inválido" em vermelho; ao editar, o
  formulário já abre com Organização escolhida.

## Eventos (definido na Fase 3)

Código em `src/telas/eventos/` (visão geral, cartão e formulário), `src/telas/evento/` (telas de
um evento), `src/dados/eventos.js` e `src/lib/eventos.js` (cálculos, com testes).

- Toda alteração de evento passa por `alterarEvento(id, alterar)` em `src/dados/eventos.js`: lê o
  evento dentro de uma transação e grava só o que `alterar` devolve, mais `atualizadoEm`. As
  próximas fases (participantes, brindes, sorteio) usam a mesma função.
- Evento novo (`novoEvento`): `status: "aberto"`, listas vazias, `brindeAtual: null`, `porVez: 1`,
  `encerradoEm: null`, `criadoEm` e `atualizadoEm` do servidor. Criado em transação.
- Números de cada evento (`numerosDoEvento`): participantes, sorteados, na disputa (participantes
  que ainda não saíram) e brindes entregues (sorteados com brinde). A barra de progresso é a parte
  dos participantes que já saiu.
- Visão geral: mais recentes primeiro pela data; no mesmo dia, por nome. Busca sem diferenciar
  acentos e maiúsculas, no nome e na descrição, com cada palavra em qualquer ordem.
- Duplicar abre o formulário com "(cópia)" no nome, a data de hoje e a mesma descrição. Vão junto
  brindes, participantes e pessoas por sorteio; os sorteados não.
- Excluir só para admin, com confirmação que mostra quantos participantes e sorteados somem.
- Telas do evento ficam fora do menu, abertas para todos os papéis; o menu continua marcando
  Eventos. Evento inexistente mostra "Evento não encontrado.".
- Depois de criar ou duplicar um evento, a tela do sorteio dele abre direto (desde a Fase 4).
- Formulários: mexer num campo apaga o aviso vermelho dele.

## Participantes e brindes (definido na Fase 4)

Tela do sorteio em `src/telas/evento/Sorteio.jsx`, com o painel lateral nas abas
`AbaParticipantes`, `AbaBrindes`, `AbaSorteados` e `AbaEvento`. Gravação em
`src/dados/acoesDoEvento.js` (sempre por `alterarEvento`); regras em `src/lib/participantes.js`,
`src/lib/brindes.js` e `src/lib/planilha.js`, com testes.

- Participantes `{id, nome}`. IDs `p1`, `p2`... continuando do maior que existe. Nome sem espaços
  sobrando, até 120 letras. Repetido é achado sem diferenciar acentos, maiúsculas e pontuação.
  Limite de 2.000 por evento; o que passa do limite fica de fora e o aviso diz quantos.
- Colar: um nome por linha. Importar: `.txt` (um por linha), `.csv` (separador `;` ou `,`) ou
  `.xlsx` (ExcelJS, carregado só na hora). A coluna é achada pelo cabeçalho "Nome", "Nomes",
  "Participante", "Participantes", "Nome completo" ou "Nome do participante", nas 10 primeiras
  linhas; sem cabeçalho, vale uma tabela de uma coluna só. `.txt` e `.csv` em ANSI do Windows
  (windows-1252) também são lidos. `.xls` antigo pede para salvar como `.xlsx`.
- Quem já foi sorteado nunca sai da lista. "Apagar a lista" tira só quem ainda não foi sorteado.
- A lista mostra até 300 nomes; a busca acha os outros.
- Brindes `{nome, qtd}` (`qtd` null = sem limite), nome único sem diferenciar acentos e
  maiúsculas, até 80 letras. Entregues = sorteados com aquele brinde. A quantidade não pode ficar
  menor que o já entregue. Brinde já entregue não sai da lista (só muda a quantidade).
- A ordem dos brindes (setas na aba Brindes) vale para as teclas 1 a 9 do palco.
- Renomear um brinde leva junto os sorteados e o brinde da vez. Se a quantidade nova esgotar o
  brinde da vez, ele sai da vez (`brindeAtual: null`).
- Evento encerrado não muda participantes, brindes nem sorteados (`garantirAberto`); o painel
  avisa para reabrir. Os dados do evento (nome, data, descrição) continuam editáveis.
- Quem só acompanha vê as quatro abas sem formulários nem botões de mudança.
- Sem mascotes na tela do sorteio, nem no painel lateral.

## Palco e sorteio (definido na Fase 5)

Palco em `src/telas/evento/Palco.jsx`; regras em `src/lib/sorteio.js` (com testes); animação em
`src/hooks/useRevelacao.js`; som em `src/hooks/useSom.js`; tela cheia em
`src/hooks/useApresentacao.js`; confete em `src/componentes/Confete.jsx`.

- Sorteio justo: `inteiroAleatorio` usa `crypto.getRandomValues` e descarta os valores do fim do
  intervalo de 32 bits que causariam viés; `escolherPosicoes` é um Fisher-Yates parcial. Roda
  dentro da transação (`sortearRodada`): se outra pessoa sorteou ao mesmo tempo, refaz com a
  lista nova, então ninguém sai duas vezes.
- Cada clique em Sortear é uma rodada (`rodada` = última + 1) com `porVez` pessoas (1 a 50),
  limitado a quem está na disputa e ao estoque do brinde da vez. `sorteados[].em` é a hora do
  computador de quem sorteou (o `serverTimestamp` não funciona dentro de listas).
- Sem brindes cadastrados, o sorteio só mostra nomes (`brinde: null`). Com brindes, precisa de
  um brinde da vez com estoque; o que acaba sai da vez e das opções (`brindeAtual: null`).
- Animação igual para todos: a rodada nova chega pela atualização do evento, os nomes giram por
  3,2 s e o resultado aparece. Quem clicou começa a girar na hora e revela no mesmo tempo de quem
  assiste de longe. Durante o giro, números e estoque ainda não contam a rodada nova.
- Ao abrir a tela, a última rodada aparece parada, sem festa. Desfazer ou recomeçar volta a
  mostrar a rodada anterior, também sem festa.
- Uma pessoa: placa grande. Várias: grade, entrando uma a uma (350 ms de diferença). Brilho na
  placa e confete só com as cores da paleta.
- Som (Web Audio): tique a cada nome que passa e fanfarra na revelação. Botão para ligar e
  desligar, guardado no navegador (`localStorage`, chave `sorteador:som`). O navegador só libera
  o som depois do primeiro toque ou tecla na página.
- `prefers-reduced-motion`: sem nomes girando (mostra "Sorteando..." por 0,9 s) e sem confete.
- Teclas, só para quem pode sortear e fora de campos de texto e janelas: barra de espaço sorteia;
  1 a 9 escolhem os nove primeiros brindes disponíveis, na ordem da aba Brindes.
- Modo Apresentar (todos os papéis, inclusive quem acompanha, para a TV): palco na tela inteira,
  sem painel lateral, com o logo; tenta tela cheia do navegador e Wake Lock (tela sempre acesa,
  pedida de novo quando a aba volta a aparecer). Sem tela cheia (iPhone), o palco ocupa a janela.
  Esc ou "Sair" voltam.
- Desfazer o último sorteio tira a rodada inteira (pessoas voltam para a disputa, brindes para o
  estoque), com confirmação mostrando os nomes. Recomeçar apaga todos os sorteados (mantém
  participantes e brindes), com confirmação.
- Encerrar (`status: "encerrado"`, `encerradoEm`) e reabrir ficam na aba Evento. Encerrado, o
  palco mostra a etiqueta "Encerrado" e esconde os controles.
- Aba Sorteados: quem organiza troca o brinde de alguém por outro com estoque, ou "Sem brinde".

## Dashboard (definido na Fase 6)

Tela em `src/telas/evento/Dashboard.jsx`, aberta para todos os papéis, sem mascotes.

- Cinco indicadores: participantes, sorteados, na disputa, brindes entregues e brindes
  restantes ("Sem limite" quando algum brinde não tem limite; `resumoDosBrindes`).
- Estoque de brindes: uma barra por brinde com limite (entregues sobre a quantidade); brinde sem
  limite mostra só o texto; esgotado mostra "Acabou".
- Últimos sorteados: os 12 mais recentes, com Nº, nome, brinde e hora (HH:MM); a rodada mais
  recente fica destacada com "Acabou de sair".
- Usa o mesmo `useRevelacao` do palco: uma rodada nova só aparece depois do tempo do giro, com a
  etiqueta "Sorteando..." enquanto isso. Assim a dashboard numa TV não estraga a surpresa do
  telão.
- Modo apresentação (`useApresentacao`): tela inteira com o gradiente premium, letras maiores,
  logo branco e botão "Sair".

## Planilha (definido na Fase 7)

Geração em `src/lib/excel.js` (com testes que leem o arquivo de volta); botão e download em
`src/componentes/BotaoPlanilha.jsx`.

- ExcelJS carregado só quando alguém baixa (`import('exceljs')`), num arquivo separado do site.
- Abas, com cabeçalho `#001780`, texto branco em Lato Bold, corpo em Lato e cabeçalho fixo:
  - Sorteados: Nº, Rodada, Nome, Brinde ("Sem brinde" quando não tem), Data (DD/MM/AAAA), Hora
    (HH:MM), na ordem em que saíram. Data e hora no fuso America/Bahia.
  - Brindes: Brinde, Quantidade, Sorteados (entregues), Sobraram ("Sem limite" quando não tem).
  - Participantes: Nº, Nome, Situação ("Sorteado" ou "Na disputa").
- Nome do arquivo: `Sorteio_[Nome_do_evento]_DD-MM-AAAA.xlsx`, sem os caracteres que o Windows não
  aceita.
- "Baixar planilha" a qualquer momento, para todos os papéis: aba Evento, aba Sorteados e
  dashboard (fora do modo apresentação).
- Encerrar o evento baixa a planilha sozinho logo depois de gravar o encerramento.

## Roleta (definido na Fase 9)

Tela em `src/telas/evento/Roleta.jsx`; roda em `Roda.jsx`; lista para marcar em `AbaQuemGira.jsx`;
resultados em `AbaResultados.jsx`; regras
em `src/lib/roleta.js` (com testes); gravação em `src/dados/acoesDoEvento.js`.

- Aba "Roleta" ao lado de "Sorteio", em cima do palco. O modo fica no endereço
  (`#/evento/:id?modo=roleta`), para o tablet e a TV abrirem direto. Na Roleta, o painel lateral tem
  Quem gira, Participantes, Resultados e Evento. O nome no topo é o do evento; a logo do centro é
  sempre a do CAE.
- 16 casas, no sentido horário a partir do topo: Não ganhou, Ganhou, Não ganhou, Gire de Novo,
  repetido 4 vezes (`CASAS`). São 4 Ganhou (`#001780`), 4 Gire de Novo (`#4069ff`) e 8 Não ganhou
  (`#d4121a`), com texto branco. Como Gire de Novo só repete o giro, 1 em cada 3 pessoas ganha.
- Todo mundo da lista gira uma vez, sem sorteio de quem gira. Quem organiza marca a pessoa na aba
  Quem gira (com busca). No tablet (até 1024 px) e na tela cheia, sem o painel ao lado, o botão
  "Marcar quem gira" abre a mesma lista numa janela; tocar na roda sem ninguém marcado também abre.
- Girar é tocar na roda: um toque rápido ou um arraste, e a roda acompanha o dedo enquanto ele está
  nela. Ao soltar, ela já sai girando (`aguardando`), sem esperar a gravação. O toque só dá a partida:
  a casa sai de `inteiroAleatorio` (mesma chance para as 16), e a roda é só animação até ela. Tudo em
  transação (`alterarEvento`). No computador, clique, Enter ou barra de espaço também giram.
- Ganhou e Não ganhou encerram a vez da pessoa, que não pode ser marcada de novo. Gire de Novo a
  mantém marcada, sem poder trocar, até ela girar.
- Desfazer tira o último giro e deixa marcada a pessoa que girou. Recomeçar (aba Resultados) apaga os
  giros e mantém a lista, com confirmação.
- Sem ligação com os brindes: Ganhou só registra o resultado. Sorteio e Roleta são independentes: a
  mesma pessoa pode sair nos dois. Quem girou não sai da lista de participantes, igual a quem foi
  sorteado.
- Animação igual para todos, pela atualização do evento: giro por 5,6 s (`DURACAO_DA_ROLETA`).
  Enquanto a roda gira, números, aba Resultados, aba
  Participantes e dashboard ainda não contam o giro novo. Confete e fanfarra só em Ganhou.
- A Roleta não respeita `prefers-reduced-motion`, por decisão de 04/11/2026: com os Efeitos de
  animação do Windows desligados, a roda não giraria, e o giro é a própria brincadeira. O palco do
  Sorteio continua respeitando (`useRevelacaoDaRoleta` em `src/hooks/useRevelacao.js`).
- A seta fica à direita da roda, onde o texto da casa aparece na horizontal.
- Para girar no tablet, ele precisa estar com login de quem tem papel Organização ou Administração.
- Quem só acompanha vê a mesma animação, sem controles. Modo Apresentar igual ao do palco.
- Dashboard: bloco "Roleta" com os números e os últimos giros, depois do primeiro giro.
- Planilha: aba Roleta (Nº, Nome, Resultado, Data, Hora) e coluna Roleta em Participantes ("Ganhou",
  "Não ganhou" ou "Falta girar"), só nos eventos em que alguém girou.

## O que o sorteador faz

### Eventos

- Vários eventos internos, cada um com nome, data, descrição, participantes, brindes, sorteados e
  status.
- Criar, editar, duplicar (copia nome, brindes e participantes, sem os sorteados) e excluir (só
  admin, com confirmação).

### Participantes

- Colar nomes (um por linha) ou importar .txt, .csv ou .xlsx (achar a coluna "Nome" ou
  "Participante"), ignorando repetidos sem diferenciar acento e maiúsculas, até 2.000 por evento.
- Buscar, remover quem ainda não foi sorteado, apagar a lista.

### Brindes

- Nome e quantidade (em branco = sem limite), sem limite de quantos brindes cadastrar.
- Antes de cada sorteio o organizador escolhe no palco o "brinde da vez". Quando o estoque acaba,
  o brinde sai das opções. Teclas 1 a 9 escolhem os nove primeiros.
- Dá para trocar o brinde de um sorteado depois.

### Palco do sorteio

- Tela grande, feita para telão: nome do evento, placa com o nome sorteado, brinde da vez, números
  (na disputa, sorteados, participantes) e botão "Sortear" (barra de espaço também sorteia).
- Sorteio justo com `crypto.getRandomValues`, sem viés; ninguém sai duas vezes.
- Uma pessoa ou várias de uma vez ("Pessoas por sorteio"); várias aparecem em grade, entrando uma
  a uma.
- Animação de nomes girando antes da revelação, brilho e confete nas cores da EB, som (tique e
  fanfarra) com botão para desligar. Respeitar `prefers-reduced-motion`.
- Modo "Apresentar": tela cheia, sem painel lateral, tela sempre acesa.
- Quem só acompanha vê a mesma animação ao vivo, sem controles.
- Desfazer o último sorteio (a rodada inteira), recomeçar, encerrar e reabrir.

### Planilha

- Ao encerrar, baixar um .xlsx (ExcelJS, cabeçalho `#001780` com texto branco em Lato) com as abas
  Sorteados (Nº, Rodada, Nome, Brinde, Data, Hora), Brindes (Brinde, Quantidade, Sorteados,
  Sobraram) e Participantes. Botão para baixar a qualquer momento.

## Telas

1. Login, como no Controle de Atividades, com o título "Sorteador de Eventos".
2. Eventos (`#/eventos`), a visão geral: indicadores (total de eventos, eventos abertos, pessoas
   sorteadas, brindes entregues), filtro Todos/Abertos/Encerrados, busca e cartões com status,
   data, números, barra de progresso e botões "Abrir sorteio" e "Dashboard". Botão "Novo evento"
   para organizadores.
3. Sorteio (`#/evento/:id`): palco e painel lateral com abas Participantes, Brindes, Sorteados e
   Evento.
4. Roleta (`#/evento/:id?modo=roleta`): roda de 16 casas que gira pelo toque, pessoa marcada e painel
   lateral com abas Quem gira, Participantes, Resultados e Evento.
5. Dashboard do evento (`#/evento/:id/painel`), em tempo real: números do evento, estoque de
   brindes, últimos sorteados (com destaque para quem acabou de sair) e modo apresentação em tela
   cheia com o gradiente premium, para TV.
6. Equipe (`#/equipe`, só admin): cadastrar, editar papel, ativar e desativar membros.

## Segurança

- Nunca colocar chave de conta de serviço ou senha no repositório.
- Nenhum e-mail da equipe no repositório (ver "Como trabalhar neste projeto").

## Notas técnicas

- O login por redirecionamento (`signInWithRedirect`) pode falhar em navegadores que bloqueiam
  cookies de terceiros (Safari no iPhone, por exemplo), porque o site está no GitHub Pages e o
  login no domínio do Firebase. O popup costuma funcionar no celular quando aberto pelo toque no
  botão.
- Para ver telas internas sem login, dá para subir o Vite com uma configuração de demonstração
  fora do repositório (em `.claude/`, que é ignorada), usando `resolve.alias` para trocar
  `acesso/ProvedorAcesso.jsx` e os módulos de `dados/` (hoje `membros.js` e `eventos.js`) por
  versões com dados de mentira guardados só na memória do navegador. O papel vem da URL, antes do
  `#` (`?papel=organizador`); `?vazio` começa sem eventos. Nunca gravar no Firestore real a partir
  dessa demonstração.
- Campo de data (`componentes/CampoData.jsx`): dentro de uma janela, o calendário abre no meio do
  formulário (para não ser cortado) e o Esc fecha só o calendário.
- Janelas (`componentes/Janela.jsx`): ao abrir, o navegador põe o foco no botão Fechar. Para focar
  o primeiro campo, marcar o campo com `data-foco` (o `autoFocus` do React não funciona aí).
- Campos de texto: os estilos de `.campo input` deixam de fora caixas de marcar e botões de opção.

## Revisão (Fase 8)

- Cores: só as 7 da paleta e transparências delas em todo o `src/` (CSS, confete e planilha).
  Conferido por busca de `#...` e `rgba(...)`.
- Fontes: só `EB Lato`, `Lato` e `Klavika` (com Lato Black de alternativa); a planilha usa Lato.
- Datas em DD/MM/AAAA e horas em HH:MM, sempre por `src/lib/datas.js` (fuso America/Bahia);
  nenhum campo de data do navegador.
- Sem travessão nos textos.
- Mascotes só no login e nas telas vazias de Eventos e Equipe; nunca no palco, no painel lateral
  ou na dashboard. Logo só pelo componente `Logo`.
- Permissões da interface iguais às regras: Equipe e excluir evento só admin; criar, editar,
  sortear e mexer em participantes e brindes para organizador e admin com cadastro ativo; o resto
  só leitura. Toda gravação de evento em transação (inclusive criar e excluir).
- Celular: todas as telas sem rolagem lateral; tabelas viram cartões.
- Telas que redesenham sem parar: conferido com um contador de mudanças na página parada (zero em
  todas as telas) e sem "Maximum update depth exceeded" no console.

## Pendências

- Arquivos da Klavika: colocar em `public/fontes/` quando chegarem (nomes acima). Até lá o
  console do navegador mostra um aviso de arquivo não encontrado, sem efeito na tela.
- Regras do Firestore: `firestore.rules` foi escrito a partir da descrição das regras publicadas.
  Comparar com o texto do console e deixar os dois iguais.
- A visão geral escuta a coleção `eventos` inteira, com as listas de participantes e sorteados de
  cada evento. Com muitos eventos grandes, pode ficar pesada no celular; se acontecer, guardar um
  resumo (números) num documento à parte para a visão geral.
- Pasta `assets/` (enviada antes do projeto: fundo azul e vermelho, faixa de circuito, logo SVG
  branco, mascotes em .webp e ícone): não é usada pelo app. Falta decidir se fica ou sai. O fundo
  azul e vermelho mistura as duas cores e gera tons de roxo, fora da paleta.
- Logo do CAE no centro da roleta: o arquivo tem só 178 x 156 px. Em telão grande pode perder
  nitidez; trocar por uma versão maior ou em vetor quando houver.
- Nomes trocados no par de logos azuis: se a marca corrigir os arquivos, ajustar a tabela de logos
  e `src/lib/marca.js`.

## Cuidado com telas que redesenham sem parar

No Controle de Atividades, uma tela travava o navegador porque um hook devolvia uma lista nova a
cada desenho e um `useEffect` que dependia dela gravava estado, o que pedia outro desenho, sem
fim. Regras deste projeto desde o início:

- Hooks de dados devolvem listas e objetos memorizados com `useMemo`, que só mudam quando o
  Firestore manda dados novos (o `pessoa` do `ProvedorAcesso` já segue isso).
- Não gravar estado em `useEffect` a partir de valores calculados; calcular com `useMemo` e guardar
  em estado só o que a pessoa escolheu na tela.
- Para conferir, abrir as telas e procurar no console "Maximum update depth exceeded".

# Sorteador de Eventos | Elétrica Bahiana

Sorteador dos eventos internos da Elétrica Bahiana: participantes, brindes, palco para telão e
dashboard ao vivo.

Endereço: https://marketing-eletrica-bahiana.github.io/Sorteador_Eventos/

## O que tem

- Login com o Google, só para e-mails @eletricabahiana.com.br.
- Visão geral dos eventos, com indicadores, filtro e busca.
- Participantes colados ou importados (.txt, .csv, .xlsx) e brindes com quantidade.
- Palco do sorteio para telão, com sorteio justo, animação, confete, som e modo Apresentar.
- Roleta de 16 casas para tablet: quem organiza marca a pessoa da lista, ela toca na roda para girar
  e o site registra quem ganhou.
- Dashboard do evento em tempo real, com modo para TV.
- Planilha .xlsx com sorteados, brindes e participantes.
- Tela Equipe para o admin cadastrar quem organiza.

## Rodar no computador

Precisa do Node 24.

```bash
npm install
npm run dev
```

Depois abra http://localhost:5173/Sorteador_Eventos/ no navegador.

## Testes

```bash
npm test
```

## Publicação

Cada envio na branch `main` publica o site sozinho pelo GitHub Actions (aba **Actions** do
repositório). Em **Settings > Pages**, a opção **Source** precisa estar em **GitHub Actions**.

Regras do projeto, dados e identidade visual: [CLAUDE.md](CLAUDE.md).

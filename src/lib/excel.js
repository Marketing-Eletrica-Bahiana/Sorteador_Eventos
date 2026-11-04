// Planilha do evento (ExcelJS, carregado só quando alguém baixa). Cabeçalho com fundo #001780,
// texto branco e fonte Lato. Datas em DD/MM/AAAA e horas em HH:MM, no fuso da Bahia.

import { estoqueDosBrindes } from './brindes.js'
import { formatarData, formatarDataDoMomento, formatarHora } from './datas.js'
import { idsSorteados } from './participantes.js'
import { listaDeGiros, RESULTADOS, resultadoPorPessoa } from './roleta.js'
import { listaDeSorteados } from './sorteio.js'

const MARINHO = 'FF001780'
const BRANCO = 'FFFFFFFF'
const SEM_LIMITE = 'Sem limite'

function estilizarCabecalho(linha) {
  linha.height = 24
  linha.eachCell((celula) => {
    celula.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: MARINHO } }
    celula.font = { name: 'Lato', bold: true, color: { argb: BRANCO } }
    celula.alignment = { vertical: 'middle' }
  })
}

function aba(pasta, nome, colunas, linhas) {
  const planilha = pasta.addWorksheet(nome)
  planilha.columns = colunas.map(({ largura }) => ({ width: largura }))
  estilizarCabecalho(planilha.addRow(colunas.map((c) => c.titulo)))
  for (const linha of linhas) planilha.addRow(linha).font = { name: 'Lato' }
  planilha.views = [{ state: 'frozen', ySplit: 1 }]
  return planilha
}

// Linhas de cada aba, sem depender do ExcelJS (testadas à parte).
export function linhasDaPlanilha(evento) {
  const sorteados = listaDeSorteados(evento).map((s) => [
    s.numero,
    s.rodada,
    s.nome,
    s.brinde ?? 'Sem brinde',
    formatarDataDoMomento(s.em),
    formatarHora(s.em),
  ])
  const brindes = estoqueDosBrindes(evento).map((b) => [
    b.nome,
    b.qtd ?? SEM_LIMITE,
    b.entregues,
    b.restantes ?? SEM_LIMITE,
  ])
  const saiu = idsSorteados(evento)
  const roleta = listaDeGiros(evento).map((g) => [
    g.numero,
    g.nome,
    RESULTADOS[g.resultado].rotulo,
    formatarDataDoMomento(g.em),
    formatarHora(g.em),
  ])
  // A coluna Roleta só aparece nos eventos em que alguém girou.
  const resultados = resultadoPorPessoa(evento)
  const colunaDaRoleta = (p) => (roleta.length ? [RESULTADOS[resultados.get(p.id)]?.rotulo ?? 'Falta girar'] : [])
  const participantes = (evento.participantes ?? []).map((p, i) => [
    i + 1,
    p.nome,
    saiu.has(p.id) ? 'Sorteado' : 'Na disputa',
    ...colunaDaRoleta(p),
  ])
  return { sorteados, brindes, participantes, roleta }
}

export async function gerarPlanilha(evento) {
  const { default: ExcelJS } = await import('exceljs')
  const pasta = new ExcelJS.Workbook()
  pasta.creator = 'Sorteador de Eventos | Elétrica Bahiana'
  pasta.title = evento.titulo
  const linhas = linhasDaPlanilha(evento)
  aba(
    pasta,
    'Sorteados',
    [
      { titulo: 'Nº', largura: 6 },
      { titulo: 'Rodada', largura: 9 },
      { titulo: 'Nome', largura: 40 },
      { titulo: 'Brinde', largura: 30 },
      { titulo: 'Data', largura: 12 },
      { titulo: 'Hora', largura: 8 },
    ],
    linhas.sorteados,
  )
  aba(
    pasta,
    'Brindes',
    [
      { titulo: 'Brinde', largura: 34 },
      { titulo: 'Quantidade', largura: 13 },
      { titulo: 'Sorteados', largura: 12 },
      { titulo: 'Sobraram', largura: 12 },
    ],
    linhas.brindes,
  )
  aba(
    pasta,
    'Participantes',
    [
      { titulo: 'Nº', largura: 7 },
      { titulo: 'Nome', largura: 40 },
      { titulo: 'Situação', largura: 14 },
      ...(linhas.roleta.length ? [{ titulo: 'Roleta', largura: 14 }] : []),
    ],
    linhas.participantes,
  )
  if (linhas.roleta.length) {
    aba(
      pasta,
      'Roleta',
      [
        { titulo: 'Nº', largura: 6 },
        { titulo: 'Nome', largura: 40 },
        { titulo: 'Resultado', largura: 15 },
        { titulo: 'Data', largura: 12 },
        { titulo: 'Hora', largura: 8 },
      ],
      linhas.roleta,
    )
  }
  return pasta.xlsx.writeBuffer()
}

// "Sorteio_Festa_de_Fim_de_Ano_18-12-2026.xlsx": sem os caracteres que o Windows não aceita.
export function nomeDoArquivo(evento) {
  const titulo = String(evento.titulo ?? 'Evento')
    .replace(/[\\/:*?"<>|]+/g, ' ')
    .trim()
    .replace(/\s+/g, '_')
  return `Sorteio_${titulo || 'Evento'}_${formatarData(evento.data).replaceAll('/', '-')}.xlsx`
}

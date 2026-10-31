import ExcelJS from 'exceljs'
import { describe, expect, it } from 'vitest'
import { gerarPlanilha, linhasDaPlanilha, nomeDoArquivo } from './excel.js'

const evento = {
  titulo: 'Festa de Fim de Ano: 2026',
  data: '2026-12-18',
  participantes: [
    { id: 'p1', nome: 'Ana Souza' },
    { id: 'p2', nome: 'José Lima' },
    { id: 'p3', nome: 'Carla Dias' },
  ],
  brindes: [
    { nome: 'Caixa de som', qtd: 2 },
    { nome: 'Vale-presente', qtd: null },
  ],
  sorteados: [
    { id: 'p2', em: new Date('2026-12-18T23:05:00Z'), brinde: 'Caixa de som', rodada: 1 },
    { id: 'p3', em: { toDate: () => new Date('2026-12-19T02:30:00Z') }, brinde: null, rodada: 2 },
  ],
}

describe('planilha do evento', () => {
  it('monta as linhas das três abas, com data e hora da Bahia', () => {
    const linhas = linhasDaPlanilha(evento)
    expect(linhas.sorteados).toEqual([
      [1, 1, 'José Lima', 'Caixa de som', '18/12/2026', '20:05'],
      [2, 2, 'Carla Dias', 'Sem brinde', '18/12/2026', '23:30'],
    ])
    expect(linhas.brindes).toEqual([
      ['Caixa de som', 2, 1, 1],
      ['Vale-presente', 'Sem limite', 0, 'Sem limite'],
    ])
    expect(linhas.participantes).toEqual([
      [1, 'Ana Souza', 'Na disputa'],
      [2, 'José Lima', 'Sorteado'],
      [3, 'Carla Dias', 'Sorteado'],
    ])
  })

  it('gera o .xlsx com cabeçalho marinho, texto branco e Lato', async () => {
    const pasta = new ExcelJS.Workbook()
    await pasta.xlsx.load(await gerarPlanilha(evento))
    expect(pasta.worksheets.map((a) => a.name)).toEqual(['Sorteados', 'Brindes', 'Participantes'])

    const sorteados = pasta.getWorksheet('Sorteados')
    expect(sorteados.getRow(1).values.slice(1)).toEqual(['Nº', 'Rodada', 'Nome', 'Brinde', 'Data', 'Hora'])
    expect(sorteados.getRow(2).values.slice(1)).toEqual([1, 1, 'José Lima', 'Caixa de som', '18/12/2026', '20:05'])
    const titulo = sorteados.getCell('A1')
    expect(titulo.fill.fgColor.argb).toBe('FF001780')
    expect(titulo.font).toMatchObject({ name: 'Lato', bold: true, color: { argb: 'FFFFFFFF' } })
    expect(sorteados.getCell('C2').font.name).toBe('Lato')

    expect(pasta.getWorksheet('Brindes').getRow(1).values.slice(1)).toEqual(['Brinde', 'Quantidade', 'Sorteados', 'Sobraram'])
    expect(pasta.getWorksheet('Participantes').getRow(1).values.slice(1)).toEqual(['Nº', 'Nome', 'Situação'])
    expect(pasta.getWorksheet('Participantes').rowCount).toBe(4)
  })

  it('dá um nome de arquivo que o Windows aceita', () => {
    expect(nomeDoArquivo(evento)).toBe('Sorteio_Festa_de_Fim_de_Ano_2026_18-12-2026.xlsx')
    expect(nomeDoArquivo({ titulo: '  ', data: '2026-05-08' })).toBe('Sorteio_Evento_08-05-2026.xlsx')
  })
})

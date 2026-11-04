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

  it('sem giros, não traz nada da roleta', () => {
    expect(linhasDaPlanilha(evento).roleta).toEqual([])
  })

  describe('com a roleta', () => {
    const comRoleta = {
      ...evento,
      giros: [
        { id: 'p1', casa: 3, resultado: 'gire_de_novo', em: new Date('2026-12-18T23:10:00Z') },
        { id: 'p1', casa: 1, resultado: 'ganhou', em: new Date('2026-12-18T23:11:00Z') },
        { id: 'p2', casa: 0, resultado: 'nao_ganhou', em: new Date('2026-12-18T23:12:00Z') },
      ],
    }

    it('lista todos os giros e o resultado final de cada pessoa', () => {
      const linhas = linhasDaPlanilha(comRoleta)
      expect(linhas.roleta).toEqual([
        [1, 'Ana Souza', 'Gire de Novo', '18/12/2026', '20:10'],
        [2, 'Ana Souza', 'Ganhou', '18/12/2026', '20:11'],
        [3, 'José Lima', 'Não ganhou', '18/12/2026', '20:12'],
      ])
      expect(linhas.participantes).toEqual([
        [1, 'Ana Souza', 'Na disputa', 'Ganhou'],
        [2, 'José Lima', 'Sorteado', 'Não ganhou'],
        [3, 'Carla Dias', 'Sorteado', 'Falta girar'],
      ])
    })

    it('acrescenta a aba Roleta e a coluna em Participantes no .xlsx', async () => {
      const pasta = new ExcelJS.Workbook()
      await pasta.xlsx.load(await gerarPlanilha(comRoleta))
      expect(pasta.worksheets.map((a) => a.name)).toEqual(['Sorteados', 'Brindes', 'Participantes', 'Roleta'])
      expect(pasta.getWorksheet('Roleta').getRow(1).values.slice(1)).toEqual(['Nº', 'Nome', 'Resultado', 'Data', 'Hora'])
      expect(pasta.getWorksheet('Roleta').getRow(3).values.slice(1)).toEqual([2, 'Ana Souza', 'Ganhou', '18/12/2026', '20:11'])
      expect(pasta.getWorksheet('Participantes').getRow(1).values.slice(1)).toEqual(['Nº', 'Nome', 'Situação', 'Roleta'])
    })
  })

  it('dá um nome de arquivo que o Windows aceita', () => {
    expect(nomeDoArquivo(evento)).toBe('Sorteio_Festa_de_Fim_de_Ano_2026_18-12-2026.xlsx')
    expect(nomeDoArquivo({ titulo: '  ', data: '2026-05-08' })).toBe('Sorteio_Evento_08-05-2026.xlsx')
  })
})

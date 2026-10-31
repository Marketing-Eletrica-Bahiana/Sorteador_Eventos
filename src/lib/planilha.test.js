import ExcelJS from 'exceljs'
import { describe, expect, it } from 'vitest'
import { nomesDoArquivo } from './planilha.js'

const utf8 = (texto) => new TextEncoder().encode(texto).buffer

// "José Ação" em windows-1252, como o Excel salva .csv no Windows.
const ansi = Uint8Array.from([0x4e, 0x6f, 0x6d, 0x65, 0x0a, 0x4a, 0x6f, 0x73, 0xe9, 0x20, 0x41, 0xe7, 0xe3, 0x6f]).buffer

async function xlsx(abas) {
  const pasta = new ExcelJS.Workbook()
  for (const [nome, linhas] of abas) {
    const aba = pasta.addWorksheet(nome)
    for (const linha of linhas) aba.addRow(linha)
  }
  return pasta.xlsx.writeBuffer()
}

describe('arquivos de participantes', () => {
  it('lê .txt com um nome por linha', async () => {
    expect(await nomesDoArquivo('lista.TXT', utf8('Ana\n\nBia\n'))).toEqual({ nomes: ['Ana', 'Bia'], erro: '' })
  })

  it('lê .csv em UTF-8 e em ANSI do Windows', async () => {
    expect(await nomesDoArquivo('lista.csv', utf8('Setor;Nome\nRH;Ana\nTI;Bia'))).toEqual({ nomes: ['Ana', 'Bia'], erro: '' })
    expect(await nomesDoArquivo('lista.csv', ansi)).toEqual({ nomes: ['José Ação'], erro: '' })
  })

  it('lê .xlsx, usando a primeira aba que tem a coluna de nomes', async () => {
    const conteudo = await xlsx([
      ['Resumo', [['Total', 3], ['Data', '18/12/2026']]],
      ['Lista', [['Festa de Fim de Ano'], ['Matrícula', 'Participante'], [1, 'Ana'], [2, { richText: [{ text: 'Bi' }, { text: 'a' }] }]]],
    ])
    expect(await nomesDoArquivo('festa.xlsx', conteudo)).toEqual({ nomes: ['Ana', 'Bia'], erro: '' })
  })

  it('avisa quando não acha a coluna ou o formato não serve', async () => {
    const semColuna = await xlsx([['Plan1', [['Matrícula', 'Setor'], [1, 'RH']]]])
    expect((await nomesDoArquivo('x.xlsx', semColuna)).erro).toBe('Não achei a coluna "Nome" ou "Participante" no arquivo.')
    expect((await nomesDoArquivo('x.xlsx', utf8('não é planilha'))).erro).toBe(
      'Não deu para abrir essa planilha. Confira se é um arquivo .xlsx.',
    )
    expect((await nomesDoArquivo('x.xls', utf8(''))).erro).toBe('Arquivo .xls antigo. Salve a planilha como .xlsx e tente de novo.')
    expect((await nomesDoArquivo('x.pdf', utf8(''))).erro).toBe('Use um arquivo .txt, .csv ou .xlsx.')
  })
})

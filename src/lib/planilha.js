import { lerCsv, nomesDaTabela, nomesDoTexto } from './participantes.js'

export const EXTENSOES_ACEITAS = '.txt,.csv,.xlsx'

// .txt e .csv salvos pelo Excel no Windows costumam vir em ANSI (windows-1252), não em UTF-8.
function decodificar(conteudo) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(conteudo)
  } catch {
    return new TextDecoder('windows-1252').decode(conteudo)
  }
}

// Valor de uma célula do ExcelJS como texto (fórmula, link e texto com formatação também).
function textoDaCelula(valor) {
  if (valor == null) return ''
  if (typeof valor !== 'object') return String(valor)
  if (valor instanceof Date) return valor.toISOString().slice(0, 10)
  if (Array.isArray(valor.richText)) return valor.richText.map((parte) => parte.text).join('')
  if ('text' in valor) return textoDaCelula(valor.text)
  if ('result' in valor) return textoDaCelula(valor.result)
  return ''
}

// Linhas de cada aba de um .xlsx, como listas de texto. O ExcelJS só é carregado aqui.
export async function abasDoXlsx(conteudo) {
  const { default: ExcelJS } = await import('exceljs')
  const pasta = new ExcelJS.Workbook()
  await pasta.xlsx.load(conteudo)
  return pasta.worksheets.map((aba) => {
    const linhas = []
    aba.eachRow({ includeEmpty: true }, (linha) => {
      linhas.push((linha.values ?? []).slice(1).map(textoDaCelula))
    })
    return linhas
  })
}

// Nomes de um arquivo de participantes: { nomes, erro }. Em .xlsx, vale a primeira aba que tiver
// a coluna "Nome" ou "Participante" (ou uma coluna só).
export async function nomesDoArquivo(nomeDoArquivo, conteudo) {
  const extensao = String(nomeDoArquivo).toLowerCase().split('.').pop()
  if (extensao === 'txt') return { nomes: nomesDoTexto(decodificar(conteudo)), erro: '' }
  if (extensao === 'csv') return nomesDaTabela(lerCsv(decodificar(conteudo)))
  if (extensao === 'xlsx') {
    let abas
    try {
      abas = await abasDoXlsx(conteudo)
    } catch {
      return { nomes: [], erro: 'Não deu para abrir essa planilha. Confira se é um arquivo .xlsx.' }
    }
    let primeiroErro = 'A planilha está vazia.'
    for (const linhas of abas) {
      const resultado = nomesDaTabela(linhas)
      if (!resultado.erro && resultado.nomes.length) return resultado
      if (resultado.erro) primeiroErro = resultado.erro
    }
    return { nomes: [], erro: primeiroErro }
  }
  if (extensao === 'xls') return { nomes: [], erro: 'Arquivo .xls antigo. Salve a planilha como .xlsx e tente de novo.' }
  return { nomes: [], erro: 'Use um arquivo .txt, .csv ou .xlsx.' }
}

import { normalizar } from './texto.js'

export const LIMITE_DE_PARTICIPANTES = 2000
const TAMANHO_MAXIMO_DO_NOME = 120

export const limparNome = (nome) => String(nome ?? '').replace(/\s+/g, ' ').trim().slice(0, TAMANHO_MAXIMO_DO_NOME)

// Chave para achar repetidos: sem diferenciar acentos, maiúsculas e pontuação.
export const chaveDoNome = (nome) => normalizar(nome)

// Evento encerrado não muda participantes, brindes nem sorteados.
export function garantirAberto(evento) {
  if (evento.status === 'encerrado') throw new Error('O evento está encerrado. Reabra para mudar.')
}

export const idsSorteados = (evento) => new Set((evento.sorteados ?? []).map((s) => s.id))

// Um nome por linha (colar ou arquivo .txt).
export const nomesDoTexto = (texto) => String(texto ?? '').split(/\r?\n/).map(limparNome).filter(Boolean)

// CSV com ; ou , (o que mais aparece na primeira linha) e aspas em campos que têm o separador.
export function lerCsv(texto) {
  const conteudo = String(texto ?? '').replace(/^﻿/, '')
  const primeiraLinha = conteudo.split(/\r?\n/, 1)[0] ?? ''
  const separador = (primeiraLinha.match(/;/g)?.length ?? 0) >= (primeiraLinha.match(/,/g)?.length ?? 0) ? ';' : ','
  const linhas = []
  let linha = []
  let celula = ''
  let entreAspas = false
  for (let i = 0; i < conteudo.length; i++) {
    const letra = conteudo[i]
    if (entreAspas) {
      if (letra === '"' && conteudo[i + 1] === '"') {
        celula += '"'
        i++
      } else if (letra === '"') entreAspas = false
      else celula += letra
    } else if (letra === '"') entreAspas = true
    else if (letra === separador) {
      linha.push(celula)
      celula = ''
    } else if (letra === '\n' || letra === '\r') {
      if (letra === '\r' && conteudo[i + 1] === '\n') i++
      linha.push(celula)
      linhas.push(linha)
      linha = []
      celula = ''
    } else celula += letra
  }
  if (celula || linha.length) {
    linha.push(celula)
    linhas.push(linha)
  }
  return linhas
}

const CABECALHOS = ['nome', 'nomes', 'participante', 'participantes', 'nome completo', 'nome do participante']
const ehCabecalho = (celula) => CABECALHOS.includes(normalizar(celula))

// Acha a coluna "Nome" ou "Participante" (procura o cabeçalho nas 10 primeiras linhas). Sem
// cabeçalho, uma tabela de uma coluna só vira a lista inteira.
export function nomesDaTabela(linhas) {
  for (let i = 0; i < Math.min(linhas.length, 10); i++) {
    const coluna = linhas[i].findIndex(ehCabecalho)
    if (coluna >= 0) return { nomes: linhas.slice(i + 1).map((l) => limparNome(l[coluna])).filter(Boolean), erro: '' }
  }
  const preenchidas = linhas.map((l) => l.map(limparNome).filter(Boolean)).filter((l) => l.length)
  if (preenchidas.every((l) => l.length === 1)) return { nomes: preenchidas.map((l) => l[0]), erro: '' }
  return { nomes: [], erro: 'Não achei a coluna "Nome" ou "Participante" no arquivo.' }
}

const proximoNumero = (lista) => lista.reduce((maior, p) => Math.max(maior, Number(String(p.id).slice(1)) || 0), 0) + 1

// Junta nomes novos à lista sem repetir ninguém (nem quem já estava, nem dentro do que chegou) e sem
// passar do limite. IDs seguem a numeração da lista (p1, p2...).
export function juntarParticipantes(atuais, nomes, limite = LIMITE_DE_PARTICIPANTES) {
  const chaves = new Set(atuais.map((p) => chaveDoNome(p.nome)))
  let numero = proximoNumero(atuais)
  const novos = []
  let repetidos = 0
  let foraDoLimite = 0
  for (const bruto of nomes) {
    const nome = limparNome(bruto)
    const chave = chaveDoNome(nome)
    if (!chave) continue
    if (chaves.has(chave)) repetidos += 1
    else if (atuais.length + novos.length >= limite) foraDoLimite += 1
    else {
      chaves.add(chave)
      novos.push({ id: `p${numero}`, nome })
      numero += 1
    }
  }
  return { participantes: [...atuais, ...novos], adicionados: novos.length, repetidos, foraDoLimite }
}

export function removerParticipante(evento, id) {
  garantirAberto(evento)
  if (idsSorteados(evento).has(id)) throw new Error('Quem já foi sorteado não sai da lista.')
  return { participantes: (evento.participantes ?? []).filter((p) => p.id !== id) }
}

// "Apagar a lista": sai todo mundo que ainda não foi sorteado. Quem já saiu fica, porque faz parte
// do resultado do evento.
export function apagarNaoSorteados(evento) {
  garantirAberto(evento)
  const sorteados = idsSorteados(evento)
  return { participantes: (evento.participantes ?? []).filter((p) => sorteados.has(p.id)) }
}

// Busca na lista de participantes, com cada palavra em qualquer ordem.
export function buscarParticipantes(participantes, busca) {
  const palavras = normalizar(busca).split(' ').filter(Boolean)
  if (!palavras.length) return participantes
  return participantes.filter((p) => {
    const nome = normalizar(p.nome)
    return palavras.every((palavra) => nome.includes(palavra))
  })
}

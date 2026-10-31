import { describe, expect, it } from 'vitest'
import {
  apagarNaoSorteados,
  buscarParticipantes,
  juntarParticipantes,
  lerCsv,
  nomesDaTabela,
  nomesDoTexto,
  removerParticipante,
} from './participantes.js'

const lista = [
  { id: 'p1', nome: 'Ana Souza' },
  { id: 'p2', nome: 'José Lima' },
  { id: 'p3', nome: 'Carla Dias' },
]
const evento = { status: 'aberto', participantes: lista, sorteados: [{ id: 'p2', brinde: null, rodada: 1 }] }

describe('participantes', () => {
  it('lê um nome por linha, sem linhas vazias nem espaços sobrando', () => {
    expect(nomesDoTexto('  Ana   Souza \r\n\n José Lima\n')).toEqual(['Ana Souza', 'José Lima'])
    expect(nomesDoTexto('')).toEqual([])
  })

  it('junta sem repetir, sem diferenciar acentos e maiúsculas', () => {
    const r = juntarParticipantes(lista, ['JOSE LIMA', 'Bruno Reis', 'bruno réis', 'Davi', '  ', '...'])
    expect(r.adicionados).toBe(2)
    expect(r.repetidos).toBe(2)
    expect(r.foraDoLimite).toBe(0)
    expect(r.participantes.slice(3)).toEqual([
      { id: 'p4', nome: 'Bruno Reis' },
      { id: 'p5', nome: 'Davi' },
    ])
  })

  it('respeita o limite de participantes', () => {
    const r = juntarParticipantes(lista, ['Davi', 'Edu', 'Fábio'], 4)
    expect(r.adicionados).toBe(1)
    expect(r.foraDoLimite).toBe(2)
    expect(r.participantes).toHaveLength(4)
  })

  it('continua a numeração dos IDs depois do maior que existe', () => {
    const r = juntarParticipantes([{ id: 'p9', nome: 'Ana' }], ['Bia'])
    expect(r.participantes[1].id).toBe('p10')
    expect(juntarParticipantes([], ['Ana']).participantes[0].id).toBe('p1')
  })

  it('lê CSV com ponto e vírgula ou vírgula e aspas', () => {
    expect(lerCsv('Nome;Setor\r\nAna Souza;RH\r\n"Lima; José";TI')).toEqual([
      ['Nome', 'Setor'],
      ['Ana Souza', 'RH'],
      ['Lima; José', 'TI'],
    ])
    expect(lerCsv('﻿Participante,Setor\n"Dias, Carla",""""Vendas""""\n')).toEqual([
      ['Participante', 'Setor'],
      ['Dias, Carla', '"Vendas"'],
    ])
  })

  it('acha a coluna Nome ou Participante, mesmo abaixo de um título', () => {
    expect(nomesDaTabela([['Matrícula', 'NOME'], ['1', 'Ana'], ['2', ''], ['3', 'Bia']])).toEqual({ nomes: ['Ana', 'Bia'], erro: '' })
    expect(nomesDaTabela([['Lista da festa'], [], ['Setor', 'Participantes'], ['RH', 'Caio']])).toEqual({
      nomes: ['Caio'],
      erro: '',
    })
  })

  it('aceita uma coluna só, sem cabeçalho, e recusa tabela sem a coluna', () => {
    expect(nomesDaTabela([['Ana'], [''], ['Bia']])).toEqual({ nomes: ['Ana', 'Bia'], erro: '' })
    expect(nomesDaTabela([['Matrícula', 'Setor'], ['1', 'RH']]).erro).toBe('Não achei a coluna "Nome" ou "Participante" no arquivo.')
  })

  it('não remove quem já foi sorteado', () => {
    expect(removerParticipante(evento, 'p1').participantes.map((p) => p.id)).toEqual(['p2', 'p3'])
    expect(() => removerParticipante(evento, 'p2')).toThrow('Quem já foi sorteado não sai da lista.')
  })

  it('apagar a lista mantém só quem já foi sorteado', () => {
    expect(apagarNaoSorteados(evento).participantes).toEqual([{ id: 'p2', nome: 'José Lima' }])
  })

  it('não mexe em evento encerrado', () => {
    const encerrado = { ...evento, status: 'encerrado' }
    expect(() => removerParticipante(encerrado, 'p1')).toThrow('O evento está encerrado. Reabra para mudar.')
    expect(() => apagarNaoSorteados(encerrado)).toThrow('O evento está encerrado. Reabra para mudar.')
  })

  it('busca por partes do nome, sem acento', () => {
    expect(buscarParticipantes(lista, 'jose').map((p) => p.id)).toEqual(['p2'])
    expect(buscarParticipantes(lista, 'dias carla').map((p) => p.id)).toEqual(['p3'])
    expect(buscarParticipantes(lista, '')).toBe(lista)
  })
})

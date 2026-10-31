import { describe, expect, it } from 'vitest'
import {
  desfazerUltimaRodada,
  encerrar,
  escolherPosicoes,
  inteiroAleatorio,
  listaDeSorteados,
  mudarPorVez,
  reabrir,
  recomecar,
  situacaoDoSorteio,
  sortear,
  sorteadosDaRodada,
  trocarBrinde,
  ultimaRodada,
} from './sorteio.js'

// Fonte de números previsível: devolve os valores na ordem dada.
const fonteFixa = (...valores) => ({
  getRandomValues(caixa) {
    caixa[0] = valores.shift()
    return caixa
  },
})

const pessoas = (n) => Array.from({ length: n }, (_, i) => ({ id: `p${i + 1}`, nome: `Pessoa ${i + 1}` }))

const base = (extra = {}) => ({
  status: 'aberto',
  participantes: pessoas(5),
  brindes: [],
  brindeAtual: null,
  porVez: 1,
  sorteados: [],
  ...extra,
})

describe('números aleatórios', () => {
  it('descarta os valores que causariam viés', () => {
    // Para 3 posições, o limite é 4294967295: esse valor exato é descartado e o próximo vale.
    expect(inteiroAleatorio(3, fonteFixa(4294967295, 7))).toBe(1)
    // O valor logo abaixo do limite ainda vale (resto 2).
    expect(inteiroAleatorio(3, fonteFixa(4294967294, 0))).toBe(2)
  })

  it('recusa intervalos inválidos', () => {
    expect(() => inteiroAleatorio(0)).toThrow()
    expect(() => inteiroAleatorio(2.5)).toThrow()
  })

  it('escolhe posições diferentes, sem repetir', () => {
    const escolhidas = escolherPosicoes(10, 10)
    expect(new Set(escolhidas).size).toBe(10)
    expect([...escolhidas].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('dá a mesma chance para todo mundo', () => {
    const contagem = [0, 0, 0, 0, 0]
    const vezes = 50000
    for (let i = 0; i < vezes; i++) contagem[escolherPosicoes(5, 1)[0]] += 1
    // Esperado 10.000 cada; a folga de 4% cobre a variação normal com folga.
    for (const n of contagem) expect(Math.abs(n - vezes / 5)).toBeLessThan(vezes / 5 * 0.04)
  })
})

describe('sorteio', () => {
  it('sorteia sem brindes cadastrados, só com os nomes', () => {
    const evento = base({ porVez: 2 })
    const agora = new Date('2026-12-18T22:00:00Z')
    const { mudancas, novos } = sortear(evento, { porEmail: 'organiza@exemplo.test', agora, fonte: fonteFixa(4, 0) })
    expect(novos).toEqual([
      { id: 'p5', em: agora, brinde: null, rodada: 1, porEmail: 'organiza@exemplo.test' },
      { id: 'p2', em: agora, brinde: null, rodada: 1, porEmail: 'organiza@exemplo.test' },
    ])
    expect(mudancas.sorteados).toEqual(novos)
  })

  it('ninguém sai duas vezes', () => {
    let evento = base({ participantes: pessoas(30), porVez: 7 })
    while (situacaoDoSorteio(evento).pode) evento = { ...evento, ...sortear(evento, { porEmail: 'x' }).mudancas }
    const ids = evento.sorteados.map((s) => s.id)
    expect(ids).toHaveLength(30)
    expect(new Set(ids).size).toBe(30)
    expect(ultimaRodada(evento)).toBe(5)
    expect(situacaoDoSorteio(evento).motivo).toBe('Todo mundo já foi sorteado.')
  })

  it('pede o brinde da vez quando há brindes', () => {
    const evento = base({ brindes: [{ nome: 'Fone', qtd: 1 }] })
    expect(situacaoDoSorteio(evento)).toEqual({ pode: false, motivo: 'Escolha o brinde da vez.', quantidade: 0, brinde: null })
    expect(() => sortear(evento, {})).toThrow('Escolha o brinde da vez.')
  })

  it('não passa do estoque do brinde e tira da vez o brinde que acabou', () => {
    const evento = base({ brindes: [{ nome: 'Fone', qtd: 2 }, { nome: 'Caneca', qtd: null }], brindeAtual: 'Fone', porVez: 5 })
    expect(situacaoDoSorteio(evento).quantidade).toBe(2)
    const { mudancas, novos } = sortear(evento, { porEmail: 'x' })
    expect(novos).toHaveLength(2)
    expect(novos.every((s) => s.brinde === 'Fone')).toBe(true)
    expect(mudancas.brindeAtual).toBeNull()
    const depois = { ...evento, ...mudancas }
    expect(situacaoDoSorteio(depois).motivo).toBe('Escolha o brinde da vez.')
    expect(situacaoDoSorteio({ ...depois, brindes: [{ nome: 'Fone', qtd: 2 }] }).motivo).toBe('Os brindes acabaram.')
  })

  it('mantém o brinde da vez enquanto ainda tem estoque', () => {
    const evento = base({ brindes: [{ nome: 'Caneca', qtd: null }], brindeAtual: 'Caneca' })
    expect(sortear(evento, { porEmail: 'x' }).mudancas.brindeAtual).toBeUndefined()
  })

  it('avisa por que não dá para sortear', () => {
    expect(situacaoDoSorteio(base({ participantes: [] })).motivo).toBe('Cadastre os participantes.')
    expect(situacaoDoSorteio(base({ status: 'encerrado' })).motivo).toBe('O evento está encerrado.')
  })

  it('desfaz a rodada inteira mais recente', () => {
    const evento = base({
      sorteados: [
        { id: 'p1', rodada: 1 },
        { id: 'p2', rodada: 2 },
        { id: 'p3', rodada: 2 },
      ],
    })
    expect(desfazerUltimaRodada(evento).sorteados).toEqual([{ id: 'p1', rodada: 1 }])
    expect(() => desfazerUltimaRodada(base())).toThrow('Ninguém foi sorteado ainda.')
    expect(recomecar(evento)).toEqual({ sorteados: [] })
  })

  it('lista os sorteados com nome e número, e separa por rodada', () => {
    const evento = base({ sorteados: [{ id: 'p4', rodada: 1 }, { id: 'p9', rodada: 2 }, { id: 'p1', rodada: 2 }] })
    expect(listaDeSorteados(evento).map((s) => [s.numero, s.nome])).toEqual([
      [1, 'Pessoa 4'],
      [2, '(fora da lista)'],
      [3, 'Pessoa 1'],
    ])
    expect(sorteadosDaRodada(evento, 2).map((s) => s.id)).toEqual(['p9', 'p1'])
  })

  it('troca o brinde de um sorteado respeitando o estoque', () => {
    const evento = base({
      brindes: [{ nome: 'Fone', qtd: 1 }, { nome: 'Caneca', qtd: null }],
      sorteados: [
        { id: 'p1', brinde: 'Fone', rodada: 1 },
        { id: 'p2', brinde: 'Caneca', rodada: 2 },
      ],
    })
    expect(trocarBrinde(evento, 'p1', 'Caneca').sorteados[0].brinde).toBe('Caneca')
    expect(trocarBrinde(evento, 'p2', null).sorteados[1].brinde).toBeNull()
    expect(() => trocarBrinde(evento, 'p2', 'Fone')).toThrow('"Fone" acabou.')
    expect(trocarBrinde(evento, 'p1', 'Fone')).toEqual({})
  })

  it('pessoas por sorteio de 1 a 50', () => {
    expect(mudarPorVez(base(), '3')).toEqual({ porVez: 3 })
    expect(() => mudarPorVez(base(), 0)).toThrow('Escolha de 1 a 50 pessoas por sorteio.')
    expect(() => mudarPorVez(base(), 51)).toThrow()
  })

  it('encerra e reabre', () => {
    const agora = new Date('2026-12-18T23:00:00Z')
    expect(encerrar(base(), agora)).toEqual({ status: 'encerrado', encerradoEm: agora })
    expect(() => encerrar(base({ status: 'encerrado' }))).toThrow('O evento já está encerrado.')
    expect(reabrir(base({ status: 'encerrado' }))).toEqual({ status: 'aberto', encerradoEm: null })
    expect(() => sortear(base({ status: 'encerrado' }), {})).toThrow('O evento está encerrado. Reabra para mudar.')
  })
})

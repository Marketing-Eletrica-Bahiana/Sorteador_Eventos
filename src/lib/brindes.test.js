import { describe, expect, it } from 'vitest'
import {
  brindesDisponiveis,
  escolherBrindeDaVez,
  estoqueDosBrindes,
  lerQuantidade,
  moverBrinde,
  removerBrinde,
  resumoDosBrindes,
  salvarBrinde,
  validarBrinde,
} from './brindes.js'

const evento = {
  status: 'aberto',
  brindes: [
    { nome: 'Caixa de som', qtd: 2 },
    { nome: 'Vale-presente', qtd: null },
    { nome: 'Fone', qtd: 1 },
  ],
  brindeAtual: 'Caixa de som',
  sorteados: [
    { id: 'p1', brinde: 'Caixa de som', rodada: 1 },
    { id: 'p2', brinde: 'Fone', rodada: 2 },
    { id: 'p3', brinde: null, rodada: 3 },
  ],
}

describe('brindes', () => {
  it('lê a quantidade: em branco é sem limite', () => {
    expect(lerQuantidade('')).toEqual({ qtd: null, erro: '' })
    expect(lerQuantidade(' 10 ')).toEqual({ qtd: 10, erro: '' })
    expect(lerQuantidade('0').erro).toBe('A quantidade precisa ser pelo menos 1.')
    expect(lerQuantidade('2,5').erro).toBe('Use só números inteiros, ou deixe em branco para sem limite.')
  })

  it('calcula entregues e restantes de cada brinde', () => {
    expect(estoqueDosBrindes(evento)).toEqual([
      { nome: 'Caixa de som', qtd: 2, entregues: 1, restantes: 1, esgotado: false },
      { nome: 'Vale-presente', qtd: null, entregues: 0, restantes: null, esgotado: false },
      { nome: 'Fone', qtd: 1, entregues: 1, restantes: 0, esgotado: true },
    ])
    expect(brindesDisponiveis(evento).map((b) => b.nome)).toEqual(['Caixa de som', 'Vale-presente'])
  })

  it('resume o estoque; restantes some quando algum brinde não tem limite', () => {
    expect(resumoDosBrindes(evento)).toEqual({ tipos: 3, entregues: 2, restantes: null, semLimite: true })
    const comLimite = { ...evento, brindes: [{ nome: 'Caixa de som', qtd: 2 }, { nome: 'Fone', qtd: 1 }] }
    expect(resumoDosBrindes(comLimite)).toEqual({ tipos: 2, entregues: 2, restantes: 1, semLimite: false })
  })

  it('valida nome repetido e quantidade menor que a entregue', () => {
    expect(validarBrinde(evento, { nome: 'caixa de SOM', quantidade: '' })).toEqual({ nome: 'Já existe um brinde com esse nome.' })
    expect(validarBrinde(evento, { nome: 'Caixa de som', quantidade: '3' }, 'Caixa de som')).toEqual({})
    expect(validarBrinde(evento, { nome: 'Fone', quantidade: '' }, 'Fone')).toEqual({})
    expect(validarBrinde(evento, { nome: 'Caixa', quantidade: '0' }, 'Caixa de som').quantidade).toBe(
      'A quantidade precisa ser pelo menos 1.',
    )
    expect(validarBrinde({ ...evento, sorteados: [...evento.sorteados, { id: 'p4', brinde: 'Caixa de som' }] }, { nome: 'Caixa', quantidade: '1' }, 'Caixa de som').quantidade).toBe(
      'Já foram entregues 2. A quantidade não pode ser menor.',
    )
    expect(validarBrinde(evento, { nome: ' ', quantidade: '' }).nome).toBe('Informe o nome do brinde.')
  })

  it('cadastra no fim da lista', () => {
    expect(salvarBrinde(evento, { nome: ' Kit   churrasco ', quantidade: '4' }).brindes.at(-1)).toEqual({ nome: 'Kit churrasco', qtd: 4 })
    expect(() => salvarBrinde(evento, { nome: 'Fone', quantidade: '' })).toThrow('Já existe um brinde com esse nome.')
  })

  it('renomear leva junto os sorteados e o brinde da vez', () => {
    const m = salvarBrinde(evento, { nome: 'Som portátil', quantidade: '2' }, 'Caixa de som')
    expect(m.brindes[0]).toEqual({ nome: 'Som portátil', qtd: 2 })
    expect(m.sorteados[0].brinde).toBe('Som portátil')
    expect(m.sorteados[1].brinde).toBe('Fone')
    expect(m.brindeAtual).toBe('Som portátil')
  })

  it('tira da vez o brinde que esgotou com a quantidade nova', () => {
    expect(salvarBrinde(evento, { nome: 'Caixa de som', quantidade: '1' }, 'Caixa de som').brindeAtual).toBeNull()
  })

  it('só remove brinde que ninguém ganhou', () => {
    expect(removerBrinde(evento, 'Vale-presente').brindes.map((b) => b.nome)).toEqual(['Caixa de som', 'Fone'])
    expect(() => removerBrinde(evento, 'Fone')).toThrow('Esse brinde já foi entregue a alguém.')
  })

  it('muda a ordem da lista', () => {
    expect(moverBrinde(evento, 'Fone', -1).brindes.map((b) => b.nome)).toEqual(['Caixa de som', 'Fone', 'Vale-presente'])
    expect(moverBrinde(evento, 'Caixa de som', -1)).toEqual({})
  })

  it('brinde da vez só entre os que têm estoque', () => {
    expect(escolherBrindeDaVez(evento, 'Vale-presente')).toEqual({ brindeAtual: 'Vale-presente' })
    expect(escolherBrindeDaVez(evento, null)).toEqual({ brindeAtual: null })
    expect(() => escolherBrindeDaVez(evento, 'Fone')).toThrow('Esse brinde acabou ou não existe mais.')
  })
})

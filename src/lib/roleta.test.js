import { describe, expect, it } from 'vitest'
import {
  CASAS,
  casaNaSeta,
  desfazerUltimoGiro,
  faltamGirar,
  girarRoleta,
  listaDeGiros,
  marcarQuemGira,
  numerosDaRoleta,
  recomecarRoleta,
  resultadoPorPessoa,
  rotacaoDoGiro,
  rotacaoParada,
  situacaoDaRoleta,
} from './roleta.js'

// Fonte de números previsível: devolve os valores na ordem dada.
const fonteFixa = (...valores) => ({
  getRandomValues(caixa) {
    caixa[0] = valores.shift()
    return caixa
  },
})

const pessoas = (n) => Array.from({ length: n }, (_, i) => ({ id: `p${i + 1}`, nome: `Pessoa ${i + 1}` }))

const base = (extra = {}) => ({ status: 'aberto', participantes: pessoas(3), ...extra })

const casaDe = (resultado) => CASAS.indexOf(resultado)
const giro = (id, resultado) => ({ id, resultado, casa: casaDe(resultado), em: new Date('2026-11-04T12:00:00Z') })

describe('casas da roleta', () => {
  it('tem 16 casas: 4 Ganhou, 4 Gire de Novo e 8 Não ganhou', () => {
    const contar = (r) => CASAS.filter((c) => c === r).length
    expect(CASAS).toHaveLength(16)
    expect(contar('ganhou')).toBe(4)
    expect(contar('gire_de_novo')).toBe(4)
    expect(contar('nao_ganhou')).toBe(8)
  })

  it('nunca deixa duas casas iguais lado a lado', () => {
    CASAS.forEach((casa, i) => expect(casa).not.toBe(CASAS[(i + 1) % CASAS.length]))
  })
})

describe('marcar quem gira', () => {
  it('marca qualquer pessoa da lista que ainda não girou', () => {
    expect(marcarQuemGira(base(), 'p2')).toEqual({ roletaVez: 'p2' })
  })

  it('troca a pessoa marcada e tira a marca', () => {
    const evento = base({ roletaVez: 'p1' })
    expect(marcarQuemGira(evento, 'p3')).toEqual({ roletaVez: 'p3' })
    expect(marcarQuemGira(evento, null)).toEqual({ roletaVez: null })
  })

  it('não marca quem já terminou nem quem não está na lista', () => {
    const evento = base({ giros: [giro('p1', 'ganhou'), giro('p2', 'nao_ganhou')] })
    expect(() => marcarQuemGira(evento, 'p1')).toThrow('Essa pessoa já girou a roleta.')
    expect(() => marcarQuemGira(evento, 'p2')).toThrow('Essa pessoa já girou a roleta.')
    expect(() => marcarQuemGira(evento, 'p9')).toThrow('Essa pessoa não está na lista.')
  })

  it('depois de um Gire de Novo, a pessoa continua marcada até girar', () => {
    const evento = base({ roletaVez: 'p1', giros: [giro('p1', 'gire_de_novo')] })
    const aviso = 'Essa pessoa tirou Gire de Novo e precisa girar outra vez.'
    expect(() => marcarQuemGira(evento, 'p2')).toThrow(aviso)
    expect(() => marcarQuemGira(evento, null)).toThrow(aviso)
    expect(marcarQuemGira(evento, 'p1')).toEqual({ roletaVez: 'p1' })
  })

  it('não muda nada com o evento encerrado', () => {
    expect(() => marcarQuemGira(base({ status: 'encerrado' }), 'p1')).toThrow('O evento está encerrado. Reabra para mudar.')
  })
})

describe('girar a roleta', () => {
  const agora = new Date('2026-11-04T12:00:00Z')
  const marcada = (extra = {}) => base({ roletaVez: 'p2', ...extra })

  it('Ganhou registra o resultado e tira a marca', () => {
    const casa = casaDe('ganhou')
    const { mudancas } = girarRoleta(marcada(), { porEmail: 'organiza@exemplo.test', agora, fonte: fonteFixa(casa) })
    expect(mudancas).toEqual({
      giros: [{ id: 'p2', casa, resultado: 'ganhou', em: agora, porEmail: 'organiza@exemplo.test' }],
      roletaVez: null,
    })
    expect(faltamGirar({ ...marcada(), ...mudancas }).map((p) => p.id)).toEqual(['p1', 'p3'])
  })

  it('Não ganhou também encerra a vez da pessoa', () => {
    const { mudancas } = girarRoleta(marcada(), { agora, fonte: fonteFixa(casaDe('nao_ganhou')) })
    expect(mudancas.roletaVez).toBeNull()
    expect(resultadoPorPessoa({ ...marcada(), ...mudancas }).get('p2')).toBe('nao_ganhou')
  })

  it('Gire de Novo mantém a mesma pessoa marcada', () => {
    const { mudancas } = girarRoleta(marcada(), { agora, fonte: fonteFixa(casaDe('gire_de_novo')) })
    expect(mudancas).not.toHaveProperty('roletaVez')
    const depois = { ...marcada(), ...mudancas }
    expect(faltamGirar(depois)).toHaveLength(3)
    expect(situacaoDaRoleta(depois)).toMatchObject({ acao: 'girar', repetindo: true })
  })

  it('não gira sem alguém marcado, nem com o evento encerrado', () => {
    expect(() => girarRoleta(base())).toThrow('Marque quem vai girar.')
    expect(() => girarRoleta(marcada({ status: 'encerrado' }))).toThrow('O evento está encerrado. Reabra para mudar.')
  })

  it('cada casa pode sair, inclusive a última', () => {
    expect(girarRoleta(marcada(), { agora, fonte: fonteFixa(15) }).giro.casa).toBe(15)
    expect(girarRoleta(marcada(), { agora, fonte: fonteFixa(0) }).giro.casa).toBe(0)
  })
})

describe('desfazer e recomeçar', () => {
  it('desfazer tira o último giro e deixa marcada quem girou', () => {
    const evento = base({ giros: [giro('p1', 'ganhou'), giro('p2', 'nao_ganhou')], roletaVez: 'p3' })
    const mudancas = desfazerUltimoGiro(evento)
    expect(mudancas.giros).toHaveLength(1)
    expect(mudancas.roletaVez).toBe('p2')
    expect(faltamGirar({ ...evento, ...mudancas }).map((p) => p.id)).toEqual(['p2', 'p3'])
  })

  it('desfazer sem giros avisa', () => {
    expect(() => desfazerUltimoGiro(base())).toThrow('Ninguém girou a roleta ainda.')
  })

  it('recomeçar limpa os giros e a marca, e mantém a lista', () => {
    const evento = base({ giros: [giro('p1', 'ganhou')], roletaVez: 'p2' })
    expect(recomecarRoleta(evento)).toEqual({ giros: [], roletaVez: null })
    expect(() => recomecarRoleta({ ...evento, status: 'encerrado' })).toThrow('O evento está encerrado. Reabra para mudar.')
  })
})

describe('números e situação', () => {
  const evento = base({
    giros: [giro('p1', 'gire_de_novo'), giro('p1', 'ganhou'), giro('p2', 'nao_ganhou')],
  })

  it('conta só o resultado final de cada pessoa', () => {
    expect(numerosDaRoleta(evento)).toEqual({ faltam: 1, ganharam: 1, naoGanharam: 1, giros: 3 })
    expect(numerosDaRoleta(base())).toEqual({ faltam: 3, ganharam: 0, naoGanharam: 0, giros: 0 })
  })

  it('lista os giros com nome e número', () => {
    expect(listaDeGiros(evento).map((g) => [g.numero, g.nome, g.resultado])).toEqual([
      [1, 'Pessoa 1', 'gire_de_novo'],
      [2, 'Pessoa 1', 'ganhou'],
      [3, 'Pessoa 2', 'nao_ganhou'],
    ])
  })

  it('diz o que dá para fazer agora', () => {
    expect(situacaoDaRoleta(base())).toMatchObject({ acao: 'marcar', motivo: 'Marque quem vai girar.' })
    expect(situacaoDaRoleta(base({ roletaVez: 'p1' }))).toMatchObject({ acao: 'girar', motivo: '', repetindo: false })
    expect(situacaoDaRoleta(base({ status: 'encerrado', roletaVez: 'p1' }))).toMatchObject({ acao: null })
    expect(situacaoDaRoleta(base({ participantes: [] }))).toMatchObject({ acao: null, motivo: 'Cadastre os participantes.' })
    const todos = base({ giros: pessoas(3).map((p) => giro(p.id, 'nao_ganhou')) })
    expect(situacaoDaRoleta(todos)).toMatchObject({ acao: null, motivo: 'Todo mundo já girou a roleta.' })
  })
})

describe('ângulos da roda', () => {
  it('a roda para com a casa sorteada embaixo da seta, em todas as casas e giros', () => {
    for (let casa = 0; casa < CASAS.length; casa++) {
      for (let numero = 1; numero <= 40; numero++) {
        expect(casaNaSeta(rotacaoParada(casa, numero))).toBe(casa)
        expect(casaNaSeta(rotacaoDoGiro(1234.5, casa, numero))).toBe(casa)
      }
    }
  })

  it('o giro sempre vai para a frente, com pelo menos as voltas pedidas', () => {
    for (const atual of [0, 90, 360, 1000.5, -35]) {
      expect(rotacaoDoGiro(atual, 3, 7, 6) - atual).toBeGreaterThanOrEqual(6 * 360)
    }
  })
})

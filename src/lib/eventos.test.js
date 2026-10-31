import { describe, expect, it } from 'vitest'
import {
  camposDoEvento,
  filtrarEventos,
  indicadoresGerais,
  novoEvento,
  numerosDoEvento,
  ordenarEventos,
  tituloDaCopia,
  validarEvento,
} from './eventos.js'

const participantes = [
  { id: 'p1', nome: 'Ana' },
  { id: 'p2', nome: 'Bruno' },
  { id: 'p3', nome: 'Carla' },
  { id: 'p4', nome: 'Davi' },
]

const evento = {
  titulo: 'Festa de Fim de Ano',
  descricao: 'Confraternização da matriz',
  data: '2026-12-18',
  status: 'aberto',
  brindes: [{ nome: 'Caixa de som', qtd: 2 }, { nome: 'Vale-presente', qtd: null }],
  porVez: 2,
  participantes,
  sorteados: [
    { id: 'p2', brinde: 'Caixa de som', rodada: 1 },
    { id: 'p4', brinde: null, rodada: 1 },
  ],
}

describe('eventos', () => {
  it('conta participantes, sorteados, quem está na disputa e brindes entregues', () => {
    expect(numerosDoEvento(evento)).toEqual({
      participantes: 4,
      sorteados: 2,
      naDisputa: 2,
      brindesEntregues: 1,
      progresso: 0.5,
    })
    expect(numerosDoEvento({})).toEqual({ participantes: 0, sorteados: 0, naDisputa: 0, brindesEntregues: 0, progresso: 0 })
  })

  it('soma os indicadores de todos os eventos', () => {
    const encerrado = { ...evento, status: 'encerrado', sorteados: [{ id: 'p1', brinde: 'Caixa de som' }] }
    expect(indicadoresGerais([evento, encerrado, { status: 'aberto' }])).toEqual({
      eventos: 3,
      abertos: 2,
      pessoasSorteadas: 3,
      brindesEntregues: 2,
    })
    expect(indicadoresGerais([])).toEqual({ eventos: 0, abertos: 0, pessoasSorteadas: 0, brindesEntregues: 0 })
  })

  it('mostra os mais recentes primeiro e, no mesmo dia, por nome', () => {
    const lista = [
      { titulo: 'Bingo', data: '2026-05-01' },
      { titulo: 'Zumba', data: '2026-12-18' },
      { titulo: 'Árvore de Natal', data: '2026-12-18' },
    ]
    expect(ordenarEventos(lista).map((e) => e.titulo)).toEqual(['Árvore de Natal', 'Zumba', 'Bingo'])
  })

  it('filtra por situação e busca sem diferenciar acentos e maiúsculas', () => {
    const lista = [
      evento,
      { titulo: 'São João', descricao: '', status: 'encerrado' },
      { titulo: 'Dia das Mães', descricao: 'Café da manhã', status: 'aberto' },
    ]
    const titulos = (resultado) => resultado.map((e) => e.titulo)
    expect(titulos(filtrarEventos(lista, 'aberto'))).toEqual(['Festa de Fim de Ano', 'Dia das Mães'])
    expect(titulos(filtrarEventos(lista, 'encerrado'))).toEqual(['São João'])
    expect(titulos(filtrarEventos(lista, 'todos', 'sao joao'))).toEqual(['São João'])
    expect(titulos(filtrarEventos(lista, 'todos', 'CAFE'))).toEqual(['Dia das Mães'])
    expect(titulos(filtrarEventos(lista, 'todos', 'maes cafe'))).toEqual(['Dia das Mães'])
    expect(titulos(filtrarEventos(lista, 'todos', 'maes natal'))).toEqual([])
    expect(titulos(filtrarEventos(lista, 'todos', '   '))).toHaveLength(3)
    expect(titulos(filtrarEventos(lista, 'encerrado', 'café'))).toEqual([])
  })

  it('pede nome e data', () => {
    expect(validarEvento({ titulo: 'Bingo', data: '2026-05-01' })).toEqual({})
    expect(validarEvento({ titulo: '  ', data: null })).toEqual({
      titulo: 'Informe o nome do evento.',
      data: 'Informe a data.',
    })
    expect(validarEvento({ titulo: 'x'.repeat(121), data: '2026-05-01' })).toEqual({ titulo: 'Use no máximo 120 letras.' })
  })

  it('limpa os espaços dos campos', () => {
    expect(camposDoEvento({ titulo: '  Festa   Junina ', descricao: ' Quadrilha \n', data: '2026-06-24' })).toEqual({
      titulo: 'Festa Junina',
      descricao: 'Quadrilha',
      data: '2026-06-24',
    })
  })

  it('cria evento aberto e vazio', () => {
    const pessoa = { email: 'organiza@exemplo.test', nome: 'Organização' }
    expect(novoEvento({ titulo: 'Bingo', descricao: '', data: '2026-05-01' }, pessoa)).toEqual({
      titulo: 'Bingo',
      descricao: '',
      data: '2026-05-01',
      status: 'aberto',
      brindes: [],
      brindeAtual: null,
      porVez: 1,
      participantes: [],
      sorteados: [],
      criadoPorEmail: 'organiza@exemplo.test',
      criadoPorNome: 'Organização',
      encerradoEm: null,
    })
  })

  it('duplica com brindes e participantes, sem os sorteados', () => {
    const pessoa = { email: 'organiza@exemplo.test', nome: 'Organização' }
    const copia = novoEvento({ titulo: tituloDaCopia(evento.titulo), data: '2027-12-17' }, pessoa, evento)
    expect(copia.titulo).toBe('Festa de Fim de Ano (cópia)')
    expect(copia.status).toBe('aberto')
    expect(copia.brindes).toEqual(evento.brindes)
    expect(copia.participantes).toEqual(participantes)
    expect(copia.porVez).toBe(2)
    expect(copia.sorteados).toEqual([])
    expect(copia.brindeAtual).toBeNull()
  })
})

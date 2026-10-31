import { normalizar } from './texto.js'

export const STATUS = {
  aberto: { rotulo: 'Aberto' },
  encerrado: { rotulo: 'Encerrado' },
}

export const FILTROS = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'aberto', rotulo: 'Abertos' },
  { id: 'encerrado', rotulo: 'Encerrados' },
]

export const TAMANHO_MAXIMO_DO_TITULO = 120

// Números de um evento a partir das listas gravadas. Quem já foi sorteado nunca sai de "participantes".
export function numerosDoEvento(evento) {
  const participantes = evento.participantes ?? []
  const sorteados = evento.sorteados ?? []
  const idsSorteados = new Set(sorteados.map((s) => s.id))
  const naDisputa = participantes.filter((p) => !idsSorteados.has(p.id)).length
  return {
    participantes: participantes.length,
    sorteados: sorteados.length,
    naDisputa,
    brindesEntregues: sorteados.filter((s) => s.brinde).length,
    // Parte da lista que já saiu, de 0 a 1.
    progresso: participantes.length ? (participantes.length - naDisputa) / participantes.length : 0,
  }
}

export function indicadoresGerais(eventos) {
  return eventos.reduce(
    (total, evento) => {
      const numeros = numerosDoEvento(evento)
      total.eventos += 1
      if (evento.status === 'aberto') total.abertos += 1
      total.pessoasSorteadas += numeros.sorteados
      total.brindesEntregues += numeros.brindesEntregues
      return total
    },
    { eventos: 0, abertos: 0, pessoasSorteadas: 0, brindesEntregues: 0 },
  )
}

// Mais recentes primeiro; no mesmo dia, em ordem alfabética.
export const ordenarEventos = (eventos) =>
  [...eventos].sort(
    (a, b) =>
      String(b.data ?? '').localeCompare(String(a.data ?? '')) ||
      String(a.titulo ?? '').localeCompare(String(b.titulo ?? ''), 'pt-BR'),
  )

// Busca sem diferenciar maiúsculas, acentos e pontuação, no nome e na descrição. Cada palavra
// digitada precisa aparecer, em qualquer ordem ("cafe maes" acha "Café do Dia das Mães").
export function filtrarEventos(eventos, filtro = 'todos', busca = '') {
  const palavras = normalizar(busca).split(' ').filter(Boolean)
  return eventos.filter((evento) => {
    if (filtro !== 'todos' && evento.status !== filtro) return false
    const texto = normalizar(`${evento.titulo ?? ''} ${evento.descricao ?? ''}`)
    return palavras.every((palavra) => texto.includes(palavra))
  })
}

export function validarEvento({ titulo, data }) {
  const erros = {}
  const nome = String(titulo ?? '').trim()
  if (!nome) erros.titulo = 'Informe o nome do evento.'
  else if (nome.length > TAMANHO_MAXIMO_DO_TITULO) erros.titulo = `Use no máximo ${TAMANHO_MAXIMO_DO_TITULO} letras.`
  if (!data) erros.data = 'Informe a data.'
  return erros
}

export const camposDoEvento = ({ titulo, descricao, data }) => ({
  titulo: String(titulo ?? '').trim().replace(/\s+/g, ' '),
  descricao: String(descricao ?? '').trim(),
  data,
})

export const tituloDaCopia = (titulo) => `${titulo} (cópia)`

// Evento novo, sem os horários (quem grava acrescenta criadoEm e atualizadoEm do servidor).
// "base" é o evento duplicado: vêm junto os brindes, os participantes e as pessoas por sorteio,
// nunca os sorteados.
export function novoEvento(campos, pessoa, base = null) {
  return {
    ...camposDoEvento(campos),
    status: 'aberto',
    brindes: (base?.brindes ?? []).map(({ nome, qtd }) => ({ nome, qtd: qtd ?? null })),
    brindeAtual: null,
    porVez: base?.porVez ?? 1,
    participantes: (base?.participantes ?? []).map(({ id, nome }) => ({ id, nome })),
    sorteados: [],
    criadoPorEmail: pessoa.email,
    criadoPorNome: pessoa.nome,
    encerradoEm: null,
  }
}

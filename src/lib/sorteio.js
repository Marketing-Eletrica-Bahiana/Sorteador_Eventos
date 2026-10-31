import { brindesDisponiveis } from './brindes.js'
import { garantirAberto, idsSorteados } from './participantes.js'

export const MAXIMO_POR_VEZ = 50
const LIMITE_32_BITS = 2 ** 32

// Inteiro de 0 a max-1 com crypto.getRandomValues, sem viés: descarta os valores do fim do
// intervalo de 32 bits que fariam algumas posições saírem mais que outras.
export function inteiroAleatorio(max, fonte = globalThis.crypto) {
  if (!Number.isInteger(max) || max < 1 || max > LIMITE_32_BITS) throw new Error('Intervalo inválido para o sorteio.')
  const limite = Math.floor(LIMITE_32_BITS / max) * max
  const caixa = new Uint32Array(1)
  for (;;) {
    fonte.getRandomValues(caixa)
    if (caixa[0] < limite) return caixa[0] % max
  }
}

// "quantos" posições diferentes de 0 a total-1, na ordem em que saíram (Fisher-Yates parcial).
export function escolherPosicoes(total, quantos, fonte) {
  const posicoes = Array.from({ length: total }, (_, i) => i)
  for (let i = 0; i < quantos; i++) {
    const j = i + inteiroAleatorio(total - i, fonte)
    ;[posicoes[i], posicoes[j]] = [posicoes[j], posicoes[i]]
  }
  return posicoes.slice(0, quantos)
}

export const ultimaRodada = (evento) => (evento.sorteados ?? []).reduce((maior, s) => Math.max(maior, s.rodada ?? 0), 0)

// Sorteados com o nome de cada pessoa e o número na ordem em que saíram (Nº 1 é o primeiro).
export function listaDeSorteados(evento) {
  const nomes = new Map((evento.participantes ?? []).map((p) => [p.id, p.nome]))
  return (evento.sorteados ?? []).map((s, i) => ({ ...s, numero: i + 1, nome: nomes.get(s.id) ?? '(fora da lista)' }))
}

export const sorteadosDaRodada = (evento, rodada) => listaDeSorteados(evento).filter((s) => s.rodada === rodada)

const naDisputa = (evento) => {
  const saiu = idsSorteados(evento)
  return (evento.participantes ?? []).filter((p) => !saiu.has(p.id))
}

// Se dá para sortear agora, quantas pessoas e com qual brinde. Sem brindes cadastrados, o sorteio
// só mostra os nomes (brinde null). Com brindes, precisa de um brinde da vez com estoque.
export function situacaoDoSorteio(evento) {
  const nao = (motivo) => ({ pode: false, motivo, quantidade: 0, brinde: null })
  if (evento.status === 'encerrado') return nao('O evento está encerrado.')
  const candidatos = naDisputa(evento).length
  if (!candidatos) return nao((evento.participantes ?? []).length ? 'Todo mundo já foi sorteado.' : 'Cadastre os participantes.')
  const porVez = Math.min(Math.max(1, evento.porVez ?? 1), MAXIMO_POR_VEZ)
  if (!(evento.brindes ?? []).length) return { pode: true, motivo: '', quantidade: Math.min(porVez, candidatos), brinde: null }
  const disponiveis = brindesDisponiveis(evento)
  if (!disponiveis.length) return nao('Os brindes acabaram.')
  const daVez = disponiveis.find((b) => b.nome === evento.brindeAtual)
  if (!daVez) return nao('Escolha o brinde da vez.')
  const quantidade = Math.min(porVez, candidatos, daVez.restantes ?? Infinity)
  return { pode: true, motivo: '', quantidade, brinde: daVez.nome }
}

// Sorteia a próxima rodada. Devolve as mudanças do evento e quem saiu. Roda dentro da transação:
// se outra pessoa sorteou ao mesmo tempo, a transação refaz tudo com a lista nova.
export function sortear(evento, { porEmail, agora = new Date(), fonte } = {}) {
  garantirAberto(evento)
  const situacao = situacaoDoSorteio(evento)
  if (!situacao.pode) throw new Error(situacao.motivo)
  const candidatos = naDisputa(evento)
  const rodada = ultimaRodada(evento) + 1
  const novos = escolherPosicoes(candidatos.length, situacao.quantidade, fonte).map((posicao) => ({
    id: candidatos[posicao].id,
    em: agora,
    brinde: situacao.brinde,
    rodada,
    porEmail,
  }))
  const mudancas = { sorteados: [...(evento.sorteados ?? []), ...novos] }
  // Brinde que acabou sai da vez: o próximo sorteio pede outra escolha.
  const daVez = situacao.brinde && brindesDisponiveis({ ...evento, ...mudancas }).some((b) => b.nome === situacao.brinde)
  if (situacao.brinde && !daVez) mudancas.brindeAtual = null
  return { mudancas, novos }
}

// Desfaz a rodada inteira mais recente: as pessoas voltam para a disputa e os brindes para o estoque.
export function desfazerUltimaRodada(evento) {
  garantirAberto(evento)
  const rodada = ultimaRodada(evento)
  if (!rodada) throw new Error('Ninguém foi sorteado ainda.')
  return { sorteados: (evento.sorteados ?? []).filter((s) => s.rodada !== rodada) }
}

export function recomecar(evento) {
  garantirAberto(evento)
  return { sorteados: [] }
}

// Troca o brinde de quem já foi sorteado (null = sem brinde), respeitando o estoque.
export function trocarBrinde(evento, idSorteado, novo) {
  garantirAberto(evento)
  const sorteado = (evento.sorteados ?? []).find((s) => s.id === idSorteado)
  if (!sorteado) throw new Error('Essa pessoa não está entre os sorteados.')
  if (novo === sorteado.brinde) return {}
  if (novo) {
    const brinde = (evento.brindes ?? []).find((b) => b.nome === novo)
    if (!brinde) throw new Error('Esse brinde não existe mais.')
    const entregues = (evento.sorteados ?? []).filter((s) => s.brinde === novo).length
    if (brinde.qtd != null && entregues >= brinde.qtd) throw new Error(`"${novo}" acabou.`)
  }
  return { sorteados: evento.sorteados.map((s) => (s.id === idSorteado ? { ...s, brinde: novo ?? null } : s)) }
}

export function mudarPorVez(evento, quantidade) {
  garantirAberto(evento)
  const n = Number(quantidade)
  if (!Number.isInteger(n) || n < 1 || n > MAXIMO_POR_VEZ) throw new Error(`Escolha de 1 a ${MAXIMO_POR_VEZ} pessoas por sorteio.`)
  return { porVez: n }
}

export function encerrar(evento, agora = new Date()) {
  if (evento.status === 'encerrado') throw new Error('O evento já está encerrado.')
  return { status: 'encerrado', encerradoEm: agora }
}

export function reabrir(evento) {
  if (evento.status !== 'encerrado') throw new Error('O evento já está aberto.')
  return { status: 'aberto', encerradoEm: null }
}

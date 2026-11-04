// Ações que mudam um evento. Todas passam por alterarEvento (transação) e usam as regras de src/lib.
// O caminho "../dados/eventos.js" é de propósito: a demonstração local troca esse módulo.
import { alterarEvento } from '../dados/eventos.js'
import { escolherBrindeDaVez, moverBrinde, removerBrinde, salvarBrinde } from '../lib/brindes.js'
import { apagarNaoSorteados, garantirAberto, juntarParticipantes, removerParticipante } from '../lib/participantes.js'
import { desfazerUltimoGiro, girarRoleta, marcarQuemGira, recomecarRoleta } from '../lib/roleta.js'
import {
  desfazerUltimaRodada,
  encerrar,
  mudarPorVez,
  reabrir,
  recomecar,
  sortear,
  trocarBrinde,
} from '../lib/sorteio.js'

// Devolve { adicionados, repetidos, foraDoLimite } da tentativa que foi gravada.
export async function adicionarParticipantes(id, nomes) {
  let resumo = null
  await alterarEvento(id, (evento) => {
    garantirAberto(evento)
    resumo = juntarParticipantes(evento.participantes ?? [], nomes)
    return { participantes: resumo.participantes }
  })
  return resumo
}

export const tirarParticipante = (id, idParticipante) => alterarEvento(id, (evento) => removerParticipante(evento, idParticipante))

export const apagarParticipantes = (id) => alterarEvento(id, apagarNaoSorteados)

export const gravarBrinde = (id, campos, nomeOriginal = null) =>
  alterarEvento(id, (evento) => salvarBrinde(evento, campos, nomeOriginal))

export const tirarBrinde = (id, nome) => alterarEvento(id, (evento) => removerBrinde(evento, nome))

export const mudarOrdemDoBrinde = (id, nome, direcao) => alterarEvento(id, (evento) => moverBrinde(evento, nome, direcao))

export const definirBrindeDaVez = (id, nome) => alterarEvento(id, (evento) => escolherBrindeDaVez(evento, nome))

// Sorteia a próxima rodada e devolve quem saiu (da tentativa que foi gravada). Quem está no palco
// vê o resultado pela atualização do evento, igual a quem só acompanha.
export async function sortearRodada(id, porEmail) {
  let novos = []
  await alterarEvento(id, (evento) => {
    const resultado = sortear(evento, { porEmail })
    novos = resultado.novos
    return resultado.mudancas
  })
  return novos
}

export const desfazerRodada = (id) => alterarEvento(id, desfazerUltimaRodada)

export const recomecarSorteio = (id) => alterarEvento(id, recomecar)

export const trocarBrindeDoSorteado = (id, idSorteado, brinde) =>
  alterarEvento(id, (evento) => trocarBrinde(evento, idSorteado, brinde))

export const definirPorVez = (id, quantidade) => alterarEvento(id, (evento) => mudarPorVez(evento, quantidade))

export const encerrarEvento = (id) => alterarEvento(id, (evento) => encerrar(evento, new Date()))

export const reabrirEvento = (id) => alterarEvento(id, reabrir)

// Roleta. Quem está na tela vê o resultado pela atualização do evento, igual a quem só acompanha.
export const marcarPessoaQueGira = (id, idParticipante) => alterarEvento(id, (evento) => marcarQuemGira(evento, idParticipante))

export const girarDaVez = (id, porEmail) => alterarEvento(id, (evento) => girarRoleta(evento, { porEmail }).mudancas)

export const desfazerGiro = (id) => alterarEvento(id, desfazerUltimoGiro)

export const recomecarGiros = (id) => alterarEvento(id, recomecarRoleta)

// Ações que mudam um evento. Todas passam por alterarEvento (transação) e usam as regras de src/lib.
// O caminho "../dados/eventos.js" é de propósito: a demonstração local troca esse módulo.
import { alterarEvento } from '../dados/eventos.js'
import { escolherBrindeDaVez, moverBrinde, removerBrinde, salvarBrinde } from '../lib/brindes.js'
import { apagarNaoSorteados, garantirAberto, juntarParticipantes, removerParticipante } from '../lib/participantes.js'

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

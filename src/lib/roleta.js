import { garantirAberto } from './participantes.js'
import { inteiroAleatorio } from './sorteio.js'

// Só cores da paleta. "Ganhou" e "Não ganhou" encerram a vez da pessoa; "Gire de Novo" repete o giro.
export const RESULTADOS = {
  ganhou: { rotulo: 'Ganhou', cor: '#001780' },
  gire_de_novo: { rotulo: 'Gire de Novo', cor: '#4069ff' },
  nao_ganhou: { rotulo: 'Não ganhou', cor: '#d4121a' },
}

// As 16 casas, no sentido horário a partir do topo: 4 Ganhou, 4 Gire de Novo e 8 Não ganhou,
// intercaladas para nenhuma casa ficar ao lado de outra igual.
export const CASAS = Array.from({ length: 4 }, () => ['nao_ganhou', 'ganhou', 'nao_ganhou', 'gire_de_novo']).flat()

export const ANGULO_DA_CASA = 360 / CASAS.length

// Tempos, em milissegundos. A roda para um pouco antes de o resultado aparecer.
export const DURACAO_DA_ROLETA = 5600
export const DURACAO_DA_RODA = 5300

// A seta fica à direita da roda (3 horas), onde o texto da casa aparece na horizontal.
const ANGULO_DA_SETA = 90

const giros = (evento) => evento.giros ?? []
const terminou = (giro) => giro.resultado !== 'gire_de_novo'

// Resultado final de cada pessoa que já girou até o fim (Ganhou ou Não ganhou).
export function resultadoPorPessoa(evento) {
  return new Map(giros(evento).filter(terminou).map((g) => [g.id, g.resultado]))
}

// Todo mundo da lista gira uma vez: aqui está quem ainda não terminou, inclusive quem está girando.
export function faltamGirar(evento) {
  const terminaram = resultadoPorPessoa(evento)
  return (evento.participantes ?? []).filter((p) => !terminaram.has(p.id))
}

// O evento só com os giros já revelados: enquanto a roda gira, o giro novo ainda não conta.
export const eventoAteOGiro = (evento, rodada) => ({ ...evento, giros: giros(evento).slice(0, rodada) })

// Giros com o nome da pessoa e o número na ordem em que aconteceram (Nº 1 é o primeiro).
export function listaDeGiros(evento) {
  const nomes = new Map((evento.participantes ?? []).map((p) => [p.id, p.nome]))
  return giros(evento).map((g, i) => ({ ...g, numero: i + 1, nome: nomes.get(g.id) ?? '(fora da lista)' }))
}

export function numerosDaRoleta(evento) {
  const finais = [...resultadoPorPessoa(evento).values()]
  return {
    faltam: faltamGirar(evento).length,
    ganharam: finais.filter((r) => r === 'ganhou').length,
    naoGanharam: finais.filter((r) => r === 'nao_ganhou').length,
    giros: giros(evento).length,
  }
}

// A pessoa marcada acabou de tirar "Gire de Novo": ela precisa girar outra vez, sem trocar.
const estaRepetindo = (evento) => {
  const ultimo = giros(evento).at(-1)
  return Boolean(evento.roletaVez) && ultimo?.id === evento.roletaVez && ultimo.resultado === 'gire_de_novo'
}

// O que dá para fazer agora: "marcar" quem gira, "girar" ou nada, com o motivo.
export function situacaoDaRoleta(evento) {
  const repetindo = estaRepetindo(evento)
  if (evento.status === 'encerrado') return { acao: null, motivo: 'O evento está encerrado.', repetindo }
  if (evento.roletaVez) return { acao: 'girar', motivo: '', repetindo }
  if (faltamGirar(evento).length) return { acao: 'marcar', motivo: 'Marque quem vai girar.', repetindo }
  const motivo = (evento.participantes ?? []).length ? 'Todo mundo já girou a roleta.' : 'Cadastre os participantes.'
  return { acao: null, motivo, repetindo }
}

// Marca quem está girando agora (null tira a marca). Troca à vontade, menos depois de um Gire de Novo.
export function marcarQuemGira(evento, id) {
  garantirAberto(evento)
  if (estaRepetindo(evento) && id !== evento.roletaVez) {
    throw new Error('Essa pessoa tirou Gire de Novo e precisa girar outra vez.')
  }
  if (!id) return { roletaVez: null }
  if (!(evento.participantes ?? []).some((p) => p.id === id)) throw new Error('Essa pessoa não está na lista.')
  if (resultadoPorPessoa(evento).has(id)) throw new Error('Essa pessoa já girou a roleta.')
  return { roletaVez: id }
}

// Gira a roleta para a pessoa marcada. Cada casa tem a mesma chance. Roda dentro da transação.
export function girarRoleta(evento, { porEmail, agora = new Date(), fonte } = {}) {
  garantirAberto(evento)
  if (!evento.roletaVez) throw new Error('Marque quem vai girar.')
  const casa = inteiroAleatorio(CASAS.length, fonte)
  const resultado = CASAS[casa]
  const giro = { id: evento.roletaVez, casa, resultado, em: agora, porEmail }
  const mudancas = { giros: [...giros(evento), giro] }
  if (terminou(giro)) mudancas.roletaVez = null
  return { mudancas, giro }
}

// Desfaz o giro mais recente e deixa marcada a pessoa que girou.
export function desfazerUltimoGiro(evento) {
  garantirAberto(evento)
  const lista = giros(evento)
  if (!lista.length) throw new Error('Ninguém girou a roleta ainda.')
  return { giros: lista.slice(0, -1), roletaVez: lista.at(-1).id }
}

export function recomecarRoleta(evento) {
  garantirAberto(evento)
  return { giros: [], roletaVez: null }
}

// Ângulos da roda, em graus no sentido horário.
export const centroDaCasa = (casa) => (casa + 0.5) * ANGULO_DA_CASA

// Desvio dentro da casa, para a roda não parar sempre no meio. Vem do número do giro, então é o
// mesmo em todas as telas, e nunca chega perto da divisa entre duas casas.
export const desvioDoGiro = (numero) => ((numero * 47) % 15) - 7

const normalizarAngulo = (angulo) => ((angulo % 360) + 360) % 360

// Rotação da roda parada com a casa embaixo da seta.
export const rotacaoParada = (casa, numero) => normalizarAngulo(ANGULO_DA_SETA - centroDaCasa(casa) + desvioDoGiro(numero))

// Rotação final de um giro que começa em "atual": sempre para a frente, com pelo menos "voltas" voltas.
export const rotacaoDoGiro = (atual, casa, numero, voltas = 6) =>
  Math.ceil(atual / 360) * 360 + voltas * 360 + rotacaoParada(casa, numero)

// Qual casa está embaixo da seta com a roda nessa rotação.
export const casaNaSeta = (rotacao) => Math.floor(normalizarAngulo(ANGULO_DA_SETA - rotacao) / ANGULO_DA_CASA)

import { garantirAberto } from './participantes.js'
import { normalizar } from './texto.js'

const TAMANHO_MAXIMO_DO_NOME = 80
const QUANTIDADE_MAXIMA = 100000

// Quantidade digitada: em branco é sem limite (null); senão um número inteiro de 1 em diante.
export function lerQuantidade(texto) {
  const limpo = String(texto ?? '').trim()
  if (!limpo) return { qtd: null, erro: '' }
  if (!/^\d+$/.test(limpo)) return { qtd: null, erro: 'Use só números inteiros, ou deixe em branco para sem limite.' }
  const qtd = Number(limpo)
  if (qtd < 1) return { qtd: null, erro: 'A quantidade precisa ser pelo menos 1.' }
  if (qtd > QUANTIDADE_MAXIMA) return { qtd: null, erro: 'Quantidade grande demais.' }
  return { qtd, erro: '' }
}

const entreguesDe = (evento, nome) => (evento.sorteados ?? []).filter((s) => s.brinde === nome).length

// Estoque de cada brinde, na ordem cadastrada. "restantes" é null quando não tem limite.
export function estoqueDosBrindes(evento) {
  return (evento.brindes ?? []).map(({ nome, qtd }) => {
    const entregues = entreguesDe(evento, nome)
    const restantes = qtd == null ? null : Math.max(0, qtd - entregues)
    return { nome, qtd: qtd ?? null, entregues, restantes, esgotado: restantes === 0 }
  })
}

// Brindes que ainda podem sair (os esgotados saem das opções do palco).
export const brindesDisponiveis = (evento) => estoqueDosBrindes(evento).filter((b) => !b.esgotado)

// Somatório para os números do evento e da dashboard. "restantes" é null se algum brinde não tem limite.
export function resumoDosBrindes(evento) {
  const estoque = estoqueDosBrindes(evento)
  const semLimite = estoque.some((b) => b.qtd == null)
  return {
    tipos: estoque.length,
    entregues: (evento.sorteados ?? []).filter((s) => s.brinde).length,
    restantes: semLimite ? null : estoque.reduce((total, b) => total + b.restantes, 0),
    semLimite,
  }
}

// Erros por campo do formulário de brinde. "nomeOriginal" é o nome antes de editar (null para novo).
export function validarBrinde(evento, { nome, quantidade }, nomeOriginal = null) {
  const erros = {}
  const limpo = String(nome ?? '').replace(/\s+/g, ' ').trim()
  if (!limpo) erros.nome = 'Informe o nome do brinde.'
  else if (limpo.length > TAMANHO_MAXIMO_DO_NOME) erros.nome = `Use no máximo ${TAMANHO_MAXIMO_DO_NOME} letras.`
  else {
    const repetido = (evento.brindes ?? []).some(
      (b) => b.nome !== nomeOriginal && normalizar(b.nome) === normalizar(limpo),
    )
    if (repetido) erros.nome = 'Já existe um brinde com esse nome.'
  }
  const { qtd, erro } = lerQuantidade(quantidade)
  if (erro) erros.quantidade = erro
  else if (nomeOriginal && qtd != null) {
    const entregues = entreguesDe(evento, nomeOriginal)
    if (qtd < entregues) erros.quantidade = `Já foram entregues ${entregues}. A quantidade não pode ser menor.`
  }
  return erros
}

const primeiroErro = (erros) => Object.values(erros).find(Boolean)

// Cadastra ou edita um brinde. Ao renomear, os sorteados e o brinde da vez acompanham o nome novo.
export function salvarBrinde(evento, campos, nomeOriginal = null) {
  garantirAberto(evento)
  const erro = primeiroErro(validarBrinde(evento, campos, nomeOriginal))
  if (erro) throw new Error(erro)
  const nome = String(campos.nome).replace(/\s+/g, ' ').trim()
  const { qtd } = lerQuantidade(campos.quantidade)
  const brindes = evento.brindes ?? []
  if (!nomeOriginal) return { brindes: [...brindes, { nome, qtd }] }
  if (!brindes.some((b) => b.nome === nomeOriginal)) throw new Error('Esse brinde não existe mais.')
  const mudancas = { brindes: brindes.map((b) => (b.nome === nomeOriginal ? { nome, qtd } : b)) }
  if (nome !== nomeOriginal) {
    mudancas.sorteados = (evento.sorteados ?? []).map((s) => (s.brinde === nomeOriginal ? { ...s, brinde: nome } : s))
  }
  // O brinde da vez acompanha o nome novo; se a quantidade nova o esgotou, ele sai da vez.
  if (evento.brindeAtual === nomeOriginal) {
    const esgotou = qtd != null && qtd <= entreguesDe(evento, nomeOriginal)
    mudancas.brindeAtual = esgotou ? null : nome
  }
  return mudancas
}

export function removerBrinde(evento, nome) {
  garantirAberto(evento)
  if (entreguesDe(evento, nome) > 0) {
    throw new Error('Esse brinde já foi entregue a alguém. Dá para mudar a quantidade, mas não remover.')
  }
  const mudancas = { brindes: (evento.brindes ?? []).filter((b) => b.nome !== nome) }
  if (evento.brindeAtual === nome) mudancas.brindeAtual = null
  return mudancas
}

// Sobe (-1) ou desce (+1) um brinde na lista. A ordem vale para as teclas 1 a 9 do palco.
export function moverBrinde(evento, nome, direcao) {
  garantirAberto(evento)
  const brindes = [...(evento.brindes ?? [])]
  const de = brindes.findIndex((b) => b.nome === nome)
  const para = de + direcao
  if (de < 0 || para < 0 || para >= brindes.length) return {}
  ;[brindes[de], brindes[para]] = [brindes[para], brindes[de]]
  return { brindes }
}

// Escolhe o brinde da vez no palco (null tira a escolha). Só vale brinde com estoque.
export function escolherBrindeDaVez(evento, nome) {
  garantirAberto(evento)
  if (nome && !brindesDisponiveis(evento).some((b) => b.nome === nome)) {
    throw new Error('Esse brinde acabou ou não existe mais.')
  }
  return { brindeAtual: nome ?? null }
}

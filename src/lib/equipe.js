import { DOMINIO_EMPRESA } from './empresa.js'
import { papelValido } from './papeis.js'

// O ID do documento em membros/ é o e-mail em minúsculas.
export const limparEmail = (email) => String(email ?? '').trim().toLowerCase()

export function validarEmail(email) {
  const limpo = limparEmail(email)
  if (!limpo) return 'Informe o e-mail.'
  if (!/^[^\s@]+@[^\s@]+$/.test(limpo)) return 'E-mail inválido.'
  if (!limpo.endsWith(`@${DOMINIO_EMPRESA}`)) return `Só e-mails @${DOMINIO_EMPRESA}.`
  return ''
}

// Erros por campo do formulário da Equipe. Vazio quando está tudo certo.
// "emailsCadastrados" evita cadastrar a mesma pessoa duas vezes (só vale para cadastro novo).
export function validarMembro(dados, { novo = false, emailsCadastrados = [] } = {}) {
  const erros = {}
  if (novo) {
    const erroEmail = validarEmail(dados.email)
    if (erroEmail) erros.email = erroEmail
    else if (emailsCadastrados.includes(limparEmail(dados.email))) erros.email = 'Essa pessoa já está cadastrada.'
  }
  if (!String(dados.nome ?? '').trim()) erros.nome = 'Informe o nome.'
  if (!papelValido(dados.papel)) erros.papel = 'Escolha o papel.'
  return erros
}

// Só os campos que as regras esperam em membros/{email}.
export const dadosDoMembro = ({ nome, cargo, papel, ativo }) => ({
  nome: String(nome ?? '').trim().replace(/\s+/g, ' '),
  cargo: String(cargo ?? '').trim().replace(/\s+/g, ' '),
  papel,
  ativo: ativo === true,
})

export const ordenarPorNome = (membros) =>
  [...membros].sort((a, b) => String(a.nome ?? '').localeCompare(String(b.nome ?? ''), 'pt-BR'))

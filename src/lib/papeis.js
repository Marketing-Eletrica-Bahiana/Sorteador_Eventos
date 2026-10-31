import { Ticket, Users } from 'lucide-react'

// "admin" e "organizador" são gravados em membros/{email}. Quem é do domínio e entra sem cadastro
// ativo (ou com papel inválido) só acompanha: vê eventos, palco e dashboards, sem botões de edição.
export const PAPEIS = {
  admin: { rotulo: 'Administração' },
  organizador: { rotulo: 'Organização' },
  acompanhante: { rotulo: 'Acompanhamento' },
}

// Papéis que o admin escolhe na tela Equipe.
export const PAPEIS_DE_CADASTRO = ['admin', 'organizador']

const TODOS = Object.keys(PAPEIS)

export const TELA_INICIAL = '/eventos'

export const TELAS = [
  { caminho: '/eventos', rotulo: 'Eventos', Icone: Ticket, papeis: TODOS },
  { caminho: '/equipe', rotulo: 'Equipe', Icone: Users, papeis: ['admin'] },
]

export const papelValido = (papel) => PAPEIS_DE_CADASTRO.includes(papel)

// Mesmo critério das regras do Firestore: só cadastro ativo e com papel válido grava alguma coisa.
export const papelDe = (membro) =>
  membro?.ativo === true && papelValido(membro.papel) ? membro.papel : 'acompanhante'

export const telasDoPapel = (papel) => TELAS.filter((tela) => tela.papeis.includes(papel))

// Criar e editar eventos, cadastrar participantes e brindes, sortear e encerrar.
export const podeOrganizar = (papel) => papel === 'admin' || papel === 'organizador'

export const podeExcluirEvento = (papel) => papel === 'admin'

export const podeCuidarDaEquipe = (papel) => papel === 'admin'

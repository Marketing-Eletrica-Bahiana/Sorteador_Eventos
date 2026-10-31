import { useMemo } from 'react'
import { collection, doc, runTransaction, updateDoc } from 'firebase/firestore'
import { db } from '../firebase.js'
import { useConsulta } from '../hooks/useConsulta.js'
import { dadosDoMembro, limparEmail, ordenarPorNome } from '../lib/equipe.js'

// Lista memorizada: só muda quando o Firestore manda dados novos.
export function useMembros() {
  const consulta = useConsulta('membros', () => collection(db, 'membros'))
  const dados = useMemo(() => (consulta.dados ? ordenarPorNome(consulta.dados) : null), [consulta.dados])
  return { ...consulta, dados }
}

// Em transação: se outra pessoa cadastrou o mesmo e-mail ao mesmo tempo, não sobrescreve.
export function criarMembro(dados) {
  const referencia = doc(db, 'membros', limparEmail(dados.email))
  return runTransaction(db, async (transacao) => {
    if ((await transacao.get(referencia)).exists()) throw new Error('Essa pessoa já está cadastrada.')
    transacao.set(referencia, dadosDoMembro(dados))
  })
}

export const atualizarMembro = (email, dados) => updateDoc(doc(db, 'membros', email), dadosDoMembro(dados))

export const mudarAcesso = (email, ativo) => updateDoc(doc(db, 'membros', email), { ativo })

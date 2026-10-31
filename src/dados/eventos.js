import { useMemo } from 'react'
import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.js'
import { useConsulta } from '../hooks/useConsulta.js'
import { camposDoEvento, novoEvento, ordenarEventos } from '../lib/eventos.js'

// Lista memorizada: só muda quando o Firestore manda dados novos.
export function useEventos() {
  const consulta = useConsulta('eventos', () => collection(db, 'eventos'))
  const dados = useMemo(() => (consulta.dados ? ordenarEventos(consulta.dados) : null), [consulta.dados])
  return { ...consulta, dados }
}

// Um evento em tempo real. "dados" fica null quando o evento não existe (ou foi excluído).
export function useEvento(id) {
  return useConsulta(id ? `eventos/${id}` : '', () => doc(db, 'eventos', id))
}

// Devolve o ID do evento criado. "base" é o evento duplicado (ver novoEvento).
export async function criarEvento(campos, pessoa, base = null) {
  const referencia = doc(collection(db, 'eventos'))
  await runTransaction(db, async (transacao) => {
    transacao.set(referencia, {
      ...novoEvento(campos, pessoa, base),
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    })
  })
  return referencia.id
}

// Toda alteração de evento passa por aqui: lê o evento dentro da transação e grava só o que
// "alterar" devolver. Se dois organizadores mexerem ao mesmo tempo, o Firestore refaz a leitura
// e ninguém sobrescreve o outro.
export function alterarEvento(id, alterar) {
  const referencia = doc(db, 'eventos', id)
  return runTransaction(db, async (transacao) => {
    const atual = await transacao.get(referencia)
    if (!atual.exists()) throw new Error('Este evento não existe mais.')
    const mudancas = alterar({ id, ...atual.data() })
    transacao.update(referencia, { ...mudancas, atualizadoEm: serverTimestamp() })
  })
}

export const editarEvento = (id, campos) => alterarEvento(id, () => camposDoEvento(campos))

// Só o admin (as regras recusam para os outros papéis). Também em transação, como toda alteração.
export function excluirEvento(id) {
  const referencia = doc(db, 'eventos', id)
  return runTransaction(db, async (transacao) => {
    if (!(await transacao.get(referencia)).exists()) throw new Error('Este evento não existe mais.')
    transacao.delete(referencia)
  })
}

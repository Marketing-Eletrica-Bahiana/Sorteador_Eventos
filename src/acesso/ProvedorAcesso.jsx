import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getRedirectResult, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db, DOMINIO_EMPRESA, provedorGoogle } from '../firebase.js'
import { mensagemDeErro } from '../lib/erros.js'
import { papelDe } from '../lib/papeis.js'

const ContextoAcesso = createContext(null)

const JANELA_FECHADA = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request']
const POPUP_NAO_FUNCIONA = ['auth/popup-blocked', 'auth/operation-not-supported-in-environment']

const ehCelular = () => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
const ehEmailDaEmpresa = (email) => (email ?? '').toLowerCase().endsWith(`@${DOMINIO_EMPRESA}`)

// situacao: 'carregando' | 'fora' | 'erro' | 'dentro'
// Quem é do domínio sempre entra. "pessoa" junta o login e o cadastro em membros/{email}:
// { email, nome, cargo, papel }, com papel 'acompanhante' quando não há cadastro ativo.
export function ProvedorAcesso({ children }) {
  const [usuario, setUsuario] = useState(undefined)
  const [membro, setMembro] = useState(null)
  const [situacao, setSituacao] = useState('carregando')
  const [erro, setErro] = useState('')

  useEffect(() => {
    getRedirectResult(auth).catch((e) => setErro(mensagemDeErro(e)))
    return onAuthStateChanged(auth, (u) => {
      if (u && !ehEmailDaEmpresa(u.email)) {
        setErro(`Use o seu e-mail @${DOMINIO_EMPRESA} para entrar.`)
        signOut(auth)
        return
      }
      setUsuario(u)
    })
  }, [])

  useEffect(() => {
    if (usuario === undefined) return undefined
    if (!usuario) {
      setMembro(null)
      setSituacao('fora')
      return undefined
    }
    setSituacao('carregando')
    return onSnapshot(
      doc(db, 'membros', usuario.email.toLowerCase()),
      (snap) => {
        setMembro(snap.exists() ? { email: snap.id, ...snap.data() } : null)
        setSituacao('dentro')
      },
      (e) => {
        setMembro(null)
        // Sem permissão para ler o cadastro: entra só para acompanhar, como quem não tem cadastro.
        if (e.code === 'permission-denied') {
          setSituacao('dentro')
          return
        }
        setErro(mensagemDeErro(e))
        setSituacao('erro')
      },
    )
  }, [usuario])

  // Memorizada: só muda quando o login ou o cadastro mudam (ver "telas que redesenham sem parar").
  const pessoa = useMemo(() => {
    if (!usuario) return null
    const email = usuario.email.toLowerCase()
    return {
      email,
      nome: membro?.nome || usuario.displayName || email,
      cargo: membro?.cargo ?? '',
      papel: papelDe(membro),
    }
  }, [usuario, membro])

  async function entrar() {
    setErro('')
    try {
      await signInWithPopup(auth, provedorGoogle)
    } catch (e) {
      const tentarRedirecionar = POPUP_NAO_FUNCIONA.includes(e.code) || (ehCelular() && !JANELA_FECHADA.includes(e.code))
      if (!tentarRedirecionar) {
        setErro(mensagemDeErro(e))
        return
      }
      try {
        await signInWithRedirect(auth, provedorGoogle)
      } catch (e2) {
        setErro(mensagemDeErro(e2))
      }
    }
  }

  function sair() {
    setErro('')
    return signOut(auth)
  }

  const valor = { situacao, usuario, membro, pessoa, erro, entrar, sair }
  return <ContextoAcesso value={valor}>{children}</ContextoAcesso>
}

export function useAcesso() {
  return useContext(ContextoAcesso)
}

import { useCallback, useEffect, useState } from 'react'

// Sons feitos pelo próprio navegador (Web Audio), sem arquivos de áudio. O navegador só libera o
// som depois de um toque ou clique na página; até lá os sons ficam mudos sem dar erro.
const CHAVE = 'sorteador:som'
let contexto = null

function obterContexto() {
  if (!contexto) {
    const Contexto = window.AudioContext || window.webkitAudioContext
    if (!Contexto) return null
    contexto = new Contexto()
  }
  if (contexto.state === 'suspended') contexto.resume().catch(() => {})
  return contexto
}

function nota(ctx, frequencia, inicio, duracao, volume, tipo = 'triangle') {
  const oscilador = ctx.createOscillator()
  const ganho = ctx.createGain()
  oscilador.type = tipo
  oscilador.frequency.value = frequencia
  ganho.gain.setValueAtTime(0.0001, inicio)
  ganho.gain.exponentialRampToValueAtTime(volume, inicio + 0.015)
  ganho.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao)
  oscilador.connect(ganho).connect(ctx.destination)
  oscilador.start(inicio)
  oscilador.stop(inicio + duracao + 0.05)
}

function lerPreferencia() {
  try {
    return window.localStorage.getItem(CHAVE) !== 'desligado'
  } catch {
    return true
  }
}

export function useSom() {
  const [ligado, setLigado] = useState(lerPreferencia)

  // O primeiro toque na página libera o som (regra dos navegadores).
  useEffect(() => {
    const liberar = () => obterContexto()
    window.addEventListener('pointerdown', liberar, { once: true })
    window.addEventListener('keydown', liberar, { once: true })
    return () => {
      window.removeEventListener('pointerdown', liberar)
      window.removeEventListener('keydown', liberar)
    }
  }, [])

  const alternar = useCallback(() => {
    setLigado((atual) => {
      try {
        window.localStorage.setItem(CHAVE, atual ? 'desligado' : 'ligado')
      } catch {
        // Sem armazenamento (janela anônima): vale só nesta visita.
      }
      if (!atual) obterContexto()
      return !atual
    })
  }, [])

  const tique = useCallback(() => {
    if (!ligado || !contexto || contexto.state !== 'running') return
    nota(contexto, 1400, contexto.currentTime, 0.035, 0.04, 'square')
  }, [ligado])

  const fanfarra = useCallback(() => {
    if (!ligado) return
    const ctx = obterContexto()
    if (!ctx || ctx.state !== 'running') return
    const t = ctx.currentTime
    // Dó, mi, sol, dó agudo e um acorde final.
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => nota(ctx, f, t + i * 0.12, 0.22, 0.18))
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f) => nota(ctx, f, t + 0.5, 0.9, 0.1))
  }, [ligado])

  return { ligado, alternar, tique, fanfarra }
}

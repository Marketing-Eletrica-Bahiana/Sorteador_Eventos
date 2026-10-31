import { useEffect, useRef } from 'react'

// Só as cores da paleta EB.
const CORES = ['#001780', '#0037ff', '#4069ff', '#d4121a', '#a92a2e', '#ffffff']
const DURACAO = 3800

// Confete sobre o palco, por alguns segundos. Quem pediu menos movimento no sistema não vê.
export default function Confete({ reduzido }) {
  const tela = useRef(null)

  useEffect(() => {
    const canvas = tela.current
    if (!canvas || reduzido) return undefined
    const ctx = canvas.getContext('2d')
    const escala = window.devicePixelRatio || 1
    const largura = canvas.offsetWidth
    const altura = canvas.offsetHeight
    canvas.width = largura * escala
    canvas.height = altura * escala
    ctx.scale(escala, escala)

    const pedacos = Array.from({ length: Math.min(220, Math.round(largura / 5)) }, (_, i) => ({
      x: largura / 2 + (Math.random() - 0.5) * largura * 0.3,
      y: altura * 0.45,
      vx: (Math.random() - 0.5) * 14,
      vy: -8 - Math.random() * 10,
      giro: Math.random() * Math.PI,
      velocidadeDoGiro: (Math.random() - 0.5) * 0.3,
      tamanho: 6 + Math.random() * 8,
      cor: CORES[i % CORES.length],
    }))

    const inicio = performance.now()
    let quadro
    const desenhar = (agora) => {
      const passado = agora - inicio
      ctx.clearRect(0, 0, largura, altura)
      ctx.globalAlpha = Math.max(0, 1 - Math.max(0, passado - DURACAO * 0.6) / (DURACAO * 0.4))
      for (const p of pedacos) {
        p.vy += 0.32
        p.vx *= 0.99
        p.x += p.vx
        p.y += p.vy
        p.giro += p.velocidadeDoGiro
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.giro)
        ctx.fillStyle = p.cor
        ctx.fillRect(-p.tamanho / 2, -p.tamanho / 4, p.tamanho, p.tamanho / 2)
        ctx.restore()
      }
      if (passado < DURACAO) quadro = requestAnimationFrame(desenhar)
      else ctx.clearRect(0, 0, largura, altura)
    }
    quadro = requestAnimationFrame(desenhar)
    return () => cancelAnimationFrame(quadro)
  }, [reduzido])

  if (reduzido) return null
  return <canvas ref={tela} className="confete" aria-hidden="true" />
}

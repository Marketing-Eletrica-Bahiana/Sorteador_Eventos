import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { logoDoCae } from '../../lib/marca.js'
import {
  ANGULO_DA_CASA,
  CASAS,
  centroDaCasa,
  DURACAO_DA_RODA,
  RESULTADOS,
  rotacaoDoGiro,
  rotacaoParada,
} from '../../lib/roleta.js'

const RAIO = 244
const RAIO_DO_TEXTO = 166
const RAIO_DOS_PINOS = 250
const INTERVALO_DO_TIQUE = 45
const INTERVALO_DA_SETA = 90
// Graus por milissegundo enquanto o giro é gravado, para a roda reagir na hora ao toque.
const VELOCIDADE_DO_TOQUE = 0.72

function ponto(angulo, raio) {
  const radianos = (angulo * Math.PI) / 180
  return [(raio * Math.sin(radianos)).toFixed(3), (-raio * Math.cos(radianos)).toFixed(3)]
}

function caminhoDaCasa(casa) {
  const [x1, y1] = ponto(casa * ANGULO_DA_CASA, RAIO)
  const [x2, y2] = ponto((casa + 1) * ANGULO_DA_CASA, RAIO)
  return `M0 0L${x1} ${y1}A${RAIO} ${RAIO} 0 0 1 ${x2} ${y2}Z`
}

// O desenho da roda não muda: fica fora do componente para não ser refeito a cada atualização.
const DESENHO = (
  <svg viewBox="-260 -260 520 520" aria-hidden="true">
    <circle r="258" className="roda__aro" />
    {CASAS.map((resultado, casa) => (
      <path key={casa} d={caminhoDaCasa(casa)} fill={RESULTADOS[resultado].cor} className="roda__casa" />
    ))}
    {CASAS.map((resultado, casa) => (
      <g key={casa} transform={`rotate(${centroDaCasa(casa)})`}>
        <text transform={`translate(0 ${-RAIO_DO_TEXTO}) rotate(-90)`} className="roda__texto">
          {RESULTADOS[resultado].rotulo}
        </text>
      </g>
    ))}
    {CASAS.map((_, casa) => {
      const [x, y] = ponto(casa * ANGULO_DA_CASA, RAIO_DOS_PINOS)
      return <circle key={casa} cx={x} cy={y} r="4" className="roda__pino" />
    })}
  </svg>
)

const DESCRICAO = 'Roleta com 16 casas: 4 Ganhou, 4 Gire de Novo e 8 Não ganhou'

// A roda em si. Gira por requestAnimationFrame, sem redesenhar a tela a cada quadro, e sempre para
// na casa que veio do sorteio. Quem define o resultado é o sorteio justo: o toque só dá a partida.
//
// aoGirar: quando existe, a roda responde ao toque (quem só acompanha não recebe).
// tocavel: dá para girar agora. Sem isso, um toque chama aoTocarBloqueada.
// aguardando: o giro foi pedido e ainda está sendo gravado.
export default function Roda({ casa, numero, girando, aguardando, tocavel, aoGirar, aoTocarBloqueada, aoPassarCasa }) {
  const area = useRef(null)
  const disco = useRef(null)
  const seta = useRef(null)
  // Antes do primeiro giro, a seta aponta para o meio de uma casa, não para a divisa.
  const rotacao = useRef(ANGULO_DA_CASA / 2)
  const arraste = useRef(null)
  const ignorarClique = useRef(false)
  const passagem = useRef({ casa: 0, tique: 0, seta: 0 })
  const [toque, setToque] = useState(null)
  const [pressionada, setPressionada] = useState(false)
  // Ligar ou desligar o som no meio do giro não pode recomeçar a animação.
  const avisarCasa = useRef(aoPassarCasa)

  useEffect(() => {
    avisarCasa.current = aoPassarCasa
  }, [aoPassarCasa])

  const aplicar = useCallback((graus) => {
    rotacao.current = graus
    disco.current.style.transform = `rotate(${graus}deg)`
  }, [])

  // A cada casa que passa embaixo da seta: tique e um balanço na seta.
  const acompanhar = useCallback((graus, agora) => {
    const atual = passagem.current
    const casaAtual = Math.floor(graus / ANGULO_DA_CASA)
    if (casaAtual === atual.casa) return
    atual.casa = casaAtual
    if (agora - atual.tique >= INTERVALO_DO_TIQUE) {
      atual.tique = agora
      avisarCasa.current?.()
    }
    if (agora - atual.seta >= INTERVALO_DA_SETA) {
      atual.seta = agora
      seta.current?.animate?.([{ rotate: '0deg' }, { rotate: '16deg' }, { rotate: '0deg' }], { duration: INTERVALO_DA_SETA })
    }
  }, [])

  // Parada na casa do último resultado ou, com o giro em andamento, desacelerando até a casa sorteada.
  useLayoutEffect(() => {
    if (casa == null) {
      aplicar(rotacao.current)
      return undefined
    }
    if (!girando) {
      if (!arraste.current) aplicar(rotacaoParada(casa, numero))
      return undefined
    }
    const inicio = rotacao.current
    const alvo = rotacaoDoGiro(inicio, casa, numero)
    const comeco = performance.now()
    let quadro
    const passo = (agora) => {
      // O horário do quadro pode ser um pouco anterior ao início do giro: sem isso, a roda recua.
      const progresso = Math.min(1, Math.max(0, (agora - comeco) / DURACAO_DA_RODA))
      const graus = inicio + (alvo - inicio) * (1 - (1 - progresso) ** 3)
      aplicar(graus)
      acompanhar(graus, agora)
      if (progresso < 1) quadro = requestAnimationFrame(passo)
    }
    quadro = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(quadro)
  }, [casa, numero, girando, aplicar, acompanhar])

  // Do toque até o giro ser gravado, a roda já vai girando, sem esperar a internet.
  useLayoutEffect(() => {
    if (!aguardando || girando) return undefined
    let anterior = performance.now()
    let quadro
    const passo = (agora) => {
      const graus = rotacao.current + Math.max(0, agora - anterior) * VELOCIDADE_DO_TOQUE
      anterior = agora
      aplicar(graus)
      acompanhar(graus, agora)
      quadro = requestAnimationFrame(passo)
    }
    quadro = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(quadro)
  }, [aguardando, girando, aplicar, acompanhar])

  const anguloDoDedo = (evento) => {
    const caixa = area.current.getBoundingClientRect()
    const x = evento.clientX - (caixa.left + caixa.width / 2)
    const y = evento.clientY - (caixa.top + caixa.height / 2)
    return (Math.atan2(y, x) * 180) / Math.PI
  }

  const aoApertar = (evento) => {
    if (evento.button > 0) return
    const caixa = area.current.getBoundingClientRect()
    setToque({ x: evento.clientX - caixa.left, y: evento.clientY - caixa.top, chave: evento.timeStamp })
    if (!tocavel) return
    try {
      evento.currentTarget.setPointerCapture(evento.pointerId)
    } catch {
      // O dedo já saiu da tela: segue sem capturar, e o giro funciona do mesmo jeito.
    }
    arraste.current = { id: evento.pointerId, angulo: anguloDoDedo(evento) }
    setPressionada(true)
  }

  // Enquanto o dedo está na roda, ela acompanha o movimento.
  const aoMover = (evento) => {
    const atual = arraste.current
    if (!atual || atual.id !== evento.pointerId) return
    const angulo = anguloDoDedo(evento)
    const diferenca = ((angulo - atual.angulo + 540) % 360) - 180
    atual.angulo = angulo
    const graus = rotacao.current + diferenca
    aplicar(graus)
    acompanhar(graus, evento.timeStamp)
  }

  // Soltou: a roda sai girando, tenha sido um toque rápido ou um arraste.
  const aoSoltar = (evento) => {
    const atual = arraste.current
    if (!atual || atual.id !== evento.pointerId) return
    arraste.current = null
    ignorarClique.current = true
    setPressionada(false)
    aoGirar()
  }

  const aoCancelar = () => {
    arraste.current = null
    setPressionada(false)
  }

  // No clique, e não ao apertar, para não reagir a quem só está rolando a página no tablet.
  const aoClicar = () => {
    if (ignorarClique.current) {
      ignorarClique.current = false
      return
    }
    if (!tocavel) aoTocarBloqueada?.()
  }

  const aoTeclar = (evento) => {
    if (evento.key !== 'Enter') return
    evento.preventDefault()
    if (tocavel) aoGirar()
    else aoTocarBloqueada?.()
  }

  const interativa = Boolean(aoGirar)
  const eventos = interativa
    ? {
        role: 'button',
        tabIndex: 0,
        'aria-disabled': !tocavel,
        'aria-label': `Girar a roleta. ${DESCRICAO}`,
        onPointerDown: aoApertar,
        onPointerMove: aoMover,
        onPointerUp: aoSoltar,
        onPointerCancel: aoCancelar,
        onClick: aoClicar,
        onKeyDown: aoTeclar,
      }
    : { role: 'img', 'aria-label': DESCRICAO }

  return (
    <div
      ref={area}
      className={`roda ${interativa ? 'roda--interativa' : ''} ${tocavel ? 'roda--tocavel' : ''} ${pressionada ? 'roda--pressionada' : ''}`}
      {...eventos}
    >
      <div className="roda__recorte">
        <div className="roda__disco" ref={disco}>
          {DESENHO}
        </div>
      </div>
      <div className="roda__centro">
        <img src={logoDoCae} alt="Centro de Apoio ao Eletricista" draggable="false" />
      </div>
      <div className="roda__seta" aria-hidden="true">
        <svg ref={seta} viewBox="0 0 64 44">
          <path d="M2 22 30 2v11h32v18H30v11Z" />
        </svg>
      </div>
      {toque && <span key={toque.chave} className="roda__toque" style={{ left: toque.x, top: toque.y }} aria-hidden="true" />}
    </div>
  )
}

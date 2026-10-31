import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Gift, Maximize, Minimize, Minus, Plus, Sparkles, Undo2, Volume2, VolumeX } from 'lucide-react'
import { useAcesso } from '../../acesso/ProvedorAcesso.jsx'
import { useAvisos } from '../../componentes/Avisos.jsx'
import Confete from '../../componentes/Confete.jsx'
import { useConfirmar } from '../../componentes/Confirmar.jsx'
import Logo from '../../componentes/Logo.jsx'
import { definirBrindeDaVez, definirPorVez, desfazerRodada, sortearRodada } from '../../dados/acoesDoEvento.js'
import { useMovimentoReduzido } from '../../hooks/useMovimentoReduzido.js'
import { useRevelacao } from '../../hooks/useRevelacao.js'
import { useSom } from '../../hooks/useSom.js'
import { brindesDisponiveis } from '../../lib/brindes.js'
import { formatarData } from '../../lib/datas.js'
import { numerosDoEvento } from '../../lib/eventos.js'
import { patterns } from '../../lib/marca.js'
import { MAXIMO_POR_VEZ, situacaoDoSorteio, sorteadosDaRodada, ultimaRodada } from '../../lib/sorteio.js'

const numero = (n) => n.toLocaleString('pt-BR')
const ehCampoDeTexto = (alvo) => alvo?.closest?.('input, textarea, select, [contenteditable="true"]')

// Palco do sorteio, feito para telão. Quem pode sortear vê os controles; quem acompanha vê a mesma
// animação ao vivo, sem controles. Sem mascotes no palco.
export default function Palco({ evento, podeSortear, apresentacao }) {
  const { pessoa } = useAcesso()
  const { executar } = useAvisos()
  const [janelaConfirmar, confirmar] = useConfirmar()
  const reduzido = useMovimentoReduzido()
  const som = useSom()
  const ultima = ultimaRodada(evento)
  const revelacao = useRevelacao(ultima, reduzido)
  const girando = revelacao.fase === 'girando'

  // Enquanto os nomes giram, números e estoque ainda não contam a rodada nova (suspense até a revelação).
  const visivel = useMemo(
    () => (girando ? { ...evento, sorteados: (evento.sorteados ?? []).filter((s) => s.rodada <= revelacao.rodada) } : evento),
    [girando, evento, revelacao.rodada],
  )
  const n = numerosDoEvento(visivel)
  const situacao = situacaoDoSorteio(evento)
  const temBrindes = (evento.brindes ?? []).length > 0
  const disponiveis = useMemo(() => brindesDisponiveis(visivel), [visivel])
  const naPlaca = useMemo(() => sorteadosDaRodada(evento, revelacao.rodada), [evento, revelacao.rodada])
  const nomesParaGirar = useMemo(() => (evento.participantes ?? []).map((p) => p.nome), [evento.participantes])

  // Fanfarra a cada revelação nova (não toca de novo ao ligar o som depois).
  useEffect(() => {
    if (revelacao.festa) som.fanfarra()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revelacao.festa])

  const sortear = useCallback(async () => {
    if (!podeSortear || girando || !situacao.pode) return
    revelacao.comecarGiro()
    const deuCerto = await executar(() => sortearRodada(evento.id, pessoa.email))
    if (!deuCerto) revelacao.cancelarGiro()
  }, [podeSortear, girando, situacao.pode, revelacao, executar, evento.id, pessoa.email])

  const escolherBrinde = useCallback(
    (nome) => {
      if (!podeSortear || girando || nome === evento.brindeAtual) return
      executar(() => definirBrindeDaVez(evento.id, nome))
    },
    [podeSortear, girando, evento.brindeAtual, evento.id, executar],
  )

  // Barra de espaço sorteia; teclas 1 a 9 escolhem o brinde da vez (só para quem pode sortear).
  useEffect(() => {
    if (!podeSortear) return undefined
    const aoTeclar = (e) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || ehCampoDeTexto(e.target)) return
      if (document.querySelector('dialog[open]')) return
      if (e.code === 'Space') {
        e.preventDefault()
        sortear()
      } else if (/^[1-9]$/.test(e.key) && disponiveis[Number(e.key) - 1]) {
        e.preventDefault()
        escolherBrinde(disponiveis[Number(e.key) - 1].nome)
      }
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [podeSortear, sortear, escolherBrinde, disponiveis])

  async function desfazer() {
    const ultimos = sorteadosDaRodada(evento, ultima)
    const nomes = ultimos.map((s) => s.nome).join(', ')
    const comBrinde = ultimos.some((s) => s.brinde)
    const sim = await confirmar({
      titulo: 'Desfazer o último sorteio',
      texto: `A rodada ${ultima} sai do resultado: ${nomes} ${ultimos.length === 1 ? 'volta' : 'voltam'} para a disputa${comBrinde ? ' e o brinde volta para o estoque' : ''}.`,
      botao: 'Desfazer',
      perigo: true,
    })
    if (sim) executar(() => desfazerRodada(evento.id), 'Último sorteio desfeito.')
  }

  const porVez = evento.porVez ?? 1
  const mudarPorVez = (novo) => executar(() => definirPorVez(evento.id, novo))

  return (
    <div
      className={`palco ${apresentacao.ativo ? 'palco--apresentando' : ''}`}
      style={{ '--pattern': `url("${patterns.circuito}")` }}
    >
      {revelacao.festa > 0 && <Confete key={revelacao.festa} reduzido={reduzido} />}

      <header className="palco__topo">
        <div className="palco__evento">
          <h1 className="palco__titulo">{evento.titulo}</h1>
          <span className="palco__data">
            {formatarData(evento.data)}
            {evento.status === 'encerrado' && <span className="etiqueta etiqueta--claro">Encerrado</span>}
          </span>
        </div>
        <div className="palco__botoes">
          {apresentacao.ativo && <Logo formato="linha" cor="branco" altura={32} className="so-largo" />}
          <button
            type="button"
            className="botao-icone botao-icone--claro"
            onClick={som.alternar}
            aria-pressed={som.ligado}
            aria-label={som.ligado ? 'Desligar o som' : 'Ligar o som'}
            title={som.ligado ? 'Desligar o som' : 'Ligar o som'}
          >
            {som.ligado ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
          </button>
          <button
            type="button"
            className="botao botao--claro"
            onClick={apresentacao.ativo ? apresentacao.sair : apresentacao.entrar}
          >
            {apresentacao.ativo ? <Minimize aria-hidden="true" /> : <Maximize aria-hidden="true" />}
            {apresentacao.ativo ? 'Sair' : 'Apresentar'}
          </button>
        </div>
      </header>

      <div className="palco__brinde-da-vez" aria-live="polite">
        <Gift aria-hidden="true" />
        {temBrindes ? (
          <span>
            Brinde da vez: <strong>{evento.brindeAtual ?? 'escolha abaixo'}</strong>
          </span>
        ) : (
          <span>Sorteio só de nomes</span>
        )}
      </div>

      <div className="palco__centro">
        {girando ? (
          <NomesGirando nomes={nomesParaGirar} reduzido={reduzido} aoTrocar={som.tique} />
        ) : revelacao.fase === 'revelado' && naPlaca.length ? (
          <Resultado key={`${revelacao.rodada}-${revelacao.festa}`} rodada={revelacao.rodada} sorteados={naPlaca} />
        ) : (
          <div className="placa placa--espera">
            <Sparkles aria-hidden="true" />
            <strong className="placa__chamada">{podeSortear ? 'Tudo pronto para sortear!' : 'Aguardando o próximo sorteio'}</strong>
            {podeSortear && !situacao.pode && <span className="placa__brinde">{situacao.motivo}</span>}
          </div>
        )}
      </div>

      <dl className="palco__numeros">
        <div>
          <dt>Na disputa</dt>
          <dd>{numero(n.naDisputa)}</dd>
        </div>
        <div>
          <dt>Sorteados</dt>
          <dd>{numero(n.sorteados)}</dd>
        </div>
        <div>
          <dt>Participantes</dt>
          <dd>{numero(n.participantes)}</dd>
        </div>
      </dl>

      {podeSortear && (
        <div className="palco__controles">
          {temBrindes && (
            <div className="palco__brindes" role="group" aria-label="Escolher o brinde da vez">
              {disponiveis.length === 0 && <span className="palco__motivo">Os brindes acabaram.</span>}
              {disponiveis.map((brinde, i) => (
                <button
                  key={brinde.nome}
                  type="button"
                  className={`brinde-opcao ${brinde.nome === evento.brindeAtual ? 'escolhido' : ''}`}
                  aria-pressed={brinde.nome === evento.brindeAtual}
                  onClick={() => escolherBrinde(brinde.nome)}
                  disabled={girando}
                >
                  {i < 9 && <kbd>{i + 1}</kbd>}
                  {brinde.nome}
                  {brinde.restantes != null && <span className="brinde-opcao__resto">{brinde.restantes}</span>}
                </button>
              ))}
            </div>
          )}
          <div className="palco__acoes">
            <div className="contador" role="group" aria-label="Pessoas por sorteio">
              <span className="contador__rotulo">Pessoas por sorteio</span>
              <button
                type="button"
                className="botao-icone botao-icone--claro"
                onClick={() => mudarPorVez(porVez - 1)}
                disabled={girando || porVez <= 1}
                aria-label="Menos uma pessoa por sorteio"
              >
                <Minus aria-hidden="true" />
              </button>
              <strong className="contador__valor">{porVez}</strong>
              <button
                type="button"
                className="botao-icone botao-icone--claro"
                onClick={() => mudarPorVez(porVez + 1)}
                disabled={girando || porVez >= MAXIMO_POR_VEZ}
                aria-label="Mais uma pessoa por sorteio"
              >
                <Plus aria-hidden="true" />
              </button>
            </div>
            <button type="button" className="botao botao--sortear" onClick={sortear} disabled={girando || !situacao.pode}>
              <Sparkles aria-hidden="true" />
              {girando ? 'Sorteando...' : 'Sortear'}
            </button>
            {ultima > 0 && (
              <button type="button" className="botao botao--claro" onClick={desfazer} disabled={girando}>
                <Undo2 aria-hidden="true" />
                Desfazer último
              </button>
            )}
          </div>
          {!situacao.pode && <p className="palco__motivo">{situacao.motivo}</p>}
          <p className="palco__dica">
            Barra de espaço sorteia{temBrindes ? ' · teclas 1 a 9 escolhem o brinde' : ''}
          </p>
        </div>
      )}
      {janelaConfirmar}
    </div>
  )
}

// Nomes passando rápido e desacelerando. É só animação: quem ganha vem do sorteio justo.
// A lista fica numa ref para a atualização do evento no meio do giro não recomeçar a velocidade.
function NomesGirando({ nomes, reduzido, aoTrocar }) {
  const lista = useRef(nomes)
  const sortearNome = () => lista.current[Math.floor(Math.random() * lista.current.length)] ?? ''
  const [nome, setNome] = useState(sortearNome)

  useEffect(() => {
    lista.current = nomes
  }, [nomes])

  useEffect(() => {
    if (reduzido) return undefined
    let atraso = 55
    let relogio
    const passo = () => {
      setNome(lista.current[Math.floor(Math.random() * lista.current.length)] ?? '')
      aoTrocar?.()
      atraso = Math.min(atraso * 1.07, 240)
      relogio = setTimeout(passo, atraso)
    }
    relogio = setTimeout(passo, atraso)
    return () => clearTimeout(relogio)
  }, [reduzido, aoTrocar])

  return (
    <div className="placa placa--girando" role="status">
      <span className="placa__rotulo">Sorteando...</span>
      <strong className="placa__nome">{reduzido ? 'Sorteando...' : nome}</strong>
    </div>
  )
}

// Resultado da rodada: uma placa grande, ou uma grade com as pessoas entrando uma a uma.
function Resultado({ rodada, sorteados }) {
  if (sorteados.length === 1) {
    const [s] = sorteados
    return (
      <div className="placa placa--revelada" role="status">
        <span className="placa__rotulo">Rodada {rodada}</span>
        <strong className="placa__nome">{s.nome}</strong>
        {s.brinde && (
          <span className="placa__brinde">
            <Gift aria-hidden="true" />
            {s.brinde}
          </span>
        )}
      </div>
    )
  }
  return (
    <div className="placa placa--grade" role="status">
      <span className="placa__rotulo">
        Rodada {rodada} · {sorteados.length} sorteados
      </span>
      <ol className="grade-sorteados">
        {sorteados.map((s, i) => (
          <li key={s.id} className="grade-sorteados__item" style={{ animationDelay: `${i * 350}ms` }}>
            <strong>{s.nome}</strong>
            {s.brinde && <span>{s.brinde}</span>}
          </li>
        ))}
      </ol>
    </div>
  )
}

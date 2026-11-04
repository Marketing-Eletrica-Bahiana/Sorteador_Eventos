import { useCallback, useEffect, useMemo, useState } from 'react'
import { Hand, Sparkles, Undo2, UserCheck } from 'lucide-react'
import { useAcesso } from '../../acesso/ProvedorAcesso.jsx'
import { useAvisos } from '../../componentes/Avisos.jsx'
import Confete from '../../componentes/Confete.jsx'
import { useConfirmar } from '../../componentes/Confirmar.jsx'
import Janela from '../../componentes/Janela.jsx'
import { desfazerGiro, girarDaVez } from '../../dados/acoesDoEvento.js'
import { useRevelacaoDaRoleta } from '../../hooks/useRevelacao.js'
import { useSom } from '../../hooks/useSom.js'
import { patterns } from '../../lib/marca.js'
import { eventoAteOGiro, listaDeGiros, numerosDaRoleta, RESULTADOS, situacaoDaRoleta } from '../../lib/roleta.js'
import AbaQuemGira from './AbaQuemGira.jsx'
import Roda from './Roda.jsx'
import TopoDoPalco from './TopoDoPalco.jsx'

const numero = (n) => n.toLocaleString('pt-BR')
const ehCampoDeTexto = (alvo) => alvo?.closest?.('input, textarea, select, [contenteditable="true"]')

// Roleta do evento, feita para tablet e telão. Quem organiza marca quem está girando; a pessoa toca
// na roda para girar. Quem acompanha vê a mesma animação ao vivo, sem controles. A animação não
// depende de "menos movimento" (ver useRevelacaoDaRoleta). Sem mascotes.
export default function Roleta({ evento, podeGirar, apresentacao }) {
  const { pessoa } = useAcesso()
  const { avisar, executar } = useAvisos()
  const [janelaConfirmar, confirmar] = useConfirmar()
  const som = useSom()
  const [esperandoGiro, setEsperandoGiro] = useState(false)
  const [escolhendo, setEscolhendo] = useState(false)

  const giros = useMemo(() => listaDeGiros(evento), [evento])
  const revelacao = useRevelacaoDaRoleta(giros.length)
  // A comparação com o que já foi revelado evita mostrar o resultado por um quadro, antes de a roda girar.
  const girando = revelacao.fase === 'girando' || giros.length > revelacao.rodada
  const ocupado = girando || esperandoGiro

  // Enquanto a roda gira, números e resultado ainda não contam o giro novo (suspense até a revelação).
  const visivel = useMemo(() => eventoAteOGiro(evento, revelacao.rodada), [evento, revelacao.rodada])
  const n = numerosDaRoleta(visivel)
  const situacao = situacaoDaRoleta(evento)
  const ultimo = giros.at(-1) ?? null
  const mostrado = giros[revelacao.rodada - 1] ?? null
  const nomeDaVez = (evento.participantes ?? []).find((p) => p.id === evento.roletaVez)?.nome ?? null
  const comemorar = revelacao.festa > 0 && revelacao.rodada === revelacao.rodadaDaFesta && mostrado?.resultado === 'ganhou'
  const tocavel = podeGirar && !ocupado && situacao.acao === 'girar'

  // Fanfarra só para quem ganhou (não toca de novo ao ligar o som depois).
  useEffect(() => {
    if (comemorar) som.fanfarra()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revelacao.festa])

  // O giro gravado chegou: daqui em diante, quem manda na roda é a animação até a casa sorteada.
  useEffect(() => {
    if (girando) setEsperandoGiro(false)
  }, [girando])

  const girar = useCallback(async () => {
    if (!podeGirar || ocupado || situacao.acao !== 'girar') return
    setEsperandoGiro(true)
    const deuCerto = await executar(() => girarDaVez(evento.id, pessoa.email))
    if (!deuCerto) setEsperandoGiro(false)
  }, [podeGirar, ocupado, situacao.acao, executar, evento.id, pessoa.email])

  // Tocou na roda sem poder girar: ajuda a resolver o que está faltando.
  const aoTocarBloqueada = useCallback(() => {
    if (ocupado) return
    if (situacao.acao === 'marcar') setEscolhendo(true)
    else if (situacao.motivo) avisar(situacao.motivo, 'erro')
  }, [ocupado, situacao.acao, situacao.motivo, avisar])

  // Barra de espaço também gira, para quem está no computador.
  useEffect(() => {
    if (!podeGirar) return undefined
    const aoTeclar = (e) => {
      if (e.code !== 'Space' || e.repeat || e.ctrlKey || e.metaKey || e.altKey || ehCampoDeTexto(e.target)) return
      if (document.querySelector('dialog[open]')) return
      e.preventDefault()
      girar()
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [podeGirar, girar])

  async function desfazer() {
    const sim = await confirmar({
      titulo: 'Desfazer o último giro',
      texto: `O giro de ${ultimo.nome} (${RESULTADOS[ultimo.resultado].rotulo}) sai do resultado e essa pessoa volta a ficar marcada para girar.`,
      botao: 'Desfazer',
      perigo: true,
    })
    if (sim) executar(() => desfazerGiro(evento.id), 'Último giro desfeito.')
  }

  // A roda mostra o giro em andamento ou, parada, o último resultado revelado.
  const giroDaRoda = girando ? ultimo : mostrado
  const podeEscolher = !ocupado && !situacao.repetindo && (situacao.acao === 'marcar' || situacao.acao === 'girar')

  return (
    <div
      className={`palco palco--roleta ${apresentacao.ativo ? 'palco--apresentando' : ''}`}
      style={{ '--pattern': `url("${patterns.circuito}")` }}
    >
      {comemorar && <Confete key={revelacao.festa} />}

      <TopoDoPalco evento={evento} som={som} apresentacao={apresentacao} />

      <div className="roleta">
        <Roda
          casa={giroDaRoda?.casa ?? null}
          numero={giroDaRoda?.numero ?? 0}
          girando={girando}
          aguardando={esperandoGiro}
          tocavel={tocavel}
          aoGirar={podeGirar ? girar : undefined}
          aoTocarBloqueada={aoTocarBloqueada}
          aoPassarCasa={som.tique}
        />

        <div className="roleta__lado">
          <CartaoDaVez
            girando={girando}
            ultimo={ultimo}
            mostrado={mostrado}
            idDaVez={evento.roletaVez ?? null}
            nomeDaVez={nomeDaVez}
            festa={revelacao.festa}
            podeGirar={podeGirar}
            acao={situacao.acao}
            motivo={situacao.motivo}
          />

          {tocavel && (
            <p className="roleta__dica-toque">
              <Hand aria-hidden="true" />
              Toque na roleta para girar
            </p>
          )}

          <dl className="palco__numeros">
            <div>
              <dt>Faltam girar</dt>
              <dd>{numero(n.faltam)}</dd>
            </div>
            <div>
              <dt>Ganharam</dt>
              <dd>{numero(n.ganharam)}</dd>
            </div>
            <div>
              <dt>Não ganharam</dt>
              <dd>{numero(n.naoGanharam)}</dd>
            </div>
          </dl>

          {podeGirar && (
            <div className="roleta__controles">
              <div className="palco__acoes">
                {/* Sem o painel lateral ao lado (tablet e tela cheia), a lista abre numa janela. */}
                <button
                  type="button"
                  className={`botao roleta__escolher ${situacao.acao === 'marcar' ? 'botao--sortear' : 'botao--claro'}`}
                  onClick={() => setEscolhendo(true)}
                  disabled={!podeEscolher}
                >
                  <UserCheck aria-hidden="true" />
                  {situacao.acao === 'girar' ? 'Trocar quem gira' : 'Marcar quem gira'}
                </button>
                {giros.length > 0 && (
                  <button type="button" className="botao botao--claro" onClick={desfazer} disabled={ocupado}>
                    <Undo2 aria-hidden="true" />
                    Desfazer último
                  </button>
                )}
              </div>
              <p className="palco__dica">No computador, dá para clicar na roleta ou usar a barra de espaço</p>
            </div>
          )}
        </div>
      </div>

      <Janela aberta={escolhendo} titulo="Quem vai girar?" aoFechar={() => setEscolhendo(false)} largura={480}>
        <AbaQuemGira evento={evento} podeMexer={podeGirar} aoMarcar={() => setEscolhendo(false)} />
      </Janela>
      {janelaConfirmar}
    </div>
  )
}

// O que aparece ao lado da roda, nesta ordem: a roda girando, quem está marcado (com o aviso de Gire
// de Novo, se for o caso), o último resultado ou a espera.
function CartaoDaVez({ girando, ultimo, mostrado, idDaVez, nomeDaVez, festa, podeGirar, acao, motivo }) {
  if (girando) {
    return (
      <div className="placa placa--girando" role="status">
        <span className="placa__rotulo">Girando a roleta</span>
        <strong className="placa__nome">{ultimo.nome}</strong>
      </div>
    )
  }
  if (idDaVez && mostrado?.resultado === 'gire_de_novo' && mostrado.id === idDaVez) {
    return (
      <div key={festa} className="placa placa--resultado placa--gire_de_novo" role="status">
        <span className="placa__pessoa">{mostrado.nome}</span>
        <strong className="placa__nome">{RESULTADOS.gire_de_novo.rotulo}!</strong>
      </div>
    )
  }
  if (idDaVez) {
    return (
      <div className="placa placa--vez" role="status">
        <span className="placa__rotulo">Quem está girando</span>
        <strong className="placa__nome">{nomeDaVez ?? '(fora da lista)'}</strong>
      </div>
    )
  }
  if (mostrado) {
    return (
      <div key={festa} className={`placa placa--resultado placa--${mostrado.resultado}`} role="status">
        <span className="placa__pessoa">{mostrado.nome}</span>
        <strong className="placa__nome">
          {RESULTADOS[mostrado.resultado].rotulo}
          {mostrado.resultado === 'ganhou' ? '!' : ''}
        </strong>
      </div>
    )
  }
  return (
    <div className="placa placa--espera">
      <Sparkles aria-hidden="true" />
      <strong className="placa__chamada">{podeGirar && acao === 'marcar' ? 'Marque quem vai girar' : 'Aguardando o próximo giro'}</strong>
      {podeGirar && acao !== 'marcar' && motivo && <span className="placa__brinde">{motivo}</span>}
    </div>
  )
}

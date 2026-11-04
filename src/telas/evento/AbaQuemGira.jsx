import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useAvisos } from '../../componentes/Avisos.jsx'
import { marcarPessoaQueGira } from '../../dados/acoesDoEvento.js'
import { useRevelacaoDaRoleta } from '../../hooks/useRevelacao.js'
import { buscarParticipantes } from '../../lib/participantes.js'
import { eventoAteOGiro, numerosDaRoleta, RESULTADOS, resultadoPorPessoa, situacaoDaRoleta } from '../../lib/roleta.js'

const MOSTRAR_ATE = 300
const numero = (n) => n.toLocaleString('pt-BR')

// Lista para marcar quem está girando agora. Fica na aba Quem gira do painel lateral e, no tablet e na
// tela cheia, numa janela (aoMarcar fecha a janela). Quem ainda não girou vem primeiro.
export default function AbaQuemGira({ evento, podeMexer, aoMarcar }) {
  const { executar } = useAvisos()
  const [busca, setBusca] = useState('')
  const [salvando, setSalvando] = useState(false)

  // Mesmo tempo da roda: o resultado da pessoa só aparece quando ela para.
  const giros = (evento.giros ?? []).length
  const revelacao = useRevelacaoDaRoleta(giros)
  const girando = revelacao.fase === 'girando' || giros > revelacao.rodada
  const visivel = useMemo(() => eventoAteOGiro(evento, revelacao.rodada), [evento, revelacao.rodada])
  const resultados = useMemo(() => resultadoPorPessoa(visivel), [visivel])
  const n = numerosDaRoleta(visivel)

  const participantes = useMemo(() => evento.participantes ?? [], [evento.participantes])
  const encontrados = useMemo(() => {
    const achados = buscarParticipantes(participantes, busca)
    return [...achados.filter((p) => !resultados.has(p.id)), ...achados.filter((p) => resultados.has(p.id))]
  }, [participantes, busca, resultados])

  const vez = evento.roletaVez ?? null
  const { repetindo } = situacaoDaRoleta(evento)
  const nomeDaVez = participantes.find((p) => p.id === vez)?.nome

  async function marcar(participante) {
    setSalvando(true)
    const deuCerto = await executar(() => marcarPessoaQueGira(evento.id, participante.id === vez ? null : participante.id))
    setSalvando(false)
    if (!deuCerto) return
    setBusca('')
    aoMarcar?.()
  }

  const Linha = podeMexer ? 'button' : 'div'

  return (
    <div className="aba-painel">
      <p className="aba-painel__resumo">
        <strong>
          {numero(n.faltam)} {n.faltam === 1 ? 'falta girar' : 'faltam girar'}
        </strong>
        <span className="texto-suave"> de {numero(participantes.length)}</span>
      </p>

      {repetindo && <p className="aviso">{nomeDaVez} tirou Gire de Novo e gira outra vez.</p>}

      {participantes.length === 0 ? (
        <p className="texto-suave">Nenhum participante ainda. Cadastre a lista na aba Participantes.</p>
      ) : (
        <label className="campo campo--busca">
          <span className="campo__rotulo">Buscar pessoa</span>
          <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome" />
          <Search aria-hidden="true" />
        </label>
      )}

      {participantes.length > 0 && encontrados.length === 0 && <p className="texto-suave">Ninguém com esse nome na lista.</p>}

      {encontrados.length > 0 && (
        <ul className="quem-gira">
          {encontrados.slice(0, MOSTRAR_ATE).map((participante) => {
            const marcada = participante.id === vez && !girando
            const resultado = resultados.get(participante.id)
            const props = podeMexer
              ? {
                  type: 'button',
                  'aria-pressed': marcada,
                  disabled: salvando || girando || repetindo || Boolean(resultado),
                  onClick: () => marcar(participante),
                }
              : {}
            return (
              <li key={participante.id}>
                <Linha className={`quem-gira__pessoa ${marcada ? 'quem-gira__pessoa--marcada' : ''}`} {...props}>
                  <span className="quem-gira__nome">{participante.nome}</span>
                  {marcada && <span className="etiqueta etiqueta--aberto">Girando agora</span>}
                  {resultado && <span className={`etiqueta etiqueta--${resultado}`}>{RESULTADOS[resultado].rotulo}</span>}
                </Linha>
              </li>
            )
          })}
        </ul>
      )}
      {encontrados.length > MOSTRAR_ATE && (
        <p className="texto-suave texto-pequeno">
          Mostrando {numero(MOSTRAR_ATE)} de {numero(encontrados.length)}. Use a busca para achar alguém.
        </p>
      )}
    </div>
  )
}

import { useState } from 'react'
import { ArrowLeft, Disc3, Gift, Info, ListChecks, Sparkles, Trophy, UserCheck, Users } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router'
import { useAcesso } from '../../acesso/ProvedorAcesso.jsx'
import CarregandoBloco from '../../componentes/CarregandoBloco.jsx'
import { useEvento } from '../../dados/eventos.js'
import { useApresentacao } from '../../hooks/useApresentacao.js'
import { mensagemDeErro } from '../../lib/erros.js'
import { podeOrganizar } from '../../lib/papeis.js'
import AbaBrindes from './AbaBrindes.jsx'
import AbaEvento from './AbaEvento.jsx'
import AbaParticipantes from './AbaParticipantes.jsx'
import AbaQuemGira from './AbaQuemGira.jsx'
import AbaResultados from './AbaResultados.jsx'
import AbaSorteados from './AbaSorteados.jsx'
import Palco from './Palco.jsx'
import Roleta from './Roleta.jsx'

const MODOS = [
  { id: 'sorteio', rotulo: 'Sorteio', Icone: Sparkles },
  { id: 'roleta', rotulo: 'Roleta', Icone: Disc3 },
]

const ABA_PARTICIPANTES = { id: 'participantes', rotulo: 'Participantes', Icone: Users }
const ABA_EVENTO = { id: 'evento', rotulo: 'Evento', Icone: Info }

// A Roleta não usa brindes: no lugar de Brindes e Sorteados, o painel mostra os resultados dos giros.
const ABAS = {
  sorteio: [
    ABA_PARTICIPANTES,
    { id: 'brindes', rotulo: 'Brindes', Icone: Gift },
    { id: 'sorteados', rotulo: 'Sorteados', Icone: Trophy },
    ABA_EVENTO,
  ],
  roleta: [
    { id: 'quem-gira', rotulo: 'Quem gira', Icone: UserCheck },
    ABA_PARTICIPANTES,
    { id: 'resultados', rotulo: 'Resultados', Icone: ListChecks },
    ABA_EVENTO,
  ],
}

// Tela do evento (#/evento/:id, ou #/evento/:id?modo=roleta): palco do sorteio ou roleta, e painel
// lateral. Quem só acompanha vê tudo, sem controles. O modo fica no endereço para a TV abrir direto.
export default function Sorteio() {
  const { id } = useParams()
  const { pessoa } = useAcesso()
  const { dados: evento, carregando, erro } = useEvento(id)
  const [parametros, setParametros] = useSearchParams()
  const modo = parametros.get('modo') === 'roleta' ? 'roleta' : 'sorteio'
  const [escolhida, setAba] = useState(null)
  const abas = ABAS[modo]
  const aba = abas.some((a) => a.id === escolhida) ? escolhida : abas[0].id
  const apresentacao = useApresentacao()
  const organiza = podeOrganizar(pessoa.papel)
  const podeMexer = organiza && evento?.status === 'aberto'

  return (
    <section className="pagina">
      <Link to="/eventos" className="voltar">
        <ArrowLeft aria-hidden="true" />
        Eventos
      </Link>
      {carregando && <CarregandoBloco />}
      {erro && <p className="aviso aviso--erro">{mensagemDeErro(erro)}</p>}
      {!carregando && !erro && !evento && <p className="aviso aviso--erro">Evento não encontrado. Ele pode ter sido excluído.</p>}
      {evento && (
        <div className="abas abas--modos" role="tablist" aria-label="Sorteio ou roleta" hidden={apresentacao.ativo}>
          {MODOS.map(({ id: idModo, rotulo, Icone }) => (
            <button
              key={idModo}
              type="button"
              role="tab"
              aria-selected={modo === idModo}
              className={`abas__item ${modo === idModo ? 'ativo' : ''}`}
              onClick={() => setParametros(idModo === 'roleta' ? { modo: 'roleta' } : {}, { replace: true })}
            >
              <Icone aria-hidden="true" />
              {rotulo}
            </button>
          ))}
        </div>
      )}
      {evento && (
        <div className={`sorteio ${apresentacao.ativo ? 'sorteio--apresentando' : ''}`}>
          {modo === 'roleta' ? (
            <Roleta key={evento.id} evento={evento} podeGirar={podeMexer} apresentacao={apresentacao} />
          ) : (
            <Palco key={evento.id} evento={evento} podeSortear={podeMexer} apresentacao={apresentacao} />
          )}
          <aside className="painel-lateral" aria-label="Painel do evento" hidden={apresentacao.ativo}>
            <div className="abas abas--painel" role="tablist">
              {abas.map(({ id: idAba, rotulo, Icone }) => (
                <button
                  key={idAba}
                  type="button"
                  role="tab"
                  aria-selected={aba === idAba}
                  className={`abas__item ${aba === idAba ? 'ativo' : ''}`}
                  onClick={() => setAba(idAba)}
                >
                  <Icone aria-hidden="true" />
                  {rotulo}
                </button>
              ))}
            </div>
            {evento.status === 'encerrado' && organiza && aba !== 'evento' && (
              <p className="aviso">
                {modo === 'roleta'
                  ? 'Evento encerrado. Para mudar participantes ou girar a roleta, reabra o evento.'
                  : 'Evento encerrado. Para mudar participantes, brindes ou sorteados, reabra o evento.'}
              </p>
            )}
            {aba === 'quem-gira' && <AbaQuemGira evento={evento} podeMexer={podeMexer} />}
            {aba === 'participantes' && <AbaParticipantes evento={evento} podeMexer={podeMexer} modo={modo} />}
            {aba === 'brindes' && <AbaBrindes evento={evento} podeMexer={podeMexer} />}
            {aba === 'sorteados' && <AbaSorteados evento={evento} podeMexer={podeMexer} />}
            {aba === 'resultados' && <AbaResultados evento={evento} podeMexer={podeMexer} />}
            {aba === 'evento' && <AbaEvento evento={evento} podeOrganizar={organiza} />}
          </aside>
        </div>
      )}
    </section>
  )
}

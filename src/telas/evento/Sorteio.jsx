import { useState } from 'react'
import { ArrowLeft, Gift, Info, Trophy, Users } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { useAcesso } from '../../acesso/ProvedorAcesso.jsx'
import CarregandoBloco from '../../componentes/CarregandoBloco.jsx'
import { useEvento } from '../../dados/eventos.js'
import { mensagemDeErro } from '../../lib/erros.js'
import { numerosDoEvento } from '../../lib/eventos.js'
import { podeOrganizar } from '../../lib/papeis.js'
import AbaBrindes from './AbaBrindes.jsx'
import AbaEvento from './AbaEvento.jsx'
import AbaParticipantes from './AbaParticipantes.jsx'
import AbaSorteados from './AbaSorteados.jsx'

const ABAS = [
  { id: 'participantes', rotulo: 'Participantes', Icone: Users },
  { id: 'brindes', rotulo: 'Brindes', Icone: Gift },
  { id: 'sorteados', rotulo: 'Sorteados', Icone: Trophy },
  { id: 'evento', rotulo: 'Evento', Icone: Info },
]

// Tela do sorteio (#/evento/:id): palco e painel lateral. Quem só acompanha vê tudo, sem controles.
export default function Sorteio() {
  const { id } = useParams()
  const { pessoa } = useAcesso()
  const { dados: evento, carregando, erro } = useEvento(id)
  const [aba, setAba] = useState('participantes')
  const organiza = podeOrganizar(pessoa.papel)

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
        <div className="sorteio">
          <PalcoProvisorio evento={evento} />
          <aside className="painel-lateral" aria-label="Painel do evento">
            <div className="abas abas--painel" role="tablist">
              {ABAS.map(({ id: idAba, rotulo, Icone }) => (
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
              <p className="aviso">Evento encerrado. Para mudar participantes, brindes ou sorteados, reabra o evento.</p>
            )}
            {aba === 'participantes' && <AbaParticipantes evento={evento} podeMexer={organiza && evento.status === 'aberto'} />}
            {aba === 'brindes' && <AbaBrindes evento={evento} podeMexer={organiza && evento.status === 'aberto'} />}
            {aba === 'sorteados' && <AbaSorteados evento={evento} />}
            {aba === 'evento' && <AbaEvento evento={evento} podeOrganizar={organiza} />}
          </aside>
        </div>
      )}
    </section>
  )
}

// Provisório: o palco do sorteio chega na Fase 5. Sem mascotes no palco.
function PalcoProvisorio({ evento }) {
  const n = numerosDoEvento(evento)
  return (
    <div className="palco">
      <h1 className="palco__titulo">{evento.titulo}</h1>
      <p className="palco__aviso">O palco do sorteio chega na próxima fase.</p>
      <dl className="palco__numeros">
        <div>
          <dt>Na disputa</dt>
          <dd>{n.naDisputa}</dd>
        </div>
        <div>
          <dt>Sorteados</dt>
          <dd>{n.sorteados}</dd>
        </div>
        <div>
          <dt>Participantes</dt>
          <dd>{n.participantes}</dd>
        </div>
      </dl>
    </div>
  )
}

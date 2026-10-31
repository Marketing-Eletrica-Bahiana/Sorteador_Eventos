import { useState } from 'react'
import { ArrowLeft, Gift, Info, Trophy, Users } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { useAcesso } from '../../acesso/ProvedorAcesso.jsx'
import CarregandoBloco from '../../componentes/CarregandoBloco.jsx'
import { useEvento } from '../../dados/eventos.js'
import { useApresentacao } from '../../hooks/useApresentacao.js'
import { mensagemDeErro } from '../../lib/erros.js'
import { podeOrganizar } from '../../lib/papeis.js'
import AbaBrindes from './AbaBrindes.jsx'
import AbaEvento from './AbaEvento.jsx'
import AbaParticipantes from './AbaParticipantes.jsx'
import AbaSorteados from './AbaSorteados.jsx'
import Palco from './Palco.jsx'

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
        <div className={`sorteio ${apresentacao.ativo ? 'sorteio--apresentando' : ''}`}>
          <Palco key={evento.id} evento={evento} podeSortear={podeMexer} apresentacao={apresentacao} />
          <aside className="painel-lateral" aria-label="Painel do evento" hidden={apresentacao.ativo}>
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
            {aba === 'participantes' && <AbaParticipantes evento={evento} podeMexer={podeMexer} />}
            {aba === 'brindes' && <AbaBrindes evento={evento} podeMexer={podeMexer} />}
            {aba === 'sorteados' && <AbaSorteados evento={evento} podeMexer={podeMexer} />}
            {aba === 'evento' && <AbaEvento evento={evento} podeOrganizar={organiza} />}
          </aside>
        </div>
      )}
    </section>
  )
}

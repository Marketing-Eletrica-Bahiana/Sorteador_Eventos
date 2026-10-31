import { ArrowLeft, CalendarDays } from 'lucide-react'
import { Link } from 'react-router'
import CarregandoBloco from '../../componentes/CarregandoBloco.jsx'
import { formatarData } from '../../lib/datas.js'
import { mensagemDeErro } from '../../lib/erros.js'
import { numerosDoEvento, STATUS } from '../../lib/eventos.js'

// Provisória: mostra o evento enquanto o palco (Fase 5) e a dashboard (Fase 6) não chegam.
// Sem mascotes: elas nunca aparecem no palco nem na dashboard.
export default function EventoProvisorio({ consulta, Icone, aviso }) {
  const { dados: evento, carregando, erro } = consulta

  return (
    <section className="pagina">
      <Link to="/eventos" className="voltar">
        <ArrowLeft aria-hidden="true" />
        Eventos
      </Link>
      {carregando && <CarregandoBloco />}
      {erro && <p className="aviso aviso--erro">{mensagemDeErro(erro)}</p>}
      {!carregando && !erro && !evento && (
        <p className="aviso aviso--erro">Evento não encontrado. Ele pode ter sido excluído.</p>
      )}
      {evento && <Resumo evento={evento} Icone={Icone} aviso={aviso} />}
    </section>
  )
}

function Resumo({ evento, Icone, aviso }) {
  const n = numerosDoEvento(evento)
  return (
    <>
      <header className="pagina__cabecalho">
        <h1 className="titulo-pagina">
          <Icone aria-hidden="true" />
          {evento.titulo}
        </h1>
        <div className="linha-circuito" aria-hidden="true" />
      </header>
      <div className="bloco">
        <div className="cartao-evento__topo">
          <span className={`etiqueta etiqueta--${evento.status}`}>{STATUS[evento.status]?.rotulo ?? evento.status}</span>
          <span className="cartao-evento__data">
            <CalendarDays aria-hidden="true" />
            {formatarData(evento.data)}
          </span>
        </div>
        {evento.descricao && <p>{evento.descricao}</p>}
        <dl className="ficha">
          <div>
            <dt>Participantes</dt>
            <dd>{n.participantes}</dd>
          </div>
          <div>
            <dt>Na disputa</dt>
            <dd>{n.naDisputa}</dd>
          </div>
          <div>
            <dt>Sorteados</dt>
            <dd>{n.sorteados}</dd>
          </div>
          <div>
            <dt>Brindes entregues</dt>
            <dd>{n.brindesEntregues}</dd>
          </div>
        </dl>
        <p className="texto-suave">{aviso}</p>
      </div>
    </>
  )
}

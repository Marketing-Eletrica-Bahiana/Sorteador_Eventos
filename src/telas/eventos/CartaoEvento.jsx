import { CalendarDays, ChartColumn, Copy, Pencil, Sparkles, Trash2 } from 'lucide-react'
import { Link } from 'react-router'
import { formatarData } from '../../lib/datas.js'
import { numerosDoEvento, STATUS } from '../../lib/eventos.js'

const numero = (n) => n.toLocaleString('pt-BR')

// Cartão da visão geral. Os botões de editar, duplicar e excluir só aparecem para quem pode usar.
export default function CartaoEvento({ evento, podeOrganizar, podeExcluir, aoEditar, aoDuplicar, aoExcluir }) {
  const n = numerosDoEvento(evento)
  const porcentagem = Math.round(n.progresso * 100)

  return (
    <article className={`cartao cartao-evento cartao-evento--${evento.status}`}>
      <header className="cartao-evento__topo">
        <span className={`etiqueta etiqueta--${evento.status}`}>{STATUS[evento.status]?.rotulo ?? evento.status}</span>
        <span className="cartao-evento__data">
          <CalendarDays aria-hidden="true" />
          {formatarData(evento.data)}
        </span>
      </header>

      <div className="cartao-evento__texto">
        <h2 className="cartao-evento__titulo">{evento.titulo}</h2>
        {evento.descricao && <p className="cartao-evento__descricao">{evento.descricao}</p>}
      </div>

      <dl className="cartao-evento__numeros">
        <div>
          <dt>Participantes</dt>
          <dd>{numero(n.participantes)}</dd>
        </div>
        <div>
          <dt>Sorteados</dt>
          <dd>{numero(n.sorteados)}</dd>
        </div>
        <div>
          <dt>Brindes entregues</dt>
          <dd>{numero(n.brindesEntregues)}</dd>
        </div>
      </dl>

      <div className="cartao-evento__progresso">
        <div
          className="barra-progresso"
          role="progressbar"
          aria-label="Participantes já sorteados"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={porcentagem}
        >
          <div style={{ width: `${porcentagem}%` }} />
        </div>
        <span className="texto-pequeno texto-suave">
          {n.participantes
            ? `${numero(n.participantes - n.naDisputa)} de ${numero(n.participantes)} sorteados (${porcentagem}%)`
            : 'Nenhum participante ainda'}
        </span>
      </div>

      <footer className="cartao-evento__acoes">
        <Link className="botao botao--principal" to={`/evento/${evento.id}`}>
          <Sparkles aria-hidden="true" />
          Abrir sorteio
        </Link>
        <Link className="botao botao--secundario" to={`/evento/${evento.id}/painel`}>
          <ChartColumn aria-hidden="true" />
          Dashboard
        </Link>
        {podeOrganizar && (
          <div className="acoes acoes--juntas cartao-evento__gestao">
            <button type="button" className="botao-icone" onClick={aoEditar} aria-label={`Editar ${evento.titulo}`} title="Editar">
              <Pencil aria-hidden="true" />
            </button>
            <button
              type="button"
              className="botao-icone"
              onClick={aoDuplicar}
              aria-label={`Duplicar ${evento.titulo}`}
              title="Duplicar"
            >
              <Copy aria-hidden="true" />
            </button>
            {podeExcluir && (
              <button
                type="button"
                className="botao-icone botao-icone--perigo"
                onClick={aoExcluir}
                aria-label={`Excluir ${evento.titulo}`}
                title="Excluir"
              >
                <Trash2 aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </footer>
    </article>
  )
}

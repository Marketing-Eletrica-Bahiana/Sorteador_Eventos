import { useState } from 'react'
import { ChartColumn, Pencil } from 'lucide-react'
import { Link } from 'react-router'
import { useAvisos } from '../../componentes/Avisos.jsx'
import { editarEvento } from '../../dados/eventos.js'
import { formatarData, formatarDataDoMomento } from '../../lib/datas.js'
import { STATUS } from '../../lib/eventos.js'
import FormEvento from '../eventos/FormEvento.jsx'

// Aba Evento do painel lateral: dados do evento e ações gerais.
export default function AbaEvento({ evento, podeOrganizar }) {
  const { executar } = useAvisos()
  const [editando, setEditando] = useState(false)

  return (
    <div className="aba-painel">
      <dl className="ficha ficha--coluna">
        <div>
          <dt>Situação</dt>
          <dd>
            <span className={`etiqueta etiqueta--${evento.status}`}>{STATUS[evento.status]?.rotulo ?? evento.status}</span>
          </dd>
        </div>
        <div>
          <dt>Data</dt>
          <dd>{formatarData(evento.data)}</dd>
        </div>
        {evento.descricao && (
          <div>
            <dt>Descrição</dt>
            <dd className="ficha__texto">{evento.descricao}</dd>
          </div>
        )}
        <div>
          <dt>Criado por</dt>
          <dd>
            {evento.criadoPorNome}
            {evento.criadoEm && ` em ${formatarDataDoMomento(evento.criadoEm)}`}
          </dd>
        </div>
        {evento.encerradoEm && (
          <div>
            <dt>Encerrado em</dt>
            <dd>{formatarDataDoMomento(evento.encerradoEm)}</dd>
          </div>
        )}
      </dl>

      <div className="acoes acoes--inicio">
        {podeOrganizar && (
          <button type="button" className="botao botao--secundario" onClick={() => setEditando(true)}>
            <Pencil aria-hidden="true" />
            Editar dados
          </button>
        )}
        <Link className="botao botao--secundario" to={`/evento/${evento.id}/painel`}>
          <ChartColumn aria-hidden="true" />
          Dashboard
        </Link>
      </div>

      <FormEvento
        edicao={editando ? { modo: 'editar', evento } : null}
        aoSalvar={(campos) => executar(() => editarEvento(evento.id, campos), 'Evento atualizado.')}
        aoFechar={() => setEditando(false)}
      />
    </div>
  )
}

import { useState } from 'react'
import { ChartColumn, Flag, Pencil, RotateCcw, Unlock } from 'lucide-react'
import { Link } from 'react-router'
import { useAvisos } from '../../componentes/Avisos.jsx'
import { useConfirmar } from '../../componentes/Confirmar.jsx'
import { encerrarEvento, reabrirEvento, recomecarSorteio } from '../../dados/acoesDoEvento.js'
import { editarEvento } from '../../dados/eventos.js'
import { formatarData, formatarDataDoMomento } from '../../lib/datas.js'
import { numerosDoEvento, STATUS } from '../../lib/eventos.js'
import FormEvento from '../eventos/FormEvento.jsx'

// Aba Evento do painel lateral: dados do evento e ações gerais (recomeçar, encerrar, reabrir).
export default function AbaEvento({ evento, podeOrganizar }) {
  const { executar } = useAvisos()
  const [janelaConfirmar, confirmar] = useConfirmar()
  const [editando, setEditando] = useState(false)
  const aberto = evento.status === 'aberto'
  const n = numerosDoEvento(evento)

  async function recomecarTudo() {
    const sim = await confirmar({
      titulo: 'Recomeçar o sorteio',
      texto: `Os ${n.sorteados} sorteados voltam para a disputa e os brindes voltam para o estoque. A lista de participantes e os brindes continuam. Não dá para desfazer.`,
      botao: 'Recomeçar',
      perigo: true,
    })
    if (sim) executar(() => recomecarSorteio(evento.id), 'Sorteio recomeçado. Todo mundo está na disputa de novo.')
  }

  async function encerrar() {
    const sim = await confirmar({
      titulo: 'Encerrar o evento',
      texto: 'O sorteio para e o evento fica só para consulta. Dá para reabrir depois, se precisar.',
      botao: 'Encerrar evento',
    })
    if (sim) executar(() => encerrarEvento(evento.id), 'Evento encerrado. Valeu, time!')
  }

  async function reabrir() {
    const sim = await confirmar({
      titulo: 'Reabrir o evento',
      texto: 'O evento volta a aceitar sorteios e mudanças em participantes e brindes.',
      botao: 'Reabrir',
    })
    if (sim) executar(() => reabrirEvento(evento.id), 'Evento reaberto.')
  }

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

      {podeOrganizar && (
        <div className="acoes acoes--inicio aba-painel__perigo">
          {aberto && n.sorteados > 0 && (
            <button type="button" className="botao botao--secundario botao--perigo-claro" onClick={recomecarTudo}>
              <RotateCcw aria-hidden="true" />
              Recomeçar
            </button>
          )}
          {aberto ? (
            <button type="button" className="botao botao--principal" onClick={encerrar}>
              <Flag aria-hidden="true" />
              Encerrar evento
            </button>
          ) : (
            <button type="button" className="botao botao--secundario" onClick={reabrir}>
              <Unlock aria-hidden="true" />
              Reabrir evento
            </button>
          )}
        </div>
      )}

      <FormEvento
        edicao={editando ? { modo: 'editar', evento } : null}
        aoSalvar={(campos) => executar(() => editarEvento(evento.id, campos), 'Evento atualizado.')}
        aoFechar={() => setEditando(false)}
      />
      {janelaConfirmar}
    </div>
  )
}

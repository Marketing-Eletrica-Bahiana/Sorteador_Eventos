import { useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { useAvisos } from '../../componentes/Avisos.jsx'
import BotaoPlanilha from '../../componentes/BotaoPlanilha.jsx'
import { useConfirmar } from '../../componentes/Confirmar.jsx'
import { recomecarGiros } from '../../dados/acoesDoEvento.js'
import { useRevelacaoDaRoleta } from '../../hooks/useRevelacao.js'
import { formatarHora } from '../../lib/datas.js'
import { eventoAteOGiro, listaDeGiros, numerosDaRoleta, RESULTADOS } from '../../lib/roleta.js'

const MOSTRAR_ATE = 300
const FILTROS = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'ganhou', rotulo: 'Ganharam' },
  { id: 'nao_ganhou', rotulo: 'Não ganharam' },
]
const numero = (n) => n.toLocaleString('pt-BR')

// Aba Resultados do painel lateral, na Roleta: os giros, do mais recente para o primeiro. Usa o mesmo
// tempo da roda, para o resultado não aparecer aqui antes de ela parar.
export default function AbaResultados({ evento, podeMexer }) {
  const { executar } = useAvisos()
  const [janelaConfirmar, confirmar] = useConfirmar()
  const [filtro, setFiltro] = useState('todos')
  const revelacao = useRevelacaoDaRoleta((evento.giros ?? []).length)
  const visivel = useMemo(() => eventoAteOGiro(evento, revelacao.rodada), [evento, revelacao.rodada])
  const n = numerosDaRoleta(visivel)
  const giros = useMemo(() => {
    const lista = listaDeGiros(visivel).reverse()
    return filtro === 'todos' ? lista : lista.filter((g) => g.resultado === filtro)
  }, [visivel, filtro])

  async function recomecar() {
    const sim = await confirmar({
      titulo: 'Recomeçar a roleta',
      texto: `${numero(n.giros)} ${n.giros === 1 ? 'giro é apagado' : 'giros são apagados'} e todo mundo pode girar de novo. A lista de participantes continua. Não dá para desfazer.`,
      botao: 'Recomeçar',
      perigo: true,
    })
    if (sim) executar(() => recomecarGiros(evento.id), 'Roleta recomeçada. Todo mundo pode girar de novo.')
  }

  return (
    <div className="aba-painel">
      <div className="aba-painel__topo">
        <p className="aba-painel__resumo">
          <strong>
            {numero(n.ganharam)} {n.ganharam === 1 ? 'ganhou' : 'ganharam'}
          </strong>
          <span className="texto-suave">
            {' '}
            · {numero(n.naoGanharam)} não {n.naoGanharam === 1 ? 'ganhou' : 'ganharam'} · {numero(n.faltam)}{' '}
            {n.faltam === 1 ? 'falta girar' : 'faltam girar'}
          </span>
        </p>
        <BotaoPlanilha evento={evento} className="botao botao--secundario botao--pequeno" />
      </div>

      {n.giros > 0 && (
        <div className="segmentos segmentos--pequeno" role="group" aria-label="Filtrar resultados">
          {FILTROS.map(({ id, rotulo }) => (
            <button
              key={id}
              type="button"
              className={`segmentos__opcao ${filtro === id ? 'escolhido' : ''}`}
              aria-pressed={filtro === id}
              onClick={() => setFiltro(id)}
            >
              {rotulo}
            </button>
          ))}
        </div>
      )}

      {n.giros === 0 ? (
        <p className="texto-suave">Ninguém girou a roleta ainda.</p>
      ) : giros.length === 0 ? (
        <p className="texto-suave">Ninguém com esse resultado ainda.</p>
      ) : (
        <ol className="lista-painel">
          {giros.slice(0, MOSTRAR_ATE).map((g) => (
            <li key={g.numero} className="lista-painel__item">
              <span className="lista-painel__ordem">{g.numero}</span>
              <div className="lista-painel__texto">
                <span className="lista-painel__nome">{g.nome}</span>
                <span className="texto-pequeno texto-suave">{formatarHora(g.em)}</span>
              </div>
              <span className={`etiqueta etiqueta--${g.resultado}`}>{RESULTADOS[g.resultado].rotulo}</span>
            </li>
          ))}
        </ol>
      )}
      {giros.length > MOSTRAR_ATE && (
        <p className="texto-suave texto-pequeno">
          Mostrando {numero(MOSTRAR_ATE)} de {numero(giros.length)}. A planilha traz todos.
        </p>
      )}

      {podeMexer && n.giros > 0 && (
        <button type="button" className="botao botao--secundario botao--perigo-claro" onClick={recomecar}>
          <RotateCcw aria-hidden="true" />
          Recomeçar a roleta
        </button>
      )}
      {janelaConfirmar}
    </div>
  )
}

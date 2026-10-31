import { useMemo } from 'react'
import { useAvisos } from '../../componentes/Avisos.jsx'
import BotaoPlanilha from '../../componentes/BotaoPlanilha.jsx'
import { trocarBrindeDoSorteado } from '../../dados/acoesDoEvento.js'
import { estoqueDosBrindes } from '../../lib/brindes.js'
import { formatarHora } from '../../lib/datas.js'
import { listaDeSorteados } from '../../lib/sorteio.js'

// Aba Sorteados do painel lateral: quem já saiu, do mais recente para o primeiro. Quem organiza
// pode trocar o brinde de alguém (só entre os brindes que ainda têm estoque).
export default function AbaSorteados({ evento, podeMexer }) {
  const { executar } = useAvisos()
  const sorteados = useMemo(() => listaDeSorteados(evento).reverse(), [evento])
  const estoque = useMemo(() => estoqueDosBrindes(evento), [evento])
  const temBrindes = estoque.length > 0

  function trocar(sorteado, valor) {
    const novo = valor || null
    executar(() => trocarBrindeDoSorteado(evento.id, sorteado.id, novo), `Brinde de ${sorteado.nome} trocado.`)
  }

  return (
    <div className="aba-painel">
      <div className="aba-painel__topo">
        <p className="aba-painel__resumo">
          <strong>
            {sorteados.length.toLocaleString('pt-BR')} sorteado{sorteados.length === 1 ? '' : 's'}
          </strong>
        </p>
        <BotaoPlanilha evento={evento} className="botao botao--secundario botao--pequeno" />
      </div>
      {sorteados.length === 0 ? (
        <p className="texto-suave">Ninguém foi sorteado ainda.</p>
      ) : (
        <ol className="lista-painel">
          {sorteados.map((s) => (
            <li key={s.id} className="lista-painel__item">
              <span className="lista-painel__ordem">{s.numero}</span>
              <div className="lista-painel__texto">
                <span className="lista-painel__nome">{s.nome}</span>
                {podeMexer && temBrindes ? (
                  <label className="lista-painel__troca">
                    <span className="texto-pequeno texto-suave">
                      Rodada {s.rodada} · {formatarHora(s.em)} · brinde:
                    </span>
                    <select value={s.brinde ?? ''} onChange={(e) => trocar(s, e.target.value)} aria-label={`Brinde de ${s.nome}`}>
                      <option value="">Sem brinde</option>
                      {estoque
                        .filter((b) => b.nome === s.brinde || !b.esgotado)
                        .map((b) => (
                          <option key={b.nome} value={b.nome}>
                            {b.nome}
                          </option>
                        ))}
                    </select>
                  </label>
                ) : (
                  <span className="texto-pequeno texto-suave">
                    {s.brinde ?? 'Sem brinde'} · rodada {s.rodada} · {formatarHora(s.em)}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

import { useMemo } from 'react'
import { formatarHora } from '../../lib/datas.js'
import { listaDeSorteados } from '../../lib/sorteio.js'

// Aba Sorteados do painel lateral: quem já saiu, do mais recente para o primeiro.
export default function AbaSorteados({ evento }) {
  const sorteados = useMemo(() => listaDeSorteados(evento).reverse(), [evento])

  return (
    <div className="aba-painel">
      <p className="aba-painel__resumo">
        <strong>
          {sorteados.length.toLocaleString('pt-BR')} sorteado{sorteados.length === 1 ? '' : 's'}
        </strong>
      </p>
      {sorteados.length === 0 ? (
        <p className="texto-suave">Ninguém foi sorteado ainda.</p>
      ) : (
        <ol className="lista-painel">
          {sorteados.map((s) => (
            <li key={s.id} className="lista-painel__item">
              <span className="lista-painel__ordem">{s.numero}</span>
              <div className="lista-painel__texto">
                <span className="lista-painel__nome">{s.nome}</span>
                <span className="texto-pequeno texto-suave">
                  {s.brinde ?? 'Sem brinde'} · rodada {s.rodada} · {formatarHora(s.em)}
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

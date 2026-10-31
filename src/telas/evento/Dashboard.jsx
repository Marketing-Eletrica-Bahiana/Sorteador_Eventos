import { useMemo } from 'react'
import { ArrowLeft, CalendarDays, ChartColumn, Gift, Maximize, Minimize, Sparkles, Trophy } from 'lucide-react'
import { Link, useParams } from 'react-router'
import CarregandoBloco from '../../componentes/CarregandoBloco.jsx'
import Indicadores from '../../componentes/Indicadores.jsx'
import Logo from '../../componentes/Logo.jsx'
import { useEvento } from '../../dados/eventos.js'
import { useApresentacao } from '../../hooks/useApresentacao.js'
import { useMovimentoReduzido } from '../../hooks/useMovimentoReduzido.js'
import { useRevelacao } from '../../hooks/useRevelacao.js'
import { estoqueDosBrindes, resumoDosBrindes } from '../../lib/brindes.js'
import { formatarData, formatarHora } from '../../lib/datas.js'
import { mensagemDeErro } from '../../lib/erros.js'
import { numerosDoEvento, STATUS } from '../../lib/eventos.js'
import { listaDeSorteados, ultimaRodada } from '../../lib/sorteio.js'

const ULTIMOS = 12
const numero = (n) => n.toLocaleString('pt-BR')

// Dashboard do evento (#/evento/:id/painel), em tempo real. Sem mascotes.
export default function Dashboard() {
  const { id } = useParams()
  const { dados: evento, carregando, erro } = useEvento(id)
  const apresentacao = useApresentacao()

  return (
    <section className={`pagina ${apresentacao.ativo ? 'painel-tv' : ''}`}>
      {!apresentacao.ativo && (
        <Link to="/eventos" className="voltar">
          <ArrowLeft aria-hidden="true" />
          Eventos
        </Link>
      )}
      {carregando && <CarregandoBloco />}
      {erro && <p className="aviso aviso--erro">{mensagemDeErro(erro)}</p>}
      {!carregando && !erro && !evento && <p className="aviso aviso--erro">Evento não encontrado. Ele pode ter sido excluído.</p>}
      {evento && <Painel key={evento.id} evento={evento} apresentacao={apresentacao} />}
    </section>
  )
}

function Painel({ evento, apresentacao }) {
  const reduzido = useMovimentoReduzido()
  // Mesmo tempo do palco: um nome novo só aparece aqui quando o palco revela (sem estragar a surpresa
  // se a dashboard estiver numa TV na mesma sala do telão).
  const revelacao = useRevelacao(ultimaRodada(evento), reduzido)
  const visivel = useMemo(
    () => ({ ...evento, sorteados: (evento.sorteados ?? []).filter((s) => s.rodada <= revelacao.rodada) }),
    [evento, revelacao.rodada],
  )

  const n = numerosDoEvento(visivel)
  const brindes = resumoDosBrindes(visivel)
  const estoque = useMemo(() => estoqueDosBrindes(visivel), [visivel])
  const ultimos = useMemo(() => listaDeSorteados(visivel).reverse().slice(0, ULTIMOS), [visivel])

  return (
    <>
      <header className="pagina__cabecalho">
        <div className="pagina__linha">
          <div className="painel__titulo">
            <h1 className="titulo-pagina">
              <ChartColumn aria-hidden="true" />
              {evento.titulo}
            </h1>
            <span className="cartao-evento__data">
              <CalendarDays aria-hidden="true" />
              {formatarData(evento.data)}
              <span className={`etiqueta etiqueta--${evento.status}`}>{STATUS[evento.status]?.rotulo ?? evento.status}</span>
            </span>
          </div>
          <div className="acoes">
            {apresentacao.ativo && <Logo formato="linha" cor="branco" altura={32} className="so-largo" />}
            {!apresentacao.ativo && (
              <Link className="botao botao--secundario" to={`/evento/${evento.id}`}>
                <Sparkles aria-hidden="true" />
                Abrir sorteio
              </Link>
            )}
            <button
              type="button"
              className={`botao ${apresentacao.ativo ? 'botao--claro' : 'botao--principal'}`}
              onClick={apresentacao.ativo ? apresentacao.sair : apresentacao.entrar}
            >
              {apresentacao.ativo ? <Minimize aria-hidden="true" /> : <Maximize aria-hidden="true" />}
              {apresentacao.ativo ? 'Sair' : 'Apresentar'}
            </button>
          </div>
        </div>
        <div className="linha-circuito" aria-hidden="true" />
      </header>

      <Indicadores
        grande={apresentacao.ativo}
        itens={[
          { rotulo: 'Participantes', valor: numero(n.participantes) },
          { rotulo: 'Sorteados', valor: numero(n.sorteados) },
          { rotulo: 'Na disputa', valor: numero(n.naDisputa) },
          { rotulo: 'Brindes entregues', valor: numero(brindes.entregues) },
          {
            rotulo: 'Brindes restantes',
            valor: brindes.tipos === 0 ? '0' : brindes.semLimite ? 'Sem limite' : numero(brindes.restantes),
            detalhe: brindes.semLimite && brindes.tipos ? 'algum brinde não tem limite' : undefined,
          },
        ]}
      />

      <div className="painel__grade">
        <section className="bloco">
          <h2 className="bloco__titulo">
            <Gift aria-hidden="true" />
            Estoque de brindes
          </h2>
          {estoque.length === 0 ? (
            <p className="texto-suave">Nenhum brinde cadastrado. O sorteio está só com nomes.</p>
          ) : (
            <ul className="estoque">
              {estoque.map((b) => (
                <li key={b.nome} className="estoque__item">
                  <div className="estoque__linha">
                    <strong>{b.nome}</strong>
                    {b.esgotado ? (
                      <span className="etiqueta etiqueta--encerrado">Acabou</span>
                    ) : (
                      <span className="estoque__numeros">
                        {numero(b.entregues)} entregue{b.entregues === 1 ? '' : 's'} ·{' '}
                        {b.qtd == null ? 'sem limite' : `${numero(b.restantes)} restante${b.restantes === 1 ? '' : 's'}`}
                      </span>
                    )}
                  </div>
                  {b.qtd != null && (
                    <div
                      className="barra-progresso"
                      role="progressbar"
                      aria-label={`${b.nome}: entregues`}
                      aria-valuemin={0}
                      aria-valuemax={b.qtd}
                      aria-valuenow={b.entregues}
                    >
                      <div style={{ width: `${Math.round((b.entregues / b.qtd) * 100)}%` }} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bloco">
          <h2 className="bloco__titulo">
            <Trophy aria-hidden="true" />
            Últimos sorteados
            {revelacao.fase === 'girando' && <span className="etiqueta etiqueta--aberto painel__sorteando">Sorteando...</span>}
          </h2>
          {ultimos.length === 0 ? (
            <p className="texto-suave">Ninguém foi sorteado ainda.</p>
          ) : (
            <ol className="ultimos" aria-live="polite">
              {ultimos.map((s) => {
                const agora = s.rodada === revelacao.rodada
                return (
                  <li key={s.id} className={`ultimos__item ${agora ? 'ultimos__item--agora' : ''}`}>
                    <span className="lista-painel__ordem">{s.numero}</span>
                    <div className="ultimos__texto">
                      <strong>{s.nome}</strong>
                      <span>{s.brinde ?? 'Sem brinde'}</span>
                    </div>
                    {agora && <span className="etiqueta etiqueta--aberto">Acabou de sair</span>}
                    <span className="ultimos__hora">{formatarHora(s.em)}</span>
                  </li>
                )
              })}
            </ol>
          )}
        </section>
      </div>
    </>
  )
}

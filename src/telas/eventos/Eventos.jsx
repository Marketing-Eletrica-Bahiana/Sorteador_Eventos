import { useMemo, useState } from 'react'
import { Plus, Search, Ticket } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useAcesso } from '../../acesso/ProvedorAcesso.jsx'
import { useAvisos } from '../../componentes/Avisos.jsx'
import CarregandoBloco from '../../componentes/CarregandoBloco.jsx'
import { useConfirmar } from '../../componentes/Confirmar.jsx'
import EstadoVazio from '../../componentes/EstadoVazio.jsx'
import Indicadores from '../../componentes/Indicadores.jsx'
import { criarEvento, editarEvento, excluirEvento, useEventos } from '../../dados/eventos.js'
import { mensagemDeErro } from '../../lib/erros.js'
import { filtrarEventos, FILTROS, indicadoresGerais, numerosDoEvento } from '../../lib/eventos.js'
import { podeExcluirEvento, podeOrganizar } from '../../lib/papeis.js'
import CartaoEvento from './CartaoEvento.jsx'
import FormEvento from './FormEvento.jsx'

const numero = (n) => n.toLocaleString('pt-BR')

// Visão geral dos eventos. Quem só acompanha vê tudo, sem os botões de criar, editar e excluir.
export default function Eventos() {
  const { pessoa } = useAcesso()
  const { executar } = useAvisos()
  const [janelaConfirmar, confirmar] = useConfirmar()
  const eventos = useEventos()
  const [filtro, setFiltro] = useState('todos')
  const [busca, setBusca] = useState('')
  const [edicao, setEdicao] = useState(null)
  const navegar = useNavigate()
  const organiza = podeOrganizar(pessoa.papel)
  const exclui = podeExcluirEvento(pessoa.papel)

  const totais = useMemo(() => indicadoresGerais(eventos.dados ?? []), [eventos.dados])
  const visiveis = useMemo(() => filtrarEventos(eventos.dados ?? [], filtro, busca), [eventos.dados, filtro, busca])

  async function salvar(campos) {
    if (edicao.modo === 'editar') return executar(() => editarEvento(edicao.evento.id, campos), 'Evento atualizado.')
    // Evento novo ou cópia: abre direto a tela dele para preparar participantes e brindes.
    const base = edicao.modo === 'duplicar' ? edicao.evento : null
    let novoId = null
    const deuCerto = await executar(
      async () => {
        novoId = await criarEvento(campos, pessoa, base)
      },
      base ? `"${campos.titulo.trim()}" criado a partir da cópia.` : 'Evento criado! Bora preparar o sorteio.',
    )
    if (deuCerto) navegar(`/evento/${novoId}`)
    return deuCerto
  }

  async function excluir(evento) {
    const n = numerosDoEvento(evento)
    const sim = await confirmar({
      titulo: 'Excluir evento',
      texto: `"${evento.titulo}" será apagado para sempre, com ${n.participantes} participante${n.participantes === 1 ? '' : 's'} e ${n.sorteados} sorteado${n.sorteados === 1 ? '' : 's'}. Não dá para desfazer.`,
      botao: 'Excluir evento',
      perigo: true,
    })
    if (sim) executar(() => excluirEvento(evento.id), 'Evento excluído.')
  }

  return (
    <section className="pagina">
      <header className="pagina__cabecalho">
        <div className="pagina__linha">
          <h1 className="titulo-pagina">
            <Ticket aria-hidden="true" />
            Eventos
          </h1>
          {organiza && (
            <button type="button" className="botao botao--principal" onClick={() => setEdicao({ modo: 'novo' })}>
              <Plus aria-hidden="true" />
              Novo evento
            </button>
          )}
        </div>
        <div className="linha-circuito" aria-hidden="true" />
      </header>

      {eventos.carregando && <CarregandoBloco />}
      {eventos.erro && <p className="aviso aviso--erro">{mensagemDeErro(eventos.erro)}</p>}

      {eventos.dados?.length === 0 && (
        <EstadoVazio
          titulo="Nenhum evento por aqui ainda"
          texto={
            organiza
              ? 'Crie o primeiro evento e prepare a lista de participantes e os brindes.'
              : 'Assim que a organização criar um evento, ele aparece aqui para você acompanhar.'
          }
        >
          {organiza && (
            <button type="button" className="botao botao--principal" onClick={() => setEdicao({ modo: 'novo' })}>
              <Plus aria-hidden="true" />
              Novo evento
            </button>
          )}
        </EstadoVazio>
      )}

      {eventos.dados?.length > 0 && (
        <>
          <Indicadores
            itens={[
              { rotulo: 'Total de eventos', valor: numero(totais.eventos) },
              { rotulo: 'Eventos abertos', valor: numero(totais.abertos) },
              { rotulo: 'Pessoas sorteadas', valor: numero(totais.pessoasSorteadas) },
              { rotulo: 'Brindes entregues', valor: numero(totais.brindesEntregues) },
            ]}
          />

          <div className="filtros">
            <div className="segmentos" role="group" aria-label="Situação dos eventos">
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
            <label className="campo campo--busca campo--compacto">
              <span className="campo__rotulo">Buscar</span>
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Nome ou descrição"
              />
              <Search aria-hidden="true" />
            </label>
          </div>

          {visiveis.length === 0 ? (
            <p className="aviso">Nenhum evento encontrado com esse filtro.</p>
          ) : (
            <div className="grade-eventos">
              {visiveis.map((evento) => (
                <CartaoEvento
                  key={evento.id}
                  evento={evento}
                  podeOrganizar={organiza}
                  podeExcluir={exclui}
                  aoEditar={() => setEdicao({ modo: 'editar', evento })}
                  aoDuplicar={() => setEdicao({ modo: 'duplicar', evento })}
                  aoExcluir={() => excluir(evento)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <FormEvento edicao={edicao} aoSalvar={salvar} aoFechar={() => setEdicao(null)} />
      {janelaConfirmar}
    </section>
  )
}

import { useMemo, useState } from 'react'
import { FileUp, LoaderCircle, Search, Trash2, UserPlus, X } from 'lucide-react'
import { useAvisos } from '../../componentes/Avisos.jsx'
import { useConfirmar } from '../../componentes/Confirmar.jsx'
import { adicionarParticipantes, apagarParticipantes, tirarParticipante } from '../../dados/acoesDoEvento.js'
import { buscarParticipantes, idsSorteados, LIMITE_DE_PARTICIPANTES, nomesDoTexto } from '../../lib/participantes.js'
import { EXTENSOES_ACEITAS, nomesDoArquivo } from '../../lib/planilha.js'

const MOSTRAR_ATE = 300
const numero = (n) => n.toLocaleString('pt-BR')
const plural = (n, um, varios) => `${numero(n)} ${n === 1 ? um : varios}`

function resumoDaInclusao({ adicionados, repetidos, foraDoLimite }) {
  const partes = [adicionados ? `${plural(adicionados, 'participante adicionado', 'participantes adicionados')}.` : 'Ninguém novo.']
  if (repetidos) partes.push(`${plural(repetidos, 'repetido ignorado', 'repetidos ignorados')}.`)
  if (foraDoLimite) partes.push(`${plural(foraDoLimite, 'ficou', 'ficaram')} de fora (limite de ${numero(LIMITE_DE_PARTICIPANTES)}).`)
  return partes.join(' ')
}

// Aba Participantes do painel lateral. Quem só acompanha vê a lista, sem os botões.
export default function AbaParticipantes({ evento, podeMexer }) {
  const { avisar, executar } = useAvisos()
  const [janelaConfirmar, confirmar] = useConfirmar()
  const [colados, setColados] = useState('')
  const [busca, setBusca] = useState('')
  const [ocupado, setOcupado] = useState('')

  const participantes = useMemo(() => evento.participantes ?? [], [evento.participantes])
  const sorteados = useMemo(() => idsSorteados(evento), [evento])
  const encontrados = useMemo(() => buscarParticipantes(participantes, busca), [participantes, busca])
  const naoSorteados = participantes.length - participantes.filter((p) => sorteados.has(p.id)).length

  async function incluir(nomes, origem) {
    if (!nomes.length) {
      avisar(`Nenhum nome encontrado ${origem}.`, 'erro')
      return false
    }
    let resumo = null
    const deuCerto = await executar(async () => {
      resumo = await adicionarParticipantes(evento.id, nomes)
    })
    if (deuCerto) avisar(resumoDaInclusao(resumo), resumo.adicionados ? 'ok' : 'erro')
    return deuCerto
  }

  async function adicionarColados(e) {
    e.preventDefault()
    setOcupado('colar')
    if (await incluir(nomesDoTexto(colados), 'no texto')) setColados('')
    setOcupado('')
  }

  async function importar(e) {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return
    setOcupado('arquivo')
    try {
      const { nomes, erro } = await nomesDoArquivo(arquivo.name, await arquivo.arrayBuffer())
      if (erro) avisar(erro, 'erro')
      else await incluir(nomes, 'no arquivo')
    } finally {
      setOcupado('')
    }
  }

  async function remover(participante) {
    executar(() => tirarParticipante(evento.id, participante.id), `${participante.nome} saiu da lista.`)
  }

  async function apagarTudo() {
    const sim = await confirmar({
      titulo: 'Apagar a lista',
      texto: `${plural(naoSorteados, 'participante que ainda não foi sorteado sai', 'participantes que ainda não foram sorteados saem')} da lista. Quem já foi sorteado continua.`,
      botao: 'Apagar a lista',
      perigo: true,
    })
    if (sim) executar(() => apagarParticipantes(evento.id), 'Lista apagada.')
  }

  return (
    <div className="aba-painel">
      <p className="aba-painel__resumo">
        <strong>{plural(participantes.length, 'participante', 'participantes')}</strong>
        <span className="texto-suave"> · {numero(naoSorteados)} na disputa</span>
      </p>

      {podeMexer && (
        <form className="formulario" onSubmit={adicionarColados}>
          <label className="campo">
            <span className="campo__rotulo">Colar nomes (um por linha)</span>
            <textarea rows={4} value={colados} onChange={(e) => setColados(e.target.value)} placeholder={'Ana Souza\nBruno Lima'} />
          </label>
          <div className="acoes acoes--inicio">
            <button type="submit" className="botao botao--principal" disabled={!colados.trim() || Boolean(ocupado)}>
              {ocupado === 'colar' ? <LoaderCircle className="girando" aria-hidden="true" /> : <UserPlus aria-hidden="true" />}
              Adicionar
            </button>
            <label className={`botao botao--secundario botao-arquivo ${ocupado ? 'botao--ocupado' : ''}`}>
              {ocupado === 'arquivo' ? <LoaderCircle className="girando" aria-hidden="true" /> : <FileUp aria-hidden="true" />}
              Importar arquivo
              <input type="file" accept={EXTENSOES_ACEITAS} onChange={importar} disabled={Boolean(ocupado)} />
            </label>
          </div>
          <span className="campo__ajuda">
            Arquivo .txt (um nome por linha), .csv ou .xlsx com a coluna "Nome" ou "Participante". Repetidos são
            ignorados, sem diferenciar acentos e maiúsculas. Até {numero(LIMITE_DE_PARTICIPANTES)} por evento.
          </span>
        </form>
      )}

      {participantes.length > 0 && (
        <label className="campo campo--busca">
          <span className="campo__rotulo">Buscar participante</span>
          <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome" />
          <Search aria-hidden="true" />
        </label>
      )}

      {participantes.length === 0 ? (
        <p className="texto-suave">Nenhum participante ainda.</p>
      ) : encontrados.length === 0 ? (
        <p className="texto-suave">Ninguém com esse nome na lista.</p>
      ) : (
        <ul className="lista-painel">
          {encontrados.slice(0, MOSTRAR_ATE).map((participante) => {
            const saiu = sorteados.has(participante.id)
            return (
              <li key={participante.id} className="lista-painel__item">
                <span className="lista-painel__nome">{participante.nome}</span>
                {saiu && <span className="etiqueta etiqueta--aberto">Sorteado</span>}
                {podeMexer && !saiu && (
                  <button
                    type="button"
                    className="botao-icone botao-icone--perigo"
                    onClick={() => remover(participante)}
                    aria-label={`Remover ${participante.nome}`}
                    title="Remover"
                  >
                    <X aria-hidden="true" />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {encontrados.length > MOSTRAR_ATE && (
        <p className="texto-suave texto-pequeno">
          Mostrando {numero(MOSTRAR_ATE)} de {numero(encontrados.length)}. Use a busca para achar alguém.
        </p>
      )}

      {podeMexer && naoSorteados > 0 && (
        <button type="button" className="botao botao--secundario botao--perigo-claro" onClick={apagarTudo}>
          <Trash2 aria-hidden="true" />
          Apagar a lista
        </button>
      )}
      {janelaConfirmar}
    </div>
  )
}

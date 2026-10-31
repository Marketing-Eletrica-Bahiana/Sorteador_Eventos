import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { useAvisos } from '../../componentes/Avisos.jsx'
import { ErroCampo } from '../../componentes/Campos.jsx'
import { useConfirmar } from '../../componentes/Confirmar.jsx'
import Janela from '../../componentes/Janela.jsx'
import { gravarBrinde, mudarOrdemDoBrinde, tirarBrinde } from '../../dados/acoesDoEvento.js'
import { estoqueDosBrindes, validarBrinde } from '../../lib/brindes.js'

const numero = (n) => n.toLocaleString('pt-BR')

function textoDoEstoque({ qtd, entregues, restantes }) {
  if (qtd == null) return `Sem limite · entregues: ${numero(entregues)}`
  const sobra = restantes === 0 ? 'acabou' : `sobra${restantes === 1 ? '' : 'm'} ${numero(restantes)}`
  return `Entregues: ${numero(entregues)} de ${numero(qtd)} · ${sobra}`
}

// Aba Brindes do painel lateral. A ordem da lista vale para as teclas 1 a 9 do palco.
export default function AbaBrindes({ evento, podeMexer }) {
  const { executar } = useAvisos()
  const [janelaConfirmar, confirmar] = useConfirmar()
  const [editando, setEditando] = useState(null)
  const estoque = useMemo(() => estoqueDosBrindes(evento), [evento])

  async function remover(brinde) {
    const sim = await confirmar({
      titulo: 'Remover brinde',
      texto: `"${brinde.nome}" sai da lista de brindes deste evento.`,
      botao: 'Remover',
      perigo: true,
    })
    if (sim) executar(() => tirarBrinde(evento.id, brinde.nome), 'Brinde removido.')
  }

  return (
    <div className="aba-painel">
      <p className="aba-painel__resumo">
        <strong>
          {numero(estoque.length)} brinde{estoque.length === 1 ? '' : 's'}
        </strong>
        <span className="texto-suave"> · quantidade em branco é sem limite</span>
      </p>

      {podeMexer && <FormBrinde evento={evento} />}

      {estoque.length === 0 ? (
        <p className="texto-suave">
          Nenhum brinde ainda. Sem brindes, o sorteio só mostra os nomes.
        </p>
      ) : (
        <ol className="lista-painel lista-painel--brindes">
          {estoque.map((brinde, i) => (
            <li key={brinde.nome} className={`lista-painel__item ${brinde.esgotado ? 'esgotado' : ''}`}>
              <span className="lista-painel__ordem" aria-hidden="true">
                {i + 1}
              </span>
              <div className="lista-painel__texto">
                <span className="lista-painel__nome">{brinde.nome}</span>
                <span className="texto-pequeno texto-suave">{textoDoEstoque(brinde)}</span>
              </div>
              {brinde.esgotado && <span className="etiqueta etiqueta--alerta">Acabou</span>}
              {podeMexer && (
                <div className="acoes acoes--juntas">
                  <button
                    type="button"
                    className="botao-icone"
                    onClick={() => executar(() => mudarOrdemDoBrinde(evento.id, brinde.nome, -1))}
                    disabled={i === 0}
                    aria-label={`Subir ${brinde.nome}`}
                    title="Subir"
                  >
                    <ArrowUp aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="botao-icone"
                    onClick={() => executar(() => mudarOrdemDoBrinde(evento.id, brinde.nome, 1))}
                    disabled={i === estoque.length - 1}
                    aria-label={`Descer ${brinde.nome}`}
                    title="Descer"
                  >
                    <ArrowDown aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="botao-icone"
                    onClick={() => setEditando(brinde)}
                    aria-label={`Editar ${brinde.nome}`}
                    title="Editar"
                  >
                    <Pencil aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="botao-icone botao-icone--perigo"
                    onClick={() => remover(brinde)}
                    disabled={brinde.entregues > 0}
                    aria-label={`Remover ${brinde.nome}`}
                    title={brinde.entregues > 0 ? 'Já foi entregue: dá para mudar a quantidade, mas não remover' : 'Remover'}
                  >
                    <Trash2 aria-hidden="true" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}

      <Janela aberta={Boolean(editando)} titulo="Editar brinde" aoFechar={() => setEditando(null)} largura={440}>
        {editando && <FormBrinde key={editando.nome} evento={evento} original={editando} aoTerminar={() => setEditando(null)} />}
      </Janela>
      {janelaConfirmar}
    </div>
  )
}

// Cadastro (sem "original") ou edição de um brinde.
function FormBrinde({ evento, original = null, aoTerminar }) {
  const { executar } = useAvisos()
  const [campos, setCampos] = useState({
    nome: original?.nome ?? '',
    quantidade: original?.qtd == null ? '' : String(original.qtd),
  })
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)
  const mudar = (campo, valor) => {
    setCampos((atual) => ({ ...atual, [campo]: valor }))
    setErros((atuais) => ({ ...atuais, [campo]: '' }))
  }

  async function enviar(e) {
    e.preventDefault()
    const novosErros = validarBrinde(evento, campos, original?.nome ?? null)
    setErros(novosErros)
    if (Object.values(novosErros).some(Boolean)) return
    setSalvando(true)
    const deuCerto = await executar(
      () => gravarBrinde(evento.id, campos, original?.nome ?? null),
      original ? 'Brinde atualizado.' : `${campos.nome.trim()} entrou na lista de brindes.`,
    )
    setSalvando(false)
    if (!deuCerto) return
    if (original) aoTerminar?.()
    else setCampos({ nome: '', quantidade: '' })
  }

  return (
    <form className={`formulario ${original ? '' : 'form-brinde'}`} onSubmit={enviar} noValidate>
      <div className="form-brinde__campos">
        <label className="campo form-brinde__nome">
          <span className="campo__rotulo">{original ? 'Nome' : 'Novo brinde'}</span>
          <input
            value={campos.nome}
            onChange={(e) => mudar('nome', e.target.value)}
            placeholder="Ex.: Caixa de som"
            aria-invalid={Boolean(erros.nome)}
            data-foco={original ? true : undefined}
          />
        </label>
        <label className="campo form-brinde__qtd">
          <span className="campo__rotulo">Quantidade</span>
          <input
            value={campos.quantidade}
            onChange={(e) => mudar('quantidade', e.target.value)}
            inputMode="numeric"
            placeholder="Sem limite"
            aria-invalid={Boolean(erros.quantidade)}
          />
        </label>
      </div>
      <ErroCampo texto={erros.nome} />
      <ErroCampo texto={erros.quantidade} />
      {original ? (
        <div className="janela-modal__acoes">
          <button type="button" className="botao botao--secundario" onClick={aoTerminar}>
            Cancelar
          </button>
          <button type="submit" className="botao botao--principal" disabled={salvando}>
            Salvar
          </button>
        </div>
      ) : (
        <button type="submit" className="botao botao--principal" disabled={salvando || !campos.nome.trim()}>
          <Plus aria-hidden="true" />
          Adicionar brinde
        </button>
      )}
    </form>
  )
}

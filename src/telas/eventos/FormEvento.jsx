import { useState } from 'react'
import CampoData from '../../componentes/CampoData.jsx'
import { ErroCampo } from '../../componentes/Campos.jsx'
import Janela from '../../componentes/Janela.jsx'
import { hojeISO } from '../../lib/datas.js'
import { numerosDoEvento, TAMANHO_MAXIMO_DO_TITULO, tituloDaCopia, validarEvento } from '../../lib/eventos.js'

const TITULOS = { novo: 'Novo evento', editar: 'Editar evento', duplicar: 'Duplicar evento' }
const BOTOES = { novo: 'Criar evento', editar: 'Salvar', duplicar: 'Duplicar' }

function camposIniciais({ modo, evento }) {
  if (modo === 'editar') return { titulo: evento.titulo, descricao: evento.descricao ?? '', data: evento.data }
  if (modo === 'duplicar') return { titulo: tituloDaCopia(evento.titulo), descricao: evento.descricao ?? '', data: hojeISO() }
  return { titulo: '', descricao: '', data: hojeISO() }
}

// modo: "novo", "editar" ou "duplicar" (com o evento de origem em edicao.evento).
export default function FormEvento({ edicao, aoSalvar, aoFechar }) {
  return (
    <Janela aberta={Boolean(edicao)} titulo={TITULOS[edicao?.modo] ?? ''} aoFechar={aoFechar}>
      {edicao && (
        <Formulario
          key={`${edicao.modo}-${edicao.evento?.id ?? ''}`}
          edicao={edicao}
          aoSalvar={aoSalvar}
          aoFechar={aoFechar}
        />
      )}
    </Janela>
  )
}

function Formulario({ edicao, aoSalvar, aoFechar }) {
  const [campos, setCampos] = useState(() => camposIniciais(edicao))
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)
  // Mexer num campo apaga o aviso dele.
  const mudar = (campo, valor) => {
    setCampos((atual) => ({ ...atual, [campo]: valor }))
    setErros((atuais) => ({ ...atuais, [campo]: '' }))
  }
  const origem = edicao.modo === 'duplicar' ? numerosDoEvento(edicao.evento) : null

  async function enviar(evento) {
    evento.preventDefault()
    const novosErros = validarEvento(campos)
    setErros(novosErros)
    if (Object.keys(novosErros).length) return
    setSalvando(true)
    const deuCerto = await aoSalvar(campos)
    setSalvando(false)
    if (deuCerto) aoFechar()
  }

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      <label className="campo">
        <span className="campo__rotulo">Nome do evento</span>
        <input
          value={campos.titulo}
          onChange={(e) => mudar('titulo', e.target.value)}
          maxLength={TAMANHO_MAXIMO_DO_TITULO}
          placeholder="Ex.: Festa de Fim de Ano"
          aria-invalid={Boolean(erros.titulo)}
          data-foco
        />
        <ErroCampo texto={erros.titulo} />
      </label>
      <CampoData rotulo="Data" valor={campos.data} aoMudar={(iso) => mudar('data', iso)} erro={erros.data} obrigatorio />
      <label className="campo">
        <span className="campo__rotulo">Descrição (opcional)</span>
        <textarea
          rows={3}
          value={campos.descricao}
          onChange={(e) => mudar('descricao', e.target.value)}
          placeholder="Local, horário ou o que mais ajudar"
        />
      </label>
      {origem && (
        <p className="aviso">
          Vão junto {origem.participantes} participante{origem.participantes === 1 ? '' : 's'} e{' '}
          {edicao.evento.brindes?.length ?? 0} brinde{edicao.evento.brindes?.length === 1 ? '' : 's'}. Os sorteados
          não vão: o evento novo começa do zero.
        </p>
      )}
      <div className="janela-modal__acoes">
        <button type="button" className="botao botao--secundario" onClick={aoFechar}>
          Cancelar
        </button>
        <button type="submit" className="botao botao--principal" disabled={salvando}>
          {BOTOES[edicao.modo]}
        </button>
      </div>
    </form>
  )
}

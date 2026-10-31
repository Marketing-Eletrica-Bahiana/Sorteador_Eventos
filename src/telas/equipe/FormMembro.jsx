import { useState } from 'react'
import { ErroCampo } from '../../componentes/Campos.jsx'
import Janela from '../../componentes/Janela.jsx'
import { DOMINIO_EMPRESA } from '../../lib/empresa.js'
import { limparEmail, validarMembro } from '../../lib/equipe.js'
import { PAPEIS, papelValido } from '../../lib/papeis.js'

const VAZIO = { email: '', nome: '', cargo: '', papel: 'organizador', ativo: true }

const TITULOS = { novo: 'Nova pessoa na equipe', editar: 'Editar cadastro' }

const OPCOES_DE_PAPEL = [
  { id: 'organizador', texto: 'Cria e edita eventos, cadastra participantes e brindes, sorteia e encerra.' },
  { id: 'admin', texto: 'Tudo o que a organização faz, mais cadastrar a equipe e excluir eventos.' },
]

// modo: "novo" ou "editar". Quem edita o próprio cadastro não muda papel nem desativa o acesso.
export default function FormMembro({ edicao, emailsCadastrados, ehVoce, aoSalvar, aoFechar }) {
  return (
    <Janela aberta={Boolean(edicao)} titulo={TITULOS[edicao?.modo] ?? ''} aoFechar={aoFechar}>
      {edicao && (
        <Formulario
          key={edicao.inicial?.email ?? 'novo'}
          edicao={edicao}
          emailsCadastrados={emailsCadastrados}
          ehVoce={ehVoce}
          aoSalvar={aoSalvar}
          aoFechar={aoFechar}
        />
      )}
    </Janela>
  )
}

function Formulario({ edicao, emailsCadastrados, ehVoce, aoSalvar, aoFechar }) {
  const [dados, setDados] = useState(() => {
    const inicial = { ...VAZIO, ...edicao.inicial }
    // Cadastro antigo com papel inválido abre já com uma escolha válida.
    return { ...inicial, papel: papelValido(inicial.papel) ? inicial.papel : 'organizador' }
  })
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)
  const novo = edicao.modo === 'novo'
  const mudar = (campo, valor) => setDados((atual) => ({ ...atual, [campo]: valor }))

  async function enviar(evento) {
    evento.preventDefault()
    const novosErros = validarMembro(dados, { novo, emailsCadastrados })
    setErros(novosErros)
    if (Object.keys(novosErros).length) return
    setSalvando(true)
    const deuCerto = await aoSalvar({ ...dados, email: limparEmail(dados.email) })
    setSalvando(false)
    if (deuCerto) aoFechar()
  }

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      <label className="campo">
        <span className="campo__rotulo">E-mail</span>
        <input
          type="email"
          value={dados.email}
          onChange={(e) => mudar('email', e.target.value)}
          placeholder={`nome@${DOMINIO_EMPRESA}`}
          disabled={!novo}
          aria-invalid={Boolean(erros.email)}
          data-foco={novo || undefined}
        />
        {!novo && <span className="campo__ajuda">O e-mail identifica a pessoa e não muda.</span>}
        <ErroCampo texto={erros.email} />
      </label>
      <label className="campo">
        <span className="campo__rotulo">Nome</span>
        <input
          value={dados.nome}
          onChange={(e) => mudar('nome', e.target.value)}
          aria-invalid={Boolean(erros.nome)}
          data-foco={!novo || undefined}
        />
        <ErroCampo texto={erros.nome} />
      </label>
      <label className="campo">
        <span className="campo__rotulo">Cargo (opcional)</span>
        <input value={dados.cargo} onChange={(e) => mudar('cargo', e.target.value)} />
      </label>
      <fieldset className="campo">
        <legend className="campo__rotulo">Papel</legend>
        <div className="opcoes opcoes--coluna">
          {OPCOES_DE_PAPEL.map(({ id, texto }) => (
            <label key={id} className="opcao">
              <input
                type="radio"
                name="papel"
                value={id}
                checked={dados.papel === id}
                onChange={() => mudar('papel', id)}
                disabled={ehVoce}
              />
              <span>
                <strong className="destaque">{PAPEIS[id].rotulo}</strong>
                <span className="campo__ajuda opcao__ajuda">{texto}</span>
              </span>
            </label>
          ))}
        </div>
        {ehVoce && <span className="campo__ajuda">Você não pode mudar o seu próprio papel.</span>}
        <ErroCampo texto={erros.papel} />
      </fieldset>
      <label className="opcao">
        <input type="checkbox" checked={dados.ativo} onChange={(e) => mudar('ativo', e.target.checked)} disabled={ehVoce} />
        <span>
          <strong className="destaque">Acesso ativo</strong>
          <span className="campo__ajuda opcao__ajuda">Desativada, a pessoa continua entrando, mas só acompanha.</span>
        </span>
      </label>
      <div className="janela-modal__acoes">
        <button type="button" className="botao botao--secundario" onClick={aoFechar}>
          Cancelar
        </button>
        <button type="submit" className="botao botao--principal" disabled={salvando}>
          {novo ? 'Cadastrar' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}

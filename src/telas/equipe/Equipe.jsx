import { useMemo, useState } from 'react'
import { Eye, Pencil, ShieldCheck, Ticket, UserCheck, UserPlus, Users, UserX } from 'lucide-react'
import { useAcesso } from '../../acesso/ProvedorAcesso.jsx'
import { useAvisos } from '../../componentes/Avisos.jsx'
import CarregandoBloco from '../../componentes/CarregandoBloco.jsx'
import { useConfirmar } from '../../componentes/Confirmar.jsx'
import EstadoVazio from '../../componentes/EstadoVazio.jsx'
import { atualizarMembro, criarMembro, mudarAcesso, useMembros } from '../../dados/membros.js'
import { mensagemDeErro } from '../../lib/erros.js'
import { PAPEIS, papelValido } from '../../lib/papeis.js'
import { primeiroNome } from '../../lib/texto.js'
import FormMembro from './FormMembro.jsx'

const QUEM_PODE_O_QUE = [
  { Icone: ShieldCheck, papel: 'admin', texto: 'Tudo, inclusive cadastrar a equipe e excluir eventos.' },
  { Icone: Ticket, papel: 'organizador', texto: 'Cria e edita eventos, cadastra participantes e brindes, sorteia e encerra.' },
  {
    Icone: Eye,
    papel: 'acompanhante',
    texto: 'Qualquer pessoa da EB sem cadastro ativo. Acompanha eventos, palco e dashboards, sem editar.',
  },
]

// Tela Equipe: só o admin chega aqui (o menu e as rotas já filtram pelo papel).
export default function Equipe() {
  const { pessoa: eu } = useAcesso()
  const { executar } = useAvisos()
  const [janelaConfirmar, confirmar] = useConfirmar()
  const membros = useMembros()
  const [edicao, setEdicao] = useState(null)

  const emailsCadastrados = useMemo(() => (membros.dados ?? []).map((m) => m.id), [membros.dados])

  function salvar(dados) {
    if (edicao.modo === 'novo') {
      return executar(() => criarMembro(dados), `${primeiroNome(dados.nome)} entrou para a equipe!`)
    }
    return executar(() => atualizarMembro(dados.email, dados), 'Cadastro atualizado.')
  }

  async function alternarAcesso(membro) {
    if (!membro.ativo) {
      executar(() => mudarAcesso(membro.id, true), `Acesso de ${membro.nome} ativado.`)
      return
    }
    const sim = await confirmar({
      titulo: 'Desativar acesso',
      texto: `${membro.nome} deixa de organizar os sorteios e passa só a acompanhar. Dá para ativar de novo quando quiser.`,
      botao: 'Desativar',
      perigo: true,
    })
    if (sim) executar(() => mudarAcesso(membro.id, false), `${membro.nome} agora só acompanha.`)
  }

  return (
    <section className="pagina">
      <header className="pagina__cabecalho">
        <h1 className="titulo-pagina">
          <Users aria-hidden="true" />
          Equipe
        </h1>
        <div className="linha-circuito" aria-hidden="true" />
      </header>

      <ul className="papeis-resumo" aria-label="Quem pode o quê">
        {QUEM_PODE_O_QUE.map(({ Icone, papel, texto }) => (
          <li key={papel} className="cartao papeis-resumo__item">
            <Icone aria-hidden="true" />
            <div>
              <strong className="destaque">{PAPEIS[papel].rotulo}</strong>
              <p className="texto-suave texto-pequeno">{texto}</p>
            </div>
          </li>
        ))}
      </ul>

      <section className="bloco">
        <div className="bloco__cabecalho">
          <h2 className="bloco__titulo">
            Pessoas cadastradas
            {membros.dados && <span className="etiqueta">{membros.dados.length}</span>}
          </h2>
          <button type="button" className="botao botao--principal" onClick={() => setEdicao({ modo: 'novo' })}>
            <UserPlus aria-hidden="true" />
            Nova pessoa
          </button>
        </div>
        {membros.carregando && <CarregandoBloco />}
        {membros.erro && <p className="aviso aviso--erro">{mensagemDeErro(membros.erro)}</p>}
        {membros.dados?.length === 0 && (
          <EstadoVazio titulo="Ninguém cadastrado ainda" texto="Cadastre quem vai organizar os sorteios." />
        )}
        {membros.dados?.length > 0 && (
          <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Cargo</th>
                <th>Papel</th>
                <th>Acesso</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {membros.dados.map((membro) => {
                const ehVoce = membro.id === eu.email
                return (
                  <tr key={membro.id}>
                    <td data-rotulo="Nome">
                      <div>
                        <strong>{membro.nome}</strong>
                        {ehVoce && <span className="etiqueta etiqueta--voce">Você</span>}
                        <span className="tabela__detalhe">{membro.id}</span>
                      </div>
                    </td>
                    <td data-rotulo="Cargo">{membro.cargo}</td>
                    <td data-rotulo="Papel">
                      {papelValido(membro.papel) ? (
                        PAPEIS[membro.papel].rotulo
                      ) : (
                        <span className="etiqueta etiqueta--alerta">Papel inválido</span>
                      )}
                    </td>
                    <td data-rotulo="Acesso">
                      <span className={`etiqueta ${membro.ativo ? '' : 'etiqueta--alerta'}`}>
                        {membro.ativo ? 'Ativo' : 'Desativado'}
                      </span>
                    </td>
                    <td className="tabela__acoes">
                      <div className="acoes acoes--juntas">
                        <button
                          type="button"
                          className="botao-icone"
                          aria-label={`Editar ${membro.nome}`}
                          title="Editar"
                          onClick={() => setEdicao({ modo: 'editar', inicial: { ...membro, email: membro.id } })}
                        >
                          <Pencil aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className={`botao-icone ${membro.ativo ? 'botao-icone--perigo' : ''}`}
                          aria-label={`${membro.ativo ? 'Desativar' : 'Ativar'} ${membro.nome}`}
                          title={
                            ehVoce ? 'Você não pode desativar o seu próprio acesso' : membro.ativo ? 'Desativar' : 'Ativar'
                          }
                          onClick={() => alternarAcesso(membro)}
                          disabled={ehVoce}
                        >
                          {membro.ativo ? <UserX aria-hidden="true" /> : <UserCheck aria-hidden="true" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>

      <FormMembro
        edicao={edicao}
        emailsCadastrados={emailsCadastrados}
        ehVoce={edicao?.inicial?.email === eu.email}
        aoSalvar={salvar}
        aoFechar={() => setEdicao(null)}
      />
      {janelaConfirmar}
    </section>
  )
}

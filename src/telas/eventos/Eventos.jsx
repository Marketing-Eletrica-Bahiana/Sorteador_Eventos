import { Ticket } from 'lucide-react'
import { useAcesso } from '../../acesso/ProvedorAcesso.jsx'
import { mascotes } from '../../lib/marca.js'
import { PAPEIS } from '../../lib/papeis.js'
import { primeiroNome } from '../../lib/texto.js'

const O_QUE_PODE = {
  admin:
    'Você cria e edita eventos, cadastra participantes e brindes, sorteia, encerra, exclui eventos e cuida da equipe.',
  organizador: 'Você cria e edita eventos, cadastra participantes e brindes, sorteia e encerra.',
  acompanhante: 'Você acompanha os eventos, o palco e as dashboards ao vivo.',
}

// Provisória: boas-vindas até a visão geral dos eventos chegar (Fase 3).
export default function Eventos() {
  const { pessoa } = useAcesso()

  return (
    <section className="pagina">
      <header className="pagina__cabecalho">
        <h1 className="titulo-pagina">
          <Ticket aria-hidden="true" />
          Eventos
        </h1>
        <div className="linha-circuito" aria-hidden="true" />
      </header>
      <div className="cartao tela-provisoria">
        <img className="tela-provisoria__mascote" src={mascotes.ebinho} alt="" />
        <div className="tela-provisoria__texto">
          <h2 className="titulo-destaque">Oi, {primeiroNome(pessoa.nome)}! Que bom ter você por aqui.</h2>
          <p>{O_QUE_PODE[pessoa.papel]}</p>
          <dl className="ficha">
            <div>
              <dt>Conta</dt>
              <dd>{pessoa.email}</dd>
            </div>
            <div>
              <dt>Papel</dt>
              <dd>{PAPEIS[pessoa.papel].rotulo}</dd>
            </div>
          </dl>
          <p className="texto-suave">A lista de eventos chega em breve.</p>
        </div>
      </div>
    </section>
  )
}

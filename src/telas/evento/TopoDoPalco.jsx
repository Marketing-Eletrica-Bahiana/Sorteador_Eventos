import { Maximize, Minimize, Volume2, VolumeX } from 'lucide-react'
import Logo from '../../componentes/Logo.jsx'
import { formatarData } from '../../lib/datas.js'

// Topo do palco do sorteio e da roleta: nome do evento, data, som e modo Apresentar.
export default function TopoDoPalco({ evento, som, apresentacao }) {
  return (
    <header className="palco__topo">
      <div className="palco__evento">
        <h1 className="palco__titulo">{evento.titulo}</h1>
        <span className="palco__data">
          {formatarData(evento.data)}
          {evento.status === 'encerrado' && <span className="etiqueta etiqueta--claro">Encerrado</span>}
        </span>
      </div>
      <div className="palco__botoes">
        {apresentacao.ativo && <Logo formato="linha" cor="branco" altura={32} className="so-largo" />}
        <button
          type="button"
          className="botao-icone botao-icone--claro"
          onClick={som.alternar}
          aria-pressed={som.ligado}
          aria-label={som.ligado ? 'Desligar o som' : 'Ligar o som'}
          title={som.ligado ? 'Desligar o som' : 'Ligar o som'}
        >
          {som.ligado ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
        </button>
        <button
          type="button"
          className="botao botao--claro"
          onClick={apresentacao.ativo ? apresentacao.sair : apresentacao.entrar}
        >
          {apresentacao.ativo ? <Minimize aria-hidden="true" /> : <Maximize aria-hidden="true" />}
          {apresentacao.ativo ? 'Sair' : 'Apresentar'}
        </button>
      </div>
    </header>
  )
}

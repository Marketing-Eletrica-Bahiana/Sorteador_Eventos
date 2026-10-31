import { LogOut, RotateCw } from 'lucide-react'
import { useAcesso } from '../acesso/ProvedorAcesso.jsx'
import FundoMarca from '../componentes/FundoMarca.jsx'
import Logo from '../componentes/Logo.jsx'

// Entrou com o Google, mas o cadastro não pôde ser lido (sem internet, servidor fora do ar).
export default function ErroAcesso() {
  const { usuario, erro, sair } = useAcesso()

  return (
    <FundoMarca>
      <section className="janela erro-acesso">
        <Logo formato="compacto" cor="azul" altura={64} />
        <div className="linha-circuito" aria-hidden="true" />
        <h1 className="titulo-destaque">Não deu para carregar seu acesso</h1>
        <p>{erro}</p>
        {usuario?.email && <p className="texto-suave texto-pequeno">Conta: {usuario.email}</p>}
        <div className="acoes">
          <button type="button" className="botao botao--principal" onClick={() => window.location.reload()}>
            <RotateCw aria-hidden="true" />
            Tentar de novo
          </button>
          <button type="button" className="botao botao--secundario" onClick={sair}>
            <LogOut aria-hidden="true" />
            Sair
          </button>
        </div>
      </section>
    </FundoMarca>
  )
}

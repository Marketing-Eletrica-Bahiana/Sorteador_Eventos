import { Users } from 'lucide-react'
import EstadoVazio from '../../componentes/EstadoVazio.jsx'

// Provisória: o cadastro da equipe chega na Fase 2. Só o admin chega aqui (menu e rotas filtram pelo papel).
export default function Equipe() {
  return (
    <section className="pagina">
      <header className="pagina__cabecalho">
        <h1 className="titulo-pagina">
          <Users aria-hidden="true" />
          Equipe
        </h1>
        <div className="linha-circuito" aria-hidden="true" />
      </header>
      <EstadoVazio
        titulo="Cadastro da equipe"
        texto="Em breve, aqui você cadastra quem organiza os sorteios e escolhe o papel de cada pessoa."
      />
    </section>
  )
}

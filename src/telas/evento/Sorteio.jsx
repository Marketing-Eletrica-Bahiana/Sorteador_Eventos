import { Sparkles } from 'lucide-react'
import { useParams } from 'react-router'
import { useEvento } from '../../dados/eventos.js'
import EventoProvisorio from './EventoProvisorio.jsx'

// Tela do sorteio (#/evento/:id). Provisória até as Fases 4 e 5.
export default function Sorteio() {
  const { id } = useParams()
  const consulta = useEvento(id)
  return (
    <EventoProvisorio
      consulta={consulta}
      Icone={Sparkles}
      aviso="Participantes, brindes e o palco do sorteio chegam nas próximas fases."
    />
  )
}

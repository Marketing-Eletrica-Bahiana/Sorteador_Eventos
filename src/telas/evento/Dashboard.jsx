import { ChartColumn } from 'lucide-react'
import { useParams } from 'react-router'
import { useEvento } from '../../dados/eventos.js'
import EventoProvisorio from './EventoProvisorio.jsx'

// Dashboard do evento (#/evento/:id/painel). Provisória até a Fase 6.
export default function Dashboard() {
  const { id } = useParams()
  const consulta = useEvento(id)
  return <EventoProvisorio consulta={consulta} Icone={ChartColumn} aviso="A dashboard ao vivo chega em uma das próximas fases." />
}

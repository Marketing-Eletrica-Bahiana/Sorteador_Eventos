import { CircleAlert } from 'lucide-react'

export function ErroCampo({ texto }) {
  if (!texto) return null
  return (
    <span className="campo__erro" role="alert">
      <CircleAlert aria-hidden="true" />
      {texto}
    </span>
  )
}


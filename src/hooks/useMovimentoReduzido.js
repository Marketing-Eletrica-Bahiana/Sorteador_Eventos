import { useSyncExternalStore } from 'react'

const consulta = () => window.matchMedia('(prefers-reduced-motion: reduce)')

function assinar(avisar) {
  const lista = consulta()
  lista.addEventListener('change', avisar)
  return () => lista.removeEventListener('change', avisar)
}

// true quando a pessoa pediu menos movimento no sistema: sem nomes girando e sem confete.
export function useMovimentoReduzido() {
  return useSyncExternalStore(assinar, () => consulta().matches)
}

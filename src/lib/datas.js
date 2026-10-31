// Datas de evento são guardadas como texto "AAAA-MM-DD" (sem hora, sem fuso) e exibidas como DD/MM/AAAA.
// "Hoje" e as horas dos sorteios são sempre calculados no fuso America/Bahia.

export const FUSO = 'America/Bahia'

const dois = (n) => String(n).padStart(2, '0')

export function hojeISO(agora = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    agora,
  )
}

// Monta "AAAA-MM-DD" só se a data existir no calendário (31/02 devolve null).
export function montarISO(ano, mes, dia) {
  const data = new Date(Date.UTC(ano, mes - 1, dia))
  const existe = data.getUTCFullYear() === ano && data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia
  return existe ? `${ano}-${dois(mes)}-${dois(dia)}` : null
}

const anoCompleto = (texto) => {
  const ano = Number(texto)
  return ano < 100 ? 2000 + ano : ano
}

// "DD/MM/AAAA" ou "DD/MM/AA".
export function lerData(texto) {
  const partes = String(texto ?? '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/)
  if (!partes) return null
  return montarISO(anoCompleto(partes[3]), Number(partes[2]), Number(partes[1]))
}

export function formatarData(iso) {
  if (!iso) return ''
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

// Momento (Date ou Timestamp do Firestore) como "HH:MM" e "DD/MM/AAAA" no fuso da Bahia.
const comoDate = (momento) => (typeof momento?.toDate === 'function' ? momento.toDate() : momento)

export function formatarHora(momento) {
  const data = comoDate(momento)
  if (!data) return ''
  return new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit', hour12: false }).format(
    data,
  )
}

export function formatarDataDoMomento(momento) {
  const data = comoDate(momento)
  return data ? formatarData(hojeISO(data)) : ''
}

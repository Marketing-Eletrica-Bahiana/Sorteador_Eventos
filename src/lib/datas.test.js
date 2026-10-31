import { describe, expect, it } from 'vitest'
import { formatarData, formatarDataDoMomento, formatarHora, hojeISO, lerData } from './datas.js'

describe('datas', () => {
  it('lê DD/MM/AAAA e DD/MM/AA', () => {
    expect(lerData('01/07/2026')).toBe('2026-07-01')
    expect(lerData('1/7/26')).toBe('2026-07-01')
    expect(lerData(' 25/12/2026 ')).toBe('2026-12-25')
  })

  it('recusa datas que não existem', () => {
    expect(lerData('31/02/2026')).toBeNull()
    expect(lerData('32/01/2026')).toBeNull()
    expect(lerData('28/09')).toBeNull()
    expect(lerData('ontem')).toBeNull()
  })

  it('exibe como DD/MM/AAAA', () => {
    expect(formatarData('2026-10-05')).toBe('05/10/2026')
    expect(formatarData(null)).toBe('')
  })

  it('usa o fuso da Bahia para saber o dia de hoje', () => {
    expect(hojeISO(new Date('2026-10-31T02:00:00Z'))).toBe('2026-10-30')
    expect(hojeISO(new Date('2026-10-31T15:00:00Z'))).toBe('2026-10-31')
  })

  it('mostra hora e data do sorteio no fuso da Bahia', () => {
    const momento = new Date('2026-10-31T02:05:00Z')
    expect(formatarHora(momento)).toBe('23:05')
    expect(formatarDataDoMomento(momento)).toBe('30/10/2026')
    // Timestamp do Firestore tem toDate()
    expect(formatarHora({ toDate: () => new Date('2026-10-31T12:00:00Z') })).toBe('09:00')
    expect(formatarHora(null)).toBe('')
  })
})

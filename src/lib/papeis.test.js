import { describe, expect, it } from 'vitest'
import { papelDe, podeCuidarDaEquipe, podeExcluirEvento, podeOrganizar, telasDoPapel } from './papeis.js'

describe('papéis', () => {
  it('usa o papel do cadastro só quando ele está ativo e é válido', () => {
    expect(papelDe({ papel: 'admin', ativo: true })).toBe('admin')
    expect(papelDe({ papel: 'organizador', ativo: true })).toBe('organizador')
    expect(papelDe({ papel: 'organizador', ativo: false })).toBe('acompanhante')
    expect(papelDe({ papel: 'diretoria', ativo: true })).toBe('acompanhante')
    expect(papelDe({ papel: 'admin' })).toBe('acompanhante')
    expect(papelDe(null)).toBe('acompanhante')
  })

  it('mostra a Equipe só para o admin', () => {
    const caminhos = (papel) => telasDoPapel(papel).map((t) => t.caminho)
    expect(caminhos('admin')).toEqual(['/eventos', '/equipe'])
    expect(caminhos('organizador')).toEqual(['/eventos'])
    expect(caminhos('acompanhante')).toEqual(['/eventos'])
  })

  it('segue as mesmas permissões das regras do Firestore', () => {
    expect(podeOrganizar('admin')).toBe(true)
    expect(podeOrganizar('organizador')).toBe(true)
    expect(podeOrganizar('acompanhante')).toBe(false)
    expect(podeExcluirEvento('admin')).toBe(true)
    expect(podeExcluirEvento('organizador')).toBe(false)
    expect(podeCuidarDaEquipe('admin')).toBe(true)
    expect(podeCuidarDaEquipe('organizador')).toBe(false)
  })
})

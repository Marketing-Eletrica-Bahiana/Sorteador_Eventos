import { describe, expect, it } from 'vitest'
import { dadosDoMembro, limparEmail, ordenarPorNome, validarEmail, validarMembro } from './equipe.js'

// E-mails fictícios: nenhum e-mail da equipe vai para o repositório.
const EMAIL = 'pessoa.exemplo@eletricabahiana.com.br'

describe('equipe', () => {
  it('guarda o e-mail em minúsculas e sem espaços', () => {
    expect(limparEmail('  Pessoa.Exemplo@EletricaBahiana.com.br ')).toBe(EMAIL)
  })

  it('aceita só e-mails da empresa', () => {
    expect(validarEmail(EMAIL)).toBe('')
    expect(validarEmail('')).toBe('Informe o e-mail.')
    expect(validarEmail('sem arroba')).toBe('E-mail inválido.')
    expect(validarEmail('alguem@gmail.com')).toBe('Só e-mails @eletricabahiana.com.br.')
    expect(validarEmail('alguem@eletricabahiana.com.br.falso.com')).toBe('Só e-mails @eletricabahiana.com.br.')
  })

  it('pede nome e papel válido', () => {
    expect(validarMembro({ nome: 'Ana', papel: 'organizador' })).toEqual({})
    expect(validarMembro({ nome: '  ', papel: 'organizador' })).toEqual({ nome: 'Informe o nome.' })
    expect(validarMembro({ nome: 'Ana', papel: 'acompanhante' })).toEqual({ papel: 'Escolha o papel.' })
  })

  it('confere o e-mail só no cadastro novo, sem repetir pessoa', () => {
    const opcoes = { novo: true, emailsCadastrados: [EMAIL] }
    expect(validarMembro({ email: EMAIL.toUpperCase(), nome: 'Ana', papel: 'admin' }, opcoes)).toEqual({
      email: 'Essa pessoa já está cadastrada.',
    })
    expect(validarMembro({ email: 'outra.pessoa@eletricabahiana.com.br', nome: 'Ana', papel: 'admin' }, opcoes)).toEqual({})
    expect(validarMembro({ email: '', nome: 'Ana', papel: 'admin' })).toEqual({})
  })

  it('grava só nome, cargo, papel e ativo, sem espaços sobrando', () => {
    expect(dadosDoMembro({ email: EMAIL, nome: '  Ana   Maria ', cargo: ' Analista ', papel: 'admin', ativo: true, extra: 1 })).toEqual({
      nome: 'Ana Maria',
      cargo: 'Analista',
      papel: 'admin',
      ativo: true,
    })
    expect(dadosDoMembro({ nome: 'Ana', papel: 'organizador' })).toEqual({
      nome: 'Ana',
      cargo: '',
      papel: 'organizador',
      ativo: false,
    })
  })

  it('ordena por nome em português, respeitando acentos', () => {
    const nomes = ordenarPorNome([{ nome: 'Úrsula' }, { nome: 'Ana' }, { nome: 'Érica' }, { nome: 'Bruno' }]).map((m) => m.nome)
    expect(nomes).toEqual(['Ana', 'Bruno', 'Érica', 'Úrsula'])
  })
})

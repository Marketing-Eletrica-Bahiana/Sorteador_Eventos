import { useCallback, useEffect, useRef, useState } from 'react'
import { DURACAO_DA_ROLETA } from '../lib/roleta.js'

export const DURACAO_DO_GIRO = 3200
const DURACAO_COM_MOVIMENTO_REDUZIDO = 900
const ESPERA_MINIMA = 400

// Animação do palco, igual para quem sorteia e para quem acompanha: quando chega uma rodada nova
// pelo Firestore, os nomes giram e depois o resultado aparece. Quem clicou em Sortear começa a
// girar na hora (comecarGiro) e revela no mesmo tempo de quem está assistindo de longe.
//
// fase: 'parado' (nada sorteado) | 'girando' | 'revelado'
// rodada: rodada mostrada na placa; festa: conta as revelações (dispara confete e fanfarra);
// rodadaDaFesta: rodada da última revelação (depois de desfazer, a rodada mostrada é outra).
export function useRevelacao(ultimaRodada, reduzido, duracaoDoGiro = DURACAO_DO_GIRO) {
  const [estado, setEstado] = useState(() => ({
    fase: ultimaRodada ? 'revelado' : 'parado',
    rodada: ultimaRodada,
    festa: 0,
    rodadaDaFesta: null,
  }))
  const rodadaVista = useRef(ultimaRodada)
  const inicioDoGiro = useRef(null)
  const relogio = useRef(null)

  // Só reage quando o número da última rodada muda (um número, não uma lista): não redesenha sem parar.
  useEffect(() => {
    if (ultimaRodada === rodadaVista.current) return
    const anterior = rodadaVista.current
    rodadaVista.current = ultimaRodada
    clearTimeout(relogio.current)
    if (ultimaRodada < anterior) {
      // Desfazer ou recomeçar: volta a mostrar a rodada anterior, sem festa.
      inicioDoGiro.current = null
      setEstado((atual) => ({ ...atual, fase: ultimaRodada ? 'revelado' : 'parado', rodada: ultimaRodada }))
      return
    }
    const agora = Date.now()
    const inicio = inicioDoGiro.current ?? agora
    inicioDoGiro.current = null
    const duracao = reduzido ? DURACAO_COM_MOVIMENTO_REDUZIDO : duracaoDoGiro
    setEstado((atual) => ({ ...atual, fase: 'girando' }))
    relogio.current = setTimeout(
      () => setEstado((atual) => ({ fase: 'revelado', rodada: ultimaRodada, festa: atual.festa + 1, rodadaDaFesta: ultimaRodada })),
      Math.max(ESPERA_MINIMA, inicio + duracao - agora),
    )
  }, [ultimaRodada, reduzido, duracaoDoGiro])

  useEffect(() => () => clearTimeout(relogio.current), [])

  const comecarGiro = useCallback(() => {
    inicioDoGiro.current = Date.now()
    setEstado((atual) => ({ ...atual, fase: 'girando' }))
  }, [])

  // O sorteio deu erro: para de girar e volta ao que estava.
  const cancelarGiro = useCallback(() => {
    inicioDoGiro.current = null
    setEstado((atual) => ({ ...atual, fase: atual.rodada ? 'revelado' : 'parado' }))
  }, [])

  return { ...estado, comecarGiro, cancelarGiro }
}

// Tempo da roleta. Ela gira em qualquer computador, mesmo com "menos movimento" ligado no sistema: o
// giro é a própria brincadeira, e muitos computadores do evento têm os efeitos de animação desligados.
export const useRevelacaoDaRoleta = (giros) => useRevelacao(giros, false, DURACAO_DA_ROLETA)

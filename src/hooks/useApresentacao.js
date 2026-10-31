import { useCallback, useEffect, useRef, useState } from 'react'

// Modo "Apresentar": tela cheia e tela sempre acesa (Wake Lock). Se o navegador não tiver tela
// cheia (iPhone, por exemplo), o palco ocupa a janela do mesmo jeito.
export function useApresentacao() {
  const [ativo, setAtivo] = useState(false)
  const travaDaTela = useRef(null)

  const manterAcesa = useCallback(async () => {
    try {
      travaDaTela.current = await navigator.wakeLock?.request('screen')
    } catch {
      travaDaTela.current = null
    }
  }, [])

  const entrar = useCallback(() => {
    setAtivo(true)
    document.documentElement.requestFullscreen?.().catch(() => {})
    manterAcesa()
  }, [manterAcesa])

  const sair = useCallback(() => {
    setAtivo(false)
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
    travaDaTela.current?.release?.().catch(() => {})
    travaDaTela.current = null
  }, [])

  useEffect(() => {
    if (!ativo) return undefined
    // Esc ou o botão do navegador saem da tela cheia: sai da apresentação junto.
    const aoMudarTelaCheia = () => !document.fullscreenElement && sair()
    // A trava da tela cai quando a aba fica escondida; volta quando ela aparece de novo.
    const aoVoltar = () => document.visibilityState === 'visible' && manterAcesa()
    document.addEventListener('fullscreenchange', aoMudarTelaCheia)
    document.addEventListener('visibilitychange', aoVoltar)
    document.body.classList.add('apresentando')
    return () => {
      document.removeEventListener('fullscreenchange', aoMudarTelaCheia)
      document.removeEventListener('visibilitychange', aoVoltar)
      document.body.classList.remove('apresentando')
    }
  }, [ativo, sair, manterAcesa])

  // Saindo da tela (outra rota), solta a tela cheia e a trava.
  useEffect(
    () => () => {
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
      travaDaTela.current?.release?.().catch(() => {})
    },
    [],
  )

  return { ativo, entrar, sair }
}

import { lazy, Suspense } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router'
import { ProvedorAcesso, useAcesso } from './acesso/ProvedorAcesso.jsx'
import { ProvedorAvisos } from './componentes/Avisos.jsx'
import CarregandoBloco from './componentes/CarregandoBloco.jsx'
import Layout from './componentes/Layout.jsx'
import { TELA_INICIAL, telasDoPapel } from './lib/papeis.js'
import Carregando from './telas/Carregando.jsx'
import ErroAcesso from './telas/ErroAcesso.jsx'
import Login from './telas/Login.jsx'

// Cada tela é carregada sob demanda, só quando a pessoa abre.
const TELAS = {
  '/eventos': lazy(() => import('./telas/eventos/Eventos.jsx')),
  '/equipe': lazy(() => import('./telas/equipe/Equipe.jsx')),
}

// Telas de um evento, fora do menu. Todo mundo que entra pode abrir (quem acompanha vê sem controles).
const TELAS_DO_EVENTO = [
  { caminho: '/evento/:id', Tela: lazy(() => import('./telas/evento/Sorteio.jsx')) },
  { caminho: '/evento/:id/painel', Tela: lazy(() => import('./telas/evento/Dashboard.jsx')) },
]

const carregar = (Tela) => (
  <Suspense fallback={<CarregandoBloco />}>
    <Tela />
  </Suspense>
)

function Rotas() {
  const { situacao, pessoa } = useAcesso()

  if (situacao === 'carregando') return <Carregando />
  if (situacao === 'fora') return <Login />
  if (situacao !== 'dentro') return <ErroAcesso />

  const telas = telasDoPapel(pessoa.papel)
  return (
    <Layout telas={telas}>
      <Routes>
        {telas.map((tela) => (
          <Route key={tela.caminho} path={`${tela.caminho}/*`} element={carregar(TELAS[tela.caminho])} />
        ))}
        {TELAS_DO_EVENTO.map(({ caminho, Tela }) => (
          <Route key={caminho} path={caminho} element={carregar(Tela)} />
        ))}
        {/* Qualquer outro endereço, inclusive a entrada, leva à visão geral dos eventos. */}
        <Route path="*" element={<Navigate to={TELA_INICIAL} replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <HashRouter>
      <ProvedorAcesso>
        <ProvedorAvisos>
          <Rotas />
        </ProvedorAvisos>
      </ProvedorAcesso>
    </HashRouter>
  )
}

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

function Rotas() {
  const { situacao, pessoa } = useAcesso()

  if (situacao === 'carregando') return <Carregando />
  if (situacao === 'fora') return <Login />
  if (situacao !== 'dentro') return <ErroAcesso />

  const telas = telasDoPapel(pessoa.papel)
  return (
    <Layout telas={telas}>
      <Routes>
        {telas.map((tela) => {
          const Tela = TELAS[tela.caminho]
          return (
            <Route
              key={tela.caminho}
              path={`${tela.caminho}/*`}
              element={
                <Suspense fallback={<CarregandoBloco />}>
                  <Tela />
                </Suspense>
              }
            />
          )
        })}
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

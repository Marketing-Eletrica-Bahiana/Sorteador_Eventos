import { useState } from 'react'
import { FileSpreadsheet, LoaderCircle } from 'lucide-react'
import { gerarPlanilha, nomeDoArquivo } from '../lib/excel.js'
import { useAvisos } from './Avisos.jsx'

const TIPO_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

// Gera o .xlsx do evento e baixa no computador de quem clicou.
export async function baixarPlanilhaDoEvento(evento) {
  const conteudo = await gerarPlanilha(evento)
  const endereco = URL.createObjectURL(new Blob([conteudo], { type: TIPO_XLSX }))
  const link = document.createElement('a')
  link.href = endereco
  link.download = nomeDoArquivo(evento)
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(endereco), 10000)
}

// Baixar a planilha a qualquer momento (todos os papéis: quem acompanha também vê esses dados).
export default function BotaoPlanilha({ evento, className = 'botao botao--secundario' }) {
  const { executar } = useAvisos()
  const [gerando, setGerando] = useState(false)

  async function baixar() {
    setGerando(true)
    await executar(() => baixarPlanilhaDoEvento(evento), 'Planilha baixada.')
    setGerando(false)
  }

  return (
    <button type="button" className={className} onClick={baixar} disabled={gerando}>
      {gerando ? <LoaderCircle className="girando" aria-hidden="true" /> : <FileSpreadsheet aria-hidden="true" />}
      Baixar planilha
    </button>
  )
}

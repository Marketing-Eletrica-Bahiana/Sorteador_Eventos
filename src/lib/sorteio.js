// Sorteados com o nome de cada pessoa e o número na ordem em que saíram (Nº 1 é o primeiro).
export function listaDeSorteados(evento) {
  const nomes = new Map((evento.participantes ?? []).map((p) => [p.id, p.nome]))
  return (evento.sorteados ?? []).map((s, i) => ({ ...s, numero: i + 1, nome: nomes.get(s.id) ?? '(fora da lista)' }))
}

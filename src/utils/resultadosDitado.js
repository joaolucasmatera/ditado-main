export const estadosLlm = {
  Pendente: 'Pendente',
  Processando: 'Em processamento',
  Concluida: 'Concluída',
  Revisao: 'Em revisão',
  Falha: 'Falha'
}

export function classificacoesVisiveis(detalhe) {
  const classificacoes = (detalhe.classificacoes || []).map(erro => ({
    id: erro.erroCatalogoId,
    nome: erro.nome,
    origem: erro.origem === 'LLM' ? 'LLM' : 'Código'
  }))

  if (classificacoes.some(erro => erro.origem === 'Código')) return classificacoes

  return [
    ...(detalhe.tiposErro || []).map(nome => ({ id: nome, nome, origem: 'Código' })),
    ...classificacoes
  ]
}

export const estadosLlm = {
  Pendente: 'Pendente',
  Processando: 'Em processamento',
  Concluida: 'Concluída',
  Revisao: 'Em revisão',
  Falha: 'Falha'
}

export function rotuloOrigemCorrecao(origem) {
  return origem === 'LLM' ? 'Correção IA' : 'Correção tradicional'
}

export function rotuloCategoriaPedagogica(categoria) {
  if (!categoria?.nome) return 'Categoria não registrada'
  return categoria.familia ? `${categoria.nome} · ${categoria.familia}` : categoria.nome
}

export function classificacoesVisiveis(detalhe) {
  const classificacoes = (detalhe.classificacoes || []).map(erro => ({
    id: erro.erroCatalogoId || `tipo:${erro.tipoErro}`,
    nome: erro.nome,
    origem: erro.origem === 'LLM' ? 'LLM' : 'Código',
    categoriaPedagogica: erro.categoriaPedagogica,
    modeloLlm: erro.modeloLlm
  }))

  if (classificacoes.some(erro => erro.origem === 'Código')) return classificacoes

  return [
    ...(detalhe.tiposErro || []).map(nome => ({ id: nome, nome, origem: 'Código' })),
    ...classificacoes
  ]
}

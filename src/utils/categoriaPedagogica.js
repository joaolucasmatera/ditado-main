export const NAO_ORTOGRAFICO = 'NAO_ORTOGRAFICO'

export function categoriaParaEditar(categoria) {
  return {
    codigo: categoria?.codigo || '',
    nome: categoria?.codigo === NAO_ORTOGRAFICO ? categoria.nome : ''
  }
}

export function categoriaValida({ codigo, nome }) {
  return Boolean(codigo && (codigo !== NAO_ORTOGRAFICO || nome.trim()))
}

export function categoriaParaSalvar({ codigo, nome }) {
  return codigo === NAO_ORTOGRAFICO ? { codigo, nome: nome.trim() } : { codigo }
}

export function rotuloCategoriaPedagogica(categoria) {
  if (!categoria) return 'Sem categoria mapeada'
  return categoria.familia ? `${categoria.familia} · ${categoria.nome}` : categoria.nome
}

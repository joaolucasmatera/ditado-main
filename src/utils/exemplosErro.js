export function lerExemplos(erro) {
  if (Array.isArray(erro.exemplos)) return erro.exemplos.map(exemplo => ({ ...exemplo }))
  if (erro.exemploEsperado && erro.exemploResposta) {
    return [{ esperado: erro.exemploEsperado, resposta: erro.exemploResposta }]
  }
  return []
}

export function indiceExemploIncompleto(exemplos) {
  return exemplos.findIndex(({ esperado, resposta }) => !!esperado.trim() !== !!resposta.trim())
}

export function exemplosPreenchidos(exemplos) {
  return exemplos.filter(({ esperado, resposta }) => esperado.trim() && resposta.trim())
}

# Coordenação do projeto

- Antes de levar uma dúvida de escopo ao usuário, consulte o responsável pelo assunto.
- Consulte o agente `researcher` somente para dúvidas sobre o conteúdo dos três PDFs enviados e a parte pedagógica de língua portuguesa. Ele é o especialista professor de português dessas referências, guardadas em `docs/referencias/` no repositório backend.
- Questões técnicas da implementação ficam com o Fullstack 01. Arquitetura, contratos, persistência, dependências, ordem das histórias, versionamento e gerenciamento do projeto devem consultar o agente `gerente_projetos`.
- Catálogo, seleção de erros, validações de formulário e regras operacionais do produto não exigem consulta ao researcher por si só. Se uma questão técnica depender de um critério pedagógico, consulte-o apenas sobre esse critério e separe os pareceres.
- Envie aos consultores a dúvida concreta, as decisões anteriores e as fontes relevantes. Solicite alternativas, recomendação, justificativa e incertezas.
- Toda dúvida de escopo deve sempre ser encaminhada ao usuário para decisão, acompanhada dos pareceres pertinentes e de suas fontes.
- Os consultores apenas opinam: não decidem, aprovam nem encerram dúvidas de escopo. Uma recomendação não autoriza implementação nem mudança de decisão confirmada.
- Distinga decisões já confirmadas, evidências e recomendações. Aguarde a decisão do usuário antes de implementar o comportamento que depende da dúvida.
- Se um consultor não estiver acessível, informe a limitação antes de encaminhar a dúvida ao usuário; não afirme que houve consulta.

## Execução do desenvolvimento

- O responsável pelo desenvolvimento é o chat **Fullstack 01 — Ditado**, ID `01a1aeeb-e805-7010-a967-afb23a988599`, host `local`. Ele substitui o antigo subagente `fullstack`; não atribuir desenvolvimento ao subagente anterior.
- A coordenação fica no chat **SQUAD DITADO**, ID `01a1aa39-f543-7cc1-9825-3bbda26ecd38`. O QA oficial fica no chat **QA — COR-01 e validação visível**, ID `01a1ad2c-2c50-7280-83ca-1db03679fb20`.
- Aplicar clean code, Clean Architecture e padrões úteis, considerando escalabilidade sem acrescentar complexidade desnecessária.
- Alterações de comportamento devem ter testes pertinentes e atualizar os testes afetados; coordenar a validação independente com o QA.
- Manter o Linear atualizado e produzir relatório de ciclo com alterações, motivos, arquivos, validações e limitações.
- Trabalhar fora de `master` e `main`, usando branches `codex/` e preservando alterações existentes. Coordenar reinícios dos serviços antes de interromper testes manuais ou do QA.

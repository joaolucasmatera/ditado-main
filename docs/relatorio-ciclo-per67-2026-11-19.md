# PER-67 · Validação do cadastro manual de alunos

O campo de número da chamada aceitava texto, e o aviso do modal combinava turma ausente e dados inválidos. Em `src/views/Usuarios.vue`, o campo passa a ser numérico e cada linha precisa ter uma chamada inteira de 1 a 999, conforme o contrato da API. O formulário valida todas as linhas antes de enviar a primeira. A mensagem indica a turma ou a linha que precisa de correção. Uma linha importada em revisão usa a mesma regra.

A regressão `tests/e2e/per67-cadastro-alunos.e2e.js` usa um professor e uma escola sintéticos. Cobre escola sem turma, turma obrigatória, nome ausente, letras, chamada vazia, zero, decimal, 1000, limites 1 e 999, matrícula opcional e revisão de uma linha de CSV. Verifica que linhas inválidas não disparam cadastro e que os convites são gerados pela API.

O build do frontend usa `npm.cmd run build`. Para reproduzir, defina `E2E_API_URL` e `E2E_BASE_URL` para um ambiente isolado e execute `node tests/e2e/per67-cadastro-alunos.e2e.js` no frontend. A execução local usa a API na porta 5067, o frontend na 5197 e o schema sintético `ditado_per65_gate1811`. A correção é restrita ao frontend e não exige migration.

Build e Playwright concluíram com código de saída zero. A execução confirmou dois convites manuais e um após corrigir a chamada importada. O log da regressão está em `work/logs/per67-playwright.log` no checkout do backend. A fixture usou o cache NuGet como caminho de dependências do build isolado para carregar o leitor de CSV.

Uma segunda ocorrência mostrou HTTP 400 com turma selecionada, chamada válida e nome de dois caracteres. O teste direto confirmou o erro de validação do campo Nome na API. O formulário agora valida nome de 3 a 200 caracteres e matrícula opcional de até 20 caracteres antes de enviar. Também exibe os detalhes de validação retornados pela API quando disponíveis. O Playwright aprovou a recusa sem POST, o envio válido e a exibição do erro retornado. Evidência em `work/logs/per67-nome-playwright.log` no checkout do backend. O frontend também compilou na imagem Docker.

O convite agora rotula o identificador como “Código de entrada”, explica sua composição e aponta o caminho “Aluno” → “Primeiro login: criar PIN”, com código ou matrícula.

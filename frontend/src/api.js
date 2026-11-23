// Funções que conversam com a API em Python
async function requisicao(url, opcoes = {}) {
  const resposta = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...opcoes,
  });
  if (!resposta.ok) {
    throw new Error(`Erro ${resposta.status} ao falar com o servidor`);
  }
  return resposta.status === 204 ? null : resposta.json();
}

export const listarTarefas = () => requisicao("/api/tarefas");

export const criarTarefa = (titulo) =>
  requisicao("/api/tarefas", {
    method: "POST",
    body: JSON.stringify({ titulo }),
  });

export const atualizarTarefa = (id, dados) =>
  requisicao(`/api/tarefas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });

export const excluirTarefa = (id) =>
  requisicao(`/api/tarefas/${id}`, { method: "DELETE" });

import { useEffect, useState } from "react";
import {
  listarTarefas,
  criarTarefa,
  atualizarTarefa,
  excluirTarefa,
} from "./api";

const FILTROS = [
  { id: "todas", rotulo: "Todas" },
  { id: "pendentes", rotulo: "Pendentes" },
  { id: "concluidas", rotulo: "Concluídas" },
];

export default function App() {
  const [tarefas, setTarefas] = useState([]);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [filtro, setFiltro] = useState("todas");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    listarTarefas()
      .then(setTarefas)
      .catch(() =>
        setErro("Não consegui conectar ao servidor. O backend está rodando?")
      )
      .finally(() => setCarregando(false));
  }, []);

  async function adicionar(e) {
    e.preventDefault();
    const titulo = novoTitulo.trim();
    if (!titulo) return;
    try {
      const nova = await criarTarefa(titulo);
      setTarefas([nova, ...tarefas]);
      setNovoTitulo("");
      setErro("");
    } catch (err) {
      setErro(err.message);
    }
  }

  async function alternar(tarefa) {
    try {
      const atualizada = await atualizarTarefa(tarefa.id, {
        concluida: !tarefa.concluida,
      });
      setTarefas(tarefas.map((t) => (t.id === tarefa.id ? atualizada : t)));
    } catch (err) {
      setErro(err.message);
    }
  }

  async function remover(id) {
    try {
      await excluirTarefa(id);
      setTarefas(tarefas.filter((t) => t.id !== id));
    } catch (err) {
      setErro(err.message);
    }
  }

  const visiveis = tarefas.filter((t) =>
    filtro === "todas" ? true : filtro === "concluidas" ? t.concluida : !t.concluida
  );
  const pendentes = tarefas.filter((t) => !t.concluida).length;

  return (
    <main className="app">
      <h1>Lista de Tarefas</h1>
      <p className="subtitulo">
        {pendentes} {pendentes === 1 ? "tarefa pendente" : "tarefas pendentes"}
      </p>

      <form className="form" onSubmit={adicionar}>
        <input
          value={novoTitulo}
          onChange={(e) => setNovoTitulo(e.target.value)}
          placeholder="O que você precisa fazer?"
          maxLength={200}
          aria-label="Nova tarefa"
        />
        <button type="submit">Adicionar</button>
      </form>

      {erro && <p className="erro">{erro}</p>}

      <div className="filtros">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            className={filtro === f.id ? "ativo" : ""}
            onClick={() => setFiltro(f.id)}
          >
            {f.rotulo}
          </button>
        ))}
      </div>

      {carregando ? (
        <p className="vazio">Carregando...</p>
      ) : visiveis.length === 0 ? (
        <p className="vazio">Nenhuma tarefa por aqui.</p>
      ) : (
        <ul className="lista">
          {visiveis.map((t) => (
            <li key={t.id} className={t.concluida ? "concluida" : ""}>
              <label>
                <input
                  type="checkbox"
                  checked={t.concluida}
                  onChange={() => alternar(t)}
                />
                <span>{t.titulo}</span>
              </label>
              <button
                className="excluir"
                onClick={() => remover(t.id)}
                aria-label={`Excluir ${t.titulo}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

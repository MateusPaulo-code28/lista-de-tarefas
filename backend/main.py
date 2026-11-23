"""API da Lista de Tarefas (FastAPI + SQLite).

Rodar:  uvicorn main:app --reload
Docs:   http://localhost:8000/docs
"""
import sqlite3
from contextlib import contextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DB_PATH = "tarefas.db"

app = FastAPI(title="Lista de Tarefas API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Banco de dados ----------
@contextmanager
def conexao():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    try:
        yield con
        con.commit()
    finally:
        con.close()


def iniciar_banco():
    with conexao() as con:
        con.execute(
            """
            CREATE TABLE IF NOT EXISTS tarefas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT NOT NULL,
                concluida INTEGER NOT NULL DEFAULT 0
            )
            """
        )


iniciar_banco()


# ---------- Modelos ----------
class TarefaCriar(BaseModel):
    titulo: str = Field(min_length=1, max_length=200)


class TarefaAtualizar(BaseModel):
    titulo: Optional[str] = Field(default=None, min_length=1, max_length=200)
    concluida: Optional[bool] = None


class Tarefa(BaseModel):
    id: int
    titulo: str
    concluida: bool


def linha_para_tarefa(linha: sqlite3.Row) -> Tarefa:
    return Tarefa(
        id=linha["id"], titulo=linha["titulo"], concluida=bool(linha["concluida"])
    )


# ---------- Rotas ----------
@app.get("/api/tarefas", response_model=list[Tarefa])
def listar_tarefas():
    with conexao() as con:
        linhas = con.execute("SELECT * FROM tarefas ORDER BY id DESC").fetchall()
    return [linha_para_tarefa(l) for l in linhas]


@app.post("/api/tarefas", response_model=Tarefa, status_code=201)
def criar_tarefa(dados: TarefaCriar):
    titulo = dados.titulo.strip()
    if not titulo:
        raise HTTPException(status_code=422, detail="O título não pode ser vazio.")
    with conexao() as con:
        cur = con.execute("INSERT INTO tarefas (titulo) VALUES (?)", (titulo,))
        linha = con.execute(
            "SELECT * FROM tarefas WHERE id = ?", (cur.lastrowid,)
        ).fetchone()
    return linha_para_tarefa(linha)


@app.patch("/api/tarefas/{tarefa_id}", response_model=Tarefa)
def atualizar_tarefa(tarefa_id: int, dados: TarefaAtualizar):
    with conexao() as con:
        linha = con.execute("SELECT * FROM tarefas WHERE id = ?", (tarefa_id,)).fetchone()
        if linha is None:
            raise HTTPException(status_code=404, detail="Tarefa não encontrada.")

        titulo = dados.titulo.strip() if dados.titulo is not None else linha["titulo"]
        concluida = (
            int(dados.concluida) if dados.concluida is not None else linha["concluida"]
        )
        con.execute(
            "UPDATE tarefas SET titulo = ?, concluida = ? WHERE id = ?",
            (titulo, concluida, tarefa_id),
        )
        linha = con.execute("SELECT * FROM tarefas WHERE id = ?", (tarefa_id,)).fetchone()
    return linha_para_tarefa(linha)


@app.delete("/api/tarefas/{tarefa_id}", status_code=204)
def excluir_tarefa(tarefa_id: int):
    with conexao() as con:
        cur = con.execute("DELETE FROM tarefas WHERE id = ?", (tarefa_id,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Tarefa não encontrada.")

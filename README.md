# Lista de Tarefas

Aplicação web full stack para gerenciar tarefas: criar, concluir, filtrar e excluir.

- **Backend:** Python + FastAPI + SQLite
- **Frontend:** React + Vite

## Funcionalidades

- Adicionar tarefas
- Marcar como concluída / pendente
- Excluir tarefas
- Filtrar por todas, pendentes e concluídas
- Dados salvos em banco SQLite (persistem ao reiniciar)

## Pré-requisitos

- [Python 3.10+](https://www.python.org/downloads/) (marque **Add Python to PATH** na instalação)
- [Node.js 18+](https://nodejs.org/) (já inclui o npm, necessário para o React)

## Como rodar

Abra **dois terminais** no VS Code (`Ctrl + '`).

### 1. Backend (Python)

```bash
cd backend
python -m venv .venv

# Windows (PowerShell)
.venv\Scripts\Activate.ps1
# Windows (cmd)
.venv\Scripts\activate.bat
# Mac/Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

API em http://localhost:8000 e documentação interativa em http://localhost:8000/docs

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Abra http://localhost:5173

## Endpoints da API

| Método | Rota                 | Descrição            |
| ------ | -------------------- | -------------------- |
| GET    | `/api/tarefas`       | Lista as tarefas     |
| POST   | `/api/tarefas`       | Cria uma tarefa      |
| PATCH  | `/api/tarefas/{id}`  | Edita / conclui      |
| DELETE | `/api/tarefas/{id}`  | Exclui uma tarefa    |

## Estrutura

```
lista-de-tarefas/
├── backend/
│   ├── main.py            # API FastAPI + SQLite
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js     # proxy /api -> backend
│   └── src/
│       ├── main.jsx
│       ├── App.jsx        # interface
│       ├── api.js         # chamadas à API
│       └── App.css
└── README.md
```

## Próximos passos (ideias)

- Editar o título da tarefa
- Adicionar data de vencimento e prioridade
- Login de usuários
- Testes automatizados (pytest e Vitest)
- Deploy (Render para a API, Vercel para o React)

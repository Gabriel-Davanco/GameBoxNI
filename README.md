# GameBox

![Projeto Badge](https://img.shields.io/badge/Status-Em_Desenvolvimento-blue) ![Flask](https://img.shields.io/badge/Flask-000000?style=flat&logo=flask) ![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react) ![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python) ![NodeJS](https://img.shields.io/badge/NodeJS-339933?style=flat&logo=node-dot-js)

Bem-vindo ao **GameBox**, um aplicativo web para gerenciar usuários e bibliotecas de jogos. Este projeto combina um backend em Flask para autenticação e gerenciamento de banco de dados, e um frontend em React para a interface do usuário, incluindo funcionalidades como login, registro e controle de status de jogos na biblioteca.

## Descrição
O **GameBox** é um sistema de gerenciamento de jogos e usuários que permite:

- Registro e login de usuários.
- Listagem de jogos disponíveis.
- Adição, remoção e atualização do status de jogos na biblioteca do usuário.
- Funcionalidades de pesquisa e atualização de informações de jogos.

O projeto é ideal para aprendizado de **Flask**, **React** e integração de sistemas frontend-backend, e pode ser expandido para incluir funcionalidades como recomendações de jogos, avaliação de jogos, ou integração com APIs externas.

## Requisitos
- **Backend (Flask)**:
  - Python 3.6 ou superior
  - Bibliotecas: Flask, Flask-SQLAlchemy, Flask-Login, Flask-CORS
- **Frontend (React)**:
  - Node.js 14 ou superior
  - Gerenciador de pacotes: npm ou yarn
- **Banco de dados**:
  - SQLite (já incluído no projeto)

## Instalação

Siga os passos abaixo para configurar o **GameBox** em sua máquina local.

### 1. Clone o repositório
```bash
git clone https://github.com/Gabriel-Davanco/GameBoxNI.git
cd GameBoxNI
```
### 2. Inicie o servidor
```bash
# Entre na pasta do backend, caso esteja separada
cd backend  # se não tiver pasta separada, pule este comando

# Crie e ative um ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux / macOS
venv\Scripts\activate     # Windows

# Instale as dependências
pip install -r requirements.txt

# Inicialize o banco de dados
python
>>> from main import db, app
>>> with app.app_context():
...     db.create_all()
...     exit()

# Rode o servidor Flask
python main.py
```
### 3. Inicie o frontend
```bash
# Entre na pasta do frontend, caso esteja separada
cd frontend  # se não tiver pasta separada, pule este comando

# Instale as dependências
npm install

# Rode o servidor React
npm run dev

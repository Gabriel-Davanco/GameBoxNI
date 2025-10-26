# gamebox-flask/gamebox/main.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_login import (
    LoginManager,
    login_user,
    login_required,
    current_user,
    logout_user,
)
from db import db
from models import Usuario, Jogos, Biblioteca

# -----------------------------------------------------------------------------
# App e Config
# -----------------------------------------------------------------------------
app = Flask(__name__)
app.config.update(
    SECRET_KEY="brunao",  # ⚠️ em produção use variável de ambiente
    SQLALCHEMY_DATABASE_URI="sqlite:///database.db",
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False,  # True somente em HTTPS
)

db.init_app(app)

# CORS: permitir front (5173) enviar/receber cookies de sessão
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

# -----------------------------------------------------------------------------
# Login Manager
# -----------------------------------------------------------------------------
lm = LoginManager(app)
lm.login_view = "api_login"  # não é usado para redirect (ver handler abaixo)


@lm.user_loader
def user_loader(user_id: str):
    # Flask-Login armazena id como string na sessão
    return db.session.query(Usuario).filter_by(id=user_id).first()


# Em vez de redirecionar para página HTML, devolva JSON 401 nas rotas protegidas
@lm.unauthorized_handler
def unauthorized():
    return jsonify({"success": False, "message": "Unauthorized"}), 401


# -----------------------------------------------------------------------------
# Handlers de erro (API sempre em JSON)
# -----------------------------------------------------------------------------
from flask import request


@app.errorhandler(404)
def not_found(e):
    if request.path.startswith("/api/"):
        return jsonify({"success": False, "error": "Not Found"}), 404
    return e


@app.errorhandler(500)
def internal_error(e):
    if request.path.startswith("/api/"):
        return jsonify({"success": False, "error": "Internal Server Error"}), 500
    return e


# -----------------------------------------------------------------------------
# Auth
# -----------------------------------------------------------------------------
@app.route("/api/login", methods=["POST"])
def api_login():
    try:
        data = request.get_json() or {}
        email = data.get("email")
        senha = data.get("senha")

        # ⚠️ validação simples (sem hash), igual ao seu código original
        user = db.session.query(Usuario).filter_by(email=email, senha=senha).first()
        if not user:
            return (
                jsonify({"success": False, "message": "Email ou senha incorretos"}),
                401,
            )

        login_user(user)  # grava cookie de sessão
        return (
            jsonify(
                {
                    "success": True,
                    "message": "Login bem-sucedido!",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                    },
                }
            ),
            200,
        )
    except Exception as e:
        print("Erro no login:", e)
        return jsonify({"success": False, "message": "Erro interno no servidor"}), 500


@app.route("/api/logout", methods=["POST"])
@login_required
def api_logout():
    try:
        logout_user()
        return jsonify({"success": True}), 200
    except Exception as e:
        print("Erro no logout:", e)
        return jsonify({"success": False, "message": "Erro no logout"}), 500


@app.route("/api/registro", methods=["POST"])
def api_registro():
    data = request.get_json() or {}
    email = data.get("email")
    senha = data.get("senha")
    username = data.get("username")

    if not all([email, senha, username]):
        return jsonify({"success": False, "message": "Preencha todos os campos"}), 400

    if Usuario.query.filter_by(email=email).first():
        return jsonify({"success": False, "message": "Email já cadastrado"}), 409
    if Usuario.query.filter_by(username=username).first():
        return (
            jsonify({"success": False, "message": "Nome de usuário já cadastrado"}),
            409,
        )

    novo_usuario = Usuario(email=email, senha=senha, username=username)
    db.session.add(novo_usuario)
    db.session.commit()

    return jsonify({"success": True, "message": "Usuário registrado com sucesso!"}), 201


@app.route("/api/user_profile", methods=["GET"])
@login_required
def user_profile():
    username = (
        getattr(current_user, "username", None)
        or getattr(current_user, "login", None)
        or getattr(current_user, "nome", None)
        or (
            current_user.email.split("@")[0]
            if getattr(current_user, "email", None)
            else None
        )
    )
    return (
        jsonify(
            {
                "id": getattr(current_user, "id", None),
                "email": getattr(current_user, "email", None),
                "username": username,
            }
        ),
        200,
    )


# -----------------------------------------------------------------------------
# Home (livre)
# -----------------------------------------------------------------------------
@app.route("/api/home", methods=["GET"])
def api_home():
    return jsonify({"message": "Bem-vindo à home!"})


# -----------------------------------------------------------------------------
# Jogos
# -----------------------------------------------------------------------------
@app.route("/api/jogos", methods=["POST"])
def criar_jogo():
    data = request.get_json() or {}
    nome = data.get("nome_jogo")

    if not nome:
        return jsonify({"success": False, "message": "Nome do jogo é obrigatório"}), 400
    if Jogos.query.filter_by(nome_jogo=nome).first():
        return jsonify({"success": False, "message": "Jogo já cadastrado"}), 400

    novo_jogo = Jogos(
        nome_jogo=nome,
        ano_lancamento=data.get("ano_lancamento"),
        plataforma=data.get("plataforma"),
        avaliacao_media=data.get("avaliacao_media"),
        image_url=data.get("image_url"),
    )
    db.session.add(novo_jogo)
    db.session.commit()
    return jsonify({"success": True, "message": "Jogo adicionado com sucesso!"}), 201


@app.route("/api/jogos", methods=["GET"])
def listar_jogos():
    try:
        jogos = Jogos.query.all()
        lista = [
            {
                "id": j.id,
                "nome_jogo": j.nome_jogo,
                "ano_lancamento": j.ano_lancamento,
                "plataforma": j.plataforma,
                "avaliacao_media": j.avaliacao_media,
                "image_url": j.image_url,
            }
            for j in jogos
        ]
        return jsonify(lista), 200
    except Exception as e:
        print(f"Erro ao listar jogos: {e}")
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Erro interno do servidor ao buscar jogos",
                }
            ),
            500,
        )


@app.route("/api/jogos/pesquisa", methods=["GET"])
def pesquisar_jogos():
    termo = request.args.get("q", "")
    resultados = Jogos.query.filter(Jogos.nome_jogo.ilike(f"%{termo}%")).all()
    lista = [
        {
            "id": j.id,
            "nome_jogo": j.nome_jogo,
            "ano_lancamento": j.ano_lancamento,
            "plataforma": j.plataforma,
            "avaliacao_media": j.avaliacao_media,
            "image_url": j.image_url,
        }
        for j in resultados
    ]
    return jsonify(lista), 200


# -----------------------------------------------------------------------------
# Biblioteca (tudo protegido)
# -----------------------------------------------------------------------------
@app.route("/api/biblioteca", methods=["GET"])
@login_required
def get_biblioteca():
    """Lista todos os jogos na biblioteca do usuário logado."""
    entries = Biblioteca.query.filter_by(usuario_id=current_user.id).all()
    biblioteca_list = []
    for entry in entries:
        if entry.jogo:
            biblioteca_list.append(
                {
                    "id": entry.jogo.id,
                    "nome_jogo": entry.jogo.nome_jogo,
                    "status": entry.status,
                    "data_adicao": (
                        entry.data_adicao.isoformat() if entry.data_adicao else None
                    ),
                    "ano_lancamento": entry.jogo.ano_lancamento,
                    "plataforma": entry.jogo.plataforma,
                    "image_url": entry.jogo.image_url,
                }
            )
    return jsonify(biblioteca_list), 200


@app.route("/api/biblioteca/adicionar", methods=["POST"])
@login_required
def adicionar_jogo_biblioteca():
    """Adiciona um jogo à biblioteca do usuário. Espera {'jogo_id': 1, 'status': 'jogando'}"""
    data = request.get_json() or {}
    jogo_id = data.get("jogo_id")
    status = data.get("status", "na fila")

    if not jogo_id:
        return jsonify({"erro": "ID do jogo é obrigatório"}), 400

    jogo = Jogos.query.get(jogo_id)
    if not jogo:
        return jsonify({"erro": "Jogo não encontrado"}), 404

    existe = Biblioteca.query.filter_by(
        usuario_id=current_user.id, jogo_id=jogo_id
    ).first()
    if existe:
        return jsonify({"mensagem": "Jogo já está na sua biblioteca"}), 200

    try:
        nova_entrada = Biblioteca(
            usuario_id=current_user.id, jogo_id=jogo_id, status=status
        )
        db.session.add(nova_entrada)
        db.session.commit()
        return (
            jsonify(
                {
                    "mensagem": f'Jogo "{jogo.nome_jogo}" adicionado com status "{status}"'
                }
            ),
            201,
        )
    except Exception as e:
        db.session.rollback()
        print("Erro ao adicionar à biblioteca:", e)
        return jsonify({"erro": "Erro ao adicionar jogo à biblioteca"}), 500


@app.route("/api/biblioteca/status/<int:jogo_id>", methods=["PUT"])
@login_required
def atualizar_status_jogo(jogo_id):
    """Atualiza o status de um jogo na biblioteca do usuário. Espera {'status': 'completado'}"""
    data = request.get_json() or {}
    novo_status = data.get("status")
    if not novo_status:
        return jsonify({"erro": "Novo status é obrigatório"}), 400

    entrada = Biblioteca.query.filter_by(
        usuario_id=current_user.id, jogo_id=jogo_id
    ).first()
    if not entrada:
        return jsonify({"erro": "Jogo não encontrado na sua biblioteca"}), 404

    try:
        entrada.status = novo_status
        db.session.commit()
        return (
            jsonify(
                {
                    "mensagem": f'Status do jogo (ID: {jogo_id}) atualizado para "{novo_status}"'
                }
            ),
            200,
        )
    except Exception as e:
        db.session.rollback()
        print("Erro ao atualizar status:", e)
        return jsonify({"erro": "Erro ao atualizar status"}), 500


@app.route("/api/biblioteca/remover/<int:jogo_id>", methods=["DELETE"])
@login_required
def remover_jogo_biblioteca(jogo_id):
    """Remove um jogo da biblioteca do usuário."""
    entrada = Biblioteca.query.filter_by(
        usuario_id=current_user.id, jogo_id=jogo_id
    ).first()
    if not entrada:
        return jsonify({"erro": "Jogo não encontrado na sua biblioteca"}), 404

    try:
        db.session.delete(entrada)
        db.session.commit()
        return (
            jsonify({"mensagem": f"Jogo (ID: {jogo_id}) removido da biblioteca"}),
            200,
        )
    except Exception as e:
        db.session.rollback()
        print("Erro ao remover jogo da biblioteca:", e)
        return jsonify({"erro": "Erro ao remover jogo da biblioteca"}), 500


# -----------------------------------------------------------------------------
# Inicialização
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    with app.app_context():
        db.create_all()

        # Usuário padrão (opcional)
        existing_user = Usuario.query.filter_by(email="user@example.com").first()
        if not existing_user:
            novo_usuario = Usuario(
                username="teste", email="user@example.com", senha="senha123"
            )
            db.session.add(novo_usuario)
            db.session.commit()
            print("Usuário 'user@example.com' adicionado com sucesso!")
        else:
            print("Usuário 'user@example.com' já existe no banco de dados.")

    app.run(debug=True, port=5000)

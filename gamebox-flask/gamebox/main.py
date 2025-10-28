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

app = Flask(__name__)
app.secret_key = "brunao"  # troque em produção
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"

# ---------------- CONFIGURAÇÃO DE COOKIES ----------------
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = False

app.config.update(
    SESSION_COOKIE_SAMESITE="Lax",  # ok para localhost:5173 ⇄ 5000 (mesmo site)
    SESSION_COOKIE_SECURE=False,  # True só em HTTPS
    SESSION_COOKIE_DOMAIN=".localhost",  # ajuda o Chrome a tratar corretamente
)


db.init_app(app) #inicializa o banco de dados com a aplicação Flask

# ---------------- CORS (compatível com Vite:5173) ----------------
CORS(
    app,
    resources={r"/api/*": {"origins": ["http://localhost:5173"]}},
    supports_credentials=True,  # envia/recebe cookie de sessão
    allow_headers=["Content-Type", "Authorization"],  # aceita Content-Type no preflight
    expose_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
)

# ---------------- Flask-Login ----------------
lm = LoginManager()
lm.init_app(app)
lm.login_view = "login"


@lm.user_loader
def load_user(user_id):
    try:
        return Usuario.query.get(int(user_id))
    except Exception:
        return None


@lm.unauthorized_handler
def unauthorized():
    return jsonify({"success": False, "message": "unauthorized"}), 401


# ---------------- LOGOUT ----------------
@app.route("/api/logout", methods=["POST"])
@login_required
def api_logout():
    logout_user()
    return jsonify({"success": True, "message": "Logout bem-sucedido!"})


# ---------------- LOGIN ----------------
@app.route("/api/login", methods=["POST"])
def api_login():
    try:
        data = request.get_json() or {}
        email = data.get("email")
        senha = data.get("senha")

        user = db.session.query(Usuario).filter_by(email=email, senha=senha).first()
        if user:
            login_user(user)  # cria cookie de sessão
            return jsonify(
                {
                    "success": True,
                    "message": "Login bem-sucedido!",
                    "user": {"id": user.id, "username": user.username},
                }
            )

        return jsonify({"success": False, "message": "Email ou senha incorretos"}), 401
    except Exception as e:
        print("Erro no login:", e)
        return jsonify({"success": False, "message": "Erro interno no servidor"}), 500


# ---------------- REGISTRO ----------------
@app.route("/api/registro", methods=["POST"])
def api_registro():
    data = request.get_json() or {}
    email = data.get("email")
    senha = data.get("senha")
    username = data.get("username")

    if not all([email, senha, username]):
        return jsonify({"success": False, "message": "Preencha todos os campos"}), 400

    if (
        Usuario.query.filter_by(email=email).first()
        or Usuario.query.filter_by(username=username).first()
    ):
        return (
            jsonify(
                {"success": False, "message": "Email ou nome de usuário já cadastrado"}
            ),
            400,
        )

    novo_usuario = Usuario(email=email, senha=senha, username=username)
    db.session.add(novo_usuario)
    db.session.commit()
    return jsonify({"success": True, "message": "Usuário registrado com sucesso!"})


# ---------------- PERFIL (protegido) ----------------
@app.route("/api/user_profile", methods=["GET"])
@login_required
def user_profile():
    try:
        return (
            jsonify(
                {
                    "success": True,
                    "id": current_user.id,
                    "email": current_user.email,
                    "username": current_user.username,
                }
            ),
            200,
        )
    except Exception as e:
        print("Erro ao carregar perfil:", e)
        return jsonify({"success": False, "message": "Erro ao carregar perfil"}), 500


# ---------------- HOME ----------------
@app.route("/api/home", methods=["GET"])
def api_home():
    return jsonify({"message": "Bem-vindo à home!"})


# ---------------- CRIAR JOGO ----------------
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


# ---------------- LISTAR JOGOS ----------------
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
        return jsonify(lista)
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


# ---------------- JOGOS RECENTES ----------------
@app.route("/api/jogos/recentes", methods=["GET"])
def get_jogos_recentes():
    jogos = Jogos.query.order_by(Jogos.id.desc()).limit(4).all()
    jogos_data = [
        {
            "id": jogo.id,
            "nome_jogo": jogo.nome_jogo,
            "ano_lancamento": jogo.ano_lancamento,
            "plataforma": jogo.plataforma,
            "avaliacao_media": jogo.avaliacao_media,
            "image_url": getattr(jogo, "image_url", None),
        }
        for jogo in jogos
    ]
    return jsonify(jogos_data)


# ---------------- PESQUISAR JOGOS ----------------
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
    return jsonify(lista)


# ---------------- OBTÉM 1 JOGO POR ID ----------------
@app.route("/api/jogos/<int:id>", methods=["GET"])
def get_jogo(id):
    jogo = db.session.query(Jogos).get(id)
    if not jogo:
        return jsonify({"error": "Jogo não encontrado"}), 404

    return jsonify(
        {
            "id": jogo.id,
            "nome_jogo": jogo.nome_jogo,
            "ano_lancamento": jogo.ano_lancamento,
            "plataforma": jogo.plataforma,
            "avaliacao_media": jogo.avaliacao_media,
            "image_url": getattr(jogo, "image_url", None),
        }
    )


# ---------------- BIBLIOTECA (protegidas) ----------------
@app.route("/api/biblioteca", methods=["GET"])
@login_required
def get_biblioteca():
    entries = Biblioteca.query.filter_by(usuario_id=current_user.id).all()
    out = []
    for e in entries:
        if e.jogo:
            out.append(
                {
                    "id": e.jogo.id,
                    "nome_jogo": e.jogo.nome_jogo,
                    "status": e.status,
                    "data_adicao": e.data_adicao.isoformat(),
                    "ano_lancamento": e.jogo.ano_lancamento,
                    "plataforma": e.jogo.plataforma,
                    "image_url": e.jogo.image_url,
                }
            )
    return jsonify(out), 200

# ---------------- ADICIONAR JOGO À BIBLIOTECA ----------------
@app.route("/api/biblioteca/adicionar", methods=["POST"])
@login_required
def adicionar_jogo_biblioteca():
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
                    "mensagem": f'Jogo "{jogo.nome_jogo}" adicionado à biblioteca com status "{status}"'
                }
            ),
            201,
        )
    except Exception:
        db.session.rollback()
        return jsonify({"erro": "Erro ao adicionar jogo à biblioteca"}), 500


# ---------------- ATUALIZAR STATUS DE JOGO ----------------
@app.route("/api/biblioteca/status/<int:jogo_id>", methods=["PUT"])
@login_required
def atualizar_status_jogo(jogo_id):
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
    except Exception:
        db.session.rollback()
        return jsonify({"erro": "Erro ao atualizar status"}), 500


# ---------------- REMOVER JOGO DA BIBLIOTECA ----------------
@app.route("/api/biblioteca/remover/<int:jogo_id>", methods=["DELETE"])
@login_required
def remover_jogo_biblioteca(jogo_id):
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
    except Exception:
        db.session.rollback()
        return jsonify({"erro": "Erro ao remover jogo da biblioteca"}), 500


# ---------------- INICIALIZAÇÃO ----------------
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        # cria usuário padrão se não existir
        if not Usuario.query.filter_by(email="user@example.com").first():
            db.session.add(
                Usuario(username="teste", email="user@example.com", senha="senha123")
            )
            db.session.commit()
            print("Usuário 'user@example.com' adicionado.")
        else:
            print("Usuário 'user@example.com' já existe.")

    app.run(debug=True, port=5000)

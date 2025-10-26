from flask import Flask, request, jsonify 
from flask_cors import CORS
from flask_login import LoginManager, login_user, login_required, current_user
from db import db
from models import Usuario, Jogos, Biblioteca
import json

app = Flask(__name__)
app.secret_key = "brunao"  # ⚠️ Em produção, use variável de ambiente!
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
db.init_app(app)
CORS(app, origins=["http://localhost:5173"])

lm = LoginManager(app)
lm.login_view = "login"

@lm.user_loader
def user_loader(id):
    return db.session.query(Usuario).filter_by(id=id).first()

# ---------------- LOGIN ----------------
@app.route("/api/login", methods=["POST"])
def api_login():
    try:
        data = request.get_json()
        email = data.get("email")
        senha = data.get("senha")

        user = db.session.query(Usuario).filter_by(email=email, senha=senha).first()

        if user:
            login_user(user)
            return jsonify({
                "success": True,
                "message": "Login bem-sucedido!",
                "user": {
                    "id": user.id,
                    "username": user.username
                }
            })

        return jsonify({
            "success": False,
            "message": "Email ou senha incorretos"
        }), 401

    except Exception as e:
        print("Erro no login:", e)
        return jsonify({
            "success": False,
            "message": "Erro interno no servidor"
        }), 500

# ---------------- REGISTRO ----------------
@app.route("/api/registro", methods=["POST"])
def api_registro():
    data = request.get_json()
    email = data.get("email")
    senha = data.get("senha")
    username = data.get("username")

    if not all([email, senha, username]):
        return jsonify({"success": False, "message": "Preencha todos os campos"}), 400

    if Usuario.query.filter_by(email=email).first() or Usuario.query.filter_by(username=username).first():
        return jsonify({"success": False, "message": "Email ou nome de usuário já cadastrado"}), 400

    novo_usuario = Usuario(email=email, senha=senha, username=username)
    db.session.add(novo_usuario)
    db.session.commit()

    return jsonify({"success": True, "message": "Usuário registrado com sucesso!"})

# ---------------- HOME ----------------
@app.route("/api/home", methods=["GET"])
def api_home():
    return jsonify({"message": "Bem-vindo à home!"})

# ---------------- CRIAR JOGO ----------------
@app.route("/api/jogos", methods=["POST"])
def criar_jogo():
    data = request.get_json()
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
        image_url=data.get("image_url")
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
                "image_url": j.image_url
            }
            for j in jogos
        ]
        return jsonify(lista)
    except Exception as e:
        # Imprime o erro no console do servidor para você ver
        print(f"Erro ao listar jogos: {e}") 
        # Retorna um erro 500 com uma mensagem de erro genérica para o frontend
        return jsonify({"success": False, "message": "Erro interno do servidor ao buscar jogos"}), 500

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
            "image_url": j.image_url
        }
        for j in resultados
    ]
    return jsonify(lista)

# ---------------- INICIALIZAÇÃO ----------------
if __name__ == "__main__":
    with app.app_context():
        db.create_all()

        # cria usuário padrão, se quiser
        existing_user = Usuario.query.filter_by(email='user@example.com').first()
        if not existing_user:
            novo_usuario = Usuario(username='teste', email='user@example.com', senha='senha123')
            db.session.add(novo_usuario)
            db.session.commit()
            print("Usuário 'user@example.com' adicionado com sucesso!")
        else:
            print("Usuário 'user@example.com' já existe no banco de dados.")

    app.run(debug=True, port=5000)


@app.route('/api/biblioteca', methods=['GET'])
@login_required
def get_biblioteca():
    """Lista todos os jogos na biblioteca do usuário logado."""
    
    # Busca todas as entradas da biblioteca para o usuário atual
    biblioteca_entries = Biblioteca.query.filter_by(usuario_id=current_user.id).all()
    
    # Prepara a lista de jogos com seus respectivos status
    biblioteca_list = []
    for entry in biblioteca_entries:
        if entry.jogo: # entry.jogo é o objeto Jogos relacionado
            biblioteca_list.append({
                'id': entry.jogo.id,
                'nome_jogo': entry.jogo.nome_jogo,
                'status': entry.status,
                'data_adicao': entry.data_adicao.isoformat(),
                # Inclua outros campos do jogo que você precisa no frontend
                'ano_lancamento': entry.jogo.ano_lancamento,
                'plataforma': entry.jogo.plataforma,
                'image_url': entry.jogo.image_url,
            })
            
    return jsonify(biblioteca_list), 200


@app.route('/api/biblioteca/adicionar', methods=['POST'])
@login_required
def adicionar_jogo_biblioteca():
    """Adiciona um jogo à biblioteca do usuário. Espera {'jogo_id': 1, 'status': 'jogando'}"""
    data = request.get_json()
    jogo_id = data.get('jogo_id')
    status = data.get('status', 'na fila') # Status padrão
    
    if not jogo_id:
        return jsonify({'erro': 'ID do jogo é obrigatório'}), 400

    jogo = Jogos.query.get(jogo_id)
    if not jogo:
        return jsonify({'erro': 'Jogo não encontrado'}), 404

    # Verifica se o jogo já está na biblioteca
    existe = Biblioteca.query.filter_by(usuario_id=current_user.id, jogo_id=jogo_id).first()
    if existe:
        return jsonify({'mensagem': 'Jogo já está na sua biblioteca'}), 200

    try:
        nova_entrada = Biblioteca(
            usuario_id=current_user.id,
            jogo_id=jogo_id,
            status=status
        )
        db.session.add(nova_entrada)
        db.session.commit()
        return jsonify({'mensagem': f'Jogo "{jogo.nome_jogo}" adicionado à biblioteca com status "{status}"'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': 'Erro ao adicionar jogo à biblioteca'}), 500


@app.route('/api/biblioteca/status/<int:jogo_id>', methods=['PUT'])
@login_required
def atualizar_status_jogo(jogo_id):
    """Atualiza o status de um jogo na biblioteca do usuário. Espera {'status': 'completado'}"""
    data = request.get_json()
    novo_status = data.get('status')
    
    if not novo_status:
        return jsonify({'erro': 'Novo status é obrigatório'}), 400
        
    entrada = Biblioteca.query.filter_by(usuario_id=current_user.id, jogo_id=jogo_id).first()

    if not entrada:
        return jsonify({'erro': 'Jogo não encontrado na sua biblioteca'}), 404

    try:
        entrada.status = novo_status
        db.session.commit()
        return jsonify({'mensagem': f'Status do jogo (ID: {jogo_id}) atualizado para "{novo_status}"'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': 'Erro ao atualizar status'}), 500


@app.route('/api/biblioteca/remover/<int:jogo_id>', methods=['DELETE'])
@login_required
def remover_jogo_biblioteca(jogo_id):
    """Remove um jogo da biblioteca do usuário."""
    
    entrada = Biblioteca.query.filter_by(usuario_id=current_user.id, jogo_id=jogo_id).first()

    if not entrada:
        return jsonify({'erro': 'Jogo não encontrado na sua biblioteca'}), 404

    try:
        db.session.delete(entrada)
        db.session.commit()
        return jsonify({'mensagem': f'Jogo (ID: {jogo_id}) removido da biblioteca'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': 'Erro ao remover jogo da biblioteca'}), 500


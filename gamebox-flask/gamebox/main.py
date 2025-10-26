from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_login import LoginManager, login_user
from db import db
from models import Usuario  # Certifique-se de que o import está correto
import json  # Para manipular respostas

app = Flask(__name__)
app.secret_key = "brunao"  # Use uma chave mais segura em produção
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
db.init_app(app)
CORS(app, origins=["http://localhost:5173"])  # Permite requisições do React (ajuste se necessário)

lm = LoginManager(app)
lm.login_view = "login"  # Isso pode ser ajustado para um endpoint API

@lm.user_loader
def user_loader(id):
    return db.session.query(Usuario).filter_by(id=id).first()

# Endpoint para login (agora retorna JSON)
@app.route("/api/login", methods=["POST"])
def api_login():
    if request.method == "POST":
        data = request.get_json()  # Obtém dados do corpo da requisição (em JSON)
        email = data.get("email")
        senha = data.get("senha")
        
        user = db.session.query(Usuario).filter_by(email=email, senha=senha).first()
        if user:
            login_user(user)  # Autentica o usuário (se você usar sessões)
            return jsonify({"success": True, "message": "Login bem-sucedido", "user_id": user.id})  # Retorna sucesso
        else:
            return jsonify({"success": False, "message": "Email ou senha incorretos"}), 401  # Erro de autenticação

# Endpoint para registro (agora retorna JSON)
@app.route("/api/registro", methods=["POST"])
def api_registro():
    if request.method == "POST":
        data = request.get_json()  # Obtém dados do corpo da requisição
        email = data.get("email")
        senha = data.get("senha")  # Em produção, hasheie a senha!
        
        if not email or not senha:
            return jsonify({"success": False, "message": "Email e senha são obrigatórios"}), 400
        
        # Verifica se o email já existe
        existing_user = db.session.query(Usuario).filter_by(email=email).first()
        if existing_user:
            return jsonify({"success": False, "message": "Email já cadastrado"}), 400
        
        novo_usuario = Usuario(email=email, senha=senha)  # Em produção, use hashing
        db.session.add(novo_usuario)
        db.session.commit()
        login_user(novo_usuario)  # Autentica automaticamente
        return jsonify({"success": True, "message": "Usuário cadastrado com sucesso", "user_id": novo_usuario.id}), 201

# Outros endpoints, se necessário (ex.: para home ou listar usuários)
@app.route("/api/home", methods=["GET"])
def api_home():
    return jsonify({"message": "Bem-vindo à home!"})

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        
        # Parte para adicionar usuário padrão (mantida como estava)
        existing_user = Usuario.query.filter_by(email='user@example.com').first()
        if not existing_user:
            novo_usuario = Usuario(email='user@example.com', senha='senha123')
            db.session.add(novo_usuario)
            db.session.commit()
            print("Usuário 'user@example.com' adicionado com sucesso!")
        else:
            print("Usuário 'user@example.com' já existe no banco de dados.")
    
    app.run(debug=True, port=5000)  # Roda na porta 5000
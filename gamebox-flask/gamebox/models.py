# models.py
from db import db
from flask_login import UserMixin
from datetime import datetime # Importação adicionada

class Biblioteca(db.Model):
    __tablename__ = 'biblioteca'

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    jogo_id = db.Column(db.Integer, db.ForeignKey('jogos.id'), nullable=False)
    status = db.Column(db.String(50), nullable=False) # Ex: 'jogando', 'completado', 'abandonado', 'na fila'
    data_adicao = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint('usuario_id', 'jogo_id', name='_usuario_jogo_uc'),)

    usuario = db.relationship('Usuario', backref=db.backref('biblioteca_entries', lazy=True))
    jogo = db.relationship('Jogos', backref=db.backref('biblioteca_entries', lazy=True))


class Usuario(UserMixin, db.Model):
    __tablename__ = 'usuarios'
    # ... (campos existentes)
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)  
    email = db.Column(db.String(200), unique=True, nullable=False)
    senha = db.Column(db.String(200), nullable=False)


class Jogos(db.Model):
    __tablename__ = 'jogos'
    # ... (campos existentes)
    id = db.Column(db.Integer, primary_key=True)
    nome_jogo = db.Column(db.String(200), unique=True, nullable=False)
    ano_lancamento = db.Column(db.Integer)
    plataforma = db.Column(db.String(200))
    avaliacao_media = db.Column(db.Float)
    image_url = db.Column(db.String(255))

from db import db
from flask_login import UserMixin

class Usuario(UserMixin, db.Model):
  __tablename__ = 'usuarios'

  id = db.Column(db.Integer, primary_key=True)
  email = db.Column(db.String(200), unique=True)
  senha = db.Column(db.String(200))

class Jogos(UserMixin, db.Model):
  __tablename__= 'jogos'

  id = db.Column(db.Integer, primary_key = True)
  nome_jogo = db.Column(db.String(200), unique = True)
  ano_lancamento = db.Column(db.Integer, primary_key= True)
  platforma = db.Column(db.String(200))
  avaliacao_media = db.Column(db.Float)

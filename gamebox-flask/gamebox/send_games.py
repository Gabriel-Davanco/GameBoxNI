from main import app, db
from models import Jogos

jogos_iniciais = [
    Jogos(
        nome_jogo="The Witcher 3: Wild Hunt",
        ano_lancamento=2015,
        plataforma="PC",
        avaliacao_media=9.5,
        image_url="https://upload.wikimedia.org/wikipedia/pt/thumb/0/06/TW3_Wild_Hunt.png/330px-TW3_Wild_Hunt.png"
    ),
    Jogos(
        nome_jogo="Red Dead Redemption 2",
        ano_lancamento=2018,
        plataforma="PlayStation 4",
        avaliacao_media=9.8,
        image_url="https://upload.wikimedia.org/wikipedia/en/thumb/4/44/Red_Dead_Redemption_II.jpg/250px-Red_Dead_Redemption_II.jpg"
    ),
    Jogos(
        nome_jogo="Hollow Knight",
        ano_lancamento=2017,
        plataforma="PC",
        avaliacao_media=9.0,
        image_url="https://upload.wikimedia.org/wikipedia/en/thumb/0/04/Hollow_Knight_first_cover_art.webp/250px-Hollow_Knight_first_cover_art.webp.png"
    ),
    Jogos(
        nome_jogo="God of War",
        ano_lancamento=2018,
        plataforma="PlayStation 4",
        avaliacao_media=9.6,
        image_url="https://upload.wikimedia.org/wikipedia/en/thumb/e/ee/God_of_War_Ragnar%C3%B6k_cover.jpg/250px-God_of_War_Ragnar%C3%B6k_cover.jpg"
    ),
]

with app.app_context():
    db.create_all()
    if not Jogos.query.first():
        db.session.bulk_save_objects(jogos_iniciais)
        db.session.commit()
        print("Jogos iniciais com imagens adicionados com sucesso!")
    else:
        print("Jogos já existem no banco de dados.")




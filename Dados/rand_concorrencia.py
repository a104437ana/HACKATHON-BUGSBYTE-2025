import json
import random

def calc_price(price, variacao):
    media = variacao / 2
    return price * (1 + (float(random.randint(0, variacao) - media) / 100))

filename = "data.json"

with open(filename, "r", encoding="utf-8") as file:
    data = json.load(file)

new_products = []

for product in data["products_info"]:
    continente_price = float(product["product_price"])
    variacao = product["20231226"]
    media_price = continente_price / variacao
    pingo_doce_price = calc_price(media_price, 10)
    mercadona_price = calc_price(media_price, 10)
    minipreco_price = calc_price(media_price, 10)
    product["product_price"] = continente_price
    product["pingo_doce_price"] = round(pingo_doce_price, 2)
    product["mercadona_price"] = round(mercadona_price, 2)
    product["minipreco_price"] = round(minipreco_price, 2)
#    print("Continente: " + str(continente_price) + " " + str(variacao))
#    print("Pingo doce: " + str(pingo_doce_price))
#    print("Mercadona : " + str(mercadona_price))
#    print("Mini preco: " + str(minipreco_price))

with open(filename, "w", encoding="utf-8") as file:
    json.dump(data, file, indent=2, ensure_ascii=False)

print("Arquivo atualizado com sucesso!")

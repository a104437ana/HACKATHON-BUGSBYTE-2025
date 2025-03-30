import json

# Nome do arquivo JSON
filename = "data.json"

# Carregar os dados do arquivo
with open(filename, "r", encoding="utf-8") as file:
    data = json.load(file)

# Filtrar os objetos que possuem a chave 'product_price'
filtered_products = [
    product for product in data["products_info"] if ("product_price" in product) and ("preco_minipreco" in product)
]

# Atualizar os dados com a lista filtrada
data["products_info"] = filtered_products

# Salvar os dados filtrados de volta no mesmo arquivo
with open(filename, "w", encoding="utf-8") as file:
    json.dump(data, file, indent=2, ensure_ascii=False)

print("Arquivo atualizado com sucesso!")

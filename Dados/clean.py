import json

filename = "data.json"

with open(filename, "r", encoding="utf-8") as file:
    data = json.load(file)

filtered_products = [
    product for product in data["products_info"] if ("product_price" in product)
]

data["products_info"] = filtered_products

with open(filename, "w", encoding="utf-8") as file:
    json.dump(data, file, indent=2, ensure_ascii=False)

print("Arquivo atualizado com sucesso!")

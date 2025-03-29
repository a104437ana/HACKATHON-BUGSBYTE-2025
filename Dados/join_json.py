import json
import sys

def load_json(json_f):
    try:
        with open(json_f, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def save_json(json_f, json_obj):
    with open(json_f, 'w', encoding='utf-8') as f:
        json.dump(json_obj, f, indent=2, ensure_ascii=False)

json_f = sys.argv[1]
join_f = sys.argv[2]
id = sys.argv[3]

dados = load_json(json_f)
list = load_json(join_f)

dados[id] = list

save_json(json_f, dados)

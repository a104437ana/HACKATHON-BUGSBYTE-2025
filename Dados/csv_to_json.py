import csv
import json
import sys

def parse_value(value, column_type):
    try:
        if column_type == 'float':
            value = value.replace(',', '.')
            return float(value)
        elif column_type == 'int':
            return int(value)
        elif column_type == 'str':
            return str(value)
        else:
            return value
    except ValueError:
        return value

def get_column_types(column_types, column_names):
    column_types_list = column_types.split(',')

    if len(column_types_list) != len(column_names):
        raise ValueError("O número de tipos não corresponde ao número de colunas.")
    
    return dict(zip(column_names, column_types_list))

def get_column_rename_map(rename_list):
    rename_map = {}
    for item in rename_list.split(','):
        original, new_name = item.split(':')
        rename_map[original] = new_name
    return rename_map

def list_to_dict(column_types_list):
    column_types_dict = {}
    for item in column_types_list.split(','):
        column, column_type = item.split(':')
        column_types_dict[column] = column_type
    return column_types_dict

def csv_to_json(csv_f, json_f, separator, column_types, column_rename):
    with open(csv_f, 'r', encoding='utf-8') as f:
        csv_reader = csv.DictReader(f, delimiter=separator)
        column_names = csv_reader.fieldnames
        column_rename_map = get_column_rename_map(column_rename)
        csv_reader.fieldnames = [column_rename_map.get(col, col) for col in column_names]
        column_names = csv_reader.fieldnames
        column_types_mapping = get_column_types(column_types, column_names)
        data = []

        for line in csv_reader:
            transformed_line = {}
            for key, value in line.items():
                column_type = column_types_mapping[key]
                transformed_line[key] = parse_value(value, column_type)
            data.append(transformed_line)

    with open(json_f, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

csv_f = sys.argv[1]         # ficheiro csv
json_f = sys.argv[2]        # ficheiro json
separator = sys.argv[3]     # separador
column_types = sys.argv[4]  # lista de tipos das colunas separada por ',' ex: "str,int,float"
column_rename = sys.argv[5] # dicionário de nome da coluna para novo nome separado por ',' ex: "col1:id,col2:nome"

csv_to_json(csv_f, json_f, separator, column_types, column_rename)

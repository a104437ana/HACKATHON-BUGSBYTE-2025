import csv
import json
import sys
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from scipy.optimize import minimize

def csv_reg(csv_f, separator, id, value, count):
    with open(csv_f, 'r', encoding='utf-8') as f:
        csv_reader = csv.DictReader(f, delimiter=separator)
        dict = {}

        for line in csv_reader:
            id_line = line[id]
            value_line = line[value]
            count_line = line[count]
            if id_line not in dict.keys():
                dict[id_line] = []
            dict[id_line].append((float(value_line), float(count_line)))

        dict_linear = {}

        for key in dict.keys():
            x = []
            y = []
            for points in dict[key]:
                x.append(points[0])
                y.append(points[1])
            x_np = np.array(x).reshape(-1, 1)
            y_np = np.array(y)

            model = LinearRegression()

            model.fit(x_np, y_np)

            intercept = model.intercept_
            slope = model.coef_

            dict_linear[key] = (intercept, slope)

        for key in dict_linear.keys():
            print(f'Id: {key}')
            print(f"Intercepto (b): {dict_linear[key][0]}")
            print(f"Coeficiente angular (m): {dict_linear[key][1][0]}")

def csv_reg_pol(csv_f, separator, id, value, count, degree):
    with open(csv_f, 'r', encoding='utf-8') as f:
        csv_reader = csv.DictReader(f, delimiter=separator)
        dict = {}

        for line in csv_reader:
            id_line = line[id]
            value_line = line[value]
            count_line = line[count]
            if id_line not in dict.keys():
                dict[id_line] = []
            dict[id_line].append((float(value_line), float(count_line)))

        dict_linear = {}

        for key in dict.keys():
            x = []
            y = []
            for points in dict[key]:
                x.append(points[0])
                y.append(points[1])
            coeff = np.polyfit(x, y, 2)
            polynomial = np.poly1d(coeff)

            res = minimize(lambda x: -polynomial(x), x0=0)
            max_x = res.x[0]
            max_y = polynomial(max_x)

            dict_linear[key] = (max_x, max_y)

        for key in dict_linear.keys():
            print(f'Id: {key}')
            print(f"max x: {dict_linear[key][0]}")
            print(f"max y: {dict_linear[key][1]}")

csv_f = sys.argv[1]         # ficheiro csv
separator = sys.argv[2]
id = sys.argv[3]
value = sys.argv[4]
count = sys.argv[5]

csv_reg(csv_f, separator, id, value, count)
csv_reg_pol(csv_f, separator, id, value, count, 2)

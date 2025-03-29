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

def eval(x, polynomial):
    return np.polyval(polynomial, x)

def eval_derivative(x, polynomial_derivate):
    return np.polyval(polynomial_derivate, x)

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

        dict_polynomial = {}

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

            polynomial_derivate = np.polyder(polynomial)
            critical_points = np.roots(polynomial_derivate)
            critical_points = critical_points[np.isreal(critical_points)]
            critical_point = critical_points[0].real
            critical_y = polynomial(critical_point)

#            res_der = minimize(lambda x: eval_derivative(x, polynomial_derivate), x0=0, bounds=[(0.6, 2)])
            res_der = minimize(lambda x: eval_derivative(x, polynomial_derivate), x0=0, bounds=[(0, 6)])
            min_x_der = res_der.x[0]
            min_y_der = eval_derivative(min_x_der, polynomial_derivate)

            dict_polynomial[key] = (max_x, max_y, critical_point, critical_y, min_x_der, min_y_der)

        for key in dict_polynomial.keys():
            print(f'Id: {key}')
            print(f"max x: {dict_polynomial[key][0]}")
            print(f"max y: {dict_polynomial[key][1]}")
            print(f"der x: {dict_polynomial[key][2]}")
            print(f"der y: {dict_polynomial[key][3]}")
            print(f"mxd x: {dict_polynomial[key][4]}")
            print(f"mxd y: {dict_polynomial[key][5]}")

        plt.figure(figsize=(10, 6))

        x_vals = []
        y_vals_polynomial = []
        y_vals_derivative = []
        for i in range(0,100):
            x_vals.append(i/10)
            y_vals_polynomial.append(eval(i/10, polynomial))
            y_vals_derivative.append(eval_derivative(i/10, polynomial_derivate))

        plt.plot(x_vals, y_vals_polynomial, label="Polinômio", color='b', linestyle='-', linewidth=2)

        plt.plot(x_vals, y_vals_derivative, label="Derivada", color='r', linestyle='--', linewidth=2)

        # Adicionar título e legendas
        plt.title("Gráfico do Polinômio e Sua Derivada")
        plt.xlabel("x")
        plt.ylabel("y")
        plt.axhline(0, color='black',linewidth=1)  # Linha horizontal (eixo x)
        plt.axvline(0, color='black',linewidth=1)  # Linha vertical (eixo y)
        plt.legend()

        # Mostrar o gráfico
        plt.grid(True)
        plt.show()

csv_f = sys.argv[1]         # ficheiro csv
separator = sys.argv[2]
id = sys.argv[3]
value = sys.argv[4]
count = sys.argv[5]

#csv_reg(csv_f, separator, id, value, count)
csv_reg_pol(csv_f, separator, id, value, count, 3)

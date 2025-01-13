from flask import Flask, render_template, request, jsonify
import math

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    n = data.get('n')  
    p = data.get('p')  
    k = data.get('k')  

    if n is None or p is None or k is None or not (0 <= p <= 1) or not (0 <= k <= n):
        return jsonify({'error': 'Invalid input'}), 400

    pmf_values = []  
    cdf_values = []  
    cumulative_probability = 0
    calculation_steps = f"Hasil:\nProbabilitas Kumulatif (P(X ≤ {k})): "

    for i in range(n + 1):
        combination = math.comb(n, i)
        probability = combination * (p ** i) * ((1 - p) ** (n - i))
        pmf_values.append(probability)
        cumulative_probability += probability
        cdf_values.append(cumulative_probability)

    calculation_steps += f"{round(cumulative_probability, 4)}\n\n"
    calculation_steps += "Hasil P(X=k) untuk setiap k:\n"

    for i in range(k + 1):  
        probability = pmf_values[i]
        calculation_steps += f"P(X = {i}) = {round(probability, 4)}\n"

    return jsonify({
        'pmf_values': pmf_values,
        'cdf_values': cdf_values,
        'calculation_steps': calculation_steps
    })

if __name__ == '__main__':
    app.run(debug=True)

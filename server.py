from flask import Flask, jsonify
from flask_cors import CORS
from model import SupplyChainModel

app = Flask(__name__)
CORS(app)
model = SupplyChainModel(num_suppliers=3, num_retailers=2)

@app.route('/api/step', methods=['GET'])
def run_step():
    model.step()
    return jsonify({"messages": model.messages, "data": model.data})

@app.route('/api/reset', methods=['GET'])
def reset():
    global model
    model = SupplyChainModel(num_suppliers=3, num_retailers=2)
    return jsonify({"status": "reset"})

if __name__ == '__main__':
    app.run(debug=True)
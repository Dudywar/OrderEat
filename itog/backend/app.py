from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import firebase_admin
from firebase_admin import credentials, db

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "https://nnmz.ru"}})
socketio = SocketIO(app, cors_allowed_origins="https://nnmz.ru")

# Инициализация Firebase
cred = credentials.Certificate("/run/secrets/firebase_creds")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://zakazedi-3c538-default-rtdb.europe-west1.firebasedatabase.app/'
})
ref = db.reference("/")

@app.route("/", methods=['POST'])
def order():
    data = request.get_json()
    new_order_ref = ref.push()  # Создаём новый заказ
    order_id = new_order_ref.key  # Получаем Firebase ключ (например, -OMw3x15H72_DupohsdS)
    new_order_ref.set({
        "product": data["product"],
        "session_id": data["session_id"]
    })
    socketio.emit("new_order", {
        "id": order_id,  # Передаём ключ как идентификатор
        "product": data["product"],
        "session_id": data["session_id"]
    })
    return jsonify({"message": "Заказ получен", "id": order_id}), 200

@app.route("/complete_order", methods=['POST'])
def complete_order():
    zak = request.get_json()
    order_id = zak["id"]  # Используем Firebase ключ
    order = ref.child(order_id).get()
    if order:
        session_id = order.get("session_id")
        ref.child(order_id).delete()
        socketio.emit('order_completed', {
            'order_id': order_id,  # Передаём ключ в событие
            'session_id': session_id
        })
        return jsonify({'message': 'Заказ завершен!'})
    return jsonify({'error': 'Заказ не найден'}), 404

@app.route("/get_orders", methods=['GET'])
def get_orders():
    orders = ref.get()
    return jsonify(orders)

@socketio.on('connect')
def handle_connect():
    print('Клиент подключен')

if __name__ == "__main__":
    socketio.run(app, port=8000)
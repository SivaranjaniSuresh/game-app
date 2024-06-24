from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
from bson.json_util import dumps

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

client = MongoClient('mongodb+srv://navalea:qwertyuiop0801@devops.n64whgg.mongodb.net/?retryWrites=true&w=majority&appName=DevOps')
db = client['locationApp']
users = db['users']
locations = db['locations']

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data['username']
    password = data['password']
    if users.find_one({'username': username}):
        return jsonify({'status': 'error', 'message': 'User already exists'})
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    users.insert_one({'username': username, 'password': hashed_password})
    return jsonify({'status': 'success', 'message': 'User registered'})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']
    user = users.find_one({'username': username})
    if user and bcrypt.check_password_hash(user['password'], password):
        return jsonify({'status': 'success', 'message': 'Logged in'})
    return jsonify({'status': 'error', 'message': 'Invalid credentials'})

@app.route('/update_location', methods=['POST'])
def update_location():
    data = request.json
    username = data['username']
    location = data['location']
    locations.update_one(
        {'username': username},
        {'$set': {'location': dumps(location)}},
        upsert=True
    )
    return jsonify({'status': 'success', 'message': 'Location updated'})

@app.route('/get_locations', methods=['GET'])
def get_locations():
    all_locations = {loc['username']: loc['location'] for loc in locations.find()}
    return jsonify(all_locations)

if __name__ == '__main__':
    app.run(debug=True)

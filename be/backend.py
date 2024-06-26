from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
from bson.json_util import dumps

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

# MongoDB connection
client = MongoClient('mongodb+srv://admin:admin@cluster0.zckdq7s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
db = client['locationApp']
users = db['users']
locations = db['locations']

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'status': 'error', 'message': 'Username and password are required'})

    if users.find_one({'username': username}):
        return jsonify({'status': 'error', 'message': 'User already exists'})

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    users.insert_one({'username': username, 'password': hashed_password})
    return jsonify({'status': 'success', 'message': 'User registered'})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'status': 'error', 'message': 'Username and password are required'})

    user = users.find_one({'username': username})
    if user and bcrypt.check_password_hash(user['password'], password):
        return jsonify({'status': 'success', 'message': 'Logged in'})
    else:
        return jsonify({'status': 'error', 'message': 'Invalid credentials'})

@app.route('/update_location', methods=['POST'])
def update_location():
    data = request.json
    username = data.get('username')
    location = data.get('location')

    if not username or not location:
        return jsonify({'status': 'error', 'message': 'Username and location are required'})

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

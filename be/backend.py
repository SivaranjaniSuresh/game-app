from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
from bson.json_util import dumps, loads
from flask_socketio import SocketIO
from rejson import Client, Path
import json
import threading


app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# MongoDB connection
client = MongoClient('mongodb+srv://admin:admin@cluster0.zckdq7s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
db = client['locationApp']
users = db['users']
locations = db['locations']
items_collection = db['items']

# Initialize RedisJSON connection
rj = Client(host='redis-12258.c277.us-east-1-3.ec2.redns.redis-cloud.com', port=12258, decode_responses=True, password='HfrK5jYWcyYp9Mq5ce6iL6RMzs13K6cG')

def location_worker():
    print("Location worker started")
    while True:
        message = rj.blpop('location_updates')
        if message:
            _, message = message
            message = json.loads(message)
            username, location = message
            print(f"Processing location for {username}: {location}")
            rj.jsonset(username, Path.rootPath(), location)

# Start the location worker in a separate thread
threading.Thread(target=location_worker, daemon=True).start()

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
    users.insert_one({'username': username, 'password': hashed_password, 'collected_items': 0})
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

    if isinstance(location, list):  # Convert location to JSON string if it's a list
        location = dumps(location)

    # locations.update_one(
    #     {'username': username},
    #     {'$set': {'location': location}}, 
    #     upsert=True
    # )

    # print(f"Updating location for {username}: {location}")
    rj.rpush('location_updates', json.dumps((username, location)))

    user = users.find_one({'username': username})
    collected_items = user.get('collected_items', 0)  # Use get to handle missing field

    # Check if the user collected any new items
    new_items_collected = check_item_collection(username, location)
    if new_items_collected:
        collected_items += new_items_collected
        users.update_one({'username': username}, {'$set': {'collected_items': collected_items}})

    leaderboard = get_leaderboard()
    socketio.emit('update_leaderboard', leaderboard)  # Emit updated leaderboard to all clients
    return jsonify({'status': 'success', 'message': 'Location updated', 'leaderboard': leaderboard})

# @app.route('/update_location', methods=['POST'])
# def update_location():
#     data = request.json
#     username = data['username']
#     location = data['location']
#     print(f"Updating location for {username}: {location}")
#     rj.rpush('location_updates', json.dumps((username, location)))
#     return jsonify({'status': 'success', 'message': 'Location update queued'})

# @app.route('/get_locations', methods=['GET'])
# def get_locations():
#     all_locations = {loc['username']: loc['location'] for loc in locations.find()}
#     return jsonify(all_locations)

@app.route('/get_locations', methods=['GET'])
def get_locations():
    all_keys = rj.keys('*')
    all_locations = {key: rj.jsonget(key) for key in all_keys if key != 'location_updates'}
    return jsonify(all_locations)

@app.route('/leaderboard', methods=['GET'])
def leaderboard():
    leaderboard = get_leaderboard()
    return jsonify(leaderboard)

def get_leaderboard():
    return list(users.find({}, {'_id': 0, 'username': 1, 'collected_items': 1}).sort('collected_items', -1))

def check_item_collection(username, location):
    user_location = locations.find_one({'username': username})
    if user_location:
        current_location = user_location.get('location')
        if isinstance(current_location, list):  # Check if current_location is a list
            current_location = dumps(current_location)  # Convert list to JSON string
        else:
            current_location = str(current_location)  # Ensure it's a string

        if location == loads(current_location):
            return 1  # Assuming 1 item collected if locations match
    return 0

def haversine_distance(loc1, loc2):
    import math

    lat1, lon1 = loc1
    lat2, lon2 = loc2

    R = 6371e3  # meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2) * math.sin(delta_phi / 2) + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2) * math.sin(delta_lambda / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    distance = R * c
    return distance

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
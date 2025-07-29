import eventlet
eventlet.monkey_patch()

from flask import Flask, render_template, redirect, url_for, session, request, jsonify
from flask_socketio import SocketIO, join_room, leave_room, send
from flask_cors import CORS
import os
from dotenv import load_dotenv
import random

load_dotenv()

app = Flask(__name__)

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

CORS(app, supports_credentials=True)

socket = SocketIO(app, async_mode='eventlet', cors_allowed_origins=["http://localhost:5173", "https://chatmate.netlify.app"])

rooms = {}
socket_users = {}

def generate_code(code_list):
    code = random.randint(10000,100000)
    while code in code_list:
        code = random.randint(10000,100000)
    return str(code)

@app.route('/')
def home():
    return "Backend is running !"

@app.route('/api/create_room', methods=['POST'])
def create_room():
    name = request.json.get('name')
    if not name:
        return jsonify({"error": "Name is required !"}), 400

    code = generate_code(list(rooms.keys()))
    rooms[code] = {"members": 0, "messages": []}

    print("Creating room for:", name)
    return jsonify({"roomId": code})

@app.route('/api/join_room', methods=['POST'])
def join_room_route():
    name = request.json.get('name')
    if not name:
        return jsonify({"error": "Name is required !"}), 400
    print(rooms)
    code = request.json.get('roomId')
    if not code:
        return jsonify({"error": "Room code is required !"}), 400
    if code not in rooms:
        return jsonify({"error": "Room code does not exist !"}), 400

    return jsonify({"name" : name, "roomId": code})

@socket.on("connect")
def connect(auth):
    if not auth or not auth.get("name") or not auth.get("room"):
        raise ConnectionRefusedError("Name and room are required to connect.")

    name = auth["name"]
    room = auth["room"]

    if room not in rooms:
        raise ConnectionRefusedError("Room doesn't exist")

    sid = request.sid
    socket_users[sid] = {"name": name, "room": room}

    join_room(room)
    rooms[room]["members"] += 1

    usernames = [user["name"] for sid, user in socket_users.items() if user["room"] == room]
    socket.emit("user_list", usernames, to=room)
    socket.emit("update_online", {"online": rooms[room]["members"]}, to=room)
    send({"name": name, "message": "has joined the room !"}, to=room)

    print(f"✅ {name} joined room {room}!")

@socket.on("disconnect")
def disconnect():
    sid = request.sid
    user = socket_users.pop(sid, None)

    if user:
        name = user["name"]
        room = user["room"]

        leave_room(room)
        send({"name": name, "message": "has left !"}, to=room)

        if room in rooms:
            rooms[room]["members"] -= 1
            if rooms[room]["members"] == 0:
                del rooms[room]

        print(f"{name} has left the room !")

@socket.on("message")
def message(data):
    sid = request.sid
    user = socket_users.get(sid)
    if not user:
        return

    room = user["room"]
    name = user["name"]

    if room not in rooms:
        return

    content = {
        "name": name,
        "message": data["message"]
    }

    send(content, to=room)
    rooms[room]["messages"].append(content)

if __name__ == "__main__":
    socket.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
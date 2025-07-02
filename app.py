import eventlet
eventlet.monkey_patch()

from flask import Flask, render_template, redirect, url_for, session, request
from flask_socketio import SocketIO, join_room, leave_room, send
import os
from dotenv import load_dotenv
import random

load_dotenv()

app = Flask(__name__)

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

socket = SocketIO(app, async_mode='eventlet')

rooms = {}


def generate_code(code_list):
    code = random.randint(10000,100000)
    while code in code_list:
        code = random.randint(10000,100000)
    return str(code)

@app.route('/', methods=['GET','POST'])
def home(): 
    session.clear()
    if request.method == 'POST':
        name = request.form.get('name')
        code = request.form.get('code')
        join = request.form.get('join', False)
        create = request.form.get('create', False)

        if not name:
            return render_template("home.html", error="Please Enter Name !", code = code, name = name)

        if create != False:
            code = generate_code(list(rooms.keys()))
            new_room = {
                "members" : 0,
                "messages" : []
            }
            rooms[code] = new_room

        if join != False:
            if code == "":
                return render_template("home.html", error="Please Enter code !", name = name)
            if code not in rooms.keys():
                return render_template("home.html", error="Code Invalid !", name = name)
        
        session['name'] = name
        session['room'] = code
        print(session)
        return redirect(url_for("chatroom"))
        
    return render_template('home.html')

@app.route('/room')
def chatroom():
    room = session.get('room')
    if room == None or session.get('name') == None or room not in rooms:
        return redirect(url_for("home"))
    return render_template('chatroom.html', code = room, online = rooms[room]["members"], messages=rooms[room]["messages"])

@socket.on("connect")
def connect(auth):
    room = session.get("room")
    name = session.get("name")

    if not room or not name:
        return
    
    if room not in rooms:
        leave_room(room)
        return
    
    join_room(room)
    rooms[room]["members"] += 1

    socket.emit("update_online", {"online": rooms[room]["members"]}, to=room)
    send({"name" : name, "message" : "has joined the room !"}, to=room)

    print(f"{name} joined !")
    
@socket.on("disconnect")
def disconnect():
    room = session.get("room")
    name = session.get("name")
    leave_room(room)
    send({"name" : name, "message" : "has left !"}, to=room)

    if room in rooms:
        rooms[room]["members"] -= 1
        if rooms[room]["members"] == 0:
            del rooms[room]
    
    session.pop("room", None)
    session.pop("name", None)
    
    print(f"{name} has left the room !")

@socket.on("message")
def message(data):
    room = session.get('room')
    if room not in rooms:
        return
    content = {
        "name" : session.get('name'),
        "message" : data["message"]
    }
    send(content, to = room)
    rooms[room]["messages"].append(content)


if __name__ == "__main__":
    socket.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
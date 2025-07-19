import React, { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import { useLocation, useNavigate } from 'react-router-dom';
import Online from '../components/Online';
import Chat from '../components/Chat';
import Userboard from '../components/Userboard';
import socket from "../socket";

const Chatroom = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentUser = { name: location.state?.name || location.state?.currentuser };

    const [users, setusers] = useState([]);
    const [onlinecount, setonlinecount] = useState(0);
    const [messages, setmessages] = useState([]);

    useEffect(() => {
        if (!currentUser.name) {
            navigate('/');
            return;
        }

        socket.auth = { name: currentUser.name, room: "global" };
        socket.connect();

        socket.on("connect", () => {
            socket.emit("join_room", { name: currentUser.name, room: "global" });
        });

        socket.on("user_list", (userList) => {
            setusers(userList);
            setonlinecount(userList.length);
        });

        socket.on("message", (message) => {
            setmessages((prev) => [...prev, message]);
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from the server !");
        });

        return () => {
            socket.disconnect();
        };
    }, [currentUser.name, navigate]);

    const sendMessages = (message) => {
        socket.emit("send_message", message);
    };

    return (
        <div className="w-full h-screen flex flex-col bg-gray-950 text-white">
            <div className="p-4 text-center text-sm bg-gray-800 shadow-md">
                <Online count={onlinecount} />
            </div>
            <div className="flex flex-1 overflow-hidden">
                <div className="w-2/3 p-4 overflow-y-auto border-r border-gray-700">
                    <Chat messages={messages} onSend={sendMessages} username={currentUser} />
                </div>
                <div className="w-1/3 p-4 overflow-y-auto bg-gray-900">
                    <Userboard users={users} />
                </div>
            </div>
        </div>
    );
};

export default Chatroom;

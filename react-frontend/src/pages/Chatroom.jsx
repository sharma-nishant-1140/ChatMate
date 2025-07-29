import React, { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import { useLocation, useNavigate } from 'react-router-dom';
import Online from '../components/Online';
import Chat from '../components/Chat';
import Userboard from '../components/Userboard';
import {createsocket} from "../socket";

const Chatroom = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { name, roomId } = state || {};

    const [users, setusers] = useState([]);
    const [onlinecount, setonlinecount] = useState(0);
    const [messages, setmessages] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!name || !roomId) {
            navigate('/');
            return;
        }

        const newSocket = createsocket(name, roomId);
        setSocket(newSocket);
        
        newSocket.on("connect", () => {
            console.log("Connected to server");
            console.log(name, roomId);
        });

        newSocket.on("user_list", (userList) => {
            setusers(userList);
            setonlinecount(userList.length);
        });

        newSocket.on("message", (message) => {
            setmessages((prev) => [...prev, message]);
        });

        newSocket.on("disconnect", () => {
            console.log("Disconnected from the server !");
        });

        return () => {
            newSocket.disconnect();
        };
    }, [name, navigate]);

    const sendMessages = (message) => {
        socket.emit("message", message);
    };

    return (
        <div className="w-full h-screen flex flex-col bg-gray-950 text-white">
            <div className="p-4 text-center flex justify-evenly text-sm bg-gray-800 shadow-md">
                <div className='w-2/3 tracking-wide'>
                    Room Code: {roomId}
                </div>
                <Online count={onlinecount} />
            </div>
            <div className="flex flex-1 overflow-hidden">
                <div className="w-2/3 p-4 overflow-y-auto border-r border-gray-700">
                    <Chat messages={messages} onSend={sendMessages} username={name} />
                </div>
                <div className="w-1/3 p-4 overflow-y-auto bg-gray-900">
                    <Userboard users={users} />
                </div>
            </div>
        </div>
    );
};

export default Chatroom;

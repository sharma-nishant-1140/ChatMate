import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [name, setname] = useState("");
  const [roomId, setroomId] = useState("");
  const [error, seterror] = useState("");
  const [mode, setmode] = useState("");
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    if (!name.trim()) {
      seterror("Name is required to create a room.");
      return;
    }
    seterror("");
    try { 
      const res = await axios.post("http://localhost:5000/api/create_room", { name });
      const roomId = res.data.roomId;
      navigate("/chatroom", { state: { name, roomId } });
    } catch (err) {
      console.log(err);
      seterror("Error creating room. Please try again.");
    }
  };

  const handleJoinRoom = async () => {
    if (!name.trim() && !roomId.trim()) {
      seterror("Both name and code are required to join a room.");
      return;
    }
    else if (!name.trim()) {
      seterror("Name is required to join a room.");
      return;
    }
    else if (!roomId.trim()) {
      seterror("Room code is required to join a room.");
      return;
    }
    seterror("");
    try {
      const res = await axios.post("http://localhost:5000/api/join_room", { name, roomId });
      navigate("/chatroom", { state: { name } });
    } catch (err) {
      seterror("Error joining room. Please try again.");
    }
  };

  const transition = { duration: 0.4, ease: 'easeInOut' };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white px-4 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!mode && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={transition}
            className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full max-w-4xl absolute"
          >
            <button
              className="bg-gray-800 hover:bg-gray-700 text-white py-6 px-8 rounded w-full md:w-64 h-32 md:h-64 border border-white text-xl"
              onClick={() => setmode('create')}
            >
              Create Room
            </button>
            <button
              className="bg-gray-800 hover:bg-gray-700 text-white py-6 px-8 rounded w-full md:w-64 h-32 md:h-64 border border-white text-xl"
              onClick={() => setmode('join')}
            >
              Join Room
            </button>
          </motion.div>
        )}

        {mode === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={transition}
            className="flex flex-col items-center gap-6 w-full max-w-sm absolute"
          >
            <button
              className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded w-full"
              onClick={() => {setmode(''); seterror('')}}
            >
              ← Back
            </button>
            <form className="flex flex-col gap-4 border border-white p-6 rounded w-full">
              <label htmlFor="name">Enter Name:</label>
              <input
                type="text"
                name="name"
                id="name"
                onChange={(e) => setname(e.target.value)}
                className="p-2 rounded text-black"
              />
              <button
                type="button"
                onClick={handleCreateRoom}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Create Room
              </button>
              {error && <p className="text-red-400">{error}</p>}
            </form>
          </motion.div>
        )}

        {mode === 'join' && (
          <motion.div
            key="join"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={transition}
            className="flex flex-col items-center gap-6 w-full max-w-sm absolute"
          >
            <button
              className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded w-full"
              onClick={() => {setmode(''); seterror('')}}
            >
              ← Back
            </button>
            <form className="flex flex-col gap-4 border border-white p-6 rounded w-full">
              <label htmlFor="name">Enter Name:</label>
              <input
                type="text"
                name="name"
                id="name"
                onChange={(e) => setname(e.target.value)}
                className="p-2 rounded text-black"
              />
              <label htmlFor="code">Enter Code:</label>
              <input
                type="text"
                name="code"
                id="code"
                onChange={(e) => setroomId(e.target.value)}
                className="p-2 rounded text-black"
              />
              <button
                type="button"
                onClick={handleJoinRoom}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              >
                Join Room
              </button>
              {error && <p className="text-red-400">{error}</p>}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

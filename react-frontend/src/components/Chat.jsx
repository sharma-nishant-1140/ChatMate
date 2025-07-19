import { useState } from "react";

const Chat = ({ messages, onSend, username }) => {
    const [input, setinput] = useState([]);

    const handleSend = () => {
        if (!input.trim())
            return;
        onSend({ name: username, message: input });
        setinput("");
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-2 p-2">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`p-2 rounded shadow ${msg.name === username ? "bg-blue-600 text-white" : "bg-gray-800 text-white"}`}
                    >
                        <strong>{msg.name}:</strong> {msg.message}
                    </div>
                ))}
            </div>
            <div className="mt-4 flex">
                <input
                    value={input}
                    onChange={(e) => setinput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    className="flex-1 bg-gray-700 px-4 py-2 rounded-l text-white"
                    placeholder="Type your message..."
                />
                <button
                    onClick={handleSend}
                    className="bg-blue-600 px-4 py-2 rounded-r hover:bg-blue-700 text-white"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;

import { io } from "socket.io-client";
const URL = import.meta.env.PROD
  ? "wss://chatmate.onrender.com"
  : "http://localhost:5000";

export const createsocket = (name, room) => {
  return io("http://localhost:5000", {
    transports: ["websocket", "polling"],
    auth: { name, room },
  });
};
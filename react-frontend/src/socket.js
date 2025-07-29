import { io } from "socket.io-client";

export const createsocket = (name, room) => {
  return io("http://localhost:5000", {
    transports: ["websocket", "polling"],
    auth: { name, room },
  });
};
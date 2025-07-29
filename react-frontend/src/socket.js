import { io } from "socket.io-client";
const URL = import.meta.env.PROD
  ? "https://chatmate-fsag.onrender.com/"
  : "http://localhost:5000";

export const createsocket = async (name, room) => {

  if (import.meta.env.PROD) {
    try {
      await fetch(`${URL}/`);
    } catch (err) {
      console.warn("Wake-up ping failed:", err);
    }
  }

  return io(URL, {
    transports: ["websocket", "polling"],
    auth: { name, room },
  });
};
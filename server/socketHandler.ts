import { Server, Socket } from "socket.io";
import { addUser, removeUser, getRoomUsers, isUsernameTaken } from "./store";

export function setupSocketHandler(io: Server) {
  io.on("connection", (socket: Socket) => {
    let currentRoom: string | null = null;
    let currentUsername: string | null = null;

    socket.on("join", ({ username, room }: { username: string; room: string }) => {
      if (!username || !room) {
        socket.emit("error", { message: "Username and room are required" });
        return;
      }

      const roomNum = parseInt(room, 10);
      if (isNaN(roomNum) || roomNum < 1 || roomNum > 9999) {
        socket.emit("error", { message: "Room must be a number between 1 and 9999" });
        return;
      }

      if (username.length < 2 || username.length > 20) {
        socket.emit("error", { message: "Username must be 2-20 characters" });
        return;
      }

      if (isUsernameTaken(room, username, socket.id)) {
        socket.emit("error", { message: "Username is already taken in this room" });
        return;
      }

      currentRoom = room;
      currentUsername = username;

      socket.join(room);
      const users = addUser(room, { id: socket.id, username });
      io.to(room).emit("users", users);
      socket.emit("system", { type: "join" as const, username: "You" });
      socket.to(room).emit("system", { type: "join" as const, username });
    });

    socket.on("message", ({ text }: { text: string }) => {
      if (!currentRoom || !currentUsername) {
        socket.emit("error", { message: "You must join a room first" });
        return;
      }

      if (!text || text.trim().length === 0) {
        return;
      }

      const message = {
        id: socket.id,
        username: currentUsername,
        text: text.slice(0, 500),
        timestamp: Date.now(),
      };

      io.to(currentRoom).emit("message", message);
    });

    socket.on("leave", () => {
      if (currentRoom && currentUsername) {
        const users = removeUser(currentRoom, socket.id);
        io.to(currentRoom).emit("users", users);
        io.to(currentRoom).emit("system", { type: "leave" as const, username: currentUsername });
      }
      socket.disconnect();
    });

    socket.on("disconnect", () => {
      if (currentRoom && currentUsername) {
        const users = removeUser(currentRoom, socket.id);
        io.to(currentRoom).emit("users", users);
        io.to(currentRoom).emit("system", { type: "leave" as const, username: currentUsername });
      }
    });
  });
}

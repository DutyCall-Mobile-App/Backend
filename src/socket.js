// socket.js
import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // allow frontend (React Native) domain in production
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Example: send a notification after client connects
    socket.emit("notification", {
      id: "notif-1",
      title: "New Report Submitted",
      message: "Report #1234 has been submitted successfully.",
      timestamp: new Date().toISOString(),
    });

    // Example: listen for client-triggered test event
    socket.on("sendTestNotification", (data) => {
      console.log("📩 Test notification request:", data);

      io.emit("notification", {
        id: "notif-2",
        title: data.title || "Test Notification",
        message: data.message || "This is a sample notification",
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

export { io };

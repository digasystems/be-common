import { Server as SocketServer } from "socket.io";

export const io = new SocketServer();

export default function initializeSocketIO({ httpServer }) {
    io.attach(httpServer, {
        cors: {
            methods: ["OPTIONS", "GET", "HEAD", "POST"],
        }
    });
}
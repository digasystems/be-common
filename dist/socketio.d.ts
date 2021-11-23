import { Server as SocketServer } from "socket.io";
export declare const io: SocketServer<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>;
export default function initializeSocketIO({ httpServer }: {
    httpServer: any;
}): void;

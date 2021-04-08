import { Socket } from "net";

export interface InterfaceSocket extends Socket {
    id: string
}

export interface InterfaceUser {
    id: string
    socket?: InterfaceSocket
    username?: string
    roomId?: string
}
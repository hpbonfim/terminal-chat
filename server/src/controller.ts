import { constants } from "./constants"
import { InterfaceSocket, InterfaceUser } from "./interface"
import SocketServer from "./socket"

export default class Controller {
    [event: string]: any
    socketServer: SocketServer
    users: Map<string, InterfaceUser> = new Map()
    rooms: Map<string, Map<string, InterfaceUser>> = new Map()

    constructor(socketServer: SocketServer) {
        this.socketServer = socketServer
    }

    onNewConnection(socket: InterfaceSocket) {
        const { id } = socket
        const userData: InterfaceUser = { id, socket }

        this.updateGlobalUserData(id, userData)

        socket.on('data', this.onSocketData(id))
        socket.on('error', this.onSocketClosed(id))
        socket.on('end', this.onSocketClosed(id))
    }

    broadcast({ socketId, roomId, event, message, includeCurrentSocket = false }: any) {
        const usersOnRoom = this.rooms.get(roomId)

        if (usersOnRoom)
            for (const [key, user] of usersOnRoom) {
                if (!includeCurrentSocket && key === socketId) continue
                this.socketServer.sendMessage(user?.socket, event, message)
            }
    }

    async joinRoom(socketId: string, data: InterfaceUser) {
        const userData = data
        const user = this.updateGlobalUserData(socketId, userData)

        console.log(`${userData.username} joined: ${socketId}`)
        const { roomId } = userData

        const users = this.joinUserInRoom(String(roomId), user)

        const currentUsers = (Array.from(users.values()) as InterfaceUser[])
            .map(({ id, username }) => ({ id, username }))

        //  atualiza o usuario corrente sobre todos os usuarios
        // que jaa estao conectados na mesma sala
        this.socketServer
            .sendMessage(user?.socket, constants.events.UPDATE_USERS, currentUsers)


        // avisa a rede que um novo usuario conectou-se
        this.broadcast({
            socketId,
            roomId,
            message: { id: socketId, username: user?.username },
            event: constants.events.NEW_USER_CONNECTED
        })
    }

    message(socketId: string, message: string) {
        const user = this.users.get(socketId)

        this.broadcast({
            socketId,
            roomId: user?.roomId,
            message: { username: user?.username, message: message },
            event: constants.events.MESSAGE,
            includeCurrentSocket: true
        })
    }

    joinUserInRoom(roomId: string, user: any) {
        const usersOnRoom = this.rooms.get(roomId) ?? new Map()
        usersOnRoom.set(user.id, user)

        this.rooms.set(roomId, usersOnRoom)

        return usersOnRoom
    }

    private logoutUser(id: string, roomId: string) {
        this.users.delete(id)
        const usersOnRoom = this.rooms.get(roomId)
        usersOnRoom?.delete(id)

        if (usersOnRoom)
            this.rooms.set(roomId, usersOnRoom)
    }

    private onSocketData(id: string) {
        return (data: string) => {
            try {
                const { event, message } = JSON.parse(data)
                this[event](id, message)
            } catch (error) {
                console.error('Wrong event format', error)
            }
        }
    }

    private onSocketClosed(id: string) {
        return (_: void) => {
            const user = this.users.get(id)
            this.logoutUser(id, String(user?.roomId))
            this.broadcast({
                roomId: user?.roomId,
                message: { id, username: user?.username },
                socketId: id,
                event: constants.events.DISCONNECT_USER
            })
        }
    }

    updateGlobalUserData(socketId: string, userData: InterfaceUser) {
        const users = this.users
        const user = users.get(socketId)

        const updatedUserData = {
            ...user,
            ...userData
        }

        users.set(socketId, updatedUserData)

        return users.get(socketId)
    }
}
import EventEmitter from "events"
import { constants } from "./constants"
import { InterfaceEventManager, InterfaceUser } from "./interface"
import SocketClient from "./socket"

export default class EventManager {
    [event: string]: any

    private allUsers: Map<string, string> = new Map()
    componentEmitter: EventEmitter
    socketClient: SocketClient

    constructor({ componentEmitter, socketClient }: InterfaceEventManager) {
        this.componentEmitter = componentEmitter
        this.socketClient = socketClient
    }

    joinRoomAndWaitForMessage(data: any) {
        this.socketClient.sendMessage(constants.events.socket.JOIN_ROOM, data)

        this.componentEmitter.on(constants.events.app.MESSAGE_SENT, msg => {
            this.socketClient.sendMessage(constants.events.socket.MESSAGE, msg)
        })
    }

    newUserConnected(user: InterfaceUser) {
        const newUser = user
        this.allUsers.set(newUser.id, newUser.username)

        this.updateUsersComponent()
        this.updateActivityLogComponent(`${newUser.username} joined!`)
    }

    updateUsers(users: InterfaceUser[]) {
        const connectedUsers = users
        connectedUsers.forEach(({ id, username }) => this.allUsers.set(id, username))
        this.updateUsersComponent()
    }

    disconnectUser(user: InterfaceUser) {
        const { username, id } = user
        this.allUsers.delete(id)

        this.updateActivityLogComponent(`${username} left!`)
        this.updateUsersComponent()
    }

    private updateActivityLogComponent(message: string) {
        this.componentEmitter.emit(
            constants.events.app.ACTIVITY_LOG_UPDATED,
            message
        )
    }

    message(message: string) {
        this.componentEmitter.emit(
            constants.events.app.MESSAGE_RECEIVED,
            message
        )
    }

    private updateUsersComponent() {
        this.componentEmitter.emit(
            constants.events.app.STATUS_UPDATED,
            Array.from(this.allUsers.values())
        )
    }

    getEvents() {
        const functions: any[] = Reflect.ownKeys(EventManager.prototype)
            .filter(fn => fn != 'constructor')
            .map(name => [name, this[String(name)].bind(this)])

        return new Map(functions) as Map<string, () => void>
    }


}
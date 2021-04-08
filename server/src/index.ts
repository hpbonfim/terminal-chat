import SocketServer from "./socket"
import Event from 'events'
import { constants } from "./constants"
import Controller from "./controller"

const eventEmitter = new Event()

const port = Number(process.env.PORT) || 9999
const socketServer = new SocketServer({ port })

async function startServer() {
    const server = await socketServer.initialize(eventEmitter)
    console.log(server?.address())
}

startServer()

const controller = new Controller(socketServer)
eventEmitter.on(constants.events.NEW_USER_CONNECTED, controller.onNewConnection.bind(controller))
import { Socket } from "net"
import EventEmitter from "events"
import CliConfig from "./cliConfig"

export default class SocketClient {
    private _serverConnection: Socket = new Socket
    private _serverListener = new EventEmitter()
    host: string
    port: string
    protocol: string

    constructor({ host, port, protocol }: CliConfig) {
        this.host = host
        this.port = port
        this.protocol = protocol
    }

    async sendMessage(event: string, message: any) {
        this._serverConnection.write(JSON.stringify({ event, message }))
        const data = JSON.stringify({ event, message })
    }

    attachEvents(events: Map<string, () => void>) {
        this._serverConnection.on('data', data => {
            try {
                data.toString()
                    .split('\n')
                    .filter(line => !!line)
                    .map(line => JSON.parse(line))
                    .map(({ event, message }) => {
                        this._serverListener.emit(event, message)
                    })
            } catch (error) {
                console.error('cant attach events', error)
            }
        })

        for (const [key, value] of events) {
            this._serverListener.on(key, value)
        }
    }

    async createConnection(): Promise<Socket> {
        const options = {
            port: this.port,
            host: this.host,
            headers: {
                Connection: 'Upgrade',
                Upgrade: 'websocket'
            }
        }

        const http = await import(this.protocol)
        const req = http.request(options)
        req.end()

        return new Promise(resolve => {
            req.once('upgrade', (res: any, socket: Socket) => resolve(socket))
        })
    }

    async initialize() {
        this._serverConnection = await this.createConnection()
    }
}
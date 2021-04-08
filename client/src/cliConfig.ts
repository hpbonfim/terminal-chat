import { InterfaceCommands } from "./interface"

export default class CliConfig {
    username: string
    room: string
    hostUri: string
    host: string
    port: string
    protocol: string

    constructor({ username, room, hostUri }: InterfaceCommands) {
        this.username = username
        this.room = room
        this.hostUri = hostUri
        console.log(hostUri)

        const { hostname, port, protocol } = new URL(hostUri)
        this.host = hostname
        this.port = port
        this.protocol = protocol.replace(/\W/, '')
    }

    static parseArguments(commands: string[]) {
        const cmd = new Map()

        commands.forEach((command, index) => {
            const commandPreffix = '--'

            if (command.includes(commandPreffix)) {
                cmd.set(command.replace(commandPreffix, ''), commands[index + 1])
            }
        })

        return new CliConfig(Object.fromEntries(cmd))
    }

}
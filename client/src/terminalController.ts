import EventEmitter from "events"
import ComponentBuilder from "./componentsBuider"
import { InterfaceComponentBuild } from "./interface"

import { constants } from './constants'

export default class TerminalController {
    private _userColors = new Map()

    constructor() { }

    private _getUserColor(username: string) {
        if (this._userColors.has(username)) {
            return this._userColors.get(username)
        }

        const color = this._pickColor()
        this._userColors.set(username, color)

        return color
    }

    private _pickColor() {
        let hexColor

        do hexColor = ((1 << 24) * Math.random() | 0).toString(16)
        while (hexColor.length != 6)

        return `#` + hexColor + '-fg'
    }

    private _onInputReceived(eventEmitter: EventEmitter) {
        return function (this: any) {
            const message = this.getValue()
            eventEmitter.emit(constants.events.app.MESSAGE_SENT, message)
            this.clearValue()
        }
    }

    private _onMessageReceived({ screen, chat }: InterfaceComponentBuild) {
        return (msg: { username: string, message: string }) => {
            const { username, message } = msg
            const color = this._getUserColor(username)
            chat.addItem(`{${color}}{bold}${username}:{/} ${message}`)
            screen.render()
        }
    }

    private _onLogChanged({ screen, activityLog }: InterfaceComponentBuild) {
        return (msg: string) => {
            const [username] = msg.split(/\s/)
            const color = this._getUserColor(username)
            activityLog.addItem(`{${color}}{bold}${msg}{/}`)
            screen.render()
        }
    }

    private _onStatusChanged({ screen, status }: InterfaceComponentBuild) {
        return (users: []) => {
            const item = status.shiftItem()
            status.clearItems()
            status.addItem(item.content)
            users.forEach((username) => {
                const color = this._getUserColor(username)
                status.addItem(`{${color}}{bold}${username}{/}`)
            })
            screen.render()
        }
    }

    private _registerEvents(eventEmitter: EventEmitter, components: InterfaceComponentBuild) {
        eventEmitter.on(constants.events.app.MESSAGE_RECEIVED, this._onMessageReceived(components))
        eventEmitter.on(constants.events.app.ACTIVITY_LOG_UPDATED, this._onLogChanged(components))
        eventEmitter.on(constants.events.app.STATUS_UPDATED, this._onStatusChanged(components))
    }

    async initializeTable(eventEmitter: EventEmitter) {
        const components = new ComponentBuilder()
            .setScreen({ title: 'Hacker-chat - Rafael' })
            .setLayoutComponent()
            .setInputComponent(this._onInputReceived(eventEmitter))
            .setChatComponent()
            .setActivityLogComponent()
            .setStatusComponent()
            .build()

        this._registerEvents(eventEmitter, components)

        components.input.focus()
        components.screen.render()
    }
}
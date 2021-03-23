import ComponentsBuider from "./componentsBuider.js";
import { constants } from './constants.js'

export default class TerminalController {
    #usersColors = new Map()

    constructor() { }

    #pickColor() {
        let hexColor = ((1 << 24) * Math.random() | 0).toString(16)

        do hexColor = ((1 << 24) * Math.random() | 0).toString(16)
        while (hexColor.length != 6)

        return `#` + hexColor + '-fg'
    }

    #getUserColor(userName) {
        if (this.#usersColors.has(userName))
            return this.#usersColors.get(userName)

        const color = this.#pickColor()
        this.#usersColors.set(userName, color)

        return color
    }

    #onInputReceived(eventEmitter) {
        return function () {
            const message = this.getValue()
            console.log(message);
            this.clearValue()
        }
    }

    #onMessageReceived({ screen, chat }) {
        return msg => {
            const { userName, message } = msg
            const color = this.#getUserColor(userName)

            chat.addItem(`{${color}}{bold}${userName}{/}: ${message}`)
            screen.render()
        }
    }

    #onLogChanged({ screen, activityLog }) {

        return msg => {
            const [userName] = msg.split(/\s/)
            const color = this.#getUserColor(userName)
            activityLog.addItem(`{${color}} {bold} ${msg.toString()} {/}`)

            screen.render()
        }
    }

    #onStatusChanged({ screen, status }) {
        return users => {

            const { content } = status.items.shift()
            status.clearItems()
            status.addItem(content)

            users.forEach(userName => {
                const color = this.#getUserColor(userName)
                status.addItem(`{${color}}{bold}${userName}{/}`)

            });
            screen.render()
        }
    }

    #registerEvents(eventEmitter, components) {
        // eventEmitter.on(constants.events.app.MESSAGE_SENT, this.#onMessageSent(components))
        eventEmitter.on(constants.events.app.MESSAGE_RECEIVED, this.#onMessageReceived(components))
        eventEmitter.on(constants.events.app.ACTIVITY_LOG_UPDATED, this.#onLogChanged(components))
        eventEmitter.on(constants.events.app.STATUS_UPDATED, this.#onStatusChanged(components))
    }

    async initializeTable(eventEmitter) {
        const components = new ComponentsBuider()
            .setScreen({ title: 'TerminalChat' })
            .setLayoutComponent()
            .setInputComponent(this.#onInputReceived(eventEmitter))
            .setChatComponent()
            .setActivityLogComponent()
            .setStatusComponent()
            .build()

        this.#registerEvents(eventEmitter, components)

        components.input.focus()
        components.screen.render()

        setInterval(() => {
            const users = ['henrique']
            eventEmitter.emit(constants.events.app.STATUS_UPDATED, users)
            users.push('testezera', 'dsa')
            eventEmitter.emit(constants.events.app.STATUS_UPDATED, users)
            users.push('testez123era', 'cagao')
            eventEmitter.emit(constants.events.app.STATUS_UPDATED, users)
            users.push('testezersadcxza', 'cagao')
            eventEmitter.emit(constants.events.app.STATUS_UPDATED, users)
            users.push('testezer fdsea', '3333')
            eventEmitter.emit(constants.events.app.STATUS_UPDATED, users)
            users.push('testezera d', '32122')
        }, 1000)

    }
}
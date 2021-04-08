import Blessed from 'blessed'
import { InterfaceCommands, InterfaceComponentBuild } from "./interface"

export default class ComponentBuilder {
    private _screen!: Blessed.Widgets.Screen
    private _layout!: Blessed.Widgets.LayoutElement
    private _input!: Blessed.Widgets.TextareaElement
    private _chat!: Blessed.Widgets.ListElement
    private _status!: Blessed.Widgets.ListElement
    private _activityLog!: Blessed.Widgets.ListElement

    constructor() { }

    private _baseComponent(): Blessed.Widgets.ListOptions<Blessed.Widgets.ListElementStyle> {
        return {
            mouse: true,
            border: 'line',
            keys: true,
            top: 0,
            scrollbar: {
                ch: ' '
            },
            tags: true
        }
    }

    setScreen({ title }: { title: string }) {
        this._screen = Blessed.screen({
            smartCSR: true,
            title,
        })

        this._screen.key(['escape'], () => process.exit(0))
        return this
    }

    setLayoutComponent() {
        this._layout = Blessed.layout({
            parent: this._screen,
            width: '100%',
            height: '100%',
            layout: 'inline-block'
        })

        return this
    }

    setInputComponent(onEnterPressed: () => void) {
        const input = Blessed.textarea({
            parent: this._screen,
            bottom: 0,
            height: '10%',
            inputOnFocus: true,
            padding: {
                top: 1,
                left: 2
            },
            fg: '#f6f6f6',
            bg: '#353535',
        })

        input.key('enter', onEnterPressed)
        this._input = input

        return this
    }

    setChatComponent() {
        this._chat = Blessed.list({
            ...this._baseComponent(),
            parent: this._layout,
            align: 'left',
            width: '50%',
            height: '90%',
            items: ['{bold}Message{/}']
        })

        return this
    }

    setStatusComponent() {
        this._status = Blessed.list({
            ...this._baseComponent(),
            parent: this._layout,
            width: '25%',
            height: '90%',
            items: ['{bold}Users in room{/}']
        })
        return this
    }

    setActivityLogComponent() {
        this._activityLog = Blessed.list({
            ...this._baseComponent(),
            parent: this._layout,
            width: '25%',
            height: '90%',
            fg: 'yellow',
            items: ['{bold}Activity Log{/}']
        })

        return this
    }

    build(): InterfaceComponentBuild {
        const components = {
            screen: this._screen,
            input: this._input,
            chat: this._chat,
            status: this._status,
            activityLog: this._activityLog
        }
        return components
    }
}
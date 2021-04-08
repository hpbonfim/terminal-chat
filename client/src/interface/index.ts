import EventEmitter from "events"
import SocketClient from "../socket"
import Blessed from 'blessed'

export interface InterfaceCommands {
    username: string,
    room: string,
    hostUri: string
}

export interface InterfaceEventManager {
    socketClient: SocketClient,
    componentEmitter: EventEmitter
}

export interface InterfaceUser {
    id: string
    username: string
}

export interface InterfaceComponentBuild {
    screen: Blessed.Widgets.Screen,
    chat: Blessed.Widgets.ListElement,
    input: Blessed.Widgets.TextareaElement,
    status: Blessed.Widgets.ListElement;
    activityLog: Blessed.Widgets.ListElement;
}
import Events from 'events'
import TerminalController from "./components/terminalController.js";

const componentEmitter = new Events()

const controller = new TerminalController()
await controller.initializeTable(componentEmitter)
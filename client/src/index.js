/*
node index.js
--username hpbonfim
--room sala01
--hostUrl localhost
*/

import Events from 'events'
import CliConfig from './components/cliConfig.js';
import TerminalController from "./components/terminalController.js";

const [nodePath, filePath, ...commands] = process.argv
const config = CliConfig.parseArguments(commands)
console.log(config);

const componentEmitter = new Events()

const controller = new TerminalController()
await controller.initializeTable(componentEmitter)
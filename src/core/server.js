import HttpServer from "./http.js";
import WSServer from "./websocket.js";
import CLI from "./cli.js";
import Logger from "./logger.js";

class Server {
	constructor(port = 3000) {
		this.httpServer = new HttpServer(port);
		this.wsServer = new WSServer(this.httpServer);
		this.cli = new CLI(this.wsServer);
	}

	async start() {
		this.httpServer.start();
		this.wsServer.start();
		await new Promise(resolve => setTimeout(resolve, 100));
		Logger.success("servers started successfully");
		await new Promise(resolve => setTimeout(resolve, 100));
		this.cli.start();
	}
}

export default Server; 
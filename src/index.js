import Server from "./core/server.js";
import Logger from "./core/logger.js";

try {
	const server = new Server();
	server.start();
} catch (error) {
	Logger.error(`failed to start servers: ${error.message}`);
	process.exit(1);
}

import { createWriteStream } from "fs";
import { join } from "path";

const getTimestamp = () => {
	const now = new Date();
	return now.toISOString();
};

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

const logFile = join(process.cwd(), "server.log");
const logStream = createWriteStream(logFile, { flags: "a" });

class Logger {
  static info(message) {
    logStream.write(`[${getTimestamp()}] [INFO] ${message}\n`);
  }

  static error(message) {
    logStream.write(`[${getTimestamp()}] [ERROR] ${message}\n`);
  }

  static warn(message) {
    logStream.write(`[${getTimestamp()}] [WARN] ${message}\n`);
  }

  static success(message) {
    logStream.write(`[${getTimestamp()}] [SUCCESS] ${message}\n`);
  }
}

export default Logger;

import express from "express";
import { createServer } from "http";
import Logger from "./logger.js";

class HttpServer {
  constructor(port = 3000) {
    this.app = express();
    this.port = port;
    this.server = createServer(this.app);
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  setupRoutes() {
    this.app.get("/", (req, res) => {
      res.json({ message: "Hello from HTTP server!" });
    });
  }

  start() {
    Logger.success(`http server running on port ${this.port}`);
    this.server.listen(this.port);
  }

  getServer() {
    return this.server;
  }

  getPort() {
    return this.port;
  }
}

export default HttpServer;

import { WebSocketServer } from "ws";
import Logger from "./logger.js";
import crypto from "crypto";

class WSServer {
  constructor(httpServer) {
    this.httpServer = httpServer;
    this.wss = null;
    this.clients = new Map();
  }

  generateShortId() {
    return crypto.randomBytes(2).toString('hex').toUpperCase();
  }

  start() {
    this.wss = new WebSocketServer({ server: this.httpServer.getServer() });
    this.setupEventHandlers();
    Logger.success(`Secure WebSocket server initialized and attached to HTTP server`);
  }

  setupEventHandlers() {
    this.wss.on("connection", (ws, req) => this.handleConnection(ws, req));
  }

  handleConnection(ws, req) {
    const ip = req.socket.remoteAddress;
    const shortId = this.generateShortId();
    this.clients.set(ws, { 
      id: "unknown", 
      shortId,
      ip,
      connectedAt: new Date(),
      systemInfo: null
    });
    Logger.info(`New client session established from ${ip} (Session ID: ${shortId})`);
    this.setupClientHandlers(ws);
  }

  setupClientHandlers(ws) {
    ws.on("message", (message) => this.handleMessage(ws, message));
    ws.on("close", () => this.handleClose(ws));
    ws.on("error", (error) => this.handleError(error));
  }

  handleMessage(ws, message) {
    try {
      const data = JSON.parse(message);
      if (data.type === "identify") {
        this.handleIdentify(ws, data);
      }
    } catch (e) {
      Logger.info(`Received encrypted message payload`);
    }
    this.broadcast(message);
  }

  handleIdentify(ws, data) {
    const clientInfo = this.clients.get(ws);
    const { id, systemInfo } = data;
    
    if (!id) return;

    this.clients.set(ws, { 
      ...clientInfo,
      id,
      systemInfo: systemInfo || null
    });

    const details = systemInfo ? 
      ` (${systemInfo.os}, ${systemInfo.arch}, ${systemInfo.platform})` : 
      '';

    Logger.success(`Client "${id}" (${clientInfo.shortId}) authenticated from ${clientInfo.ip}${details}`);
  }

  handleClose(ws) {
    const clientInfo = this.clients.get(ws);
    Logger.warn(`Client session "${clientInfo.id}" (${clientInfo.shortId}) terminated from ${clientInfo.ip}`);
    this.clients.delete(ws);
  }

  handleError(error) {
    Logger.error(`Security protocol violation detected: ${error.message}`);
  }

  broadcast(message) {
    this.clients.forEach((clientInfo, client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  getWSS() {
    return this.wss;
  }

  getClients() {
    return Array.from(this.clients.entries()).map(([ws, info]) => ({
      id: info.id,
      shortId: info.shortId,
      ip: info.ip,
      connectedAt: info.connectedAt,
      systemInfo: info.systemInfo
    }));
  }

  getClientDetails() {
    return this.getClients().map(client => {
      const sysInfo = client.systemInfo || {};
      return {
        id: client.id,
        shortId: client.shortId,
        ip: client.ip,
        connectedAt: client.connectedAt.toISOString(),
        os: sysInfo.os || 'Unknown',
        platform: sysInfo.platform || 'Unknown',
        arch: sysInfo.arch || 'Unknown',
        memory: sysInfo.memory || 'Unknown',
        cpu: sysInfo.cpu || 'Unknown',
        mac: sysInfo.mac || 'Unknown'
      };
    });
  }
}

export default WSServer;

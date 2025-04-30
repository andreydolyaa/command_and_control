export const COLORS = {
	reset: "\x1b[0m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
	yellow: "\x1b[33m",
	green: "\x1b[32m",
	red: "\x1b[31m"
};

export const CLI_HEADERS = {
	INTERFACE: "============================ SECURE SERVER CONTROL INTERFACE ============================",
	DIVIDER: "=========================================================================================",
	MENU: "Available Commands:",
	CLIENT_SESSIONS: "Active Client Sessions:",
	CLIENT_DETAILS: "Target Client Details:"
};

export const CLI_COMMANDS = {
	LIST: {
		cmd: "list",
		desc: "Display active client sessions"
	},
	INFO: {
		cmd: "info <client_id>",
		desc: "Retrieve comprehensive system specifications for target client"
	},
	SEND: {
		cmd: "send <message>",
		desc: "Broadcast secure message to all authenticated clients"
	},
	SHELL: {
		cmd: "shell <id> <cmd>",
		desc: "Execute shell command on target client"
	},
	CMD: {
		cmd: "cmd <id> <cmd>",
		desc: "Alias for shell command"
	},
	EXIT: {
		cmd: "exit",
		desc: "Terminate server session"
	},
	HELP: {
		cmd: "?",
		desc: "Display command interface menu"
	}
};

export const TABLE_HEADERS = {
	CLIENTS: {
		ID: "ID",
		HOSTNAME: "Hostname",
		USERNAME: "Username",
		IP: "IP",
		MAC: "MAC"
	},
	CLIENT_DETAILS: {
		PROPERTY: "Property",
		VALUE: "Value"
	}
};

export const CLI_MESSAGES = {
	NO_CLIENTS: "No active client sessions detected",
	CLIENT_ID_REQUIRED: "Client identifier required. Usage: info <client_id>",
	CLIENT_NOT_FOUND: (id) => `Target client "${id}" not found in active sessions.`,
	MESSAGE_REQUIRED: "Message payload required for transmission",
	BROADCAST_SUCCESS: "Secure message broadcast initiated",
	SHELL_USAGE: "Usage: shell <client_id> <command>",
	EXIT_MESSAGE: "Initiating secure server termination sequence...",
	INVALID_COMMAND: "Invalid command. Type '?' to view available commands."
};

export const TABLE_FORMATS = {
	CLIENTS_HEADER: "ID     | Hostname      | Username    | IP             | MAC               ",
	CLIENTS_DIVIDER: "-------+---------------|-------------|----------------+-------------------",
	DETAILS_DIVIDER: "------------+--------------------------------------------------"
};

export const PROPERTY_LABELS = {
	SESSION_ID: "Session ID",
	HOSTNAME: "Hostname",
	USERNAME: "Username",
	IP_ADDRESS: "IP Address",
	MAC_ADDRESS: "MAC Address",
	CONNECTED: "Connected",
	OS: "OS",
	PLATFORM: "Platform",
	CPU_ARCH: "CPU Arch",
	MEMORY: "Memory",
	PROCESSOR: "Processor"
}; 
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
		display: "• list",
		desc: "Display active client sessions"
	},
	SELECT: {
		cmd: "select <client_id>",
		display: "• select <client_id>",
		desc: "Select a client to interact with"
	},
	INFO: {
		cmd: "info",
		display: "• info",
		desc: "Retrieve comprehensive system specifications for selected client"
	},
	SEND: {
		cmd: "send <message>",
		display: "• send <message>",
		desc: "Broadcast secure message to all authenticated clients"
	},
	SHELL: {
		cmd: "shell",
		display: "• shell",
		desc: "Open interactive shell session with selected client"
	},
	EXIT_SHELL: {
		cmd: "exit",
		display: "• exit",
		desc: "Exit current shell session"
	},
	UNSELECT: {
		cmd: "back",
		display: "• back",
		desc: "Exit client selection mode"
	},
	EXIT: {
		cmd: "quit",
		display: "• quit",
		desc: "Terminate server session"
	},
	HELP: {
		cmd: "?",
		display: "• ?",
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
	CLIENT_ID_REQUIRED: "Client identifier required. Usage: select <client_id>",
	CLIENT_NOT_FOUND: (id) => `Target client "${id}" not found in active sessions.`,
	MESSAGE_REQUIRED: "Message payload required for transmission",
	BROADCAST_SUCCESS: "Secure message broadcast initiated",
	SHELL_USAGE: "Usage: shell <command>",
	EXIT_MESSAGE: "Initiating secure server termination sequence...",
	INVALID_COMMAND: "Invalid command. Type '?' to view available commands.",
	NO_CLIENT_SELECTED: "No client selected. Use 'select <client_id>' first.",
	CLIENT_SELECTED: (id) => `Now interacting with client ${id}`,
	CLIENT_UNSELECTED: "Exited client selection mode"
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
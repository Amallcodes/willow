import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
    command: "npx",
    args: ["mcp-remote", "https://gmailmcp.googleapis.com/mcp/v1"]
});

const client = new Client({ name: "email-agent", version: "1.0.0" });

//   async function main() {
//     await client.connect(transport);
//     console.log("Connected to Gmail MCP server!");
//   }

async function main() {
    await client.connect(transport);
    console.log("Connected to Gmail MCP server!");

    const result = await client.listTools();
    console.log("Available tools:");
    console.log(JSON.stringify(result.tools, null, 2));
}

main();

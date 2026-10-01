import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
    command: "npx",
    args: [
        "mcp-remote",
        "https://gmailmcp.googleapis.com/mcp/v1",
        "--static-oauth-client-info",
        JSON.stringify({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    
    stderr: "inherit",
});

const client = new Client({ name: "email-agent", version: "1.0.0" });

async function main() {
    await client.connect(transport);
    console.log("Connected to Gmail MCP server!");

    // const result = await client.listTools();
    // console.log("Available tools:");
    // const tool = result.tools.find((t) => t.name === "search_threads");
    // console.log(JSON.stringify(tool, null, 2));

    const search_emails_res = await client.callTool({
        name: "search_threads",
        arguments: {
            query: "is:unread",
            pageSize: 3
        }
    })

    console.log(JSON.stringify(search_emails_res.content))
}

main();

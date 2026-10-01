import { system } from "@/lib/chat-properties";
import { tools } from "@/lib/tool-schema";
import { runTool } from "@/lib/gmail-tools";
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const conversation: Anthropic.MessageParam[] = [...messages];

  for (let i = 0; i < 5; i++) {

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      system,
      tools,
      messages: conversation,
    });

    // Claude is done, return its text
    if (message.stop_reason !== "tool_use") {
      const response = message.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("");

      return NextResponse.json({ response });
    }

    // Claude wants a tool, run a tool and saveits request in conversations array
    conversation.push({ role: "assistant", content: message.content });
    // Result array for each run tool
    const results: Anthropic.ToolResultBlockParam[] = [];

    for (const block of message.content) {

      if (block.type === "tool_use") {
        console.log("Running tool:", block.name, block.input);
        const output = await runTool(block.name, block.input);

        results.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(output),
        });

      }
    }

    // Send the results back, then loop again
    conversation.push({ role: "user", content: results });

  }

  return NextResponse.json({ response: "Stopped: too many tool steps." });
}
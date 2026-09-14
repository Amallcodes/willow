import { Message } from "@/types/chat-types";

export async function chatClaude(messages: Message[]) {
    const url = "/api/anthropic";
   
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({messages})
    }

    try {
        const res = await fetch(url, options);

        const data = await res.json();

        console.log(data);

        return data.response;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
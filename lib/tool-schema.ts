import Anthropic from "@anthropic-ai/sdk";

export const tools: Anthropic.Tool[] = [
    {
        name: 'search_threads',
        description:
            "Search the user's Gmail conversations using Gmail search syntax, for example 'is:unread', 'from:name@email.com' or 'newer_than:7d'. Returns a list of threads with their ids and a short snippet. Use this first to find emails, then read one in full with another tool.",
        input_schema: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: "Gmail search text, like 'is:unread newer_than:7d'",
                },
                maxResults: {
                    type: 'number',
                    description: 'How many conversations to return. Defaults to 3.',
                },
            },
            required: ['query'],
        },
    },
    {
        name: 'get_thread',
        description:
            "Get the full list of messages in one Gmail conversation, including who sent each message, the subject, the date, and a snippet. The threadId comes from a previous search_threads result. Use this after search_threads when you need more than just the snippet, for example to read a specific email in detail.",
        input_schema: {
            type: 'object',
            properties: {
                threadId: {
                    type: 'string',
                    description: 'The id of the thread to open, from a search_threads result',
                },
            },
            required: ['threadId'],
        },
    },
    {
        name: 'get_message_body',
        description:
            "Get the full plain text body of one email message, not just its snippet. The messageId comes from a get_thread result (each message there has an id). Use this when you need to read exactly what an email says, for example to answer questions about its content or to prepare a reply.",
        input_schema: {
            type: 'object',
            properties: {
                messageId: {
                    type: 'string',
                    description: 'The id of the message to read, from a get_thread result',
                },
            },
            required: ['messageId'],
        },
    },
    {
        name: 'create_draft',
        description:
            "Create a draft email in the user's Gmail account. This only saves a draft, it never sends anything. Use this when the user asks you to write, prepare, or draft a reply or a new email. Always show the user the exact draft content and get their confirmation before creating it.",
        input_schema: {
            type: 'object',
            properties: {
                to: {
                    type: 'string',
                    description: 'The recipient email address',
                },
                subject: {
                    type: 'string',
                    description: 'The subject line of the email',
                },
                body: {
                    type: 'string',
                    description: 'The full text content of the email',
                },
            },
            required: ['to', 'subject', 'body'],
        },
    },
    {
        name: 'send_draft',
        description:
            "Send an existing Gmail draft by its draftId. This permanently sends the email and cannot be undone. Only call this after the user has seen the exact draft content and has explicitly confirmed they want it sent, for example by saying 'yes, send it'. Never call this right after creating a draft without that confirmation.",
        input_schema: {
            type: 'object',
            properties: {
                draftId: {
                    type: 'string',
                    description: 'The id of the draft to send, from a create_draft result',
                },
            },
            required: ['draftId'],
        },
    },
    {
        name: 'list_drafts',
        description:
            "List the user's saved Gmail drafts, showing their ids. Use this to check what drafts exist, for example to find a draftId before sending, or to confirm whether a draft was created or already sent.",
        input_schema: {
            type: 'object',
            properties: {
                maxResults: {
                    type: 'number',
                    description: 'How many drafts to return. Defaults to 5.',
                },
            },
            required: [],
        },
    },
];
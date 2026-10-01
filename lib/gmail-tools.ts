import path from 'node:path';
import process from 'node:process';
// import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import fs from 'node:fs/promises';

const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.compose',
];
const CREDENTIALS_PATH = path.join(process.cwd(), 'lib', 'secrets', 'credentials.json');
const TOKEN_PATH = path.join(process.cwd(), 'lib', 'secrets', 'token.json');

let gmail;

// async function getAuth() {
//     try {
//         // 1. Try the saved login
//         const saved = JSON.parse(await fs.readFile(TOKEN_PATH, 'utf8'));
//         const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH, 'utf8'));
//         const { client_id, client_secret } = keys.installed;

//         const auth = new google.auth.OAuth2(client_id, client_secret);
//         auth.setCredentials(saved);
//         return auth;
//     } catch {
//         // 2. No saved login yet, so sign in with the browser
//         const auth = await authenticate({
//             scopes: SCOPES,
//             keyfilePath: CREDENTIALS_PATH,
//         });
//         await fs.writeFile(TOKEN_PATH, JSON.stringify(auth.credentials));
//         return auth;
//     }
// }

async function getAuth() {
    const saved = JSON.parse(await fs.readFile(TOKEN_PATH, 'utf8'));
    const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH, 'utf8'));
    const { client_id, client_secret } = keys.installed;

    const auth = new google.auth.OAuth2(client_id, client_secret);
    auth.setCredentials(saved);
    return auth;
}

async function getGmail() {
    if (!gmail) {
        const auth = await getAuth();
        gmail = google.gmail({ version: 'v1', auth });
    }
    return gmail;
}

async function listLabels() {
    const gmail = await getGmail();

    const result = await gmail.users.labels.list({
        userId: 'me',
    });

    const labels = result.data.labels;
    if (!labels || labels.length === 0) {
        console.log('No labels found.');
        return;
    }
    console.log('Labels:');

    labels.forEach((label) => {
        console.log(`- ${label.name}`);
    });
}

async function searchThreads(query, maxResults = 3) {
    const gmail = await getGmail();

    const result = await gmail.users.threads.list({
        userId: 'me',
        q: query,
        maxResults,
    });

    return result.data.threads ?? [];
}

async function getThread(threadId) {
    const gmail = await getGmail();

    const result = await gmail.users.threads.get({
        userId: 'me',
        id: threadId,
        format: 'metadata',
        metadataHeaders: ['From', 'Subject', 'Date'],
    });

    const messages = result.data.messages ?? [];

    return messages.map((message) => {
        const headers = message.payload?.headers ?? [];
        const find = (name) => headers.find((h) => h.name === name)?.value;

        return {
            id: message.id,
            from: find('From'),
            subject: find('Subject'),
            date: find('Date'),
            snippet: message.snippet,
        };
    });
}

async function getMessageBody(messageId) {
    const gmail = await getGmail();

    const result = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
    });

    const findBody = (part) => {
        if (part.mimeType === 'text/plain' && part.body?.data) {
            return part.body.data;
        }
        if (part.parts) {
            for (const sub of part.parts) {
                const found = findBody(sub);
                if (found) return found;
            }
        }
        return null;
    };

    const encoded = findBody(result.data.payload);
    if (!encoded) return '';

    return Buffer.from(encoded, 'base64url').toString('utf8');
}

async function createDraft(to, subject, body) {
    const gmail = await getGmail();

    const message = [
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        body,
    ].join('\n');

    const encodedMessage = Buffer.from(message).toString('base64url');

    const result = await gmail.users.drafts.create({
        userId: 'me',
        requestBody: {
            message: {
                raw: encodedMessage,
            },
        },
    });

    return { draftId: result.data.id };
}

async function sendDraft(draftId) {
    const gmail = await getGmail();

    const result = await gmail.users.drafts.send({
        userId: 'me',
        requestBody: {
            id: draftId,
        },
    });

    return { messageId: result.data.id };
}

async function listDrafts(maxResults = 5) {
    const gmail = await getGmail();

    const result = await gmail.users.drafts.list({
        userId: 'me',
        maxResults,
    });

    return result.data.drafts ?? [];
}

export async function runTool(name, input) {
    if (name === 'search_threads') {
        return await searchThreads(input.query, input.maxResults);
    } else if (name === 'get_thread') {
        return await getThread(input.threadId);
    } else if (name === 'get_message_body') {
        return await getThread(input.messageId);
    } else if (name === 'create_draft') {
        return await createDraft(input.to, input.subject, input.body);
    }else if (name === 'send_draft') {
        return await sendDraft(input.draftId);
    } else if (name === 'list_drafts') {
        return await listDrafts(input.maxResults);
    }

    throw new Error('Unknown tool: ' + name);
}

import path from 'node:path';
import process from 'node:process';
import fs from 'node:fs/promises';
import { authenticate } from '@google-cloud/local-auth';

const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.compose',
];
const CREDENTIALS_PATH = path.join(process.cwd(), 'secrets', 'credentials.json');
const TOKEN_PATH = path.join(process.cwd(), 'secrets', 'token.json');

const auth = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
});

await fs.writeFile(TOKEN_PATH, JSON.stringify(auth.credentials));
console.log('Saved login to', TOKEN_PATH);
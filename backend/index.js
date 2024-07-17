import express from 'express';
import multer from 'multer';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import dotenv from 'dotenv';
import fs from 'node:fs';

dotenv.config();

const app = express();
const upload = multer();

async function generateDescription(text, files) {
    const messages = [
        {
            role: 'user',
            content: [
                { type: 'text', text: text },
                ...files.map(file => ({ type: 'image', image: file.buffer })),
            ],
        },
    ];

    const result = await generateText({
        model: google('models/gemini-pro-vision'),
        maxTokens: 512,
        messages: messages,
    });

    return result.text;
}

app.post('/generate-description', upload.array('files'), async (req, res) => {
    const text = req.body.text;
    const files = req.files;

    try {
        const description = await generateDescription(text, files);
        res.send(description);
    } catch (error) {
        res.status(500).send({ error: 'Failed to generate description' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

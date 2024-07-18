import express from 'express';
import multer from 'multer';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import dotenv from 'dotenv';
import fs from 'node:fs';
import cors from 'cors'

dotenv.config();

const app = express();
app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200
}));

const upload = multer();

async function generateDescription(texto, files) {
    const contento = `Eres un profesor de matemáticas, si te envían un problema resuelvo paso a paso, retorna html para los titulos y la estructura de la respuesta, para escribir matemáticas usa este formato \\[x = \\frac{{-b \\pm \\sqrt{{b^2 - 4ac}}}}{2a}\\] si consideras necesario graficar algo envíame los puntos o las funciones en un json dentro de una etiqueta <script>[{ id: 'graph1', latex: 'y=/x^3' },{ id: 'graph2', latex: 'y=/cos(x)' }]</script> yo voy a hacer un parseo, si no lo requieres no lo envies`
    const messages = [
        {
            role: 'user',
            content: [
                { type: 'text', text: `${contento}\n\nPregunta o problema: ${texto}` },
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
    const text = req.body.message;
    const files = req.files;
    const contento = `Eres un profesor de matemáticas, si te envían un problema resuelvo paso a paso, retorna html para los titulos y la estructura de la respuesta, para escribir matemáticas usa este formato \\[x = \\frac{{-b \\pm \\sqrt{{b^2 - 4ac}}}}{2a}\\] si consideras necesario graficar algo envíame los puntos o las funciones en un json dentro de una etiqueta <script>[{ id: 'graph1', latex: 'y=/x^3' },{ id: 'graph2', latex: 'y=/cos(x)' }]</script> yo voy a hacer un parseo, si no lo requieres no lo envies`
    const question = `${contento}\n\nPregunta o problema: ${text}`
    try {
        const description = await generateDescription(question, files);
        res.send(description);
    } catch (error) {
        res.status(500).send({ error: 'Failed to generate description' });
    }
});

app.post('/generate-message', express.json(), async (req, res) => {
    const text = req.body.message;
    const contento = `Eres un profesor de matemáticas, si te envían un problema resuelvo paso a paso, retorna html para los titulos y la estructura de la respuesta, para escribir matemáticas usa este formato \\[x = \\frac{{-b \\pm \\sqrt{{b^2 - 4ac}}}}{2a}\\] si consideras necesario graficar algo envíame los puntos o las funciones en un json dentro de una etiqueta <script>[{ id: 'graph1', latex: 'y=/x^3' },{ id: 'graph2', latex: 'y=/cos(x)' }]</script> yo voy a hacer un parseo, si no lo requieres no lo envies`
    const question = `${contento}\n\nPregunta o problema: ${text}`
    try {
        const result = await generateText({
            model: google('models/gemini-pro'),
            prompt: question,
        });
        res.send(result.text);
    } catch (error) {
        res.status(500).send({ error: 'Failed to generate message' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

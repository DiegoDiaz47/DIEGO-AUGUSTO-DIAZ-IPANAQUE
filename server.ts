import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API: Generate personalized motivational quote with Gemini
app.post('/api/generate-message', async (req, res) => {
  const { mood, moodLabel, latestJournalEntry } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY no configurado en el servidor',
      fallback: true,
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `Eres un mentor de bienestar emocional compasivo, cálido, lúcido y profundamente humano.
El usuario se encuentra en el estado de ánimo: "${moodLabel || mood}".
${latestJournalEntry ? `Lo más reciente que escribió en su diario íntimo personal es:\n"""${latestJournalEntry}"""\n` : 'El usuario no tiene entradas recientes en su diario todavía.'}

Genera un mensaje motivacional y de fuerza para este momento exacto.
Reglas estrictas:
1. Sé cálido, directo y auténtico. Evita lugares comunes y positividad tóxica.
2. Si hay texto del diario, conecta sutilmente con lo que siente sin juzgarlo, dándole claridad y un motivo para seguir adelante.
3. Máximo 2 a 3 oraciones (entre 20 y 45 palabras).
4. El texto debe fluir de forma hermosa al ser leído en voz alta en español.
5. Devuelve ÚNICAMENTE el mensaje, sin comillas, sin introducciones ni firmas.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.85,
        systemInstruction: 'Eres un acompañante de bienestar personal que genera reflexiones breves, lúcidas y reconfortantes en español para la app Ánimo.',
      },
    });

    const text = response.text?.trim() || '';
    if (!text) {
      return res.status(500).json({ error: 'No se generó texto', fallback: true });
    }

    return res.json({
      message: text,
      author: 'Ánimo IA (Personalizado)',
      isAiGenerated: true,
    });
  } catch (err: any) {
    console.error('Error al generar mensaje con Gemini:', err?.message || err);
    return res.status(500).json({
      error: err?.message || 'Error al conectar con la IA',
      fallback: true,
    });
  }
});

// Vite middleware in dev or static serve in prod
const isProd = process.env.NODE_ENV === 'production';
if (!isProd) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});

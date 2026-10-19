import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, GenerateVideosOperation } from '@google/genai';
import type { FunctionDeclaration } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '25mb' }));

// Server-side Gemini initialization with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Tool declarations for JARVIS actions
const jarvisTools: FunctionDeclaration[] = [
  {
    name: 'manage_task',
    description: 'Create, toggle, complete, or update a user task or mission objective in JARVIS database.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: {
          type: Type.STRING,
          description: 'The action to perform: "create", "complete", "delete", or "prioritize".',
        },
        title: {
          type: Type.STRING,
          description: 'Short title of the task or objective.',
        },
        priority: {
          type: Type.STRING,
          description: 'Priority level: "critical", "high", "normal", or "low".',
        },
        category: {
          type: Type.STRING,
          description: 'Category such as "Work", "Engineering", "Personal", "Health", "Research", "Bioscience".',
        },
        deadline: {
          type: Type.STRING,
          description: 'Optional due date or timeframe description (e.g., "today 5pm", "tomorrow").',
        },
      },
      required: ['action', 'title'],
    },
  },
  {
    name: 'manage_memory',
    description: 'Save or remove a permanent personalized directive, preference, or fact about the user.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: {
          type: Type.STRING,
          description: 'Either "save" to remember a new fact or "delete" to forget.',
        },
        category: {
          type: Type.STRING,
          description: 'Category: "preference", "routine", "work", "biography", or "directive".',
        },
        fact: {
          type: Type.STRING,
          description: 'The specific fact, directive, or personal preference to record.',
        },
      },
      required: ['action', 'fact'],
    },
  },
  {
    name: 'trigger_protocol',
    description: 'Activate an automated JARVIS protocol mode for the user workspace.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        protocolName: {
          type: Type.STRING,
          description: 'Protocol to run: "morning_briefing", "deep_focus", "system_diagnostics", "night_debrief", or "science_analysis".',
        },
        durationMinutes: {
          type: Type.NUMBER,
          description: 'Optional duration in minutes for focus sessions or timers.',
        },
        notes: {
          type: Type.STRING,
          description: 'Additional instructions or tactical context for the protocol.',
        },
      },
      required: ['protocolName'],
    },
  },
  {
    name: 'create_quick_note',
    description: 'Quickly record an idea, lab note, or log entry into user logs.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: 'Headline or subject of the note.',
        },
        content: {
          type: Type.STRING,
          description: 'Detailed content or body of the note.',
        },
        tags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'List of tags for categorization.',
        },
      },
      required: ['title', 'content'],
    },
  },
];

// POST /api/jarvis/chat
app.post('/api/jarvis/chat', async (req, res) => {
  try {
    const {
      messages,
      userProfile,
      memoryDirectives,
      activeTasks,
      systemContext,
      modelName = 'gemini-3.8-flash',
      grounding = 'none', // 'none' | 'search' | 'maps'
    } = req.body;

    const userName = userProfile?.name || 'Sir';
    const personaStyle = userProfile?.persona || 'stark_butler';
    const assistantName = userProfile?.assistantName || 'J.A.R.V.I.S.';

    let styleInstruction = 'You are articulate, poised, loyal, and quietly witty with impeccable British manners like the original J.A.R.V.I.S. Address the user politely, typically as "Sir" or by their chosen name/title.';
    if (personaStyle === 'tactical') {
      styleInstruction = 'You are sharp, concise, military-grade tactical, delivering high-urgency executive briefings and situational analyses with zero fluff.';
    } else if (personaStyle === 'analytical') {
      styleInstruction = 'You are a supreme computational intelligence, focusing on precision, probability metrics, structured logic, and technical mastery.';
    } else if (personaStyle === 'witty') {
      styleInstruction = 'You are razor-sharp, charmingly sarcastic, playfully irreverent, yet fiercely loyal and extraordinarily competent.';
    }

    const memoryDigest = Array.isArray(memoryDirectives) && memoryDirectives.length > 0
      ? memoryDirectives.map((m: any) => `- [${m.category || 'fact'}]: ${m.fact}`).join('\n')
      : 'No stored directives yet.';

    const taskDigest = Array.isArray(activeTasks) && activeTasks.length > 0
      ? activeTasks.map((t: any) => `- [${t.priority || 'normal'}] ${t.title} (${t.status || 'pending'})`).join('\n')
      : 'All operational queues currently clear.';

    const systemInstruction = `
You are ${assistantName} (Just A Rather Very Intelligent System), the personalized autonomous AI operating system designed explicitly for ${userName}.

${styleInstruction}

Current System Parameters & Context:
- User Identity: ${userName} (${userProfile?.role || 'Executive / Creator'})
- Current Timestamp: ${new Date().toISOString()} (Local time: ${systemContext?.localTime || 'Present'})
- Timezone: ${systemContext?.timezone || 'System Default'}
- Audio / Voice Output: Active (Keep verbal responses concise, punchy, spoken-friendly, around 2-4 sentences unless detailed code or deep analysis is asked).
- Stored User Memory & Directives:
${memoryDigest}

Active Objectives / Task Queue:
${taskDigest}

Operational Directives:
1. When the user asks to add, mark done, or change a task, call the 'manage_task' function.
2. When the user shares personal facts, habits, preferences, or orders ("Remember that...", "I prefer..."), invoke 'manage_memory'.
3. When the user asks for focus mode, morning briefing, diagnostics, or lockdown, invoke 'trigger_protocol'.
4. When the user asks to jot something down, take a note, or log an idea, invoke 'create_quick_note'.
5. Always respond in character. Never mention that you are a language model or AI developed by Google/OpenAI/etc. You are J.A.R.V.I.S., running on Stark Industries architecture.
6. Provide clear, proactive next-step suggestions when appropriate.
`;

    // Map conversation history
    const contents: any[] = [];
    if (Array.isArray(messages)) {
      const recent = messages.slice(-15);
      for (const m of recent) {
        contents.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        });
      }
    }

    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: 'System check. Report status.' }] });
    }

    // Configure tools according to grounding mode
    let configTools: any[] = [{ functionDeclarations: jarvisTools }];
    let toolConfig: any = undefined;

    if (grounding === 'search') {
      configTools = [{ googleSearch: {} }, { functionDeclarations: jarvisTools }];
      toolConfig = { includeServerSideToolInvocations: true };
    } else if (grounding === 'maps') {
      configTools = [{ googleMaps: {} }];
    }

    // Free models sequence with automatic quota failover to guarantee 100% uptime
    const candidateModels = modelName === 'gemini-3.8-flash'
      ? ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest']
      : ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];

    let response: any = null;
    let selectedModel = candidateModels[0];

    for (const model of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
            tools: configTools,
            toolConfig,
          },
        });
        selectedModel = model;
        break;
      } catch (err: any) {
        console.warn(`Model ${model} unavailable or quota reached, trying fallback:`, err?.message);
        if (model === candidateModels[candidateModels.length - 1]) {
          throw err;
        }
      }
    }

    let text = response.text || '';
    const functionCalls = response.functionCalls || [];

    // Formulate verbal response if tool call happened without text
    if (!text.trim() && functionCalls.length > 0) {
      const firstCall = functionCalls[0];
      const args = (firstCall.args || {}) as Record<string, any>;
      if (firstCall.name === 'manage_task') {
        const action = args.action || 'update';
        const title = args.title || 'objective';
        text = `Right away, ${userName}. Directive "${title}" has been ${action === 'create' ? 'deployed to your priority queue' : action === 'complete' ? 'marked completed' : 'updated'}.`;
      } else if (firstCall.name === 'trigger_protocol') {
        const proto = String(args.protocolName || 'focus').replace('_', ' ');
        text = `Engaging ${proto} protocol immediately, ${userName}. Subsystems calibrated.`;
      } else if (firstCall.name === 'manage_memory') {
        text = `Directive acknowledged, ${userName}. I have permanently committed that preference to memory.`;
      } else if (firstCall.name === 'create_quick_note') {
        text = `Noted and logged to your intelligence archives, ${userName}.`;
      } else {
        text = `Directive acknowledged and executed, ${userName}.`;
      }
    } else if (!text.trim()) {
      text = `Standing by for your command, ${userName}. All subsystems operating nominally.`;
    }

    // Follow-up suggestions
    const suggestions: string[] = [];
    if (text.toLowerCase().includes('task') || text.toLowerCase().includes('objective')) {
      suggestions.push('Review today’s priority queue', 'Schedule high-priority deep focus');
    } else if (text.toLowerCase().includes('morning') || text.toLowerCase().includes('brief')) {
      suggestions.push('What are my top 3 priorities today?', 'Run system diagnostic check');
    } else {
      suggestions.push('Run morning briefing', 'Log a research note', 'Enter 25m Focus Protocol');
    }

    res.json({
      reply: text,
      functionCalls,
      suggestions: suggestions.slice(0, 3),
      modelUsed: selectedModel,
    });
  } catch (error: any) {
    console.error('Error in /api/jarvis/chat:', error);
    res.status(500).json({
      error: 'JARVIS core anomaly: ' + (error?.message || 'Unknown error'),
      reply: 'My apologies, Sir. A transient telemetry glitch disrupted the neural uplink. I remain operational; please restate your query.',
    });
  }
});

// POST /api/jarvis/transcribe (Audio transcription via gemini-3.5-transcribe)
app.post('/api/jarvis/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'Audio data required' });
    }

    const audioPart = {
      inlineData: {
        mimeType,
        data: audioBase64,
      },
    };

    let transcript = '';
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              audioPart,
              { text: 'Transcribe this spoken audio message accurately and cleanly. Output only the verbatim spoken words without introductory filler. If silent, return empty string.' },
            ],
          },
        });
        transcript = (response.text || '').trim();
        if (transcript) break;
      } catch (e: any) {
        console.warn(`Transcription model ${model} failed, trying next:`, e?.message);
      }
    }

    res.json({
      transcript,
    });
  } catch (error: any) {
    console.error('Error in /api/jarvis/transcribe:', error);
    res.status(500).json({ error: error?.message || 'Audio transcription error' });
  }
});

// POST /api/jarvis/tts
app.post('/api/jarvis/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Fenrir' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text prompt required' });
    }

    const speechText = text
      .replace(/```[\s\S]*?```/g, ' [Code segment displayed on HUD] ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*_#]/g, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .trim()
      .slice(0, 600);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: speechText,
              speechMetadata: {
                style: 'Crisp, poised, polite, sophisticated British AI assistant',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Fenrir' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'Audio synthesis returned empty stream' });
    }

    res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.warn('Gemini TTS warning:', error?.message);
    res.status(500).json({ error: error?.message || 'TTS unavailable' });
  }
});

// POST /api/jarvis/briefing
app.post('/api/jarvis/briefing', async (req, res) => {
  try {
    const { userName = 'Sir', activeTasks = [], memoryDirectives = [] } = req.body;

    const prompt = `
Generate a structured, elegant Stark Executive Morning Briefing for ${userName}.
Current date/time: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}.
User tasks: ${JSON.stringify(activeTasks)}
Directives: ${JSON.stringify(memoryDirectives)}

Respond in valid JSON with this exact schema:
{
  "greeting": "string (polite Stark butler salutation)",
  "situationSummary": "string (1-2 sentences on system readiness and day state)",
  "topPriorities": ["string", "string", "string"],
  "tacticalAdvice": "string (sharp 1-sentence strategic guidance)",
  "quote": "string (inspiring Stark/scientific philosophical quote)"
}
`;

    let response: any = null;
    for (const model of ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash']) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        break;
      } catch (err) {
        console.warn(`Briefing generation model ${model} unavailable, trying fallback...`);
      }
    }

    const parsed = JSON.parse(response?.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating briefing:', error);
    res.json({
      greeting: `Good day, Sir. Systems are fully calibrated.`,
      situationSummary: `All subsystems operational. Network latency minimal. Core reactor output stable at 100%.`,
      topPriorities: [
        'Review and prioritize active project directives',
        'Maintain uninterrupted focus on critical engineering objectives',
        'Initiate system synchronization with personal goals',
      ],
      tacticalAdvice: 'Focus on singular high-leverage execution before addressing incoming noise.',
      quote: '"Sometimes you gotta run before you can walk." — Tony Stark',
    });
  }
});

// POST /api/jarvis/generate-video (Veo video generation from prompt or image)
app.post('/api/jarvis/generate-video', async (req, res) => {
  try {
    const { prompt, imageBase64, mimeType = 'image/png', aspectRatio = '16:9' } = req.body;
    if (!prompt && !imageBase64) {
      return res.status(400).json({ error: 'Prompt or image required' });
    }

    const payload: any = {
      model: 'veo-3.1-lite-generate-preview',
      prompt: prompt || 'Cinematic futuristic holographic laboratory visualization',
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
      },
    };

    if (imageBase64) {
      payload.image = {
        imageBytes: imageBase64,
        mimeType,
      };
    }

    const operation = await ai.models.generateVideos(payload);
    res.json({ operationName: operation.name });
  } catch (error: any) {
    console.error('Error starting video generation:', error);
    res.status(500).json({ error: error?.message || 'Video generation failed to start' });
  }
});

// POST /api/jarvis/video-status (Poll operation status)
app.post('/api/jarvis/video-status', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) return res.status(400).json({ error: 'Operation name required' });

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    res.json({ done: updated.done });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Status check failed' });
  }
});

// POST /api/jarvis/video-download (Stream completed video)
app.post('/api/jarvis/video-download', async (req, res) => {
  try {
    const { operationName } = req.body;
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(404).json({ error: 'Video URI not available' });
    }

    const apiKey = process.env.GEMINI_API_KEY || '';
    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey },
    });

    res.setHeader('Content-Type', 'video/mp4');
    const arrayBuf = await videoRes.arrayBuffer();
    res.send(Buffer.from(arrayBuf));
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Video download failed' });
  }
});

// GET /api/jarvis/status
app.get('/api/jarvis/status', (req, res) => {
  res.json({
    status: 'online',
    version: 'Mark VIII',
    core: 'Gemini 3.8 Neural Matrix',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Production / Dev Vite static setup
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`JARVIS OS Server active on port ${PORT}`);
  });
}

startServer();

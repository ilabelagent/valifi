import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const formatHistoryForGemini = (history = []) => {
    // Ensure history alternates between user and model, starting with user.
    // Filters out any consecutive messages from the same author.
    const formatted = [];
    let lastRole = 'model'; // Assume the model spoke last to accept the first user message
    for (const msg of history) {
        const currentRole = msg.author === 'user' ? 'user' : 'model';
        if (currentRole !== lastRole) {
            formatted.push({
                role: currentRole,
                parts: [{ text: msg.text }],
            });
            lastRole = currentRole;
        }
    }
    return formatted;
};

const callGenerativeModel = async (prompt, history, systemInstruction) => {
    const formattedHistory = formatHistoryForGemini(history);
    const contents = [
        ...formattedHistory,
        { role: 'user', parts: [{ text: prompt }] }
    ];

    const config = systemInstruction ? { systemInstruction } : {};

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: config
    });

    return response.text;
};

export const callCoPilot = async (req, res) => {
    try {
        const { contextPrompt, history, systemInstruction } = req.body;
        if (!contextPrompt) {
            return res.status(400).json({ success: false, message: 'Context prompt is required.' });
        }
        
        const text = await callGenerativeModel(contextPrompt, history, systemInstruction);
        res.status(200).json({ success: true, data: { text } });

    } catch (error) {
        console.error('Co-Pilot AI Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get response from Co-Pilot AI.' });
    }
};

export const callTaxAdvisor = async (req, res) => {
    try {
        const { prompt, history } = req.body;
        if (!prompt) {
            return res.status(400).json({ success: false, message: 'Prompt is required.' });
        }
        
        const text = await callGenerativeModel(prompt, history, undefined);
        res.status(200).json({ success: true, data: { text } });
    } catch (error) {
        console.error('Tax Advisor AI Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get response from Tax Advisor AI.' });
    }
};
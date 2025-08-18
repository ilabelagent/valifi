import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const formatHistoryForGemini = (history = []) => {
    return history.map(msg => ({
        role: msg.author === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
    }));
};

export const callCoPilot = async (req, res) => {
    try {
        const { contextPrompt, history, systemInstruction } = req.body;
        if (!contextPrompt) {
            return res.status(400).json({ success: false, message: 'Context prompt is required.' });
        }

        const formattedHistory = formatHistoryForGemini(history);
        
        const contents = [
            ...formattedHistory,
            { role: 'user', parts: [{ text: contextPrompt }] }
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: { systemInstruction }
        });

        res.status(200).json({ success: true, data: { text: response.text } });
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

        const formattedHistory = formatHistoryForGemini(history);

        const contents = [
            ...formattedHistory,
            { role: 'user', parts: [{ text: prompt }] }
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
        });

        res.status(200).json({ success: true, data: { text: response.text } });
    } catch (error) {
        console.error('Tax Advisor AI Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get response from Tax Advisor AI.' });
    }
};
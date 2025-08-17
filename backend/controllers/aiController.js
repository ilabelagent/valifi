import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const callCoPilot = async (req, res) => {
    try {
        const { prompt, systemInstruction } = req.body;
        if (!prompt || !systemInstruction) {
            return res.status(400).json({ status: 'error', message: 'Prompt and systemInstruction are required.' });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { systemInstruction }
        });

        res.status(200).json({ status: 'success', data: { text: response.text } });
    } catch (error) {
        console.error('Co-Pilot AI Error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to get response from Co-Pilot AI.' });
    }
};

export const callTaxAdvisor = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ status: 'error', message: 'Prompt is required.' });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        res.status(200).json({ status: 'success', data: { text: response.text } });
    } catch (error) {
        console.error('Tax Advisor AI Error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to get response from Tax Advisor AI.' });
    }
};

import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userAnswers } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key not configured' });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      You are an expert career counselor. Based on the following user profile data, provide the top 5 highly suitable career paths.
      Provide each path as a short name and a 1-sentence explanation of why it fits.

      USER DATA:
      ${JSON.stringify(userAnswers, null, 2)}

      Format the response as a valid JSON array of objects like this:
      [{"title": "Career Name", "description": "Why it fits..."}]
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from potentially markdown-fenced text
        const jsonMatch = text.match(/\[.*\]/s);
        const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

        res.status(200).json({ suggestions });
    } catch (error) {
        console.error('Analysis failed:', error);
        res.status(500).json({ error: 'Failed to analyze profile', details: error.message });
    }
}

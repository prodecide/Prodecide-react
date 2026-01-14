import { GoogleGenerativeAI } from "@google/generative-ai";
import clientPromise from '../lib/mongodb.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userAnswers } = req.body;
        if (!userAnswers) {
            return res.status(400).json({ error: 'No data provided' });
        }

        console.log("--------------------------------------------------");
        console.log("📥 BACKEND: Received Data, Starting Analysis...");

        // 1. Perform AI Analysis
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

        // Extract JSON
        const jsonMatch = text.match(/\[.*\]/s);
        const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        console.log("✅ BACKEND: Analysis Complete");

        // 2. Save Full Record to DB
        const client = await clientPromise;
        const database = client.db('prodecide');
        const collection = database.collection('assessments');

        const submission = {
            userAnswers,
            analysis: suggestions, // Saving the AI results
            createdAt: new Date(),
        };

        const dbResult = await collection.insertOne(submission);
        console.log("✅ BACKEND: Saved to DB with ID:", dbResult.insertedId);

        return res.status(201).json({
            message: 'Analysis completed and saved',
            id: dbResult.insertedId, // Return ID for redirection
            suggestions // Return suggestions for immediate optional use
        });

    } catch (error) {
        console.error('❌ BACKEND FAILED:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}

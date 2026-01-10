import { MongoClient } from 'mongodb';

let client;

export default async function handler(req, res) {
    const uri = process.env.MONGODB_URI;
    console.log(uri);

    if (!uri) {
        return res.status(500).json({ error: 'MONGODB_URI environment variable is missing. Please add it to your Vercel project.' });
    }

    try {
        if (!client) {
            client = new MongoClient(uri);
            await client.connect();
        }

        const database = client.db('prodecide');
        const consultants = database.collection('consultants');

        if (req.method === 'GET') {
            const allConsultants = await consultants.find({}).toArray();
            return res.status(200).json(allConsultants);
        }

        if (req.method === 'POST') {
            const newConsultant = req.body;
            // Basic validation
            if (!newConsultant.name || !newConsultant.role) {
                return res.status(400).json({ error: 'Name and role are required' });
            }

            const result = await consultants.insertOne(newConsultant);
            return res.status(201).json({ ...newConsultant, _id: result.insertedId });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Database operation failed:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}

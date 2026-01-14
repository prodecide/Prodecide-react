import clientPromise from '../lib/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const database = client.db('prodecide');
        const consultants = database.collection('consultants');

        if (req.method === 'GET') {
            const { id } = req.query;
            if (id) {
                try {
                    const consultant = await consultants.findOne({ _id: new ObjectId(id) });
                    if (!consultant) {
                        return res.status(404).json({ error: 'Consultant not found' });
                    }
                    return res.status(200).json(consultant);
                } catch (e) {
                    return res.status(400).json({ error: 'Invalid ID format' });
                }
            }
            const allConsultants = await consultants.find({}).toArray();
            return res.status(200).json(allConsultants);
        }

        if (req.method === 'POST') {
            const newConsultant = req.body;
            // Basic validation
            if (!newConsultant.name || !newConsultant.email) {
                return res.status(400).json({ error: 'Name and email are required' });
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

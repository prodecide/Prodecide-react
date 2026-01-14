import clientPromise from '../lib/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'Missing ID parameter' });
    }

    try {
        const client = await clientPromise;
        const database = client.db('prodecide');
        const collection = database.collection('assessments');

        let objectId;
        try {
            objectId = new ObjectId(id);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        const result = await collection.findOne({ _id: objectId });

        if (!result) {
            return res.status(404).json({ error: 'Result not found' });
        }

        return res.status(200).json(result);

    } catch (error) {
        console.error('Failed to fetch result:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

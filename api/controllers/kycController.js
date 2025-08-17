import { db } from '../lib/db.js';

export const submitKyc = async (req, res) => {
    const user = req.user;

    if (user.kycStatus === 'Approved' || user.kycStatus === 'Pending') {
        return res.status(400).json({ status: 'error', message: `KYC status is already ${user.kycStatus}.` });
    }

    try {
        await db.execute({
            sql: "UPDATE users SET kycStatus = 'Pending' WHERE id = ?",
            args: [user.id]
        });
        
        res.status(202).json({ status: 'success', message: 'KYC documents submitted for review.' });
    } catch(err) {
        console.error("KYC Submission DB Error:", err);
        res.status(500).json({ status: 'error', message: 'An internal error occurred.' });
    }
};
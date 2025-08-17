export const submitKyc = (req, res) => {
    const user = req.user;

    if (user.kycStatus === 'Approved' || user.kycStatus === 'Pending') {
        return res.status(400).json({ status: 'error', message: `KYC status is already ${user.kycStatus}.` });
    }

    user.kycStatus = 'Pending';
    
    // Simulate async approval process
    setTimeout(() => {
        if (user.kycStatus === 'Pending') {
            user.kycStatus = 'Approved';
            // Optionally add a notification here
        }
    }, 15000); // 15-second delay for simulation

    res.status(202).json({ status: 'success', message: 'KYC documents submitted for review.' });
};

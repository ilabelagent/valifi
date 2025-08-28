import type { UserSettings, CardDetails, CardApplicationData, BankAccount, LoanApplication, P2POrder, P2POffer, PaymentMethod, ReferralNode, ReferralActivity, CoPilotMessage, ChatMessage, P2PChatMessage, StakableStock, StakableAsset, REITProperty, InvestableNFT } from '../types';

const API_BASE_URL = '/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('valifi_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

// Health Check
export const checkDbStatus = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return await response.json();
    } catch (e) {
        console.error("Health check failed:", e);
        return { success: false, status: 'error', message: 'Failed to connect to API' };
    }
};

// Auth & User
export const getAppData = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/app-data`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await handleResponse(response);
    return result.data;
};

export const login = async (email: string, password: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        return await handleResponse(response);
    } catch (e: any) {
        return { success: false, message: e.message };
    }
};

export const register = async (fullName: string, username: string, email: string, password: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, username, email, password }),
        });
        return await handleResponse(response);
    } catch (e: any) {
        return { success: false, message: e.message };
    }
};

// Mock implementations for other endpoints
export const updateUserSettings = async (newSettings: UserSettings): Promise<UserSettings> => {
    return newSettings;
};

export const createWallet = async () => {
    return {
        secretPhrase: 'mock secret phrase for demo',
        assets: []
    };
};

export const importWallet = async (secretPhrase: string, source: string) => {
    return { success: true, message: 'Wallet imported successfully' };
};

export const requestDeposit = async (data: any) => {
    return { success: true, message: 'Deposit initiated' };
};

export const requestWithdrawal = async (data: any) => {
    return { success: true, message: 'Withdrawal requested' };
};

export const internalTransfer = async (recipient: string, amount: number, note: string) => {
    return { success: true, message: 'Transfer completed' };
};

export const searchInvestments = async (query: string) => {
    const tickers = ['AAPL', 'GOOGL', 'MSFT', 'BTC', 'ETH'];
    return tickers.filter(t => t.toLowerCase().includes(query.toLowerCase()));
};

export const onInitiateTrade = async (offerId: string, amount: number, paymentMethodId: string): Promise<P2POrder> => {
    return {
        id: `order_${Date.now()}`,
        offerId,
        amount,
        status: 'Pending',
        createdAt: new Date().toISOString()
    } as P2POrder;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
    return { order: { id: orderId, status } };
};

export const postChatMessage = async (orderId: string, text: string) => {
    return {
        message: {
            id: `msg_${Date.now()}`,
            text,
            timestamp: new Date().toISOString()
        }
    };
};

export const applyForCard = async (data: CardApplicationData) => {
    return {
        cardDetails: {
            ...data,
            status: 'Pending'
        } as CardDetails
    };
};

export const linkBankAccount = async (data: any) => {
    return {
        id: `bank_${Date.now()}`,
        ...data,
        status: 'Pending'
    } as BankAccount;
};

export const applyForLoan = async (data: any) => {
    return {
        id: `loan_${Date.now()}`,
        ...data,
        status: 'Pending',
        date: new Date().toISOString()
    } as LoanApplication;
};

export const submitKyc = async () => {
    return { success: true };
};

export const callTaxAdvisor = async (prompt: string, history: ChatMessage[] = []) => {
    return { text: 'Tax advice would appear here in production.' };
};

export const callCoPilot = async (contextPrompt: string, systemInstruction: string, history: CoPilotMessage[] = []) => {
    return { text: 'AI assistant response would appear here in production.' };
};

// Other mock functions
export const repayLoan = async (loanId: string, paymentAmount: number) => {
    return { success: true, message: 'Payment successful' };
};

export const swapAssets = async (fromTicker: string, toTicker: string, fromAmount: number) => {
    return { success: true, message: 'Swap executed' };
};

export const stakeCrypto = async (assetId: string, amount: number, duration: number, payoutDestination: string) => {
    return { success: true, message: 'Staking successful' };
};

export const stakeStock = async (stockTicker: string, amount: number) => {
    return { success: true, message: 'Stock staking successful' };
};

export const investReit = async (propertyId: string, amount: number) => {
    return { success: true, message: 'REIT investment successful' };
};

export const investNftFractional = async (nftId: string, amount: number) => {
    return { success: true, message: 'NFT investment successful' };
};

export const createP2POffer = async (offerData: any) => {
    return { success: true, message: 'Offer created' };
};

export const addPaymentMethod = async (methodData: any) => {
    return {
        id: `method_${Date.now()}`,
        ...methodData
    } as PaymentMethod;
};

export const deletePaymentMethod = async (methodId: string) => {
    return { success: true };
};
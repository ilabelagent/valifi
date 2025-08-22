

import type { UserSettings, CardDetails, CardApplicationData, BankAccount, LoanApplication, P2POrder, P2POffer, PaymentMethod, ReferralNode, ReferralActivity, CoPilotMessage, ChatMessage } from '../types';

const API_BASE_URL = '/api';

const fetchOptions = {
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: 'include' as const // Crucial for sending cookies
};

const handleNonJsonResponse = async (response: Response) => {
    const text = await response.text();
    // Use the text as the error message, or a default if text is empty
    return text || `HTTP error! status: ${response.status}`;
};


const handleDataResponse = async (response: Response) => {
    if (response.status === 204) return null;
    
    const contentType = response.headers.get('content-type');
    if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
            const json = await response.json();
            throw new Error(json.message || `HTTP error! status: ${response.status}`);
        } else {
            const text = await handleNonJsonResponse(response);
            throw new Error(text);
        }
    }

    if (contentType && contentType.includes('application/json')) {
        const json = await response.json();
        return json.data || json;
    }
    // If the server sends a successful (2xx) response that isn't JSON, return the text.
    return response.text();
};

const handleRootResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type');
    if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
            const json = await response.json();
            // The new backend sends { ok: false, message: '...' }
            throw new Error(json.message || `HTTP error! status: ${response.status}`);
        } else {
            const text = await handleNonJsonResponse(response);
            throw new Error(text);
        }
    }

    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }
    
    // Fallback for non-json success responses if any
    return response.text();
};


// --- Health Check ---

export const checkDbStatus = async (): Promise<{ success: boolean; status: string; message: string; }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/health/db`);
        const responseText = await response.text();

        if (!response.ok && !responseText) {
            return { success: false, status: 'error', message: `API server returned status ${response.status}` };
        }
        const json = JSON.parse(responseText);
        return { ...json, success: json.ok };
    } catch (e: any) {
        console.error("API health check failed:", e);
        return { success: false, status: 'error', message: 'Failed to connect to the API server or parse its response.' };
    }
};

// --- AUTH & USER ---

export const getAppData = async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/app-data`, {
        ...fetchOptions,
        method: 'GET',
    });
    // This endpoint may not exist yet in the new backend, so handle 404 gracefully
    if (response.status === 404) {
        console.warn("/api/app-data not found. Using empty data structure.");
        // Return a default structure to prevent app from crashing
        return {
             profile: {}, settings: {}, sessions: [], portfolio: { assets: [], transactions: [] },
             notifications: [], userActivity: [], newsItems: [], cardDetails: { status: 'Not Applied' },
             linkedBankAccounts: [], loanApplications: [], p2pOffers: [], p2pOrders: [],
             userPaymentMethods: [], reitProperties: [], stakableStocks: [], investableNFTs: [],
             spectrumPlans: [], stakableCrypto: [], referralSummary: { tree: null, activities: [] }
        };
    }
    return handleDataResponse(response);
};

export const me = async (): Promise<{ ok: boolean; profile: any }> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, { ...fetchOptions, method: 'GET' });
    return handleRootResponse(response);
};

export const login = async (email: string, password: string): Promise<{ ok: boolean; message?: string; user?: any; }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            ...fetchOptions,
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        return await handleRootResponse(response);
    } catch (e: any) {
        return { ok: false, message: e.message };
    }
};

export const socialLogin = async (provider: string): Promise<{ ok: boolean; message?: string; user?: any; }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/social-login`, {
            ...fetchOptions,
            method: 'POST',
            body: JSON.stringify({ provider }),
        });
        return await handleRootResponse(response);
    } catch (e: any) {
        return { ok: false, message: e.message };
    }
}

export const register = async (fullName: string, username: string, email: string, password: string): Promise<{ ok: boolean; message?: string; user?: any; }> => {
     try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            ...fetchOptions,
            method: 'POST',
            body: JSON.stringify({ fullName, username, email, password }),
        });
        return await handleRootResponse(response);
    } catch (e: any) {
        return { ok: false, message: e.message };
    }
};


export const updateUserSettings = async (newSettings: UserSettings): Promise<UserSettings> => {
     const response = await fetch(`${API_BASE_URL}/users/me/settings`, {
        ...fetchOptions,
        method: 'PUT',
        body: JSON.stringify(newSettings),
    });
    return handleDataResponse(response);
};

// --- WRITE OPERATIONS ---

export const searchInvestments = async (query: string): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/investments/search`, {
        ...fetchOptions,
        method: 'POST',
        body: JSON.stringify({ query }),
    });
    const result = await handleDataResponse(response);
    return result.tickers || [];
};

export const onInitiateTrade = async (offerId: string, amount: number, paymentMethodId: string): Promise<P2POrder> => {
    const response = await fetch(`${API_BASE_URL}/p2p/orders`, {
        ...fetchOptions,
        method: 'POST',
        body: JSON.stringify({ offerId, amount, paymentMethodId }),
    });
    return handleDataResponse(response);
};

export const applyForCard = async (data: CardApplicationData): Promise<{ cardDetails: CardDetails }> => {
    const response = await fetch(`${API_BASE_URL}/cards/apply`, {
        ...fetchOptions,
        method: 'POST',
        body: JSON.stringify(data),
    });
    return handleDataResponse(response);
};

export const linkBankAccount = async (data: Omit<BankAccount, 'id' | 'status'>): Promise<BankAccount> => {
    const response = await fetch(`${API_BASE_URL}/banking/accounts`, {
        ...fetchOptions,
        method: 'POST',
        body: JSON.stringify(data),
    });
    return handleDataResponse(response);
};

export const applyForLoan = async (data: Omit<LoanApplication, 'id' | 'date' | 'status'>): Promise<LoanApplication> => {
    const response = await fetch(`${API_BASE_URL}/loans/apply`, {
        ...fetchOptions,
        method: 'POST',
        body: JSON.stringify(data),
    });
    return handleDataResponse(response);
};

export const submitKyc = async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/kyc/submit`, {
        ...fetchOptions,
        method: 'POST',
    });
    await handleRootResponse(response);
};

// --- AI Services ---
export const callTaxAdvisor = async (prompt: string, history: ChatMessage[] = []): Promise<{ text: string }> => {
    const response = await fetch(`${API_BASE_URL}/ai/tax-advisor`, {
        ...fetchOptions,
        method: 'POST',
        body: JSON.stringify({ prompt, history }),
    });
    return handleDataResponse(response);
};

export const callCoPilot = async (contextPrompt: string, systemInstruction: string, history: CoPilotMessage[] = []): Promise<{ text: string }> => {
    const response = await fetch(`${API_BASE_URL}/ai/copilot`, {
        ...fetchOptions,
        method: 'POST',
        body: JSON.stringify({ contextPrompt, history, systemInstruction }),
    });
    return handleDataResponse(response);
};
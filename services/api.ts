import type { UserSettings, CardDetails, CardApplicationData, BankAccount, LoanApplication, P2POrder, P2POffer, PaymentMethod, ReferralNode, ReferralActivity, CoPilotMessage, ChatMessage } from '../types';

const API_BASE_URL = '/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('valifi_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
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


// --- AUTH & USER ---

export const getAppData = async (token: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/app-data`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleDataResponse(response);
};

export const login = async (email: string, password: string): Promise<{ success: boolean; message?: string; token?: string; }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        // Returns { success, token, message }
        return await handleRootResponse(response);
    } catch (e: any) {
        return { success: false, message: e.message };
    }
};

export const socialLogin = async (provider: string): Promise<{ success: boolean; message?: string; token?: string; }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/social-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider }),
        });
        return await handleRootResponse(response);
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

export const register = async (fullName: string, username: string, email: string, password: string): Promise<{ success: boolean; message?: string; token?: string; }> => {
     try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, username, email, password }),
        });
        
        // Returns { success, token, message }
        return await handleRootResponse(response);
    } catch (e: any) {
        return { success: false, message: e.message };
    }
};


export const updateUserSettings = async (newSettings: UserSettings): Promise<UserSettings> => {
     const response = await fetch(`${API_BASE_URL}/users/me/settings`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
    });
    return handleDataResponse(response);
};

// --- WRITE OPERATIONS ---

export const onInitiateTrade = async (offerId: string, amount: number, paymentMethodId: string): Promise<P2POrder> => {
    const response = await fetch(`${API_BASE_URL}/p2p/orders`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, amount, paymentMethodId }),
    });
    return handleDataResponse(response);
};

export const applyForCard = async (data: CardApplicationData): Promise<{ cardDetails: CardDetails }> => {
    const response = await fetch(`${API_BASE_URL}/cards/apply`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleDataResponse(response);
};

export const linkBankAccount = async (data: Omit<BankAccount, 'id' | 'status'>): Promise<BankAccount> => {
    const response = await fetch(`${API_BASE_URL}/banking/accounts`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleDataResponse(response);
};

export const applyForLoan = async (data: Omit<LoanApplication, 'id' | 'date' | 'status'>): Promise<LoanApplication> => {
    const response = await fetch(`${API_BASE_URL}/loans/apply`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleDataResponse(response);
};

export const submitKyc = async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/kyc/submit`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    await handleRootResponse(response);
};

// --- AI Services ---
export const callTaxAdvisor = async (prompt: string, history: ChatMessage[] = []): Promise<{ text: string }> => {
    const response = await fetch(`${API_BASE_URL}/ai/tax-advisor`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, history }),
    });
    return handleDataResponse(response);
};

export const callCoPilot = async (contextPrompt: string, systemInstruction: string, history: CoPilotMessage[] = []): Promise<{ text: string }> => {
    const response = await fetch(`${API_BASE_URL}/ai/copilot`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ contextPrompt, history, systemInstruction }),
    });
    return handleDataResponse(response);
};
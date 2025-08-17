import type { UserSettings, CardDetails, CardApplicationData, BankAccount, LoanApplication, P2POrder, P2POffer, PaymentMethod } from '../types';

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
    
    throw new Error('Expected JSON response but received a different format.');
};


// --- AUTH & USER ---

export const getUserProfile = async (token: string): Promise<any> => {
    // Fetch all initial data needed for the app to load.
    const [dashboardData, userMeData] = await Promise.all([
        handleDataResponse(await fetch(`${API_BASE_URL}/dashboard`, { headers: { 'Authorization': `Bearer ${token}` } })),
        handleDataResponse(await fetch(`${API_BASE_URL}/users/me`, { headers: { 'Authorization': `Bearer ${token}` } }))
    ]);

    // Combine into the single user object the application expects
    return {
        ...userMeData,      // profile, settings, sessions
        ...dashboardData,   // portfolio, notifications, userActivity, newsItems
    };
};

export const login = async (email: string, password: string): Promise<{ success: boolean; message?: string; user?: any; }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const authData = await handleRootResponse(response);
        
        const user = await getUserProfile(authData.token);
        
        return { success: true, user: { ...user, token: authData.token } };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
};

export const register = async (fullName: string, username: string, email: string, password: string): Promise<{ success: boolean; message?: string; user?: any; }> => {
     try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, username, email, password }),
        });
        
        const authData = await handleRootResponse(response);
        if(!authData.token) {
             return { success: false, message: authData.message };
        }
        
        const user = await getUserProfile(authData.token);
        return { success: true, user: { ...user, token: authData.token } };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
};


export const updateUserSettings = async (userId: string, newSettings: UserSettings): Promise<{settings: UserSettings}> => {
     const response = await fetch(`${API_BASE_URL}/users/me/settings`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
    });
    return handleDataResponse(response);
};

// --- DATA FETCHING (called from App.tsx) ---
export const getCardDetails = async (): Promise<CardDetails> => handleDataResponse(await fetch(`${API_BASE_URL}/cards/details`, { headers: getAuthHeaders() }));
export const getBankAccounts = async (): Promise<BankAccount[]> => handleDataResponse(await fetch(`${API_BASE_URL}/banking/accounts`, { headers: getAuthHeaders() }));
export const getLoans = async (): Promise<LoanApplication[]> => handleDataResponse(await fetch(`${API_BASE_URL}/loans`, { headers: getAuthHeaders() }));
export const getP2POffers = async (): Promise<{ offers: P2POffer[] }> => handleDataResponse(await fetch(`${API_BASE_URL}/p2p/offers`, { headers: getAuthHeaders() }));
export const getMyP2POrders = async (): Promise<{ orders: P2POrder[] }> => handleDataResponse(await fetch(`${API_BASE_URL}/p2p/my-orders`, { headers: getAuthHeaders() }));
export const getPaymentMethods = async (): Promise<{ paymentMethods: PaymentMethod[] }> => handleDataResponse(await fetch(`${API_BASE_URL}/p2p/payment-methods`, { headers: getAuthHeaders() }));
export const getReitProperties = async (): Promise<{ reitProperties: any[] }> => handleDataResponse(await fetch(`${API_BASE_URL}/investments/reit-properties`, { headers: getAuthHeaders() }));
export const getStakableStocks = async (): Promise<{ stakableStocks: any[] }> => handleDataResponse(await fetch(`${API_BASE_URL}/investments/stakable-stocks`, { headers: getAuthHeaders() }));
export const getInvestableNfts = async (): Promise<{ investableNFTs: any[] }> => handleDataResponse(await fetch(`${API_BASE_URL}/investments/investable-nfts`, { headers: getAuthHeaders() }));

// --- AI & OTHER ACTIONS ---
export const callCoPilot = async (prompt: string, systemInstruction?: string) => {
    const response = await fetch(`${API_BASE_URL}/ai/copilot`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction }),
    });
    return handleDataResponse(response);
};

export const callTaxAdvisor = async (prompt: string) => {
    const response = await fetch(`${API_BASE_URL}/ai/tax-advisor`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
    });
    return handleDataResponse(response);
};

export const internalTransfer = async (recipient: string, amount: number, note: string) => {
    const response = await fetch(`${API_BASE_URL}/funds/internal-transfer`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientIdentifier: recipient, amountUSD: amount, note }),
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
}

export const linkBankAccount = async (accountData: Omit<BankAccount, 'id'|'status'>): Promise<BankAccount> => {
     const response = await fetch(`${API_BASE_URL}/banking/accounts`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData),
    });
    return handleDataResponse(response);
}

export const applyForLoan = async (application: Omit<LoanApplication, 'id'|'date'|'status'>): Promise<LoanApplication> => {
    const response = await fetch(`${API_BASE_URL}/loans/apply`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(application),
    });
    return handleDataResponse(response);
}

export const onInitiateTrade = async (offerId: string, amount: number, paymentMethodId: string): Promise<P2POrder> => {
     const response = await fetch(`${API_BASE_URL}/p2p/orders`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, amount, paymentMethodId }),
    });
    const data = await handleDataResponse(response);
    return data.order;
};

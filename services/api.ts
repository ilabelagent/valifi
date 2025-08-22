import type { UserSettings, CardDetails, CardApplicationData, BankAccount, LoanApplication, P2POrder, P2POffer, PaymentMethod, ReferralNode, ReferralActivity, CoPilotMessage, ChatMessage, P2PChatMessage, StakableStock, StakableAsset, REITProperty, InvestableNFT } from '../types';

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


// --- Health Check ---

export const checkDbStatus = async (): Promise<{ success: boolean; status: string; message: string; }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/health/db`);
        // We expect JSON from our health endpoint, even on failure.
        const json = await response.json();
        return json;
    } catch (e: any) {
        // This catches network errors or if the backend returns non-JSON on a crash.
        console.error("API health check failed:", e);
        return { success: false, status: 'error', message: 'Failed to connect to the API server.' };
    }
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

// --- Wallet ---
export const createWallet = async (): Promise<{ secretPhrase: string; assets: any[] }> => {
    const response = await fetch(`${API_BASE_URL}/wallet/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return handleDataResponse(response);
};

export const importWallet = async (secretPhrase: string, source: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/wallet/import`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretPhrase, source }),
    });
    return handleRootResponse(response);
};


// --- Funds Management ---
export const requestDeposit = async (data: { amount: number, type: 'fiat' | 'crypto', coinTicker?: string }): Promise<{ success: boolean, message: string }> => {
    const response = await fetch(`${API_BASE_URL}/funds/deposit-intent`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleRootResponse(response);
};

export const requestWithdrawal = async (data: { amount: number, type: 'fiat' | 'crypto', destination: string, coinTicker?: string, coinAmount?: number }): Promise<{ success: boolean, message: string }> => {
    const response = await fetch(`${API_BASE_URL}/funds/withdraw-request`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleRootResponse(response);
};

export const internalTransfer = async (recipient: string, amount: number, note: string): Promise<{ success: boolean, message: string }> => {
    const response = await fetch(`${API_BASE_URL}/funds/internal-transfer`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientIdentifier: recipient, amountUSD: amount, note }),
    });
    return handleRootResponse(response);
};


// --- WRITE OPERATIONS ---

export const searchInvestments = async (query: string): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/investments/search`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
    });
    const result = await handleDataResponse(response);
    return result.tickers || [];
};

export const onInitiateTrade = async (offerId: string, amount: number, paymentMethodId: string): Promise<P2POrder> => {
    const response = await fetch(`${API_BASE_URL}/p2p/orders`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, amount, paymentMethodId }),
    });
    return handleDataResponse(response);
};

// --- P2P ---
export const updateOrderStatus = async (orderId: string, status: 'Payment Sent' | 'Escrow Released' | 'Cancelled'): Promise<P2POrder> => {
    const response = await fetch(`${API_BASE_URL}/p2p/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
    const result = await handleDataResponse(response);
    return result.order;
};

export const postChatMessage = async (orderId: string, text: string): Promise<P2PChatMessage> => {
    const response = await fetch(`${API_BASE_URL}/p2p/orders/${orderId}/chat`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
    });
    const result = await handleDataResponse(response);
    return result.message;
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

// --- NEWLY IMPLEMENTED ---

export const repayLoan = async (loanId: string, paymentAmount: number): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/loans/${loanId}/repay`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentAmount }),
    });
    return handleRootResponse(response);
}

export const swapAssets = async (fromTicker: string, toTicker: string, fromAmount: number): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/investments/swap`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromTicker, toTicker, fromAmount }),
    });
    return handleRootResponse(response);
}

export const stakeCrypto = async (assetId: string, amount: number, duration: number, payoutDestination: 'wallet' | 'balance'): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/investments/stake-crypto`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, amount, duration, payoutDestination }),
    });
    return handleRootResponse(response);
}

export const stakeStock = async (stockTicker: string, amount: number): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/investments/stake-stock`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockTicker, amount }),
    });
    return handleRootResponse(response);
}

export const investReit = async (propertyId: string, amount: number): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/investments/reit`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, amount }),
    });
    return handleRootResponse(response);
}

export const investNftFractional = async (nftId: string, amount: number): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/investments/nft-fractional`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ nftId, amount }),
    });
    return handleRootResponse(response);
}

export const createP2POffer = async (offerData: any): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/p2p/offers`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData),
    });
    return handleRootResponse(response);
}

export const addPaymentMethod = async (methodData: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> => {
    const response = await fetch(`${API_BASE_URL}/p2p/payment-methods`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(methodData),
    });
    return handleDataResponse(response);
}

export const deletePaymentMethod = async (methodId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/p2p/payment-methods/${methodId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    await handleDataResponse(response);
}
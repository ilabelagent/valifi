import type { PaymentMethod } from '../types';

export interface FormField {
    id: keyof PaymentMethod['details'];
    label: string;
    tooltip?: string;
    placeholder?: string;
    type: 'text' | 'select' | 'tel';
    validation?: {
        required: boolean;
        pattern?: string; // regex
        minLength?: number;
        maxLength?: number;
    };
    options?: { value: string; label: string }[];
}

export type CountryPaymentConfig = {
    [methodType: string]: FormField[];
};

export const paymentMethodsConfig: Record<string, CountryPaymentConfig> = {
    US: {
        'Bank Transfer (ACH)': [
            { id: 'accountHolderName', label: 'Account Holder Name', type: 'text', placeholder: 'John Doe', validation: { required: true } },
            { id: 'accountNumber', label: 'Account Number', type: 'text', placeholder: '123456789', validation: { required: true, pattern: '^[0-9]{9,17}$' } },
            { id: 'routingNumber', label: 'Routing Number (ACH)', type: 'text', placeholder: '111000025', validation: { required: true, pattern: '^[0-9]{9}$' } },
        ],
        'Cash App': [
            { id: 'cashtag', label: '$Cashtag', type: 'text', placeholder: '$yourcashtag', validation: { required: true, pattern: '^\\$[a-zA-Z0-9_]{1,20}$' } },
            { id: 'fullName', label: 'Full Name', type: 'text', placeholder: 'John Doe', validation: { required: true } },
        ]
    },
    GB: {
        'Bank Transfer (FPS)': [
             { id: 'accountHolderName', label: 'Account Holder Name', type: 'text', placeholder: 'Jane Smith', validation: { required: true } },
             { id: 'accountNumber', label: 'Account Number', type: 'text', placeholder: '12345678', validation: { required: true, pattern: '^[0-9]{8}$' } },
             { id: 'sortCode', label: 'Sort Code', type: 'text', placeholder: '11-22-33', validation: { required: true, pattern: '^[0-9]{2}-?[0-9]{2}-?[0-9]{2}$' } },
        ]
    },
    DE: { // Represents generic EU with SEPA
        'Bank Transfer (SEPA)': [
            { id: 'accountHolderName', label: 'Account Holder Name', type: 'text', placeholder: 'Max Mustermann', validation: { required: true } },
            { id: 'iban', label: 'IBAN', type: 'text', placeholder: 'DE89370400440532013000', validation: { required: true, pattern: '^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,30}$' } },
        ]
    },
    CA: {
        'Bank Transfer (EFT)': [
            { id: 'accountHolderName', label: 'Account Holder Name', type: 'text', placeholder: 'John Smith', validation: { required: true } },
            { id: 'institutionNumber', label: 'Institution Number (3 digits)', type: 'text', placeholder: '001', validation: { required: true, pattern: '^[0-9]{3}$' } },
            { id: 'transitNumber', label: 'Transit Number (5 digits)', type: 'text', placeholder: '12345', validation: { required: true, pattern: '^[0-9]{5}$' } },
            { id: 'accountNumber', label: 'Account Number', type: 'text', placeholder: '1234567', validation: { required: true, pattern: '^[0-9]{7,12}$' } },
        ],
        'Interac e-Transfer': [
            { id: 'emailOrPhone', label: 'Email or Phone Number', type: 'text', placeholder: 'name@example.com or +1...', validation: { required: true } },
            { id: 'fullName', label: 'Registered Name', type: 'text', placeholder: 'John Smith', validation: { required: true } },
        ]
    },
    BR: {
        'Bank Transfer (TED)': [
            { id: 'accountHolderName', label: 'Full Name (Nome Completo)', type: 'text', placeholder: 'Maria da Silva', validation: { required: true } },
            { id: 'cpf', label: 'CPF (Cadastro de Pessoas Físicas)', type: 'text', placeholder: '123.456.789-00', validation: { required: true, pattern: '^\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}$' } },
            { id: 'bankName', label: 'Bank Name (Nome do Banco)', type: 'text', placeholder: 'Banco do Brasil', validation: { required: true } },
            { id: 'agencyNumber', label: 'Agency (Agência)', type: 'text', placeholder: '1234-5', validation: { required: true, pattern: '^\\d{4}-?\\d{1}$' } },
            { id: 'accountNumber', label: 'Account Number (Conta)', type: 'text', placeholder: '12345-6', validation: { required: true, pattern: '^\\d{5,12}-?\\d{1}$' } },
        ],
        'PIX': [
            { id: 'pixKeyType', label: 'PIX Key Type (Tipo de Chave)', type: 'select', validation: { required: true }, options: [
                { value: 'cpf', label: 'CPF' },
                { value: 'email', label: 'Email' },
                { value: 'phone', label: 'Phone Number' },
                { value: 'random', label: 'Random Key (Chave Aleatória)' }
            ]},
            { id: 'pixKey', label: 'PIX Key (Chave PIX)', type: 'text', placeholder: 'Enter your PIX key', validation: { required: true } },
            { id: 'fullName', label: 'Full Name (Nome Completo)', type: 'text', placeholder: 'Maria da Silva', validation: { required: true } },
        ]
    },
    ZA: {
        'Bank Transfer (EFT)': [
            { id: 'accountHolderName', label: 'Account Holder Name', type: 'text', placeholder: 'John Botha', validation: { required: true } },
            { id: 'bankName', label: 'Bank Name', type: 'text', placeholder: 'FNB', validation: { required: true } },
            { id: 'accountNumber', label: 'Account Number', type: 'text', placeholder: '1234567890', validation: { required: true, pattern: '^[0-9]{5,11}$' } },
            { id: 'branchCode', label: 'Branch Code', type: 'text', placeholder: '250655', validation: { required: true, pattern: '^[0-9]{6}$' } },
        ]
    },
    NG: {
        'Bank Transfer': [
            { id: 'accountHolderName', label: 'Account Holder Name', type: 'text', placeholder: 'Chinedu Okoro', validation: { required: true } },
            { id: 'accountNumber', label: 'Account Number (NUBAN)', type: 'text', placeholder: '0123456789', validation: { required: true, pattern: '^[0-9]{10}$' } },
            { id: 'bankName', label: 'Bank Name', type: 'select', validation: { required: true }, options: [
                { value: 'Access Bank', label: 'Access Bank' },
                { value: 'First Bank', label: 'First Bank' },
                { value: 'GTBank', label: 'GTBank' },
                { value: 'Kuda Bank', label: 'Kuda Bank'},
                { value: 'Opay', label: 'Opay'},
                { value: 'Paga', label: 'Paga'},
                { value: 'Palmpay', label: 'Palmpay'},
                { value: 'UBA', label: 'UBA' },
                { value: 'Zenith Bank', label: 'Zenith Bank' },
            ]},
        ],
    },
    IN: {
        'Bank Transfer': [
            { id: 'accountHolderName', label: 'Account Holder Name', type: 'text', placeholder: 'Priya Sharma', validation: { required: true } },
            { id: 'accountNumber', label: 'Account Number', type: 'text', placeholder: 'Your account number', validation: { required: true, pattern: '^[0-9]{9,18}$' } },
            { id: 'ifscCode', label: 'IFSC Code', type: 'text', placeholder: 'SBIN0001234', validation: { required: true, pattern: '^[A-Z]{4}0[A-Z0-9]{6}$' } },
        ],
        'UPI': [
            { id: 'upiId', label: 'UPI ID', type: 'text', placeholder: 'yourname@okhdfcbank', validation: { required: true, pattern: '^[\\w.-]+@[\\w.-]+$' } },
            { id: 'accountHolderName', label: 'Registered Name', type: 'text', placeholder: 'Priya Sharma', validation: { required: true } },
        ]
    },
    KE: {
        'Mobile Money (M-Pesa)': [
             { id: 'registeredName', label: 'Registered Name', type: 'text', placeholder: 'Jomo Kenyatta', validation: { required: true } },
             { id: 'mobileNumber', label: 'Mobile Number', type: 'tel', placeholder: '0712345678', validation: { required: true, pattern: '^0[71][0-9]{8}$' } },
        ]
    },
    PH: {
        'Mobile Money (GCash)': [
            { id: 'registeredName', label: 'Registered Name', type: 'text', placeholder: 'Maria Clara', validation: { required: true } },
            { id: 'mobileNumber', label: 'GCash Mobile Number', type: 'tel', placeholder: '09171234567', validation: { required: true, pattern: '^09[0-9]{9}$' } },
        ],
        'Bank Transfer': [
            { id: 'accountHolderName', label: 'Account Holder Name', type: 'text', placeholder: 'Maria Clara', validation: { required: true } },
            { id: 'accountNumber', label: 'Account Number', type: 'text', placeholder: 'Your account number', validation: { required: true, pattern: '^[0-9]{10,12}$' } },
            { id: 'bankName', label: 'Bank Name', type: 'select', validation: { required: true }, options: [
                { value: 'BDO', label: 'BDO' },
                { value: 'BPI', label: 'BPI' },
                { value: 'Metrobank', label: 'Metrobank' },
                { value: 'UnionBank', label: 'UnionBank' },
            ]},
        ]
    },
    GLOBAL: {
        'Bank Transfer': [
            { id: 'accountHolderName', label: 'Account Holder Name', type: 'text', placeholder: 'John Doe', validation: { required: true } },
            { id: 'bankName', label: 'Bank Name', type: 'text', placeholder: 'Global Bank', validation: { required: true } },
            { id: 'accountNumberOrIban', label: 'Account Number / IBAN', type: 'text', placeholder: 'Your account identifier', validation: { required: true, minLength: 8 } },
            { id: 'swiftBicOrOtherCode', label: 'SWIFT/BIC or Local Code (Optional)', type: 'text', placeholder: 'e.g., Routing, Sort Code', validation: { required: false } },
        ],
        'Wise': [
            { id: 'emailOrPhone', label: 'Wise Email or Phone Number', type: 'text', placeholder: 'name@example.com or +123456789', validation: { required: true } },
            { id: 'accountHolderName', label: 'Full Name', type: 'text', placeholder: 'Your name on Wise', validation: { required: true } },
        ],
         'PayPal': [
            { id: 'email', label: 'PayPal Email', type: 'text', placeholder: 'name@example.com', validation: { required: true, pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$' } },
        ],
        'Skrill': [
            { id: 'email', label: 'Skrill Email', type: 'text', placeholder: 'name@example.com', validation: { required: true, pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$' } },
        ],
        'Revolut': [
            { id: 'revtagOrPhone', label: 'Revtag or Phone Number', type: 'text', placeholder: '@revtag or +123456789', validation: { required: true } },
            { id: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Your name on Revolut', validation: { required: true } },
        ],
        'International Wire (SWIFT)': [
            { id: 'accountHolderName', label: 'Beneficiary Name', type: 'text', placeholder: 'Full Name', validation: { required: true } },
            { id: 'iban', label: 'IBAN', type: 'text', placeholder: 'DE89370400440532013000', validation: { required: true, pattern: '^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,30}$' } },
            { id: 'swiftBic', label: 'SWIFT/BIC', type: 'text', placeholder: 'COBADEFFXXX', validation: { required: true, pattern: '^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$' } },
            { id: 'bankName', label: 'Bank Name', type: 'text', placeholder: 'International Bank', validation: { required: true } },
        ],
    }
};

export const getAvailableMethodsForCountry = (countryCode: string): Record<string, FormField[]> => {
    const countrySpecificMethods = paymentMethodsConfig[countryCode] || {};
    const globalMethods = paymentMethodsConfig['GLOBAL'] || {};

    const allEuCountries = ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE"];
    const sepaMethods = (allEuCountries.includes(countryCode) && paymentMethodsConfig['DE']) ? paymentMethodsConfig['DE'] : {};

    return { ...countrySpecificMethods, ...sepaMethods, ...globalMethods };
};

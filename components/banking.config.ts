export interface FormField {
    id: string;
    label: string;
    tooltip?: string;
    placeholder?: string;
    type: 'text' | 'tel';
    validation: {
        required: boolean;
        pattern?: string;
        minLength?: number;
        maxLength?: number;
    };
    isDisplayField?: boolean; // The field to use for the account summary, e.g., account number
    isProviderName?: boolean; // The field that contains the bank's name
}

export const bankingFieldsConfig: Record<string, FormField[]> = {
    US: [
        { id: 'accountHolderName', label: 'Account Holder Name', type: 'text', placeholder: 'John Doe', validation: { required: true } },
        { id: 'bankName', label: 'Bank Name', type: 'text', placeholder: 'Chase Bank', validation: { required: true }, isProviderName: true },
        { id: 'accountNumber', label: 'Account Number', type: 'text', placeholder: '123456789', validation: { required: true, pattern: '^[0-9]{9,17}$' }, isDisplayField: true },
        { id: 'routingNumber', label: 'Routing Number (ACH)', type: 'text', placeholder: '111000025', validation: { required: true, pattern: '^[0-9]{9}$' } },
    ],
    GB: [
        { id: 'accountHolderName', label: 'Account Holder Name', type: 'text', placeholder: 'Jane Smith', validation: { required: true } },
        { id: 'bankName', label: 'Bank Name', type: 'text', placeholder: 'Barclays', validation: { required: true }, isProviderName: true },
        { id: 'accountNumber', label: 'Account Number', type: 'text', placeholder: '12345678', validation: { required: true, pattern: '^[0-9]{8}$' }, isDisplayField: true },
        { id: 'sortCode', label: 'Sort Code', type: 'text', placeholder: '11-22-33', validation: { required: true, pattern: '^[0-9]{2}-?[0-9]{2}-?[0-9]{2}$' } },
    ],
    DE: [ // Generic SEPA
        { id: 'accountHolderName', label: 'Account Holder Name', type: 'text', placeholder: 'Max Mustermann', validation: { required: true } },
        { id: 'bankName', label: 'Bank Name', type: 'text', placeholder: 'Deutsche Bank', validation: { required: true }, isProviderName: true },
        { id: 'iban', label: 'IBAN', type: 'text', placeholder: 'DE89370400440532013000', validation: { required: true, pattern: '^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,30}$' }, isDisplayField: true },
        { id: 'swiftBic', label: 'SWIFT / BIC', type: 'text', placeholder: 'DEUTDEFF', validation: { required: true, pattern: '^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$' } },
    ],
    IN: [
        { id: 'accountHolderName', label: 'Account Holder Name', type: 'text', placeholder: 'Priya Sharma', validation: { required: true } },
        { id: 'bankName', label: 'Bank Name', type: 'text', placeholder: 'State Bank of India', validation: { required: true }, isProviderName: true },
        { id: 'accountNumber', label: 'Account Number', type: 'text', placeholder: 'Your account number', validation: { required: true, pattern: '^[0-9]{9,18}$' }, isDisplayField: true },
        { id: 'ifscCode', label: 'IFSC Code', type: 'text', placeholder: 'SBIN0001234', validation: { required: true, pattern: '^[A-Z]{4}0[A-Z0-9]{6}$' } },
    ],
     KE: [ // Mobile Money example
        { id: 'registeredName', label: 'Registered Name', type: 'text', placeholder: 'Jomo Kenyatta', validation: { required: true } },
        { id: 'providerName', label: 'Provider', type: 'text', placeholder: 'M-Pesa', validation: { required: true }, isProviderName: true },
        { id: 'mobileNumber', label: 'Mobile Number', type: 'tel', placeholder: '0712345678', validation: { required: true, pattern: '^0[71][0-9]{8}$' }, isDisplayField: true },
    ],
    DEFAULT: [ // Fallback for other countries
        { id: 'accountHolderName', label: 'Beneficiary Name', type: 'text', placeholder: 'Full Name', validation: { required: true } },
        { id: 'bankName', label: 'Bank Name', type: 'text', placeholder: 'International Bank', validation: { required: true }, isProviderName: true },
        { id: 'accountNumberOrIban', label: 'Account Number / IBAN', type: 'text', placeholder: 'Your account identifier', validation: { required: true, minLength: 8 }, isDisplayField: true },
        { id: 'swiftBicOrRouting', label: 'SWIFT/BIC or Local Code', type: 'text', placeholder: 'Bank identifier code', validation: { required: true } },
    ]
};

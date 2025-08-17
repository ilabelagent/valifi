import React from 'react';
import { BtcIcon, EthIcon, UsdtIcon, SolanaIcon } from './icons';

export interface CryptoNetwork {
    address: string;
    validationRegex: RegExp;
    memoRequired?: boolean;
    memoName?: string;
}

export interface CryptoConfig {
    name: string;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
    networks: Record<string, CryptoNetwork>;
    priceUSD: number;
}

export const CRYPTO_CONFIG: Record<string, CryptoConfig> = {
    BTC: {
        name: 'Bitcoin',
        Icon: BtcIcon,
        priceUSD: 68000.00,
        networks: {
            Bitcoin: {
                address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
                validationRegex: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/,
            },
            Lightning: {
                address: 'lnbc1psenp8ypp5npscn9j02q8y8rc3zxyu3e0s4x2tnwl9n48gfet43f0gq8gq8gqsq',
                validationRegex: /^(lnbc)[a-z0-9]{20,}/,
            },
        },
    },
    ETH: {
        name: 'Ethereum',
        Icon: EthIcon,
        priceUSD: 3800.00,
        networks: {
            'ERC-20': {
                address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
                validationRegex: /^0x[a-fA-F0-9]{40}$/,
            },
            'Arbitrum': {
                address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
                validationRegex: /^0x[a-fA-F0-9]{40}$/,
            },
        },
    },
    USDT: {
        name: 'Tether',
        Icon: UsdtIcon,
        priceUSD: 1.00,
        networks: {
            'ERC-20': {
                address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
                validationRegex: /^0x[a-fA-F0-9]{40}$/,
            },
            'TRC-20': {
                address: 'TXPqB3M1o2d3M8c1q5y6R7Z8A9B0C1D2E3F4G5H6',
                validationRegex: /^T[A-Za-z1-9]{33}$/,
            },
        },
    },
    SOL: {
        name: 'Solana',
        Icon: SolanaIcon,
        priceUSD: 165.00,
        networks: {
            Solana: {
                address: 'So11111111111111111111111111111111111111112',
                validationRegex: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
            },
        },
    },
};

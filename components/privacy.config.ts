import { BtcIcon, EthIcon, UsdtIcon, SolanaIcon, CardanoIcon } from './icons';

export interface MixableAssetConfig {
    name: string;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
    networks: {
        [networkName: string]: {
            requiredConfirmations: number;
            addressPrefix: string;
        }
    };
}

export const MIXABLE_ASSETS: Record<string, MixableAssetConfig> = {
    BTC: {
        name: 'Bitcoin',
        Icon: BtcIcon,
        networks: {
            'Bitcoin': { requiredConfirmations: 3, addressPrefix: 'bc1q' },
            'Lightning': { requiredConfirmations: 1, addressPrefix: 'lnbc1' }
        }
    },
    ETH: {
        name: 'Ethereum',
        Icon: EthIcon,
        networks: {
            'Ethereum (ERC-20)': { requiredConfirmations: 12, addressPrefix: '0x' },
            'Arbitrum': { requiredConfirmations: 20, addressPrefix: '0x' },
            'Polygon': { requiredConfirmations: 128, addressPrefix: '0x' }
        }
    },
    USDT: {
        name: 'Tether',
        Icon: UsdtIcon,
        networks: {
            'Ethereum (ERC-20)': { requiredConfirmations: 12, addressPrefix: '0x' },
            'TRON (TRC-20)': { requiredConfirmations: 20, addressPrefix: 'T' },
            'Solana': { requiredConfirmations: 32, addressPrefix: 'So' }
        }
    },
    SOL: {
        name: 'Solana',
        Icon: SolanaIcon,
        networks: {
            'Solana': { requiredConfirmations: 32, addressPrefix: 'So' }
        }
    },
    ADA: {
        name: 'Cardano',
        Icon: CardanoIcon,
        networks: {
            'Cardano': { requiredConfirmations: 15, addressPrefix: 'addr1' }
        }
    },
};

export const generateDepositAddress = (prefix: string): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const length = 42 - prefix.length;
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix + result;
};

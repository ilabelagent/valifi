import React from 'react';

export const ValifiLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const DashboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

export const InvestmentsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

export const WalletIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 12V8H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12v4"></path>
    <path d="M4 6v12a2 2 0 0 0 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path>
  </svg>
);

export const BankIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 21h18M5 18v-8l7-4 7 4v8M18 9l-6 3.5L6 9"></path>
    <line x1="12" y1="21" x2="12" y2="15"></line>
  </svg>
);

export const PrivacyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

export const TaxIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

export const ReferralsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle>
    <circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
  </svg>
);

export const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

export const LogoutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

export const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

export const NotificationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export const BtcIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="12" r="10" fill="#F7931A"/>
    <path d="M14.5 15.5H15.5V17.5H14.5V15.5ZM14.5 6.5H15.5V8.5H14.5V6.5Z" fill="white"/>
    <path d="M10 15.5H12V17.5H10V15.5ZM10 6.5H12V8.5H10V6.5Z" fill="white"/>
    <path d="M8.5 8.5H10V10.5H8.5V8.5ZM8.5 13.5H10V15.5H8.5V13.5Z" fill="white"/>
    <path d="M12 13.5H14.5V15.5H12V13.5Z" fill="white"/>
    <path d="M12 8.5H14.5V10.5H12V8.5Z" fill="white"/>
    <path d="M10 10.5H12V13.5H10V10.5Z" fill="white"/>
  </svg>
);

export const EthIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="12" r="10" fill="#627EEA"/>
    <path d="M12 3L11.8594 3.52812L7.5 12.0906L12 15.1531L16.5 12.0906L12.1406 3.52812L12 3Z" fill="white" fillOpacity="0.6"/>
    <path d="M12 16.2219L7.5 13.1594L12 21L16.5 13.1594L12 16.2219Z" fill="white"/>
  </svg>
);

export const UsdIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="10" fill="#22C55E"/>
      <text x="12" y="16" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">$</text>
    </svg>
);

export const UsdtIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="10" fill="#26A17B"/>
      <path d="M8 8H16V10H13V16H11V10H8V8Z" fill="white"/>
    </svg>
);

export const UsdcIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="12" cy="12" r="10" fill="#3B82F6" />
        <path d="M12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6ZM12 16.5C9.51472 16.5 7.5 14.4853 7.5 12C7.5 9.51472 9.51472 7.5 12 7.5C14.4853 7.5 16.5 9.51472 16.5 12C16.5 14.4853 14.4853 16.5 12 16.5Z" fill="white" />
        <path d="M13.0714 10.9286C13.5 10.5 13.5 9.75 13.0714 9.32143C12.6429 8.89286 11.9286 8.85714 11.5 9.28571L9.75 11.0357C9.32143 11.4643 9.35714 12.1786 9.78571 12.6071C10.2143 13.0357 10.9286 13.0714 11.3571 12.6429L13.0714 10.9286Z" fill="white" />
    </svg>
);


export const AppleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="12" r="10" fill="#A3A3A3"/>
    <path d="M13.54 6.95C14.3338 6.93879 15.1189 7.21834 15.72 7.71C15.9686 7.91008 16.1786 8.14726 16.34 8.41C16.0357 8.59969 15.7481 8.81014 15.48 9.04C14.73 9.69 14.36 10.63 14.41 11.61C14.46 12.59 14.99 13.5 15.77 14.07C15.9392 14.2045 16.1215 14.3251 16.31 14.43C15.71 15.54 14.65 16.59 13.28 16.92C12.52 17.11 11.71 16.88 11.03 16.42C10.35 15.96 9.8 15.28 9.47 14.49C8.81 12.92 9.24 11.04 10.36 9.92C10.873 9.4063 11.5303 9.0413 12.24 8.88C11.5714 8.35852 11.1062 7.61435 10.93 6.78C11.7423 6.51206 12.631 6.58661 13.41 6.95H13.54ZM13.06 6.01C12.97 5.5 13.16 4.98 13.56 4.63C13.96 4.28 14.52 4.19 15.02 4.4C15.12 4.44 15.19 4.53 15.16 4.63C15.07 5.14 14.88 5.66 14.48 6.01C14.08 6.36 13.52 6.45 13.02 6.24C12.92 6.2 12.99 6.11 13.06 6.01Z" fill="white"/>
  </svg>
);

export const ArrowUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="19" x2="12" y2="5"></line>
    <polyline points="5 12 12 5 19 12"></polyline>
  </svg>
);

// Newly Added Icons
export const SolanaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="12" cy="12" r="10" fill="#9945FF" />
        <path d="M6.343 14.828h3.535l-3.535-3.535h3.535m3.758-3.758h-3.535l3.535 3.535h-3.535m-3.758 7.293h3.535l-3.535-3.535h3.535m3.758-3.758h-3.535l3.535 3.535h-3.535" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
export const CardanoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="12" cy="12" r="10" fill="#0033AD"/>
        <path d="M12 6.4L14.8 8.8L12 11.2L9.2 8.8L12 6.4Z" fill="#fff"/>
        <path d="M12 12.8L14.8 15.2L12 17.6L9.2 15.2L12 12.8Z" fill="#fff"/>
        <path d="M10.6 10.4L12 12L9.2 13.6L7.8 12L10.6 10.4Z" fill="#fff" fillOpacity="0.7"/>
        <path d="M13.4 10.4L14.8 12L12 13.6L10.6 12L13.4 10.4Z" fill="#fff" fillOpacity="0.7"/>
    </svg>
);
export const PolkadotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="12" cy="12" r="10" fill="#E6007A"/>
        <circle cx="12" cy="7" r="1.5" fill="white"/>
        <circle cx="16" cy="9" r="1.5" fill="white"/>
        <circle cx="16" cy="15" r="1.5" fill="white"/>
        <circle cx="12" cy="17" r="1.5" fill="white"/>
        <circle cx="8" cy="15" r="1.5" fill="white"/>
        <circle cx="8" cy="9" r="1.5" fill="white"/>
    </svg>
);
export const ChainlinkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="12" cy="12" r="10" fill="#375BD2"/>
        <path d="M8 12L11 9L14 12L11 15L8 12Z" stroke="white" strokeWidth="1.5"/>
        <path d="M11 9L14 6" stroke="white" strokeWidth="1.5"/>
        <path d="M11 15L14 18" stroke="white" strokeWidth="1.5"/>
        <path d="M14 12L17 9" stroke="white" strokeWidth="1.5"/>
    </svg>
);
export const AvalancheIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="12" cy="12" r="10" fill="#E84142"/>
        <path d="M12 6L7 17H9.5L12 11.5L14.5 17H17L12 6Z" fill="white"/>
    </svg>
);
const PlaceholderBrandIcon: React.FC<React.SVGProps<SVGSVGElement> & {char: string, color: string}> = ({char, color, ...props}) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="10" fill={color}/>
      <text x="12" y="16" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">{char}</text>
    </svg>
);
export const NvidiaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="N" color="#76B900" {...props} />;
export const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="G" color="#4285F4" {...props} />;
export const AmazonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="A" color="#FF9900" {...props} />;
export const TeslaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="T" color="#CC0000" {...props} />;
export const MicrosoftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="M" color="#00A4EF" {...props} />;
export const MetaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="M" color="#1877F2" {...props} />;
export const AmdIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="A" color="#ED1C24" {...props} />;
export const JpmorganIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="JPM" color="#5B92E5" {...props} />;
export const VisaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="V" color="#1A1F71" {...props} />;
export const NetflixIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="N" color="#E50914" {...props} />;
export const XomIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="XOM" color="#C90028" {...props} />;
export const JnjIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="JNJ" color="#D4002A" {...props} />;
export const PgIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="PG" color="#00579D" {...props} />;
export const UnhIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="UNH" color="#005A9C" {...props} />;
export const HdIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="HD" color="#F96302" {...props} />;
export const MaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="MA" color="#FF5F00" {...props} />;
export const BacIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="BAC" color="#006398" {...props} />;
export const CostIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="COST" color="#E31837" {...props} />;
export const CvxIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="CVX" color="#00AEEF" {...props} />;
export const LlyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="LLY" color="#006A4D" {...props} />;
export const AvgoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="AVGO" color="#CF0000" {...props} />;
export const PepIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="PEP" color="#004B87" {...props} />;
export const KoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="KO" color="#F40009" {...props} />;
export const WmtIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="WMT" color="#0071CE" {...props} />;
export const CrmIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="CRM" color="#00A1E0" {...props} />;
export const DisIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="DIS" color="#1A2464" {...props} />;
export const BaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlaceholderBrandIcon char="BA" color="#0039A6" {...props} />;


export const PlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
export const PauseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>;
export const ExchangeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>; // Same as InvestmentsIcon as it's a good fit
export const P2PIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
export const UserCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>;
export const InternalTransferIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 3h5v5"></path><path d="M4 20L21 3"></path><path d="M21 16v5h-5"></path><path d="M3 4l18 18"></path></svg>;
export const CardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
export const LoanIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 10h18M7 15h1m4 0h1m-7-5h1m4 0h1m-7-5h1m4 0h1M3 21h18M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7M5 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5"></path></svg>;
export const NftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>; // Re-using logo for NFT
export const PlusCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
export const GlobeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
export const PaletteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="3"></circle><path d="M12 9.5c-3.86 0-7 2.69-7 6s3.14 6 7 6 7-2.69 7-6-3.14-6-7-6zm-5.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"></path><path d="M12 2a10 10 0 0 0-9.4 6.3"></path><path d="M17.5 4.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"></path></svg>;
export const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
export const ChevronsLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>;
export const ChevronsRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>;
export const CodeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>;
export const ArrowDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>;
export const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
export const ArrowUpRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>;
export const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
export const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
export const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
export const LockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
export const RefreshIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;
export const SwapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
export const NewspaperIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4M4 10h16M4 16h16"></path></svg>;
export const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
export const BnbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><circle cx="12" cy="12" r="10" fill="#F0B90B"/><path d="m12 3.2 4.4 4.4L12 12l-4.4-4.4L12 3.2zM7.6 7.6 3.2 12l4.4 4.4 4.4-4.4-4.4-4.4zm8.8 0L12 12l4.4 4.4 4.4-4.4-4.4-4.4zm-4.4 4.4L7.6 16.4 12 20.8l4.4-4.4-4.4-4.4z" fill="#fff"/></svg>;
export const MaticIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><circle cx="12" cy="12" r="10" fill="#8247E5"/><path d="M12 5.5 15.3 9l-3.3 3.5-3.3-3.5L12 5.5zM8 10.5l4 4.5 4-4.5-1.5-1.8-2.5 2.5-2.5-2.5L8 10.5z" fill="#fff"/></svg>;
export const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
export const AlertTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
export const ShieldCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>;
export const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
export const MoreHorizontalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>;
export const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
export const MinusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
export const StarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;

// --- NEWLY ADDED ICONS TO FIX ERRORS ---

export const ArrowUpDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M8 3v18l-3-3m11-12v18l3-3"/></svg>;
export const TrendingUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;
export const PieChartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>;
export const FilterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;
export const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
export const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
export const TwitterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
export const WhatsAppIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.38 1.25 4.85L2 22l5.34-1.38c1.41.74 2.96 1.18 4.57 1.18h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2m.01 1.64c4.56 0 8.27 3.71 8.27 8.27 0 4.56-3.71 8.27-8.27 8.27-1.52 0-2.96-.42-4.22-1.16l-.3-.18-3.12.81.83-3.04-.2-.32a8.23 8.23 0 0 1-1.26-4.38c0-4.56 3.71-8.27 8.27-8.27m4.53 10.2c-.25-.13-1.47-.72-1.7-.81-.23-.09-.39-.13-.56.13-.17.25-.64.81-.79.97-.15.17-.29.19-.54.06-.25-.13-1.06-.39-2-1.23-.73-.66-1.22-1.47-1.36-1.72-.14-.25-.02-.38.12-.51.12-.11.25-.29.38-.43.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.42-.55-.42h-.5c-.15 0-.39.04-.59.25-.2.2-.76.75-.76 1.84 0 1.1.78 2.13.88 2.28.11.14 1.54 2.34 3.74 3.29.53.23.94.36 1.27.46.54.16 1.03.14 1.42.09.43-.06 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.3"/></svg>;
export const TelegramIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="m9.417 15.181-.397 5.584c.568 0 .814-.244 1.109-.537l2.663-2.545 5.518 4.041c1.012.564 1.725.267 1.998-.931L22.83 3.446c.346-1.616-.698-2.296-1.597-1.913L2.215 10.332c-1.613.642-1.603 1.587-.282 1.956L8.6 13.682l10.286-6.435c.959-.603.435-.912-.346-.388z"/></svg>;
export const ShuffleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>;
export const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2L14.39 8.61L21 11L14.39 13.39L12 20L9.61 13.39L3 11L9.61 8.61L12 2z"/></svg>;
export const KeyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
export const ReceiveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
export const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
export const WalletConnectIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M5.62 14.38a.62.62 0 0 0-.44 1.06l1.38 1.38c.24.24.64.24.88 0l.88-.88a.62.62 0 0 0-.88-.88l-.44.44-1.38-1.38a.62.62 0 0 0-.44-.14zM8.38 9.5a.62.62 0 0 0 0 .88l2.63 2.62a.62.62 0 0 0 .88 0l2.62-2.62a.62.62 0 0 0 0-.88L12 6.88l-3.62 2.62zM24 11.38v.12c0 1.25-.25 2.5-.75 3.63-1 2.37-3 4.25-5.5 5.25-2.25.88-4.75 1.13-7.25.63-2.62-.5-5-1.88-6.62-3.87a11.16 11.16 0 0 1-3-7.5C.88 6.25 3.38 2.88 7.25 1.25a11.84 11.84 0 0 1 8.25-.5c3.25 1 6 3.62 7 7a12.43 12.43 0 0 1 .5 3.63zm-2.25.12c0-2.87-1.75-5.5-4.38-6.75A9.69 9.69 0 0 0 9.5 4a8.88 8.88 0 0 0-6.12 2.5 8.94 8.94 0 0 0-2 6.38c.12 2.37 1.25 4.62 3.12 6.12a8.8 8.8 0 0 0 6.63 2.5c2.25 0 4.5-.75 6.25-2.37 2-1.75 3.12-4.25 3-7.13z"/></svg>;
export const MetamaskIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M21.43 4.31 18.2 2.03c-.6-.4-1.35-.4-1.96 0l-3.23 2.28-3.23-2.28c-.6-.4-1.35-.4-1.96 0L2.57 6.6c-.3.2-.5.5-.5.85v8.2c0 .35.2.65.5.85l3.23 2.28c.3.2.65.3.98.3s.68-.1.98-.3l3.23-2.28 3.23 2.28c.3.2.65.3.98.3s.68-.1.98-.3l3.23-2.28c.3-.2.5-.5.5-.85V5.16c0-.35-.2-.65-.5-.85z" fill="#E2761B"/><path d="m15.82 5.56-4.25 2.97c-.6.4-1.35.4-1.96 0L5.36 5.56 3.07 7.2v6.23l4.25-2.97c.6-.4 1.35-.4 1.96 0l4.25 2.97V7.2z" fill="#E4761B"/><path d="M20.93 7.2v6.23l-4.25-2.97c-.6-.4-1.35-.4-1.96 0L10.47 13.4V7.2z" fill="#D7C1B3"/><path d="m15.82 5.56-4.25 2.97c-.6.4-1.35.4-1.96 0L5.36 5.56 8.59 3.28c.6-.4 1.35-.4 1.96 0z" fill="#233447"/><path d="m20.93 7.2-1.7-1.18 1.18-1.48L18.2 2.03c-.6-.4-1.35-.4-1.96 0l-1.48 1.04-1.18-.83-1.48 1.04-3.23-2.28c-.6-.4-1.35-.4-1.96 0L3.07 4.54l1.18 1.48-1.7 1.18 2.29-1.63L8.07 8l-2.7 1.88v.85l3.1-2.16 1.7 1.18-1.7 1.18 4.25 2.97c.6.4 1.35.4 1.96 0l4.25-2.97-1.7-1.18 1.7-1.18 3.1 2.16v-.85L15.82 8l3.23-2.23z" fill="#F6851B"/></svg>;
export const CoinbaseWalletIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v4h-2zm0 6h2v2h-2z" fill="#2C5FF6"/></svg>;
export const TrustWalletIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="#3375BB"/></svg>;
export const StakingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>;
export const MessageCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>;
export const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
export const IrisIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="3"/><path d="M21.6 12A10 10 0 014.3 16.8M2.4 12A10 10 0 0119.7 7.2"/></svg>;
export const UploadCloudIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/><polyline points="16 16 12 12 8 16"/></svg>;
export const PayPalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M8.32 21.18c-1.39 0-2.52-1.13-2.52-2.52s1.13-2.52 2.52-2.52h5.05c1.39 0 2.52 1.13 2.52 2.52s-1.13 2.52-2.52 2.52zm.45-6.17c-1.39 0-2.52-1.13-2.52-2.52s1.13-2.52 2.52-2.52h4.18c1.39 0 2.52 1.13 2.52 2.52s-1.13 2.52-2.52 2.52zm.91-6.17c-1.39 0-2.52-1.13-2.52-2.52s1.13-2.52 2.52-2.52h3.31c1.39 0 2.52 1.13 2.52 2.52s-1.13 2.52-2.52 2.52z" fill="#003087"/><path d="m11.83 2.82c-1.39 0-2.52 1.13-2.52 2.52s1.13 2.52 2.52 2.52h.91c1.39 0 2.52 1.13 2.52 2.52s-1.13 2.52-2.52 2.52h-2.27c-1.39 0-2.52 1.13-2.52 2.52s1.13 2.52 2.52 2.52h2.27c1.39 0 2.52 1.13 2.52 2.52s-1.13 2.52-2.52 2.52H6.1c-1.39 0-2.52-1.13-2.52-2.52S4.71 16 6.1 16h3.63c1.39 0 2.52-1.13 2.52-2.52s-1.13-2.52-2.52-2.52H7.95c-1.39 0-2.52-1.13-2.52-2.52s1.13-2.52 2.52-2.52h3.88z" fill="#009CDE"/></svg>;
export const WiseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3.75 5.25L9 9.75l-1.5 4.5 4.5-3 4.5 3-1.5-4.5 5.25-4.5H3.75z"/><path d="M9 16.5V21l3-3 3 3v-4.5"/></svg>;
export const CashAppIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/><path d="M12 10.5v3m1.5-1.5h-3"/></svg>;
export const SkrillIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 12.5H8.5V9.5h7v3z"/></svg>;
export const RevolutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 3h6v6h-6zM3 15h6v6H3zm12-3a3 3 0 100-6 3 3 0 000 6zM3 3h6v6H3zM15 15h6v6h-6z"/></svg>;
export const UPIIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 10v4a2 2 0 002 2h8a2 2 0 002-2v-4M8 2v4m4-4v4m4-4v4M6 18h12"/></svg>;
export const MobileMoneyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/><path d="M12 14v-4m-2 2h4"/></svg>;
export const InteracIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17.5 17.5L22 13l-4.5-4.5M6.5 6.5L2 11l4.5 4.5M11 2l-4.5 4.5L11 11m2 2l4.5 4.5L13 13"/></svg>;
export const PIXIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 3L21 9.5l-6.5 6.5H3L9.5 3h5zM3 21l6.5-6.5m2 0L21 21"/></svg>;
export const DefaultPaymentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
export const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
export const EyeOffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
export const ApplePayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 64 24" fill="currentColor" {...props}><path d="M14.5 6.5h-1.8l-3 11h2l.7-2.5h2.9l.4 2.5h2zm-2.5 7L13.2 9h.1l1.2 4.5zM22.2 6.5c-1.8 0-3.3 1.3-3.3 3.4v4.6c0 2.1 1.5 3.4 3.3 3.4s3.3-1.3 3.3-3.4v-1.2h-2v1.2c0 1.1-.7 1.7-1.3 1.7s-1.3-.6-1.3-1.7v-4.6c0-1.1.7-1.7 1.3-1.7s1.3.6 1.3 1.7V9h2V9c0-2.1-1.5-3.4-3.3-3.4zm9.3 0c-1.8 0-3.3 1.3-3.3 3.4v4.6c0 2.1 1.5 3.4 3.3 3.4s3.3-1.3 3.3-3.4v-1.2h-2v1.2c0 1.1-.7 1.7-1.3 1.7s-1.3-.6-1.3-1.7v-4.6c0-1.1.7-1.7 1.3-1.7s1.3.6 1.3 1.7V9h2V9c0-2.1-1.5-3.4-3.3-3.4zM42.2 6.5h-3.8v11h2V8.2h1.8v-1.7z"/><path d="M6 6.8c-1.4 0-2.5 1-2.5 2.5s1.1 2.5 2.5 2.5c1.4 0 2.5-1 2.5-2.5S7.4 6.8 6 6.8zm0-1.7c2.3 0 4.2 1.8 4.2 4.2s-1.9 4.2-4.2 4.2-4.2-1.9-4.2-4.2S3.7 5.1 6 5.1z"/><path d="M6 13c-2.4 0-4.4 2-4.4 4.4s2 4.4 4.4 4.4 4.4-2 4.4-4.4-2-4.4-4.4-4.4zm0 7.1c-1.5 0-2.7-1.2-2.7-2.7s1.2-2.7 2.7-2.7 2.7 1.2 2.7 2.7-1.2 2.7-2.7 2.7z"/></svg>;
export const GooglePayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 64 24" fill="currentColor" {...props}><path d="M12.3 8.1c0-.5-.4-1-1-1s-1 .5-1 1v7.8c0 .5.4 1 1 1s1-.5 1-1zm-3.1 2.9c0-.5-.4-1-1-1s-1 .5-1 1v2c0 .5.4 1 1 1s1-.5 1-1zm6.2 0c0-.5-.4-1-1-1s-1 .5-1 1v2c0 .5.4 1 1 1s1-.5 1-1zM21.1 6h-7.2c-1.7 0-3 1.3-3 3v6c0 1.7 1.3 3 3 3h7.2c1.7 0 3-1.3 3-3V9c0-1.7-1.3-3-3-3zm-1.1 7.2h-1.7v1.7c0 .5-.4 1-1 1s-1-.4-1-1v-1.7h-1.7c-.5 0-1-.4-1-1s.4-1 1-1h1.7V9.5c0-.5.4-1 1-1s1 .4 1 1v1.7h1.7c.5 0 1 .4 1 1s-.4 1-1 1zM34.8 6.5c-1.7 0-3 1.1-3.3 2.6h2c.2-.7.8-1.2 1.4-1.2.9 0 1.5.7 1.5 1.6V12h-3.3v-1.7h1.5V9.4H33V12h1.8v1.4h-1.8v1.7c0 1.2 1 2 2.1 2 1 0 1.7-.6 1.9-1.3h1.9c-.3 1.7-1.8 3-3.9 3-2.5 0-4.4-1.8-4.4-4.4v-1c0-2.6 1.9-4.5 4.4-4.5zM45.6 6.5c-2.5 0-4.4 1.8-4.4 4.4v1c0 2.6 1.9 4.5 4.4 4.5 1.7 0 3-1.1 3.3-2.6h-2c-.2.7-.8 1.2-1.4 1.2-.9 0-1.5-.7-1.5-1.6V12h3.3v1.7h-1.5v.9h1.8V12h-1.8V9.4h1.8V7.9h-3.3c0-1.2-1-2-2.1-2-1 0-1.7.6-1.9 1.3h-1.9c.3-1.7 1.8-3 3.9-3z"/><path d="M51.2 12.3c0-2.3 1.6-4.1 3.9-4.1s3.9 1.8 3.9 4.1-1.6 4.1-3.9 4.1-3.9-1.8-3.9-4.1zm5.9 0c0-1.3-.9-2.3-2-2.3s-2 .9-2 2.3.9 2.3 2 2.3 2-.9 2-2.3z"/></svg>;
export const DeviceMobileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
export const TwoFactorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>;
export const CameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
export const PaperclipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>;
export const ChatBubbleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>;
export const GavelIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 12.5l-10 10m5-5l10-10m-5 5l-2.5 2.5"/><path d="M3 21l3-3m12-12l3-3"/></svg>;
export const LocationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
export const LightbulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 18h6m-3-3v3m-4.9-6.9A7 7 0 0 1 12 4a7 7 0 0 1 4.9 11.1L12 22z"/></svg>;
export const InstagramIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
export const LinkedInIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>;
export const ForbesLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 64 24" {...props}><text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="14" fill="currentColor" fontWeight="bold">Forbes</text></svg>;
export const TechCrunchLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 96 24" {...props}><text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="14" fill="currentColor" fontWeight="bold">TechCrunch</text></svg>;
export const BloombergLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 96 24" {...props}><text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="14" fill="currentColor" fontWeight="bold">Bloomberg</text></svg>;
export const BriefcaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
export const DocumentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
export const ApiIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M10 16l-4-4 4-4"/><path d="M14 8l4 4-4 4"/></svg>;
export const HistoryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/><path d="M22 4L12 14.01 9 11.01"/></svg>;
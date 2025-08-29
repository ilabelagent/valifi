// Main Bot Interface Component
// Integrates Suggestions and Panels for interactive bot experience

import React, { useState, useEffect } from 'react';
import Suggestions, { Suggestion, SuggestionCategory } from './Suggestions';
import Panels, { Panel, PanelAction } from './Panels';

interface BotInterfaceProps {
  botId: string;
  botName?: string;
  onCommand?: (command: string, data?: any) => void;
}

export const BotInterface: React.FC<BotInterfaceProps> = ({
  botId,
  botName = 'Valifi Bot',
  onCommand,
}) => {
  const [panels, setPanels] = useState<Panel[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Suggestion categories for the bot
  const suggestionCategories: SuggestionCategory[] = [
    {
      id: 'trading',
      name: 'Trading',
      icon: '📈',
      suggestions: [
        { id: 'buy-btc', text: 'Buy Bitcoin', icon: '₿', action: 'trade', data: { type: 'buy', asset: 'BTC' } },
        { id: 'sell-eth', text: 'Sell Ethereum', icon: 'Ξ', action: 'trade', data: { type: 'sell', asset: 'ETH' } },
        { id: 'market-overview', text: 'Market Overview', icon: '📊', action: 'view', data: { screen: 'market' } },
        { id: 'price-alerts', text: 'Set Price Alert', icon: '🔔', action: 'alert', data: { type: 'price' } },
        { id: 'portfolio', text: 'View Portfolio', icon: '💼', action: 'view', data: { screen: 'portfolio' } },
        { id: 'top-gainers', text: 'Top Gainers', icon: '🚀', action: 'view', data: { screen: 'gainers' } },
      ],
    },
    {
      id: 'defi',
      name: 'DeFi',
      icon: '🔗',
      suggestions: [
        { id: 'stake', text: 'Stake Tokens', icon: '🔒', action: 'defi', data: { type: 'stake' } },
        { id: 'liquidity', text: 'Add Liquidity', icon: '💧', action: 'defi', data: { type: 'liquidity' } },
        { id: 'farming', text: 'Yield Farming', icon: '🌾', action: 'defi', data: { type: 'farming' } },
        { id: 'swap', text: 'Swap Tokens', icon: '🔄', action: 'defi', data: { type: 'swap' } },
      ],
    },
    {
      id: 'account',
      name: 'Account',
      icon: '👤',
      suggestions: [
        { id: 'deposit', text: 'Deposit Funds', icon: '⬇️', action: 'account', data: { type: 'deposit' } },
        { id: 'withdraw', text: 'Withdraw', icon: '⬆️', action: 'account', data: { type: 'withdraw' } },
        { id: 'history', text: 'Transaction History', icon: '📜', action: 'view', data: { screen: 'history' } },
        { id: 'settings', text: 'Settings', icon: '⚙️', action: 'view', data: { screen: 'settings' } },
      ],
    },
    {
      id: 'bots',
      name: 'Trading Bots',
      icon: '🤖',
      suggestions: [
        { id: 'create-bot', text: 'Create Bot', icon: '➕', action: 'bot', data: { type: 'create' } },
        { id: 'bot-stats', text: 'Bot Performance', icon: '📈', action: 'view', data: { screen: 'bot-stats' } },
        { id: 'stop-bots', text: 'Stop All Bots', icon: '⏹️', action: 'bot', data: { type: 'stop-all' } },
        { id: 'backtest', text: 'Backtest Strategy', icon: '⏪', action: 'bot', data: { type: 'backtest' } },
      ],
    },
  ];

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: Suggestion) => {
    setMessages(prev => [...prev, `You selected: ${suggestion.text}`]);
    
    // Create panel based on suggestion
    let newPanel: Panel | null = null;

    switch (suggestion.action) {
      case 'trade':
        newPanel = createTradePanel(suggestion.data);
        break;
      case 'view':
        newPanel = createViewPanel(suggestion.data);
        break;
      case 'defi':
        newPanel = createDeFiPanel(suggestion.data);
        break;
      case 'bot':
        newPanel = createBotPanel(suggestion.data);
        break;
      case 'account':
        newPanel = createAccountPanel(suggestion.data);
        break;
    }

    if (newPanel) {
      setPanels(prev => [...prev, newPanel]);
    }

    if (onCommand) {
      onCommand(suggestion.action, suggestion.data);
    }
  };

  // Create different types of panels
  const createTradePanel = (data: any): Panel => {
    return {
      id: `trade-${Date.now()}`,
      title: `${data.type === 'buy' ? 'Buy' : 'Sell'} ${data.asset}`,
      icon: data.type === 'buy' ? '🛒' : '💰',
      type: 'form',
      content: [
        { label: 'Amount', type: 'number', placeholder: '0.00' },
        { label: 'Price', type: 'number', placeholder: 'Market Price' },
        { label: 'Total', type: 'number', placeholder: '0.00', disabled: true },
      ],
      expandable: true,
      closable: true,
      actions: [
        {
          id: 'execute',
          label: data.type === 'buy' ? 'Buy Now' : 'Sell Now',
          icon: '✓',
          variant: 'primary',
          onClick: () => console.log(`Executing ${data.type} order`),
        },
        {
          id: 'cancel',
          label: 'Cancel',
          variant: 'secondary',
          onClick: () => console.log('Order cancelled'),
        },
      ],
    };
  };

  const createViewPanel = (data: any): Panel => {
    const panelConfig: Record<string, Panel> = {
      portfolio: {
        id: `portfolio-${Date.now()}`,
        title: 'Portfolio Overview',
        icon: '💼',
        type: 'stats',
        content: {
          'Total Value': '$10,234.56',
          'Today\'s P&L': '+$234.56',
          'Holdings': '12',
          'Active Trades': '3',
        },
        expandable: true,
        closable: true,
      },
      market: {
        id: `market-${Date.now()}`,
        title: 'Market Overview',
        icon: '📊',
        type: 'chart',
        content: {
          labels: ['BTC', 'ETH', 'SOL', 'ADA'],
          values: [50000, 3500, 150, 1.2],
        },
        expandable: false,
        closable: true,
      },
      gainers: {
        id: `gainers-${Date.now()}`,
        title: 'Top Gainers Today',
        icon: '🚀',
        type: 'list',
        content: [
          '🟢 DOGE +15.3%',
          '🟢 SHIB +12.1%',
          '🟢 MATIC +9.8%',
          '🟢 LINK +7.2%',
          '🟢 UNI +6.5%',
        ],
        expandable: false,
        closable: true,
      },
      history: {
        id: `history-${Date.now()}`,
        title: 'Transaction History',
        icon: '📜',
        type: 'list',
        content: [
          'Buy 0.1 BTC @ $50,000 - 2 hours ago',
          'Sell 2 ETH @ $3,600 - 5 hours ago',
          'Stake 100 SOL - 1 day ago',
          'Swap 500 USDT to USDC - 2 days ago',
        ],
        expandable: true,
        closable: true,
      },
    };

    return panelConfig[data.screen] || panelConfig.portfolio;
  };

  const createDeFiPanel = (data: any): Panel => {
    const panelConfig: Record<string, Panel> = {
      stake: {
        id: `stake-${Date.now()}`,
        title: 'Stake Tokens',
        icon: '🔒',
        type: 'form',
        content: [
          { label: 'Token', type: 'select', placeholder: 'Select token' },
          { label: 'Amount', type: 'number', placeholder: '0.00' },
          { label: 'Duration', type: 'select', placeholder: '30 days' },
          { label: 'Est. APY', type: 'text', value: '12.5%', disabled: true },
        ],
        expandable: false,
        closable: true,
        actions: [
          {
            id: 'stake',
            label: 'Stake Now',
            icon: '🔒',
            variant: 'primary',
            onClick: () => console.log('Staking tokens'),
          },
        ],
      },
      swap: {
        id: `swap-${Date.now()}`,
        title: 'Swap Tokens',
        icon: '🔄',
        type: 'form',
        content: [
          { label: 'From', type: 'select', placeholder: 'Select token' },
          { label: 'Amount', type: 'number', placeholder: '0.00' },
          { label: 'To', type: 'select', placeholder: 'Select token' },
          { label: 'You Receive', type: 'number', placeholder: '0.00', disabled: true },
        ],
        expandable: false,
        closable: true,
        actions: [
          {
            id: 'swap',
            label: 'Swap',
            icon: '🔄',
            variant: 'primary',
            onClick: () => console.log('Swapping tokens'),
          },
        ],
      },
    };

    return panelConfig[data.type] || panelConfig.stake;
  };

  const createBotPanel = (data: any): Panel => {
    return {
      id: `bot-${Date.now()}`,
      title: 'Bot Configuration',
      icon: '🤖',
      type: 'form',
      content: [
        { label: 'Bot Name', type: 'text', placeholder: 'My Trading Bot' },
        { label: 'Strategy', type: 'select', placeholder: 'Select strategy' },
        { label: 'Investment', type: 'number', placeholder: '1000' },
        { label: 'Risk Level', type: 'select', placeholder: 'Medium' },
      ],
      expandable: true,
      closable: true,
      actions: [
        {
          id: 'create',
          label: 'Create Bot',
          icon: '➕',
          variant: 'primary',
          onClick: () => console.log('Creating bot'),
        },
      ],
    };
  };

  const createAccountPanel = (data: any): Panel => {
    return {
      id: `account-${Date.now()}`,
      title: data.type === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds',
      icon: data.type === 'deposit' ? '⬇️' : '⬆️',
      type: 'form',
      content: [
        { label: 'Currency', type: 'select', placeholder: 'Select currency' },
        { label: 'Amount', type: 'number', placeholder: '0.00' },
        { label: 'Method', type: 'select', placeholder: 'Bank Transfer' },
      ],
      expandable: false,
      closable: true,
      actions: [
        {
          id: 'confirm',
          label: data.type === 'deposit' ? 'Deposit' : 'Withdraw',
          variant: 'primary',
          onClick: () => console.log(`Processing ${data.type}`),
        },
      ],
    };
  };

  // Handle panel close
  const handlePanelClose = (panelId: string) => {
    setPanels(prev => prev.filter(p => p.id !== panelId));
    setMessages(prev => [...prev, `Panel closed: ${panelId}`]);
  };

  // Handle message send
  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages(prev => [...prev, `You: ${inputValue}`]);
      setIsTyping(true);
      
      // Simulate bot response
      setTimeout(() => {
        setMessages(prev => [...prev, `Bot: I received your message: "${inputValue}"`]);
        setIsTyping(false);
      }, 1000);

      if (onCommand) {
        onCommand('message', { text: inputValue });
      }

      setInputValue('');
    }
  };

  return (
    <div className="bot-interface">
      <style jsx>{`
        .bot-interface {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }

        .bot-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px;
          border-radius: 16px;
          margin-bottom: 24px;
          text-align: center;
        }

        .bot-title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .bot-subtitle {
          font-size: 16px;
          opacity: 0.9;
        }

        .chat-container {
          background: white;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          min-height: 200px;
          max-height: 400px;
          overflow-y: auto;
        }

        .message {
          padding: 8px 0;
          color: #333;
        }

        .typing-indicator {
          color: #999;
          font-style: italic;
        }

        .input-container {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .message-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          font-size: 16px;
          transition: border-color 0.3s ease;
        }

        .message-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .send-button {
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .send-button:hover {
          transform: translateY(-2px);
        }

        .send-button:active {
          transform: translateY(0);
        }
      `}</style>

      <div className="bot-header">
        <div className="bot-title">🤖 {botName}</div>
        <div className="bot-subtitle">Your AI-Powered Financial Assistant</div>
      </div>

      <div className="chat-container">
        {messages.map((message, index) => (
          <div key={index} className="message">{message}</div>
        ))}
        {isTyping && <div className="typing-indicator">Bot is typing...</div>}
      </div>

      <div className="input-container">
        <input
          type="text"
          className="message-input"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button className="send-button" onClick={handleSendMessage}>
          Send
        </button>
      </div>

      <Suggestions
        categories={suggestionCategories}
        onSelect={handleSuggestionSelect}
        showCategories={true}
        maxVisible={6}
      />

      <Panels
        panels={panels}
        onClose={handlePanelClose}
        layout="grid"
      />
    </div>
  );
};

export default BotInterface;
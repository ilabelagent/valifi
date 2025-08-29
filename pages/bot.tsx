// Bot Page - Interactive Bot Interface
import React from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Dynamically import to avoid SSR issues with styled-jsx
const BotInterface = dynamic(
  () => import('../components/bot/BotInterface'),
  { ssr: false }
);

const BotPage: React.FC = () => {
  const handleBotCommand = (command: string, data?: any) => {
    console.log('Bot Command:', command, data);
    
    // Handle different commands
    switch (command) {
      case 'trade':
        // Handle trading commands
        console.log('Processing trade:', data);
        break;
      case 'view':
        // Handle view commands
        console.log('Showing view:', data);
        break;
      case 'defi':
        // Handle DeFi commands
        console.log('Processing DeFi action:', data);
        break;
      case 'bot':
        // Handle bot commands
        console.log('Bot action:', data);
        break;
      case 'account':
        // Handle account commands
        console.log('Account action:', data);
        break;
      case 'message':
        // Handle direct messages
        console.log('Message received:', data);
        break;
      default:
        console.log('Unknown command:', command);
    }
  };

  return (
    <>
      <Head>
        <title>Valifi Bot - AI Financial Assistant</title>
        <meta name="description" content="Interact with your AI-powered financial assistant" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
      }}>
        <BotInterface
          botId="valifi-bot-1"
          botName="Valifi AI Assistant"
          onCommand={handleBotCommand}
        />
      </div>
    </>
  );
};

export default BotPage;
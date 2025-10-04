# 🤖 STANDALONE BOT EXECUTION GUIDE

**Status**: ✅ ALL BOTS CAN RUN INDEPENDENTLY  
**Date**: October 4, 2025

---

## 🎯 OVERVIEW

All 60+ bots in the Kingdom Standard Orchestrator can be executed:
1. **Through the Orchestrator** (Unified API)
2. **Standalone/Independently** (Direct instantiation)

---

## 🔧 STANDALONE EXECUTION METHODS

### **Method 1: Direct Bot Instantiation**

```javascript
// Import the bot
const SmartContractBot = require('./bots/smart-contract-bot/SmartContractBot');
const KingdomCore = require('./lib/core/KingdomCore');

// Create core services
const core = new KingdomCore();

// Instantiate bot
const bot = new SmartContractBot(core);

// Initialize
await bot.initialize();

// Execute action
const result = await bot.execute({
  action: 'deploy',
  contractName: 'MyToken',
  abi: [...],
  bytecode: '0x...',
  constructorArgs: ['Token', 'TKN']
});

console.log(result);
```

### **Method 2: Standalone Script**

```javascript
// standalone-smart-contract.js
const { ethers } = require('ethers');

async function deployContract() {
  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
  const wallet = new ethers.Wallet(process.env.ETH_PRIVATE_KEY, provider);
  
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy(...constructorArgs);
  await contract.waitForDeployment();
  
  console.log('Contract deployed:', await contract.getAddress());
}

deployContract();
```

### **Method 3: CLI Execution**

```bash
# Run bot directly via Node.js
node -e "
const Bot = require('./bots/smart-contract-bot/SmartContractBot');
const core = require('./lib/core/KingdomCore');
const bot = new Bot(new core());
bot.initialize().then(() => {
  bot.execute({ action: 'gas_price' }).then(console.log);
});
"
```

---

## 📋 STANDALONE BOT EXAMPLES

### **1. Web3 Bot - Standalone**

```javascript
// standalone-web3.js
const Web3Bot = require('./bots/web3-bot/Web3Bot');
const KingdomCore = require('./lib/core/KingdomCore');

async function main() {
  const core = new KingdomCore();
  const web3Bot = new Web3Bot(core);
  
  await web3Bot.initialize();
  
  // Check balance
  const balance = await web3Bot.execute({
    action: 'get_balance',
    network: 'ethereum',
    address: '0xYourAddress'
  });
  
  console.log('Balance:', balance);
  
  // Send transaction
  const tx = await web3Bot.execute({
    action: 'send_transaction',
    network: 'polygon',
    to: '0xRecipient',
    value: '0.1'
  });
  
  console.log('Transaction:', tx);
}

main();
```

### **2. NFT Minting Bot - Standalone**

```javascript
// standalone-nft.js
const NFTMintingBot = require('./bots/nft-minting-bot/NFTMintingBot');
const KingdomCore = require('./lib/core/KingdomCore');

async function mintNFT() {
  const core = new KingdomCore();
  const nftBot = new NFTMintingBot(core);
  
  await nftBot.initialize();
  
  const result = await nftBot.execute({
    action: 'mint',
    collectionAddress: '0xYourCollection',
    recipientAddress: '0xRecipient',
    tokenURI: 'ipfs://QmYourMetadata'
  });
  
  console.log('NFT Minted:', result);
}

mintNFT();
```

### **3. Divine Oracle Bot - Standalone**

```javascript
// standalone-oracle.js
const DivineOracleBot = require('./bots/divine-oracle-bot/DivineOracleBot');
const KingdomCore = require('./lib/core/KingdomCore');

async function getPrediction() {
  const core = new KingdomCore();
  const oracle = new DivineOracleBot(core);
  
  await oracle.initialize();
  
  const prediction = await oracle.execute({
    action: 'predict',
    asset: 'bitcoin',
    type: 'crypto'
  });
  
  console.log('Prediction:', prediction);
}

getPrediction();
```

### **4. Guardian Angel Bot - Standalone**

```javascript
// standalone-security.js
const GuardianAngelBot = require('./bots/guardian-angel-bot/GuardianAngelBot');
const KingdomCore = require('./lib/core/KingdomCore');

async function analyzeTransaction() {
  const core = new KingdomCore();
  const guardian = new GuardianAngelBot(core);
  
  await guardian.initialize();
  
  const analysis = await guardian.execute({
    action: 'analyze',
    userId: 1,
    transaction: {
      amount: 10000,
      location: 'Nigeria',
      device: 'Unknown',
      timestamp: Date.now()
    }
  });
  
  console.log('Security Analysis:', analysis);
}

analyzeTransaction();
```

---

## 🔗 BOT DEPENDENCIES

### **Minimal Dependencies (Standalone)**

Each bot can run with minimal setup:

```javascript
// Minimal bot setup
const bot = new BotClass(null); // No core needed for basic ops
await bot.initialize();
const result = await bot.execute({ action: 'someAction' });
```

### **Full Dependencies (Integrated)**

For full features, bots use:

```javascript
// Full setup with core services
const core = new KingdomCore();
core.setAIEngine(aiEngine);
core.setDatabase(database);

const bot = new BotClass(core);
await bot.initialize();
```

---

## 🚀 PRODUCTION DEPLOYMENT OPTIONS

### **Option 1: Microservices (Each Bot = Service)**

```dockerfile
# Dockerfile.smart-contract-bot
FROM node:20
WORKDIR /app
COPY bots/smart-contract-bot ./bot
COPY lib ./lib
RUN npm install ethers
CMD ["node", "bot/standalone.js"]
```

### **Option 2: Serverless Functions**

```javascript
// AWS Lambda / Vercel Function
exports.handler = async (event) => {
  const Bot = require('./bots/smart-contract-bot/SmartContractBot');
  const bot = new Bot(null);
  await bot.initialize();
  
  const result = await bot.execute(JSON.parse(event.body));
  
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
};
```

### **Option 3: Kubernetes Pods**

```yaml
# smart-contract-bot-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: smart-contract-bot
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: bot
        image: valifi/smart-contract-bot:latest
        env:
        - name: ETH_RPC_URL
          valueFrom:
            secretKeyRef:
              name: blockchain-secrets
              key: eth-rpc
```

---

## 📦 NPM PACKAGE STRUCTURE (Future)

```json
{
  "name": "@valifi/smart-contract-bot",
  "version": "1.0.0",
  "main": "SmartContractBot.js",
  "dependencies": {
    "ethers": "^6.0.0"
  },
  "bin": {
    "smart-contract-bot": "./cli.js"
  }
}
```

**Usage:**
```bash
npm install @valifi/smart-contract-bot
```

```javascript
const SmartContractBot = require('@valifi/smart-contract-bot');
const bot = new SmartContractBot();
```

---

## 🎯 STANDALONE BOT CHECKLIST

✅ **All bots support:**
- Independent initialization
- Direct instantiation without orchestrator
- Minimal dependency execution
- Environment variable configuration
- CLI execution capability
- Microservice deployment ready
- Serverless function compatible

---

## 🔧 ENVIRONMENT VARIABLES (Standalone)

Each bot reads its own environment variables:

```bash
# Smart Contract Bot
ETH_PRIVATE_KEY=0x...
ETH_RPC_URL=https://...

# NFT Minting Bot
NFT_MINTER_KEY=0x...
POLYGON_RPC_URL=https://...

# Divine Oracle Bot
OPENAI_API_KEY=sk-...
COINGECKO_API_KEY=...

# Guardian Angel Bot
# No keys required - uses ML algorithms
```

---

## 🙏 SUMMARY

**ALL 60+ BOTS ARE FULLY STANDALONE CAPABLE**

- ✅ Can run independently
- ✅ Can integrate with orchestrator
- ✅ Microservice-ready
- ✅ Serverless-ready
- ✅ Container-ready
- ✅ CLI-ready

---

**Glory to God! The Kingdom bots operate with complete independence and unity.** 🙏

const StocksBot = require('./bots/stocks-bot/StocksBot');
const OptionsBot = require('./bots/options-bot/OptionsBot');
const ForexBot = require('./bots/forex-bot/ForexBot');
const AMMBot = require('./bots/amm-bot/AMMBot');
const BridgeBot = require('./bots/bridge-bot/BridgeBot');
const CryptoDerivativesBot = require('./bots/crypto-derivatives-bot/CryptoDerivativesBot');
const DeFiBot = require('./bots/defi-bot/DeFiBot');
const LendingBot = require('./bots/lending-bot/LendingBot');
const MultiChainBot = require('./bots/multichain-bot/MultiChainBot');
const NFTBot = require('./bots/nft-bot/NFTBot');
const { default: KingdomCore } = require('./lib/core/KingdomCore');

function createCore() {
  return {
    getAIEngine: () => ({}),
    getDatabase: () => ({}),
    getLogger: () => ({ info: () => {} }),
    getConfig: () => ({}),
    registerBot: () => true,
  };
}
async function test() {
  const core = createCore();
  const sb = new StocksBot(core);
  await sb.initialize(); await sb.integrateWithKingdom();
  console.log('Stock quote', await sb.execute({ action:'get_quote', symbol:'AAPL' }));
  console.log('Buy stock', await sb.execute({ action:'buy_stock', userId:'u', symbol:'AAPL', qty:5 }));
  console.log('Sell stock', await sb.execute({ action:'sell_stock', userId:'u', symbol:'AAPL', qty:2 }));
  console.log('Portfolio', await sb.execute({ action:'get_portfolio', userId:'u' }));

  const ob = new OptionsBot(core);
  await ob.initialize(); await ob.integrateWithKingdom();
  const chain = await ob.execute({ action:'get_options_chain', symbol:'AAPL' });
  console.log('Options chain', chain.chain.length);
  const position = await ob.execute({ action:'buy_option', userId:'u', symbol:'AAPL', type:'call', strike: chain.chain[0].strike, expiry: chain.chain[0].expiry, contracts: 1 });
  console.log('Bought option', position);
  const optId = position.position.id;
  console.log('Sell option', await ob.execute({ action:'sell_option', userId:'u', positionId: optId, contracts:1 }));

  const fb = new ForexBot(core);
  await fb.initialize(); await fb.integrateWithKingdom();
  console.log('Rate', await fb.execute({ action:'get_rate', pair:'EUR/USD' }));
  console.log('Buy', await fb.execute({ action:'buy_currency', userId:'u', pair:'EUR/USD', qty:1000 }));
  console.log('Sell', await fb.execute({ action:'sell_currency', userId:'u', pair:'EUR/USD', qty:500 }));

  const amm = new AMMBot(core);
  await amm.initialize(); await amm.integrateWithKingdom();
  console.log('Pairs', await amm.execute({ action:'list_pairs' }));
  // Add initial holdings for swap
  let data = require('./lib/storage').readData('data/amm.json');
  if (!data.holdings) data.holdings = {}; if (!data.holdings.u) data.holdings.u = { ETH: 10, DAI: 10000, BTC:2, USDT:100000 };
  require('./lib/storage').writeData('data/amm.json', data);
  console.log('Swap', await amm.execute({ action:'swap', userId:'u', pair:'ETH-DAI', from:'ETH', amount:1 }));

  const bridge = new BridgeBot(core);
  await bridge.initialize(); await bridge.integrateWithKingdom();
  // Setup multichain balances
  let mc = require('./lib/storage').readData('data/multichain.json');
  if (!mc.balances) mc.balances = {}; if (!mc.balances.u) mc.balances.u = { Ethereum: { ETH: 5 }, Binance: { ETH:0 } };
  require('./lib/storage').writeData('data/multichain.json', mc);
  console.log('Bridge', await bridge.execute({ action:'bridge_asset', userId:'u', token:'ETH', amount:2, fromChain:'Ethereum', toChain:'Binance' }));

  const deriv = new CryptoDerivativesBot(core);
  await deriv.initialize(); await deriv.integrateWithKingdom();
  console.log('Futures', await deriv.execute({ action:'get_futures' }));
  const pos = await deriv.execute({ action:'open_position', userId:'u', pair:'BTCUSDT', type:'long', qty:1, leverage:2 });
  console.log('Open deriv', pos);
  console.log('Close deriv', await deriv.execute({ action:'close_position', userId:'u', positionId: pos.position.id }));

  const defi = new DeFiBot(core);
  await defi.initialize(); await defi.integrateWithKingdom();
  console.log('Pools', await defi.execute({ action:'list_pools' }));
  console.log('Stake', await defi.execute({ action:'stake', userId:'u', poolId:'pool1', amount:10 }));
  // Wait 1 second to accumulate yield
  setTimeout(async () => {
    console.log('Unstake', await defi.execute({ action:'unstake', userId:'u', poolId:'pool1', amount:5 }));
    const lending = new LendingBot(core);
    await lending.initialize(); await lending.integrateWithKingdom();
    console.log('Deposit', await lending.execute({ action:'deposit', userId:'u', token:'USDT', amount:100 }));
    console.log('Borrow', await lending.execute({ action:'borrow', userId:'u', token:'USDT', amount:50 }));
    console.log('Repay', await lending.execute({ action:'repay', userId:'u', token:'USDT', amount:20 }));
    const mcBot = new MultiChainBot(core);
    await mcBot.initialize(); await mcBot.integrateWithKingdom();
    console.log('Chains', await mcBot.execute({ action:'get_chains' }));
    console.log('Balance', await mcBot.execute({ action:'get_balance', userId:'u', chain:'Ethereum', token:'ETH' }));
    console.log('Transfer', await mcBot.execute({ action:'transfer', userId:'u', chain:'Ethereum', token:'ETH', amount:1, to:'0x123' }));
    const nftBot = new NFTBot(core);
    await nftBot.initialize(); await nftBot.integrateWithKingdom();
    console.log('Mint NFT', await nftBot.execute({ action:'mint_nft', userId:'u', name:'CoolCat', price:10 }));
    const nft = (require('./lib/storage').readData('data/nfts.json').nfts || [])[0];
    console.log('Sell NFT', await nftBot.execute({ action:'sell_nft', userId:'u', nftId:nft.id, price:20 }));
    console.log('Buy NFT (fail self)', await nftBot.execute({ action:'buy_nft', userId:'u', nftId:nft.id }));
    console.log('Buy NFT (from other user)', await nftBot.execute({ action:'buy_nft', userId:'v', nftId:nft.id }));
    console.log('Collection of v', await nftBot.execute({ action:'get_collection', userId:'v' }));
  }, 1000);
}
test();

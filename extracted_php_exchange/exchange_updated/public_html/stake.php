<?php
// stake.php – Simple staking interface integrated into the exchange
// This page introduces users to Ethereum staking and allows them to
// simulate deposits into the Kingdom Stake pool. It uses the site’s
// shared session and layout helpers to provide a consistent look and
// navigation. For an actual staking implementation, you would
// integrate Web3 and call the KingdomStakePool smart contract. Here
// we present a read‑only calculator and educational section based on
// research into different staking methods.

require_once __DIR__ . '/includes/session.php';
require_once __DIR__ . '/includes/layout.php';

head('Stake ETH – YourCryptoExchange.tech');
?>

<section class="mb-8">
  <h1 class="text-3xl font-bold mb-4">Stake ETH with Kingdom Stake</h1>
  <!--
    The following introduction has been updated to provide a balanced overview of Ethereum staking.
    It emphasises that typical staking yields are modest (around 3–6 % annualised) as reported by
    respected sources, with an estimated return of about 3.1 % as of June 2025【45190256998004†L423-L425】.
    Users should understand that promotional boosts are temporary and that real returns depend on
    network conditions, validator performance and operator honesty. Staking involves risks such as
    slashing, smart‑contract bugs and custodial failure【45190256998004†L408-L419】. Always perform
    due diligence, complete KYC and keep private keys secure.
  -->
  <p class="text-gray-300 mb-4">Staking lets you earn passive income by helping secure proof‑of‑stake blockchains. There are multiple ways to stake, each with
    different requirements, reward potential and risks. Based on current research, pooled staking strikes a balance between access and control. You can start with a small amount of ETH, avoid the complexity of running your own validator and maintain non‑custodial control of your keys.
  </p>

  <p class="text-gray-400 text-sm mb-4">
    <strong>Important notice:</strong> The typical annual percentage yield (APY) for staking Ethereum ranges from
    approximately 3&nbsp;% to 6&nbsp;%, with an estimated return of 3.1&nbsp;% reported in June&nbsp;2025【45190256998004†L423-L425】.
    Promotional offers, like the boost shown below, are temporary and subject to change. You should only stake funds
    you can afford to lock up, understand the exit queue and read all risk disclosures. For solo staking, you need 32 ETH and dedicated hardware; staking pools lower the barrier but introduce operator risk【45190256998004†L372-L383】. Always verify the legitimacy of the staking provider before depositing.
  </p>
  <div class="grid md:grid-cols-2 gap-6">
    <article class="p-6 rounded-xl bg-black/40 border border-green-500/20">
      <h2 class="font-semibold text-xl mb-2">Why Pooled Staking?</h2>
      <ul class="list-disc ml-5 text-gray-300 space-y-2 text-sm">
        <li>Pooled staking allows many participants to combine their ETH to meet the 32 ETH requirement for running validators. This opens staking to users with smaller balances【227395827254220†L163-L172】.</li>
        <li>There’s no need to run hardware or maintain uptime – professional operators handle validator management【227395827254220†L163-L186】.</li>
        <li>Rewards are distributed proportionally based on your contribution; leaving your stake in the pool allows the rewards to compound【227395827254220†L190-L199】.</li>
        <li>You can request withdrawals at any time, subject to exit queues, which offers more flexibility than solo staking【227395827254220†L190-L203】.</li>
        <li>Risks include lower returns compared with solo validators and reliance on the pool operator’s performance and honesty【227395827254220†L215-L226】.</li>
      </ul>
      <p class="text-gray-400 text-xs mt-2">Sources: Webopedia staking guide【714938993542167†L152-L171】 and Luganodes staking options report【227395827254220†L163-L186】.</p>
    </article>
    <article class="p-6 rounded-xl bg-black/40 border border-green-500/20">
      <h2 class="font-semibold text-xl mb-2">Other Staking Methods</h2>
      <ul class="list-disc ml-5 text-gray-300 space-y-2 text-sm">
        <li><strong>Solo Staking</strong>: run your own validator and earn all rewards. Requires 32 ETH, technical expertise and continuous uptime; slashing penalties apply【714938993542167†L236-L244】.</li>
        <li><strong>Staking‑as‑a‑Service</strong>: delegate validator operations to a provider. Still requires 32 ETH but offloads maintenance. Fees and platform risk reduce returns【227395827254220†L76-L92】.</li>
        <li><strong>Exchange (CEX) Staking</strong>: stake through a centralised exchange. Convenient but fully custodial; you must trust the exchange and accept lower yields【714938993542167†L285-L297】.</li>
        <li><strong>Liquid Staking</strong>: receive derivative tokens that represent your staked ETH and remain tradable. Provides liquidity but introduces smart contract and peg risks【714938993542167†L274-L300】.</li>
      </ul>
      <p class="text-gray-400 text-xs mt-2">See Britannica’s overview of staking types for more details【991264386073851†L190-L207】.</p>
    </article>
  </div>
</section>

<section class="mb-8">
  <h2 class="text-2xl font-bold mb-4">Rewards Calculator</h2>
  <p class="text-gray-300 mb-4">Use the slider to see how much you could earn in a year at the current base annual percentage yield (APY). Stake before the promotion ends to receive a boost.</p>
  <div class="grid md:grid-cols-2 gap-6">
    <div class="p-6 rounded-xl bg-black/40 border border-green-500/20">
      <label class="block text-sm text-gray-400 mb-2" for="stakeAmount">Amount to stake (ETH)</label>
      <input id="stakeAmount" type="range" min="0" max="100" step="0.1" value="10" class="w-full">
      <div class="flex justify-between text-xs text-gray-400 mt-2"><span>0 ETH</span><span>100 ETH</span></div>
      <div class="mt-4">
        <div class="text-xs text-gray-400">Selected</div>
        <div id="selectedAmount" class="text-2xl font-bold">10.0 ETH</div>
      </div>
    </div>
    <div class="p-6 rounded-xl bg-black/40 border border-green-500/20">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-gray-400">Base APY</div>
          <div id="baseApy" class="text-2xl font-bold">5.8%</div>
        </div>
        <div>
          <div class="text-sm text-gray-400">Promo Boost</div>
          <div id="promoBoost" class="text-2xl font-bold">+25%</div>
        </div>
      </div>
      <div class="mt-6">
        <div class="text-sm text-gray-400">Estimated yearly reward (Normal)</div>
        <div id="normalReward" class="text-2xl font-bold">0.5800 ETH</div>
        <div class="text-sm text-gray-400 mt-4">Estimated yearly reward (With Promo)</div>
        <div id="promoReward" class="text-2xl font-bold">0.7250 ETH</div>
        <div class="mt-6">
          <button id="stakeBtn" class="w-full py-3 rounded bg-green-600 hover:bg-green-500 text-black font-semibold">Stake This Amount</button>
        </div>
      </div>
    </div>
  </div>
  <p class="text-gray-400 text-xs mt-2">*Rewards are estimates only and depend on network conditions. Promo boost ends on 31 October 2025.</p>
</section>

<script>
// Staking calculator script. Mirrors the logic from the React component
// but runs in plain JavaScript.
// Configuration constants for the calculator. The base APY is set to 5.8 % to reflect
// our current pooled staking promotion. In reality, staking yields fluctuate with network
// conditions and typically sit between 3 % and 6 % per year【45190256998004†L423-L425】. Adjust these
// values as needed when promotions change or to model more conservative returns.
const CONFIG = {
  BASE_APY: 5.8,
  PROMO_BOOST: 25,
  PROMO_END: new Date('2025-10-31T23:59:00Z'),
};
function calcRewards(amount) {
  const normal = amount * (CONFIG.BASE_APY / 100);
  const promo = normal * (1 + CONFIG.PROMO_BOOST / 100);
  return { normal, promo };
}
function updateCalculator() {
  const amount = parseFloat(document.getElementById('stakeAmount').value);
  document.getElementById('selectedAmount').textContent = amount.toFixed(1) + ' ETH';
  const { normal, promo } = calcRewards(amount);
  document.getElementById('normalReward').textContent = normal.toFixed(4) + ' ETH';
  document.getElementById('promoReward').textContent = promo.toFixed(4) + ' ETH';
}
document.getElementById('stakeAmount').addEventListener('input', updateCalculator);
updateCalculator();
document.getElementById('stakeBtn').addEventListener('click', function () {
  alert('Staking functionality not connected. In production, this would call the KingdomStakePool smart contract via Web3.');
});
</script>

<?php foot(); ?>
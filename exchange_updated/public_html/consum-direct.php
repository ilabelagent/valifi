<?php
// consum-direct.php – Consum Direct landing page integrating a premium
// ETH-to-gold investment concept into the existing exchange. This page
// outlines the vision for a luxurious gold investment service using
// cryptocurrency and invites users to learn more or join a waitlist.

require_once __DIR__ . '/includes/session.php';
require_once __DIR__ . '/includes/layout.php';

head('Consum Direct – YourCryptoExchange.tech');
?>

<section class="mb-8">
  <h1 class="text-4xl font-bold mb-4">Consum Direct</h1>
  <p class="text-gray-300 mb-6 text-lg">Transform your ETH into timeless wealth. Consum Direct unites premium precious metals, crypto payments and elite lifestyle services under one secure and prestige‑driven brand.</p>
  <div class="grid md:grid-cols-2 gap-8">
    <article class="bg-black/40 border border-gold-500/30 rounded-xl p-6">
      <h2 class="text-2xl font-semibold mb-3">Vision</h2>
      <p class="text-sm text-gray-300">We bridge the gap between digital assets and tangible gold. Through Consum Direct, crypto investors can diversify into physical LBMA‑certified gold bars and coins using ETH. Each purchase mints an NFT certificate proving ownership and enabling secondary trade. Membership tiers unlock luxury benefits like free shipping, concierge service and exclusive experiences.</p>
    </article>
    <article class="bg-black/40 border border-gold-500/30 rounded-xl p-6">
      <h2 class="text-2xl font-semibold mb-3">Crypto & Gold Integration</h2>
      <p class="text-sm text-gray-300">Pay directly with ETH. Our smart contract escrow locks your ETH until your gold is dispatched or stored in our insured vaults. Automatic hedging ensures you lock the gold price at checkout. NFT certificates provide proof‑of‑ownership and liquidity for resale.</p>
      <a href="/metals-exchange.php" class="inline-block mt-4 px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-black font-semibold text-sm">Explore Precious Metals Exchange</a>
    </article>
  </div>
</section>

<section class="mb-8">
  <h2 class="text-3xl font-bold mb-4">Membership Tiers</h2>
  <p class="text-gray-300 mb-6">Choose your royal standing and unlock exclusive benefits. Higher tiers offer greater perks for larger holdings.</p>
  <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div class="p-6 rounded-xl bg-black/40 border border-gold-500/30">
      <h3 class="font-semibold text-xl mb-2">Royal Bronze</h3>
      <ul class="text-sm text-gray-300 list-disc ml-5 space-y-1">
        <li>Entry‑level access to gold purchases</li>
        <li>Digital NFT certificate for each purchase</li>
        <li>Optional insured vault storage</li>
      </ul>
    </div>
    <div class="p-6 rounded-xl bg-black/40 border border-silver-500/30">
      <h3 class="font-semibold text-xl mb-2">Royal Silver</h3>
      <ul class="text-sm text-gray-300 list-disc ml-5 space-y-1">
        <li>$50k+ holdings</li>
        <li>Free global shipping</li>
        <li>Priority support and early access to limited drops</li>
      </ul>
    </div>
    <div class="p-6 rounded-xl bg-black/40 border border-amber-500/30">
      <h3 class="font-semibold text-xl mb-2">Royal Gold</h3>
      <ul class="text-sm text-gray-300 list-disc ml-5 space-y-1">
        <li>$500k+ holdings</li>
        <li>Dedicated concierge & annual VIP events</li>
        <li>Reduced spreads on gold purchases</li>
      </ul>
    </div>
    <div class="p-6 rounded-xl bg-black/40 border border-purple-500/30">
      <h3 class="font-semibold text-xl mb-2">King’s Court</h3>
      <ul class="text-sm text-gray-300 list-disc ml-5 space-y-1">
        <li>$5M+ holdings</li>
        <li>Private jet perks & exclusive supplier meetings</li>
        <li>Custom minted gold pieces</li>
      </ul>
    </div>
    <div class="p-6 rounded-xl bg-black/40 border border-red-500/30 md:col-span-2 lg:col-span-1">
      <h3 class="font-semibold text-xl mb-2">King David Circle</h3>
      <ul class="text-sm text-gray-300 list-disc ml-5 space-y-1">
        <li>$10B+ visionary tier</li>
        <li>Sovereign lifestyle & bespoke concierge</li>
        <li>Influence platform governance and treasury</li>
      </ul>
    </div>
  </div>
</section>

<section class="mb-8">
  <h2 class="text-3xl font-bold mb-4">Join the Waitlist</h2>
  <p class="text-gray-300 mb-4">We’re building Consum Direct and invite early adopters to join our waitlist. Enter your email to receive updates on our launch and be among the first to access premium gold investments using ETH.</p>
  <form method="post" action="/subscribe.php" class="flex flex-col md:flex-row gap-3 max-w-lg">
    <input type="email" name="email" required placeholder="Email address" class="flex-grow px-3 py-2 rounded bg-gray-800 border border-gray-600">
    <button class="px-4 py-2 rounded bg-gold-600 hover:bg-gold-500 text-black font-semibold">Join Waitlist</button>
  </form>
</section>

<?php foot(); ?>
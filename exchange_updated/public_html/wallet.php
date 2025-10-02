<?php
// wallet.php – Hybrid custodial and non‑custodial wallet management
// Allows logged‑in users to view and manage their custodial balances and
// connect a non‑custodial Web3 wallet. Custodial deposit/withdrawal
// actions update the balances table. Non‑custodial actions are stubbed
// out and would need on‑chain integration in a real system.

require_once __DIR__ . '/includes/session.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/layout.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/csrf.php';

require_login();

$user_id = get_user_id();
$msg = '';
$msgType = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $action = $_POST['action'] ?? '';
    $asset = strtoupper(trim($_POST['asset'] ?? ''));
    $amount = (float)($_POST['amount'] ?? 0);
    try {
        if ($amount <= 0) throw new Exception('Amount must be positive');
        if (!preg_match('/^[A-Z]{3,10}$/', $asset)) throw new Exception('Invalid asset');
        if ($action === 'deposit') {
            // Increase balance
            $stmt = $pdo->prepare('
                INSERT INTO balances (user_id, asset, free, locked)
                VALUES (?, ?, ?, 0)
                ON DUPLICATE KEY UPDATE free = free + VALUES(free)
            ');
            $stmt->execute([$user_id, $asset, $amount]);
            $msg = "Deposited $amount $asset to your custodial wallet.";
            $msgType = 'success';
        } elseif ($action === 'withdraw') {
            // Check balance
            $stmt = $pdo->prepare('SELECT free FROM balances WHERE user_id = ? AND asset = ?');
            $stmt->execute([$user_id, $asset]);
            $balance = $stmt->fetchColumn();
            if (!$balance || $balance < $amount) throw new Exception('Insufficient balance');
            // Decrease balance
            $stmt = $pdo->prepare('UPDATE balances SET free = free - ? WHERE user_id = ? AND asset = ?');
            $stmt->execute([$amount, $user_id, $asset]);
            $msg = "Withdrew $amount $asset from your custodial wallet.";
            $msgType = 'success';
        } else {
            throw new Exception('Unknown action');
        }
    } catch (Exception $e) {
        $msg = 'Error: ' . $e->getMessage();
        $msgType = 'error';
    }
}

// Fetch balances
$stmt = $pdo->prepare('SELECT asset, free, locked FROM balances WHERE user_id = ? ORDER BY asset');
$stmt->execute([$user_id]);
$balances = $stmt->fetchAll();

head('Wallet – YourCryptoExchange.tech');
?>
<h1 class="text-2xl font-bold mb-4">My Wallet</h1>
<?php if ($msg): ?>
    <div class="mb-4 text-sm <?= ($msgType === 'success') ? 'text-green-400' : 'text-red-400' ?>">
        <?= htmlspecialchars($msg) ?>
    </div>
<?php endif; ?>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <section class="lg:col-span-1 bg-black/40 border border-green-500/20 rounded-xl p-4">
    <h2 class="font-semibold mb-3">Custodial Balances</h2>
    <?php if (!$balances): ?>
        <div class="text-sm text-gray-400">No balances</div>
    <?php else: ?>
        <ul class="text-sm space-y-1">
          <?php foreach ($balances as $b): ?>
            <li><?= htmlspecialchars($b['asset']) ?>: <?= htmlspecialchars($b['free']) ?></li>
          <?php endforeach; ?>
        </ul>
    <?php endif; ?>
  </section>
  <section class="lg:col-span-1 bg-black/40 border border-green-500/20 rounded-xl p-4">
    <h2 class="font-semibold mb-3">Deposit</h2>
    <form method="post" class="space-y-2">
      <?php csrf_field(); ?>
      <input type="hidden" name="action" value="deposit">
      <label class="block text-sm text-gray-300">Asset (e.g., BTC, ETH, USDT)</label>
      <input name="asset" class="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600" required>
      <label class="block text-sm text-gray-300">Amount</label>
      <input name="amount" type="number" step="0.00000001" class="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600" required>
      <button class="w-full py-2 rounded bg-green-600 hover:bg-green-700">Deposit</button>
    </form>
  </section>
  <section class="lg:col-span-1 bg-black/40 border border-green-500/20 rounded-xl p-4">
    <h2 class="font-semibold mb-3">Withdraw</h2>
    <form method="post" class="space-y-2">
      <?php csrf_field(); ?>
      <input type="hidden" name="action" value="withdraw">
      <label class="block text-sm text-gray-300">Asset (e.g., BTC, ETH, USDT)</label>
      <input name="asset" class="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600" required>
      <label class="block text-sm text-gray-300">Amount</label>
      <input name="amount" type="number" step="0.00000001" class="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600" required>
      <button class="w-full py-2 rounded bg-green-600 hover:bg-green-700">Withdraw</button>
    </form>
  </section>
</div>

<section class="mt-10 bg-black/40 border border-green-500/20 rounded-xl p-4">
  <h2 class="font-semibold mb-3">Non‑Custodial Wallet</h2>
  <p class="text-sm text-gray-300 mb-3">Connect your browser wallet (e.g., MetaMask) to view your on‑chain balance. In a full implementation this would allow you to deposit from or withdraw to your non‑custodial wallet.</p>
  <button id="connectWalletBtn" class="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm">Connect Wallet</button>
  <div id="walletInfo" class="mt-3 text-sm text-gray-300 hidden"></div>
</section>

<script src="https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/web3modal@1.9.12/dist/index.min.js"></script>
<script>
const connectBtn = document.getElementById('connectWalletBtn');
const walletInfo = document.getElementById('walletInfo');
let web3Provider;
async function connectWallet() {
  try {
    const providerOptions = {};
    const web3Modal = new Web3Modal.default({ cacheProvider: false, providerOptions });
    const instance = await web3Modal.connect();
    web3Provider = new ethers.providers.Web3Provider(instance);
    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();
    walletInfo.textContent = 'Connected wallet: ' + address;
    walletInfo.classList.remove('hidden');
  } catch (err) {
    console.error(err);
    alert('Wallet connection failed');
  }
}
connectBtn.addEventListener('click', connectWallet);
</script>

<?php foot(); ?>
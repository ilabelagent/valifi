<?php
require_once __DIR__.'/../includes/session.php';
require_once __DIR__.'/../includes/db.php';
require_once __DIR__.'/../includes/layout.php';
require_once __DIR__.'/../includes/auth.php';
require_once __DIR__.'/../includes/csrf.php';
require_once __DIR__.'/../includes/orders.php';

require_login();
$user = current_user();

$msg='';
if ($_SERVER['REQUEST_METHOD']==='POST') {
  csrf_verify();
  $symbol = strtoupper(trim($_POST['symbol']??'BTCUSDT'));
  $side   = strtoupper(trim($_POST['side']??'BUY'));
  $type   = strtoupper(trim($_POST['type']??'MARKET'));
  $qty    = (float)($_POST['quantity']??0);
  $price  = isset($_POST['price']) && $_POST['price']!=='' ? (float)$_POST['price'] : null;
  $mark   = isset($_POST['mark'])  && $_POST['mark']!==''  ? (float)$_POST['mark']  : null;
  
  $res = place_order($user['id'],$symbol,$side,$type,$qty,$price,$mark);
  if ($res['ok']) {
    $msg = $res['filled'] ? "Filled: {$side} {$symbol} {$_POST['quantity']} @ {$res['price']}" : "Order placed.";
  } else { 
    $msg = 'Error: '.$res['error']; 
  }
}

$bal = $pdo->prepare('SELECT asset,free,locked FROM balances WHERE user_id=? ORDER BY asset');
$bal->execute([$user['id']]); 
$balances = $bal->fetchAll();

$oo = $pdo->prepare('SELECT id as orderId, symbol, side, type, price, quantity, status, fee, created_at FROM orders WHERE user_id=? AND status IN ("NEW","PARTIALLY_FILLED") ORDER BY id DESC LIMIT 100');
$oo->execute([$user['id']]); 
$open = $oo->fetchAll();

$tr = $pdo->prepare('SELECT order_id as orderId, symbol, side, price, quantity, fee, created_at FROM trades WHERE user_id=? ORDER BY id DESC LIMIT 100');
$tr->execute([$user['id']]); 
$trades = $tr->fetchAll();

head('Trade - YourCryptoExchange.tech');
?>
<h1 class="text-2xl font-bold mb-4">Trade</h1>
<?php if($msg): ?><div class="mb-4 text-sm <?= strpos($msg,'Error')===0 ? 'text-red-400' : 'text-green-400' ?>"><?= htmlspecialchars($msg) ?></div><?php endif; ?>

<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
  <section class="lg:col-span-1 bg-black/40 border border-green-500/20 rounded-xl p-4">
    <h2 class="font-semibold mb-3">Place Order</h2>
    <form method="post" class="space-y-3">
      <?php csrf_field(); ?>
      <label class="block text-sm text-gray-300">Symbol</label>
      <input name="symbol" value="BTCUSDT" class="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600">
      <div class="grid grid-cols-2 gap-2">
        <select name="side" class="px-3 py-2 rounded bg-gray-800 border border-gray-600">
          <option>BUY</option><option>SELL</option>
        </select>
        <select name="type" class="px-3 py-2 rounded bg-gray-800 border border-gray-600" id="typeSel">
          <option>MARKET</option><option>LIMIT</option>
        </select>
      </div>
      <div id="priceWrap">
        <label class="block text-sm text-gray-300">Price (USDT)</label>
        <input name="price" step="0.00000001" class="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600">
      </div>
      <label class="block text-sm text-gray-300">Quantity</label>
      <input name="quantity" step="0.00000001" class="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600">
      <input type="hidden" name="mark" id="markField">
      <button class="w-full py-2 rounded bg-green-600 hover:bg-green-700">Submit</button>
    </form>
  </section>
  
  <section class="lg:col-span-1 bg-black/40 border border-green-500/20 rounded-xl p-4">
    <h2 class="font-semibold mb-3">Balances</h2>
    <ul class="text-sm space-y-1">
      <?php foreach($balances as $b): ?>
        <li><?= htmlspecialchars($b['asset']) ?>: <?= htmlspecialchars($b['free']) ?></li>
      <?php endforeach; ?>
    </ul>
  </section>
  
  <section class="lg:col-span-1 bg-black/40 border border-green-500/20 rounded-xl p-4">
    <h2 class="font-semibold mb-3">Open Orders</h2>
    <?php if(!$open): ?><div class="text-sm text-gray-400">None</div><?php endif; ?>
    <?php foreach($open as $o): ?>
      <div class="text-sm border border-gray-700 rounded p-2 mb-2">
        <?= htmlspecialchars($o['side'].' '.$o['symbol'].' '.$o['quantity'].' @ '.$o['price']) ?> - <?= htmlspecialchars($o['status']) ?>
      </div>
    <?php endforeach; ?>
  </section>
  
  <section class="lg:col-span-1 bg-black/40 border border-green-500/20 rounded-xl p-4">
    <h2 class="font-semibold mb-3">Recent Trades</h2>
    <?php if(!$trades): ?><div class="text-sm text-gray-400">No trades</div><?php endif; ?>
    <?php foreach($trades as $t): ?>
      <div class="text-sm border border-gray-700 rounded p-2 mb-2">
        <?= htmlspecialchars($t['side'].' '.$t['symbol'].' '.$t['quantity'].' @ '.$t['price']) ?> 
        <span class="text-gray-400">Fee: <?= htmlspecialchars($t['fee']) ?></span>
      </div>
    <?php endforeach; ?>
  </section>
</div>

<script>
const typeSel = document.getElementById('typeSel');
const priceWrap = document.getElementById('priceWrap');
const markField = document.getElementById('markField');

function updatePriceVisibility(){ 
  priceWrap.style.display = (typeSel.value==='MARKET') ? 'none' : 'block'; 
}

typeSel.addEventListener('change', updatePriceVisibility); 
updatePriceVisibility();

let ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');
ws.onmessage = (e)=>{
  try{
    const arr = JSON.parse(e.data);
    const sym = document.querySelector('input[name="symbol"]').value.trim().toUpperCase();
    for(const t of arr){ 
      if(t.s===sym){ 
        markField.value = t.c; 
        break; 
      } 
    }
  }catch{}
};
</script>
<?php foot(); ?>
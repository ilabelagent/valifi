<?php
// metals-exchange.php - Complete precious metals exchange system
// Reuse the site's session and database configuration instead of rolling
// our own. This ensures consistent user IDs (both `uid` and
// `user_id`) and shared PDO connection with proper credentials. The
// session helper will start the session if needed.
require_once __DIR__ . '/includes/session.php';
require_once __DIR__ . '/includes/db.php';

// Determine logged in user. We support both the `uid` key used by the
// main site and the `user_id` key used historically in this file. This
// allows metals exchange functionality to operate seamlessly with
// existing authentication.
$user_id = $_SESSION['uid'] ?? ($_SESSION['user_id'] ?? null);
$is_logged_in = $user_id !== null;

$message = '';
$messageType = '';
$portfolio_data = [];
$recent_orders = [];

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $is_logged_in) {
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'exchange_metals':
                $crypto_currency = strtoupper(trim($_POST['crypto_currency'] ?? ''));
                $crypto_amount = (float)($_POST['crypto_amount'] ?? 0);
                $metal_type = strtoupper(trim($_POST['metal_type'] ?? 'GOLD'));
                $investment_type = trim($_POST['investment_type'] ?? 'instant');
                $investment_type = ($investment_type === 'fixed') ? 'FIXED_1_YEAR' : 'INSTANT_STORAGE';
                
                if ($crypto_currency && $crypto_amount > 0) {
                    try {
                        $pdo->beginTransaction();
                        
                        // Get metal price info
                        $stmt = $pdo->prepare("SELECT current_price_usd, premium_percentage, inventory_available FROM metals_inventory WHERE metal_type = ? AND is_active = 1");
                        $stmt->execute([$metal_type]);
                        $metal_info = $stmt->fetch();
                        
                        if (!$metal_info) {
                            throw new Exception("Metal type not available");
                        }
                        
                        // Crypto prices (you'd get these from real API)
                        $crypto_rates = [
                            'BTC' => 43250.00,
                            'ETH' => 2650.00,
                            'USDT' => 1.00,
                            'USDC' => 1.00
                        ];
                        
                        $crypto_usd_rate = $crypto_rates[$crypto_currency] ?? 0;
                        if (!$crypto_usd_rate) {
                            throw new Exception("Unsupported cryptocurrency");
                        }
                        
                        // Calculate values
                        $total_usd_value = $crypto_amount * $crypto_usd_rate;
                        $metal_price_with_premium = $metal_info['current_price_usd'] * (1 + $metal_info['premium_percentage'] / 100);
                        $metal_quantity = $total_usd_value / $metal_price_with_premium;

                        // Minimum order check
                        if ($total_usd_value < 100) {
                            throw new Exception("Minimum order amount is $100 USD");
                        }

                        // Check inventory availability. If the requested quantity of metal exceeds
                        // what we have in stock, reject the order. This prevents selling more
                        // metal than is available.
                        if (isset($metal_info['inventory_available']) && $metal_info['inventory_available'] < $metal_quantity) {
                            throw new Exception("Insufficient inventory available for $metal_type");
                        }
                        
                        // Generate order reference
                        $order_ref = 'MTL-' . date('Ymd') . '-' . strtoupper(substr($metal_type, 0, 2)) . '-' . substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZ23456789'), 0, 6);
                        
                        // Set investment parameters
                        $storage_fee_annual = ($investment_type === 'INSTANT_STORAGE') ? 0.50 : 0.00;
                        $fixed_apy = ($investment_type === 'FIXED_1_YEAR') ? 8.00 : null;
                        $maturity_date = ($investment_type === 'FIXED_1_YEAR') ? date('Y-m-d', strtotime('+1 year')) : null;
                        
                        // Create the order
                        $stmt = $pdo->prepare("
                            INSERT INTO metals_orders 
                            (user_id, order_ref, metal_type, crypto_currency, crypto_amount, crypto_usd_rate, 
                             metal_usd_rate, metal_quantity, total_usd_value, investment_type, status, 
                             storage_fee_annual, fixed_apy, maturity_date, vault_location)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, 'Delaware Depository')
                        ");
                        
                        $stmt->execute([
                            $user_id, $order_ref, $metal_type, $crypto_currency, $crypto_amount,
                            $crypto_usd_rate, $metal_price_with_premium, $metal_quantity, $total_usd_value,
                            $investment_type, $storage_fee_annual, $fixed_apy, $maturity_date
                        ]);
                        
                        $order_id = $pdo->lastInsertId();
                        
                        // Update user's balance
                        $stmt = $pdo->prepare("
                            INSERT INTO metals_balances (user_id, metal_type, total_quantity, instant_storage_qty, fixed_investment_qty, total_cost_basis_usd)
                            VALUES (?, ?, ?, ?, ?, ?)
                            ON DUPLICATE KEY UPDATE 
                                total_quantity = total_quantity + VALUES(total_quantity),
                                instant_storage_qty = instant_storage_qty + VALUES(instant_storage_qty),
                                fixed_investment_qty = fixed_investment_qty + VALUES(fixed_investment_qty),
                                total_cost_basis_usd = total_cost_basis_usd + VALUES(total_cost_basis_usd)
                        ");
                        
                        $instant_qty = ($investment_type === 'INSTANT_STORAGE') ? $metal_quantity : 0;
                        $fixed_qty = ($investment_type === 'FIXED_1_YEAR') ? $metal_quantity : 0;
                        
                        $stmt->execute([
                            $user_id, $metal_type, $metal_quantity, $instant_qty, $fixed_qty, $total_usd_value
                        ]);

                        // Decrease available inventory. This ensures that subsequent buyers
                        // cannot purchase more metal than the vault holds. We assume the
                        // metals_inventory table has an inventory_available field representing
                        // the total troy ounces available for sale. Only update the active
                        // inventory row for this metal type.
                        $stmt = $pdo->prepare(
                            "UPDATE metals_inventory SET inventory_available = inventory_available - ? WHERE metal_type = ? AND is_active = 1"
                        );
                        $stmt->execute([$metal_quantity, $metal_type]);
                        
                        // Create fixed investment record if needed
                        if ($investment_type === 'FIXED_1_YEAR') {
                            $projected_value = $total_usd_value * (1 + $fixed_apy / 100);
                            $stmt = $pdo->prepare("
                                INSERT INTO metals_fixed_investments 
                                (user_id, order_id, metal_type, quantity, principal_usd, apy_rate, start_date, maturity_date, projected_value_usd, current_value_usd)
                                VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?)
                            ");
                            $stmt->execute([
                                $user_id, $order_id, $metal_type, $metal_quantity, $total_usd_value, $fixed_apy, $maturity_date, $projected_value, $total_usd_value
                            ]);
                        }
                        
                        // Update order status to stored (simulating instant processing)
                        $stmt = $pdo->prepare("UPDATE metals_orders SET status = 'STORED' WHERE id = ?");
                        $stmt->execute([$order_id]);
                        
                        $pdo->commit();
                        
                        $message = "Exchange successful! Order $order_ref created. You now own " . number_format($metal_quantity, 4) . " troy oz of $metal_type.";
                        $messageType = 'success';
                        
                    } catch (Exception $e) {
                        $pdo->rollBack();
                        $message = "Exchange failed: " . $e->getMessage();
                        $messageType = 'error';
                    }
                } else {
                    $message = "Please fill in all required fields";
                    $messageType = 'error';
                }
                break;
                
            case 'request_shipping':
                $metal_type = strtoupper(trim($_POST['metal_type'] ?? ''));
                $quantity = (float)($_POST['quantity'] ?? 0);
                $shipping_address = trim($_POST['shipping_address'] ?? '');
                $recipient_name = trim($_POST['recipient_name'] ?? '');
                
                if ($metal_type && $quantity > 0 && $shipping_address && $recipient_name) {
                    try {
                        // Check if user has enough instant storage quantity
                        $stmt = $pdo->prepare("SELECT instant_storage_qty FROM metals_balances WHERE user_id = ? AND metal_type = ?");
                        $stmt->execute([$user_id, $metal_type]);
                        $balance = $stmt->fetch();
                        
                        if (!$balance || $balance['instant_storage_qty'] < $quantity) {
                            throw new Exception("Insufficient available quantity for shipping");
                        }
                        
                        // Calculate shipping cost (simplified)
                        $shipping_cost = 50.00; // Base cost
                        if ($quantity > 10) $shipping_cost += 25.00; // Additional for large orders
                        
                        // Create shipping request
                        $stmt = $pdo->prepare("
                            INSERT INTO metals_shipping_requests 
                            (user_id, metal_type, quantity_requested, shipping_cost_usd, recipient_name, shipping_address, status)
                            VALUES (?, ?, ?, ?, ?, ?, 'REQUESTED')
                        ");
                        $stmt->execute([$user_id, $metal_type, $quantity, $shipping_cost, $recipient_name, $shipping_address]);
                        
                        // Update balance (reduce instant storage)
                        $stmt = $pdo->prepare("
                            UPDATE metals_balances 
                            SET instant_storage_qty = instant_storage_qty - ?, total_quantity = total_quantity - ?
                            WHERE user_id = ? AND metal_type = ?
                        ");
                        $stmt->execute([$quantity, $quantity, $user_id, $metal_type]);
                        
                        $message = "Shipping request submitted successfully! Estimated shipping cost: $" . number_format($shipping_cost, 2);
                        $messageType = 'success';
                        
                    } catch (Exception $e) {
                        $message = "Shipping request failed: " . $e->getMessage();
                        $messageType = 'error';
                    }
                } else {
                    $message = "Please fill in all shipping details";
                    $messageType = 'error';
                }
                break;
        }
    }
}

// Get current metal prices
$stmt = $pdo->query("SELECT metal_type, current_price_usd, premium_percentage FROM metals_inventory WHERE is_active = 1 ORDER BY metal_type");
$metal_prices = $stmt->fetchAll();

// Get user portfolio data if logged in
if ($is_logged_in) {
    // Get balances
    $stmt = $pdo->prepare("
        SELECT mb.*, mi.current_price_usd 
        FROM metals_balances mb
        JOIN metals_inventory mi ON mb.metal_type = mi.metal_type
        WHERE mb.user_id = ? AND mb.total_quantity > 0
        ORDER BY mb.metal_type
    ");
    $stmt->execute([$user_id]);
    $portfolio_data = $stmt->fetchAll();
    
    // Calculate current values
    foreach ($portfolio_data as &$item) {
        $current_value = $item['total_quantity'] * $item['current_price_usd'];
        $item['current_value_usd'] = $current_value;
        $item['gain_loss_usd'] = $current_value - $item['total_cost_basis_usd'];
        $item['gain_loss_pct'] = $item['total_cost_basis_usd'] > 0 
            ? (($current_value - $item['total_cost_basis_usd']) / $item['total_cost_basis_usd']) * 100 
            : 0;
    }
    
    // Get recent orders
    $stmt = $pdo->prepare("
        SELECT * FROM metals_orders 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 10
    ");
    $stmt->execute([$user_id]);
    $recent_orders = $stmt->fetchAll();
}

function formatMetal($metal_type) {
    $symbols = ['GOLD' => '🥇', 'SILVER' => '🥈', 'PLATINUM' => '⚪', 'PALLADIUM' => '⚫'];
    return ($symbols[$metal_type] ?? '') . ' ' . ucfirst(strtolower($metal_type));
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Precious Metals Exchange - YourCryptoExchange</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .metals-card {
            background: linear-gradient(145deg, #1e293b, #334155);
            border: 1px solid rgba(148, 163, 184, 0.1);
        }
        .gold-gradient { background: linear-gradient(135deg, #ffd700, #ffed4a); }
        .silver-gradient { background: linear-gradient(135deg, #c0c0c0, #e5e7eb); }
        .glow { box-shadow: 0 0 30px rgba(59, 130, 246, 0.3); }
    </style>
</head>
<body class="bg-slate-900 text-white">
    <!-- Background -->
    <div class="fixed inset-0 gradient-bg opacity-20"></div>
    <div class="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/50 to-slate-900"></div>
    
    <div class="relative z-10">
        <!-- Header -->
        <header class="border-b border-white/10 backdrop-blur-md bg-slate-900/50">
            <div class="max-w-7xl mx-auto px-6 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <span class="text-xl font-bold">₿</span>
                        </div>
                        <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            YourCryptoExchange
                        </h1>
                    </div>
                    <nav class="flex items-center space-x-6">
                        <a href="index.php" class="text-slate-300 hover:text-white transition-colors">Home</a>
                        <?php if ($is_logged_in): ?>
                            <a href="user/" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Dashboard</a>
                            <a href="auth/logout.php" class="text-red-400 hover:text-red-300">Logout</a>
                        <?php else: ?>
                            <a href="auth/login.php" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Login</a>
                        <?php endif; ?>
                    </nav>
                </div>
            </div>
        </header>

        <div class="max-w-7xl mx-auto px-6 py-8 space-y-8">
            
            <?php if ($message): ?>
            <div class="<?= $messageType === 'success' ? 'bg-green-600' : 'bg-red-600' ?> text-white px-6 py-4 rounded-lg">
                <?= htmlspecialchars($message) ?>
            </div>
            <?php endif; ?>

            <!-- Hero Section -->
            <section class="text-center py-12">
                <div class="flex justify-center mb-6">
                    <div class="w-20 h-20 gold-gradient rounded-full flex items-center justify-center">
                        <span class="text-3xl">🥇</span>
                    </div>
                </div>
                <h1 class="text-4xl md:text-5xl font-bold mb-4">
                    <span class="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Crypto to Precious Metals</span>
                </h1>
                <p class="text-xl text-slate-300 max-w-3xl mx-auto">
                    Exchange your cryptocurrency for physical gold, silver, platinum, and palladium. 
                    Securely stored in our vault with flexible investment options.
                </p>
            </section>

            <!-- Live Prices -->
            <section class="metals-card rounded-2xl p-6">
                <h2 class="text-2xl font-bold mb-6">Current Precious Metals Prices</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <?php foreach ($metal_prices as $metal): ?>
                    <div class="text-center p-4 bg-slate-800 rounded-lg">
                        <div class="text-2xl mb-2"><?= formatMetal($metal['metal_type']) ?></div>
                        <div class="text-xl font-bold mb-1">$<?= number_format($metal['current_price_usd'], 2) ?></div>
                        <div class="text-sm text-slate-400">+<?= $metal['premium_percentage'] ?>% premium</div>
                        <div class="text-xs text-slate-500 mt-1">Per troy ounce</div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </section>

            <?php if ($is_logged_in): ?>
            
            <!-- User Portfolio -->
            <?php if (!empty($portfolio_data)): ?>
            <section class="metals-card rounded-2xl p-6">
                <h2 class="text-2xl font-bold mb-6">Your Metals Portfolio</h2>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <?php foreach ($portfolio_data as $item): ?>
                    <div class="bg-slate-800 rounded-lg p-4">
                        <div class="flex items-center justify-between mb-3">
                            <h3 class="text-lg font-semibold"><?= formatMetal($item['metal_type']) ?></h3>
                            <span class="text-<?= $item['gain_loss_usd'] >= 0 ? 'green' : 'red' ?>-400 text-sm">
                                <?= $item['gain_loss_usd'] >= 0 ? '+' : '' ?>$<?= number_format($item['gain_loss_usd'], 2) ?>
                            </span>
                        </div>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div class="text-slate-400">Quantity</div>
                                <div class="font-semibold"><?= number_format($item['total_quantity'], 4) ?> oz</div>
                            </div>
                            <div>
                                <div class="text-slate-400">Current Value</div>
                                <div class="font-semibold">$<?= number_format($item['current_value_usd'], 2) ?></div>
                            </div>
                            <div>
                                <div class="text-slate-400">Available</div>
                                <div><?= number_format($item['instant_storage_qty'], 4) ?> oz</div>
                            </div>
                            <div>
                                <div class="text-slate-400">Fixed Investment</div>
                                <div><?= number_format($item['fixed_investment_qty'], 4) ?> oz</div>
                            </div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </section>
            <?php endif; ?>

            <!-- Exchange Form -->
            <section class="metals-card rounded-2xl p-6">
                <h2 class="text-2xl font-bold mb-6">Exchange Crypto for Metals</h2>
                <form method="POST" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <input type="hidden" name="action" value="exchange_metals">
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">Cryptocurrency</label>
                        <select name="crypto_currency" class="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white" required>
                            <option value="BTC">Bitcoin (BTC)</option>
                            <option value="ETH">Ethereum (ETH)</option>
                            <option value="USDT">Tether (USDT)</option>
                            <option value="USDC">USD Coin (USDC)</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">Amount</label>
                        <input type="number" name="crypto_amount" step="0.00000001" class="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white" placeholder="0.00" required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">Metal Type</label>
                        <select name="metal_type" class="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white" required>
                            <option value="GOLD">🥇 Gold</option>
                            <option value="SILVER">🥈 Silver</option>
                            <option value="PLATINUM">⚪ Platinum</option>
                            <option value="PALLADIUM">⚫ Palladium</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">Investment Type</label>
                        <select name="investment_type" class="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white" required>
                            <option value="instant">Instant Storage (0.5% fee)</option>
                            <option value="fixed">1-Year Fixed (8% APY)</option>
                        </select>
                    </div>
                    
                    <div class="flex items-end">
                        <button type="submit" class="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-medium py-2 px-4 rounded-lg transition-all">
                            Exchange Now
                        </button>
                    </div>
                </form>
            </section>

            <!-- Shipping Request -->
            <?php if (!empty($portfolio_data)): ?>
            <section class="metals-card rounded-2xl p-6">
                <h2 class="text-2xl font-bold mb-6">Request Physical Delivery</h2>
                <form method="POST" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="hidden" name="action" value="request_shipping">
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">Metal Type</label>
                        <select name="metal_type" class="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white" required>
                            <?php foreach ($portfolio_data as $item): ?>
                                <?php if ($item['instant_storage_qty'] > 0): ?>
                                <option value="<?= $item['metal_type'] ?>">
                                    <?= formatMetal($item['metal_type']) ?> (<?= number_format($item['instant_storage_qty'], 4) ?> oz available)
                                </option>
                                <?php endif; ?>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">Quantity (troy oz)</label>
                        <input type="number" name="quantity" step="0.0001" class="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white" placeholder="0.0000" required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">Recipient Name</label>
                        <input type="text" name="recipient_name" class="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white" required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">Shipping Address</label>
                        <textarea name="shipping_address" rows="3" class="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white" required></textarea>
                    </div>
                    
                    <div class="md:col-span-2">
                        <button type="submit" class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-all">
                            Request Shipping
                        </button>
                        <p class="text-sm text-slate-400 mt-2">Base shipping fee: $50. Additional fees may apply for large orders.</p>
                    </div>
                </form>
            </section>
            <?php endif; ?>

            <!-- Recent Orders -->
            <?php if (!empty($recent_orders)): ?>
            <section class="metals-card rounded-2xl p-6">
                <h2 class="text-2xl font-bold mb-6">Recent Orders</h2>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="border-b border-slate-700">
                            <tr>
                                <th class="text-left py-2">Order Ref</th>
                                <th class="text-left py-2">Metal</th>
                                <th class="text-left py-2">Quantity</th>
                                <th class="text-left py-2">Value</th>
                                <th class="text-left py-2">Type</th>
                                <th class="text-left py-2">Status</th>
                                <th class="text-left py-2">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($recent_orders as $order): ?>
                            <tr class="border-b border-slate-800">
                                <td class="py-2 font-medium"><?= htmlspecialchars($order['order_ref']) ?></td>
                                <td class="py-2"><?= formatMetal($order['metal_type']) ?></td>
                                <td class="py-2"><?= number_format($order['metal_quantity'], 4) ?> oz</td>
                                <td class="py-2">$<?= number_format($order['total_usd_value'], 2) ?></td>
                                <td class="py-2"><?= $order['investment_type'] === 'FIXED_1_YEAR' ? 'Fixed 1Y' : 'Instant' ?></td>
                                <td class="py-2">
                                    <span class="px-2 py-1 rounded text-xs bg-<?= $order['status'] === 'STORED' ? 'green' : ($order['status'] === 'PENDING' ? 'yellow' : 'blue') ?>-600">
                                        <?= $order['status'] ?>
                                    </span>
                                </td>
                                <td class="py-2"><?= date('M j, Y', strtotime($order['created_at'])) ?></td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </section>
            <?php endif; ?>

            <?php else: ?>
            
            <!-- Login Required -->
            <section class="metals-card rounded-2xl p-8 text-center">
                <h2 class="text-2xl font-bold mb-4">Login Required</h2>
                <p class="text-slate-300 mb-6">Please log in to exchange cryptocurrency for precious metals and manage your portfolio.</p>
                <a href="auth/login.php" class="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                    Login to Continue
                </a>
            </section>
            
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
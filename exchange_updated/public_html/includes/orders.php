<?php
require_once __DIR__.'/db.php';

function place_order($user_id, $symbol, $side, $type, $quantity, $price = null, $market_price = null) {
    global $pdo;
    
    try {
        if ($quantity <= 0) {
            return ['ok' => false, 'error' => 'Invalid quantity'];
        }
        
        if ($type === 'LIMIT' && (!$price || $price <= 0)) {
            return ['ok' => false, 'error' => 'Price required for limit orders'];
        }
        
        // For market orders, use current market price. If a market price is passed from the
        // caller (via the optional $market_price argument), respect it – otherwise fall
        // back to our simple pricing helper. Should the helper return null or zero we
        // immediately abort rather than inserting an unusable order.
        if ($type === 'MARKET') {
            $price = $market_price ?: get_market_price($symbol);
            if (!$price) {
                return ['ok' => false, 'error' => 'Unable to get market price'];
            }
        }
        
        // Check user balance
        $required_asset = $side === 'BUY' ? 'USDT' : substr($symbol, 0, -4); // Remove USDT suffix
        $required_amount = $side === 'BUY' ? ($quantity * $price) : $quantity;

        if (!check_balance($user_id, $required_asset, $required_amount)) {
            return ['ok' => false, 'error' => 'Insufficient balance'];
        }
        
        $pdo->beginTransaction();
        
        // Insert order
        $stmt = $pdo->prepare('
            INSERT INTO orders (user_id, symbol, side, type, quantity, price, status, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, "NEW", NOW())
        ');
        $stmt->execute([$user_id, $symbol, $side, $type, $quantity, $price]);
        $order_id = $pdo->lastInsertId();
        
        // Determine if the order should be filled immediately. Market orders are
        // always executed right away. Limit orders may also execute instantly
        // depending on the prevailing market price. We make a simple comparison:
        //  - For BUY limit orders: if the limit price is greater than or equal to the
        //    current market price, the user is willing to pay at least the market rate,
        //    so we fill the order.
        //  - For SELL limit orders: if the limit price is less than or equal to the
        //    current market price, the user is willing to sell at or below the market
        //    rate, so we fill the order.
        $filled = false;
        $fillPrice = $price;
        if ($type === 'MARKET') {
            $filled = fill_order($order_id, $price);
        } elseif ($type === 'LIMIT') {
            $currentMarket = get_market_price($symbol);
            if ($currentMarket) {
                if ($side === 'BUY' && $price >= $currentMarket) {
                    // Buyer is willing to pay at least the current price, fill at limit price
                    $filled = fill_order($order_id, $price);
                }
                if ($side === 'SELL' && $price <= $currentMarket) {
                    // Seller is willing to accept this price or less, fill at limit price
                    $filled = fill_order($order_id, $price);
                }
            }
        }
        $pdo->commit();
        return ['ok' => true, 'filled' => $filled, 'price' => $fillPrice];
        
    } catch (Exception $e) {
        $pdo->rollback();
        return ['ok' => false, 'error' => $e->getMessage()];
    }
}

function fill_order($order_id, $fill_price) {
    global $pdo;
    
    $stmt = $pdo->prepare('SELECT * FROM orders WHERE id = ?');
    $stmt->execute([$order_id]);
    $order = $stmt->fetch();
    
    if (!$order) return false;
    
    // Calculate fee (0.1%)
    $fee = $order['quantity'] * $fill_price * 0.001;
    
    // Update order status
    $pdo->prepare('UPDATE orders SET status = "FILLED", fee = ? WHERE id = ?')
        ->execute([$fee, $order_id]);
    
    // Record trade
    $pdo->prepare('
        INSERT INTO trades (user_id, order_id, symbol, side, quantity, price, fee, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    ')->execute([$order['user_id'], $order_id, $order['symbol'], $order['side'], $order['quantity'], $fill_price, $fee]);
    
    // Update user balances
    update_balances_after_trade($order, $fill_price, $fee);
    
    return true;
}

function update_balances_after_trade($order, $price, $fee) {
    global $pdo;
    
    $base_asset = substr($order['symbol'], 0, -4); // e.g., BTC from BTCUSDT
    $quote_asset = 'USDT';
    
    if ($order['side'] === 'BUY') {
        // Decrease USDT balance
        adjust_balance($order['user_id'], $quote_asset, -($order['quantity'] * $price + $fee));
        // Increase base asset balance
        adjust_balance($order['user_id'], $base_asset, $order['quantity']);
    } else {
        // Decrease base asset balance
        adjust_balance($order['user_id'], $base_asset, -$order['quantity']);
        // Increase USDT balance
        adjust_balance($order['user_id'], $quote_asset, ($order['quantity'] * $price) - $fee);
    }
}

function adjust_balance($user_id, $asset, $amount) {
    global $pdo;
    
    $stmt = $pdo->prepare('
        INSERT INTO balances (user_id, asset, free, locked) 
        VALUES (?, ?, ?, 0) 
        ON DUPLICATE KEY UPDATE free = free + ?
    ');
    $stmt->execute([$user_id, $asset, $amount, $amount]);
}

function check_balance($user_id, $asset, $required) {
    global $pdo;
    
    $stmt = $pdo->prepare('SELECT free FROM balances WHERE user_id = ? AND asset = ?');
    $stmt->execute([$user_id, $asset]);
    $balance = $stmt->fetchColumn();
    
    return $balance >= $required;
}

function get_market_price($symbol) {
    // Fallback prices - in production you'd fetch from real API
    $prices = [
        'BTCUSDT' => 45000,
        'ETHUSDT' => 3000,
        'ADAUSDT' => 0.5,
        'DOGEUSDT' => 0.08
    ];
    
    return $prices[$symbol] ?? null;
}
?>
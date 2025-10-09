<?php
function head($title = 'YourCryptoExchange.tech') {
    ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($title) ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%); }
        .line-clamp-3 { 
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
    </style>
</head>
<body class="text-white min-h-screen">
    <nav class="bg-black/50 border-b border-green-500/20 p-4">
        <div class="max-w-6xl mx-auto flex items-center justify-between">
            <a href="/index.php" class="text-xl font-bold text-green-400">YourCryptoExchange.tech</a>
            <div class="space-x-4">
                <a href="/index.php" class="hover:text-green-400">News</a>
                <!-- Link to the dynamic metals exchange instead of a static HTML page -->
                <a href="/metals-exchange.php" class="text-yellow-400 hover:text-yellow-300 font-semibold">🥇 Precious Metals</a>
                <a href="/stake.php" class="hover:text-green-400">Stake</a>
                <a href="/consum-direct.php" class="hover:text-green-400">Consum Direct</a>
                <a href="/valifi.php" class="hover:text-green-400">Valifi Bot</a>
                <?php if (is_logged_in()): ?>
                    <a href="/wallet.php" class="hover:text-green-400">Wallet</a>
                <?php endif; ?>
                <?php if (is_logged_in()): ?>
                    <a href="/public/trade.php" class="hover:text-green-400">Trade</a>
                    <a href="/admin/admin.php" class="hover:text-green-400">Admin</a>
                    <a href="/auth/logout.php" class="hover:text-green-400">Logout</a>
                <?php else: ?>
                    <a href="/auth/login.php" class="hover:text-green-400">Login</a>
                    <a href="/auth/signup.php" class="hover:text-green-400">Sign Up</a>
                <?php endif; ?>
            </div>
        </div>
    </nav>
    <main class="max-w-6xl mx-auto p-6">
    <?php
}
function foot() {
    ?>
    </main>
    <footer class="bg-black/50 border-t border-green-500/20 p-4 mt-10">
        <div class="max-w-6xl mx-auto text-center text-gray-400">
            <p>&copy; <?= date('Y') ?> YourCryptoExchange.tech - Crypto News & Trading</p>
        </div>
    </footer>
</body>
</html>
    <?php
}
?>
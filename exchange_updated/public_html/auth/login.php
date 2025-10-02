<?php
require_once __DIR__.'/../includes/session.php';
require_once __DIR__.'/../includes/db.php';
require_once __DIR__.'/../includes/layout.php';
require_once __DIR__.'/../includes/csrf.php';

$error = '';

if ($_SERVER['REQUEST_METHOD']==='POST') {
  csrf_verify();
  $u = trim($_POST['username'] ?? '');
  $p = $_POST['password'] ?? '';
  
  $st = $pdo->prepare('SELECT * FROM users WHERE username=?');
  $st->execute([$u]);
  $user = $st->fetch();
  
  if($user && password_verify($p, $user['password_hash'])){
    $_SESSION['uid'] = $user['id'];
    $_SESSION['user_id'] = $user['id']; // Added for metals exchange compatibility
    $_SESSION['username'] = $user['username'];
    
    // Check if user is admin
    if ($user['is_admin'] == 1) {
      $_SESSION['admin'] = true;
      $_SESSION['admin_id'] = $user['id'];
    }
    
    header('Location: /index.php'); 
    exit;
  } else { 
    $error = 'Invalid credentials'; 
  }
}

head('Login - YourCryptoExchange.tech');
?>
<div class="max-w-sm mx-auto bg-black/40 border border-green-500/20 rounded-xl p-6">
  <h1 class="text-xl font-semibold mb-4">Sign In</h1>
  
  <?php if($error): ?>
    <div class="text-red-400 mb-3 p-3 bg-red-400/10 border border-red-400/20 rounded"><?= htmlspecialchars($error) ?></div>
  <?php endif; ?>
  
  <form method="post">
    <?php csrf_field(); ?>
    <label class="block text-sm text-gray-300 mb-1">Username</label>
    <input name="username" value="<?= htmlspecialchars($_POST['username'] ?? '') ?>" 
           class="w-full mb-3 px-3 py-2 rounded bg-gray-800 border border-gray-600 focus:border-green-500 focus:outline-none">
    
    <label class="block text-sm text-gray-300 mb-1">Password</label>
    <input name="password" type="password" 
           class="w-full mb-4 px-3 py-2 rounded bg-gray-800 border border-gray-600 focus:border-green-500 focus:outline-none">
    
    <button class="w-full py-2 rounded bg-green-600 hover:bg-green-700">Login</button>
  </form>
  
  <div class="mt-6 text-center text-sm text-gray-400">
    Don't have an account? 
    <a href="/auth/signup.php" class="text-green-400 hover:text-green-300">Sign up</a>
  </div>
</div>
<?php foot(); ?>